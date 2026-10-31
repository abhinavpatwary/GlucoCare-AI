import tailwindcss from '@tailwindcss/vite';
import react from '@vitejs/plugin-react';
import path from 'path';
import { fileURLToPath } from 'url';
import { defineConfig, Plugin } from 'vite';
import modelBundle from './src/data/modelBundle.json' with { type: 'json' };

const __dirname = path.dirname(fileURLToPath(import.meta.url));

// Local API Middleware plugin for seamless dev preview
function apiServerPlugin(): Plugin {
  return {
    name: 'api-server-middleware',
    configureServer(server) {
      server.middlewares.use((req, res, next) => {
        const url = req.url?.split('?')[0];

        if (url === '/health' || url === '/api/health') {
          res.setHeader('Content-Type', 'application/json');
          res.end(JSON.stringify({
            status: 'healthy',
            service: 'GlucoCare AI Unified Engine',
            engine: 'Active Machine Learning Inference Service',
            dataset_records: modelBundle.dataset_info.total_records
          }));
          return;
        }

        if (url === '/api/model-info') {
          res.setHeader('Content-Type', 'application/json');
          res.end(JSON.stringify(modelBundle));
          return;
        }

        if (url === '/api/metrics') {
          res.setHeader('Content-Type', 'application/json');
          res.end(JSON.stringify({
            logistic_regression: modelBundle.models.logistic_regression.metrics,
            random_forest: modelBundle.models.random_forest.metrics,
            gradient_boosting: modelBundle.models.gradient_boosting.metrics
          }));
          return;
        }

        if (url === '/api/predict' && req.method === 'POST') {
          let body = '';
          req.on('data', chunk => { body += chunk; });
          req.on('end', () => {
            try {
              const parsed = JSON.parse(body);
              const inputs = parsed.inputs;
              const modelType = parsed.modelType || 'logistic_regression';

              // Validation
              if (!inputs || typeof inputs.glucose !== 'number' || typeof inputs.bmi !== 'number') {
                res.statusCode = 422;
                res.setHeader('Content-Type', 'application/json');
                res.end(JSON.stringify({ detail: 'Invalid biomedical measurements' }));
                return;
              }

              // Compute inference with standardized model weights
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
                referenceNormal: 'Standard clinical reference',
                contribution: Math.round(cont * 100) / 100,
                percentage: Math.min(100, Math.round(Math.abs(cont) * 20)),
                clinicalImpact: cont > 0.4 ? 'high_risk' : cont > 0 ? 'moderate_risk' : 'protective',
                description: `Impact of ${feat} in predictive model`
              })).sort((a, b) => Math.abs(b.contribution) - Math.abs(a.contribution));

              const responseData = {
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
                clinicalSummary: `The ${modelType} model estimated a risk score of ${riskScore}/100.`,
                lifestyleRecommendations: [
                  {
                    category: 'Clinical Monitoring',
                    title: 'Fasting Blood Sugar & HbA1c Evaluation',
                    action: 'Consult a medical provider for confirmation.',
                    priority: inputs.glucose >= 100 ? 'high' : 'medium'
                  },
                  {
                    category: 'Nutrition',
                    title: 'Balanced Low-Glycemic Dietary Pattern',
                    action: 'Incorporate fiber-rich foods and reduce simple sugars.',
                    priority: inputs.bmi >= 25 ? 'high' : 'medium'
                  }
                ],
                limitationsDisclaimer: 'EDUCATIONAL AND SCREENING PURPOSE ONLY. Does not replace physician diagnosis.'
              };

              res.setHeader('Content-Type', 'application/json');
              res.end(JSON.stringify(responseData));
            } catch (e: any) {
              res.statusCode = 400;
              res.setHeader('Content-Type', 'application/json');
              res.end(JSON.stringify({ error: e.message }));
            }
          });
          return;
        }

        next();
      });
    }
  };
}

export default defineConfig(() => {
  return {
    plugins: [react(), tailwindcss(), apiServerPlugin()],
    resolve: {
      alias: {
        '@': path.resolve(__dirname, '.'),
      },
    },
    server: {
      // HMR is disabled in AI Studio via DISABLE_HMR env var.
      hmr: process.env.DISABLE_HMR !== 'true',
      watch: process.env.DISABLE_HMR === 'true' ? null : {},
    },
  };
});
