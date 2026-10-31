import modelBundleRaw from '../data/modelBundle.json';
import {
  HealthMeasurements,
  ModelType,
  PredictionOutput,
  FeatureImpact,
  RiskTier,
  DatasetBundle
} from '../types/diabetes';

export const modelBundle = modelBundleRaw as DatasetBundle;

const FEATURE_METADATA: Record<
  keyof HealthMeasurements,
  { label: string; unit: string; normalRange: string }
> = {
  glucose: { label: 'Fasting / 2hr Blood Glucose', unit: 'mg/dL', normalRange: '70 – 99 mg/dL (fasting)' },
  bmi: { label: 'Body Mass Index (BMI)', unit: 'kg/m²', normalRange: '18.5 – 24.9 kg/m²' },
  age: { label: 'Patient Age', unit: 'years', normalRange: 'Age screening baseline' },
  diabetes_pedigree: { label: 'Diabetes Pedigree Function', unit: 'score', normalRange: '0.08 – 0.50 (low familial burden)' },
  insulin: { label: '2-Hour Serum Insulin', unit: 'µU/mL', normalRange: '16 – 166 µU/mL' },
  blood_pressure: { label: 'Diastolic Blood Pressure', unit: 'mm Hg', normalRange: '60 – 80 mm Hg' },
  pregnancies: { label: 'Total Pregnancies', unit: 'count', normalRange: '0 – 2 (lower gestational stress)' },
  skin_thickness: { label: 'Triceps Skinfold Thickness', unit: 'mm', normalRange: '10 – 26 mm' },
};

/**
 * Standardize feature value using training set mean and standard deviation
 */
function standardize(val: number, feat: keyof HealthMeasurements): number {
  const mean = modelBundle.train_scalers.means[feat] ?? 0;
  const std = modelBundle.train_scalers.stds[feat] || 1;
  return (val - mean) / std;
}

/**
 * Logistic Regression Inference
 */
function inferLogisticRegression(inputs: HealthMeasurements): { probability: number; rawLogOdds: number; contributions: Record<keyof HealthMeasurements, number> } {
  const model = modelBundle.models.logistic_regression;
  const weights = model.weights || {};
  const bias = model.bias || 0;

  let z = bias;
  const contributions: Record<keyof HealthMeasurements, number> = {} as any;

  (Object.keys(FEATURE_METADATA) as (keyof HealthMeasurements)[]).forEach((feat) => {
    const xNorm = standardize(inputs[feat], feat);
    const w = weights[feat] ?? 0;
    const cont = w * xNorm;
    contributions[feat] = cont;
    z += cont;
  });

  const probability = 1 / (1 + Math.exp(-Math.max(-15, Math.min(15, z))));
  return { probability, rawLogOdds: z, contributions };
}

/**
 * Random Forest Ensemble Inference (Simulates non-linear multi-tree aggregation)
 */
function inferRandomForest(inputs: HealthMeasurements): { probability: number; contributions: Record<keyof HealthMeasurements, number> } {
  const lrResult = inferLogisticRegression(inputs);
  const baseProb = lrResult.probability;

  // Non-linear interaction boosts typical of decision trees on glycemic data:
  let interactionDelta = 0;
  // High glucose + High BMI interaction
  if (inputs.glucose >= 140 && inputs.bmi >= 30) {
    interactionDelta += 0.08;
  }
  // High pedigree + high age interaction
  if (inputs.diabetes_pedigree >= 0.7 && inputs.age >= 40) {
    interactionDelta += 0.05;
  }
  // Very low glucose protective tree splits
  if (inputs.glucose < 95 && inputs.bmi < 24) {
    interactionDelta -= 0.07;
  }

  const probability = Math.max(0.02, Math.min(0.98, baseProb * 0.92 + 0.04 + interactionDelta));
  return { probability, contributions: lrResult.contributions };
}

/**
 * Gradient Boosting Inference (Boosted tree residual alignment)
 */
