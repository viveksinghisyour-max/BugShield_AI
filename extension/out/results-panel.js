"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.showResultsPanel = showResultsPanel;
const vscode = require("vscode");
function showResultsPanel(results, securityScore, workspaceFolder) {
    const panel = vscode.window.createWebviewPanel('bugshieldResults', 'BugShield Results', vscode.ViewColumn.Two, { enableScripts: true });
    panel.webview.html = getWebviewContent(JSON.stringify(results), securityScore);
    // Webview se message receive karo
    panel.webview.onDidReceiveMessage((message) => {
        if (message.command === 'openFile') {
            const fileUri = vscode.Uri.file(message.file);
            vscode.window.showTextDocument(fileUri, {
                selection: new vscode.Range(new vscode.Position(message.line - 1, 0), new vscode.Position(message.line - 1, 0)),
                viewColumn: vscode.ViewColumn.One
            });
        }
    });
}
function getWebviewContent(results, securityScore) {
    let data = [];
    try {
        data = JSON.parse(results);
    }
    catch (_a) {
        data = [];
    }
    const scoreColor = securityScore >= 80 ? '#00cc66'
        : securityScore >= 50 ? '#ff9900'
            : '#ff4444';
    const safeData = JSON.stringify(data).replace(/</g, '\\u003c');
    return `<!DOCTYPE html>
    <html>
    <head>
        <style>
            body { font-family: Arial, sans-serif; padding: 20px; background: #1e1e1e; color: #ffffff; }
            h1 { color: #ffffff; font-size: 20px; }
            .score { font-size: 36px; font-weight: bold; color: ${scoreColor}; }
            .score-label { font-size: 14px; color: #aaaaaa; margin-bottom: 20px; }
            table { width: 100%; border-collapse: collapse; margin-top: 10px; }
            th { background: #2d2d2d; padding: 10px; text-align: left; font-size: 13px; color: #aaaaaa; }
            td { padding: 10px; border-bottom: 1px solid #333333; font-size: 13px; }
            tr:hover { background: #2a2a2a; cursor: pointer; }
        </style>
    </head>
    <body>
        <h1>🛡️ BugShield Security Report</h1>
        <div class="score">${securityScore}/100</div>
        <div class="score-label">Security Score</div>
        <div style="margin-top:15px; margin-bottom:5px;">
            <span style="font-size:24px; font-weight:bold; color:#ffffff;">${data.length}</span>
            <span style="font-size:14px; color:#aaaaaa; margin-left:8px;">Total Issues Found</span>
        </div>
        <table id="issuesTable">
            <tr>
                <th>File</th>
                <th>Line</th>
                <th>Issue</th>
                <th>Severity</th>
            </tr>
        </table>

        <script>
            const vscode = acquireVsCodeApi();
            const data = JSON.parse('${safeData}');
            const table = document.getElementById('issuesTable');

            function escapeHtml(str) {
                return String(str)
                    .replace(/&/g, '&amp;')
                    .replace(/</g, '&lt;')
                    .replace(/>/g, '&gt;')
                    .replace(/"/g, '&quot;')
                    .replace(/'/g, '&#39;');
            }

            function openFile(file, line) {
                vscode.postMessage({ command: 'openFile', file: file, line: line });
            }

            data.forEach(item => {
                const tr = document.createElement('tr');
                tr.addEventListener('click', () => openFile(item.file, item.line));

                const color = item.severity === 'HIGH' ? '#ff4444'
                             : item.severity === 'MEDIUM' ? '#ff9900'
                             : '#ffcc00';

                const fileName = item.file ? item.file.split('\\').pop() : '';
                const lineText = item.line != null ? String(item.line) : '';
                const issueText = item.issue || '';
                const severityText = item.severity || '';

                const tdFile = document.createElement('td');
                tdFile.textContent = fileName;

                const tdLine = document.createElement('td');
                tdLine.textContent = lineText;

                const tdIssue = document.createElement('td');
                tdIssue.textContent = issueText;

                const tdSeverity = document.createElement('td');
                const badge = document.createElement('span');
                badge.textContent = severityText;
                badge.style.background = color;
                badge.style.color = 'white';
                badge.style.padding = '2px 10px';
                badge.style.borderRadius = '12px';
                badge.style.fontWeight = 'bold';
                badge.style.fontSize = '12px';
                tdSeverity.appendChild(badge);

                tr.appendChild(tdFile);
                tr.appendChild(tdLine);
                tr.appendChild(tdIssue);
                tr.appendChild(tdSeverity);

                table.appendChild(tr);
            });
        </script>
    </body>
    </html>`;
}
//# sourceMappingURL=results-panel.js.map