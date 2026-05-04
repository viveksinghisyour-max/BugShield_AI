from pathlib import Path

from fastapi import APIRouter, Depends, File, Form, HTTPException, UploadFile

from database import get_db, row_to_dict, rows_to_dicts, utc_now
from utils.files import extract_zip_secure, project_storage_dir, remove_project_dir, save_upload
from utils.security import current_user, require_permission


router = APIRouter(tags=["projects"])


@router.post("/upload")
async def upload_project(
    project_name: str = Form(...),
    file: UploadFile | None = File(default=None),
    repo_url: str | None = Form(default=None),
    user=Depends(require_permission("upload_project")),
):
    if not file and not repo_url:
        raise HTTPException(status_code=422, detail="Upload a file or provide a repository URL")
    storage_dir = project_storage_dir(user["id"], project_name)
    source_path = storage_dir
    if file:
        saved = await save_upload(file, storage_dir)
        source_path = extract_zip_secure(saved, storage_dir) if saved.suffix.lower() == ".zip" else storage_dir
    if repo_url:
        (storage_dir / "REPOSITORY_URL.txt").parent.mkdir(parents=True, exist_ok=True)
        (storage_dir / "REPOSITORY_URL.txt").write_text(repo_url.strip(), encoding="utf-8")
    with get_db() as db:
        cursor = db.execute(
            "INSERT INTO projects (user_id, project_name, storage_path, upload_date, status) VALUES (?, ?, ?, ?, ?)",
            (user["id"], project_name.strip(), str(source_path), utc_now(), "uploaded"),
        )
        project_id = cursor.lastrowid
    return {"id": project_id, "project_name": project_name, "status": "uploaded"}


@router.get("/projects")
def list_projects(user=Depends(current_user)):
    query = """
        SELECT p.*, COALESCE(s.security_score, 0) AS security_score
        FROM projects p
        LEFT JOIN scans s ON s.id = (
            SELECT id FROM scans WHERE project_id = p.id ORDER BY scan_date DESC LIMIT 1
        )
    """
    params: tuple = ()
    if user["role"] != "admin":
        query += " WHERE p.user_id = ?"
        params = (user["id"],)
    query += " ORDER BY p.upload_date DESC"
    with get_db() as db:
        return rows_to_dicts(db.execute(query, params).fetchall())


@router.delete("/projects/{project_id}")
def delete_project(project_id: int, user=Depends(current_user)):
    with get_db() as db:
        project = row_to_dict(db.execute("SELECT * FROM projects WHERE id = ?", (project_id,)).fetchone())
        if not project:
            raise HTTPException(status_code=404, detail="Project not found")
        if user["role"] != "admin" and project["user_id"] != user["id"]:
            raise HTTPException(status_code=403, detail="Permission denied")
        remove_project_dir(project["storage_path"])
        db.execute("DELETE FROM vulnerabilities WHERE scan_id IN (SELECT id FROM scans WHERE project_id = ?)", (project_id,))
        db.execute("DELETE FROM scans WHERE project_id = ?", (project_id,))
        db.execute("DELETE FROM projects WHERE id = ?", (project_id,))
    return {"deleted": True}
