from fastapi import APIRouter, HTTPException
from pydantic import BaseModel

from database import get_db, row_to_dict, utc_now
from utils.security import create_access_token, current_user, hash_password, verify_password
from utils.validation import clean_email, validate_password, validate_role
from fastapi import Depends


router = APIRouter(tags=["auth"])


class RegisterRequest(BaseModel):
    name: str
    email: str
    password: str
    role: str = "developer"


class LoginRequest(BaseModel):
    email: str
    password: str


@router.post("/register")
def register(payload: RegisterRequest):
    email = clean_email(payload.email)
    validate_password(payload.password)
    role = validate_role(payload.role)
    name = payload.name.strip()
    if len(name) < 2:
        raise HTTPException(status_code=422, detail="Name is required")
    with get_db() as db:
        exists = db.execute("SELECT id FROM users WHERE email = ?", (email,)).fetchone()
        if exists:
            raise HTTPException(status_code=409, detail="Email already registered")
        cursor = db.execute(
            "INSERT INTO users (name, email, password, role, created_at) VALUES (?, ?, ?, ?, ?)",
            (name, email, hash_password(payload.password), role, utc_now()),
        )
        user_id = cursor.lastrowid
    token = create_access_token({"sub": str(user_id), "role": role})
    return {"token": token, "user": {"id": user_id, "name": name, "email": email, "role": role}}


@router.post("/login")
def login(payload: LoginRequest):
    email = clean_email(payload.email)
    with get_db() as db:
        user = row_to_dict(db.execute("SELECT * FROM users WHERE email = ?", (email,)).fetchone())
    if not user or not verify_password(payload.password, user["password"]):
        raise HTTPException(status_code=401, detail="Invalid email or password")
    token = create_access_token({"sub": str(user["id"]), "role": user["role"]})
    safe_user = {key: user[key] for key in ("id", "name", "email", "role", "created_at")}
    return {"token": token, "user": safe_user}


@router.get("/me")
def me(user=Depends(current_user)):
    return user
