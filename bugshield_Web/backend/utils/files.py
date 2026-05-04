import shutil
import zipfile
from pathlib import Path
from uuid import uuid4

from fastapi import HTTPException, UploadFile
from starlette import status

from config import settings


ALLOWED_EXTENSIONS = {".py", ".js", ".ts", ".java", ".env", ".json", ".txt", ".zip", ".xml", ".yml", ".yaml"}


def validate_filename(filename: str) -> Path:
    name = Path(filename).name
    suffix = Path(name).suffix.lower()
    if suffix not in ALLOWED_EXTENSIONS:
        raise HTTPException(status_code=422, detail=f"Unsupported file type: {suffix}")
    return Path(name)


def project_storage_dir(user_id: int, project_name: str) -> Path:
    safe_name = "".join(ch if ch.isalnum() or ch in ("-", "_") else "_" for ch in project_name).strip("_")
    return settings.upload_dir / str(user_id) / f"{safe_name}_{uuid4().hex[:10]}"


async def save_upload(upload: UploadFile, destination_dir: Path) -> Path:
    filename = validate_filename(upload.filename or "upload.bin")
    destination_dir.mkdir(parents=True, exist_ok=True)
    target = destination_dir / filename.name
    max_bytes = settings.max_upload_mb * 1024 * 1024
    written = 0
    with target.open("wb") as out:
        while chunk := await upload.read(1024 * 1024):
            written += len(chunk)
            if written > max_bytes:
                raise HTTPException(status_code=413, detail="Upload exceeds size limit")
            out.write(chunk)
    return target


def extract_zip_secure(zip_path: Path, destination_dir: Path) -> Path:
    extract_dir = destination_dir / "extracted"
    extract_dir.mkdir(parents=True, exist_ok=True)
    with zipfile.ZipFile(zip_path) as archive:
        for member in archive.infolist():
            member_path = extract_dir / member.filename
            resolved = member_path.resolve()
            if not str(resolved).startswith(str(extract_dir.resolve())):
                raise HTTPException(status_code=422, detail="Unsafe ZIP path detected")
            if member.is_dir():
                resolved.mkdir(parents=True, exist_ok=True)
                continue
            if Path(member.filename).suffix.lower() not in ALLOWED_EXTENSIONS - {".zip"}:
                continue
            resolved.parent.mkdir(parents=True, exist_ok=True)
            with archive.open(member) as source, resolved.open("wb") as target:
                shutil.copyfileobj(source, target)
    return extract_dir


def remove_project_dir(path: str) -> None:
    target = Path(path).resolve()
    root = settings.upload_dir.resolve()
    if not str(target).startswith(str(root)):
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Invalid project path")
    if target.exists():
        shutil.rmtree(target)
