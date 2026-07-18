import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { Button } from '../components/common/Button';
import {
  History as HistoryIcon,
  FileSpreadsheet,
  FileText,
  Filter,
  ArrowUpRight,
  ArrowDownLeft,
  RotateCcw,
  X
} from 'lucide-react';
import { getTransactions, getMaterials, getUsers } from '../utils/storage';
import { exportHistoryPDF, exportHistoryExcel } from '../utils/exportUtils';
import { formatDate, getTransactionTypeBadge } from '../utils/formatters';

export const History = () => {
  const [transactions, setTransactions] = useState([]);
  const [materials, setMaterials] = useState([]);
  const [users, setUsers] = useState([]);
  const [typeFilter, setTypeFilter] = useState('all');
  const [showFilterPanel, setShowFilterPanel] = useState(false);

  useEffect(() => {
    (async () => {
      try {
        const [txs, mats, usrs] = await Promise.all([getTransactions(), getMaterials(), getUsers()]);
        setTransactions(txs);
        setMaterials(mats);
        setUsers(usrs);
      } catch (e) { console.error(e); }
    })();
  }, []);

  const matMap = new Map(materials.map(m => [m.id, m]));
  const userMap = new Map(users.map(u => [u.id, u.name]));

  const filteredTransactions = transactions.filter(tx => {
    return typeFilter === 'all' || tx.type === typeFilter;
  });

  const typeLabels = { in: 'Stok Masuk', out: 'Stok Keluar', adjustment: 'Penyesuaian' };
  const activeFilters = [
    typeFilter !== 'all' && { key: 'type', label: `Tipe: ${typeLabels[typeFilter]}`, clear: () => setTypeFilter('all') },
  ].filter(Boolean);

  return (
    <div className="space-y-6">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-xl font-bold text-slate-900 dark:text-slate-100 font-sans tracking-tight">
              Riwayat Mutasi & Audit Ledger Stok
            </h2>
            <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-purple-100 text-purple-800 dark:bg-purple-950 dark:text-purple-300">
              {filteredTransactions.length} Transaksi Recorded
            </span>
          </div>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            Jejak transaksi stok masuk (pengadaan), stok keluar (pemakaian praktikum), dan penyesuaian yang tidak dapat diubah (immutable).
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Button
            onClick={() => exportHistoryPDF(filteredTransactions, materials, users)}
            variant="outline"
            size="sm"
            icon={FileText}
          >
            Cetak PDF Audit
          </Button>

          <Button
            onClick={() => exportHistoryExcel(filteredTransactions, materials, users)}
            variant="outline"
            size="sm"
            icon={FileSpreadsheet}
          >
            Ekspor Excel
          </Button>
        </div>
      </div>

      {/* Filter */}
      <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-3">
        {activeFilters.length > 0 && (
          <div className="flex flex-wrap items-center gap-2">
            {activeFilters.map(f => (
              <span key={f.key} className="inline-flex items-center gap-1 pl-2.5 pr-1 py-1 rounded-full text-[11px] font-semibold bg-teal-50 text-teal-700 dark:bg-teal-950 dark:text-teal-300 border border-teal-200 dark:border-teal-800">
                {f.label}
                <button onClick={f.clear} className="p-0.5 rounded-full hover:bg-teal-200/60 dark:hover:bg-teal-800/60" title="Hapus filter">
                  <X className="w-3 h-3" />
                </button>
              </span>
            ))}
          </div>
        )}

        <div className="flex items-center justify-between">
          <span className="text-xs font-medium text-slate-500 dark:text-slate-400">
            {filteredTransactions.length} transaksi ditampilkan
          </span>

          <div className="relative">
            <button
              onClick={() => setShowFilterPanel(v => !v)}
              className="flex items-center justify-center gap-2 px-4 py-2 text-xs font-semibold bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors"
            >
              <Filter className="w-4 h-4 text-slate-400" />
              <span>Filter</span>
              {activeFilters.length > 0 && (
                <span className="flex items-center justify-center min-w-[18px] h-[18px] px-1 rounded-full bg-teal-500 text-white text-[10px] font-bold">
                  {activeFilters.length}
                </span>
              )}
            </button>

            {showFilterPanel && (
              <>
                <div className="fixed inset-0 z-30" onClick={() => setShowFilterPanel(false)} />
                <div className="absolute right-0 mt-2 w-64 max-w-[calc(100vw-2rem)] bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-2xl p-4 z-40 space-y-3 animate-slide-down">
                  <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-2">
                    <h4 className="font-bold text-sm text-slate-900 dark:text-slate-100">Filter Mutasi</h4>
                    {activeFilters.length > 0 && (
                      <button onClick={() => setTypeFilter('all')} className="text-[11px] font-semibold text-rose-600 dark:text-rose-400 hover:underline">
                        Reset
                      </button>
                    )}
                  </div>

                  <div>
                    <label className="block text-[11px] font-bold text-slate-500 dark:text-slate-400 mb-1">Tipe Mutasi</label>
                    <select
                      value={typeFilter}
                      onChange={(e) => setTypeFilter(e.target.value)}
                      className="w-full px-3 py-2 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-700 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-teal-500"
                    >
                      <option value="all">Semua Log</option>
                      <option value="in">Stok Masuk</option>
                      <option value="out">Stok Keluar</option>
                      <option value="adjustment">Penyesuaian</option>
                    </select>
                  </div>
                </div>
              </>
            )}
          </div>
        </div>
      </div>

      {/* Audit Log Table */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 dark:bg-slate-800/80 text-slate-600 dark:text-slate-400 uppercase font-bold text-[10px] tracking-wider border-b border-slate-200 dark:border-slate-800">
              <tr>
                <th className="px-4 py-3.5">Tgl Transaksi</th>
                <th className="px-4 py-3.5">Nama Bahan BHP</th>
                <th className="px-4 py-3.5 text-center">Tipe Mutasi</th>
                <th className="px-4 py-3.5 text-center">Jumlah Vol.</th>
                <th className="px-4 py-3.5">Petugas / System</th>
                <th className="px-4 py-3.5">Catatan / Alasan Audit</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60">
              {filteredTransactions.map((tx) => {
                const mat = matMap.get(tx.material_id);
                const badge = getTransactionTypeBadge(tx.type);

                return (
                  <tr key={tx.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/40">
                    <td className="px-4 py-4 font-mono text-slate-500">
                      {formatDate(tx.date)}
                    </td>

                    <td className="px-4 py-4 font-bold text-slate-900 dark:text-slate-100">
                      {mat?.material_name || 'N/A'}
                    </td>

                    <td className="px-4 py-4 text-center">
                      <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-semibold ${badge.bg}`}>
                        {badge.label}
                      </span>
                    </td>

                    <td className="px-4 py-4 text-center font-bold font-mono text-sm">
                      <span className={tx.type === 'in' ? 'text-blue-600 dark:text-blue-400' : 'text-amber-600 dark:text-amber-400'}>
                        {tx.type === 'in' ? `+${tx.quantity}` : `-${tx.quantity}`} {mat?.unit}
                      </span>
                    </td>

                    <td className="px-4 py-4 font-medium text-slate-700 dark:text-slate-300">
                      {userMap.get(tx.recorded_by) || 'Teknisi Lab'}
                    </td>

                    <td className="px-4 py-4 text-slate-500 dark:text-slate-400 italic">
                      {tx.note || '-'}
                    </td>
                  </tr>
                );
              })}

              {filteredTransactions.length === 0 && (
                <tr>
                  <td colSpan={6} className="py-12 text-center text-slate-500 dark:text-slate-400">
                    <HistoryIcon className="w-8 h-8 mx-auto mb-2 opacity-40" />
                    <p className="font-semibold">Belum ada catatan mutasi transaksi.</p>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

    </div>
  );
};
