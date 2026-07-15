import React from 'react';
import { CheckCircle2, AlertTriangle, XCircle, Info, X } from 'lucide-react';

export const Toast = ({ toast, onClose }) => {
  if (!toast) return null;

  const { type, message } = toast;

  const icons = {
    success: <CheckCircle2 className="w-5 h-5 text-emerald-500 flex-shrink-0" />,
    warning: <AlertTriangle className="w-5 h-5 text-amber-500 flex-shrink-0" />,
    error: <XCircle className="w-5 h-5 text-rose-500 flex-shrink-0" />,
    info: <Info className="w-5 h-5 text-sky-500 flex-shrink-0" />
  };

  const borders = {
    success: 'border-emerald-500/30 bg-emerald-50 dark:bg-emerald-950/80 text-emerald-900 dark:text-emerald-100',
    warning: 'border-amber-500/30 bg-amber-50 dark:bg-amber-950/80 text-amber-900 dark:text-amber-100',
    error: 'border-rose-500/30 bg-rose-50 dark:bg-rose-950/80 text-rose-900 dark:text-rose-100',
    info: 'border-sky-500/30 bg-sky-50 dark:bg-sky-950/80 text-sky-900 dark:text-sky-100'
  };

  return (
    <div className="fixed bottom-6 right-6 z-50 animate-slide-up max-w-md w-full shadow-2xl rounded-xl overflow-hidden">
      <div className={`p-4 border backdrop-blur-md flex items-start gap-3 ${borders[type] || borders.info}`}>
        {icons[type] || icons.info}
        <div className="flex-1 text-sm font-medium leading-snug">
          {message}
        </div>
        <button
          onClick={onClose}
          className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition-colors p-1"
        >
          <X className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};
