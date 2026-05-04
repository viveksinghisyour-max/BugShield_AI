from collections.abc import Callable
from pathlib import Path

from scanner import dependency_scanner, owasp_scanner, secret_scanner
from scanner.ai_explainer import explain
from scanner.risk import security_score, summarize_findings


SUPPORTED_SOURCE_EXTENSIONS = {".py", ".js", ".ts", ".java", ".env", ".json", ".txt", ".yml", ".yaml", ".xml"}
DEPENDENCY_FILES = {"requirements.txt", "package.json", "pom.xml"}


def scan_project(project_path: str | Path, progress_callback: Callable[[dict], None] | None = None) -> dict:
    root = Path(project_path)
    files = [path for path in root.rglob("*") if path.is_file() and _is_supported(path)]
    findings: list[dict] = []
    total = max(len(files), 1)

    for index, path in enumerate(files, start=1):
        if progress_callback:
            progress_callback({
                "status": "running",
                "current_file": str(path.relative_to(root)),
                "progress": int((index - 1) / total * 100),
            })
        if path.name in DEPENDENCY_FILES:
            findings.extend(dependency_scanner.scan_dependencies(path, root))
        if path.suffix.lower() in SUPPORTED_SOURCE_EXTENSIONS:
            findings.extend(secret_scanner.scan_file(path, root))
            findings.extend(owasp_scanner.scan_file(path, root))

    for finding in findings:
        finding.update(explain(finding))

    score = security_score(findings)
    summary = summarize_findings(findings)
    if progress_callback:
        progress_callback({"status": "completed", "current_file": "", "progress": 100})
    return {"findings": findings, "security_score": score, "summary": summary}


def _is_supported(path: Path) -> bool:
    return path.name in DEPENDENCY_FILES or path.suffix.lower() in SUPPORTED_SOURCE_EXTENSIONS
