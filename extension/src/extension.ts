import * as vscode from 'vscode';
import { exec } from 'child_process';
import * as path from 'path';
import { showResultsPanel } from './results-panel';

export function activate(context: vscode.ExtensionContext) {

    let disposable = vscode.commands.registerCommand('bugshield.scanProject', async (uri?: vscode.Uri, selectedUris?: vscode.Uri[]) => {

        const output = vscode.window.createOutputChannel("BugShield");
        output.show();
        output.appendLine("🔍 BugShield scanning project(s)...");

        const extensionFolder = context.extensionPath;
        const defaultScannerPath = path.join(extensionFolder, "..", "scanner", "scanner.py");

        let projectPaths: string[] = [];

        if (selectedUris && selectedUris.length > 0) {
            projectPaths = selectedUris.map(u => u.fsPath);
        } else if (uri) {
            projectPaths = [uri.fsPath];
        } else {
            let singlePath = vscode.workspace.workspaceFolders?.[0].uri.fsPath;
            if (!singlePath || path.basename(singlePath).toLowerCase().includes("extension")) {
                const selected = await vscode.window.showOpenDialog({
                    canSelectFiles: false,
                    canSelectFolders: true,
                    canSelectMany: true,
                    openLabel: "Select folders to scan"
                });

                if (!selected || selected.length === 0) {
                    vscode.window.showErrorMessage("No project folders selected for scanning.");
                    return;
                }

                projectPaths = selected.map(u => u.fsPath);
            } else {
                projectPaths = [singlePath];
            }
        }

        const primaryPath = projectPaths[0];
        const scannerPath = path.join(path.dirname(primaryPath), "scanner", "scanner.py");
        const resolvedScannerPath = (require('fs').existsSync(scannerPath) ? scannerPath : defaultScannerPath);

        if (!require('fs').existsSync(resolvedScannerPath)) {
            vscode.window.showErrorMessage(`Scanner script not found at ${resolvedScannerPath}.`);
            return;
        }

        const pythonCmd = process.env.PYTHON || process.env.PYTHONPATH || "python";
        const targetArgs = projectPaths.map(p => `"${p}"`).join(" ");

        exec(`${pythonCmd} "${resolvedScannerPath}" ${targetArgs}`, (error: Error | null, stdout: string, stderr: string) => {

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