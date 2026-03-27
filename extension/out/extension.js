"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.activate = activate;
exports.deactivate = deactivate;
const vscode = require("vscode");
const child_process_1 = require("child_process");
const path = require("path");
const results_panel_1 = require("./results-panel");
function activate(context) {
    let disposable = vscode.commands.registerCommand('bugshield.scanProject', () => __awaiter(this, void 0, void 0, function* () {
        var _a;
        const output = vscode.window.createOutputChannel("BugShield");
        output.show();
        output.appendLine("🔍 BugShield scanning project...");
        const extensionFolder = context.extensionPath;
        const defaultScannerPath = path.join(extensionFolder, "..", "scanner", "scanner.py");
        let projectPath = (_a = vscode.workspace.workspaceFolders) === null || _a === void 0 ? void 0 : _a[0].uri.fsPath;
        if (!projectPath || path.basename(projectPath).toLowerCase().includes("extension")) {
            const selected = yield vscode.window.showOpenDialog({
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
        (0, child_process_1.exec)(`${pythonCmd} "${resolvedScannerPath}" "${projectPath}"`, (error, stdout, stderr) => {
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
            (0, results_panel_1.showResultsPanel)(results, score);
        });
    }));
    context.subscriptions.push(disposable);
}
function deactivate() { }
//# sourceMappingURL=extension.js.map