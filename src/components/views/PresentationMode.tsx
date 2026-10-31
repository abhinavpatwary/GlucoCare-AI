import React, { useState } from 'react';
import {
  X,
  ChevronLeft,
  ChevronRight,
  Activity,
  Award,
  Layers,
  Database,
  Sliders,
  CheckCircle2,
  AlertTriangle
} from 'lucide-react';

interface PresentationModeProps {
  onClose: () => void;
}

export const PresentationMode: React.FC<PresentationModeProps> = ({ onClose }) => {
  const [currentSlide, setCurrentSlide] = useState(0);

  const slides = [
    {
      title: 'GlucoCare AI',
      subtitle: 'AI-Powered Diabetes Risk Prediction & Preventive Healthcare Intelligence Platform',
      tag: 'Minor / Major Project Exhibition',
      content: (
        <div className="space-y-6 text-center max-w-2xl mx-auto">
          <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-slate-900 to-teal-600 flex items-center justify-center mx-auto text-white shadow-lg">
            <Activity className="w-8 h-8 text-teal-300" />
          </div>
          <h2 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight">
            AI-Based Diabetes Prediction & Preventive Health Intelligence
          </h2>
          <p className="text-slate-300 text-sm leading-relaxed">
            A production-quality machine learning screening system leveraging Random Forest ensembles, regularized Logistic Regression, and Explainable AI (XAI) feature attribution.
          </p>
          <div className="inline-flex items-center gap-3 px-4 py-2 rounded-full bg-slate-800/80 border border-slate-700 text-xs text-teal-400 font-mono">
            <span>Evaluated ROC-AUC: 84.1%</span>
            <span>•</span>
            <span>768 Benchmark Records</span>
            <span>•</span>
            <span>Explainable AI (XAI)</span>
          </div>
        </div>
      )
    },
    {
      title: 'Problem Statement & Clinical Motivation',
      subtitle: 'Why Traditional Screening Needs AI-Driven Predictive Augmentation',
      tag: 'Clinical Background',
      content: (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-left">
          <div className="p-5 rounded-xl bg-slate-800/60 border border-slate-700 space-y-3">
            <div className="flex items-center gap-2 text-rose-400 font-bold text-sm">
              <AlertTriangle className="w-4 h-4" />
              The Healthcare Crisis
            </div>
            <ul className="space-y-2 text-xs text-slate-300 leading-relaxed list-disc pl-4">
              <li>Over 537 million adults globally live with diabetes; approximately 45% or more remain undiagnosed during early stages.</li>
              <li>Asymptomatic prediabetes progresses silently to full Type 2 diabetes without timely lifestyle intervention.</li>
              <li>Invasive lab tests (HbA1c, OGTT) are resource-constrained and infrequently performed routinely in primary care.</li>
            </ul>
          </div>
          <div className="p-5 rounded-xl bg-slate-800/60 border border-slate-700 space-y-3">
            <div className="flex items-center gap-2 text-teal-400 font-bold text-sm">
              <CheckCircle2 className="w-4 h-4" />
              The Proposed AI Solution
            </div>
            <ul className="space-y-2 text-xs text-slate-300 leading-relaxed list-disc pl-4">
              <li>Non-invasive multivariate risk stratification using 8 accessible physiological biomarkers.</li>
              <li>Probability calibration that accounts for non-linear interactions between Glucose, BMI, and Age.</li>
              <li>Transparent XAI factor attribution to inform clinical decision support and lifestyle change.</li>
            </ul>
          </div>
        </div>
      )
    },
    {
      title: 'Dataset Provenance & Preprocessing',
      subtitle: 'Rigorous Handling of Retrospective Benchmark Data',
      tag: 'Data Pipeline',
      content: (
        <div className="space-y-4 text-left">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-center">
            <div className="p-3.5 rounded-lg bg-slate-800/80 border border-slate-700">
              <span className="text-2xl font-mono font-bold text-teal-400">768</span>
              <p className="text-[11px] text-slate-400 mt-1">Total Patient Records</p>
            </div>
            <div className="p-3.5 rounded-lg bg-slate-800/80 border border-slate-700">
              <span className="text-2xl font-mono font-bold text-teal-400">80 / 20</span>
              <p className="text-[11px] text-slate-400 mt-1">Stratified Train / Test Split</p>
            </div>
            <div className="p-3.5 rounded-lg bg-slate-800/80 border border-slate-700">
              <span className="text-2xl font-mono font-bold text-teal-400">Seed 42</span>
              <p className="text-[11px] text-slate-400 mt-1">Fixed Reproducibility State</p>
            </div>
          </div>
          <div className="p-4 rounded-xl bg-slate-800/60 border border-slate-700 text-xs text-slate-300 space-y-2">
            <p><strong>Missing Value Imputation:</strong> Raw dataset zeroes in Glucose, Diastolic BP, Skin Thickness, Insulin, and BMI are physiologically impossible and represent unrecorded tests. These were imputed with training-cohort medians.</p>
            <p><strong>Prevention of Data Leakage:</strong> StandardScalers were fit strictly on the 80% training set (614 records) prior to transforming the hold-out test set (154 records).</p>
          </div>
        </div>
      )
    },
    {
      title: 'Machine Learning Model Benchmarks',
      subtitle: 'Validated Hold-Out Evaluation Results',
      tag: 'Model Evaluation',
      content: (
        <div className="space-y-4 text-left">
          <table className="w-full text-xs text-left border-collapse font-mono">
            <thead>
              <tr className="border-b border-slate-700 text-slate-400 font-sans">
                <th className="py-2">Model Architecture</th>
                <th className="py-2 text-center">Accuracy</th>
                <th className="py-2 text-center">Precision</th>
                <th className="py-2 text-center">Recall</th>
                <th className="py-2 text-center">ROC-AUC</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800 text-slate-200">
              <tr className="text-teal-300 font-bold">
                <td className="py-2 font-sans">Random Forest (100 Trees)</td>
                <td className="py-2 text-center">78.6%</td>
                <td className="py-2 text-center">71.7%</td>
                <td className="py-2 text-center">70.4%</td>
                <td className="py-2 text-center">84.1%</td>
              </tr>
              <tr>
                <td className="py-2 font-sans">Gradient Boosting</td>
                <td className="py-2 text-center">77.3%</td>
                <td className="py-2 text-center">69.1%</td>
                <td className="py-2 text-center">70.4%</td>
                <td className="py-2 text-center">83.3%</td>
              </tr>
              <tr>
                <td className="py-2 font-sans">Logistic Regression (L2)</td>
                <td className="py-2 text-center">77.3%</td>
                <td className="py-2 text-center">68.5%</td>
                <td className="py-2 text-center">68.5%</td>
                <td className="py-2 text-center">82.5%</td>
              </tr>
            </tbody>
          </table>
          <p className="text-xs text-slate-400">
            <strong>Key takeaway:</strong> Random Forest achieved the highest ROC-AUC (84.1%) by capturing non-linear combinations of Glucose and BMI that linear models miss.
          </p>
        </div>
      )
    },
    {
      title: 'Explainable AI & Ethical Guardrails',
      subtitle: 'Opening the Medical Black Box Responsibly',
      tag: 'XAI & Clinical Ethics',
      content: (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-left text-xs text-slate-300">
          <div className="p-4 rounded-xl bg-slate-800/60 border border-slate-700 space-y-2">
            <h4 className="font-bold text-teal-400 text-sm">Feature Attribution (XAI)</h4>
            <p>Every prediction outputs an exact decomposition of standardized log-odds contributions, explaining whether a biomarker acts as a protective shield or accelerates diabetic risk.</p>
            <p>Interactive "What-If" counterfactual simulation allows patients and doctors to see how realistic weight loss or glucose reduction alters statistical risk.</p>
          </div>
          <div className="p-4 rounded-xl bg-slate-800/60 border border-slate-700 space-y-2">
            <h4 className="font-bold text-amber-400 text-sm">Ethical & Demographic Boundaries</h4>
            <p>Explicit clinical disclaimer: System output is probabilistic screening assistance, not a medical diagnosis.</p>
            <p>Disclosed population specificity: Pima Indian dataset characteristics require external validation across diverse global demographic cohorts.</p>
          </div>
        </div>
      )
    }
  ];

  const handleNext = () => {
    setCurrentSlide((prev) => Math.min(slides.length - 1, prev + 1));
  };

  const handlePrev = () => {
    setCurrentSlide((prev) => Math.max(0, prev - 1));
  };

  const slide = slides[currentSlide];

  return (
    <div className="fixed inset-0 z-50 bg-slate-950 text-white flex flex-col justify-between p-6 sm:p-10 animate-in fade-in duration-200">
      {/* Top Bar */}
      <div className="flex items-center justify-between border-b border-slate-800 pb-4">
        <div className="flex items-center gap-3">
          <span className="px-2.5 py-0.5 rounded-full bg-teal-500/20 text-teal-400 border border-teal-500/30 text-[11px] font-mono font-semibold">
            {slide.tag}
          </span>
          <span className="text-xs text-slate-400">
            Slide {currentSlide + 1} of {slides.length}
          </span>
        </div>

        <button
          onClick={onClose}
          className="p-2 rounded-lg bg-slate-900 hover:bg-slate-800 text-slate-400 hover:text-white transition-colors"
          title="Exit Presentation"
        >
          <X className="w-5 h-5" />
        </button>
      </div>

      {/* Main Slide Body */}
      <div className="max-w-4xl w-full mx-auto my-auto py-8">
        <div className="mb-8 text-center">
          <h2 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
            {slide.title}
          </h2>
          <p className="text-sm text-slate-400 mt-1">{slide.subtitle}</p>
        </div>

        <div>{slide.content}</div>
      </div>

      {/* Bottom Navigation */}
      <div className="flex items-center justify-between border-t border-slate-800 pt-4">
        <button
          disabled={currentSlide === 0}
          onClick={handlePrev}
          className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 disabled:opacity-30 text-xs font-semibold text-slate-300 transition-colors"
        >
          <ChevronLeft className="w-4 h-4" />
          <span>Previous</span>
        </button>

        <div className="flex items-center gap-1.5">
          {slides.map((_, i) => (
            <button
              key={i}
              onClick={() => setCurrentSlide(i)}
              className={`w-2.5 h-2.5 rounded-full transition-all ${
                i === currentSlide ? 'bg-teal-400 w-6' : 'bg-slate-700 hover:bg-slate-600'
              }`}
            />
          ))}
        </div>

        <button
          disabled={currentSlide === slides.length - 1}
          onClick={handleNext}
          className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-teal-600 hover:bg-teal-500 disabled:opacity-30 text-xs font-bold text-white transition-colors"
        >
          <span>Next</span>
          <ChevronRight className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};
