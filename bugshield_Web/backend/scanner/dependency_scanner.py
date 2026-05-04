import json
import re
import xml.etree.ElementTree as ET
from pathlib import Path

import requests

from scanner.risk import risk_score


OSV_API = "https://api.osv.dev/v1/query"
ECOSYSTEMS = {
    "requirements.txt": "PyPI",
    "package.json": "npm",
    "pom.xml": "Maven",
}


def scan_dependencies(path: Path, root: Path) -> list[dict]:
    if path.name == "requirements.txt":
        return _scan_packages(path, root, _parse_requirements(path), "PyPI")
    if path.name == "package.json":
        return _scan_packages(path, root, _parse_package_json(path), "npm")
    if path.name == "pom.xml":
        return _scan_packages(path, root, _parse_pom(path), "Maven")
    return []


def _scan_packages(path: Path, root: Path, packages: list[tuple[str, str, int]], ecosystem: str) -> list[dict]:
    findings: list[dict] = []
    for name, version, line in packages:
        vulns = _query_osv(name, version, ecosystem)
        if not vulns:
            continue
        severity = _highest_severity(vulns)
        cves = sorted({vuln.get("id", "OSV advisory") for vuln in vulns})
        findings.append({
            "file": str(path.relative_to(root)),
            "line": line,
            "issue": f"Vulnerable package: {name} {version}",
            "severity": severity,
            "risk_score": risk_score(severity),
            "category": "Dependency",
            "cve": ", ".join(cves[:12]),
        })
    return findings


def _query_osv(name: str, version: str, ecosystem: str) -> list[dict]:
    payload = {"package": {"name": name, "ecosystem": ecosystem}, "version": version}
    try:
        response = requests.post(OSV_API, json=payload, timeout=5)
        response.raise_for_status()
        return response.json().get("vulns", [])
    except requests.RequestException:
        return []


def _severity_from_vuln(vuln: dict) -> str:
    severities = vuln.get("severity") or []
    text = " ".join(item.get("score", "") for item in severities).upper()
    if "CRITICAL" in text or "9." in text:
        return "CRITICAL"
    if "HIGH" in text or "8." in text or "7." in text:
        return "HIGH"
    if "MEDIUM" in text or "6." in text or "5." in text or "4." in text:
        return "MEDIUM"
    return "HIGH"


def _highest_severity(vulns: list[dict]) -> str:
    order = {"LOW": 1, "MEDIUM": 2, "HIGH": 3, "CRITICAL": 4}
    highest = "LOW"
    for vuln in vulns:
        severity = _severity_from_vuln(vuln)
        if order[severity] > order[highest]:
            highest = severity
    return highest


def _parse_requirements(path: Path) -> list[tuple[str, str, int]]:
    packages = []
    for idx, line in enumerate(path.read_text(errors="ignore").splitlines(), start=1):
        match = re.match(r"^\s*([A-Za-z0-9_.-]+)==([^\s#]+)", line)
        if match:
            packages.append((match.group(1), match.group(2), idx))
    return packages


def _parse_package_json(path: Path) -> list[tuple[str, str, int]]:
    packages = []
    try:
        data = json.loads(path.read_text(errors="ignore"))
    except json.JSONDecodeError:
        return packages
    raw = path.read_text(errors="ignore").splitlines()
    deps = {**data.get("dependencies", {}), **data.get("devDependencies", {})}
    for name, version in deps.items():
        clean_version = str(version).lstrip("^~>=< ")
        line = next((i for i, value in enumerate(raw, start=1) if f'"{name}"' in value), 1)
        packages.append((name, clean_version, line))
    return packages


def _parse_pom(path: Path) -> list[tuple[str, str, int]]:
    packages = []
    try:
        root = ET.fromstring(path.read_text(errors="ignore"))
    except ET.ParseError:
        return packages
    ns = {"m": root.tag.split("}")[0].strip("{")} if "}" in root.tag else {}
    dep_path = ".//m:dependency" if ns else ".//dependency"
    for dep in root.findall(dep_path, ns):
        group = dep.findtext("m:groupId", default="", namespaces=ns) if ns else dep.findtext("groupId", default="")
        artifact = dep.findtext("m:artifactId", default="", namespaces=ns) if ns else dep.findtext("artifactId", default="")
        version = dep.findtext("m:version", default="", namespaces=ns) if ns else dep.findtext("version", default="")
        if group and artifact and version:
            packages.append((f"{group}:{artifact}", version, 1))
    return packages
