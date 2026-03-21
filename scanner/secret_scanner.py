import re
from entropy_detector import shannon_entropy

SECRET_PATTERNS = {

    "Hardcoded Password": r'password\s*=\s*["\'].*["\']',
    "API Key": r'api[_-]?key\s*=\s*["\'].*["\']',
    "Access Token": r'token\s*=\s*["\'].*["\']',
    "Private Key": r'-----BEGIN PRIVATE KEY-----',

    "AWS Access Key": r'AKIA[0-9A-Z]{16}',
    "Google API Key": r'AIza[0-9A-Za-z-_]{35}',
    "Slack Token": r'xox[baprs]-[0-9a-zA-Z]{10,48}',
    "GitHub Token": r'ghp_[A-Za-z0-9]{36}',
    "Stripe Key": r'sk_(?:test|live|fake)_[0-9a-zA-Z]{24}',
    "Heroku API Key": r'[hH]eroku[a-zA-Z0-9]{32}',
    "JWT Token": r'eyJ[A-Za-z0-9_-]+\.[A-Za-z0-9_-]+\.[A-Za-z0-9_-]+'
}

ENTROPY_THRESHOLD = 4.5


def scan_file(file_path):

    issues = []

    try:
        with open(file_path, "r", encoding="utf-8", errors="ignore") as f:
            lines = f.readlines()

        for line_number, line in enumerate(lines, start=1):

            # Pattern detection
            for issue, pattern in SECRET_PATTERNS.items():

                if re.search(pattern, line):

                    issues.append({
                        "file": file_path,
                        "line": line_number,
                        "issue": issue,
                        "severity": "HIGH"
                    })

            # Entropy detection
            tokens = re.findall(r"[A-Za-z0-9+/=]{20,}", line)

            for token in tokens:

                if shannon_entropy(token) > ENTROPY_THRESHOLD:

                    issues.append({
                        "file": file_path,
                        "line": line_number,
                        "issue": "High Entropy Secret",
                        "severity": "MEDIUM"
                    })

    except Exception:
        pass

    return issues