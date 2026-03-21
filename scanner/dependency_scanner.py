import json
import requests

OSV_API = "https://api.osv.dev/v1/query"

def check_package_vulnerability(package, version):

    payload = {
        "package": {
            "name": package,
            "ecosystem": "PyPI"
        },
        "version": version
    }

    try:

        response = requests.post(OSV_API, json=payload)

        data = response.json()

        if "vulns" in data:

            vulnerabilities = []

            cves = [vuln.get("id") for vuln in data["vulns"] if vuln.get("id")]

            if cves:
                vulnerabilities.append({
                    "package": package,
                    "version": version,
                    "cve": ", ".join(cves),
                    "severity": "HIGH",
                    "score": 9
                })

            return vulnerabilities

    except:

        pass

    return []

def scan_requirements(file_path):

    results = []

    try:

        with open(file_path) as f:

            lines = f.readlines()

        for line in lines:

            if "==" in line:

                package, version = line.strip().split("==")

                vulnerabilities = check_package_vulnerability(
                    package,
                    version
                )

                results.extend(vulnerabilities)

    except:

        pass

    return results
