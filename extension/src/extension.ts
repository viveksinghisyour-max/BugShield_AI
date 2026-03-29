import * as vscode from 'vscode';
import { exec } from 'child_process';
import * as path from 'path';
import { showResultsPanel } from './results-panel';

export function activate(context: vscode.ExtensionContext) {

    let disposable = vscode.commands.registerCommand('bugshield.scanProject', () => {

        const output = vscode.window.createOutputChannel("BugShield");
        output.show();
        output.appendLine("🔍 BugShield scanning project...");

        const workspaceFolder = vscode.workspace.workspaceFolders?.[0].uri.fsPath;

        if (!workspaceFolder) {
            vscode.window.showErrorMessage("No workspace folder open.");
            return;
        }

        const scannerPath = path.join(workspaceFolder, "..", "scanner", "scanner.py");

        exec(`"C:\\Python314\\python.exe" "${scannerPath}" "${workspaceFolder}"`, (error: Error | null, stdout: string, stderr: string) => {

            if (error) {
                output.appendLine("❌ Scanner error:");
                output.appendLine(stderr);
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
            showResultsPanel(results, score, workspaceFolder);
        });
    });

    context.subscriptions.push(disposable);
}

export function deactivate() {}