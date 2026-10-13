import React, { useEffect, useState } from 'react';
import { api } from '../services/api';
import {
  Radar,
  Activity,
  Layers,
  Database,
  FlaskConical,
  BarChart3,
  FileText,
  BookOpen,
  Sparkles,
  Server
} from 'lucide-react';

interface NavbarProps {
  currentTab: string;
  onTabChange: (tab: string) => void;
  onOpenInference: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  currentTab,
  onTabChange,
  onOpenInference
}) => {
  const [health, setHealth] = useState<any>(null);

  useEffect(() => {
    const checkHealth = async () => {
      try {
        const h = await api.getHealth();
        setHealth(h);
      } catch (err) {
        setHealth({ status: 'unreachable' });
      }
    };
    checkHealth();
    const interval = setInterval(checkHealth, 30000);
    return () => clearInterval(interval);
  }, []);

  const navItems = [
    { id: 'home', label: 'Home', icon: Radar },
    { id: 'dashboard', label: 'Dashboard', icon: BarChart3 },
    { id: 'explorer', label: 'Data Explorer', icon: Database },
    { id: 'lab', label: 'Experiment Lab', icon: FlaskConical },
    { id: 'comparison', label: 'Model Comparison', icon: Layers },
    { id: 'analytics', label: 'Emotion & Social', icon: Activity },
    { id: 'report', label: 'Research Report', icon: FileText },
    { id: 'methodology', label: 'Methodology', icon: BookOpen },
  ];

  const isMlHealthy = health?.mlService?.status === 'healthy';

  return (
    <header className="sticky top-0 z-40 w-full border-b border-slate-800/80 bg-navy-950/90 backdrop-blur-md">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo & Brand */}
          <div
            onClick={() => onTabChange('home')}
            className="flex items-center gap-3 cursor-pointer group"
          >
            <div className="relative flex items-center justify-center w-10 h-10 rounded-xl bg-gradient-to-tr from-cyan-600 to-cyan-400 text-slate-950 font-bold shadow-[0_0_20px_rgba(6,182,212,0.4)] group-hover:scale-105 transition-transform">
              <Radar className="w-6 h-6 animate-spin [animation-duration:8s]" />
              <div className="absolute inset-0 rounded-xl bg-cyan-400 animate-ping opacity-20" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-lg font-extrabold tracking-tight text-white">
                  Rumor<span className="text-cyan-400">Radar</span>
                </span>
                <span className="text-[10px] uppercase font-mono px-1.5 py-0.5 rounded bg-cyan-950 text-cyan-300 border border-cyan-800">
                  Research
                </span>
              </div>
              <p className="text-[10px] text-slate-400 leading-tight hidden sm:block">
                Misinformation Analytics Platform
              </p>
            </div>
          </div>

          {/* Navigation Links */}
          <nav className="hidden lg:flex items-center gap-1">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = currentTab === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => onTabChange(item.id)}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all duration-150 ${
                    isActive
                      ? 'bg-cyan-950/80 text-cyan-300 border border-cyan-800/60 shadow-[0_0_10px_rgba(6,182,212,0.2)]'
                      : 'text-slate-300 hover:text-slate-100 hover:bg-slate-800/50'
                  }`}
                >
                  <Icon className="w-3.5 h-3.5" />
                  {item.label}
                </button>
              );
            })}
          </nav>

          {/* Right Status Badges & Quick Action */}
          <div className="flex items-center gap-3">
            {/* System Status Indicator */}
            <div className="hidden sm:flex items-center gap-2 px-2.5 py-1 rounded-lg bg-navy-900 border border-slate-800 text-[11px] font-mono">
              <div className="flex items-center gap-1.5">
                <span className={`w-2 h-2 rounded-full ${isMlHealthy ? 'bg-emerald-400 shadow-[0_0_8px_#34d399]' : 'bg-amber-400'}`} />
                <span className="text-slate-400">ML:</span>
                <span className={isMlHealthy ? 'text-emerald-400 font-semibold' : 'text-amber-400'}>
                  {isMlHealthy ? 'Online' : 'Standby'}
                </span>
              </div>
              <span className="text-slate-600">|</span>
              <div className="flex items-center gap-1 text-slate-400">
                <Server className="w-3 h-3 text-slate-400" />
                <span>{health?.database?.mode === 'MongoDB' ? 'MongoDB' : 'Store'}</span>
              </div>
            </div>

            {/* Live Inference CTA */}
            <button
              onClick={onOpenInference}
              className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg bg-cyan-500/10 hover:bg-cyan-500/20 text-cyan-400 border border-cyan-500/40 text-xs font-semibold transition-all duration-200 shadow-[0_0_12px_rgba(6,182,212,0.15)]"
            >
              <Sparkles className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Test Claim</span>
            </button>
          </div>
        </div>

        {/* Mobile Navigation bar */}
        <div className="lg:hidden flex items-center gap-1 overflow-x-auto py-2 border-t border-slate-800/60 no-scrollbar">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = currentTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => onTabChange(item.id)}
                className={`flex items-center gap-1 px-2.5 py-1 rounded-md text-xs whitespace-nowrap ${
                  isActive
                    ? 'bg-cyan-950 text-cyan-300 border border-cyan-800'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                <Icon className="w-3 h-3" />
                {item.label}
              </button>
            );
          })}
        </div>
      </div>
    </header>
  );
};
