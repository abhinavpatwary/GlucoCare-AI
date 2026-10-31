import React, { useState } from 'react';
import {
  History,
  Trash2,
  Download,
  FileText,
  ArrowRight,
  ExternalLink,
  GitCompare,
  CheckCircle2,
  AlertCircle
} from 'lucide-react';
import { PredictionOutput } from '../../types/diabetes';
import { clearSessionHistory, exportHistoryToCsv } from '../../services/storage';
import { generatePredictionPdf } from '../../services/pdfGenerator';

interface PredictionHistoryProps {
  history: PredictionOutput[];
  onSelectPrediction: (prediction: PredictionOutput) => void;
  onClearHistory: () => void;
  onNewAssessment: () => void;
}

export const PredictionHistory: React.FC<PredictionHistoryProps> = ({
  history,
  onSelectPrediction,
  onClearHistory,
  onNewAssessment
}) => {
  const [selectedForCompare, setSelectedForCompare] = useState<string[]>([]);
  const [compareModalOpen, setCompareModalOpen] = useState(false);

  const toggleSelectForCompare = (id: string) => {
    setSelectedForCompare((prev) => {
      if (prev.includes(id)) {
        return prev.filter((item) => item !== id);
      }
      if (prev.length >= 2) {
        return [prev[1], id];
      }
      return [...prev, id];
    });
  };

  const handleExportCsv = () => {
    exportHistoryToCsv(history);
  };

  const handleClear = () => {
    if (window.confirm('Clear all session prediction history? This action cannot be undone.')) {
      clearSessionHistory();
      onClearHistory();
      setSelectedForCompare([]);
    }
  };

  const comparedItems = history.filter((p) => selectedForCompare.includes(p.id));

  return (
    <div className="space-y-8 max-w-5xl mx-auto animate-in fade-in duration-300">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 dark:border-slate-800 pb-5">
        <div>
          <div className="inline-flex items-center gap-2 px-2.5 py-0.5 rounded-full bg-teal-50 dark:bg-teal-950/60 text-teal-700 dark:text-teal-300 text-xs font-semibold mb-2 border border-teal-200 dark:border-teal-800">
            <History className="w-3.5 h-3.5" />
            Audit Logging & Historical Assessment Dossier
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight">
            Prediction History
          </h1>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1 max-w-2xl">
            Review and compare patient risk evaluations conducted during this active browser session.
          </p>
        </div>

        {history.length > 0 && (
          <div className="flex items-center gap-2 self-start sm:self-auto">
            {selectedForCompare.length === 2 && (
              <button
                onClick={() => setCompareModalOpen(true)}
                className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl bg-teal-600 hover:bg-teal-500 text-white text-xs font-semibold transition-colors"
              >
                <GitCompare className="w-3.5 h-3.5" />
                <span>Compare (2 Selected)</span>
              </button>
            )}

            <button
              onClick={handleExportCsv}
              className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 hover:bg-slate-50 dark:hover:bg-slate-800 text-xs font-semibold text-slate-700 dark:text-slate-300 transition-colors"
            >
              <Download className="w-3.5 h-3.5 text-teal-600" />
              <span>Export CSV</span>
            </button>

            <button
              onClick={handleClear}
              className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl border border-rose-200 dark:border-rose-900/60 bg-white dark:bg-slate-900 hover:bg-rose-50 dark:hover:bg-rose-950/30 text-xs font-semibold text-rose-600 dark:text-rose-400 transition-colors"
            >
              <Trash2 className="w-3.5 h-3.5" />
              <span>Clear History</span>
            </button>
          </div>
        )}
      </div>

      {/* Empty State */}
      {history.length === 0 ? (
        <div className="p-12 text-center bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-2xl shadow-xs space-y-4">
          <div className="w-14 h-14 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-slate-400 mx-auto">
            <FileText className="w-7 h-7" />
          </div>
          <h3 className="text-base font-bold text-slate-900 dark:text-white">
            No Session Records Found
          </h3>
          <p className="text-xs text-slate-500 dark:text-slate-400 max-w-md mx-auto leading-relaxed">
            Assessments performed during this session are stored locally in-memory to preserve clinical privacy. Run a new prediction to begin logging.
          </p>
          <button
            onClick={onNewAssessment}
            className="px-5 py-2.5 rounded-xl bg-teal-600 hover:bg-teal-500 text-white font-bold text-xs transition-colors"
          >
            Start Risk Assessment
          </button>
        </div>
      ) : (
        /* History List Table / Cards */
        <div className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-xl overflow-hidden shadow-xs">
          <div className="p-3 bg-slate-50 dark:bg-slate-800/60 border-b border-slate-200 dark:border-slate-800 text-xs text-slate-500 flex justify-between items-center">
            <span>Select any 2 records to compare side-by-side</span>
            <span className="font-mono">{history.length} assessments in current session</span>
          </div>

          <div className="divide-y divide-slate-100 dark:divide-slate-800">
            {history.map((item) => {
              const isSelected = selectedForCompare.includes(item.id);
              const isHigh = item.predictedClass === 1;

              return (
                <div
                  key={item.id}
                  className={`p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4 transition-colors ${
                    isSelected ? 'bg-teal-50/40 dark:bg-teal-950/20' : 'hover:bg-slate-50/80 dark:hover:bg-slate-800/40'
                  }`}
                >
                  <div className="flex items-start gap-3">
                    <input
                      type="checkbox"
                      checked={isSelected}
                      onChange={() => toggleSelectForCompare(item.id)}
                      className="mt-1 accent-teal-600 rounded cursor-pointer"
                    />

                    <div>
                      <div className="flex items-center gap-2">
                        <span
                          className={`px-2 py-0.5 rounded text-[11px] font-bold ${
                            isHigh
                              ? 'bg-rose-100 text-rose-800 dark:bg-rose-950/60 dark:text-rose-300'
                              : 'bg-teal-100 text-teal-800 dark:bg-teal-950/60 dark:text-teal-300'
                          }`}
                        >
                          {item.classificationLabel}
                        </span>
                        <span className="text-xs font-mono font-bold text-slate-900 dark:text-white">
                          Score: {item.riskScore}% ({item.riskTier})
                        </span>
                        <span className="text-[11px] text-slate-400 font-mono">
                          • {new Date(item.timestamp).toLocaleString([], { dateStyle: 'short', timeStyle: 'short' })}
                        </span>
                      </div>

                      <div className="text-xs text-slate-600 dark:text-slate-400 mt-1 flex flex-wrap gap-x-4 gap-y-1">
                        <span>Glucose: <strong className="text-slate-900 dark:text-white">{item.inputs.glucose}</strong> mg/dL</span>
                        <span>BMI: <strong className="text-slate-900 dark:text-white">{item.inputs.bmi}</strong></span>
                        <span>Age: <strong className="text-slate-900 dark:text-white">{item.inputs.age}</strong> yrs</span>
                        <span>BP: <strong className="text-slate-900 dark:text-white">{item.inputs.blood_pressure}</strong> mm Hg</span>
                        <span>Model: <span className="font-mono text-[11px]">{item.modelName}</span></span>
                      </div>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex items-center gap-2 self-end sm:self-center">
                    <button
                      onClick={() => generatePredictionPdf(item)}
                      className="p-1.5 rounded-lg border border-slate-200 dark:border-slate-700 text-slate-500 hover:text-teal-600 hover:bg-slate-100 dark:hover:bg-slate-800 text-xs transition-colors"
                      title="Download PDF Dossier"
                    >
                      <Download className="w-4 h-4" />
                    </button>

                    <button
                      onClick={() => onSelectPrediction(item)}
                      className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg bg-teal-50 dark:bg-teal-950/60 text-teal-700 dark:text-teal-300 hover:bg-teal-100 dark:hover:bg-teal-900/60 text-xs font-semibold border border-teal-200 dark:border-teal-800 transition-colors"
                    >
                      <span>View Dossier</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Comparison Modal */}
      {compareModalOpen && comparedItems.length === 2 && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 rounded-2xl max-w-3xl w-full p-6 shadow-2xl border border-slate-200 dark:border-slate-800 space-y-5 animate-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
              <h3 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <GitCompare className="w-4 h-4 text-teal-600" />
                Side-by-Side Clinical Risk Comparison
              </h3>
              <button
                onClick={() => setCompareModalOpen(false)}
                className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 text-sm font-bold"
              >
                ✕
              </button>
            </div>

            <div className="grid grid-cols-2 gap-4">
              {comparedItems.map((item, idx) => (
                <div key={item.id} className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/40 space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-slate-500">Profile #{idx + 1}</span>
                    <span className="text-[11px] font-mono text-slate-400">
                      {new Date(item.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </span>
                  </div>

                  <div className="p-3 rounded-lg bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 text-center">
                    <span className="text-3xl font-extrabold font-mono text-slate-900 dark:text-white">
                      {item.riskScore}%
                    </span>
                    <p className={`text-xs font-bold mt-1 ${item.predictedClass === 1 ? 'text-rose-600' : 'text-teal-600'}`}>
                      {item.classificationLabel} ({item.riskTier})
                    </p>
                  </div>

                  <div className="space-y-1.5 text-xs">
                    <div className="flex justify-between py-1 border-b border-slate-200/60 dark:border-slate-700/60">
                      <span className="text-slate-500">Glucose:</span>
                      <span className="font-mono font-bold text-slate-900 dark:text-white">{item.inputs.glucose} mg/dL</span>
                    </div>
                    <div className="flex justify-between py-1 border-b border-slate-200/60 dark:border-slate-700/60">
                      <span className="text-slate-500">BMI:</span>
                      <span className="font-mono font-bold text-slate-900 dark:text-white">{item.inputs.bmi} kg/m²</span>
                    </div>
                    <div className="flex justify-between py-1 border-b border-slate-200/60 dark:border-slate-700/60">
                      <span className="text-slate-500">Age:</span>
                      <span className="font-mono font-bold text-slate-900 dark:text-white">{item.inputs.age} yrs</span>
                    </div>
                    <div className="flex justify-between py-1 border-b border-slate-200/60 dark:border-slate-700/60">
                      <span className="text-slate-500">Blood Pressure:</span>
                      <span className="font-mono font-bold text-slate-900 dark:text-white">{item.inputs.blood_pressure} mm Hg</span>
                    </div>
                    <div className="flex justify-between py-1">
                      <span className="text-slate-500">Algorithm:</span>
                      <span className="font-medium text-slate-700 dark:text-slate-300">{item.modelName}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            <div className="flex justify-end pt-2">
              <button
                onClick={() => setCompareModalOpen(false)}
                className="px-4 py-2 rounded-xl bg-slate-900 dark:bg-slate-100 text-white dark:text-slate-900 text-xs font-bold"
              >
                Close Comparison
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
