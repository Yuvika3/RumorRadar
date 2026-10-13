import React from 'react';
import { LucideIcon } from 'lucide-react';

interface MetricCardProps {
  title: string;
  value: string | number;
  subtitle?: string;
  icon: LucideIcon;
  badge?: string;
  badgeColor?: 'cyan' | 'emerald' | 'amber' | 'slate';
  glow?: boolean;
}

export const MetricCard: React.FC<MetricCardProps> = ({
  title,
  value,
  subtitle,
  icon: Icon,
  badge,
  badgeColor = 'cyan',
  glow = false
}) => {
  const getBadgeClass = () => {
    switch (badgeColor) {
      case 'emerald':
        return 'bg-emerald-950 text-emerald-400 border-emerald-800';
      case 'amber':
        return 'bg-amber-950 text-amber-400 border-amber-800';
      case 'slate':
        return 'bg-slate-800 text-slate-300 border-slate-700';
      default:
        return 'bg-cyan-950 text-cyan-400 border-cyan-800';
    }
  };

  return (
    <div
      className={`rounded-xl p-5 transition-all duration-200 border ${
        glow ? 'glass-panel-glow' : 'glass-panel'
      }`}
    >
      <div className="flex items-center justify-between mb-3">
        <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">{title}</span>
        <div className="p-2 rounded-lg bg-navy-800/80 text-cyan-400 border border-slate-700/60">
          <Icon className="w-4 h-4" />
        </div>
      </div>
      <div className="flex items-baseline justify-between">
        <div className="text-2xl font-bold font-mono text-slate-100">{value}</div>
        {badge && (
          <span className={`text-xs px-2 py-0.5 rounded border font-mono ${getBadgeClass()}`}>
            {badge}
          </span>
        )}
      </div>
      {subtitle && <p className="text-xs text-slate-400 mt-2">{subtitle}</p>}
    </div>
  );
};
