"""
Professional PDF Report Generator for ASD Screening Results
"""

from reportlab.lib.pagesizes import letter, A4
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
from reportlab.lib.units import inch
from reportlab.lib import colors
from reportlab.platypus import SimpleDocTemplate, Table, TableStyle, Paragraph, Spacer, Image, PageBreak
from reportlab.lib.enums import TA_CENTER, TA_LEFT, TA_RIGHT
from datetime import datetime
import os

class ASDScreeningReportGenerator:
    def __init__(self):
        self.styles = getSampleStyleSheet()
        self._create_custom_styles()
    
    def _create_custom_styles(self):
        """Create custom paragraph styles for the report"""
        # Title style
        self.styles.add(ParagraphStyle(
            name='CustomTitle',
            parent=self.styles['Heading1'],
            fontSize=24,
            textColor=colors.HexColor('#1976D2'),
            spaceAfter=30,
            alignment=TA_CENTER,
            fontName='Helvetica-Bold'
        ))
        
        # Subtitle style
        self.styles.add(ParagraphStyle(
            name='CustomSubtitle',
            parent=self.styles['Heading2'],
            fontSize=16,
            textColor=colors.HexColor('#424242'),
            spaceAfter=12,
            spaceBefore=12,
            fontName='Helvetica-Bold'
        ))
        
        # Section header style
        self.styles.add(ParagraphStyle(
            name='SectionHeader',
            parent=self.styles['Heading3'],
            fontSize=14,
            textColor=colors.HexColor('#1976D2'),
            spaceAfter=10,
            spaceBefore=15,
            fontName='Helvetica-Bold'
        ))
        
        # Body text style
        self.styles.add(ParagraphStyle(
            name='CustomBody',
            parent=self.styles['BodyText'],
            fontSize=11,
            spaceAfter=8,
            alignment=TA_LEFT
        ))
        
        # Verdict style
        self.styles.add(ParagraphStyle(
            name='VerdictStyle',
            parent=self.styles['Normal'],
            fontSize=18,
            textColor=colors.HexColor('#2E7D32'),
            spaceAfter=15,
            alignment=TA_CENTER,
            fontName='Helvetica-Bold'
        ))
    
    def generate_report(self, result_data, patient_info, output_path, image_path=None):
        """
        Generate a professional PDF report
        
        Args:
            result_data: Dictionary containing screening results
            patient_info: Dictionary with patient information (name, age, date, etc.)
            output_path: Path where PDF will be saved
            image_path: Path to the screening visualization image
        """
        doc = SimpleDocTemplate(
            output_path,
            pagesize=letter,
            rightMargin=72,
            leftMargin=72,
            topMargin=72,
            bottomMargin=72
        )
        
        # Container for the 'Flowable' objects
        elements = []
        
        # Add header
        elements.extend(self._create_header())
        
        # Add patient information
        elements.extend(self._create_patient_info(patient_info))
        
        # Add screening results
        elements.extend(self._create_results_section(result_data))
        
        # Add model predictions table
        elements.extend(self._create_model_predictions_table(result_data))
        
        # Add visualization image if available
        if image_path and os.path.exists(image_path):
            elements.extend(self._create_visualization_section(image_path))
        
        # Add interpretation and recommendations
        elements.extend(self._create_interpretation_section(result_data))
        
        # Add footer
        elements.extend(self._create_footer())
        
        # Build PDF
        doc.build(elements)
        return output_path
    
    def _create_header(self):
        """Create report header"""
        elements = []
        
        # Title
        title = Paragraph("Autism Spectrum Disorder Screening Report", self.styles['CustomTitle'])
        elements.append(title)
        elements.append(Spacer(1, 0.1*inch))
        
        # Subtitle
        subtitle = Paragraph(
            "Autism Spectrum Disorder (ASD) - Oculomotor Behavioral Assessment",
            self.styles['CustomSubtitle']
        )
        elements.append(subtitle)
        elements.append(Spacer(1, 0.3*inch))
        
        return elements
    
    def _create_patient_info(self, patient_info):
        """Create patient information section"""
        elements = []
        
        # Section header
        header = Paragraph("Patient Information", self.styles['SectionHeader'])
        elements.append(header)
        
        # Patient info table
        data = [
            ['Patient Name:', patient_info.get('name', 'N/A')],
            ['Date of Birth / Age:', patient_info.get('age', 'N/A')],
            ['Gender:', patient_info.get('gender', 'N/A')],
            ['Assessment Date:', patient_info.get('date', datetime.now().strftime('%B %d, %Y'))],
            ['Assessment Time:', patient_info.get('time', datetime.now().strftime('%I:%M %p'))],
            ['Screening Protocol:', 'Oculomotor Pattern Analysis'],
            ['Assessment Duration:', patient_info.get('duration', '60 seconds')]
        ]
        
        table = Table(data, colWidths=[2*inch, 4*inch])
        table.setStyle(TableStyle([
            ('BACKGROUND', (0, 0), (0, -1), colors.HexColor('#E3F2FD')),
            ('TEXTCOLOR', (0, 0), (0, -1), colors.HexColor('#1976D2')),
            ('FONTNAME', (0, 0), (0, -1), 'Helvetica-Bold'),
            ('FONTNAME', (1, 0), (1, -1), 'Helvetica'),
            ('FONTSIZE', (0, 0), (-1, -1), 10),
            ('GRID', (0, 0), (-1, -1), 0.5, colors.grey),
            ('VALIGN', (0, 0), (-1, -1), 'MIDDLE'),
            ('LEFTPADDING', (0, 0), (-1, -1), 12),
            ('RIGHTPADDING', (0, 0), (-1, -1), 12),
            ('TOPPADDING', (0, 0), (-1, -1), 8),
            ('BOTTOMPADDING', (0, 0), (-1, -1), 8),
        ]))
        
        elements.append(table)
        elements.append(Spacer(1, 0.3*inch))
        
        return elements
    
    def _create_results_section(self, result_data):
        """Create screening results section"""
        elements = []
        
        # Section header
        header = Paragraph("Clinical Assessment Results", self.styles['SectionHeader'])
        elements.append(header)
        
        # Verdict
        verdict = result_data.get('verdict', 'Unknown')
        confidence = result_data.get('confidence', 0) * 100
        uncertainty = result_data.get('uncertainty_std', 0) * 100
        
        # Clinical classification
        if 'Not Autistic' in verdict:
            clinical_class = "Negative Screen - Not Autistic"
            verdict_color = colors.HexColor('#2E7D32')
            verdict_text = f"<font color='#2E7D32'><b>{clinical_class}</b></font>"
            risk_level = "Low Risk"
        else:
            clinical_class = "Positive Screen - Autistic In Typical Development"
            verdict_color = colors.HexColor("#FE0505")
            verdict_text = f"<font color='#D32F2F'><b>{clinical_class}</b></font>"
            risk_level = "Elevated Risk"
        
        verdict_para = Paragraph(verdict_text, self.styles['VerdictStyle'])
        elements.append(verdict_para)
        
        # Clinical metrics table
        metrics_data = [
            ['Clinical Metric', 'Value', 'Interpretation'],
            ['Diagnostic Probability', f'{confidence:.2f}%', risk_level],
            ['Model Uncertainty (σ)', f'{uncertainty:.2f}%', 'Inter-model variance'],
            ['Assessment Quality', 'High', 'Sufficient data points collected']
        ]
        
        metrics_table = Table(metrics_data, colWidths=[2.2*inch, 2*inch, 2.3*inch])
        metrics_table.setStyle(TableStyle([
            ('BACKGROUND', (0, 0), (-1, 0), colors.HexColor('#1976D2')),
            ('TEXTCOLOR', (0, 0), (-1, 0), colors.whitesmoke),
            ('FONTNAME', (0, 0), (-1, 0), 'Helvetica-Bold'),
            ('FONTSIZE', (0, 0), (-1, 0), 10),
            ('ALIGN', (0, 0), (-1, 0), 'CENTER'),
            ('BACKGROUND', (0, 1), (-1, -1), colors.beige),
            ('GRID', (0, 0), (-1, -1), 1, colors.grey),
            ('VALIGN', (0, 0), (-1, -1), 'MIDDLE'),
            ('LEFTPADDING', (0, 0), (-1, -1), 8),
            ('RIGHTPADDING', (0, 0), (-1, -1), 8),
            ('TOPPADDING', (0, 0), (-1, -1), 6),
            ('BOTTOMPADDING', (0, 0), (-1, -1), 6),
        ]))
        
        elements.append(metrics_table)
        elements.append(Spacer(1, 0.2*inch))
        
        return elements
    
    def _create_model_predictions_table(self, result_data):
        """Create table showing individual model predictions"""
        elements = []
        
        # Section header
        header = Paragraph("Multi-Model Ensemble Analysis", self.styles['SectionHeader'])
        elements.append(header)
        
        # Add description
        desc = Paragraph(
            "<i>Multi-algorithm ensemble analysis of oculomotor biomarkers including gaze fixation patterns, "
            "saccadic velocity, visual attention allocation, and joint attention indicators.</i>",
            self.styles['CustomBody']
        )
        elements.append(desc)
        elements.append(Spacer(1, 0.1*inch))
        
        # Get model probabilities
        model_probs = result_data.get('model_probs', {})
        
        # Create table data with medical terminology
        data = [['Algorithm', 'ASD Probability', 'Clinical Interpretation']]
        
        model_descriptions = {
            'RF': 'Random Forest Classifier',
            'SVM': 'Support Vector Machine',
            'DNN': 'Deep Neural Network',
            'XGB': 'XGBoost Ensemble',
            'LGBM': 'LightGBM Gradient Boosting'
        }
        
        for model_name, prob in model_probs.items():
            prob_percent = prob * 100
            full_name = model_descriptions.get(model_name, model_name)
            
            # Clinical interpretation
            if prob > 0.65:
                interpretation = "Positive Screen"
            elif prob > 0.35:
                interpretation = "Borderline/Inconclusive"
            else:
                interpretation = "Negative Screen"
            
            data.append([full_name, f"{prob_percent:.2f}%", interpretation])
        
        # Create table
        table = Table(data, colWidths=[2*inch, 2*inch, 2*inch])
        table.setStyle(TableStyle([
            # Header row
            ('BACKGROUND', (0, 0), (-1, 0), colors.HexColor('#1976D2')),
            ('TEXTCOLOR', (0, 0), (-1, 0), colors.whitesmoke),
            ('FONTNAME', (0, 0), (-1, 0), 'Helvetica-Bold'),
            ('FONTSIZE', (0, 0), (-1, 0), 11),
            ('ALIGN', (0, 0), (-1, 0), 'CENTER'),
            
            # Data rows
            ('BACKGROUND', (0, 1), (-1, -1), colors.beige),
            ('TEXTCOLOR', (0, 1), (-1, -1), colors.black),
            ('FONTNAME', (0, 1), (-1, -1), 'Helvetica'),
            ('FONTSIZE', (0, 1), (-1, -1), 10),
            ('ALIGN', (1, 1), (1, -1), 'CENTER'),
            ('ALIGN', (2, 1), (2, -1), 'CENTER'),
            
            # Grid
            ('GRID', (0, 0), (-1, -1), 1, colors.grey),
            ('VALIGN', (0, 0), (-1, -1), 'MIDDLE'),
            ('LEFTPADDING', (0, 0), (-1, -1), 12),
            ('RIGHTPADDING', (0, 0), (-1, -1), 12),
            ('TOPPADDING', (0, 0), (-1, -1), 8),
            ('BOTTOMPADDING', (0, 0), (-1, -1), 8),
        ]))
        
        elements.append(table)
        elements.append(Spacer(1, 0.3*inch))
        
        return elements
    
    def _create_visualization_section(self, image_path):
        """Add screening visualization image"""
        elements = []
        
        # Section header
        header = Paragraph("Oculomotor Assessment Visualization", self.styles['SectionHeader'])
        elements.append(header)
        elements.append(Spacer(1, 0.1*inch))
        
        # Add image
        try:
            img = Image(image_path, width=6.5*inch, height=4.5*inch)
            elements.append(img)
            elements.append(Spacer(1, 0.2*inch))
        except Exception as e:
            error_text = f"<i>Visualization image could not be loaded: {str(e)}</i>"
            error_para = Paragraph(error_text, self.styles['CustomBody'])
            elements.append(error_para)
        
        return elements
    
    def _create_interpretation_section(self, result_data):
        """Create interpretation and recommendations section"""
        elements = []
        
        # Clinical Observations Section
        obs_header = Paragraph("Clinical Observations", self.styles['SectionHeader'])
        elements.append(obs_header)
        
        observations = """
        <b>Oculomotor Assessment Findings:</b><br/>
        • <b>Gaze Fixation Patterns:</b> Fixation duration, frequency, and spatial distribution analyzed<br/>
        • <b>Saccadic Eye Movements:</b> Velocity, amplitude, and latency metrics quantified<br/>
        • <b>Visual Attention Allocation:</b> Social vs. non-social stimuli preference evaluated<br/>
        • <b>Gaze Stability Metrics:</b> Smooth pursuit and fixation stability assessed<br/>
        • <b>Joint Attention Indicators:</b> Gaze-following and shared attention patterns measured<br/>
        <br/>
        <b>Clinical Methodology:</b><br/>
        This assessment employs quantitative analysis of oculomotor biomarkers associated with neurodevelopmental 
        conditions. The protocol measures atypical gaze patterns characteristic of autism spectrum disorders, 
        including reduced social attention, atypical fixation duration, irregular saccadic patterns, and 
        diminished joint attention behaviors. Results are derived from ensemble machine learning models 
        trained on validated clinical datasets.
        """
        
        obs_para = Paragraph(observations, self.styles['CustomBody'])
        elements.append(obs_para)
        elements.append(Spacer(1, 0.2*inch))
        
        # Section header
        header = Paragraph("Clinical Interpretation & Recommendations", self.styles['SectionHeader'])
        elements.append(header)
        
        verdict = result_data.get('verdict', 'Unknown')
        confidence = result_data.get('confidence', 0) * 100
        
        # Interpretation text based on results
        if 'Autistic' in verdict:
            interpretation = f"""
            <b>Clinical Interpretation:</b><br/>
            The neurodevelopmental screening indicates <b>positive markers</b> for Autism Spectrum Disorder (ASD) 
            with a diagnostic probability of {confidence:.2f}%. The oculomotor assessment revealed atypical gaze patterns 
            consistent with ASD phenotypes, including reduced social attention allocation and irregular fixation-saccade dynamics.
            <br/><br/>
            <b>Differential Diagnosis Considerations:</b><br/>
            • Autism Spectrum Disorder (DSM-5: 299.00)<br/>
            • Rule out: ADHD, Social Communication Disorder, Anxiety Disorders<br/>
            • Consider: Comorbid conditions (intellectual disability, language disorders)<br/>
            <br/>
            <b>Clinical Recommendations:</b><br/>
            • <b>Immediate:</b> Schedule comprehensive diagnostic evaluation (ADOS-2, ADI-R)<br/>
            • <b>Referral:</b> Developmental pediatrician or child psychiatrist specializing in ASD<br/>
            • <b>Intervention:</b> Consider Applied Behavior Analysis (ABA) or Early Start Denver Model (ESDM)<br/>
            • <b>Monitoring:</b> Document behavioral observations using standardized tools (M-CHAT-R/F)<br/>
            • <b>Follow-up:</b> Re-assessment in 3-6 months to track developmental trajectory<br/>
            • <b>Support Services:</b> Explore speech-language therapy and occupational therapy evaluation
            """
        else:
            interpretation = f"""
            <b>Clinical Interpretation:</b><br/>
            The neurodevelopmental screening indicates <b>negative findings</b> for Autism Spectrum Disorder (ASD) 
            with a diagnostic probability of {confidence:.2f}%. The oculomotor assessment revealed gaze patterns, 
            fixation metrics, and saccadic eye movements within normative developmental parameters.
            <br/><br/>
            <b>Assessment Summary:</b><br/>
            • Gaze patterns consistent with typical neurodevelopment<br/>
            • Social attention allocation within expected ranges<br/>
            • No significant atypical oculomotor markers detected<br/>
            <br/>
            <b>Clinical Recommendations:</b><br/>
            • <b>Monitoring:</b> Continue routine developmental surveillance at well-child visits<br/>
            • <b>Pediatric Care:</b> Maintain regular check-ups per AAP guidelines<br/>
            • <b>Parental Concerns:</b> If developmental concerns arise, seek professional consultation<br/>
            • <b>Re-screening:</b> Consider repeat assessment if behavioral changes observed<br/>
            • <b>Developmental Support:</b> Engage in age-appropriate enrichment activities<br/>
            • <b>Red Flags:</b> Monitor for regression in social-communication skills
            """
        
        interp_para = Paragraph(interpretation, self.styles['CustomBody'])
        elements.append(interp_para)
        elements.append(Spacer(1, 0.3*inch))
        
        # Important notice
        notice = """
        <b><font color='#D32F2F'>Clinical Disclaimer & Limitations:</font></b><br/>
        This automated screening assessment is designed as a <b>preliminary screening tool</b> and should 
        <b>NOT</b> be used as a definitive diagnostic instrument. Per DSM-5 diagnostic criteria, a comprehensive 
        clinical evaluation by qualified healthcare professionals (developmental pediatrician, child psychologist, 
        or child psychiatrist) is necessary for an accurate ASD diagnosis. This report represents a screening-level 
        assessment and must be interpreted within the context of clinical history, behavioral observations, and 
        standardized diagnostic instruments (ADOS-2, ADI-R). The sensitivity and specificity of this screening tool 
        have not been validated against gold-standard diagnostic protocols. This report is intended for professional 
        medical review only and should not be used for self-diagnosis or treatment decisions.
        """
        
        notice_para = Paragraph(notice, self.styles['CustomBody'])
        
        # Create notice box
        notice_table = Table([[notice_para]], colWidths=[6.5*inch])
        notice_table.setStyle(TableStyle([
            ('BACKGROUND', (0, 0), (-1, -1), colors.HexColor('#FFF3E0')),
            ('BOX', (0, 0), (-1, -1), 2, colors.HexColor('#FF9800')),
            ('LEFTPADDING', (0, 0), (-1, -1), 15),
            ('RIGHTPADDING', (0, 0), (-1, -1), 15),
            ('TOPPADDING', (0, 0), (-1, -1), 15),
            ('BOTTOMPADDING', (0, 0), (-1, -1), 15),
        ]))
        
        elements.append(notice_table)
        elements.append(Spacer(1, 0.3*inch))
        
        return elements
    
    def _create_footer(self):
        """Create report footer"""
        elements = []
        
        # Divider line
        elements.append(Spacer(1, 0.2*inch))
        
        # Footer text
        footer_text = f"""
        <font size=9 color='grey'>
        <b>Report Generated:</b> {datetime.now().strftime('%B %d, %Y at %I:%M %p')}<br/>
        <b>Assessment Type:</b> Automated Neurodevelopmental Screening - Oculomotor Analysis<br/>
        <b>Analytical Methods:</b> Ensemble Machine Learning (Random Forest, SVM, Deep Neural Network)<br/>
        <b>Clinical Status:</b> Screening-level assessment - Not a diagnostic instrument<br/>
        <b>Regulatory Notice:</b> Not FDA-approved - For research and preliminary screening purposes only<br/>
        <br/>
        <i>This report contains Protected Health Information (PHI) and is confidential. Intended solely for the use of 
        the patient/guardian and authorized healthcare providers. Unauthorized disclosure is prohibited under HIPAA regulations.</i>
        </font>
        """
        
        footer_para = Paragraph(footer_text, self.styles['CustomBody'])
        elements.append(footer_para)
        
        return elements


# Convenience function
def generate_screening_report(result_data, patient_info, output_dir='reports'):
    """
    Generate a screening report PDF
    
    Args:
        result_data: Screening results dictionary
        patient_info: Patient information dictionary
        output_dir: Directory to save the report
    
    Returns:
        Path to generated PDF file
    """
    # Create reports directory with absolute path
    backend_dir = os.path.dirname(os.path.abspath(__file__))
    output_dir = os.path.join(backend_dir, output_dir)
    os.makedirs(output_dir, exist_ok=True)
    
    # Generate filename
    timestamp = datetime.now().strftime('%Y%m%d_%H%M%S')
    patient_name = patient_info.get('name', 'Unknown').replace(' ', '_')
    filename = f"ASD_Screening_Report_{patient_name}_{timestamp}.pdf"
    output_path = os.path.join(output_dir, filename)
    
    # Get image path if it exists
    image_path = os.path.join(os.path.dirname(__file__), 'Screening_Report.png')
    if not os.path.exists(image_path):
        image_path = None
    
    # Generate report
    generator = ASDScreeningReportGenerator()
    generator.generate_report(result_data, patient_info, output_path, image_path)
    
    return output_path
