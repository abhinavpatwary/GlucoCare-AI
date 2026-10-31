import React from 'react';
import {
  Activity,
  ShieldCheck,
  Sparkles,
  Presentation,
  Moon,
  Sun,
  Menu,
  X
} from 'lucide-react';

interface NavbarProps {
  onQuickDemo: () => void;
  onOpenPresentation: () => void;
  isDark: boolean;
  onToggleTheme: () => void;
  mobileMenuOpen: boolean;
  onToggleMobileMenu: () => void;
  apiStatus: { status: string; engine: string };
}

export const Navbar: React.FC<NavbarProps> = ({
  onQuickDemo,
  onOpenPresentation,
  isDark,
  onToggleTheme,
  mobileMenuOpen,
  onToggleMobileMenu,
  apiStatus
}) => {
  return (
    <header className="sticky top-0 z-30 h-16 bg-white/90 dark:bg-slate-900/90 backdrop-blur-md border-b border-slate-200 dark:border-slate-800 transition-colors">
      <div className="h-full px-4 sm:px-6 flex items-center justify-between">
        {/* Left: Mobile hamburger & Logo */}
        <div className="flex items-center gap-3">
          <button
            onClick={onToggleMobileMenu}
            className="p-2 -ml-2 rounded-lg text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 md:hidden"
            aria-label="Toggle Navigation"
          >
            {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>

          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-slate-900 via-teal-900 to-teal-600 flex items-center justify-center text-white shadow-xs">
              <Activity className="w-5 h-5 text-teal-300" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-extrabold text-base tracking-tight text-slate-900 dark:text-white">
                  GlucoCare<span className="text-teal-600 dark:text-teal-400">.AI</span>
                </span>
                <span className="hidden sm:inline-flex items-center px-2 py-0.5 rounded text-[10px] font-semibold bg-teal-50 dark:bg-teal-950/60 text-teal-700 dark:text-teal-300 border border-teal-200 dark:border-teal-800">
                  CLINICAL ML v1.0
                </span>
              </div>
              <p className="text-[11px] text-slate-500 dark:text-slate-400 font-medium hidden md:block -mt-0.5">
                Diabetes Risk Prediction & Preventive Intelligence
              </p>
            </div>
          </div>
        </div>

        {/* Center / Right: Engine status badge and actions */}
        <div className="flex items-center gap-2 sm:gap-3">
          {/* Status Indicator */}
          <div className="hidden lg:flex items-center gap-2 px-3 py-1.5 rounded-full bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 text-xs">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
            <span className="text-slate-600 dark:text-slate-300 font-medium">{apiStatus.engine}</span>
            <ShieldCheck className="w-3.5 h-3.5 text-teal-600 dark:text-teal-400 ml-0.5" />
          </div>

          {/* Quick Demo Button */}
          <button
            onClick={onQuickDemo}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-lg bg-teal-50 hover:bg-teal-100 dark:bg-teal-950/60 dark:hover:bg-teal-900/80 text-teal-800 dark:text-teal-300 border border-teal-200 dark:border-teal-800 transition-colors"
            title="Load demo clinical patient and calculate risk"
          >
            <Sparkles className="w-3.5 h-3.5 text-teal-600 dark:text-teal-400" />
            <span className="hidden xs:inline">Instant</span> Demo
          </button>

          {/* Exhibition / Viva Presentation Mode */}
          <button
            onClick={onOpenPresentation}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-lg bg-slate-900 hover:bg-slate-800 dark:bg-slate-100 dark:hover:bg-white text-white dark:text-slate-900 transition-colors shadow-xs"
            title="Exhibition and Viva Defense Presentation Deck"
          >
            <Presentation className="w-3.5 h-3.5 text-teal-400 dark:text-teal-600" />
            <span className="hidden sm:inline">Exhibition</span> Deck
          </button>

          {/* Theme toggle */}
          <button
            onClick={onToggleTheme}
            className="p-2 rounded-lg text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
            aria-label="Toggle theme"
          >
            {isDark ? <Sun className="w-4 h-4 text-amber-400" /> : <Moon className="w-4 h-4" />}
          </button>
        </div>
      </div>
    </header>
  );
};
