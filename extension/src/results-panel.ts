import * as vscode from 'vscode';

export function showResultsPanel(results: any[], securityScore: number, workspaceFolder: string) {
    const panel = vscode.window.createWebviewPanel(
        'bugshieldResults',
        'BugShield Results',
        vscode.ViewColumn.Two,
        { enableScripts: true }
    );

    panel.webview.html = getWebviewContent(JSON.stringify(results), securityScore);

    // Webview se message receive karo
    panel.webview.onDidReceiveMessage((message) => {
        if (message.command === 'openFile') {
            const fileUri = vscode.Uri.file(message.file);
            vscode.window.showTextDocument(fileUri, {
                selection: new vscode.Range(
                    new vscode.Position(message.line - 1, 0),
                    new vscode.Position(message.line - 1, 0)
                ),
                viewColumn: vscode.ViewColumn.One
            });
        }
    });
}

function getWebviewContent(results: string, securityScore: number): string {
    let data = [];
    try {
        data = JSON.parse(results);
    } catch {
        data = [];
    }

    const rows = data.map((item: any) => {
        const color = item.severity === 'HIGH' ? '#ff4444'
                    : item.severity === 'MEDIUM' ? '#ff9900'
                    : '#ffcc00';

        return `
        <tr onclick="openFile('${item.file.replace(/\\/g, '\\\\')}', ${item.line})" 
            title="Click to open file">
            <td>${item.file.split('\\').pop()}</td>
            <td>${item.line}</td>
            <td>${item.issue}</td>
            <td><span style="
                background:${color};
                color:white;
                padding:2px 10px;
                border-radius:12px;
                font-weight:bold;
                font-size:12px;">
                ${item.severity}
            </span></td>
        </tr>`;
    }).join('');

    const scoreColor = securityScore >= 80 ? '#00cc66'
                     : securityScore >= 50 ? '#ff9900'
                     : '#ff4444';

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
        <table>
            <tr>
                <th>File</th>
                <th>Line</th>
                <th>Issue</th>
                <th>Severity</th>
            </tr>
            ${rows}
        </table>

        <script>
            const vscode = acquireVsCodeApi();
            function openFile(file, line) {
                vscode.postMessage({ command: 'openFile', file: file, line: line });
            }
        </script>
    </body>
    </html>`;
}