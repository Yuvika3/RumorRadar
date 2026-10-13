import React from 'react';
import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  ReferenceLine
} from 'recharts';
import { CurvePoint } from '../types';

interface RocPrCurvesViewProps {
  rocCurve?: CurvePoint[];
  prCurve?: CurvePoint[];
  rocAuc?: number;
  prAuc?: number;
}

export const RocPrCurvesView: React.FC<RocPrCurvesViewProps> = ({
  rocCurve = [],
  prCurve = [],
  rocAuc,
  prAuc
}) => {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      {/* ROC Curve */}
      <div className="glass-panel rounded-xl p-5 border border-slate-800">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h4 className="text-sm font-semibold text-slate-200">Receiver Operating Characteristic (ROC)</h4>
            <span className="text-xs text-slate-400">True Positive Rate vs. False Positive Rate</span>
          </div>
          {rocAuc !== undefined && (
            <div className="px-2.5 py-1 rounded-md bg-cyan-950 border border-cyan-800 text-cyan-400 text-xs font-mono font-bold">
              ROC-AUC: {rocAuc.toFixed(4)}
            </div>
          )}
        </div>

        <div className="h-64 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={rocCurve} margin={{ top: 10, right: 15, left: -10, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
              <XAxis
                dataKey="x"
                domain={[0, 1]}
                type="number"
                tick={{ fill: '#94a3b8', fontSize: 11 }}
                label={{ value: 'False Positive Rate', position: 'insideBottom', offset: -2, fill: '#64748b', fontSize: 10 }}
              />
              <YAxis
                domain={[0, 1]}
                tick={{ fill: '#94a3b8', fontSize: 11 }}
                label={{ value: 'True Positive Rate', angle: -90, position: 'insideLeft', fill: '#64748b', fontSize: 10 }}
              />
              <Tooltip
                contentStyle={{ backgroundColor: '#0b1329', borderColor: '#1e293b', borderRadius: '8px', color: '#f8fafc' }}
                formatter={(val: any) => [Number(val).toFixed(4), 'TPR']}
                labelFormatter={(label: any) => `FPR: ${Number(label).toFixed(4)}`}
              />
              {/* Chance diagonal */}
              <ReferenceLine segment={[{ x: 0, y: 0 }, { x: 1, y: 1 }]} stroke="#475569" strokeDasharray="3 3" />
              <Line
                type="monotone"
                dataKey="y"
                stroke="#06b6d4"
                strokeWidth={2.5}
                dot={false}
                activeDot={{ r: 5, fill: '#22d3ee' }}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Precision-Recall Curve */}
      <div className="glass-panel rounded-xl p-5 border border-slate-800">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h4 className="text-sm font-semibold text-slate-200">Precision-Recall (PR) Curve</h4>
            <span className="text-xs text-slate-400">Precision vs. Recall Across Confidence Thresholds</span>
          </div>
          {prAuc !== undefined && (
            <div className="px-2.5 py-1 rounded-md bg-purple-950 border border-purple-800 text-purple-300 text-xs font-mono font-bold">
              PR-AUC: {prAuc.toFixed(4)}
            </div>
          )}
        </div>

        <div className="h-64 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={prCurve} margin={{ top: 10, right: 15, left: -10, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
              <XAxis
                dataKey="x"
                domain={[0, 1]}
                type="number"
                tick={{ fill: '#94a3b8', fontSize: 11 }}
                label={{ value: 'Recall', position: 'insideBottom', offset: -2, fill: '#64748b', fontSize: 10 }}
              />
              <YAxis
                domain={[0, 1]}
                tick={{ fill: '#94a3b8', fontSize: 11 }}
                label={{ value: 'Precision', angle: -90, position: 'insideLeft', fill: '#64748b', fontSize: 10 }}
              />
              <Tooltip
                contentStyle={{ backgroundColor: '#0b1329', borderColor: '#1e293b', borderRadius: '8px', color: '#f8fafc' }}
                formatter={(val: any) => [Number(val).toFixed(4), 'Precision']}
                labelFormatter={(label: any) => `Recall: ${Number(label).toFixed(4)}`}
              />
              <Line
                type="monotone"
                dataKey="y"
                stroke="#a855f7"
                strokeWidth={2.5}
                dot={false}
                activeDot={{ r: 5, fill: '#c084fc' }}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
};
