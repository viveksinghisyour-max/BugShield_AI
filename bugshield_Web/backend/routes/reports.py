from fastapi import APIRouter, Depends, HTTPException
from fastapi.responses import FileResponse

from database import get_db, row_to_dict, rows_to_dicts, utc_now
from reports.report_generator import generate_csv, generate_json, generate_pdf
from utils.security import current_user


router = APIRouter(tags=["reports"])


@router.get("/report")
def create_report(scan_id: int, report_type: str = "pdf", user=Depends(current_user)):
    scan = _authorize_and_load(scan_id, user)
    with get_db() as db:
        vulns = rows_to_dicts(db.execute("SELECT * FROM vulnerabilities WHERE scan_id = ?", (scan_id,)).fetchall())
    if report_type == "json":
        path = generate_json(scan, vulns)
    elif report_type == "csv":
        path = generate_csv(scan, vulns)
    elif report_type == "pdf":
        path = generate_pdf(scan, vulns)
    else:
        raise HTTPException(status_code=422, detail="report_type must be pdf, json, or csv")
    with get_db() as db:
        db.execute(
            "INSERT INTO reports (scan_id, report_type, path, created_at) VALUES (?, ?, ?, ?)",
            (scan_id, report_type, str(path), utc_now()),
        )
    return FileResponse(path, filename=path.name)


@router.get("/reports")
def list_reports(user=Depends(current_user)):
    query = """
        SELECT r.*, s.security_score, p.project_name
        FROM reports r
        JOIN scans s ON s.id = r.scan_id
        JOIN projects p ON p.id = s.project_id
    """
    params: tuple = ()
    if user["role"] != "admin":
        query += " WHERE p.user_id = ?"
        params = (user["id"],)
    query += " ORDER BY r.created_at DESC"
    with get_db() as db:
        return rows_to_dicts(db.execute(query, params).fetchall())


def _authorize_and_load(scan_id: int, user: dict) -> dict:
    with get_db() as db:
        scan = row_to_dict(db.execute(
            """
            SELECT s.*, p.project_name, p.user_id
            FROM scans s
            JOIN projects p ON p.id = s.project_id
            WHERE s.id = ?
            """,
            (scan_id,),
        ).fetchone())
    if not scan:
        raise HTTPException(status_code=404, detail="Scan not found")
    if user["role"] != "admin" and scan["user_id"] != user["id"]:
        raise HTTPException(status_code=403, detail="Permission denied")
    return scan
