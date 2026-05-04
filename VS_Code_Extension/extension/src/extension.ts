import * as vscode from 'vscode';
import { exec } from 'child_process';
import * as path from 'path';
import { showResultsPanel } from './results-panel';

export function activate(context: vscode.ExtensionContext) {

    let disposable = vscode.commands.registerCommand('bugshield.scanProject', async (uri?: vscode.Uri, selectedUris?: vscode.Uri[]) => {

        const output = vscode.window.createOutputChannel("BugShield");
        output.show();
        output.appendLine("🔍 BugShield scanning project...");

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
                    vscode.window.showErrorMessage("No project folders selected.");
                    return;
                }

                projectPaths = selected.map(u => u.fsPath);
            } else {
                projectPaths = [singlePath];
            }
        }

        const primaryPath = projectPaths[0];
        const scannerPath = path.join(path.dirname(primaryPath), "scanner", "scanner.py");
        const resolvedScannerPath = require('fs').existsSync(scannerPath) ? scannerPath : defaultScannerPath;

        if (!require('fs').existsSync(resolvedScannerPath)) {
            vscode.window.showErrorMessage(`Scanner not found at ${resolvedScannerPath}.`);
            return;
        }

        const pythonCmd = process.platform === 'win32' ? 'py -3' : 'python3';
        const targetArgs = projectPaths.map(p => `"${p}"`).join(" ");

        exec(`${pythonCmd} "${resolvedScannerPath}" ${targetArgs}`, (error: Error | null, stdout: string, stderr: string) => {

            if (error) {
                output.appendLine("❌ Scanner error:");
                output.appendLine(stderr || error.message);
                vscode.window.showErrorMessage("BugShield scanning failed. See output channel for details.");
                return;
            }

            let results = [];
            let score = 100;

            try {
                const jsonMatch = stdout.match(/\[[\s\S]*\]/);
                const scoreMatch = stdout.match(/Security Score:\s*(\d+)/);

                results = jsonMatch ? JSON.parse(jsonMatch[0]) : [];
                score = scoreMatch ? parseInt(scoreMatch[1]) : 100;
            } catch (parseErr) {
                output.appendLine("❌ Error parsing scanner output:");
                output.appendLine((parseErr as Error).message || String(parseErr));
                vscode.window.showErrorMessage("BugShield scanner output parsing error. See output channel for details.");
                return;
            }

            output.appendLine("✅ Scan complete!");
            output.appendLine(`Security Score: ${score}/100`);

            showResultsPanel(results, score, primaryPath);
        });
    });

    context.subscriptions.push(disposable);
}

export function deactivate() {}