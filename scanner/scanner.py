import os
import sys
import json
from secret_scanner import scan_file


def scan_project(project_path):

    results = []

    for root, dirs, files in os.walk(project_path):

        for file in files:

            if file.endswith((".py", ".js", ".ts", ".env", ".yaml", ".yml", ".json", ".txt")):

                file_path = os.path.join(root, file)

                issues = scan_file(file_path)

                results.extend(issues)

    return results


if __name__ == "__main__":

    if len(sys.argv) < 2:
        # Default to test_project for easy testing
        project_path = os.path.abspath(os.path.join(os.path.dirname(__file__), "..", "test_project"))
        if not os.path.exists(project_path):
            print(json.dumps([{"file": "scanner.py", "line": 0, "issue": "Missing project path argument", "severity": "HIGH"}], indent=2))
            sys.exit(1)
    else:
        project_path = sys.argv[1]

    findings = scan_project(project_path)

    print(json.dumps(findings, indent=2))

    total_issues = len(findings)
    score = max(0, 100 - total_issues * 5)
    print(f"\nSecurity Score: {score}/100")