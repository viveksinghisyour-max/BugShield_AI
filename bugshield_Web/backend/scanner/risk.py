SEVERITY_SCORE = {
    "CRITICAL": 10,
    "HIGH": 8,
    "MEDIUM": 5,
    "LOW": 2,
}


def normalize_severity(severity: str) -> str:
    value = severity.upper()
    return value if value in SEVERITY_SCORE else "LOW"


def risk_score(severity: str) -> int:
    return SEVERITY_SCORE[normalize_severity(severity)]


def security_score(findings: list[dict]) -> int:
    counts = {"CRITICAL": 0, "HIGH": 0, "MEDIUM": 0}
    for finding in findings:
        severity = normalize_severity(finding.get("severity", "LOW"))
        if severity in counts:
            counts[severity] += 1
    score = 100 - (counts["CRITICAL"] * 10) - (counts["HIGH"] * 5) - (counts["MEDIUM"] * 2)
    return max(0, min(100, score))


def summarize_findings(findings: list[dict]) -> dict:
    summary = {
        "total": len(findings),
        "by_severity": {"CRITICAL": 0, "HIGH": 0, "MEDIUM": 0, "LOW": 0},
        "by_type": {},
    }
    for finding in findings:
        severity = normalize_severity(finding.get("severity", "LOW"))
        issue = finding.get("issue", "Unknown")
        summary["by_severity"][severity] += 1
        summary["by_type"][issue] = summary["by_type"].get(issue, 0) + 1
    return summary
