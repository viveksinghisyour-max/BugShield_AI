import re
from pathlib import Path

from scanner.risk import risk_score


RULES = [
    ("SQL Injection", "CRITICAL", "Injection", re.compile(r"(SELECT|INSERT|UPDATE|DELETE).*(\+|%|f['\"]|\$\{)", re.I)),
    ("Command Injection", "CRITICAL", "Injection", re.compile(r"(exec|eval|system|popen|subprocess\.(run|call|Popen)).*(\+|shell\s*=\s*True|req\.|request\.)", re.I)),
    ("Cross-Site Scripting", "HIGH", "XSS", re.compile(r"(innerHTML|document\.write|res\.send|dangerouslySetInnerHTML|v-html).*(req\.|request\.|query|params)", re.I)),
    ("Weak Cryptography", "HIGH", "Cryptography", re.compile(r"\b(md5|sha1|DES|RC4)\b", re.I)),
    ("Path Traversal", "HIGH", "File Handling", re.compile(r"(open|readFile|sendFile|FileInputStream|mv)\s*\(.*(\+|req\.|request\.|params|query)", re.I)),
    ("Insecure File Upload", "HIGH", "File Handling", re.compile(r"(upload|files|multipart).*(mv|save|write)", re.I)),
    ("Debug Mode Enabled", "MEDIUM", "Configuration", re.compile(r"\b(DEBUG|debug)\s*[:=]\s*True\b|debug\s*:\s*true", re.I)),
    ("Insecure CORS", "MEDIUM", "Configuration", re.compile(r"Access-Control-Allow-Origin['\"]?\s*[:,=]\s*['\"]\*", re.I)),
    ("SSRF", "HIGH", "Networking", re.compile(r"(requests\.(get|post|put|delete)|urllib\.urlopen|fetch|axios)\s*\([^'\"]+\)", re.I)),
    ("XML External Entity (XXE)", "HIGH", "Injection", re.compile(r"(parse|fromstring)\s*\([^'\"]+\)", re.I)),
    ("Insecure Deserialization", "CRITICAL", "Deserialization", re.compile(r"(pickle\.loads|yaml\.load|jsonpickle\.decode|marshal\.loads)", re.I)),
    ("NoSQL Injection", "HIGH", "Injection", re.compile(r"(\.find|\.aggregate|\.update).*\$where", re.I)),
    ("LDAP Injection", "HIGH", "Injection", re.compile(r"(ldap3|ldap|search_s)\s*\(.*\)", re.I)),
    ("Mass Assignment", "MEDIUM", "Business Logic", re.compile(r"(Object\.assign|req\.body|update_attributes)\s*\(.*\)", re.I)),
]


def scan_file(path: Path, root: Path) -> list[dict]:
    findings: list[dict] = []
    try:
        lines = path.read_text(encoding="utf-8", errors="ignore").splitlines()
    except OSError:
        return findings

    for line_number, line in enumerate(lines, start=1):
        for issue, severity, category, pattern in RULES:
            if pattern.search(line):
                findings.append({
                    "file": str(path.relative_to(root)),
                    "line": line_number,
                    "issue": issue,
                    "severity": severity,
                    "risk_score": risk_score(severity),
                    "category": category,
                })
    return findings
