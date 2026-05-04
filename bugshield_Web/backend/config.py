from pathlib import Path
from pydantic import BaseModel
import os


class Settings(BaseModel):
    app_name: str = "BugShield API"
    jwt_secret: str = os.getenv("BUGSHIELD_JWT_SECRET", "change-this-secret-in-production")
    jwt_algorithm: str = "HS256"
    access_token_minutes: int = 60 * 8
    database_path: Path = Path(os.getenv("BUGSHIELD_DB", "database/bugshield.sqlite3"))
    upload_dir: Path = Path(os.getenv("BUGSHIELD_UPLOAD_DIR", "storage/uploads"))
    reports_dir: Path = Path(os.getenv("BUGSHIELD_REPORTS_DIR", "reports"))
    max_upload_mb: int = int(os.getenv("BUGSHIELD_MAX_UPLOAD_MB", "50"))
    frontend_origin: str = os.getenv("BUGSHIELD_FRONTEND_ORIGIN", "http://localhost:5173")


settings = Settings()
