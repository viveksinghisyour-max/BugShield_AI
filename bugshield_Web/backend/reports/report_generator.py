import json
import csv
from pathlib import Path
from config import settings

def _get_report_path(scan_id: int, ext: str) -> Path:
    filename = f"scan_{scan_id}_report.{ext}"
    settings.reports_dir.mkdir(parents=True, exist_ok=True)
    return settings.reports_dir / filename

def generate_json(scan: dict, vulns: list[dict]) -> Path:
    path = _get_report_path(scan["id"], "json")
    data = {
        "scan": scan,
        "vulnerabilities": vulns
    }
    with open(path, "w", encoding="utf-8") as f:
        json.dump(data, f, indent=2)
    return path

def generate_csv(scan: dict, vulns: list[dict]) -> Path:
    path = _get_report_path(scan["id"], "csv")
    with open(path, "w", encoding="utf-8", newline="") as f:
        writer = csv.writer(f)
        if not vulns:
            writer.writerow(["No vulnerabilities found."])
            return path
        
        headers = list(vulns[0].keys())
        writer.writerow(headers)
        for v in vulns:
            writer.writerow([v.get(h, "") for h in headers])
    return path

def generate_pdf(scan: dict, vulns: list[dict]) -> Path:
    try:
        from reportlab.lib.pagesizes import letter
        from reportlab.platypus import SimpleDocTemplate, Paragraph, Spacer, Table, TableStyle
        from reportlab.lib.styles import getSampleStyleSheet
        from reportlab.lib import colors
    except ImportError:
        # Fallback to creating an empty text file with a .pdf extension if reportlab is not installed
        path = _get_report_path(scan["id"], "pdf")
        with open(path, "w") as f:
            f.write("ReportLab not installed. Cannot generate PDF.")
        return path

    path = _get_report_path(scan["id"], "pdf")
    doc = SimpleDocTemplate(str(path), pagesize=letter)
    styles = getSampleStyleSheet()
    elements = []

    title = Paragraph(f"Security Scan Report - Project: {scan.get('project_name', 'Unknown')}", styles['Title'])
    elements.append(title)
    elements.append(Spacer(1, 12))

    summary = Paragraph(
        f"Scan ID: {scan['id']}<br/>"
        f"Score: {scan.get('security_score', 'N/A')}<br/>"
        f"Status: {scan.get('status', 'N/A')}<br/>"
        f"Scan Date: {scan.get('scan_date', 'N/A')}", 
        styles['Normal']
    )
    elements.append(summary)
    elements.append(Spacer(1, 12))

    if not vulns:
        elements.append(Paragraph("No vulnerabilities found.", styles['Normal']))
    else:
        # Define table structure
        data = [["Issue", "Severity", "File", "Line"]]
        for v in vulns:
            data.append([
                str(v.get('issue', ''))[:30], 
                str(v.get('severity', '')), 
                str(v.get('file', ''))[:30],
                str(v.get('line', ''))
            ])
        
        t = Table(data)
        t.setStyle(TableStyle([
            ('BACKGROUND', (0,0), (-1,0), colors.grey),
            ('TEXTCOLOR', (0,0), (-1,0), colors.whitesmoke),
            ('ALIGN', (0,0), (-1,-1), 'LEFT'),
            ('FONTNAME', (0,0), (-1,0), 'Helvetica-Bold'),
            ('BOTTOMPADDING', (0,0), (-1,0), 8),
            ('BACKGROUND', (0,1), (-1,-1), colors.white),
            ('GRID', (0,0), (-1,-1), 1, colors.black)
        ]))
        elements.append(t)
    
    doc.build(elements)
    return path
