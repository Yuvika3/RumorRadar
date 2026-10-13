import React from 'react';
import { ConfusionMatrix } from '../types';

interface ConfusionMatrixViewProps {
  cm: ConfusionMatrix;
  title?: string;
}

export const ConfusionMatrixView: React.FC<ConfusionMatrixViewProps> = ({
  cm,
  title = 'Held-Out Test Set Confusion Matrix'
}) => {
  const { tn, fp, fn, tp } = cm;
  const total = tn + fp + fn + tp;

  const tnPct = total > 0 ? ((tn / total) * 100).toFixed(1) : '0';
  const fpPct = total > 0 ? ((fp / total) * 100).toFixed(1) : '0';
  const fnPct = total > 0 ? ((fn / total) * 100).toFixed(1) : '0';
  const tpPct = total > 0 ? ((tp / total) * 100).toFixed(1) : '0';

  // Derived rates
  const actualRealTotal = tn + fp;
  const actualFakeTotal = fn + tp;
  const specificity = actualRealTotal > 0 ? ((tn / actualRealTotal) * 100).toFixed(1) : '0';
  const recallSensitivity = actualFakeTotal > 0 ? ((tp / actualFakeTotal) * 100).toFixed(1) : '0';
  const precision = (tp + fp) > 0 ? ((tp / (tp + fp)) * 100).toFixed(1) : '0';

  return (
    <div className="glass-panel rounded-xl p-5 border border-slate-800">
      <div className="flex items-center justify-between mb-4">
        <h4 className="text-sm font-semibold text-slate-200">{title}</h4>
        <span className="text-xs font-mono text-slate-400">Total Test Samples: {total}</span>
      </div>

      <div className="overflow-x-auto">
        <div className="min-w-[340px]">
          {/* Header Row */}
          <div className="grid grid-cols-3 gap-2 text-center text-xs font-medium text-slate-400 mb-2">
            <div></div>
            <div className="py-1 px-2 rounded bg-navy-800/60 border border-slate-800 text-cyan-400">
              Pred: Real (0)
            </div>
            <div className="py-1 px-2 rounded bg-navy-800/60 border border-slate-800 text-rose-400">
              Pred: Fake (1)
            </div>
          </div>

          {/* Actual Real Row */}
          <div className="grid grid-cols-3 gap-2 mb-2 items-center">
            <div className="text-xs font-medium text-cyan-400 text-right pr-2">
              Actual: Real (0)
            </div>
            {/* True Negative */}
            <div className="p-3 rounded-lg bg-emerald-950/40 border border-emerald-800/50 text-center">
              <div className="text-lg font-bold font-mono text-emerald-400">{tn}</div>
              <div className="text-[10px] text-emerald-300/80 font-medium uppercase tracking-wider">
                TN ({tnPct}%)
              </div>
            </div>
            {/* False Positive */}
            <div className="p-3 rounded-lg bg-rose-950/30 border border-rose-900/40 text-center">
              <div className="text-lg font-bold font-mono text-rose-400">{fp}</div>
              <div className="text-[10px] text-rose-300/80 font-medium uppercase tracking-wider">
                FP ({fpPct}%)
              </div>
            </div>
          </div>

          {/* Actual Fake Row */}
          <div className="grid grid-cols-3 gap-2 items-center">
            <div className="text-xs font-medium text-rose-400 text-right pr-2">
              Actual: Fake (1)
            </div>
            {/* False Negative */}
            <div className="p-3 rounded-lg bg-amber-950/30 border border-amber-900/40 text-center">
              <div className="text-lg font-bold font-mono text-amber-400">{fn}</div>
              <div className="text-[10px] text-amber-300/80 font-medium uppercase tracking-wider">
                FN ({fnPct}%)
              </div>
            </div>
            {/* True Positive */}
            <div className="p-3 rounded-lg bg-cyan-950/50 border border-cyan-800/60 text-center shadow-[0_0_10px_rgba(6,182,212,0.15)]">
              <div className="text-lg font-bold font-mono text-cyan-300">{tp}</div>
              <div className="text-[10px] text-cyan-200/90 font-medium uppercase tracking-wider">
                TP ({tpPct}%)
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Diagnostics summary */}
      <div className="grid grid-cols-3 gap-2 mt-4 pt-4 border-t border-slate-800/80 text-center text-xs">
        <div className="p-2 rounded bg-navy-900/80 border border-slate-800">
          <span className="text-slate-400 block text-[10px]">Recall / Sens.</span>
          <span className="font-mono font-bold text-cyan-400">{recallSensitivity}%</span>
        </div>
        <div className="p-2 rounded bg-navy-900/80 border border-slate-800">
          <span className="text-slate-400 block text-[10px]">Specificity</span>
          <span className="font-mono font-bold text-emerald-400">{specificity}%</span>
        </div>
        <div className="p-2 rounded bg-navy-900/80 border border-slate-800">
          <span className="text-slate-400 block text-[10px]">Precision</span>
          <span className="font-mono font-bold text-cyan-300">{precision}%</span>
        </div>
      </div>
    </div>
  );
};
