import { PredictionOutput } from '../types/diabetes';

const STORAGE_KEY = 'glucocare_prediction_history_v1';

export function getSessionHistory(): PredictionOutput[] {
  try {
    const raw = sessionStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    return JSON.parse(raw);
  } catch (err) {
    console.warn('Could not read session prediction history', err);
    return [];
  }
}

export function savePredictionToHistory(prediction: PredictionOutput): PredictionOutput[] {
  try {
    const existing = getSessionHistory();
    // Prepend new prediction
    const updated = [prediction, ...existing.filter((p) => p.id !== prediction.id)].slice(0, 50);
    sessionStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
    return updated;
  } catch (err) {
    console.warn('Could not save prediction to session history', err);
    return [];
  }
}

export function clearSessionHistory(): void {
  try {
    sessionStorage.removeItem(STORAGE_KEY);
  } catch (err) {
    console.warn('Could not clear session history', err);
  }
}

export function exportHistoryToCsv(history: PredictionOutput[]): void {
  if (!history || history.length === 0) return;

  const headers = [
    'Assessment ID',
    'Timestamp',
    'Model',
    'Predicted Class',
    'Risk Score',
    'Risk Tier',
    'Glucose (mg/dL)',
    'BMI (kg/m2)',
    'Blood Pressure (mm Hg)',
    'Age (years)',
    'Insulin (uU/mL)',
    'Diabetes Pedigree',
    'Pregnancies',
    'Skin Thickness (mm)'
  ];

  const rows = history.map((p) => [
    p.id,
    p.timestamp,
    `"${p.modelName}"`,
    p.classificationLabel,
    p.riskScore,
    p.riskTier,
    p.inputs.glucose,
    p.inputs.bmi,
    p.inputs.blood_pressure,
    p.inputs.age,
    p.inputs.insulin,
    p.inputs.diabetes_pedigree,
    p.inputs.pregnancies,
    p.inputs.skin_thickness
  ]);

  const csvContent = [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.setAttribute('href', url);
  link.setAttribute('download', `GlucoCare_Session_History_${new Date().toISOString().slice(0, 10)}.csv`);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}
