import React from 'react';
import { RiskTier } from '../types/diabetes';

interface RiskGaugeProps {
  score: number; // 0 to 100
  tier: RiskTier;
  size?: number;
}

export const RiskGauge: React.FC<RiskGaugeProps> = ({ score, tier, size = 220 }) => {
  // Semi-circle gauge (180 degrees)
  const strokeWidth = 16;
  const radius = (size - strokeWidth * 2) / 2;
  const center = size / 2;
  const clampedScore = Math.max(0, Math.min(100, score));

  // Circumference of semi-circle: PI * radius
  const arcLength = Math.PI * radius;
  const strokeDashoffset = arcLength - (clampedScore / 100) * arcLength;

  // Tier color mapping
  const getTierColor = () => {
    switch (tier) {
      case 'High Risk':
        return { stroke: '#E11D48', bg: 'bg-rose-500/10 text-rose-700 dark:text-rose-400 border-rose-300 dark:border-rose-800' };
      case 'Elevated Risk':
        return { stroke: '#F97316', bg: 'bg-orange-500/10 text-orange-700 dark:text-orange-400 border-orange-300 dark:border-orange-800' };
      case 'Borderline / Moderate':
        return { stroke: '#F59E0B', bg: 'bg-amber-500/10 text-amber-700 dark:text-amber-400 border-amber-300 dark:border-amber-800' };
      case 'Low Risk':
      default:
        return { stroke: '#0D9488', bg: 'bg-teal-500/10 text-teal-700 dark:text-teal-400 border-teal-300 dark:border-teal-800' };
    }
  };

  const { stroke, bg } = getTierColor();

  return (
    <div className="flex flex-col items-center justify-center">
      <div className="relative" style={{ width: size, height: size / 2 + 30 }}>
        <svg width={size} height={size / 2 + 20} className="overflow-visible">
          <defs>
            <linearGradient id="gaugeGradient" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="#0D9488" />
              <stop offset="35%" stopColor="#F59E0B" />
              <stop offset="70%" stopColor="#F97316" />
              <stop offset="100%" stopColor="#E11D48" />
            </linearGradient>
          </defs>

          {/* Background Track Arc */}
          <path
            d={`M ${strokeWidth} ${center} A ${radius} ${radius} 0 0 1 ${size - strokeWidth} ${center}`}
            fill="none"
            stroke="currentColor"
            strokeWidth={strokeWidth}
            className="text-slate-200 dark:text-slate-800 stroke-current"
            strokeLinecap="round"
          />

          {/* Dynamic Score Arc */}
          <path
            d={`M ${strokeWidth} ${center} A ${radius} ${radius} 0 0 1 ${size - strokeWidth} ${center}`}
            fill="none"
            stroke={stroke}
            strokeWidth={strokeWidth}
            strokeDasharray={arcLength}
            strokeDashoffset={strokeDashoffset}
            strokeLinecap="round"
            style={{ transition: 'stroke-dashoffset 0.8s ease-out, stroke 0.4s ease' }}
          />

          {/* Scale labels */}
          <text x={strokeWidth + 4} y={center + 18} className="text-[10px] fill-slate-400 font-mono font-medium">0%</text>
          <text x={center} y={center - radius + 14} className="text-[10px] fill-slate-400 font-mono font-medium" textAnchor="middle">50%</text>
          <text x={size - strokeWidth - 4} y={center + 18} className="text-[10px] fill-slate-400 font-mono font-medium" textAnchor="end">100%</text>
        </svg>

        {/* Center score readout */}
        <div className="absolute inset-x-0 bottom-0 flex flex-col items-center justify-center">
          <span className="text-4xl font-extrabold tracking-tight text-slate-900 dark:text-white font-mono">
            {clampedScore}<span className="text-xl text-slate-400 font-sans font-normal">/100</span>
          </span>
          <span className="text-xs uppercase tracking-wider font-semibold text-slate-500 dark:text-slate-400 mt-0.5">
            Statistical Risk Score
          </span>
        </div>
      </div>

      {/* Tier Badge */}
      <div className={`mt-3 px-3.5 py-1 rounded-full border text-xs font-semibold tracking-wide ${bg}`}>
        {tier}
      </div>
    </div>
  );
};
