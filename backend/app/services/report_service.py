import os
from datetime import datetime, timezone
from typing import Dict, Any, List
from reportlab.lib.pagesizes import letter
from reportlab.lib import colors
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
from reportlab.platypus import SimpleDocTemplate, Paragraph, Spacer, Table, TableStyle, HRFlowable
from backend.app.core.logging import logger


class ForensicReportService:
    """Generates comprehensive, court/investigation-grade forensic PDF reports."""

    def generate_pdf(
        self,
        output_pdf_path: str,
        media_info: Dict[str, Any],
        job_info: Dict[str, Any],
        fusion_result: Dict[str, Any],
        segments: List[Dict[str, Any]],
        transcription: str
    ) -> str:
        os.makedirs(os.path.dirname(output_pdf_path), exist_ok=True)

        doc = SimpleDocTemplate(
            output_pdf_path,
            pagesize=letter,
            rightMargin=36,
            leftMargin=36,
            topMargin=36,
            bottomMargin=36
        )

        styles = getSampleStyleSheet()

        # Custom styles
        header_title = ParagraphStyle(
            'HeaderTitle',
            parent=styles['Normal'],
            fontName='Helvetica-Bold',
            fontSize=22,
            leading=26,
            textColor=colors.HexColor('#0F172A')
        )
        sub_title = ParagraphStyle(
            'SubTitle',
            parent=styles['Normal'],
            fontName='Helvetica',
            fontSize=11,
            leading=14,
            textColor=colors.HexColor('#64748B')
        )
        section_h = ParagraphStyle(
            'SectionH',
            parent=styles['Heading2'],
            fontName='Helvetica-Bold',
            fontSize=13,
            leading=17,
            textColor=colors.HexColor('#1E293B'),
            spaceBefore=10,
            spaceAfter=6
        )
        body_p = ParagraphStyle(
            'BodyP',
            parent=styles['Normal'],
            fontName='Helvetica',
            fontSize=9,
            leading=13,
            textColor=colors.HexColor('#334155')
        )
        disclaimer_p = ParagraphStyle(
            'DisclaimerP',
            parent=styles['Normal'],
            fontName='Helvetica-Oblique',
            fontSize=8,
            leading=11,
            textColor=colors.HexColor('#64748B')
        )

        story = []

        # 1. Header Banner
        story.append(Paragraph("VERIFAI FORENSIC MEDIA ANALYSIS REPORT", header_title))
        story.append(Paragraph("Automated Multimodal Deepfake & Audio-Visual Integrity Verification", sub_title))
        story.append(Spacer(1, 10))
        story.append(HRFlowable(width="100%", thickness=2, color=colors.HexColor('#6366F1'), spaceBefore=4, spaceAfter=12))

        # 2. Executive Summary & Assessment Banner
        assessment = fusion_result.get("overall_assessment", "INCONCLUSIVE")
        overall_score = fusion_result.get("overall_score", 0.0)

        badge_color = colors.HexColor('#22C55E')
        if assessment == "POTENTIAL MANIPULATION DETECTED":
            badge_color = colors.HexColor('#EF4444')
        elif assessment == "INCONCLUSIVE":
            badge_color = colors.HexColor('#F59E0B')

        exec_data = [
            [
                Paragraph("<b>Overall Assessment:</b>", body_p),
                Paragraph(f"<font color='{badge_color.hexval()}'><b>{assessment}</b></font>", body_p),
                Paragraph("<b>Calculated Risk Score:</b>", body_p),
                Paragraph(f"<b>{overall_score:.3f}</b> / 1.000", body_p)
            ],
            [
                Paragraph("<b>Analysis Job ID:</b>", body_p),
                Paragraph(str(job_info.get("id", "N/A")), body_p),
                Paragraph("<b>Report Generated:</b>", body_p),
                Paragraph(datetime.now(timezone.utc).strftime("%Y-%m-%d %H:%M:%S UTC"), body_p)
            ]
        ]
        t_exec = Table(exec_data, colWidths=[110, 160, 120, 150])
        t_exec.setStyle(TableStyle([
            ('BACKGROUND', (0, 0), (-1, -1), colors.HexColor('#F8FAFC')),
            ('BOX', (0, 0), (-1, -1), 1, colors.HexColor('#E2E8F0')),
            ('VALIGN', (0, 0), (-1, -1), 'MIDDLE'),
            ('PADDING', (0, 0), (-1, -1), 6),
        ]))
        story.append(t_exec)
        story.append(Spacer(1, 12))

        # 3. File & Cryptographic Metadata
        story.append(Paragraph("1. Evidence & Media File Metadata", section_h))
        meta_data = [
            [Paragraph("<b>Original Filename:</b>", body_p), Paragraph(str(media_info.get("original_filename", "N/A")), body_p)],
            [Paragraph("<b>SHA-256 Hash:</b>", body_p), Paragraph(f"<font face='Courier' size=8>{media_info.get('file_hash', 'N/A')}</font>", body_p)],
            [Paragraph("<b>File Size:</b>", body_p), Paragraph(f"{media_info.get('file_size', 0) / (1024*1024):.2f} MB", body_p)],
            [Paragraph("<b>Duration:</b>", body_p), Paragraph(f"{media_info.get('duration', 0.0)} seconds", body_p)],
            [Paragraph("<b>Media Type:</b>", body_p), Paragraph(str(media_info.get("file_type", "video")).upper(), body_p)]
        ]
        t_meta = Table(meta_data, colWidths=[140, 400])
        t_meta.setStyle(TableStyle([
            ('VALIGN', (0, 0), (-1, -1), 'TOP'),
            ('LINEBELOW', (0, 0), (-1, -1), 0.5, colors.HexColor('#F1F5F9')),
            ('PADDING', (0, 0), (-1, -1), 4),
        ]))
        story.append(t_meta)
        story.append(Spacer(1, 10))

        # 4. Multimodal Component Score Breakdown
        story.append(Paragraph("2. Forensic Indicator Breakdown", section_h))
        model_statuses = fusion_result.get("model_statuses", {})

        comp_rows = [
            [
                Paragraph("<b>Analysis Technique</b>", body_p),
                Paragraph("<b>Risk Score</b>", body_p),
                Paragraph("<b>Confidence</b>", body_p),
                Paragraph("<b>Mode / Engine</b>", body_p),
                Paragraph("<b>Status</b>", body_p)
            ]
        ]

        def fmt_s(s):
            return f"{s:.2f}" if s is not None else "N/A"

        items = [
            ("Facial CNN Manipulation", fusion_result.get("facial_score"), model_statuses.get("facial", {})),
            ("SyncNet Audio-Visual Sync", fusion_result.get("lip_sync_score"), model_statuses.get("lip_sync", {})),
            ("TalkNet Active Speaker", fusion_result.get("active_speaker_score"), model_statuses.get("active_speaker", {})),
            ("Acoustic Forensics & Discontinuity", fusion_result.get("audio_score"), model_statuses.get("audio", {})),
        ]

        for title, score, mod in items:
            comp_rows.append([
                Paragraph(title, body_p),
                Paragraph(fmt_s(score), body_p),
                Paragraph(f"{mod.get('confidence', 0.0)*100:.0f}%", body_p),
                Paragraph(mod.get('operational_mode', 'baseline'), body_p),
                Paragraph(mod.get('status', 'COMPLETED'), body_p)
            ])

        t_comp = Table(comp_rows, colWidths=[180, 80, 80, 110, 90])
        t_comp.setStyle(TableStyle([
            ('BACKGROUND', (0, 0), (-1, 0), colors.HexColor('#F1F5F9')),
            ('GRID', (0, 0), (-1, -1), 0.5, colors.HexColor('#CBD5E1')),
            ('VALIGN', (0, 0), (-1, -1), 'MIDDLE'),
            ('PADDING', (0, 0), (-1, -1), 4),
        ]))
        story.append(t_comp)
        story.append(Spacer(1, 10))

        # 5. Chronological Evidence Timeline
        evidence_items = fusion_result.get("evidence_items", [])
        story.append(Paragraph("3. Timestamped Forensic Evidence Findings", section_h))
        if evidence_items:
            ev_rows = [
                [
                    Paragraph("<b>Time (s)</b>", body_p),
                    Paragraph("<b>Indicator Type</b>", body_p),
                    Paragraph("<b>Score</b>", body_p),
                    Paragraph("<b>Forensic Observation</b>", body_p)
                ]
            ]
            for ev in evidence_items[:12]:
                ev_rows.append([
                    Paragraph(f"{ev.get('timestamp', 0.0):.2f}s", body_p),
                    Paragraph(str(ev.get("evidence_type", "")).replace("_", " "), body_p),
                    Paragraph(f"{ev.get('score', 0.0):.2f}", body_p),
                    Paragraph(str(ev.get("description", "")), body_p)
                ])

            t_ev = Table(ev_rows, colWidths=[65, 125, 50, 300])
            t_ev.setStyle(TableStyle([
                ('BACKGROUND', (0, 0), (-1, 0), colors.HexColor('#F8FAFC')),
                ('GRID', (0, 0), (-1, -1), 0.5, colors.HexColor('#E2E8F0')),
                ('VALIGN', (0, 0), (-1, -1), 'TOP'),
                ('PADDING', (0, 0), (-1, -1), 4),
            ]))
            story.append(t_ev)
        else:
            story.append(Paragraph("No significant structural or acoustic manipulation anomalies detected at current sensitivity threshold.", body_p))
        story.append(Spacer(1, 10))

        # 6. Transcription & Diarization
        story.append(Paragraph("4. Speech Transcription & Diarization Segments", section_h))
        if transcription:
            story.append(Paragraph(f"<b>Speech Transcription:</b> \"{transcription[:400]}{'...' if len(transcription) > 400 else ''}\"", body_p))
            story.append(Spacer(1, 6))

        if segments:
            seg_rows = [
                [
                    Paragraph("<b>Speaker</b>", body_p),
                    Paragraph("<b>Interval (s)</b>", body_p),
                    Paragraph("<b>Segment Transcript</b>", body_p)
                ]
            ]
            for s in segments[:8]:
                seg_rows.append([
                    Paragraph(str(s.get("speaker_id", "SPEAKER")), body_p),
                    Paragraph(f"{s.get('start_time', 0.0):.1f}s - {s.get('end_time', 0.0):.1f}s", body_p),
                    Paragraph(str(s.get("transcript", "N/A")), body_p)
                ])
            t_seg = Table(seg_rows, colWidths=[90, 110, 340])
            t_seg.setStyle(TableStyle([
                ('GRID', (0, 0), (-1, -1), 0.5, colors.HexColor('#E2E8F0')),
                ('PADDING', (0, 0), (-1, -1), 4),
            ]))
            story.append(t_seg)
        story.append(Spacer(1, 10))

        # 7. Limitations & Legal Disclaimer
        story.append(Paragraph("5. Limitations & Evidentiary Disclaimer", section_h))
        for lim in fusion_result.get("limitations", []):
            story.append(Paragraph(f"• {lim}", disclaimer_p))
            story.append(Spacer(1, 2))

        story.append(Spacer(1, 4))
        story.append(Paragraph(fusion_result.get("disclaimer", ""), disclaimer_p))

        doc.build(story)
        logger.info(f"Generated forensic PDF report: {output_pdf_path}")
        return output_pdf_path


report_service = ForensicReportService()

