EXPLANATIONS = {
    "SQL Injection": {
        "explanation": "User-controlled input appears to be joined directly into a SQL query, allowing attackers to change database commands.",
        "recommendation": "Use parameterized queries or an ORM query builder and validate input before it reaches the database.",
        "secure_example": "cursor.execute('SELECT * FROM users WHERE id = ?', (user_id,))",
    },
    "Command Injection": {
        "explanation": "User input appears to be passed into an operating-system command, which can allow attackers to run arbitrary commands.",
        "recommendation": "Avoid shell execution with user input. Use safe APIs, argument arrays, and strict allowlists.",
        "secure_example": "subprocess.run(['ls', safe_directory], check=True, shell=False)",
    },
    "Cross-Site Scripting": {
        "explanation": "Untrusted input appears to be returned to the browser without escaping, which can execute malicious JavaScript.",
        "recommendation": "Escape output, sanitize HTML, and use framework-safe rendering APIs.",
        "secure_example": "res.render('search', { query: escapeHtml(req.query.q) })",
    },
    "Weak Cryptography": {
        "explanation": "The code uses a weak hashing or encryption algorithm that is no longer safe for security-sensitive data.",
        "recommendation": "Use modern algorithms such as bcrypt/Argon2 for passwords and SHA-256/HMAC for integrity checks.",
        "secure_example": "hashlib.sha256(data).hexdigest()",
    },
    "Path Traversal": {
        "explanation": "A file path appears to be built from user input, which may allow attackers to access files outside the intended folder.",
        "recommendation": "Normalize paths, restrict access to a safe base directory, and reject '..' path segments.",
        "secure_example": "safe_path = base_dir / Path(filename).name",
    },
    "Insecure File Upload": {
        "explanation": "Uploaded files appear to be stored using user-controlled names without validation.",
        "recommendation": "Validate file type and size, randomize stored filenames, and keep uploads outside executable directories.",
        "secure_example": "secure_name = f'{uuid4().hex}{Path(file.name).suffix}'",
    },
}


def explain(finding: dict) -> dict:
    issue = finding.get("issue", "")
    if issue in EXPLANATIONS:
        return EXPLANATIONS[issue]
    if "Secret" in issue or "Key" in issue or "Token" in issue or "Password" in issue:
        return {
            "explanation": "Sensitive credentials appear to be hardcoded in source code or configuration files.",
            "recommendation": "Move secrets to a secure vault or environment variables and rotate any exposed credentials.",
            "secure_example": "DATABASE_URL = os.environ['DATABASE_URL']",
        }
    if "Vulnerable package" in issue:
        return {
            "explanation": "The dependency version is associated with known vulnerabilities from public advisory data.",
            "recommendation": "Upgrade to a patched version and rerun tests to confirm compatibility.",
            "secure_example": "pip install --upgrade package-name",
        }
    return {
        "explanation": "BugShield detected a potentially risky pattern that should be reviewed by a developer.",
        "recommendation": "Review the code path, validate inputs, and apply secure coding practices.",
        "secure_example": "Validate, sanitize, and use safe framework APIs.",
    }
