/**
 * Diabetes Risk Prediction and Preventive Healthcare Intelligence Types
 */

export type ModelType = 'logistic_regression' | 'random_forest' | 'gradient_boosting';

export interface HealthMeasurements {
  pregnancies: number;
  glucose: number;
  blood_pressure: number;
  skin_thickness: number;
  insulin: number;
  bmi: number;
  diabetes_pedigree: number;
  age: number;
}

export type RiskTier = 'Low Risk' | 'Borderline / Moderate' | 'Elevated Risk' | 'High Risk';

export interface FeatureImpact {
  feature: keyof HealthMeasurements;
  label: string;
  value: number;
  unit: string;
  referenceNormal: string;
  contribution: number; // Positive increases risk, negative decreases risk
  percentage: number;
  clinicalImpact: 'protective' | 'neutral' | 'moderate_risk' | 'high_risk';
  description: string;
}

export interface PredictionOutput {
  id: string;
  timestamp: string;
  modelType: ModelType;
  modelName: string;
  inputs: HealthMeasurements;
  predictedClass: 0 | 1;
  classificationLabel: 'Lower Risk Profile' | 'Elevated Risk Profile';
  riskScore: number; // 0 - 100
  calibratedProbability: number; // 0.00 - 1.00
  riskTier: RiskTier;
  confidenceInterval: [number, number]; // e.g. [0.65, 0.79]
  featureImpacts: FeatureImpact[];
  clinicalSummary: string;
  lifestyleRecommendations: {
    category: 'Nutrition' | 'Physical Activity' | 'Clinical Monitoring' | 'Lifestyle';
    title: string;
    action: string;
    priority: 'high' | 'medium' | 'standard';
  }[];
  limitationsDisclaimer: string;
}

export interface ModelMetricData {
  accuracy: number;
  precision: number;
  recall: number;
  f1_score: number;
  roc_auc: number;
  confusion_matrix: {
    true_negative: number;
    false_positive: number;
    false_negative: number;
    true_positive: number;
  };
  roc_curve: { fpr: number; tpr: number }[];
}

export interface ModelDetail {
  name: string;
  description: string;
  metrics: ModelMetricData;
  weights?: Record<string, number>;
  bias?: number;
}

export interface FeatureStat {
  mean: number;
  std: number;
  median: number;
  q25: number;
  q75: number;
  min: number;
  max: number;
}

export interface DatasetBundle {
  dataset_info: {
    total_records: number;
    diabetic_records: number;
    non_diabetic_records: number;
    diabetic_ratio: number;
    features: string[];
    train_size: number;
    test_size: number;
    source: string;
    citation: string;
  };
  feature_stats: Record<string, FeatureStat>;
  train_scalers: {
    means: Record<string, number>;
    stds: Record<string, number>;
  };
  correlations: Record<string, Record<string, number>>;
  feature_importances: Record<string, { importance: number; description: string }>;
  models: {
    logistic_regression: ModelDetail;
    random_forest: ModelDetail;
    gradient_boosting: ModelDetail;
  };
}
