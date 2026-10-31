import {
  HealthMeasurements,
  ModelType,
  PredictionOutput,
  ModelMetricData,
  DatasetBundle
} from '../types/diabetes';
import { runInference, modelBundle } from '../ml/inferenceEngine';

export async function checkBackendHealth(): Promise<{ status: string; engine: string }> {
  try {
    const res = await fetch('/api/health');
    if (res.ok) {
      const data = await res.json();
      return { status: 'online', engine: data.engine || 'Backend API' };
    }
  } catch (e) {
    // Backend API not reachable or running in frontend-only preview
  }
  return { status: 'active', engine: 'Embedded ML Engine (Zero-Latency)' };
}

export async function predictRisk(
  inputs: HealthMeasurements,
  modelType: ModelType = 'logistic_regression'
): Promise<PredictionOutput> {
  try {
    const res = await fetch('/api/predict', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ inputs, modelType })
    });
    if (res.ok) {
      const data = await res.json();
      return data;
    }
  } catch (err) {
    console.info('Backend API request delegated to client ML inference engine');
  }

  // Resilient exact client-side ML engine
  return runInference(inputs, modelType);
}

export async function getModelMetadata(): Promise<DatasetBundle> {
  try {
    const res = await fetch('/api/model-info');
    if (res.ok) {
      return await res.json();
    }
  } catch (e) {
    // fallback
  }
  return modelBundle;
}

export async function getEvaluationMetrics(): Promise<Record<ModelType, ModelMetricData>> {
  try {
    const res = await fetch('/api/metrics');
    if (res.ok) {
      return await res.json();
    }
  } catch (e) {
    // fallback
  }
  return {
    logistic_regression: modelBundle.models.logistic_regression.metrics,
    random_forest: modelBundle.models.random_forest.metrics,
    gradient_boosting: modelBundle.models.gradient_boosting.metrics
  };
}
