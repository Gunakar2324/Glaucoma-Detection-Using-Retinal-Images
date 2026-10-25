# backend/pdf_generator.py
import io
import base64
from pathlib import Path
from datetime import datetime
from PIL import Image

from reportlab.lib.pagesizes import letter
from reportlab.lib import colors
from reportlab.platypus import SimpleDocTemplate, Paragraph, Spacer, Table, TableStyle, Image as RLImage, KeepTogether
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
from reportlab.lib.utils import ImageReader

def generate_pdf_report(data: dict) -> bytes:
    """
    Generates a high-quality clinical diagnostic screening PDF report
    with embedded retinal fundus photography, VCDR metrics, and physician findings.
    """
    buffer = io.BytesIO()
    doc = SimpleDocTemplate(
        buffer,
        pagesize=letter,
        rightMargin=36,
        leftMargin=36,
        topMargin=36,
        bottomMargin=36
    )

    styles = getSampleStyleSheet()
    
    # Custom styles
    title_style = ParagraphStyle(
        'ClinicTitle',
        parent=styles['Normal'],
        fontName='Helvetica-Bold',
        fontSize=18,
        leading=22,
        textColor=colors.HexColor('#1e3a8a')
    )
    
    subtitle_style = ParagraphStyle(
        'ClinicSubtitle',
        parent=styles['Normal'],
        fontName='Helvetica',
        fontSize=9,
        leading=12,
        textColor=colors.HexColor('#64748b')
    )

    badge_style = ParagraphStyle(
        'ReportBadge',
        parent=styles['Normal'],
        fontName='Helvetica-Bold',
        fontSize=10,
        alignment=2, # Right align
        textColor=colors.HexColor('#2563eb')
    )

    date_style = ParagraphStyle(
        'ReportDate',
        parent=styles['Normal'],
        fontName='Helvetica',
        fontSize=8,
        alignment=2,
        textColor=colors.HexColor('#64748b')
    )

    section_heading = ParagraphStyle(
        'SecHeading',
        parent=styles['Normal'],
        fontName='Helvetica-Bold',
        fontSize=11,
        leading=14,
        textColor=colors.HexColor('#0f172a')
    )

    body_style = ParagraphStyle(
        'ReportBody',
        parent=styles['Normal'],
        fontName='Helvetica',
        fontSize=9,
        leading=13,
        textColor=colors.HexColor('#1e293b')
    )

    bullet_style = ParagraphStyle(
        'ReportBullet',
        parent=styles['Normal'],
        fontName='Helvetica',
        fontSize=9,
        leading=14,
        textColor=colors.HexColor('#334155'),
        leftIndent=12
    )

    disclaimer_style = ParagraphStyle(
        'Disclaimer',
        parent=styles['Normal'],
        fontName='Helvetica',
        fontSize=7.5,
        leading=10,
        textColor=colors.HexColor('#64748b')
    )

    story = []

    # 1. Header Banner
    now_str = datetime.now().strftime("%B %d, %Y at %I:%M %p")
    header_data = [
        [
            Paragraph("<b>GLAUCOMA AI VISION INSTITUTE</b><br/><font color='#64748b' size='8'>Department of Ophthalmic Imaging & Deep Learning Diagnostics</font>", title_style),
            Paragraph(f"<b>CLINICAL REPORT</b><br/><font color='#64748b' size='8'>Report Date: {now_str}</font>", badge_style)
        ]
    ]
    header_table = Table(header_data, colWidths=[360, 180])
    header_table.setStyle(TableStyle([
        ('VALIGN', (0, 0), (-1, -1), 'TOP'),
        ('BOTTOMPADDING', (0, 0), (-1, -1), 8),
        ('LINEBELOW', (0, 0), (-1, -1), 1.5, colors.HexColor('#2563eb')),
    ]))
    story.append(header_table)
    story.append(Spacer(1, 14))

    # 2. Patient Info Table
    patient_id = data.get("patient_id", "P001")
    patient_name = data.get("patient_name", "John Doe")
    age = data.get("age", 58)
    gender = data.get("gender", "Male")
    eye = data.get("eye", "OD (Right Eye)")
    doctor = "Dr. Raj Kumar, MD"
    engine_name = "Multi-Fold U-Net (FP16 ONNX)"

    patient_grid = [
        [
            Paragraph(f"<b>Patient ID:</b> {patient_id}", body_style),
            Paragraph(f"<b>Patient Name:</b> {patient_name}", body_style),
            Paragraph(f"<b>Eye Examined:</b> {eye}", body_style)
        ],
        [
            Paragraph(f"<b>Age / Gender:</b> {age} yrs / {gender}", body_style),
            Paragraph(f"<b>Examiner:</b> {doctor}", body_style),
            Paragraph(f"<b>Model Engine:</b> {engine_name}", body_style)
        ]
    ]
    patient_table = Table(patient_grid, colWidths=[180, 180, 180])
    patient_table.setStyle(TableStyle([
        ('BACKGROUND', (0, 0), (-1, -1), colors.HexColor('#f8fafc')),
        ('BOX', (0, 0), (-1, -1), 1, colors.HexColor('#e2e8f0')),
        ('INNERGRID', (0, 0), (-1, -1), 0.5, colors.HexColor('#edf2f7')),
        ('TOPPADDING', (0, 0), (-1, -1), 7),
        ('BOTTOMPADDING', (0, 0), (-1, -1), 7),
        ('LEFTPADDING', (0, 0), (-1, -1), 10),
        ('RIGHTPADDING', (0, 0), (-1, -1), 10),
    ]))
    story.append(patient_table)
    story.append(Spacer(1, 16))

    # 3. Main Split: Image on Left, Diagnosis & Metrics on Right
    # Prepare Image
    pil_img = None
    images_dict = data.get("images", {})
    img_b64 = images_dict.get("overlay") or images_dict.get("original")
    
    if img_b64 and "," in img_b64:
        raw_b64 = img_b64.split(",")[1]
        try:
            img_bytes = base64.b64decode(raw_b64)
            pil_img = Image.open(io.BytesIO(img_bytes)).convert("RGB")
        except Exception as e:
            print("Error decoding image b64:", e)

    # Fallback to local sample image if needed
    if pil_img is None:
        sample_path = Path(__file__).resolve().parent / "sample_images" / "glaucoma_advanced.jpg"
        if sample_path.exists():
            pil_img = Image.open(sample_path).convert("RGB")

    # Resize image for report
    img_buf = io.BytesIO()
    if pil_img:
        pil_img.save(img_buf, format="JPEG", quality=90)
        img_buf.seek(0)
        rl_image = RLImage(img_buf, width=220, height=220)
    else:
        rl_image = Paragraph("[Retinal Fundus Image]", body_style)

    left_cell = [
        rl_image,
        Spacer(1, 6),
        Paragraph("<font size='7' color='#64748b'><b>Figure 1:</b> Retinal fundus image with optic disc & cup segmentation</font>", body_style)
    ]

    # Diagnosis Alert Banner
    is_glaucoma = "glaucoma" in data.get("prediction_class", "").lower()
    status_text = data.get("prediction_class", "Glaucoma")
    if is_glaucoma:
        diag_bg = colors.HexColor('#fef2f2')
        diag_border = colors.HexColor('#fecaca')
        diag_title_color = '#dc2626'
        diag_icon = "[!]"
        diag_subtitle = data.get("subtitle", "The model predicts a high likelihood of glaucoma.")
    else:
        diag_bg = colors.HexColor('#f0fdf4')
        diag_border = colors.HexColor('#bbf7d0')
        diag_title_color = '#16a34a'
        diag_icon = "[OK]"
        diag_subtitle = data.get("subtitle", "The optic disc and cup parameters appear within normal healthy limits.")

    diag_box_data = [
        [
            Paragraph(f"<font color='{diag_title_color}' size='12'><b>{diag_icon} {status_text} Detected</b></font><br/><font color='#475569' size='8'>{diag_subtitle}</font>", body_style)
        ]
    ]
    diag_box = Table(diag_box_data, colWidths=[290])
    diag_box.setStyle(TableStyle([
        ('BACKGROUND', (0, 0), (-1, -1), diag_bg),
        ('BOX', (0, 0), (-1, -1), 1, diag_border),
        ('TOPPADDING', (0, 0), (-1, -1), 8),
        ('BOTTOMPADDING', (0, 0), (-1, -1), 8),
        ('LEFTPADDING', (0, 0), (-1, -1), 10),
        ('RIGHTPADDING', (0, 0), (-1, -1), 10),
    ]))

    # Metrics Table
    vcdr_val = data.get("vcdr_formatted", str(data.get("cdr", "0.78")))
    conf_val = data.get("confidence_formatted", f"{data.get('confidence', 92.4)}%")
    risk_val = data.get("risk_level", "High")

    metrics_rows = [
        [Paragraph("Vertical Cup-to-Disc Ratio (VCDR):", body_style), Paragraph(f"<b><font color='#2563eb'>{vcdr_val}</font></b>", body_style)],
        [Paragraph("Confidence Score:", body_style), Paragraph(f"<b>{conf_val}</b>", body_style)],
        [Paragraph("Calculated Risk Level:", body_style), Paragraph(f"<b><font color='{diag_title_color}'>{risk_val}</font></b>", body_style)],
        [Paragraph("Diagnostic Threshold:", body_style), Paragraph("<font size='7.5' color='#64748b'>Normal &lt; 0.60 | Glaucoma &ge; 0.70</font>", body_style)]
    ]
    metrics_table = Table(metrics_rows, colWidths=[180, 110])
    metrics_table.setStyle(TableStyle([
        ('LINEBELOW', (0, 0), (-1, -1), 0.5, colors.HexColor('#e2e8f0')),
        ('TOPPADDING', (0, 0), (-1, -1), 4),
        ('BOTTOMPADDING', (0, 0), (-1, -1), 4),
    ]))

    # Key Findings
    findings_paras = [Paragraph("<b>KEY CLINICAL FINDINGS:</b>", section_heading), Spacer(1, 4)]
    findings_list = data.get("key_findings", [
        "Enlarged optic cup to disc ratio",
        "Thinning of neuroretinal rim in superior/inferior quadrants",
        "Possible optic nerve head cupping and nerve fiber damage",
        "Features consistent with glaucoma"
    ])
    for f in findings_list:
        findings_paras.append(Paragraph(f"&bull; {f}", bullet_style))

    right_cell = [
        diag_box,
        Spacer(1, 10),
        metrics_table,
        Spacer(1, 10),
        *findings_paras
    ]

    split_table = Table([[left_cell, right_cell]], colWidths=[240, 300])
    split_table.setStyle(TableStyle([
        ('VALIGN', (0, 0), (-1, -1), 'TOP'),
        ('LEFTPADDING', (0, 0), (-1, -1), 4),
        ('RIGHTPADDING', (0, 0), (-1, -1), 4),
    ]))
    story.append(split_table)
    story.append(Spacer(1, 20))

    # 4. Signature & Disclaimer Footer
    footer_data = [
        [
            Paragraph("<b>Disclaimer:</b> This diagnostic screening report is automatically generated using deep learning convolutional neural network (U-Net) segmentation. It is designed as an assistive diagnostic support system and must be corroborated with clinical tonometry, pachymetry, and perimetry by a certified ophthalmologist.", disclaimer_style),
            Paragraph("<br/><br/>_______________________________<br/><b>Dr. Raj Kumar, MD</b><br/><font size='7' color='#64748b'>Lead Consultant Ophthalmologist</font>", body_style)
        ]
    ]
    footer_table = Table(footer_data, colWidths=[340, 200])
    footer_table.setStyle(TableStyle([
        ('VALIGN', (0, 0), (-1, -1), 'BOTTOM'),
        ('LINEABOVE', (0, 0), (-1, -1), 0.5, colors.HexColor('#cbd5e1')),
        ('TOPPADDING', (0, 0), (-1, -1), 12),
        ('ALIGN', (1, 0), (1, 0), 'CENTER'),
    ]))
    story.append(footer_table)

    doc.build(story)
    buffer.seek(0)
    return buffer.getvalue()
