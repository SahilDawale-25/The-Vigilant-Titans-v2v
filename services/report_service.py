from reportlab.lib.pagesizes import A4
from reportlab.lib.units import cm
from reportlab.lib import colors
from reportlab.platypus import SimpleDocTemplate, Paragraph, Spacer, Table, TableStyle
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
from datetime import date, timedelta
import os


def generate_monthly_report(user_name, cycle_logs, mood_logs, stress_logs, burnout_score, ai_summary):
    """
    Generates a PDF report and saves it to backend/generated_reports/
    Returns the file path.
    """
    os.makedirs("generated_reports", exist_ok=True)
    filename = f"generated_reports/monthly_report_{user_name.replace(' ', '_')}_{date.today()}.pdf"

    doc = SimpleDocTemplate(filename, pagesize=A4, topMargin=2*cm, bottomMargin=2*cm)
    styles = getSampleStyleSheet()
    elements = []

    title_style = ParagraphStyle(
        "TitleStyle", parent=styles["Title"], textColor=colors.HexColor("#7C3AED")
    )
    heading_style = ParagraphStyle(
        "HeadingStyle", parent=styles["Heading2"], textColor=colors.HexColor("#7C3AED"), spaceBefore=12
    )

    # Title
    elements.append(Paragraph("HerWellness — Monthly Health Report", title_style))
    elements.append(Paragraph(f"Prepared for: {user_name}", styles["Normal"]))
    elements.append(Paragraph(f"Report Date: {date.today()}", styles["Normal"]))
    elements.append(Spacer(1, 20))

    # Wellness Overview
    elements.append(Paragraph("Wellness Overview", heading_style))
    elements.append(Paragraph(f"Burnout Risk Score: {burnout_score}/100", styles["Normal"]))
    elements.append(Spacer(1, 10))

    # Cycle Summary Table
    elements.append(Paragraph("Cycle Log Summary", heading_style))
    if cycle_logs:
        table_data = [["Start Date", "Flow", "Symptoms"]]
        for log in cycle_logs:
            table_data.append([str(log.start_date), log.flow_intensity or "-", log.symptoms or "-"])
        table = Table(table_data, colWidths=[5*cm, 4*cm, 7*cm])
        table.setStyle(TableStyle([
            ("BACKGROUND", (0, 0), (-1, 0), colors.HexColor("#7C3AED")),
            ("TEXTCOLOR", (0, 0), (-1, 0), colors.white),
            ("GRID", (0, 0), (-1, -1), 0.5, colors.grey),
            ("FONTSIZE", (0, 0), (-1, -1), 9),
        ]))
        elements.append(table)
    else:
        elements.append(Paragraph("No cycle logs recorded this period.", styles["Normal"]))
    elements.append(Spacer(1, 10))

    # Mood Summary
    elements.append(Paragraph("Mood Trend Summary", heading_style))
    if mood_logs:
        avg_mood = sum(m.mood_score for m in mood_logs) / len(mood_logs)
        elements.append(Paragraph(f"Average mood score this period: {avg_mood:.1f}/10", styles["Normal"]))
    else:
        elements.append(Paragraph("No mood logs recorded this period.", styles["Normal"]))
    elements.append(Spacer(1, 10))

    # AI Insights
    elements.append(Paragraph("AI-Generated Insights", heading_style))
    elements.append(Paragraph(ai_summary, styles["Normal"]))
    elements.append(Spacer(1, 15))

    # Disclaimer
    disclaimer_style = ParagraphStyle(
        "Disclaimer", parent=styles["Normal"], textColor=colors.grey, fontSize=8
    )
    elements.append(Paragraph(
        "Disclaimer: This report is generated for general wellness awareness only and does not "
        "constitute medical advice or diagnosis. Please consult a qualified healthcare professional "
        "for any medical concerns.",
        disclaimer_style
    ))

    doc.build(elements)
    return filename