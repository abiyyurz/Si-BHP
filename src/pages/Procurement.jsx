import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { Button } from '../components/common/Button';
import { Modal } from '../components/common/Modal';
import { Toast } from '../components/common/Toast';
import { ShoppingCart, FileText, FileSpreadsheet, Filter, X, PackageCheck, ShoppingBag } from 'lucide-react';
import { getMaterials, getLabs, recordIncomingStock } from '../utils/storage';
import { exportProcurementPDF, exportProcurementExcel } from '../utils/exportUtils';

export const Procurement = () => {
  const { currentUser } = useAuth();
  const [materials, setMaterials] = useState([]);
  const [labs, setLabs] = useState([]);
  const [labFilter, setLabFilter] = useState('all');
  const [onlyNeed, setOnlyNeed] = useState(false);
  const [showFilterPanel, setShowFilterPanel] = useState(false);

  // Tandai sudah dibeli (auto-restock)
  const [buyRow, setBuyRow] = useState(null);
  const [buyQty, setBuyQty] = useState(0);
  const [buyNote, setBuyNote] = useState('');
  const [toast, setToast] = useState(null);

  const loadData = async () => {
    try {
      const [mats, lbs] = await Promise.all([getMaterials(), getLabs()]);
      setMaterials(mats);
      setLabs(lbs);
    } catch (e) { setToast({ type: 'error', message: e.message }); }
  };

  useEffect(() => { loadData(); }, []);

  const openBuy = (row) => {
    setBuyRow(row);
    setBuyQty(row.need);
    setBuyNote(`Pengadaan: pembelian ${row.name}`);
  };

  const handleConfirmBuy = async (e) => {
    e.preventDefault();
    try {
      await recordIncomingStock({
        material_id: buyRow.id,
        quantity: buyQty,
        recorded_by: currentUser.id,
        note: buyNote || `Pengadaan: pembelian ${buyRow.name}`
      });
      setToast({ type: 'success', message: `Stok ${buyRow.name} bertambah +${buyQty} ${buyRow.unit} dan tercatat di Riwayat Audit.` });
      setBuyRow(null);
      loadData();
    } catch (err) {
      setToast({ type: 'error', message: err.message });
    }
  };

  const labMap = new Map(labs.map(l => [l.id, l.lab_name]));

  const allRows = materials.map((m, idx) => {
    const ideal = m.target_stock ?? m.stock;
    const need = Math.max(0, ideal - m.stock);
    return {
      no: idx + 1,
      id: m.id,
      name: m.material_name,
      lab_id: m.lab_id,
      lab: labMap.get(m.lab_id) || '',
      unit: m.unit,
      ideal,
      current: m.stock,
      need
    };
  });

  const rows = allRows
    .filter(r => labFilter === 'all' || r.lab_id === labFilter)
    .filter(r => !onlyNeed || r.need > 0);

  const totalNeedItems = rows.filter(r => r.need > 0).length;
  const totalNeedQty = rows.reduce((sum, r) => sum + r.need, 0);

  const activeFilters = [
    labFilter !== 'all' && { key: 'lab', label: `Lab: ${labMap.get(labFilter) || ''}`, clear: () => setLabFilter('all') },
    onlyNeed && { key: 'need', label: 'Hanya yang perlu dibeli', clear: () => setOnlyNeed(false) },
  ].filter(Boolean);

  return (
    <div className="space-y-6">

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-xl font-bold text-slate-900 dark:text-slate-100 font-sans tracking-tight">
              Laporan Pengadaan BHP
            </h2>
            <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-rose-100 text-rose-800 dark:bg-rose-950 dark:text-rose-300">
              {totalNeedItems} bahan perlu dibeli
            </span>
          </div>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            Kebutuhan beli ulang tiap BHP untuk mengembalikan stok ke level ideal (Perlu Dibeli = Stok Ideal − Stok Sekarang).
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Button onClick={() => exportProcurementPDF(rows)} variant="outline" size="sm" icon={FileText}>
            Cetak PDF
          </Button>
          <Button onClick={() => exportProcurementExcel(rows)} variant="outline" size="sm" icon={FileSpreadsheet}>
            Ekspor Excel
          </Button>
        </div>
      </div>

      {/* Filter Bar */}
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
            {rows.length} bahan ditampilkan · total perlu dibeli: <span className="font-bold text-rose-600 dark:text-rose-400">{totalNeedQty}</span>
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
                    <h4 className="font-bold text-sm text-slate-900 dark:text-slate-100">Filter Pengadaan</h4>
                    {activeFilters.length > 0 && (
                      <button onClick={() => { setLabFilter('all'); setOnlyNeed(false); }} className="text-[11px] font-semibold text-rose-600 dark:text-rose-400 hover:underline">
                        Reset
                      </button>
                    )}
                  </div>

                  <div>
                    <label className="block text-[11px] font-bold text-slate-500 dark:text-slate-400 mb-1">Lab/Bengkel</label>
                    <select
                      value={labFilter}
                      onChange={(e) => setLabFilter(e.target.value)}
                      className="w-full px-3 py-2 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-700 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-teal-500"
                    >
                      <option value="all">Semua Lab/Bengkel</option>
                      {labs.map(lab => (
                        <option key={lab.id} value={lab.id}>{lab.lab_name}</option>
                      ))}
                    </select>
                  </div>

                  <label className="flex items-center gap-2 cursor-pointer text-xs font-medium text-slate-700 dark:text-slate-200 select-none">
                    <input
                      type="checkbox"
                      checked={onlyNeed}
                      onChange={(e) => setOnlyNeed(e.target.checked)}
                      className="w-3.5 h-3.5 rounded border-slate-300 text-teal-600 focus:ring-teal-500 accent-teal-600"
                    />
                    Tampilkan hanya yang perlu dibeli
                  </label>
                </div>
              </>
            )}
          </div>
        </div>
      </div>

      {/* Table */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 dark:bg-slate-800/80 text-slate-600 dark:text-slate-400 uppercase font-bold text-[10px] tracking-wider border-b border-slate-200 dark:border-slate-800">
              <tr>
                <th className="px-4 py-3.5 w-12 text-center">No</th>
                <th className="px-4 py-3.5">Nama Bahan Habis Pakai (BHP)</th>
                <th className="px-4 py-3.5">Lab/Bengkel</th>
                <th className="px-4 py-3.5 text-center">Stok Ideal</th>
                <th className="px-4 py-3.5 text-center">Stok Sekarang</th>
                <th className="px-4 py-3.5 text-center">Perlu Dibeli</th>
                <th className="px-4 py-3.5 text-right">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60">
              {rows.map((r) => (
                <tr key={r.id} className={`hover:bg-slate-50/70 dark:hover:bg-slate-800/40 ${r.need > 0 ? 'bg-rose-500/5 dark:bg-rose-950/10' : ''}`}>
                  <td className="px-4 py-4 text-center font-mono text-slate-500">{r.no}</td>
                  <td className="px-4 py-4 font-bold text-slate-900 dark:text-slate-100">{r.name}</td>
                  <td className="px-4 py-4 text-slate-600 dark:text-slate-300">{r.lab}</td>
                  <td className="px-4 py-4 text-center font-mono text-slate-600 dark:text-slate-300">{r.ideal} {r.unit}</td>
                  <td className="px-4 py-4 text-center font-mono text-slate-600 dark:text-slate-300">{r.current} {r.unit}</td>
                  <td className="px-4 py-4 text-center font-mono font-bold">
                    {r.need > 0 ? (
                      <span className="text-rose-600 dark:text-rose-400">{r.need} {r.unit}</span>
                    ) : (
                      <span className="inline-flex items-center gap-1 text-emerald-600 dark:text-emerald-400">
                        <PackageCheck className="w-3.5 h-3.5" /> Cukup
                      </span>
                    )}
                  </td>
                  <td className="px-4 py-4 text-right">
                    {r.need > 0 && (
                      <button
                        onClick={() => openBuy(r)}
                        className="inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-[11px] font-semibold bg-teal-600 text-white hover:bg-teal-700 transition-colors"
                        title="Tandai bahan sudah dibeli — otomatis menambah stok"
                      >
                        <ShoppingBag className="w-3.5 h-3.5" /> Tandai Dibeli
                      </button>
                    )}
                  </td>
                </tr>
              ))}
              {rows.length === 0 && (
                <tr>
                  <td colSpan={7} className="py-12 text-center text-slate-500 dark:text-slate-400">
                    <ShoppingCart className="w-8 h-8 mx-auto mb-2 opacity-40" />
                    <p className="font-semibold">Tidak ada bahan untuk ditampilkan.</p>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal: Tandai sudah dibeli (auto-restock) */}
      <Modal
        isOpen={!!buyRow}
        onClose={() => setBuyRow(null)}
        title="Tandai Sudah Dibeli"
        maxWidth="max-w-md"
      >
        {buyRow && (
          <form onSubmit={handleConfirmBuy} className="space-y-4">
            <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/60 text-xs space-y-1">
              <p><span className="text-slate-500">Bahan:</span> <span className="font-bold text-slate-900 dark:text-white">{buyRow.name}</span></p>
              <p><span className="text-slate-500">Stok sekarang:</span> <span className="font-semibold">{buyRow.current} {buyRow.unit}</span> · <span className="text-slate-500">Ideal:</span> <span className="font-semibold">{buyRow.ideal} {buyRow.unit}</span></p>
              <p><span className="text-slate-500">Kekurangan:</span> <span className="font-bold text-rose-600 dark:text-rose-400">{buyRow.need} {buyRow.unit}</span></p>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                Jumlah Dibeli / Ditambahkan *
              </label>
              <input
                type="number"
                min="1"
                value={buyQty}
                onChange={(e) => setBuyQty(e.target.value === '' ? '' : Number(e.target.value))}
                required
                className="w-full px-3.5 py-2.5 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white"
              />
              <p className="text-[10px] text-slate-400 mt-1">Default = kekurangan agar stok kembali ke ideal. Boleh diubah sesuai jumlah pembelian nyata.</p>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                Catatan (opsional)
              </label>
              <input
                type="text"
                value={buyNote}
                onChange={(e) => setBuyNote(e.target.value)}
                placeholder="Mis. no. nota / supplier"
                className="w-full px-3.5 py-2.5 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white"
              />
            </div>

            <div className="flex justify-end gap-2 pt-2 border-t border-slate-100 dark:border-slate-800">
              <Button type="button" variant="ghost" size="sm" onClick={() => setBuyRow(null)}>Batal</Button>
              <Button type="submit" variant="primary" size="sm" icon={ShoppingBag}>Tambah Stok</Button>
            </div>
          </form>
        )}
      </Modal>

      {toast && <Toast toast={toast} onClose={() => setToast(null)} />}
    </div>
  );
};
