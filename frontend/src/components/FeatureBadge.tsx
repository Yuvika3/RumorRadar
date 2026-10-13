import React from 'react';

interface FeatureBadgeProps {
  mode: string;
}

export const FeatureBadge: React.FC<FeatureBadgeProps> = ({ mode }) => {
  const getBadgeConfig = () => {
    switch (mode) {
      case 'text_only':
        return {
          label: 'Text TF-IDF Baseline',
          classes: 'bg-slate-800 text-slate-300 border-slate-700'
        };
      case 'sentiment_emotion_only':
        return {
          label: 'Sentiment & Emotion Only',
          classes: 'bg-amber-950/60 text-amber-300 border-amber-800/60'
        };
      case 'text_sentiment_emotion':
        return {
          label: 'Text + Emotion Fusion',
          classes: 'bg-purple-950/60 text-purple-300 border-purple-800/60'
        };
      case 'text_engagement':
        return {
          label: 'Text + Engagement',
          classes: 'bg-emerald-950/60 text-emerald-300 border-emerald-800/60'
        };
      case 'combined':
        return {
          label: 'Multimodal Fusion (All)',
          classes: 'bg-cyan-950/80 text-cyan-300 border-cyan-500/60 shadow-[0_0_10px_rgba(6,182,212,0.25)] font-semibold'
        };
      default:
        return {
          label: mode,
          classes: 'bg-slate-800 text-slate-300 border-slate-700'
        };
    }
  };

  const config = getBadgeConfig();

  return (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-mono border ${config.classes}`}>
      {config.label}
    </span>
  );
};
