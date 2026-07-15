/**
 * Utility formatters for SI-BAP application
 */

export const formatDate = (dateString) => {
  if (!dateString) return '-';
  try {
    const date = new Date(dateString);
    return new Intl.DateTimeFormat('id-ID', {
      day: 'numeric',
      month: 'short',
      year: 'numeric'
    }).format(date);
  } catch (e) {
    return dateString;
  }
};

export const formatDateTime = (dateTimeString) => {
  if (!dateTimeString) return '-';
  try {
    const date = new Date(dateTimeString);
    return new Intl.DateTimeFormat('id-ID', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    }).format(date);
  } catch (e) {
    return dateTimeString;
  }
};

export const getQualityBadge = (quality) => {
  switch (quality) {
    case 'good':
      return { label: 'Baik', bg: 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950/70 dark:text-emerald-300 border-emerald-300 dark:border-emerald-800' };
    case 'fair':
      return { label: 'Cukup', bg: 'bg-amber-100 text-amber-800 dark:bg-amber-950/70 dark:text-amber-300 border-amber-300 dark:border-amber-800' };
    case 'poor':
      return { label: 'Kurang', bg: 'bg-rose-100 text-rose-800 dark:bg-rose-950/70 dark:text-rose-300 border-rose-300 dark:border-rose-800' };
    default:
      return { label: quality || 'Normal', bg: 'bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300' };
  }
};

export const getRequestStatusBadge = (status) => {
  switch (status) {
    case 'approved':
      return { label: 'Disetujui', bg: 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950/70 dark:text-emerald-300 border-emerald-300 dark:border-emerald-800' };
    case 'rejected':
      return { label: 'Ditolak', bg: 'bg-rose-100 text-rose-800 dark:bg-rose-950/70 dark:text-rose-300 border-rose-300 dark:border-rose-800' };
    case 'pending':
    default:
      return { label: 'Menunggu Approval', bg: 'bg-amber-100 text-amber-800 dark:bg-amber-950/70 dark:text-amber-300 border-amber-300 dark:border-amber-800 animate-pulse' };
  }
};

export const getTransactionTypeBadge = (type) => {
  switch (type) {
    case 'in':
      return { label: 'Stok Masuk (+)', bg: 'bg-blue-100 text-blue-800 dark:bg-blue-950/70 dark:text-blue-300' };
    case 'out':
      return { label: 'Stok Keluar (-)', bg: 'bg-amber-100 text-amber-800 dark:bg-amber-950/70 dark:text-amber-300' };
    case 'adjustment':
      return { label: 'Penyesuaian (±)', bg: 'bg-purple-100 text-purple-800 dark:bg-purple-950/70 dark:text-purple-300' };
    default:
      return { label: type, bg: 'bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300' };
  }
};
