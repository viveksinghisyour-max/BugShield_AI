import * as vscode from 'vscode';
import { exec } from 'child_process';
import * as path from 'path';

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

            output.appendLine("Scan Results:");
            output.appendLine(stdout);

        });

    });

    context.subscriptions.push(disposable);
}

export function deactivate() {}