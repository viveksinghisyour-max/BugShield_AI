from threading import Lock

from fastapi import APIRouter, BackgroundTasks, Depends, HTTPException

from database import get_db, json_dump, row_to_dict, rows_to_dicts, utc_now
from scanner.engine import scan_project
from utils.security import current_user, require_permission


router = APIRouter(tags=["scans"])
scan_progress: dict[int, dict] = {}
progress_lock = Lock()


@router.post("/scan")
def start_scan(payload: dict, background_tasks: BackgroundTasks, user=Depends(require_permission("run_scan"))):
    project_id = int(payload.get("project_id", 0))
    with get_db() as db:
        project = row_to_dict(db.execute("SELECT * FROM projects WHERE id = ?", (project_id,)).fetchone())
        if not project:
            raise HTTPException(status_code=404, detail="Project not found")
        if user["role"] != "admin" and project["user_id"] != user["id"]:
            raise HTTPException(status_code=403, detail="Permission denied")
        cursor = db.execute(
            "INSERT INTO scans (project_id, scan_date, security_score, status, summary_json) VALUES (?, ?, ?, ?, ?)",
            (project_id, utc_now(), 0, "queued", "{}"),
        )
        scan_id = cursor.lastrowid
        db.execute("UPDATE projects SET status = ? WHERE id = ?", ("scanning", project_id))
    _set_progress(scan_id, {"status": "queued", "progress": 0, "current_file": ""})
    background_tasks.add_task(_run_scan, scan_id, project)
    return {"scan_id": scan_id, "status": "queued"}


@router.get("/scan/{scan_id}/progress")
def get_progress(scan_id: int, user=Depends(current_user)):
    _authorize_scan(scan_id, user)
    with progress_lock:
        return scan_progress.get(scan_id, {"status": "unknown", "progress": 0, "current_file": ""})


@router.get("/scan/{scan_id}")
def get_scan(scan_id: int, user=Depends(current_user)):
    _authorize_scan(scan_id, user)
    with get_db() as db:
        scan = row_to_dict(db.execute("SELECT * FROM scans WHERE id = ?", (scan_id,)).fetchone())
        vulns = rows_to_dicts(db.execute("SELECT * FROM vulnerabilities WHERE scan_id = ? ORDER BY risk_score DESC", (scan_id,)).fetchall())
    return {"scan": scan, "vulnerabilities": vulns}


@router.get("/scan-history")
def scan_history(user=Depends(current_user)):
    query = """
        SELECT s.*, p.project_name
        FROM scans s
        JOIN projects p ON p.id = s.project_id
    """
    params: tuple = ()
    if user["role"] != "admin":
        query += " WHERE p.user_id = ?"
        params = (user["id"],)
    query += " ORDER BY s.scan_date DESC"
    with get_db() as db:
        return rows_to_dicts(db.execute(query, params).fetchall())


@router.get("/dashboard")
def dashboard(user=Depends(current_user)):
    owner_filter = "" if user["role"] == "admin" else " WHERE p.user_id = ?"
    params = () if user["role"] == "admin" else (user["id"],)
    with get_db() as db:
        total_projects = db.execute(f"SELECT COUNT(*) AS c FROM projects p{owner_filter}", params).fetchone()["c"]
        total_scans = db.execute(
            f"SELECT COUNT(*) AS c FROM scans s JOIN projects p ON p.id = s.project_id{owner_filter}", params
        ).fetchone()["c"]
        vulns = rows_to_dicts(db.execute(
            f"SELECT v.* FROM vulnerabilities v JOIN scans s ON s.id = v.scan_id JOIN projects p ON p.id = s.project_id{owner_filter}",
            params,
        ).fetchall())
        trend = rows_to_dicts(db.execute(
            f"SELECT s.scan_date, s.security_score FROM scans s JOIN projects p ON p.id = s.project_id{owner_filter} ORDER BY s.scan_date ASC LIMIT 20",
            params,
        ).fetchall())
    severity = {"CRITICAL": 0, "HIGH": 0, "MEDIUM": 0, "LOW": 0}
    types = {}
    for vuln in vulns:
        severity[vuln["severity"]] = severity.get(vuln["severity"], 0) + 1
        types[vuln["issue"]] = types.get(vuln["issue"], 0) + 1
    latest_score = trend[-1]["security_score"] if trend else 100
    return {
        "cards": {
            "total_projects": total_projects,
            "total_scans": total_scans,
            "total_vulnerabilities": len(vulns),
            "critical_issues": severity.get("CRITICAL", 0),
            "security_score": latest_score,
        },
        "severity_distribution": severity,
        "vulnerability_types": types,
        "security_trend": trend,
    }


def _run_scan(scan_id: int, project: dict) -> None:
    def update_progress(progress: dict):
        _set_progress(scan_id, progress)

    try:
        result = scan_project(project["storage_path"], update_progress)
        with get_db() as db:
            db.execute(
                "UPDATE scans SET security_score = ?, status = ?, summary_json = ? WHERE id = ?",
                (result["security_score"], "completed", json_dump(result["summary"]), scan_id),
            )
            db.execute("UPDATE projects SET status = ? WHERE id = ?", ("completed", project["id"]))
            for finding in result["findings"]:
                db.execute(
                    """
                    INSERT INTO vulnerabilities
                    (scan_id, file, line, issue, severity, risk_score, status, explanation, recommendation, secure_example, category, cve)
                    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
                    """,
                    (
                        scan_id,
                        finding["file"],
                        finding["line"],
                        finding["issue"],
                        finding["severity"],
                        finding["risk_score"],
                        "open",
                        finding.get("explanation"),
                        finding.get("recommendation"),
                        finding.get("secure_example"),
                        finding.get("category"),
                        finding.get("cve"),
                    ),
                )
            if any(item["severity"] == "CRITICAL" for item in result["findings"]):
                db.execute(
                    "INSERT INTO notifications (user_id, title, message, level, created_at) VALUES (?, ?, ?, ?, ?)",
                    (project["user_id"], "Critical vulnerabilities found", f"Scan #{scan_id} found critical issues.", "critical", utc_now()),
                )
        _set_progress(scan_id, {"status": "completed", "progress": 100, "current_file": ""})
    except Exception as exc:
        with get_db() as db:
            db.execute("UPDATE scans SET status = ? WHERE id = ?", ("failed", scan_id))
            db.execute("UPDATE projects SET status = ? WHERE id = ?", ("failed", project["id"]))
        _set_progress(scan_id, {"status": "failed", "progress": 100, "current_file": "", "error": str(exc)})


def _set_progress(scan_id: int, progress: dict) -> None:
    with progress_lock:
        scan_progress[scan_id] = progress


def _authorize_scan(scan_id: int, user: dict) -> None:
    with get_db() as db:
        row = db.execute(
            "SELECT p.user_id FROM scans s JOIN projects p ON p.id = s.project_id WHERE s.id = ?",
            (scan_id,),
        ).fetchone()
    if not row:
        raise HTTPException(status_code=404, detail="Scan not found")
    if user["role"] != "admin" and row["user_id"] != user["id"]:
        raise HTTPException(status_code=403, detail="Permission denied")
