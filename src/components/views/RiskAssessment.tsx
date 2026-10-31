import React, { useState } from 'react';
import {
  Stethoscope,
  Sparkles,
  RotateCcw,
  Info,
  Cpu,
  CheckCircle2,
  AlertCircle,
  HelpCircle,
  Activity,
  Heart,
  Dna,
  Flame,
  Weight
} from 'lucide-react';
import { HealthMeasurements, ModelType, PredictionOutput } from '../../types/diabetes';
import { predictRisk } from '../../services/apiClient';

interface RiskAssessmentProps {
  onPredictionComplete: (prediction: PredictionOutput) => void;
  selectedModelType: ModelType;
  onChangeModelType: (type: ModelType) => void;
}

export const RiskAssessment: React.FC<RiskAssessmentProps> = ({
  onPredictionComplete,
  selectedModelType,
  onChangeModelType
}) => {
  // Form State
  const [formData, setFormData] = useState<HealthMeasurements>({
    glucose: 110,
    bmi: 26.5,
    age: 38,
    blood_pressure: 74,
    diabetes_pedigree: 0.45,
    insulin: 90,
    pregnancies: 1,
    skin_thickness: 24
  });

  const [isLoading, setIsLoading] = useState(false);
  const [loadingStep, setLoadingStep] = useState('');
  const [error, setError] = useState<string | null>(null);

  // Preset profiles for instant evaluator testing
  const presets = [
    {
      name: 'Healthy Adult Profile',
      tag: 'Low Risk Baseline',
      desc: 'Optimal fasting glucose, normal BMI, low genetic pedigree',
      color: 'border-emerald-300 dark:border-emerald-800 bg-emerald-50/50 dark:bg-emerald-950/20 text-emerald-800 dark:text-emerald-300',
      data: {
        glucose: 88,
        bmi: 22.4,
        age: 28,
        blood_pressure: 68,
        diabetes_pedigree: 0.18,
        insulin: 65,
        pregnancies: 0,
        skin_thickness: 18
      }
    },
    {
      name: 'Pre-Diabetic Impaired Fasting',
      tag: 'Borderline Profile',
      desc: 'Slightly elevated glucose (118 mg/dL) & overweight BMI (28.2)',
      color: 'border-amber-300 dark:border-amber-800 bg-amber-50/50 dark:bg-amber-950/20 text-amber-800 dark:text-amber-300',
      data: {
        glucose: 118,
        bmi: 28.2,
        age: 44,
        blood_pressure: 78,
        diabetes_pedigree: 0.45,
        insulin: 115,
        pregnancies: 2,
        skin_thickness: 26
      }
    },
    {
      name: 'Elevated Glycemic Risk',
      tag: 'Elevated Profile',
      desc: 'Fasting glucose 156 mg/dL, class I obesity, family history',
      color: 'border-orange-300 dark:border-orange-800 bg-orange-50/50 dark:bg-orange-950/20 text-orange-800 dark:text-orange-300',
      data: {
        glucose: 156,
        bmi: 34.5,
        age: 51,
        blood_pressure: 84,
        diabetes_pedigree: 0.72,
        insulin: 180,
        pregnancies: 3,
        skin_thickness: 33
      }
    },
    {
      name: 'Metabolic Syndrome Profile',
      tag: 'High Risk Profile',
      desc: 'Severe hyperglycemia (184 mg/dL), BMI 38.6, hypertension',
      color: 'border-rose-300 dark:border-rose-800 bg-rose-50/50 dark:bg-rose-950/20 text-rose-800 dark:text-rose-300',
      data: {
        glucose: 184,
        bmi: 38.6,
        age: 57,
        blood_pressure: 92,
        diabetes_pedigree: 1.15,
        insulin: 245,
        pregnancies: 4,
        skin_thickness: 42
      }
    }
  ];

  const handleApplyPreset = (presetData: HealthMeasurements) => {
    setFormData(presetData);
    setError(null);
  };

  const handleInputChange = (field: keyof HealthMeasurements, value: number) => {
    setFormData((prev) => ({
      ...prev,
      [field]: isNaN(value) ? 0 : value
    }));
    setError(null);
  };

  const handleReset = () => {
    setFormData({
      glucose: 100,
      bmi: 25.0,
      age: 35,
      blood_pressure: 72,
      diabetes_pedigree: 0.35,
      insulin: 85,
      pregnancies: 1,
      skin_thickness: 22
    });
    setError(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validation
    if (formData.glucose < 40 || formData.glucose > 350) {
      setError('Glucose level must be clinically plausible (between 40 and 350 mg/dL).');
      return;
    }
    if (formData.bmi < 12 || formData.bmi > 70) {
      setError('BMI must be within plausible physiological range (12 to 70 kg/m²).');
      return;
    }
    if (formData.blood_pressure < 30 || formData.blood_pressure > 180) {
      setError('Diastolic blood pressure must be between 30 and 180 mm Hg.');
      return;
    }
    if (formData.age < 18 || formData.age > 105) {
      setError('Patient age must be between 18 and 105 years.');
      return;
    }

    setIsLoading(true);
    setLoadingStep('Standardizing physiological covariates via training scalers...');

    try {
      await new Promise((r) => setTimeout(r, 250));
      setLoadingStep('Evaluating decision paths and feature split boundaries...');
      await new Promise((r) => setTimeout(r, 250));
      setLoadingStep('Computing calibrated probability & feature attribution (XAI)...');
      await new Promise((r) => setTimeout(r, 200));

      const prediction = await predictRisk(formData, selectedModelType);
      onPredictionComplete(prediction);
    } catch (err: any) {
      setError(err?.message || 'Inference execution failed. Please verify input parameters.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-8 max-w-5xl mx-auto animate-in fade-in duration-300">
      {/* Header section */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-200 dark:border-slate-800 pb-5">
        <div>
          <div className="inline-flex items-center gap-2 px-2.5 py-0.5 rounded-full bg-teal-50 dark:bg-teal-950/60 text-teal-700 dark:text-teal-300 text-xs font-semibold mb-2 border border-teal-200 dark:border-teal-800">
            <Stethoscope className="w-3.5 h-3.5" />
            Clinical Inference Module
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight">
            Diabetes Risk Assessment
          </h1>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1 max-w-2xl">
            Input standardized biomedical measurements to receive an interpretable machine-learning risk evaluation, confidence interval, and factor breakdown.
          </p>
        </div>

        {/* Model Selector Pill */}
        <div className="flex items-center gap-2 bg-white dark:bg-slate-900 p-1.5 rounded-xl border border-slate-200 dark:border-slate-800 shadow-2xs">
          <Cpu className="w-4 h-4 text-teal-600 dark:text-teal-400 ml-2" />
          <span className="text-xs font-semibold text-slate-500 dark:text-slate-400 mr-1 hidden sm:inline">Model:</span>
          <select
            value={selectedModelType}
            onChange={(e) => onChangeModelType(e.target.value as ModelType)}
            className="text-xs font-semibold bg-slate-50 dark:bg-slate-800 text-slate-800 dark:text-slate-200 px-3 py-1.5 rounded-lg border-0 focus:ring-2 focus:ring-teal-500 cursor-pointer"
          >
            <option value="random_forest">Random Forest (Recommended)</option>
            <option value="logistic_regression">Logistic Regression (L2 Regularized)</option>
            <option value="gradient_boosting">Gradient Boosting Classifier</option>
          </select>
        </div>
      </div>

      {/* Preset Profiles Bar */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <span className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 flex items-center gap-1.5">
            <Sparkles className="w-3.5 h-3.5 text-teal-600 dark:text-teal-400" />
            Exhibition Demo Presets (1-Click Evaluator Testing)
          </span>
          <span className="text-[11px] text-slate-400">Click any preset to pre-fill validated clinical figures</span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          {presets.map((preset, idx) => (
            <button
              key={idx}
              type="button"
              onClick={() => handleApplyPreset(preset.data)}
              className={`text-left p-3.5 rounded-xl border transition-all hover:scale-[1.01] active:scale-[0.99] shadow-2xs ${preset.color}`}
            >
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold">{preset.name}</span>
                <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-white/70 dark:bg-black/30 font-semibold">
                  {preset.tag}
                </span>
              </div>
              <p className="text-[11px] mt-1.5 opacity-90 line-clamp-2 leading-relaxed">
                {preset.desc}
              </p>
            </button>
          ))}
        </div>
      </div>

      {/* Error alert if any */}
      {error && (
        <div className="p-4 rounded-xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-800 text-rose-800 dark:text-rose-200 flex items-start gap-3 text-xs">
          <AlertCircle className="w-5 h-5 shrink-0 mt-0.5" />
          <div>
            <span className="font-bold">Validation Error:</span> {error}
          </div>
        </div>
      )}

      {/* Main Assessment Form */}
      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Section 1: Primary Glycemic & Metabolic Biomarkers */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-xl p-5 sm:p-6 shadow-xs">
          <div className="flex items-center gap-2 mb-4 pb-3 border-b border-slate-100 dark:border-slate-800">
            <Activity className="w-5 h-5 text-teal-600 dark:text-teal-400" />
            <div>
              <h2 className="text-base font-bold text-slate-900 dark:text-white">Primary Glycemic & Metabolic Biomarkers</h2>
              <p className="text-xs text-slate-500 dark:text-slate-400">Core diagnostic variables with highest feature weight</p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {/* Plasma Glucose */}
            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <label className="text-xs font-bold text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
                  <span>Blood Glucose Concentration</span>
                  <span className="text-[11px] font-normal text-slate-400">(Fasting / 2hr)</span>
                </label>
                <span className="text-xs font-mono font-bold text-teal-600 dark:text-teal-400">
                  {formData.glucose} <span className="text-[10px] font-normal text-slate-400">mg/dL</span>
                </span>
              </div>
              <input
                type="range"
                min="50"
                max="250"
                step="1"
                value={formData.glucose}
                onChange={(e) => handleInputChange('glucose', parseFloat(e.target.value))}
                className="w-full accent-teal-600 cursor-pointer"
              />
              <div className="flex justify-between items-center text-[10px] text-slate-400 font-mono">
                <span>Normal (&lt;100)</span>
                <span>Prediabetes (100–125)</span>
                <span>Elevated (≥126)</span>
              </div>
            </div>

            {/* BMI */}
            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <label className="text-xs font-bold text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
                  <Weight className="w-3.5 h-3.5 text-slate-400" />
                  <span>Body Mass Index (BMI)</span>
                </label>
                <span className="text-xs font-mono font-bold text-teal-600 dark:text-teal-400">
                  {formData.bmi.toFixed(1)} <span className="text-[10px] font-normal text-slate-400">kg/m²</span>
                </span>
              </div>
              <input
                type="range"
                min="16.0"
                max="50.0"
                step="0.1"
                value={formData.bmi}
                onChange={(e) => handleInputChange('bmi', parseFloat(e.target.value))}
                className="w-full accent-teal-600 cursor-pointer"
              />
              <div className="flex justify-between items-center text-[10px] text-slate-400 font-mono">
                <span>Normal (18.5–24.9)</span>
                <span>Overweight (25–29.9)</span>
                <span>Obesity (≥30)</span>
              </div>
            </div>

            {/* Patient Age */}
            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <label className="text-xs font-bold text-slate-700 dark:text-slate-300">
                  Patient Age
                </label>
                <span className="text-xs font-mono font-bold text-teal-600 dark:text-teal-400">
                  {formData.age} <span className="text-[10px] font-normal text-slate-400">years</span>
                </span>
              </div>
              <input
                type="range"
                min="21"
                max="81"
                step="1"
                value={formData.age}
                onChange={(e) => handleInputChange('age', parseInt(e.target.value, 10))}
                className="w-full accent-teal-600 cursor-pointer"
              />
              <div className="flex justify-between items-center text-[10px] text-slate-400 font-mono">
                <span>Young Adult (21–35)</span>
                <span>Middle Age (36–55)</span>
                <span>Senior (56+)</span>
              </div>
            </div>

            {/* Diastolic Blood Pressure */}
            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <label className="text-xs font-bold text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
                  <Heart className="w-3.5 h-3.5 text-slate-400" />
                  <span>Diastolic Blood Pressure</span>
                </label>
                <span className="text-xs font-mono font-bold text-teal-600 dark:text-teal-400">
                  {formData.blood_pressure} <span className="text-[10px] font-normal text-slate-400">mm Hg</span>
                </span>
              </div>
              <input
                type="range"
                min="50"
                max="120"
                step="1"
                value={formData.blood_pressure}
                onChange={(e) => handleInputChange('blood_pressure', parseFloat(e.target.value))}
                className="w-full accent-teal-600 cursor-pointer"
              />
              <div className="flex justify-between items-center text-[10px] text-slate-400 font-mono">
                <span>Optimal (&lt;80)</span>
                <span>Pre-hypertension (80–89)</span>
                <span>Stage 1 (≥90)</span>
              </div>
            </div>
          </div>
        </div>

        {/* Section 2: Clinical Lab & Hereditary Predictors */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-xl p-5 sm:p-6 shadow-xs">
          <div className="flex items-center gap-2 mb-4 pb-3 border-b border-slate-100 dark:border-slate-800">
            <Dna className="w-5 h-5 text-teal-600 dark:text-teal-400" />
            <div>
              <h2 className="text-base font-bold text-slate-900 dark:text-white">Genetic Susceptibility & Secondary Markers</h2>
              <p className="text-xs text-slate-500 dark:text-slate-400">Familial pedigree, serum insulin, and anatomical covariates</p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {/* Diabetes Pedigree Function */}
            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <label className="text-xs font-bold text-slate-700 dark:text-slate-300 flex items-center gap-1">
                  <span>Diabetes Pedigree Function</span>
                  <span title="Scored index based on family history and genetic closeness" className="cursor-help text-slate-400">
                    <HelpCircle className="w-3.5 h-3.5" />
                  </span>
                </label>
                <span className="text-xs font-mono font-bold text-teal-600 dark:text-teal-400">
                  {formData.diabetes_pedigree.toFixed(3)}
                </span>
              </div>
              <input
                type="range"
                min="0.08"
                max="2.40"
                step="0.01"
                value={formData.diabetes_pedigree}
                onChange={(e) => handleInputChange('diabetes_pedigree', parseFloat(e.target.value))}
                className="w-full accent-teal-600 cursor-pointer"
              />
              <div className="flex justify-between items-center text-[10px] text-slate-400 font-mono">
                <span>Low Familial (0.1–0.4)</span>
                <span>Moderate (0.4–0.8)</span>
                <span>High Hereditary (&gt;0.8)</span>
              </div>
            </div>

            {/* Serum Insulin */}
            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <label className="text-xs font-bold text-slate-700 dark:text-slate-300">
                  2-Hour Serum Insulin
                </label>
                <span className="text-xs font-mono font-bold text-teal-600 dark:text-teal-400">
                  {formData.insulin} <span className="text-[10px] font-normal text-slate-400">µU/mL</span>
                </span>
              </div>
              <input
                type="range"
                min="15"
                max="400"
                step="1"
                value={formData.insulin}
                onChange={(e) => handleInputChange('insulin', parseFloat(e.target.value))}
                className="w-full accent-teal-600 cursor-pointer"
              />
              <div className="flex justify-between items-center text-[10px] text-slate-400 font-mono">
                <span>Normal (16–166 µU/mL)</span>
                <span>Hyperinsulinemic (&gt;166)</span>
              </div>
            </div>

            {/* Pregnancies */}
            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <label className="text-xs font-bold text-slate-700 dark:text-slate-300">
                  Total Pregnancies
                </label>
                <span className="text-xs font-mono font-bold text-teal-600 dark:text-teal-400">
                  {formData.pregnancies}
                </span>
              </div>
              <input
                type="range"
                min="0"
                max="15"
                step="1"
                value={formData.pregnancies}
                onChange={(e) => handleInputChange('pregnancies', parseInt(e.target.value, 10))}
                className="w-full accent-teal-600 cursor-pointer"
              />
              <div className="flex justify-between items-center text-[10px] text-slate-400 font-mono">
                <span>0</span>
                <span>5</span>
                <span>10+</span>
              </div>
            </div>

            {/* Triceps Skinfold */}
            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <label className="text-xs font-bold text-slate-700 dark:text-slate-300">
                  Triceps Skinfold Thickness
                </label>
                <span className="text-xs font-mono font-bold text-teal-600 dark:text-teal-400">
                  {formData.skin_thickness} <span className="text-[10px] font-normal text-slate-400">mm</span>
                </span>
              </div>
              <input
                type="range"
                min="10"
                max="60"
                step="1"
                value={formData.skin_thickness}
                onChange={(e) => handleInputChange('skin_thickness', parseFloat(e.target.value))}
                className="w-full accent-teal-600 cursor-pointer"
              />
              <div className="flex justify-between items-center text-[10px] text-slate-400 font-mono">
                <span>Standard (10–25 mm)</span>
                <span>Elevated Subcutaneous Adiposity (&gt;25 mm)</span>
              </div>
            </div>
          </div>
        </div>

        {/* Action Controls & Loading */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-2">
          <button
            type="button"
            onClick={handleReset}
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 text-xs font-semibold transition-colors"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Reset Baseline</span>
          </button>

          <button
            type="submit"
            disabled={isLoading}
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-8 py-3 rounded-xl bg-teal-600 hover:bg-teal-500 text-white font-bold text-sm shadow-md hover:shadow-lg disabled:opacity-50 transition-all active:scale-95"
          >
            {isLoading ? (
              <>
                <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                <span>Executing ML Inference...</span>
              </>
            ) : (
              <>
                <Stethoscope className="w-4 h-4" />
                <span>Calculate Diabetes Risk Profile</span>
              </>
            )}
          </button>
        </div>

        {/* Loading Progress State */}
        {isLoading && (
          <div className="p-4 rounded-xl bg-teal-50 dark:bg-teal-950/40 border border-teal-200 dark:border-teal-800 text-teal-900 dark:text-teal-200 text-xs flex items-center gap-3 animate-pulse">
            <Activity className="w-4 h-4 text-teal-600 animate-spin" />
            <span className="font-mono">{loadingStep}</span>
          </div>
        )}
      </form>
    </div>
  );
};
