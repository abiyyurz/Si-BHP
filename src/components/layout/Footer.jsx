import React from 'react';

export const Footer = () => {
  return (
    <footer className="mt-auto border-t border-slate-200 dark:border-slate-800 bg-white/40 dark:bg-slate-900/40 py-4 px-6 text-xs text-slate-500 dark:text-slate-400">
      <div className="flex flex-col sm:flex-row justify-between items-center gap-2">
        <p>© ARZ Project</p>
        <p className="text-[11px] font-medium text-slate-400">Jurusan Teknik Mesin • Lab/Bengkel</p>
      </div>
    </footer>
  );
};
