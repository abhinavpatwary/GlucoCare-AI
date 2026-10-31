import React, { useState } from 'react';
import {
  Download,
  ArrowLeft,
  AlertTriangle,
  CheckCircle2,
  Sliders,
  Sparkles,
  Info,
  Clock,
  Cpu,
  BookmarkCheck,
  ShieldAlert,
  ChevronRight,
  TrendingDown,
  TrendingUp,
  FileCheck
} from 'lucide-react';
import { PredictionOutput, HealthMeasurements } from '../../types/diabetes';
import { RiskGauge } from '../RiskGauge';
import { generatePredictionPdf } from '../../services/pdfGenerator';
import { runInference } from '../../ml/inferenceEngine';

interface PredictionResultProps {
  prediction: PredictionOutput;
  onBackToAssessment: () => void;
  onSaveToHistory: (prediction: PredictionOutput) => void;
  isSaved?: boolean;
}

export const PredictionResult: React.FC<PredictionResultProps> = ({
  prediction,
  onBackToAssessment,
  onSaveToHistory,
  isSaved = false
}) => {
  const [downloading, setDownloading] = useState(false);
  const [savedSuccess, setSavedSuccess] = useState(isSaved);

  // "What-If" counterfactual simulation state
  const [simulatedInputs, setSimulatedInputs] = useState<HealthMeasurements>({ ...prediction.inputs });
  const [simulatedResult, setSimulatedResult] = useState<PredictionOutput | null>(null);
  const [whatIfActive, setWhatIfActive] = useState(false);

  const handleDownloadPdf = () => {
    setDownloading(true);
    try {
      generatePredictionPdf(whatIfActive && simulatedResult ? simulatedResult : prediction);
    } catch (err) {
      console.error('PDF generation error', err);
    } finally {
      setDownloading(false);
    }
  };

  const handleSave = () => {
    onSaveToHistory(prediction);
    setSavedSuccess(true);
  };

  // Re-run inference when counterfactual inputs change
  const handleSimulateChange = (field: keyof HealthMeasurements, val: number) => {
    const updated = { ...simulatedInputs, [field]: val };
    setSimulatedInputs(updated);
    setWhatIfActive(true);
    const newPred = runInference(updated, prediction.modelType);
    setSimulatedResult(newPred);
  };

  const activePred = whatIfActive && simulatedResult ? simulatedResult : prediction;
  const isHighRisk = activePred.predictedClass === 1;

  return (
    <div className="space-y-8 max-w-5xl mx-auto animate-in fade-in duration-300">
      {/* Top action bar */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-slate-200 dark:border-slate-800 pb-4">
        <button
          onClick={onBackToAssessment}
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-600 dark:text-slate-400 hover:text-teal-600 dark:hover:text-teal-400 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Assessment Inputs</span>
        </button>

        <div className="flex items-center gap-2 w-full sm:w-auto">
          <button
            onClick={handleSave}
            disabled={savedSuccess}
            className={`flex-1 sm:flex-initial inline-flex items-center justify-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-semibold border transition-all ${
              savedSuccess
                ? 'bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 border-emerald-300 dark:border-emerald-800'
                : 'bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-300 border-slate-300 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800'
            }`}
          >
            {savedSuccess ? (
              <>
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
                <span>Saved to Session</span>
              </>
            ) : (
              <>
                <BookmarkCheck className="w-3.5 h-3.5 text-teal-600 dark:text-teal-400" />
                <span>Save to History</span>
              </>
            )}
          </button>

          <button
            onClick={handleDownloadPdf}
            disabled={downloading}
            className="flex-1 sm:flex-initial inline-flex items-center justify-center gap-2 px-4 py-2 rounded-xl bg-teal-600 hover:bg-teal-500 text-white text-xs font-bold transition-all shadow-xs active:scale-95"
          >
            <Download className="w-3.5 h-3.5" />
            <span>{downloading ? 'Generating Report...' : 'Download PDF Dossier'}</span>
          </button>
        </div>
      </div>

      {/* Main Classification Hero Card */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-2xl p-6 sm:p-8 shadow-sm">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
          {/* Left Column: Visual Risk Gauge */}
          <div className="lg:col-span-5 flex flex-col items-center justify-center border-b lg:border-b-0 lg:border-r border-slate-100 dark:border-slate-800 pb-6 lg:pb-0 lg:pr-8">
            <RiskGauge score={activePred.riskScore} tier={activePred.riskTier} size={230} />

            <div className="mt-4 text-center">
              <span className="text-xs text-slate-400 font-mono">
                Model Probability: {(activePred.calibratedProbability * 100).toFixed(1)}%
              </span>
              <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">
                95% Confidence Interval: [{(activePred.confidenceInterval[0] * 100).toFixed(0)}% – {(activePred.confidenceInterval[1] * 100).toFixed(0)}%]
              </p>
            </div>
          </div>

          {/* Right Column: Clinical Classification & Model Provenance */}
          <div className="lg:col-span-7 space-y-4">
            <div className="flex flex-wrap items-center gap-2">
              <span
                className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider ${
                  isHighRisk
                    ? 'bg-rose-50 text-rose-700 border border-rose-200 dark:bg-rose-950/40 dark:text-rose-400 dark:border-rose-800'
                    : 'bg-teal-50 text-teal-700 border border-teal-200 dark:bg-teal-950/40 dark:text-teal-400 dark:border-teal-800'
                }`}
              >
                {isHighRisk ? <ShieldAlert className="w-3.5 h-3.5 text-rose-600" /> : <CheckCircle2 className="w-3.5 h-3.5 text-teal-600" />}
                {activePred.classificationLabel}
              </span>

              <span className="text-xs text-slate-500 dark:text-slate-400 font-medium flex items-center gap-1">
                <Clock className="w-3.5 h-3.5" />
                {new Date(activePred.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
              </span>
            </div>

            <h2 className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-white leading-snug">
              {isHighRisk
                ? 'Elevated diabetes risk classification indicated by predictive model.'
                : 'Lower risk classification indicated based on current biomarkers.'}
            </h2>

            <p className="text-sm text-slate-600 dark:text-slate-300 leading-relaxed">
              {activePred.clinicalSummary}
            </p>

            <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/70 dark:border-slate-800 text-xs space-y-1.5">
              <div className="flex items-center justify-between text-slate-600 dark:text-slate-400">
                <span className="font-semibold flex items-center gap-1">
                  <Cpu className="w-3.5 h-3.5 text-teal-600" />
                  Algorithm:
                </span>
                <span className="font-mono font-medium text-slate-900 dark:text-slate-200">{activePred.modelName}</span>
              </div>
              <div className="flex items-center justify-between text-slate-600 dark:text-slate-400">
                <span className="font-semibold">Dataset Provenance:</span>
                <span className="font-medium">NIDDK (UCI Machine Learning Repository)</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Explainable AI: Feature Attribution Waterfall */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-xl p-6 shadow-xs space-y-5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-100 dark:border-slate-800 pb-3">
          <div>
            <h3 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-teal-600 dark:text-teal-400" />
              Explainable AI: Feature Attribution (SHAP-Style Impact Breakdown)
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Directional impact of each patient biomarker on the model's log-odds risk estimate
            </p>
          </div>
          <div className="flex items-center gap-3 text-xs">
            <span className="flex items-center gap-1.5 text-rose-600 dark:text-rose-400 font-medium">
              <span className="w-2.5 h-2.5 rounded-sm bg-rose-500"></span>
              Elevates Risk
            </span>
            <span className="flex items-center gap-1.5 text-teal-600 dark:text-teal-400 font-medium">
              <span className="w-2.5 h-2.5 rounded-sm bg-teal-500"></span>
              Protective Factor
            </span>
          </div>
        </div>

        <div className="space-y-4">
          {activePred.featureImpacts.map((fi, idx) => {
            const isRisk = fi.contribution > 0;
            return (
              <div key={idx} className="p-3.5 rounded-xl bg-slate-50/60 dark:bg-slate-800/40 border border-slate-200/70 dark:border-slate-800 transition-colors">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1 text-xs">
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-slate-900 dark:text-white">{fi.label}</span>
                    <span className="font-mono text-slate-500 dark:text-slate-400">
                      ({fi.value} {fi.unit})
                    </span>
                  </div>

                  <div className="flex items-center gap-3 font-mono">
                    <span className="text-[11px] text-slate-400 font-sans">Relative Weight: {fi.percentage}%</span>
                    <span
                      className={`font-bold px-2 py-0.5 rounded text-[11px] ${
                        isRisk
                          ? 'bg-rose-100 dark:bg-rose-950/60 text-rose-700 dark:text-rose-300'
                          : 'bg-teal-100 dark:bg-teal-950/60 text-teal-700 dark:text-teal-300'
                      }`}
                    >
                      {isRisk ? `+${fi.contribution} log-odds` : `${fi.contribution} log-odds`}
                    </span>
                  </div>
                </div>

                {/* Progress bar */}
                <div className="mt-2.5 w-full bg-slate-200 dark:bg-slate-700 h-2 rounded-full overflow-hidden">
                  <div
                    className={`h-full rounded-full transition-all duration-500 ${
                      isRisk ? 'bg-rose-500' : 'bg-teal-500'
                    }`}
                    style={{ width: `${Math.min(100, Math.max(8, fi.percentage * 2.2))}%` }}
                  />
                </div>

                <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-2 leading-relaxed">
                  {fi.description} <span className="text-slate-400 italic">Reference baseline: {fi.referenceNormal}.</span>
                </p>
              </div>
            );
          })}
        </div>
      </div>

      {/* Interactive "What-If" Counterfactual Simulation Module */}
      <div className="bg-gradient-to-br from-slate-900 to-teal-950 rounded-2xl p-6 sm:p-7 text-white shadow-md border border-slate-800 space-y-5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-800 pb-3">
          <div>
            <div className="inline-flex items-center gap-1.5 text-teal-400 text-xs font-bold uppercase tracking-wider mb-1">
              <Sliders className="w-3.5 h-3.5" />
              Counterfactual Risk Simulator
            </div>
            <h3 className="text-lg font-bold text-white">
              Simulate Lifestyle & Glycemic Changes ("What-If" Scenario)
            </h3>
            <p className="text-xs text-slate-300">
              Adjust modifiable factors like Glucose and BMI to observe their immediate mathematical effect on predicted risk score.
            </p>
          </div>

          {whatIfActive && (
            <button
              onClick={() => {
                setSimulatedInputs({ ...prediction.inputs });
                setWhatIfActive(false);
                setSimulatedResult(null);
              }}
              className="text-xs font-semibold px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700"
            >
              Reset to Original
            </button>
          )}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Fasting Glucose Slider */}
          <div className="space-y-2">
            <div className="flex justify-between text-xs">
              <span className="font-medium text-slate-200">Adjusted Fasting Glucose:</span>
              <span className="font-mono font-bold text-teal-300">
                {simulatedInputs.glucose} mg/dL
                {simulatedInputs.glucose !== prediction.inputs.glucose && (
                  <span className="text-[10px] ml-1.5 text-slate-400">
                    ({simulatedInputs.glucose > prediction.inputs.glucose ? '+' : ''}
                    {simulatedInputs.glucose - prediction.inputs.glucose})
                  </span>
                )}
              </span>
            </div>
            <input
              type="range"
              min="70"
              max="220"
              step="1"
              value={simulatedInputs.glucose}
              onChange={(e) => handleSimulateChange('glucose', parseFloat(e.target.value))}
              className="w-full accent-teal-400 cursor-pointer"
            />
          </div>

          {/* BMI Slider */}
          <div className="space-y-2">
            <div className="flex justify-between text-xs">
              <span className="font-medium text-slate-200">Adjusted BMI:</span>
              <span className="font-mono font-bold text-teal-300">
                {simulatedInputs.bmi.toFixed(1)} kg/m²
                {simulatedInputs.bmi !== prediction.inputs.bmi && (
                  <span className="text-[10px] ml-1.5 text-slate-400">
                    ({simulatedInputs.bmi > prediction.inputs.bmi ? '+' : ''}
                    {(simulatedInputs.bmi - prediction.inputs.bmi).toFixed(1)})
                  </span>
                )}
              </span>
            </div>
            <input
              type="range"
              min="18.5"
              max="45.0"
              step="0.2"
              value={simulatedInputs.bmi}
              onChange={(e) => handleSimulateChange('bmi', parseFloat(e.target.value))}
              className="w-full accent-teal-400 cursor-pointer"
            />
          </div>
        </div>

        {/* Counterfactual Delta Banner */}
        {whatIfActive && simulatedResult && (
          <div className="p-3.5 rounded-xl bg-slate-800/80 border border-slate-700/80 flex items-center justify-between text-xs">
            <div className="flex items-center gap-2">
              {simulatedResult.riskScore < prediction.riskScore ? (
                <TrendingDown className="w-4 h-4 text-emerald-400" />
              ) : (
                <TrendingUp className="w-4 h-4 text-rose-400" />
              )}
              <span>
                Risk Score Shift:{' '}
                <span className="font-mono font-bold text-slate-400 line-through mr-1">{prediction.riskScore}%</span>
                <span className="font-mono font-bold text-teal-300">→ {simulatedResult.riskScore}%</span>
                <span className="ml-2 font-semibold text-slate-300">({simulatedResult.riskTier})</span>
              </span>
            </div>
            <span className="text-[11px] text-teal-400 font-mono">
              Δ {simulatedResult.riskScore - prediction.riskScore > 0 ? '+' : ''}
              {simulatedResult.riskScore - prediction.riskScore}% points
            </span>
          </div>
        )}
      </div>

      {/* Preventive Guidance & Next Steps */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-xl p-6 shadow-xs space-y-4">
        <h3 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
          <FileCheck className="w-4 h-4 text-teal-600 dark:text-teal-400" />
          Evidence-Based Preventive Guidelines
        </h3>
        <p className="text-xs text-slate-500 dark:text-slate-400">
          General lifestyle measures and clinical screening steps recommended by health guidelines
        </p>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-2">
          {activePred.lifestyleRecommendations.map((rec, idx) => (
            <div key={idx} className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/30 flex flex-col justify-between">
              <div>
                <span className="text-[10px] font-bold tracking-wider uppercase text-teal-600 dark:text-teal-400 font-mono">
                  {rec.category}
                </span>
                <h4 className="text-xs font-bold text-slate-900 dark:text-white mt-1">{rec.title}</h4>
                <p className="text-[11px] text-slate-600 dark:text-slate-300 mt-2 leading-relaxed">
                  {rec.action}
                </p>
              </div>

              <div className="mt-3 pt-2 border-t border-slate-100 dark:border-slate-800 text-[10px] text-slate-400 font-medium">
                Priority: <span className="capitalize text-slate-700 dark:text-slate-300 font-semibold">{rec.priority}</span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Prominent Clinical Disclaimer */}
      <div className="p-4 rounded-xl bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800 text-amber-900 dark:text-amber-200 flex items-start gap-3 text-xs leading-relaxed">
        <AlertTriangle className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
        <div>
          <span className="font-bold">Academic & Screening Limitations:</span>{' '}
          {activePred.limitationsDisclaimer}
        </div>
      </div>
    </div>
  );
};
