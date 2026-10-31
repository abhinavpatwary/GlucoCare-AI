import { jsPDF } from 'jspdf';
import { PredictionOutput } from '../types/diabetes';

export function generatePredictionPdf(prediction: PredictionOutput): void {
  const doc = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: 'a4'
  });

  const pageWidth = doc.internal.pageSize.getWidth();
  let y = 18;

  // Header banner
  doc.setFillColor(15, 23, 42); // Navy #0F172A
  doc.rect(0, 0, pageWidth, 28, 'F');

  doc.setTextColor(255, 255, 255);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(16);
  doc.text('GLUCOCARE AI — PREVENTIVE HEALTH INTELLIGENCE', 16, 12);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(9);
  doc.setTextColor(148, 163, 184); // Slate 400
  doc.text('Machine Learning Risk Assessment Summary & Clinical Screening Dossier', 16, 19);
  doc.text(`Generated: ${new Date(prediction.timestamp).toLocaleString()}`, pageWidth - 16, 19, { align: 'right' });

  y = 38;

  // Executive Summary Card
  doc.setFillColor(248, 250, 252); // Slate 50
  doc.setDrawColor(226, 232, 240); // Slate 200
  doc.roundedRect(14, y, pageWidth - 28, 44, 3, 3, 'FD');

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(11);
  doc.setTextColor(15, 23, 42);
  doc.text('EXECUTIVE RISK CLASSIFICATION', 20, y + 10);

  // Status badge
  const isHigh = prediction.predictedClass === 1;
  if (isHigh) {
    doc.setFillColor(254, 242, 242);
    doc.setDrawColor(239, 68, 68);
    doc.setTextColor(185, 28, 28);
  } else {
    doc.setFillColor(240, 253, 250);
    doc.setDrawColor(13, 148, 136);
    doc.setTextColor(15, 118, 110);
  }
  doc.roundedRect(pageWidth - 78, y + 5, 60, 10, 2, 2, 'FD');
  doc.setFontSize(9);
  doc.setFont('helvetica', 'bold');
  doc.text(prediction.classificationLabel.toUpperCase(), pageWidth - 48, y + 11.5, { align: 'center' });

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(10);
  doc.setTextColor(51, 65, 85);
  doc.text(`Model Algorithm: ${prediction.modelName}`, 20, y + 18);
  doc.text(`Model Estimated Risk Score: ${prediction.riskScore} / 100 (${prediction.riskTier})`, 20, y + 25);
  doc.text(`Estimated Probability: ${(prediction.calibratedProbability * 100).toFixed(1)}% (95% CI: ${(prediction.confidenceInterval[0] * 100).toFixed(0)}% – ${(prediction.confidenceInterval[1] * 100).toFixed(0)}%)`, 20, y + 32);
  doc.text(`Assessment ID: ${prediction.id}`, 20, y + 39);

  y += 52;

  // Patient Biomarker Input Table
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(11);
  doc.setTextColor(15, 23, 42);
  doc.text('PATIENT BIOMARKERS & CLINICAL INPUTS', 16, y);
  y += 5;

  // Table header
  doc.setFillColor(241, 245, 249);
  doc.rect(14, y, pageWidth - 28, 8, 'F');
  doc.setFontSize(8.5);
  doc.setTextColor(71, 85, 105);
  doc.text('Biomarker Parameter', 18, y + 5.5);
  doc.text('Observed Value', 85, y + 5.5);
  doc.text('Standard Reference Baseline', 135, y + 5.5);
  y += 8;

  const rows = [
    { name: 'Plasma Glucose', val: `${prediction.inputs.glucose} mg/dL`, ref: '70 – 99 mg/dL (fasting)' },
    { name: 'Body Mass Index (BMI)', val: `${prediction.inputs.bmi} kg/m²`, ref: '18.5 – 24.9 kg/m²' },
    { name: 'Diastolic Blood Pressure', val: `${prediction.inputs.blood_pressure} mm Hg`, ref: '60 – 80 mm Hg' },
    { name: 'Patient Age', val: `${prediction.inputs.age} years`, ref: 'General screening' },
    { name: 'Serum Insulin', val: `${prediction.inputs.insulin} µU/mL`, ref: '16 – 166 µU/mL' },
    { name: 'Diabetes Pedigree Score', val: `${prediction.inputs.diabetes_pedigree}`, ref: '0.08 – 0.50 (low familial risk)' },
    { name: 'Total Pregnancies', val: `${prediction.inputs.pregnancies}`, ref: 'Gestational history baseline' },
    { name: 'Triceps Skinfold', val: `${prediction.inputs.skin_thickness} mm`, ref: '10 – 26 mm' },
  ];

  rows.forEach((r, idx) => {
    if (idx % 2 === 1) {
      doc.setFillColor(248, 250, 252);
      doc.rect(14, y, pageWidth - 28, 6.5, 'F');
    }
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(8.5);
    doc.setTextColor(30, 41, 59);
    doc.text(r.name, 18, y + 4.5);
    doc.setFont('helvetica', 'bold');
    doc.text(r.val, 85, y + 4.5);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(100, 116, 139);
    doc.text(r.ref, 135, y + 4.5);
    y += 6.5;
  });

  y += 8;

  // Primary Feature Explainability Table
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(11);
  doc.setTextColor(15, 23, 42);
  doc.text('EXPLAINABLE AI: TOP RISK FACTORS & ATTRIBUTION', 16, y);
  y += 5;

  doc.setFillColor(241, 245, 249);
  doc.rect(14, y, pageWidth - 28, 8, 'F');
  doc.setFontSize(8.5);
  doc.setTextColor(71, 85, 105);
  doc.text('Factor', 18, y + 5.5);
  doc.text('Relative Impact', 85, y + 5.5);
  doc.text('Model Effect', 135, y + 5.5);
  y += 8;

  prediction.featureImpacts.slice(0, 4).forEach((fi, idx) => {
    if (idx % 2 === 1) {
      doc.setFillColor(248, 250, 252);
      doc.rect(14, y, pageWidth - 28, 6.5, 'F');
    }
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(8.5);
    doc.setTextColor(30, 41, 59);
    doc.text(fi.label, 18, y + 4.5);
    doc.setFont('helvetica', 'bold');
    doc.text(`${fi.percentage}% relative weight`, 85, y + 4.5);

    if (fi.contribution > 0) {
      doc.setTextColor(185, 28, 28);
      doc.text(`+${fi.contribution} (Increases Risk)`, 135, y + 4.5);
    } else {
      doc.setTextColor(13, 148, 136);
      doc.text(`${fi.contribution} (Protective / Mitigates Risk)`, 135, y + 4.5);
    }
    y += 6.5;
  });

  y += 8;

  // Clinical Summary & Recommendations
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(11);
  doc.setTextColor(15, 23, 42);
  doc.text('PREVENTIVE GUIDANCE & RECOMMENDED NEXT STEPS', 16, y);
  y += 5;

  prediction.lifestyleRecommendations.slice(0, 3).forEach((rec) => {
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(8.5);
    doc.setTextColor(13, 148, 136);
    doc.text(`[${rec.category.toUpperCase()}] ${rec.title}`, 18, y + 4);
    y += 5;
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(51, 65, 85);
    const splitText = doc.splitTextToSize(rec.action, pageWidth - 36);
    doc.text(splitText, 18, y + 3);
    y += splitText.length * 4.2 + 2;
  });

  y += 4;

  // Prominent Disclaimer Box
  doc.setFillColor(254, 243, 199); // Amber 100
  doc.setDrawColor(245, 158, 11); // Amber 500
  doc.roundedRect(14, y, pageWidth - 28, 24, 2, 2, 'FD');

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(8);
  doc.setTextColor(146, 64, 14); // Amber 800
  doc.text('IMPORTANT MEDICAL & REGULATORY DISCLAIMER', 18, y + 5);
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(7.5);
  const disclaimerLines = doc.splitTextToSize(prediction.limitationsDisclaimer, pageWidth - 36);
  doc.text(disclaimerLines, 18, y + 9.5);

  // Footer
  doc.setFontSize(7.5);
  doc.setTextColor(148, 163, 184);
  doc.text('GlucoCare AI Academic Project System — NIDDK Benchmark Trained Classifier — For Academic & Screening Evaluation Only', pageWidth / 2, 290, { align: 'center' });

  doc.save(`GlucoCare-Report-${prediction.id}.pdf`);
}
