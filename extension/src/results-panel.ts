import * as vscode from 'vscode';

export function showResultsPanel(results: any[], securityScore: number) {
    const panel = vscode.window.createWebviewPanel(
        'bugshieldResults',
        'BugShield Results',
        vscode.ViewColumn.Two,
        { enableScripts: true }
    );

    panel.webview.html = getWebviewContent(JSON.stringify(results), securityScore);
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
        <tr>
            <td>${item.file.split(/[\\/]/).pop()}</td>
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
        <table>
            <tr>
                <th>File</th>
                <th>Line</th>
                <th>Issue</th>
                <th>Severity</th>
            </tr>
            ${rows}
        </table>
    </body>
    </html>`;
}