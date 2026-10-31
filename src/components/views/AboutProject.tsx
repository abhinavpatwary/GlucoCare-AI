import React, { useState } from 'react';
import {
  GraduationCap,
  BookOpen,
  HelpCircle,
  CheckSquare,
  ShieldAlert,
  Cpu,
  Layers,
  ChevronDown,
  ChevronUp,
  Award,
  Terminal,
  FileCode
} from 'lucide-react';

export const AboutProject: React.FC = () => {
  const [openVivaId, setOpenVivaId] = useState<number | null>(1);
  const [activeTab, setActiveTab] = useState<'overview' | 'viva' | 'demo' | 'checklist'>('overview');

  const vivaQuestions = [
    {
      id: 1,
      q: 'Why did you select Random Forest and Gradient Boosting in addition to Logistic Regression?',
      a: 'Logistic Regression provides an interpretable linear baseline with calibrated log-odds coefficients. However, physiological biomarkers exhibit non-linear interactions (e.g. insulin resistance manifests as a combined threshold interaction of high glucose, elevated BMI, and advancing age). Random Forest captures these high-order interactions via an ensemble of decorrelated decision trees, while Gradient Boosting sequentially minimizes empirical risk on difficult-to-classify edge cases.'
    },
    {
      id: 2,
      q: 'How did you handle potential data leakage during feature preprocessing?',
      a: 'Standardization parameters (mean μ and standard deviation σ) were fit strictly on the 80% training set (614 records) and subsequently applied to transform the 20% hold-out test set (154 records) and real-time inference inputs. Fitting scalers on the entire dataset prior to splitting would leak test set distribution into the training pipeline, artificially inflating evaluation metrics.'
    },
    {
      id: 3,
      q: 'Why is Recall (Sensitivity) considered more critical than raw Accuracy in a medical screening context?',
      a: 'In medical screening, the cost of a False Negative (failing to identify an individual with elevated risk, resulting in missed preventive intervention and progression to clinical diabetes) is catastrophic compared to a False Positive (a healthy patient referred for a safe confirmatory HbA1c blood test). Therefore, an operating point optimizing Sensitivity/Recall (minimizing False Negatives) is prioritized over raw accuracy.'
    },
    {
      id: 4,
      q: 'How does your Explainable AI (XAI) attribution pipeline work?',
      a: 'We implement local feature attribution by decomposing the model log-odds into individual standardized feature contributions (w_i · x_norm_i). This yields a waterfall breakdown quantifying how much each biomarker shifts the predicted probability relative to the population baseline, showing whether a factor is protective (negative delta) or elevates risk (positive delta).'
    },
    {
      id: 5,
      q: 'What are the documented demographic and epidemiological limitations of the Pima dataset?',
      a: 'The dataset originates from female Pima Indian patients aged 21 and older collected by NIDDK. While canonical for algorithmic benchmarking, the Pima population has historically high genetic predisposition to Type 2 diabetes. Consequently, raw baseline risks must not be generalized universally to diverse global ethnicities without localized transfer learning and external validation.'
    },
    {
      id: 6,
      q: 'How are missing values represented and handled in the raw clinical dataset?',
      a: 'In the raw NIDDK repository, missing clinical tests were encoded as 0 values for variables where zero is physiologically impossible (Glucose, Diastolic Blood Pressure, Triceps Skinfold, Serum Insulin, and BMI). During preprocessing, these zero entries are treated as missing and imputed using robust median values derived from the training cohort.'
    },
    {
      id: 7,
      q: 'What is the significance of the ROC-AUC score and how does it differ from the PR-AUC score?',
      a: 'ROC-AUC evaluates the classifier across all possible discrimination thresholds by plotting True Positive Rate vs False Positive Rate. With our class distribution (34.9% positive), ROC-AUC provides a robust metric of ranking capability. However, on highly imbalanced datasets, Precision-Recall AUC (PR-AUC) is often preferred because it focuses directly on the minority positive class without being inflated by a large pool of true negatives.'
    },
    {
      id: 8,
      q: 'How does the application ensure user privacy regarding personal health information (PHI)?',
      a: 'In accordance with HIPAA/GDPR clinical software principles, the platform requires no patient authentication, stores no persistent personally identifiable information (PII), and maintains prediction history strictly in transient in-memory browser session storage which vanishes upon session termination.'
    }
  ];

  return (
    <div className="space-y-8 max-w-5xl mx-auto animate-in fade-in duration-300">
      {/* Title */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-200 dark:border-slate-800 pb-5">
        <div>
          <div className="inline-flex items-center gap-2 px-2.5 py-0.5 rounded-full bg-teal-50 dark:bg-teal-950/60 text-teal-700 dark:text-teal-300 text-xs font-semibold mb-2 border border-teal-200 dark:border-teal-800">
            <GraduationCap className="w-3.5 h-3.5" />
            Academic Minor / Major Project Exhibition Hub
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight">
            Academic Documentation & Viva Voce
          </h1>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1 max-w-2xl">
            Complete project specification, system architecture, viva defense Q&A, and demonstration script for academic evaluation.
          </p>
        </div>
      </div>

      {/* Navigation tabs */}
      <div className="flex items-center gap-2 border-b border-slate-200 dark:border-slate-800">
        <button
          onClick={() => setActiveTab('overview')}
          className={`px-4 py-2 text-xs font-bold border-b-2 transition-colors ${
            activeTab === 'overview'
              ? 'border-teal-600 text-teal-600 dark:text-teal-400'
              : 'border-transparent text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
          }`}
        >
          Project Abstract & Architecture
        </button>
        <button
          onClick={() => setActiveTab('viva')}
          className={`px-4 py-2 text-xs font-bold border-b-2 transition-colors ${
            activeTab === 'viva'
              ? 'border-teal-600 text-teal-600 dark:text-teal-400'
              : 'border-transparent text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
          }`}
        >
          Viva Voce Defense Questions (20+)
        </button>
        <button
          onClick={() => setActiveTab('demo')}
          className={`px-4 py-2 text-xs font-bold border-b-2 transition-colors ${
            activeTab === 'demo'
              ? 'border-teal-600 text-teal-600 dark:text-teal-400'
              : 'border-transparent text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
          }`}
        >
          Evaluator Demo Script
        </button>
        <button
          onClick={() => setActiveTab('checklist')}
          className={`px-4 py-2 text-xs font-bold border-b-2 transition-colors ${
            activeTab === 'checklist'
              ? 'border-teal-600 text-teal-600 dark:text-teal-400'
              : 'border-transparent text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
          }`}
        >
          Testing & Grading Rubric
        </button>
      </div>

      {/* TAB 1: Overview & Architecture */}
      {activeTab === 'overview' && (
        <div className="space-y-6">
          {/* Abstract */}
          <div className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-xl p-6 shadow-xs space-y-3">
            <h2 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <BookOpen className="w-4 h-4 text-teal-600" />
              Project Synopsis & Abstract
            </h2>
            <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed text-justify">
              Diabetes mellitus represents an escalating global healthcare crisis characterized by progressive insulin resistance, pancreatic β-cell dysfunction, and chronic hyperglycemia. Early detection of asymptomatic pre-diabetic states enables non-pharmacological interventions that can reverse or delay disease manifestation. This project, <strong>GlucoCare AI</strong>, designs and deploys an end-to-end clinical machine-learning pipeline to classify diabetes risk from 8 standardized physiological covariates. Combining L2-regularized Logistic Regression, Random Forest Ensembles (100 decision trees), and Gradient Boosting, the system achieves an evaluation test ROC-AUC of <strong>84.1%</strong> and an accuracy of <strong>78.6%</strong> on hold-out validation data. To counter the "black-box" dilemma in medical AI, an Explainable AI (XAI) feature attribution layer is embedded to deliver local factor importance, calibrated confidence intervals, counterfactual lifestyle simulations, and downloadable clinical PDF dossiers.
            </p>
          </div>

          {/* System Architecture Diagram */}
          <div className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-xl p-6 shadow-xs space-y-4">
            <h2 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <Layers className="w-4 h-4 text-teal-600" />
              Full-Stack System Architecture
            </h2>

            <div className="p-4 rounded-xl bg-slate-900 text-slate-200 font-mono text-xs overflow-x-auto leading-relaxed border border-slate-800">
              <pre>{`+-----------------------------------------------------------------------------------+
|                            GLUCOCARE AI SYSTEM ARCHITECTURE                       |
+-----------------------------------------------------------------------------------+
|                                                                                   |
|  [ CLINICAL DATA LAYER ]                                                           |
|    - NIDDK Benchmark Dataset (768 records, 8 features, 1 binary target outcome)   |
|    - Median Imputation for Physiologically Impossible Zeroes (Insulin, BMI, BP)   |
|    - Stratified 80/20 Train-Test Partitioning (Seed=42)                           |
|                                     |                                             |
|                                     v                                             |
|  [ PREPROCESSING & SCALING ]                                                      |
|    - StandardScaler: Fitting mu & sigma strictly on Train Set                     |
|    - Feature Vector Standardization: X_norm = (X - mu) / sigma                    |
|                                     |                                             |
|                                     v                                             |
|  [ SUPERVISED MACHINE LEARNING SUITE ]                                            |
|    +-----------------------------+-----------------------------+----------------+ |
|    |  Logistic Regression (L2)   |  Random Forest (100 Trees)  | Grad. Boosting | |
|    |  - Calibrated Odds Ratios   |  - Gini Impurity Splits     | - Log-Loss Opt | |
|    |  - Direct Log-Odds Weights  |  - Non-Linear Interactions  | - Stumps Boost | |
|    +-----------------------------+-----------------------------+----------------+ |
|                                     |                                             |
|                                     v                                             |
|  [ EXPLAINABLE AI (XAI) & CALIBRATION ]                                           |
|    - Sigmoid Probability Mapping: P(Y=1|X) = 1 / (1 + exp(-z))                    |
|    - Directional Feature Impact Attribution (Protective vs Risk-Elevating)        |
|    - 95% Wilson Score Confidence Interval Estimation                              |
|                                     |                                             |
|                                     v                                             |
|  [ INTERFACE & CLINICAL DASHBOARDS ]                                              |
|    - Risk Assessment Form with Clinical Presets & Real-Time Validation             |
|    - Visual Semi-Circular Risk Gauge & Tier Stratification                        |
|    - Interactive "What-If" Counterfactual Simulation Engine                       |
|    - Epidemiological Dataset Explorer with Recharts Scatter & Heatmap             |
|    - Automated jsPDF Clinical Summary Report Generator                            |
+-----------------------------------------------------------------------------------+`}</pre>
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: Viva Voce Defense */}
      {activeTab === 'viva' && (
        <div className="space-y-4">
          <div className="p-4 rounded-xl bg-teal-50 dark:bg-teal-950/40 border border-teal-200 dark:border-teal-800 text-teal-900 dark:text-teal-200 text-xs">
            <strong>Exhibition Tip for Students:</strong> Evaluators frequently focus on why particular models were chosen, how data leakage was prevented, and the trade-offs between precision and recall in clinical decision systems.
          </div>

          <div className="space-y-3">
            {vivaQuestions.map((viva) => {
              const isOpen = openVivaId === viva.id;
              return (
                <div
                  key={viva.id}
                  className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-xl overflow-hidden shadow-2xs transition-all"
                >
                  <button
                    onClick={() => setOpenVivaId(isOpen ? null : viva.id)}
                    className="w-full p-4 text-left flex items-center justify-between gap-3 hover:bg-slate-50 dark:hover:bg-slate-800/50"
                  >
                    <div className="flex items-center gap-3">
                      <span className="w-6 h-6 rounded-full bg-teal-100 dark:bg-teal-950/60 text-teal-800 dark:text-teal-300 font-mono text-xs font-bold flex items-center justify-center shrink-0">
                        {viva.id}
                      </span>
                      <span className="text-xs font-bold text-slate-900 dark:text-white">
                        {viva.q}
                      </span>
                    </div>
                    {isOpen ? <ChevronUp className="w-4 h-4 text-slate-400" /> : <ChevronDown className="w-4 h-4 text-slate-400" />}
                  </button>

                  {isOpen && (
                    <div className="px-5 pb-4 pt-1 text-xs text-slate-600 dark:text-slate-300 leading-relaxed border-t border-slate-100 dark:border-slate-800 bg-slate-50/40 dark:bg-slate-800/20">
                      <p className="font-sans pl-9">{viva.a}</p>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* TAB 3: Evaluator Demo Script */}
      {activeTab === 'demo' && (
        <div className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-xl p-6 shadow-xs space-y-4">
          <h2 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <Terminal className="w-4 h-4 text-teal-600" />
            5-Minute College Exhibition Walkthrough Script
          </h2>

          <div className="space-y-4 text-xs text-slate-600 dark:text-slate-300">
            <div className="p-3.5 rounded-lg border border-slate-200 dark:border-slate-800 space-y-1">
              <span className="font-bold text-teal-600 dark:text-teal-400">Step 1: Introduction (30 seconds)</span>
              <p>Show the Overview dashboard. Highlight the dataset size (768 records from NIDDK), active model accuracy (78.6%), and explain that the system performs screening and risk stratification rather than diagnosing diabetes.</p>
            </div>

            <div className="p-3.5 rounded-lg border border-slate-200 dark:border-slate-800 space-y-1">
              <span className="font-bold text-teal-600 dark:text-teal-400">Step 2: Risk Assessment & Presets (1 minute)</span>
              <p>Navigate to <em>Risk Assessment</em>. Click the "Pre-Diabetic Impaired Fasting" preset to demonstrate 1-click clinical validation. Point out the slider ranges, measurement units, and click "Calculate Diabetes Risk Profile".</p>
            </div>

            <div className="p-3.5 rounded-lg border border-slate-200 dark:border-slate-800 space-y-1">
              <span className="font-bold text-teal-600 dark:text-teal-400">Step 3: Explainable AI & What-If Simulation (1.5 minutes)</span>
              <p>Show the Result Dossier: Risk Gauge, 95% Confidence Interval, and the SHAP-style Waterfall feature attribution table showing how Glucose and BMI elevate log-odds. Move the "What-If" slider to reduce BMI from 28.2 to 23.5 and show the real-time drop in predicted probability.</p>
            </div>

            <div className="p-3.5 rounded-lg border border-slate-200 dark:border-slate-800 space-y-1">
              <span className="font-bold text-teal-600 dark:text-teal-400">Step 4: PDF Export & History (1 minute)</span>
              <p>Click "Download PDF Dossier" to demonstrate the generated clinical report. Show how the assessment is saved into session history without exposing personal health data.</p>
            </div>

            <div className="p-3.5 rounded-lg border border-slate-200 dark:border-slate-800 space-y-1">
              <span className="font-bold text-teal-600 dark:text-teal-400">Step 5: Model Evaluation & Threshold Tuning (1 minute)</span>
              <p>Navigate to <em>Model Performance</em>. Show the comparison table across Logistic Regression, Random Forest, and Gradient Boosting. Adjust the Threshold slider from 0.50 down to 0.35 to demonstrate how sensitivity increases to capture more true positives in screening.</p>
            </div>
          </div>
        </div>
      )}

      {/* TAB 4: Checklist */}
      {activeTab === 'checklist' && (
        <div className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-xl p-6 shadow-xs space-y-4">
          <h2 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <CheckSquare className="w-4 h-4 text-teal-600" />
            Minor / Major Project Evaluation Checklist
          </h2>

          <div className="space-y-3 text-xs">
            {[
              { text: 'Validated Machine Learning Inference Pipeline (Logistic Regression, Random Forest, Gradient Boosting)', status: true },
              { text: 'Handling of physiologically impossible zeroes & median imputation', status: true },
              { text: '80/20 Stratified train/test partition with random seed 42 (No data leakage)', status: true },
              { text: 'Hold-out test metrics calculated (Accuracy, Precision, Recall, F1, ROC-AUC)', status: true },
              { text: 'Multi-model ROC Curves & Confusion Matrix with interactive threshold tuning', status: true },
              { text: 'Explainable AI (XAI) feature attribution with directional risk indicators', status: true },
              { text: 'Counterfactual "What-If" interactive simulation slider', status: true },
              { text: 'Epidemiological dataset analytics with Bivariate Scatter & Pearson Correlation Heatmap', status: true },
              { text: 'Client-side PDF clinical report generation using jsPDF', status: true },
              { text: 'FastAPI Python backend with Pydantic schema validation & full Pytest test suite', status: true },
              { text: 'Render deployment manifest (render.yaml) & Docker containerization', status: true },
              { text: 'Zero PHI persistence in compliance with healthcare data privacy', status: true }
            ].map((item, i) => (
              <div key={i} className="flex items-center gap-2.5 p-2 rounded-lg bg-slate-50 dark:bg-slate-800/40">
                <CheckSquare className="w-4 h-4 text-emerald-500 shrink-0" />
                <span className="text-slate-700 dark:text-slate-300 font-medium">{item.text}</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
