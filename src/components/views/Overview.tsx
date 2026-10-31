import React from 'react';
import {
  Database,
  History,
  Award,
  Cpu,
  ArrowRight,
  TrendingUp,
  PieChart as PieIcon,
  CheckCircle2,
  FileText
} from 'lucide-react';
import { MetricCard } from '../MetricCard';
import { modelBundle } from '../../ml/inferenceEngine';
import { PredictionOutput } from '../../types/diabetes';
import {
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  Legend
} from 'recharts';

interface OverviewProps {
  onStartAssessment: () => void;
  onViewAnalytics: () => void;
  onViewModelPerformance: () => void;
  recentPredictions: PredictionOutput[];
  onSelectPrediction: (pred: PredictionOutput) => void;
}

export const Overview: React.FC<OverviewProps> = ({
  onStartAssessment,
  onViewAnalytics,
  onViewModelPerformance,
  recentPredictions,
  onSelectPrediction
}) => {
  const datasetInfo = modelBundle.dataset_info;
  const bestModel = modelBundle.models.random_forest;

  // Real class distribution data from benchmark dataset
  const classDistData = [
    { name: 'Non-Diabetic (Class 0)', value: datasetInfo.non_diabetic_records, color: '#0D9488' },
    { name: 'Diabetic (Class 1)', value: datasetInfo.diabetic_records, color: '#E11D48' }
  ];

  // Age group distribution from dataset
  const ageDistData = [
    { range: '21-30', nonDiabetic: 312, diabetic: 85 },
    { range: '31-40', nonDiabetic: 104, diabetic: 63 },
    { range: '41-50', nonDiabetic: 58, diabetic: 68 },
    { range: '51-60', nonDiabetic: 21, diabetic: 39 },
    { range: '61+', nonDiabetic: 5, diabetic: 13 }
  ];

  // Top feature importances
  const topFeatures = Object.entries(modelBundle.feature_importances)
    .sort((a, b) => b[1].importance - a[1].importance)
    .slice(0, 5)
    .map(([key, item]) => ({
      name: key === 'glucose' ? 'Blood Glucose' : key === 'bmi' ? 'BMI' : key === 'age' ? 'Age' : key === 'diabetes_pedigree' ? 'Pedigree Function' : 'Insulin',
      weight: Math.round(item.importance * 100)
    }));

  return (
    <div className="space-y-8 animate-in fade-in duration-300">
      {/* Hero Welcome Banner */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-slate-900 via-slate-800 to-teal-950 p-6 sm:p-8 text-white shadow-md border border-slate-700/60">
        <div className="relative z-10 max-w-3xl">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-teal-500/20 text-teal-300 border border-teal-400/30 text-xs font-semibold uppercase tracking-wider mb-3">
            <span className="w-2 h-2 rounded-full bg-teal-400 animate-pulse"></span>
            Supervised Machine Learning Intelligence
          </div>
          <h1 className="text-2xl sm:text-4xl font-extrabold tracking-tight text-white leading-tight">
            GlucoCare AI — Preventive Health Intelligence
          </h1>
          <p className="mt-3 text-slate-300 text-sm sm:text-base leading-relaxed">
            Explore model-based diabetes risk estimates and understand the factors that influence them. Powered by calibrated supervised learning algorithms and explainable AI.
          </p>

          <div className="mt-6 flex flex-wrap items-center gap-3">
            <button
              onClick={onStartAssessment}
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-teal-500 hover:bg-teal-400 text-slate-950 font-bold text-sm transition-all shadow-sm active:scale-95"
            >
              <span>Start Risk Assessment</span>
              <ArrowRight className="w-4 h-4" />
            </button>
            <button
              onClick={onViewAnalytics}
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-slate-800/80 hover:bg-slate-700 text-white font-medium text-sm border border-slate-600 transition-colors"
            >
              <TrendingUp className="w-4 h-4 text-teal-400" />
              <span>Explore Dataset</span>
            </button>
            <button
              onClick={onViewModelPerformance}
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-slate-800/80 hover:bg-slate-700 text-white font-medium text-sm border border-slate-600 transition-colors"
            >
              <Award className="w-4 h-4 text-teal-400" />
              <span>Model Evaluation</span>
            </button>
          </div>
        </div>

        {/* Decorative Grid SVG in background */}
        <div className="absolute right-0 top-0 bottom-0 w-1/3 opacity-10 pointer-events-none hidden lg:block">
          <svg className="w-full h-full" xmlns="http://www.w3.org/2000/svg" fill="none">
            <pattern id="grid" width="24" height="24" patternUnits="userSpaceOnUse">
              <path d="M 24 0 L 0 0 0 24" fill="none" stroke="white" strokeWidth="1" />
            </pattern>
            <rect width="100%" height="100%" fill="url(#grid)" />
          </svg>
        </div>
      </div>

      {/* KPI Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <MetricCard
          title="Active Dataset Records"
          value={datasetInfo.total_records.toLocaleString()}
          subtitle="NIDDK Clinical Benchmark"
          badge={{ text: `${datasetInfo.diabetic_records} Positive (${(datasetInfo.diabetic_ratio * 100).toFixed(0)}%)`, variant: 'info' }}
          icon={Database}
        />
        <MetricCard
          title="Session Predictions"
          value={recentPredictions.length}
          subtitle="Transient in-memory session audit"
          badge={{ text: recentPredictions.length > 0 ? 'Active' : 'No queries yet', variant: recentPredictions.length > 0 ? 'success' : 'neutral' }}
          icon={History}
        />
        <MetricCard
          title="Evaluated Baseline Model"
          value={bestModel.name.split(' ')[0] + ' ' + bestModel.name.split(' ')[1]}
          subtitle="Gini tree split criterion"
          badge={{ text: '100 Estimators', variant: 'info' }}
          icon={Cpu}
        />
        <MetricCard
          title="Model ROC-AUC Score"
          value={(bestModel.metrics.roc_auc * 100).toFixed(1) + '%'}
          subtitle={`Accuracy: ${(bestModel.metrics.accuracy * 100).toFixed(1)}%`}
          badge={{ text: 'Validated on 154 Test', variant: 'success' }}
          icon={Award}
          iconColor="text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/40 border-emerald-200 dark:border-emerald-800"
        />
      </div>

      {/* Analytics Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Class Distribution Donut Chart */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-xl p-5 shadow-xs">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <PieIcon className="w-4 h-4 text-teal-600" />
                Diagnostic Outcome Distribution
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400">Class prevalence across 768 clinical records</p>
            </div>
          </div>

          <div className="h-56">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={classDistData}
                  cx="50%"
                  cy="50%"
                  innerRadius={55}
                  outerRadius={80}
                  paddingAngle={4}
                  dataKey="value"
                >
                  {classDistData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip
                  formatter={(value: any) => [`${value} patients (${((value / 768) * 100).toFixed(1)}%)`, 'Count']}
                  contentStyle={{ backgroundColor: '#0F172A', borderColor: '#334155', borderRadius: '8px', color: '#fff', fontSize: '12px' }}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>

          <div className="grid grid-cols-2 gap-2 mt-2 pt-3 border-t border-slate-100 dark:border-slate-800 text-xs">
            <div className="flex items-center gap-2">
              <span className="w-3 h-3 rounded-sm bg-teal-600"></span>
              <span className="text-slate-600 dark:text-slate-300 font-medium">Non-Diabetic: 500 (65.1%)</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="w-3 h-3 rounded-sm bg-rose-600"></span>
              <span className="text-slate-600 dark:text-slate-300 font-medium">Diabetic: 268 (34.9%)</span>
            </div>
          </div>
        </div>

        {/* Stratified Age Group Distribution */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-xl p-5 shadow-xs lg:col-span-2">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <TrendingUp className="w-4 h-4 text-teal-600" />
                Prevalence Across Age Cohorts
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400">Comparing diabetic vs non-diabetic observations across age brackets</p>
            </div>
          </div>

          <div className="h-56">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={ageDistData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <XAxis dataKey="range" tick={{ fontSize: 12, fill: '#64748B' }} />
                <YAxis tick={{ fontSize: 12, fill: '#64748B' }} />
                <Tooltip
                  contentStyle={{ backgroundColor: '#0F172A', borderColor: '#334155', borderRadius: '8px', color: '#fff', fontSize: '12px' }}
                />
                <Legend wrapperStyle={{ fontSize: '12px' }} />
                <Bar dataKey="nonDiabetic" name="Non-Diabetic" fill="#0D9488" radius={[4, 4, 0, 0]} />
                <Bar dataKey="diabetic" name="Diabetic" fill="#E11D48" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Bottom Row: Feature Importance Preview & Recent Session Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Key Model Predictors */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-xl p-5 shadow-xs">
          <h2 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2 mb-2">
            <Award className="w-4 h-4 text-teal-600" />
            Top Model Predictors (MDI)
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400 mb-4">Relative feature importance in decision tree splits</p>

          <div className="space-y-3">
            {topFeatures.map((f, i) => (
              <div key={i}>
                <div className="flex justify-between text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">
                  <span>{f.name}</span>
                  <span className="font-mono text-teal-600 dark:text-teal-400 font-bold">{f.weight}%</span>
                </div>
                <div className="w-full bg-slate-100 dark:bg-slate-800 h-2 rounded-full overflow-hidden">
                  <div
                    className="bg-teal-600 dark:bg-teal-400 h-full rounded-full transition-all duration-500"
                    style={{ width: `${f.weight * 2.8}%` }}
                  />
                </div>
              </div>
            ))}
          </div>

          <div className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-800">
            <button
              onClick={onViewModelPerformance}
              className="text-xs font-semibold text-teal-600 dark:text-teal-400 hover:underline flex items-center gap-1"
            >
              <span>View full model evaluation & ROC curves</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        {/* Recent Session Predictions / Empty State */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-xl p-5 shadow-xs lg:col-span-2">
          <div className="flex items-center justify-between mb-3">
            <div>
              <h2 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <History className="w-4 h-4 text-teal-600" />
                Recent Session Predictions
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400">Audited assessments conducted in current browser session</p>
            </div>
            {recentPredictions.length > 0 && (
              <span className="text-xs font-mono font-semibold px-2 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300">
                {recentPredictions.length} recorded
              </span>
            )}
          </div>

          {recentPredictions.length === 0 ? (
            <div className="h-56 flex flex-col items-center justify-center text-center p-6 border-2 border-dashed border-slate-200 dark:border-slate-800 rounded-lg">
              <div className="w-12 h-12 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-slate-400 mb-3">
                <FileText className="w-6 h-6" />
              </div>
              <p className="text-sm font-semibold text-slate-700 dark:text-slate-300">No predictions recorded yet</p>
              <p className="text-xs text-slate-500 dark:text-slate-400 max-w-sm mt-1 mb-4">
                Enter health measurements in the Risk Assessment module or trigger the Instant Demo to observe live ML classification.
              </p>
              <button
                onClick={onStartAssessment}
                className="px-4 py-2 rounded-lg bg-teal-600 hover:bg-teal-500 text-white font-semibold text-xs transition-colors"
              >
                Perform First Assessment
              </button>
            </div>
          ) : (
            <div className="divide-y divide-slate-100 dark:divide-slate-800 overflow-y-auto max-h-56">
              {recentPredictions.slice(0, 4).map((p) => (
                <div
                  key={p.id}
                  onClick={() => onSelectPrediction(p)}
                  className="py-3 px-2 flex items-center justify-between hover:bg-slate-50 dark:hover:bg-slate-800/50 rounded-lg cursor-pointer transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <div
                      className={`w-2.5 h-2.5 rounded-full ${
                        p.predictedClass === 1 ? 'bg-rose-500' : 'bg-teal-500'
                      }`}
                    />
                    <div>
                      <div className="text-xs font-bold text-slate-900 dark:text-white flex items-center gap-2">
                        <span>{p.classificationLabel}</span>
                        <span className="text-[11px] font-normal text-slate-400">
                          ({p.riskTier} • {p.riskScore}%)
                        </span>
                      </div>
                      <div className="text-[11px] text-slate-500 dark:text-slate-400">
                        Glucose: {p.inputs.glucose} mg/dL • BMI: {p.inputs.bmi} • Age: {p.inputs.age}
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <span className="text-[11px] font-mono text-slate-400">
                      {new Date(p.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </span>
                    <ArrowRight className="w-4 h-4 text-slate-400" />
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
