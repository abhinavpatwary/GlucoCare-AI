/**
 * GlucoCare AI — Diabetes Risk Prediction & Preventive Healthcare Intelligence
 * Minor / Major Academic Project Exhibition System
 */

import React, { useState, useEffect } from 'react';
import { Navbar } from './components/Navbar';
import { Sidebar, NavTab } from './components/Sidebar';
import { Overview } from './components/views/Overview';
import { RiskAssessment } from './components/views/RiskAssessment';
import { PredictionResult } from './components/views/PredictionResult';
import { HealthAnalytics } from './components/views/HealthAnalytics';
import { ModelPerformance } from './components/views/ModelPerformance';
import { PredictionHistory } from './components/views/PredictionHistory';
import { AboutProject } from './components/views/AboutProject';
import { PresentationMode } from './components/views/PresentationMode';

import { ModelType, PredictionOutput } from './types/diabetes';
import { getSessionHistory, savePredictionToHistory } from './services/storage';
import { checkBackendHealth } from './services/apiClient';
import { runInference } from './ml/inferenceEngine';

export default function App() {
  // Navigation & View state
  const [activeTab, setActiveTab] = useState<NavTab>('overview');
  const [activePrediction, setActivePrediction] = useState<PredictionOutput | null>(null);
  const [selectedModelType, setSelectedModelType] = useState<ModelType>('random_forest');

  // Presentation Deck & Mobile Menu
  const [presentationOpen, setPresentationOpen] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  // Theme
  const [isDark, setIsDark] = useState<boolean>(() => {
    return localStorage.getItem('theme') === 'dark';
  });

  // History & API status
  const [history, setHistory] = useState<PredictionOutput[]>([]);
  const [apiStatus, setApiStatus] = useState<{ status: string; engine: string }>({
    status: 'checking',
    engine: 'ML Pipeline Mirror'
  });

  // Initialize
  useEffect(() => {
    // Apply dark class
    if (isDark) {
      document.documentElement.classList.add('dark');
      localStorage.setItem('theme', 'dark');
    } else {
      document.documentElement.classList.remove('dark');
      localStorage.setItem('theme', 'light');
    }
  }, [isDark]);

  useEffect(() => {
    // Load session history
    const saved = getSessionHistory();
    setHistory(saved);

    // Check backend health
    checkBackendHealth().then((status) => {
      setApiStatus(status);
    });
  }, []);

  const handleToggleTheme = () => {
    setIsDark((prev) => !prev);
  };

  const handlePredictionComplete = (pred: PredictionOutput) => {
    setActivePrediction(pred);
    const updated = savePredictionToHistory(pred);
    setHistory(updated);
  };

  const handleSelectPredictionFromList = (pred: PredictionOutput) => {
    setActivePrediction(pred);
    setActiveTab('assessment');
  };

  // Instant 1-click Demo in Navbar
  const handleQuickDemo = () => {
    // Impaired fasting pre-diabetic clinical profile
    const demoInputs = {
      glucose: 142.0,
      bmi: 31.8,
      age: 48,
      blood_pressure: 82.0,
      diabetes_pedigree: 0.62,
      insulin: 165.0,
      pregnancies: 2,
      skin_thickness: 30.0
    };
    const pred = runInference(demoInputs, selectedModelType);
    setActivePrediction(pred);
    const updated = savePredictionToHistory(pred);
    setHistory(updated);
    setActiveTab('assessment');
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 flex flex-col font-sans transition-colors">
      {/* Top Navigation */}
      <Navbar
        onQuickDemo={handleQuickDemo}
        onOpenPresentation={() => setPresentationOpen(true)}
        isDark={isDark}
        onToggleTheme={handleToggleTheme}
        mobileMenuOpen={mobileMenuOpen}
        onToggleMobileMenu={() => setMobileMenuOpen((prev) => !prev)}
        apiStatus={apiStatus}
      />

      {/* Main Body with Sidebar + Content */}
      <div className="flex-1 flex max-w-[1600px] w-full mx-auto">
        <Sidebar
          activeTab={activeTab}
          onSelectTab={(tab) => {
            setActiveTab(tab);
            // If leaving assessment, don't necessarily clear active prediction, but allow viewing the form
          }}
          historyCount={history.length}
          mobileMenuOpen={mobileMenuOpen}
          onCloseMobileMenu={() => setMobileMenuOpen(false)}
        />

        {/* Content Area */}
        <main className="flex-1 p-4 sm:p-6 lg:p-8 overflow-y-auto">
          {/* OVERVIEW TAB */}
          {activeTab === 'overview' && (
            <Overview
              onStartAssessment={() => {
                setActivePrediction(null);
                setActiveTab('assessment');
              }}
              onViewAnalytics={() => setActiveTab('analytics')}
              onViewModelPerformance={() => setActiveTab('performance')}
              recentPredictions={history}
              onSelectPrediction={handleSelectPredictionFromList}
            />
          )}

          {/* RISK ASSESSMENT TAB */}
          {activeTab === 'assessment' && (
            <>
              {activePrediction ? (
                <PredictionResult
                  prediction={activePrediction}
                  onBackToAssessment={() => setActivePrediction(null)}
                  onSaveToHistory={(pred) => {
                    const updated = savePredictionToHistory(pred);
                    setHistory(updated);
                  }}
                  isSaved={history.some((h) => h.id === activePrediction.id)}
                />
              ) : (
                <RiskAssessment
                  onPredictionComplete={handlePredictionComplete}
                  selectedModelType={selectedModelType}
                  onChangeModelType={setSelectedModelType}
                />
              )}
            </>
          )}

          {/* HEALTH ANALYTICS TAB */}
          {activeTab === 'analytics' && <HealthAnalytics />}

          {/* MODEL PERFORMANCE TAB */}
          {activeTab === 'performance' && <ModelPerformance />}

          {/* PREDICTION HISTORY TAB */}
          {activeTab === 'history' && (
            <PredictionHistory
              history={history}
              onSelectPrediction={handleSelectPredictionFromList}
              onClearHistory={() => setHistory([])}
              onNewAssessment={() => {
                setActivePrediction(null);
                setActiveTab('assessment');
              }}
            />
          )}

          {/* ABOUT PROJECT TAB */}
          {activeTab === 'about' && <AboutProject />}
        </main>
      </div>

      {/* Presentation Deck Modal */}
      {presentationOpen && (
        <PresentationMode onClose={() => setPresentationOpen(false)} />
      )}
    </div>
  );
}
