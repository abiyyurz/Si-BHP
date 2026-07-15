import React from 'react';

export const MetricCard = ({ title, value, unit = '', icon: Icon, color = 'blue', badgeText, subtitle }) => {
  const colorStyles = {
    blue: 'bg-blue-50 text-blue-600 dark:bg-blue-950/60 dark:text-blue-400 border-blue-200 dark:border-blue-800',
    amber: 'bg-amber-50 text-amber-600 dark:bg-amber-950/60 dark:text-amber-400 border-amber-200 dark:border-amber-800',
    emerald: 'bg-emerald-50 text-emerald-600 dark:bg-emerald-950/60 dark:text-emerald-400 border-emerald-200 dark:border-emerald-800',
    rose: 'bg-rose-50 text-rose-600 dark:bg-rose-950/60 dark:text-rose-400 border-rose-200 dark:border-rose-800',
    purple: 'bg-purple-50 text-purple-600 dark:bg-purple-950/60 dark:text-purple-400 border-purple-200 dark:border-purple-800'
  };

  return (
    <div className="relative p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800/80 shadow-sm hover:shadow-md transition-all duration-200 group overflow-hidden">
      <div className="flex items-start justify-between">
        <div>
          <p className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-1">
            {title}
          </p>
          <div className="flex items-baseline gap-2">
            <h4 className="text-2xl font-black text-slate-900 dark:text-slate-50 font-sans tracking-tight">
              {value}
            </h4>
            {unit && (
              <span className="text-xs font-medium text-slate-500 dark:text-slate-400">
                {unit}
              </span>
            )}
          </div>
          {subtitle && (
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
              {subtitle}
            </p>
          )}
        </div>
        <div className={`p-3 rounded-xl border ${colorStyles[color]} group-hover:scale-110 transition-transform duration-200`}>
          {Icon && <Icon className="w-5 h-5" />}
        </div>
      </div>
      {badgeText && (
        <div className="mt-3 inline-flex items-center text-xs font-medium px-2 py-0.5 rounded-md bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300">
          {badgeText}
        </div>
      )}
    </div>
  );
};
