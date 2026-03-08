import os
import re
import sys

patterns = [
    r'password\s*=\s*["\'].*["\']',
    r'api[_-]?key\s*=\s*["\'].*["\']',
    r'secret\s*=\s*["\'].*["\']'
]

def scan_file(file_path):
    issues = []

    try:
        with open(file_path, "r", encoding="utf-8", errors="ignore") as f:
            lines = f.readlines()

        for i, line in enumerate(lines):
            for pattern in patterns:
                if re.search(pattern, line, re.IGNORECASE):
                    issues.append({
                        "file": file_path,
                        "line": i + 1,
                        "issue": "Hardcoded secret detected",
                        "severity": "HIGH"
                    })
    except:
        pass

    return issues


def scan_project(folder):
    results = []

    for root, dirs, files in os.walk(folder):
        for file in files:
            if file.endswith(".py") or file.endswith(".js"):
                file_path = os.path.join(root, file)
                results.extend(scan_file(file_path))

    return results


if __name__ == "__main__":

    project_path = sys.argv[1] if len(sys.argv) > 1 else "."

    findings = scan_project(project_path)

    if not findings:
        print("✅ No security issues found.")
    else:
        for f in findings:
            print(f"⚠ {f['issue']}")
            print(f"File: {f['file']}")
            print(f"Line: {f['line']}")
            print(f"Severity: {f['severity']}")
            print("-----")