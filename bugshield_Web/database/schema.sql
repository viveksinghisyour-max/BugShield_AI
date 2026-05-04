CREATE TABLE users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    email TEXT NOT NULL UNIQUE,
    password TEXT NOT NULL,
    role TEXT NOT NULL CHECK(role IN ('admin', 'developer', 'viewer')),
    created_at TEXT NOT NULL
);

CREATE TABLE projects (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER NOT NULL,
    project_name TEXT NOT NULL,
    storage_path TEXT NOT NULL,
    upload_date TEXT NOT NULL,
    status TEXT NOT NULL,
    FOREIGN KEY(user_id) REFERENCES users(id)
);

CREATE TABLE scans (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    project_id INTEGER NOT NULL,
    scan_date TEXT NOT NULL,
    security_score INTEGER NOT NULL,
    status TEXT NOT NULL,
    summary_json TEXT NOT NULL DEFAULT '{}',
    FOREIGN KEY(project_id) REFERENCES projects(id)
);

CREATE TABLE vulnerabilities (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    scan_id INTEGER NOT NULL,
    file TEXT NOT NULL,
    line INTEGER NOT NULL,
    issue TEXT NOT NULL,
    severity TEXT NOT NULL,
    risk_score INTEGER NOT NULL,
    status TEXT NOT NULL DEFAULT 'open',
    explanation TEXT,
    recommendation TEXT,
    secure_example TEXT,
    category TEXT,
    cve TEXT,
    FOREIGN KEY(scan_id) REFERENCES scans(id)
);

CREATE TABLE reports (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    scan_id INTEGER NOT NULL,
    report_type TEXT NOT NULL,
    path TEXT NOT NULL,
    created_at TEXT NOT NULL,
    FOREIGN KEY(scan_id) REFERENCES scans(id)
);
