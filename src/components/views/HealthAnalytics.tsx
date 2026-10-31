import React, { useState, useMemo } from 'react';
import {
  BarChart3,
  Filter,
  Download,
  Search,
  Grid,
  Layers,
  ArrowUpDown,
  FileSpreadsheet,
  Info
} from 'lucide-react';
import { CLINICAL_DATASET, PatientRecord } from '../../data/clinicalRecords';
import { modelBundle } from '../../ml/inferenceEngine';
import {
  ScatterChart,
  Scatter,
  XAxis,
  YAxis,
  ZAxis,
  Tooltip,
  ResponsiveContainer,
  BarChart,
  Bar,
  Legend,
  CartesianGrid
} from 'recharts';

export const HealthAnalytics: React.FC = () => {
  // Filter state
  const [outcomeFilter, setOutcomeFilter] = useState<'all' | '0' | '1'>('all');
  const [ageMin, setAgeMin] = useState<number>(21);
  const [ageMax, setAgeMax] = useState<number>(81);
  const [searchQuery, setSearchQuery] = useState('');
  const [activeTab, setActiveTab] = useState<'bivariate' | 'distributions' | 'correlations' | 'table'>('bivariate');
  const [scatterX, setScatterX] = useState<keyof PatientRecord>('glucose');
  const [scatterY, setScatterY] = useState<keyof PatientRecord>('bmi');
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 12;

  // Filtered dataset
  const filteredData = useMemo(() => {
    return CLINICAL_DATASET.filter((record) => {
      if (outcomeFilter !== 'all' && String(record.outcome) !== outcomeFilter) return false;
      if (record.age < ageMin || record.age > ageMax) return false;
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        return (
          record.id.toString().includes(q) ||
          record.glucose.toString().includes(q) ||
          record.bmi.toString().includes(q)
        );
      }
      return true;
    });
  }, [outcomeFilter, ageMin, ageMax, searchQuery]);

  // Paginated table
  const paginatedData = useMemo(() => {
    const start = (currentPage - 1) * pageSize;
    return filteredData.slice(start, start + pageSize);
  }, [filteredData, currentPage]);

  const totalPages = Math.ceil(filteredData.length / pageSize) || 1;

  // Data for Bivariate Scatter
  const scatterNonDiabetic = useMemo(() => {
    return filteredData.filter((d) => d.outcome === 0).map((d) => ({ x: d[scatterX], y: d[scatterY], id: d.id }));
  }, [filteredData, scatterX, scatterY]);

  const scatterDiabetic = useMemo(() => {
    return filteredData.filter((d) => d.outcome === 1).map((d) => ({ x: d[scatterX], y: d[scatterY], id: d.id }));
  }, [filteredData, scatterX, scatterY]);

  // Glucose stratified distribution bins
  const glucoseBins = useMemo(() => {
    const bins = [
      { range: '<90', nonDiabetic: 0, diabetic: 0 },
      { range: '90-110', nonDiabetic: 0, diabetic: 0 },
      { range: '111-130', nonDiabetic: 0, diabetic: 0 },
      { range: '131-150', nonDiabetic: 0, diabetic: 0 },
      { range: '151-170', nonDiabetic: 0, diabetic: 0 },
      { range: '171+', nonDiabetic: 0, diabetic: 0 },
    ];
    filteredData.forEach((d) => {
      const g = d.glucose;
      let idx = 0;
      if (g < 90) idx = 0;
      else if (g <= 110) idx = 1;
      else if (g <= 130) idx = 2;
      else if (g <= 150) idx = 3;
      else if (g <= 170) idx = 4;
      else idx = 5;

      if (d.outcome === 1) bins[idx].diabetic += 1;
      else bins[idx].nonDiabetic += 1;
    });
    return bins;
  }, [filteredData]);

  // BMI distribution bins
  const bmiBins = useMemo(() => {
    const bins = [
      { range: '<22', nonDiabetic: 0, diabetic: 0 },
      { range: '22-26', nonDiabetic: 0, diabetic: 0 },
      { range: '27-30', nonDiabetic: 0, diabetic: 0 },
      { range: '31-35', nonDiabetic: 0, diabetic: 0 },
      { range: '36-40', nonDiabetic: 0, diabetic: 0 },
      { range: '41+', nonDiabetic: 0, diabetic: 0 },
    ];
    filteredData.forEach((d) => {
      const b = d.bmi;
      let idx = 0;
      if (b < 22) idx = 0;
      else if (b <= 26) idx = 1;
      else if (b <= 30) idx = 2;
      else if (b <= 35) idx = 3;
      else if (b <= 40) idx = 4;
      else idx = 5;

      if (d.outcome === 1) bins[idx].diabetic += 1;
      else bins[idx].nonDiabetic += 1;
    });
    return bins;
  }, [filteredData]);

  // Export filtered cohort to CSV
  const handleExportCohort = () => {
    const headers = ['id', 'pregnancies', 'glucose', 'blood_pressure', 'skin_thickness', 'insulin', 'bmi', 'diabetes_pedigree', 'age', 'outcome'];
    const rows = filteredData.map((d) => [
      d.id, d.pregnancies, d.glucose, d.blood_pressure, d.skin_thickness, d.insulin, d.bmi, d.diabetes_pedigree, d.age, d.outcome
    ]);
    const csvContent = [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `GlucoCare_Cohort_Export_${filteredData.length}_records.csv`;
    link.click();
  };

  const featureOptions: { id: keyof PatientRecord; label: string }[] = [
    { id: 'glucose', label: 'Blood Glucose (mg/dL)' },
    { id: 'bmi', label: 'Body Mass Index (kg/m²)' },
    { id: 'age', label: 'Patient Age (years)' },
    { id: 'insulin', label: 'Serum Insulin (µU/mL)' },
    { id: 'blood_pressure', label: 'Diastolic BP (mm Hg)' },
    { id: 'diabetes_pedigree', label: 'Diabetes Pedigree Score' },
    { id: 'skin_thickness', label: 'Triceps Skinfold (mm)' },
    { id: 'pregnancies', label: 'Pregnancies Count' }
  ];

  return (
    <div className="space-y-8 max-w-6xl mx-auto animate-in fade-in duration-300">
      {/* Title & Description */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-200 dark:border-slate-800 pb-5">
        <div>
          <div className="inline-flex items-center gap-2 px-2.5 py-0.5 rounded-full bg-teal-50 dark:bg-teal-950/60 text-teal-700 dark:text-teal-300 text-xs font-semibold mb-2 border border-teal-200 dark:border-teal-800">
            <BarChart3 className="w-3.5 h-3.5" />
            Epidemiological Dataset Exploration
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight">
            Health Analytics & Clinical Trends
          </h1>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1 max-w-2xl">
            Explore biomarker distributions, investigate non-linear physiological interactions, and query the 768-patient benchmark dataset.
          </p>
        </div>

        <button
          onClick={handleExportCohort}
          className="inline-flex items-center gap-2 px-3.5 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 hover:bg-slate-50 dark:hover:bg-slate-800 text-xs font-semibold text-slate-700 dark:text-slate-200 shadow-2xs transition-colors self-start md:self-auto"
        >
          <Download className="w-3.5 h-3.5 text-teal-600" />
          <span>Export Cohort ({filteredData.length} Records)</span>
        </button>
      </div>

      {/* Filter Toolbar */}
      <div className="p-4 rounded-xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-2xs space-y-3">
        <div className="flex items-center justify-between text-xs font-bold text-slate-700 dark:text-slate-300">
          <span className="flex items-center gap-1.5 uppercase tracking-wider text-slate-500 dark:text-slate-400">
            <Filter className="w-3.5 h-3.5 text-teal-600" />
            Cohort Filters
          </span>
          <span className="font-mono text-teal-600 dark:text-teal-400">
            Showing {filteredData.length} of 768 records
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 pt-1 text-xs">
          {/* Outcome Filter */}
          <div>
            <label className="block text-[11px] font-semibold text-slate-500 mb-1">Diagnostic Outcome:</label>
            <div className="grid grid-cols-3 gap-1 bg-slate-100 dark:bg-slate-800 p-1 rounded-lg">
              <button
                type="button"
                onClick={() => setOutcomeFilter('all')}
                className={`py-1 rounded text-center font-medium ${outcomeFilter === 'all' ? 'bg-white dark:bg-slate-900 shadow-2xs font-bold text-slate-900 dark:text-white' : 'text-slate-600 dark:text-slate-400'}`}
              >
                All (768)
              </button>
              <button
                type="button"
                onClick={() => setOutcomeFilter('0')}
                className={`py-1 rounded text-center font-medium ${outcomeFilter === '0' ? 'bg-white dark:bg-slate-900 shadow-2xs font-bold text-teal-600' : 'text-slate-600 dark:text-slate-400'}`}
              >
                Negative (500)
              </button>
              <button
                type="button"
                onClick={() => setOutcomeFilter('1')}
                className={`py-1 rounded text-center font-medium ${outcomeFilter === '1' ? 'bg-white dark:bg-slate-900 shadow-2xs font-bold text-rose-600' : 'text-slate-600 dark:text-slate-400'}`}
              >
                Positive (268)
              </button>
            </div>
          </div>

          {/* Age Bracket Filter */}
          <div>
            <div className="flex justify-between text-[11px] font-semibold text-slate-500 mb-1">
              <span>Age Cohort Range:</span>
              <span className="font-mono text-slate-700 dark:text-slate-300">{ageMin} – {ageMax} yrs</span>
            </div>
            <div className="flex items-center gap-2">
              <input
                type="range"
                min="21"
                max="81"
                value={ageMin}
                onChange={(e) => setAgeMin(Math.min(parseInt(e.target.value), ageMax - 5))}
                className="w-full accent-teal-600 cursor-pointer"
              />
              <input
                type="range"
                min="21"
                max="81"
                value={ageMax}
                onChange={(e) => setAgeMax(Math.max(parseInt(e.target.value), ageMin + 5))}
                className="w-full accent-teal-600 cursor-pointer"
              />
            </div>
          </div>

          {/* Search Query */}
          <div>
            <label className="block text-[11px] font-semibold text-slate-500 mb-1">Quick Search (ID / Value):</label>
            <div className="relative">
              <Search className="w-3.5 h-3.5 absolute left-2.5 top-2.5 text-slate-400" />
              <input
                type="text"
                placeholder="Search by ID or measurement..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-8 pr-3 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs text-slate-900 dark:text-white placeholder-slate-400 focus:ring-1 focus:ring-teal-500"
              />
            </div>
          </div>
        </div>
      </div>

      {/* Navigation tabs */}
      <div className="flex items-center gap-2 border-b border-slate-200 dark:border-slate-800">
        <button
          onClick={() => setActiveTab('bivariate')}
          className={`px-4 py-2 text-xs font-bold border-b-2 transition-colors ${
            activeTab === 'bivariate'
              ? 'border-teal-600 text-teal-600 dark:text-teal-400'
              : 'border-transparent text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
          }`}
        >
          Bivariate Scatter Explorer
        </button>
        <button
          onClick={() => setActiveTab('distributions')}
          className={`px-4 py-2 text-xs font-bold border-b-2 transition-colors ${
            activeTab === 'distributions'
              ? 'border-teal-600 text-teal-600 dark:text-teal-400'
              : 'border-transparent text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
          }`}
        >
          Stratified Distributions
        </button>
        <button
          onClick={() => setActiveTab('correlations')}
          className={`px-4 py-2 text-xs font-bold border-b-2 transition-colors ${
            activeTab === 'correlations'
              ? 'border-teal-600 text-teal-600 dark:text-teal-400'
              : 'border-transparent text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
          }`}
        >
          Pearson Correlation Matrix
        </button>
        <button
          onClick={() => setActiveTab('table')}
          className={`px-4 py-2 text-xs font-bold border-b-2 transition-colors ${
            activeTab === 'table'
              ? 'border-teal-600 text-teal-600 dark:text-teal-400'
              : 'border-transparent text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
          }`}
        >
          Dataset Tabular Inspector
        </button>
      </div>

      {/* TAB 1: Bivariate Scatter Explorer */}
      {activeTab === 'bivariate' && (
        <div className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-xl p-5 shadow-xs space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-2 border-b border-slate-100 dark:border-slate-800">
            <div>
              <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                Bivariate Clinical Clustering
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Plot any two covariates to reveal non-linear cluster separation between classes
              </p>
            </div>

            <div className="flex items-center gap-2 text-xs">
              <span className="text-slate-500 font-medium">Axes:</span>
              <select
                value={scatterX}
                onChange={(e) => setScatterX(e.target.value as keyof PatientRecord)}
                className="bg-slate-100 dark:bg-slate-800 text-slate-800 dark:text-slate-200 rounded px-2.5 py-1 text-xs border-0"
              >
                {featureOptions.map((f) => (
                  <option key={f.id} value={f.id}>X: {f.label}</option>
                ))}
              </select>
              <select
                value={scatterY}
                onChange={(e) => setScatterY(e.target.value as keyof PatientRecord)}
                className="bg-slate-100 dark:bg-slate-800 text-slate-800 dark:text-slate-200 rounded px-2.5 py-1 text-xs border-0"
              >
                {featureOptions.map((f) => (
                  <option key={f.id} value={f.id}>Y: {f.label}</option>
                ))}
              </select>
            </div>
          </div>

          <div className="h-80 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <ScatterChart margin={{ top: 20, right: 20, bottom: 20, left: 10 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" opacity={0.6} />
                <XAxis
                  type="number"
                  dataKey="x"
                  name={scatterX}
                  tick={{ fontSize: 11, fill: '#64748B' }}
                />
                <YAxis
                  type="number"
                  dataKey="y"
                  name={scatterY}
                  tick={{ fontSize: 11, fill: '#64748B' }}
                />
                <Tooltip
                  cursor={{ strokeDasharray: '3 3' }}
                  content={({ payload }) => {
                    if (payload && payload.length) {
                      const data = payload[0].payload;
                      return (
                        <div className="bg-slate-900 text-white p-2.5 rounded-lg text-xs shadow-md border border-slate-700">
                          <p className="font-mono text-[11px] text-slate-400">Record #{data.id}</p>
                          <p className="font-semibold mt-1">{scatterX}: {data.x}</p>
                          <p className="font-semibold">{scatterY}: {data.y}</p>
                        </div>
                      );
                    }
                    return null;
                  }}
                />
                <Legend wrapperStyle={{ fontSize: '12px' }} />
                <Scatter name="Non-Diabetic (Class 0)" data={scatterNonDiabetic} fill="#0D9488" opacity={0.7} />
                <Scatter name="Diabetic (Class 1)" data={scatterDiabetic} fill="#E11D48" opacity={0.8} />
              </ScatterChart>
            </ResponsiveContainer>
          </div>
        </div>
      )}

      {/* TAB 2: Stratified Distributions */}
      {activeTab === 'distributions' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-xl p-5 shadow-xs">
            <h3 className="text-sm font-bold text-slate-900 dark:text-white mb-1">
              Fasting Blood Glucose Distribution
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 mb-4">Stratified patient counts across glycemic brackets</p>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={glucoseBins} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <XAxis dataKey="range" tick={{ fontSize: 11, fill: '#64748B' }} />
                  <YAxis tick={{ fontSize: 11, fill: '#64748B' }} />
                  <Tooltip contentStyle={{ backgroundColor: '#0F172A', borderRadius: '8px', color: '#fff', fontSize: '12px' }} />
                  <Legend wrapperStyle={{ fontSize: '11px' }} />
                  <Bar dataKey="nonDiabetic" name="Non-Diabetic" fill="#0D9488" radius={[3, 3, 0, 0]} />
                  <Bar dataKey="diabetic" name="Diabetic" fill="#E11D48" radius={[3, 3, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          <div className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-xl p-5 shadow-xs">
            <h3 className="text-sm font-bold text-slate-900 dark:text-white mb-1">
              Body Mass Index (BMI) Distribution
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 mb-4">Stratified patient counts across adiposity categories</p>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={bmiBins} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <XAxis dataKey="range" tick={{ fontSize: 11, fill: '#64748B' }} />
                  <YAxis tick={{ fontSize: 11, fill: '#64748B' }} />
                  <Tooltip contentStyle={{ backgroundColor: '#0F172A', borderRadius: '8px', color: '#fff', fontSize: '12px' }} />
                  <Legend wrapperStyle={{ fontSize: '11px' }} />
                  <Bar dataKey="nonDiabetic" name="Non-Diabetic" fill="#0D9488" radius={[3, 3, 0, 0]} />
                  <Bar dataKey="diabetic" name="Diabetic" fill="#E11D48" radius={[3, 3, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>
      )}

      {/* TAB 3: Pearson Correlation Matrix */}
      {activeTab === 'correlations' && (
        <div className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-xl p-5 shadow-xs space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                Biomarker Pearson Correlation Heatmap
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Linear correlation coefficients (r) between all 8 predictors and the target diagnosis outcome
              </p>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-xs text-left border-collapse">
              <thead>
                <tr className="border-b border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/50">
                  <th className="p-2.5 font-bold text-slate-700 dark:text-slate-300">Feature</th>
                  {Object.keys(modelBundle.correlations).map((f) => (
                    <th key={f} className="p-2.5 font-semibold text-slate-600 dark:text-slate-400 text-center capitalize">
                      {f.replace('_', ' ').slice(0, 7)}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800 font-mono">
                {Object.entries(modelBundle.correlations).map(([rowFeat, colMap]) => (
                  <tr key={rowFeat} className="hover:bg-slate-50 dark:hover:bg-slate-800/40">
                    <td className="p-2.5 font-bold font-sans text-slate-900 dark:text-white capitalize">
                      {rowFeat.replace('_', ' ')}
                    </td>
                    {Object.entries(colMap).map(([colFeat, rVal]) => {
                      // Color cell according to correlation intensity
                      let bg = 'bg-transparent text-slate-700 dark:text-slate-300';
                      if (rVal === 1) bg = 'bg-slate-200 dark:bg-slate-700 font-bold';
                      else if (rVal >= 0.4) bg = 'bg-rose-100 dark:bg-rose-950/60 text-rose-800 dark:text-rose-300 font-bold';
                      else if (rVal >= 0.2) bg = 'bg-orange-50 dark:bg-orange-950/40 text-orange-800 dark:text-orange-300';
                      else if (rVal <= -0.1) bg = 'bg-teal-50 dark:bg-teal-950/40 text-teal-800 dark:text-teal-300';

                      return (
                        <td key={colFeat} className={`p-2.5 text-center rounded-sm ${bg}`}>
                          {rVal > 0 && rVal !== 1 ? `+${rVal.toFixed(2)}` : rVal.toFixed(2)}
                        </td>
                      );
                    })}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="p-3 rounded-lg bg-slate-50 dark:bg-slate-800/50 border border-slate-200/60 dark:border-slate-800 text-[11px] text-slate-500 dark:text-slate-400 flex items-start gap-2">
            <Info className="w-4 h-4 text-teal-600 shrink-0 mt-0.5" />
            <span>
              <strong>Clinical Context:</strong> Plasma Glucose exhibits the highest individual linear correlation with diabetes outcome (r ≈ +0.47), followed by BMI (r ≈ +0.31) and Patient Age (r ≈ +0.24). Note that correlation measures linear association and does not capture complex multi-tree interaction terms.
            </span>
          </div>
        </div>
      )}

      {/* TAB 4: Dataset Tabular Inspector */}
      {activeTab === 'table' && (
        <div className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-xl p-5 shadow-xs space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                Patient Observation Records
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Displaying {paginatedData.length} records on page {currentPage} of {totalPages}
              </p>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-xs text-left border-collapse">
              <thead>
                <tr className="border-b border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/50 text-[11px] font-bold text-slate-700 dark:text-slate-300">
                  <th className="p-2.5">ID</th>
                  <th className="p-2.5">Glucose</th>
                  <th className="p-2.5">BMI</th>
                  <th className="p-2.5">Age</th>
                  <th className="p-2.5">Blood Pressure</th>
                  <th className="p-2.5">Insulin</th>
                  <th className="p-2.5">Pedigree</th>
                  <th className="p-2.5">Outcome</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800 font-mono">
                {paginatedData.map((d) => (
                  <tr key={d.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/50">
                    <td className="p-2.5 font-bold text-slate-500">#{d.id}</td>
                    <td className="p-2.5 font-semibold text-slate-900 dark:text-white">{d.glucose} mg/dL</td>
                    <td className="p-2.5">{d.bmi.toFixed(1)}</td>
                    <td className="p-2.5">{d.age} yrs</td>
                    <td className="p-2.5">{d.blood_pressure} mm Hg</td>
                    <td className="p-2.5">{d.insulin} µU/mL</td>
                    <td className="p-2.5">{d.diabetes_pedigree.toFixed(3)}</td>
                    <td className="p-2.5">
                      <span
                        className={`px-2 py-0.5 rounded text-[10px] font-semibold font-sans ${
                          d.outcome === 1
                            ? 'bg-rose-100 text-rose-800 dark:bg-rose-950/60 dark:text-rose-300'
                            : 'bg-teal-100 text-teal-800 dark:bg-teal-950/60 dark:text-teal-300'
                        }`}
                      >
                        {d.outcome === 1 ? 'Diabetic (1)' : 'Non-Diabetic (0)'}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Pagination controls */}
          <div className="flex items-center justify-between pt-3 border-t border-slate-100 dark:border-slate-800 text-xs">
            <span className="text-slate-500 dark:text-slate-400">
              Page {currentPage} of {totalPages}
            </span>
            <div className="flex items-center gap-1.5">
              <button
                disabled={currentPage <= 1}
                onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                className="px-3 py-1 rounded border border-slate-200 dark:border-slate-700 disabled:opacity-40 text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800"
              >
                Previous
              </button>
              <button
                disabled={currentPage >= totalPages}
                onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                className="px-3 py-1 rounded border border-slate-200 dark:border-slate-700 disabled:opacity-40 text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800"
              >
                Next
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
