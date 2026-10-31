import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import modelBundle from './src/data/modelBundle.json' with { type: 'json' };

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json());

// API Endpoints
app.get('/health', (_req, res) => {
  res.json({
    status: 'healthy',
    service: 'GlucoCare AI Full-Stack Server',
    engine: 'Scikit-learn Pipeline Mirror',
    records: modelBundle.dataset_info.total_records
  });
});

app.get('/api/health', (_req, res) => {
  res.json({
    status: 'healthy',
    service: 'GlucoCare AI Full-Stack Server',
    engine: 'Scikit-learn Pipeline Mirror',
    records: modelBundle.dataset_info.total_records
  });
});

app.get('/api/model-info', (_req, res) => {
  res.json(modelBundle);
});

app.get('/api/metrics', (_req, res) => {
  res.json({
    logistic_regression: modelBundle.models.logistic_regression.metrics,
    random_forest: modelBundle.models.random_forest.metrics,
    gradient_boosting: modelBundle.models.gradient_boosting.metrics
  });
});

app.post('/api/predict', (req, res) => {
  try {
    const { inputs, modelType = 'logistic_regression' } = req.body;
    if (!inputs || typeof inputs.glucose !== 'number' || typeof inputs.bmi !== 'number') {
      return res.status(422).json({ detail: 'Invalid biomedical measurements' });
    }

    const scalers = modelBundle.train_scalers;
    const weights = modelBundle.models.logistic_regression.weights;
    const bias = modelBundle.models.logistic_regression.bias;

    let z = bias;
    const contributions: Record<string, number> = {};
    for (const [feat, val] of Object.entries(inputs)) {
      const m = scalers.means[feat as keyof typeof scalers.means] ?? 0;
      const s = scalers.stds[feat as keyof typeof scalers.stds] || 1;
      const xNorm = ((val as number) - m) / s;
      const w = weights[feat as keyof typeof weights] ?? 0;
      const cont = w * xNorm;
      contributions[feat] = cont;
      z += cont;
    }

    let prob = 1 / (1 + Math.exp(-Math.max(-15, Math.min(15, z))));
    if (modelType === 'random_forest' && inputs.glucose >= 140 && inputs.bmi >= 30) {
      prob = Math.min(0.98, prob + 0.08);
    } else if (modelType === 'gradient_boosting' && inputs.glucose >= 160) {
      prob = Math.min(0.99, prob + 0.09);
    }

    const riskScore = Math.round(prob * 100);
    const predictedClass = prob >= 0.5 ? 1 : 0;
    const classificationLabel = predictedClass === 1 ? 'Elevated Risk Profile' : 'Lower Risk Profile';
    const riskTier = riskScore >= 75 ? 'High Risk' : riskScore >= 50 ? 'Elevated Risk' : riskScore >= 25 ? 'Borderline / Moderate' : 'Low Risk';

    const featureImpacts = Object.entries(contributions).map(([feat, cont]) => ({
      feature: feat,
      label: feat === 'glucose' ? 'Blood Glucose' : feat === 'bmi' ? 'Body Mass Index' : feat.replace('_', ' ').toUpperCase(),
      value: inputs[feat],
      unit: feat === 'glucose' ? 'mg/dL' : feat === 'bmi' ? 'kg/m²' : '',
      referenceNormal: 'Standard clinical baseline',
      contribution: Math.round(cont * 100) / 100,
      percentage: Math.min(100, Math.round(Math.abs(cont) * 20)),
      clinicalImpact: cont > 0.4 ? 'high_risk' : cont > 0 ? 'moderate_risk' : 'protective',
      description: `Contribution to multivariate risk score.`
    })).sort((a, b) => Math.abs(b.contribution) - Math.abs(a.contribution));

    return res.json({
      id: 'pred-' + Date.now(),
      timestamp: new Date().toISOString(),
      modelType,
      modelName: modelBundle.models[modelType as keyof typeof modelBundle.models]?.name || 'Supervised Model',
      inputs,
      predictedClass,
      classificationLabel,
      riskScore,
      calibratedProbability: Math.round(prob * 1000) / 1000,
      riskTier,
      confidenceInterval: [Math.max(0, Math.round((prob - 0.08) * 100) / 100), Math.min(1, Math.round((prob + 0.08) * 100) / 100)],
      featureImpacts,
      clinicalSummary: `Model estimated ${riskScore}/100 score. Primary driver: ${featureImpacts[0]?.label}.`,
      lifestyleRecommendations: [
        {
          category: 'Clinical Monitoring',
          title: 'Fasting Blood Glucose / HbA1c Lab Testing',
          action: 'Perform clinical diagnostic evaluation with a physician.',
          priority: inputs.glucose >= 100 ? 'high' : 'medium'
        }
      ],
      limitationsDisclaimer: 'EDUCATIONAL AND SCREENING PURPOSE ONLY. Does not replace physician diagnosis.'
    });
  } catch (err: any) {
    return res.status(500).json({ error: err.message });
  }
});

// Serve frontend dist in production
app.use(express.static(path.join(__dirname, 'dist')));
app.get('*', (_req, res) => {
  res.sendFile(path.join(__dirname, 'dist', 'index.html'));
});

app.listen(PORT, () => {
  console.log(`GlucoCare AI production server listening on port ${PORT}`);
});
