from fastapi import APIRouter, Depends

from database import get_db, rows_to_dicts
from utils.security import require_permission


router = APIRouter(tags=["users"])


@router.get("/users")
def list_users(user=Depends(require_permission("manage_users"))):
    with get_db() as db:
        return rows_to_dicts(db.execute("SELECT id, name, email, role, created_at FROM users ORDER BY created_at DESC").fetchall())
