# BugShield AI

BugShield AI is an AI-powered code security scanner platform for students, developers, small teams, and startups. It provides a Visual Studio Code extension, a local security scanner, and a full-stack web platform with project uploads, dashboard analytics, and downloadable reports.

---

## 1. BugShield Web Platform

A production-style web platform located under `bugshield_Web/`. It includes a FastAPI backend, React/Tailwind frontend, SQLite schema, modular scanner engine, reports, and Docker deployment files.

### Web Platform Features

- JWT authentication with bcrypt password hashing
- Roles: admin, developer, viewer
- ZIP and source-file upload with secure extraction
- Modular scanner engine:
  - secret scanner with regex and entropy detection
  - dependency scanner for `requirements.txt`, `package.json`, and `pom.xml`
  - OWASP-style scanner for SQL injection, command injection, XSS, weak crypto, path traversal, insecure uploads, and debug mode
- AI-style vulnerability explanations, risk descriptions, fix recommendations, and secure code examples
- Security score formula: `100 - Critical*10 - High*5 - Medium*2`
- Scan history, progress tracking, and dashboard with Chart.js charts
- PDF, JSON, and CSV report generation
- Docker-ready deployment

### Local Backend Setup

```bash
cd bugshield_Web/backend
python -m venv .venv
.venv\Scripts\activate
pip install -r requirements.txt
copy .env.example .env
uvicorn app:app --reload
```

Backend runs at `http://localhost:8000`.

### Local Frontend Setup

```bash
cd bugshield_Web/frontend
npm install
copy .env.example .env
npm run dev
```

Frontend runs at `http://localhost:5173`.

### Docker Setup

```bash
cd bugshield_Web
docker compose up --build
```

### Production Notes

- Replace `BUGSHIELD_JWT_SECRET` with a long random secret.
- Use HTTPS in production.
- Store uploads outside web-accessible folders.
- Consider moving scan jobs to a queue such as Celery/RQ for multi-user scale.
- Replace SQLite with PostgreSQL for production SaaS usage.

---

## 2. BugShield VS Code Extension & Local Scanner

The VS Code extension allows you to scan your projects effortlessly directly from your editor command palette.

### VS Code Extension Features

- **VS Code Integration**: Trigger scans via command palette.
- **Secret Scanning**: Scans `.py`, `.js`, `.ts`, `.env`, `.yaml`, `.yml`, `.json`, and `.txt` to detect accidentally committed secrets.
- **Dependency Scanning**: Analyzes `requirements.txt` for vulnerabilities.
- **Security Score**: Displays results and a quantified security score out of 100 in the VS Code Output panel.

### Prerequisites

- [Node.js](https://nodejs.org/) (for the VS Code extension)
- [Python 3.x](https://www.python.org/) (for the local security scanner)
- [Visual Studio Code](https://code.visualstudio.com/)

### Extension Setup

1. Open the repository (`BugShield_AI`) in VS Code.
2. Install extension dependencies:
   ```bash
   cd VS_Code_Extension/extension
   npm install
   ```
3. Compile the extension:
   ```bash
   npm run compile
   ```

### Usage in Visual Studio Code

1. Open a project workspace, folder, or one of the included `test_projects` directories in VS Code.
2. Open the Command Palette (`Ctrl+Shift+P` on Windows/Linux, `Cmd+Shift+P` on macOS).
3. Search for and execute the command: **`BugShield: Scan Project`**.
4. The scanner will run against your current workspace, displaying issues and your Security Score in the Output panel under "BugShield".

### Standalone CLI Usage (Local Scanner)

You can run the Python scanner independently of the VS Code extension:

```bash
cd VS_Code_Extension/scanner
python scanner.py <path-to-your-project>
```

If run without arguments, it defaults to scanning the `test_projects/test_project2` directory for quick testing.

---

## Project Structure Overview

- `bugshield_Web/`: Contains the full-stack web application with a FastAPI backend and React frontend.
- `VS_Code_Extension/extension/`: Contains the TypeScript code for the VS Code extension.
- `VS_Code_Extension/scanner/`: Contains the local Python-based security scanner logic.
- `VS_Code_Extension/test_projects/`: Various mock projects included for testing the extension.
