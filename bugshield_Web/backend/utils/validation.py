from email_validator import EmailNotValidError, validate_email
from fastapi import HTTPException, status


ALLOWED_ROLES = {"admin", "developer", "viewer"}


def clean_email(email: str) -> str:
    try:
        return validate_email(email, check_deliverability=False).normalized.lower()
    except EmailNotValidError as exc:
        raise HTTPException(status_code=status.HTTP_422_UNPROCESSABLE_ENTITY, detail="Invalid email address") from exc


def validate_password(password: str) -> None:
    if len(password) < 8:
        raise HTTPException(status_code=422, detail="Password must be at least 8 characters")


def validate_role(role: str) -> str:
    normalized = role.lower().strip()
    if normalized not in ALLOWED_ROLES:
        raise HTTPException(status_code=422, detail="Invalid role")
    return normalized
