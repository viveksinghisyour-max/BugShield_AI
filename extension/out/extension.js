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
    let disposable = vscode.commands.registerCommand('bugshield.scanProject', (uri, selectedUris) => __awaiter(this, void 0, void 0, function* () {
        var _a;
        const output = vscode.window.createOutputChannel("BugShield");
        output.show();
        output.appendLine("🔍 BugShield scanning project...");
        const extensionFolder = context.extensionPath;
        const defaultScannerPath = path.join(extensionFolder, "..", "scanner", "scanner.py");
        let projectPaths = [];
        if (selectedUris && selectedUris.length > 0) {
            projectPaths = selectedUris.map(u => u.fsPath);
        }
        else if (uri) {
            projectPaths = [uri.fsPath];
        }
        else {
            let singlePath = (_a = vscode.workspace.workspaceFolders) === null || _a === void 0 ? void 0 : _a[0].uri.fsPath;
            if (!singlePath || path.basename(singlePath).toLowerCase().includes("extension")) {
                const selected = yield vscode.window.showOpenDialog({
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
            }
            else {
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
        (0, child_process_1.exec)(`${pythonCmd} "${resolvedScannerPath}" ${targetArgs}`, (error, stdout, stderr) => {
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
            }
            catch (parseErr) {
                output.appendLine("❌ Error parsing scanner output:");
                output.appendLine(parseErr.message || String(parseErr));
                vscode.window.showErrorMessage("BugShield scanner output parsing error. See output channel for details.");
                return;
            }
            output.appendLine("✅ Scan complete!");
            output.appendLine(`Security Score: ${score}/100`);
            (0, results_panel_1.showResultsPanel)(results, score, primaryPath);
        });
    }));
    context.subscriptions.push(disposable);
}
function deactivate() { }
//# sourceMappingURL=extension.js.map