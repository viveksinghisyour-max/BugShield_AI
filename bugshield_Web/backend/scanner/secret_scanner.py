import re
from pathlib import Path

from scanner.entropy import shannon_entropy
from scanner.risk import risk_score


SECRET_PATTERNS = {
    "Hardcoded Password": r"(?i)\b(password|passwd|pwd)\b\s*[:=]\s*['\"][^'\"]{4,}['\"]",
    "API Key": r"(?i)\b(api[_-]?key|client_secret)\b\s*[:=]\s*['\"][^'\"]{8,}['\"]",
    "Access Token": r"(?i)\b(token|access_token|auth_token)\b\s*[:=]\s*['\"][^'\"]{8,}['\"]",
    "Private Key": r"-----BEGIN (RSA |EC |OPENSSH )?PRIVATE KEY-----",
    "AWS Access Key": r"\bAKIA[0-9A-Z]{16}\b",
    "AWS Secret Key": r"(?i)aws_secret_access_key\s*[:=]\s*['\"][^'\"]{20,}['\"]",
    "Google API Key": r"\bAIza[0-9A-Za-z\-_]{35}\b",
    "GitHub Token": r"\b(ghp|github_pat)_[A-Za-z0-9_]{20,}\b",
    "JWT Token": r"\beyJ[A-Za-z0-9_-]+\.[A-Za-z0-9_-]+\.[A-Za-z0-9_-]+\b",
    "Database Credentials": r"(?i)\b(database_url|db_password|db_user)\b\s*[:=]\s*['\"][^'\"]{4,}['\"]",
    "Slack Token": r"xox[pboaq]-[0-9]{10,13}-[0-9]{10,13}-[0-9]{10,13}-[a-zA-Z0-9]{24,34}",
    "Stripe Key": r"sk_(live|test)_[0-9a-zA-Z]{24}",
    "Twilio API Key": r"SK[0-9a-fA-F]{32}",
    "SendGrid API Key": r"SG\.[0-9a-zA-Z_-]{22}\.[0-9a-zA-Z_-]{43}",
    "Mailchimp API Key": r"[0-9a-f]{32}-us[0-9]{1,2}",
    "Google OAuth": r"[0-9]+-[0-9A-Za-z_]{32}\.apps\.googleusercontent\.com",
    "Hardcoded IP Address": r"\b(?:[0-9]{1,3}\.){3}[0-9]{1,3}\b",
    "Email Address (PII)": r"\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,7}\b",
    "Phone Number (PII)": r"\b\+?1?\s*\(?-*\.*[0-9]{3}\)?\s*-*\.*[0-9]{3}\s*-*\.*[0-9]{4}\b",
    "SSN (PII)": r"\b[0-9]{3}-[0-9]{2}-[0-9]{4}\b",
}

FALSE_POSITIVES = {"example", "sample", "dummy", "changeme", "password123", "your_api_key", "127.0.0.1", "0.0.0.0", "test@test", "john.doe"}
TOKEN_PATTERN = re.compile(r"[A-Za-z0-9+/=_\-]{24,}")


def scan_file(path: Path, root: Path) -> list[dict]:
    findings: list[dict] = []
    try:
        lines = path.read_text(encoding="utf-8", errors="ignore").splitlines()
    except OSError:
        return findings

    for line_number, line in enumerate(lines, start=1):
        lowered = line.lower()
        if any(marker in lowered for marker in FALSE_POSITIVES):
            continue
        for issue, pattern in SECRET_PATTERNS.items():
            if re.search(pattern, line):
                severity = "CRITICAL" if issue in {"Private Key", "AWS Access Key", "AWS Secret Key"} else "HIGH"
                findings.append(_finding(root, path, line_number, issue, severity, "Secrets"))
        for token in TOKEN_PATTERN.findall(line):
            if shannon_entropy(token) >= 4.5:
                findings.append(_finding(root, path, line_number, "High Entropy Secret", "MEDIUM", "Secrets"))
    return findings


def _finding(root: Path, path: Path, line: int, issue: str, severity: str, category: str) -> dict:
    return {
        "file": str(path.relative_to(root)),
        "line": line,
        "issue": issue,
        "severity": severity,
        "risk_score": risk_score(severity),
        "category": category,
    }
