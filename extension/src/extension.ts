import * as vscode from 'vscode';
import { exec } from 'child_process';
import * as path from 'path';
import { showResultsPanel } from './results-panel';

export function activate(context: vscode.ExtensionContext) {

    let disposable = vscode.commands.registerCommand('bugshield.scanProject', async () => {

        const output = vscode.window.createOutputChannel("BugShield");
        output.show();
        output.appendLine("🔍 BugShield scanning project...");

        const extensionFolder = context.extensionPath;
        const defaultScannerPath = path.join(extensionFolder, "..", "scanner", "scanner.py");

        let projectPath = vscode.workspace.workspaceFolders?.[0].uri.fsPath;

        if (!projectPath || path.basename(projectPath).toLowerCase().includes("extension")) {
            const selected = await vscode.window.showOpenDialog({
                canSelectFiles: false,
                canSelectFolders: true,
                canSelectMany: false,
                openLabel: "Select folder to scan"
            });

            if (!selected || selected.length === 0) {
                vscode.window.showErrorMessage("No project folder selected for scanning.");
                return;
            }

            projectPath = selected[0].fsPath;
        }

        const scannerPath = path.join(path.dirname(projectPath), "scanner", "scanner.py");
        const resolvedScannerPath = (require('fs').existsSync(scannerPath) ? scannerPath : defaultScannerPath);

        if (!require('fs').existsSync(resolvedScannerPath)) {
            vscode.window.showErrorMessage(`Scanner script not found at ${resolvedScannerPath}.`);
            return;
        }

        const pythonCmd = process.env.PYTHON || process.env.PYTHONPATH || "python";

        exec(`${pythonCmd} "${resolvedScannerPath}" "${projectPath}"`, (error: Error | null, stdout: string, stderr: string) => {

            if (error) {
                output.appendLine("❌ Scanner error:");
                output.appendLine(stderr || error.message);
                vscode.window.showErrorMessage(`BugShield scan failed: ${error.message}`);
                return;
            }

            // JSON aur Security Score alag karo
            const jsonMatch = stdout.match(/\[[\s\S]*\]/);
            const scoreMatch = stdout.match(/Security Score:\s*(\d+)/);

            const results = jsonMatch ? JSON.parse(jsonMatch[0]) : [];
            const score = scoreMatch ? parseInt(scoreMatch[1]) : 100;

            output.appendLine("✅ Scan complete!");
            output.appendLine(`Security Score: ${score}/100`);

            // Results panel kholo
            showResultsPanel(results, score);
        });
    });

    context.subscriptions.push(disposable);
}

export function deactivate() {}