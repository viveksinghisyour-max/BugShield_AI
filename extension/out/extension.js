"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.activate = activate;
exports.deactivate = deactivate;
const vscode = require("vscode");
const child_process_1 = require("child_process");
const path = require("path");
const results_panel_1 = require("./results-panel");
function activate(context) {
    let disposable = vscode.commands.registerCommand('bugshield.scanProject', () => {
        var _a;
        const output = vscode.window.createOutputChannel("BugShield");
        output.show();
        output.appendLine("🔍 BugShield scanning project...");
        const workspaceFolder = (_a = vscode.workspace.workspaceFolders) === null || _a === void 0 ? void 0 : _a[0].uri.fsPath;
        if (!workspaceFolder) {
            vscode.window.showErrorMessage("No workspace folder open.");
            return;
        }
        const scannerPath = path.join(workspaceFolder, "..", "scanner", "scanner.py");
        (0, child_process_1.exec)(`"C:\\Python314\\python.exe" "${scannerPath}" "${workspaceFolder}"`, (error, stdout, stderr) => {
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
            (0, results_panel_1.showResultsPanel)(results, score, workspaceFolder);
        });
    });
    context.subscriptions.push(disposable);
}
function deactivate() { }
//# sourceMappingURL=extension.js.map