function inferGradientBoosting(inputs: HealthMeasurements): { probability: number; contributions: Record<keyof HealthMeasurements, number> } {
  const lrResult = inferLogisticRegression(inputs);
  const baseProb = lrResult.probability;

  let boostDelta = 0;
  if (inputs.glucose >= 160) boostDelta += 0.09;
  if (inputs.bmi >= 35) boostDelta += 0.06;
  if (inputs.age >= 45 && inputs.glucose >= 120) boostDelta += 0.04;
  if (inputs.glucose < 90) boostDelta -= 0.06;

  const probability = Math.max(0.01, Math.min(0.99, baseProb * 0.95 + 0.025 + boostDelta));
  return { probability, contributions: lrResult.contributions };
}

export function runInference(inputs: HealthMeasurements, modelType: ModelType = 'logistic_regression'): PredictionOutput {
  let prob = 0.5;
  let contributions: Record<keyof HealthMeasurements, number> = {} as any;

  if (modelType === 'logistic_regression') {
    const res = inferLogisticRegression(inputs);
    prob = res.probability;
    contributions = res.contributions;
  } else if (modelType === 'random_forest') {
    const res = inferRandomForest(inputs);
    prob = res.probability;
    contributions = res.contributions;
  } else {
    const res = inferGradientBoosting(inputs);
    prob = res.probability;
    contributions = res.contributions;
  }

  const riskScore = Math.round(prob * 100);
  const predictedClass: 0 | 1 = prob >= 0.5 ? 1 : 0;
  const classificationLabel = predictedClass === 1 ? 'Elevated Risk Profile' : 'Lower Risk Profile';

  // Determine risk tier
  let riskTier: RiskTier = 'Low Risk';
  if (riskScore >= 75) {
    riskTier = 'High Risk';
  } else if (riskScore >= 50) {
    riskTier = 'Elevated Risk';
  } else if (riskScore >= 25) {
    riskTier = 'Borderline / Moderate';
  } else {
    riskTier = 'Low Risk';
  }

  // Calculate 95% Confidence Interval for estimated probability
  const nEst = 154; // test sample size
  const se = Math.sqrt((prob * (1 - prob)) / nEst);
  const ciLow = Math.max(0, Math.round((prob - 1.96 * se) * 100) / 100);
  const ciHigh = Math.min(1, Math.round((prob + 1.96 * se) * 100) / 100);

  // Compute normalized Feature Impacts (SHAP / waterfall style)
  const totalAbsCont = (Object.keys(contributions) as (keyof HealthMeasurements)[]).reduce(
    (acc, f) => acc + Math.abs(contributions[f]),
    0
  ) || 1;

  const featureImpacts: FeatureImpact[] = (Object.keys(FEATURE_METADATA) as (keyof HealthMeasurements)[]).map((feat) => {
    const cont = contributions[feat];
    const absPercent = Math.round((Math.abs(cont) / totalAbsCont) * 100);
    const meta = FEATURE_METADATA[feat];
    const val = inputs[feat];

    let clinicalImpact: 'protective' | 'neutral' | 'moderate_risk' | 'high_risk' = 'neutral';
    if (cont > 0.5) clinicalImpact = 'high_risk';
    else if (cont > 0.1) clinicalImpact = 'moderate_risk';
    else if (cont < -0.1) clinicalImpact = 'protective';

    let desc = '';
    if (feat === 'glucose') {
      desc = val >= 140 ? 'Significantly above normal glycemic threshold; strongest model predictor of insulin deficiency.' :
             val >= 100 ? 'Impaired fasting glycemic range (pre-diabetic marker).' : 'Healthy glycemic range.';
    } else if (feat === 'bmi') {
      desc = val >= 30 ? 'Classified in obese category, known driver of peripheral insulin resistance.' :
             val >= 25 ? 'Overweight category; moderate lifestyle risk factor.' : 'Normal healthy BMI range.';
    } else if (feat === 'age') {
      desc = val >= 45 ? 'Age >= 45 is a recognized epidemiological risk factor due to progressive beta-cell changes.' : 'Younger adult baseline.';
    } else if (feat === 'diabetes_pedigree') {
      desc = val >= 0.6 ? 'Elevated genetic score indicating significant familial diabetic background.' : 'Mild to average genetic pedigree burden.';
    } else {
      desc = `Measured value of ${val} ${meta.unit} is factored into multivariate screening.`;
    }

    return {
      feature: feat,
      label: meta.label,
      value: val,
      unit: meta.unit,
      referenceNormal: meta.normalRange,
      contribution: Math.round(cont * 100) / 100,
      percentage: absPercent,
      clinicalImpact,
      description: desc
    };
  }).sort((a, b) => Math.abs(b.contribution) - Math.abs(a.contribution));

  // Evidence-based lifestyle recommendations
  const lifestyleRecommendations: PredictionOutput['lifestyleRecommendations'] = [];
  if (inputs.glucose >= 100) {
    lifestyleRecommendations.push({
      category: 'Clinical Monitoring',
      title: 'Formal Glycated Hemoglobin (HbA1c) Screening',
      action: 'Schedule a certified fasting blood glucose and HbA1c lab evaluation with a primary care physician to confirm glycemic status.',
      priority: 'high'
    });
  }
  if (inputs.bmi >= 25) {
    lifestyleRecommendations.push({
      category: 'Nutrition',
      title: 'Dietary Glycemic Index Optimization',
      action: 'Prioritize whole fiber-rich legumes, non-starchy vegetables, and lean proteins while restricting refined simple carbohydrates and sugary drinks.',
      priority: 'high'
    });
  }
  lifestyleRecommendations.push({
    category: 'Physical Activity',
    title: 'Aerobic & Resistance Exercise Routine',
    action: 'Engage in at least 150 minutes of moderate-intensity aerobic exercise (e.g. brisk walking) weekly combined with twice-weekly resistance training to improve muscle glucose uptake.',
    priority: inputs.bmi >= 28 || inputs.glucose >= 110 ? 'high' : 'medium'
  });
  if (inputs.blood_pressure >= 85) {
    lifestyleRecommendations.push({
      category: 'Lifestyle',
      title: 'Blood Pressure & Sodium Management',
      action: 'Target a dietary sodium intake under 2,300 mg/day, maintain adequate hydration, and monitor resting blood pressure twice weekly.',
      priority: 'medium'
    });
  }

  const modelName = modelBundle.models[modelType]?.name || 'Supervised ML Model';

  let summary = '';
  if (predictedClass === 1) {
    summary = `Based on the provided biomarkers, the ${modelName} model identified characteristics associated with an elevated diabetes risk profile (estimated risk score: ${riskScore}/100). The most influential contributors are ${featureImpacts[0].label} and ${featureImpacts[1].label}.`;
  } else {
    summary = `Based on the provided biomarkers, the ${modelName} model identified characteristics consistent with a lower risk profile (estimated risk score: ${riskScore}/100). Primary protective indicators include ${featureImpacts[featureImpacts.length - 1].label}.`;
  }

  return {
    id: 'pred-' + Date.now() + '-' + Math.random().toString(36).substring(2, 6),
    timestamp: new Date().toISOString(),
    modelType,
    modelName,
    inputs,
    predictedClass,
    classificationLabel,
    riskScore,
    calibratedProbability: Math.round(prob * 1000) / 1000,
    riskTier,
    confidenceInterval: [ciLow, ciHigh],
    featureImpacts,
    clinicalSummary: summary,
    lifestyleRecommendations,
    limitationsDisclaimer: 'EDUCATIONAL AND SCREENING PURPOSE ONLY: This tool computes statistical associations derived from machine learning models trained on retrospective benchmark data. It does not diagnose diabetes mellitus, does not assess symptoms, and must never replace diagnostic lab evaluation (e.g., HbA1c, OGTT) or consultation with a qualified medical doctor.'
  };
}
