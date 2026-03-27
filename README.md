# BugShield AI

BugShield AI is a Visual Studio Code extension and local security scanner designed to detect vulnerabilities and secrets in your codebase. It aims to help developers catch security issues early in the development cycle.

## Features

- **VS Code Integration**: Scan your projects effortlessly directly from your editor command palette.
- **Secret Scanning**: Scans common source and configuration files (`.py`, `.js`, `.ts`, `.env`, `.yaml`, `.yml`, `.json`, and `.txt`) to detect accidentally committed secrets, API keys, or sensitive patterns.
- **Dependency Scanning**: Analyzes `requirements.txt` to find potential dependency vulnerabilities.
- **Security Score**: Evaluates the scan results to provide a quantified security score out of 100 based on the findings.

## Installation

### Prerequisites

- [Node.js](https://nodejs.org/) (for the VS Code extension)
- [Python 3.x](https://www.python.org/) (for the local security scanner)
- [Visual Studio Code](https://code.visualstudio.com/)

### Setup

1. Open the repository (`BugShield_AI`) in VS Code.
2. Install extension dependencies:
   ```bash
   cd extension
   npm install
   ```
3. Compile the extension:
   ```bash
   npm run compile
   ```

## Usage

### In Visual Studio Code

1. Open a project workspace, folder, or one of the included `test_project` directories in VS Code.
2. Open the Command Palette (`Ctrl+Shift+P` on Windows/Linux, `Cmd+Shift+P` on macOS).
3. Search for and execute the command: **`BugShield: Scan Project`**.
4. The scanner will run against your current workspace. The results, any found issues, and your overall **Security Score** will be displayed in the VS Code Output panel under the "BugShield" channel.

### Standalone CLI Usage (Scanner)

You can also run the Python scanner independently of the VS Code extension:

```bash
cd scanner
python scanner.py <path-to-your-project>
```

If run without arguments, it defaults to scanning the `test_project2` directory for quick testing.

## Project Structure

- `extension/`: Contains the typescript code for the VS Code extension. It registers the scan commands and manages the output viewing.
- `scanner/`: Contains the local Python-based security scanner logic (`scanner.py`, `secret_scanner.py`, `dependency_scanner.py`).
- `test_project1/` to `test_project5/`: Various mock projects included for testing the extension and deliberately containing mock secrets or issues to be detected.
