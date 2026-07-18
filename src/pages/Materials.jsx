import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { Button } from '../components/common/Button';
import { Modal } from '../components/common/Modal';
import { SearchInput } from '../components/common/SearchInput';
import { Toast } from '../components/common/Toast';
import {
  Boxes,
  Plus,
  Edit,
  Trash2,
  FileSpreadsheet,
  FileText,
  AlertTriangle,
  PlusCircle,
  Filter,
  X,
  ChevronRight,
  ChevronDown
} from 'lucide-react';
import {
  getMaterials,
  getCourses,
  getLabs,
  saveMaterial,
  deleteMaterial,
  recordIncomingStock
} from '../utils/storage';
import {
  exportMaterialsPDF,
  exportMaterialsExcel
} from '../utils/exportUtils';
import { getQualityBadge } from '../utils/formatters';

export const Materials = ({ initialStockFilter = null } = {}) => {
  const { isAdmin, currentUser } = useAuth();
  const [materials, setMaterials] = useState([]);
  const [coursesList, setCoursesList] = useState([]);
  const [labsList, setLabsList] = useState([]);

  // Search & Filter state
  const [searchQuery, setSearchQuery] = useState('');
  const [semesterFilter, setSemesterFilter] = useState('all');
  const [qualityFilter, setQualityFilter] = useState('all');
  const [stockStatusFilter, setStockStatusFilter] = useState('all');
  const [labFilter, setLabFilter] = useState('all');
  const [showFilterPanel, setShowFilterPanel] = useState(false);
  const [expandedGroups, setExpandedGroups] = useState(new Set());

  // Modals state
  const [isAddEditOpen, setIsAddEditOpen] = useState(false);
  const [isRestockOpen, setIsRestockOpen] = useState(false);
  const [selectedMaterial, setSelectedMaterial] = useState(null);

  // Form State
  const [formData, setFormData] = useState({
    material_name: '',
    specification: '',
    course_id: null,
    lab_id: '',
    semester: 1,
    practical_hours: 4,
    quality: 'good',
    unit: 'Pcs',
    stock: 10,
    min_stock: 5,
    target_stock: 10
  });

  const [restockData, setRestockData] = useState({
    quantity: 10,
    note: ''
  });

  const [toast, setToast] = useState(null);

  const loadData = async () => {
    try {
      const [mats, crs, labs] = await Promise.all([getMaterials(), getCourses(), getLabs()]);
      setMaterials(mats);
      setCoursesList(crs);
      setLabsList(labs);
    } catch (e) {
      setToast({ type: 'error', message: e.message });
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  // Terapkan filter awal dari navigasi (mis. notif "stok kritis" → tampilkan yang kritis).
  useEffect(() => {
    if (initialStockFilter) setStockStatusFilter(initialStockFilter);
  }, [initialStockFilter]);

  const courseMap = new Map(coursesList.map(c => [c.id, c]));
  const labMap = new Map(labsList.map(l => [l.id, l]));

  // Filtering Logic
  const filteredMaterials = materials.filter(m => {
    const crs = courseMap.get(m.course_id);
    const crsName = crs ? crs.course_name : '';
    const q = searchQuery.toLowerCase();
    const matchesSearch =
      m.material_name.toLowerCase().includes(q) ||
      (m.specification || '').toLowerCase().includes(q) ||
      crsName.toLowerCase().includes(q);

    const matchesSemester = semesterFilter === 'all' || m.semester === Number(semesterFilter);
    const matchesQuality = qualityFilter === 'all' || m.quality === qualityFilter;
    const matchesLab = labFilter === 'all' || m.lab_id === labFilter;
    const matchesStock =
      stockStatusFilter === 'all'
        ? true
        : stockStatusFilter === 'critical'
        ? m.stock <= m.min_stock
        : m.stock > m.min_stock;

    return matchesSearch && matchesSemester && matchesQuality && matchesStock && matchesLab;
  });

  // Chip filter aktif (untuk ditampilkan & dihapus satu per satu)
  const qualityLabels = { good: 'Baik', fair: 'Cukup', poor: 'Kurang' };
  const activeFilters = [
    labFilter !== 'all' && { key: 'lab', label: `Lab: ${labMap.get(labFilter)?.lab_name || ''}`, clear: () => setLabFilter('all') },
    semesterFilter !== 'all' && { key: 'sem', label: `Semester ${semesterFilter}`, clear: () => setSemesterFilter('all') },
    qualityFilter !== 'all' && { key: 'qual', label: `Kualitas ${qualityLabels[qualityFilter]}`, clear: () => setQualityFilter('all') },
    stockStatusFilter !== 'all' && { key: 'stock', label: stockStatusFilter === 'critical' ? 'Stok Kritis' : 'Stok Aman', clear: () => setStockStatusFilter('all') },
  ].filter(Boolean);

  const resetAllFilters = () => {
    setLabFilter('all');
    setSemesterFilter('all');
    setQualityFilter('all');
    setStockStatusFilter('all');
  };

  // Kelompokkan per nama bahan: tiap spesifikasi jadi sub-baris yang bisa dibuka-tutup.
  const groups = [];
  const groupPos = new Map();
  for (const m of filteredMaterials) {
    const key = m.material_name.trim().toLowerCase();
    let pos = groupPos.get(key);
    if (pos === undefined) {
      pos = groups.length;
      groupPos.set(key, pos);
      groups.push({ key, name: m.material_name, items: [] });
    }
    groups[pos].items.push(m);
  }

  const toggleGroup = (key) =>
    setExpandedGroups(prev => {
      const next = new Set(prev);
      next.has(key) ? next.delete(key) : next.add(key);
      return next;
    });

  const handleOpenAdd = () => {
    setSelectedMaterial(null);
    setFormData({
      material_name: '',
      specification: '',
      course_id: null,
      lab_id: labsList[0]?.id || '',
      semester: 1,
      practical_hours: 4,
      quality: 'good',
      unit: 'Pcs',
      stock: 10,
      min_stock: 5,
      target_stock: 10
    });
    setIsAddEditOpen(true);
  };

  const handleOpenEdit = (material) => {
    setSelectedMaterial(material);
    setFormData({
      material_name: material.material_name,
      specification: material.specification || '',
      course_id: material.course_id ?? null,
      lab_id: material.lab_id || '',
      semester: material.semester,
      practical_hours: material.practical_hours,
      quality: material.quality,
      unit: material.unit,
      stock: material.stock,
      min_stock: material.min_stock,
      target_stock: material.target_stock ?? material.stock
    });
    setIsAddEditOpen(true);
  };

  const handleOpenRestock = (material) => {
    setSelectedMaterial(material);
    setRestockData({ quantity: 10, note: 'Restock pengadaan baru' });
    setIsRestockOpen(true);
  };

  const handleSaveMaterial = async (e, keepOpen = false) => {
    e?.preventDefault();
    try {
      if (!formData.material_name.trim()) throw new Error("Nama bahan tidak boleh kosong.");
      await saveMaterial({
        ...(selectedMaterial ? { id: selectedMaterial.id, no: selectedMaterial.no } : {}),
        ...formData
      });
      setToast({ type: 'success', message: `Bahan ${formData.material_name} berhasil disimpan.` });
      // "Simpan & Tambah Lagi": biarkan modal terbuka, pertahankan nama/lab/semester/satuan,
      // kosongkan hanya spesifikasi & stok untuk input varian berikutnya (mis. Nachi spec lain).
      if (keepOpen && !selectedMaterial) {
        setFormData(prev => ({ ...prev, specification: '', stock: 0, target_stock: prev.min_stock }));
      } else {
        setIsAddEditOpen(false);
      }
      loadData();
    } catch (err) {
      setToast({ type: 'error', message: err.message });
    }
  };

  const handleSaveRestock = async (e) => {
    e.preventDefault();
    try {
      await recordIncomingStock({
        material_id: selectedMaterial.id,
        quantity: restockData.quantity,
        recorded_by: currentUser.id,
        note: restockData.note
      });
      setToast({ type: 'success', message: `Stok ${selectedMaterial.material_name} berhasil ditambah (+${restockData.quantity} ${selectedMaterial.unit}).` });
      setIsRestockOpen(false);
      loadData();
    } catch (err) {
      setToast({ type: 'error', message: err.message });
    }
  };

  const handleDelete = async (material) => {
    if (confirm(`Apakah Anda yakin ingin menghapus data bahan: "${material.material_name}"?`)) {
      try {
        await deleteMaterial(material.id);
        setToast({ type: 'info', message: `Material ${material.material_name} telah dihapus.` });
        loadData();
      } catch (err) {
        setToast({ type: 'error', message: err.message });
      }
    }
  };

  return (
    <div className="space-y-6">
      
      {/* Header Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-xl font-bold text-slate-900 dark:text-slate-100 font-sans tracking-tight">
              Data Bahan Habis Pakai (BHP)
            </h2>
            <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-teal-100 text-teal-800 dark:bg-teal-950 dark:text-teal-300">
              {filteredMaterials.length} Items
            </span>
          </div>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            Pengelolaan stok kikir, gergaji, elektroda las, pahat, dan bahan habis pakai praktikum Bengkel Kerja.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <Button
            onClick={() => exportMaterialsPDF(filteredMaterials, coursesList)}
            variant="outline"
            size="sm"
            icon={FileText}
          >
            Ekspor PDF
          </Button>

          <Button
            onClick={() => exportMaterialsExcel(filteredMaterials, coursesList)}
            variant="outline"
            size="sm"
            icon={FileSpreadsheet}
          >
            Ekspor Excel
          </Button>

          {isAdmin && (
            <Button
              onClick={handleOpenAdd}
              variant="primary"
              size="sm"
              icon={Plus}
            >
              Tambah Bahan Baru
            </Button>
          )}
        </div>
      </div>

      {/* Search & Filter Bar */}
      <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-3">
        {/* Chip filter aktif */}
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
            <button onClick={resetAllFilters} className="text-[11px] font-semibold text-slate-500 hover:text-rose-600 dark:hover:text-rose-400 underline underline-offset-2">
              Hapus semua
            </button>
          </div>
        )}

        <div className="flex flex-col md:flex-row gap-3 items-center justify-between">
          <SearchInput
            value={searchQuery}
            onChange={setSearchQuery}
            placeholder="Cari nama bahan, mata kuliah terkait, atau spesifikasi..."
          />

          {/* Tombol Filter + popup */}
          <div className="relative w-full md:w-auto">
            <button
              onClick={() => setShowFilterPanel(v => !v)}
              className="w-full md:w-auto flex items-center justify-center gap-2 px-4 py-2 text-xs font-semibold bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors"
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
                <div className="absolute right-0 mt-2 w-72 max-w-[calc(100vw-2rem)] bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-2xl p-4 z-40 space-y-3 animate-slide-down">
                  <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-2">
                    <h4 className="font-bold text-sm text-slate-900 dark:text-slate-100">Filter Bahan</h4>
                    {activeFilters.length > 0 && (
                      <button onClick={resetAllFilters} className="text-[11px] font-semibold text-rose-600 dark:text-rose-400 hover:underline">
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
                      {labsList.map(lab => (
                        <option key={lab.id} value={lab.id}>{lab.lab_name}</option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-[11px] font-bold text-slate-500 dark:text-slate-400 mb-1">Semester</label>
                    <select
                      value={semesterFilter}
                      onChange={(e) => setSemesterFilter(e.target.value)}
                      className="w-full px-3 py-2 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-700 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-teal-500"
                    >
                      <option value="all">Semua Semester</option>
                      {[1, 2, 3, 4, 5, 6, 7, 8].map(s => (
                        <option key={s} value={s}>Semester {s}</option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-[11px] font-bold text-slate-500 dark:text-slate-400 mb-1">Kualitas</label>
                    <select
                      value={qualityFilter}
                      onChange={(e) => setQualityFilter(e.target.value)}
                      className="w-full px-3 py-2 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-700 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-teal-500"
                    >
                      <option value="all">Semua Kualitas</option>
                      <option value="good">Kualitas Baik</option>
                      <option value="fair">Kualitas Cukup</option>
                      <option value="poor">Kualitas Kurang</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-[11px] font-bold text-slate-500 dark:text-slate-400 mb-1">Status Stok</label>
                    <select
                      value={stockStatusFilter}
                      onChange={(e) => setStockStatusFilter(e.target.value)}
                      className="w-full px-3 py-2 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-700 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-teal-500"
                    >
                      <option value="all">Semua Status Stok</option>
                      <option value="safe">Stok Aman</option>
                      <option value="critical">Stok Kritis (Reorder)</option>
                    </select>
                  </div>
                </div>
              </>
            )}
          </div>
        </div>
      </div>

      {/* Materials Master Data Table */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 dark:bg-slate-800/80 text-slate-600 dark:text-slate-400 uppercase font-bold text-[10px] tracking-wider border-b border-slate-200 dark:border-slate-800">
              <tr className="text-center">
                <th className="px-4 py-3.5 w-12">No</th>
                <th className="px-4 py-3.5">Nama Bahan Habis Pakai (BHP)</th>
                <th className="px-4 py-3.5">Lab/Bengkel</th>
                <th className="px-4 py-3.5">Sem.</th>
                <th className="px-4 py-3.5">Kualitas</th>
                <th className="px-4 py-3.5">Sisa Stok</th>
                <th className="px-4 py-3.5">Threshold Min</th>
                <th className="px-4 py-3.5">Status</th>
                {isAdmin && <th className="px-4 py-3.5">Aksi Management</th>}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60">
              {groups.map((group, gi) => {
                const renderItemRow = (item, sub) => {
                  const isCritical = item.stock <= item.min_stock;
                  const qualityBadge = getQualityBadge(item.quality);
                  const lab = labMap.get(item.lab_id);
                  return (
                    <tr
                      key={item.id}
                      className={`transition-colors hover:bg-slate-50/80 dark:hover:bg-slate-800/50 ${
                        isCritical ? 'bg-rose-500/5 dark:bg-rose-950/20' : ''
                      }`}
                    >
                      <td className="px-4 py-4 text-center font-mono text-slate-500">
                        {sub ? '' : (item.no || gi + 1)}
                      </td>

                      <td className={`px-4 py-4 text-slate-900 dark:text-slate-100 ${sub ? 'pl-10' : ''}`}>
                        <div className="flex items-center gap-2">
                          <span className={sub ? 'font-medium text-slate-700 dark:text-slate-200' : 'font-bold'}>
                            {sub ? (item.specification || '(tanpa spesifikasi)') : item.material_name}
                          </span>
                          {isCritical && (
                            <AlertTriangle className="w-4 h-4 text-rose-500 flex-shrink-0 animate-bounce" title="Stok Kritis!" />
                          )}
                        </div>
                        {!sub && item.specification && (
                          <div className="text-[11px] font-normal text-slate-500 dark:text-slate-400 mt-0.5">
                            {item.specification}
                          </div>
                        )}
                      </td>

                      <td className="px-4 py-4 text-slate-600 dark:text-slate-300 font-medium">
                        {lab ? lab.lab_name : ''}
                      </td>

                      <td className="px-4 py-4 text-center">
                        <span className="inline-block whitespace-nowrap px-2 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-semibold">
                          Semester {item.semester}
                        </span>
                      </td>

                      <td className="px-4 py-4 text-center">
                        <span className={`px-2 py-0.5 rounded-full text-[10px] font-semibold border ${qualityBadge.bg}`}>
                          {qualityBadge.label}
                        </span>
                      </td>

                      <td className="px-4 py-4 text-center font-black text-sm font-sans">
                        <span className={isCritical ? 'text-rose-600 dark:text-rose-400' : 'text-slate-900 dark:text-white'}>
                          {item.stock} {item.unit}
                        </span>
                      </td>

                      <td className="px-4 py-4 text-center text-slate-500 font-mono">
                        {item.min_stock} {item.unit}
                      </td>

                      <td className="px-4 py-4 text-center">
                        {isCritical ? (
                          <span className="inline-block whitespace-nowrap px-2.5 py-1 rounded-full text-[10px] font-bold bg-rose-100 text-rose-800 dark:bg-rose-950 dark:text-rose-300 border border-rose-300 dark:border-rose-800">
                            KRITIS (Reorder)
                          </span>
                        ) : (
                          <span className="inline-block whitespace-nowrap px-2.5 py-1 rounded-full text-[10px] font-medium bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300 border border-emerald-300 dark:border-emerald-800">
                            Aman
                          </span>
                        )}
                      </td>

                      {isAdmin && (
                        <td className="px-4 py-4 text-right">
                          <div className="flex items-center justify-end gap-1.5">
                            <button
                              onClick={() => handleOpenRestock(item)}
                              className="p-1.5 text-teal-600 hover:bg-teal-50 dark:hover:bg-teal-950/60 rounded-lg transition-colors"
                              title="Restock Tambah Stok"
                            >
                              <PlusCircle className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => handleOpenEdit(item)}
                              className="p-1.5 text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-950/60 rounded-lg transition-colors"
                              title="Edit Data"
                            >
                              <Edit className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => handleDelete(item)}
                              className="p-1.5 text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/60 rounded-lg transition-colors"
                              title="Hapus Material"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </td>
                      )}
                    </tr>
                  );
                };

                // Satu spesifikasi saja: tampilkan baris biasa (tanpa grup).
                if (group.items.length === 1) return renderItemRow(group.items[0], false);

                // Banyak spesifikasi: baris induk (nama sekali) yang bisa dibuka-tutup.
                const expanded = expandedGroups.has(group.key);
                const anyCritical = group.items.some(i => i.stock <= i.min_stock);
                const totalStock = group.items.reduce((s, i) => s + i.stock, 0);
                const lab = labMap.get(group.items[0].lab_id);
                const unit = group.items[0].unit;

                return (
                  <React.Fragment key={group.key}>
                    <tr
                      onClick={() => toggleGroup(group.key)}
                      className="cursor-pointer bg-slate-50/70 dark:bg-slate-800/40 hover:bg-slate-100 dark:hover:bg-slate-800/70 transition-colors"
                    >
                      <td className="px-4 py-4 text-center font-mono text-slate-500">{gi + 1}</td>
                      <td className="px-4 py-4 text-slate-900 dark:text-slate-100">
                        <div className="flex items-center gap-2">
                          {expanded ? <ChevronDown className="w-4 h-4 text-slate-400" /> : <ChevronRight className="w-4 h-4 text-slate-400" />}
                          <span className="font-bold">{group.name}</span>
                          <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-teal-100 text-teal-800 dark:bg-teal-950 dark:text-teal-300">
                            {group.items.length} spesifikasi
                          </span>
                          {anyCritical && (
                            <AlertTriangle className="w-4 h-4 text-rose-500 flex-shrink-0 animate-bounce" title="Ada stok kritis" />
                          )}
                        </div>
                      </td>
                      <td className="px-4 py-4 text-slate-600 dark:text-slate-300 font-medium">{lab ? lab.lab_name : ''}</td>
                      <td className="px-4 py-4 text-center text-slate-400">—</td>
                      <td className="px-4 py-4 text-center text-slate-400">—</td>
                      <td className="px-4 py-4 text-center font-black text-sm font-sans text-slate-900 dark:text-white">
                        {totalStock} {unit}
                        <span className="block text-[9px] font-normal text-slate-400">total</span>
                      </td>
                      <td className="px-4 py-4 text-center text-slate-400">—</td>
                      <td className="px-4 py-4 text-center">
                        {anyCritical ? (
                          <span className="inline-block whitespace-nowrap px-2.5 py-1 rounded-full text-[10px] font-bold bg-rose-100 text-rose-800 dark:bg-rose-950 dark:text-rose-300 border border-rose-300 dark:border-rose-800">
                            ADA KRITIS
                          </span>
                        ) : (
                          <span className="inline-block whitespace-nowrap px-2.5 py-1 rounded-full text-[10px] font-medium bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300 border border-emerald-300 dark:border-emerald-800">
                            Aman
                          </span>
                        )}
                      </td>
                      {isAdmin && <td className="px-4 py-4" />}
                    </tr>
                    {expanded && group.items.map(item => renderItemRow(item, true))}
                  </React.Fragment>
                );
              })}

              {filteredMaterials.length === 0 && (
                <tr>
                  <td colSpan={isAdmin ? 11 : 10} className="py-12 text-center text-slate-500 dark:text-slate-400">
                    <Boxes className="w-8 h-8 mx-auto mb-2 opacity-40" />
                    <p className="font-semibold">Tidak ada data bahan yang cocok dengan pencarian.</p>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add / Edit Master Data Modal */}
      <Modal
        isOpen={isAddEditOpen}
        onClose={() => setIsAddEditOpen(false)}
        title={selectedMaterial ? `Edit Data: ${selectedMaterial.material_name}` : 'Tambah Bahan (BHP) Baru'}
        maxWidth="max-w-xl"
      >
        <form onSubmit={handleSaveMaterial} className="space-y-4">
          <div>
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
              Nama Bahan Habis Pakai (BHP) *
            </label>
            <input
              type="text"
              value={formData.material_name}
              onChange={(e) => setFormData({ ...formData, material_name: e.target.value })}
              placeholder="Contoh: Kikir Datar Halus 10 Inci"
              required
              className="w-full px-3.5 py-2.5 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white focus:ring-2 focus:ring-teal-500"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
              Spesifikasi
            </label>
            <input
              type="text"
              value={formData.specification}
              onChange={(e) => setFormData({ ...formData, specification: e.target.value })}
              placeholder="Contoh: Baja HSS, panjang 25 cm, grade halus"
              className="w-full px-3.5 py-2.5 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white focus:ring-2 focus:ring-teal-500"
            />
            <p className="text-[10px] text-slate-400 mt-1">Ditampilkan pada kolom Spesifikasi di surat permohonan.</p>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
              Lab/Bengkel *
            </label>
            <select
              value={formData.lab_id}
              onChange={(e) => setFormData({ ...formData, lab_id: e.target.value })}
              className="w-full px-3.5 py-2.5 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white"
            >
              {labsList.length === 0 && <option value="">(Belum ada Lab/Bengkel, tambah di menu Lab/Bengkel)</option>}
              {labsList.map(lab => (
                <option key={lab.id} value={lab.id}>{lab.lab_name}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
              Semester Digunakan *
            </label>
            <select
              value={formData.semester}
              onChange={(e) => setFormData({ ...formData, semester: Number(e.target.value) })}
              className="w-full px-3.5 py-2.5 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white"
            >
              {[1, 2, 3, 4, 5, 6, 7, 8].map(s => (
                <option key={s} value={s}>Semester {s}</option>
              ))}
            </select>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                Kualitas *
              </label>
              <select
                value={formData.quality}
                onChange={(e) => setFormData({ ...formData, quality: e.target.value })}
                className="w-full px-3 py-2 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white"
              >
                <option value="good">Baik</option>
                <option value="fair">Cukup</option>
                <option value="poor">Kurang</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                Satuan Ukuran *
              </label>
              <input
                type="text"
                value={formData.unit}
                onChange={(e) => setFormData({ ...formData, unit: e.target.value })}
                placeholder="Pcs, Kg, Meter, Lembar"
                required
                className="w-full px-3 py-2 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                Stok Awal Saat Ini *
              </label>
              <input
                type="number"
                min="0"
                value={formData.stock}
                onChange={(e) => setFormData({ ...formData, stock: Number(e.target.value) })}
                className="w-full px-3.5 py-2.5 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                Threshold Batas Min (Warning) *
              </label>
              <input
                type="number"
                min="0"
                value={formData.min_stock}
                onChange={(e) => setFormData({ ...formData, min_stock: Number(e.target.value) })}
                className="w-full px-3.5 py-2.5 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                Stok Ideal (Target Penuh) *
              </label>
              <input
                type="number"
                min="0"
                value={formData.target_stock}
                onChange={(e) => setFormData({ ...formData, target_stock: Number(e.target.value) })}
                className="w-full px-3.5 py-2.5 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white"
              />
              <p className="text-[10px] text-slate-400 mt-1">Patokan stok penuh untuk hitung kebutuhan pengadaan.</p>
            </div>
          </div>

          <div className="flex justify-end gap-2 pt-4 border-t border-slate-100 dark:border-slate-800">
            <Button
              type="button"
              onClick={() => setIsAddEditOpen(false)}
              variant="outline"
              size="sm"
            >
              Batal
            </Button>
            {!selectedMaterial && (
              <Button
                type="button"
                onClick={() => handleSaveMaterial(null, true)}
                variant="secondary"
                size="sm"
              >
                Simpan & Tambah Lagi
              </Button>
            )}
            <Button
              type="submit"
              variant="primary"
              size="sm"
            >
              Simpan Data
            </Button>
          </div>
        </form>
      </Modal>

      {/* Restock Modal */}
      <Modal
        isOpen={isRestockOpen}
        onClose={() => setIsRestockOpen(false)}
        title={`Pencatatan Stok Masuk (Restock): ${selectedMaterial?.material_name}`}
        maxWidth="max-w-md"
      >
        <form onSubmit={handleSaveRestock} className="space-y-4">
          <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800 text-xs space-y-1">
            <p className="text-slate-500">Sisa Stok Saat Ini: <span className="font-bold text-slate-900 dark:text-white">{selectedMaterial?.stock} {selectedMaterial?.unit}</span></p>
            <p className="text-slate-500">Batas Min Threshold: <span className="font-bold text-slate-900 dark:text-white">{selectedMaterial?.min_stock} {selectedMaterial?.unit}</span></p>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
              Jumlah Stok Masuk ({selectedMaterial?.unit}) *
            </label>
            <input
              type="number"
              min="1"
              value={restockData.quantity}
              onChange={(e) => setRestockData({ ...restockData, quantity: Number(e.target.value) })}
              required
              className="w-full px-3.5 py-2.5 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white focus:ring-2 focus:ring-teal-500"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
              Catatan / Pengadaan *
            </label>
            <textarea
              rows={2}
              value={restockData.note}
              onChange={(e) => setRestockData({ ...restockData, note: e.target.value })}
              placeholder="Contoh: Pengadaan bahan rutin semester ganjil dari distributor"
              className="w-full px-3.5 py-2.5 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white"
            ></textarea>
          </div>

          <div className="flex justify-end gap-2 pt-4 border-t border-slate-100 dark:border-slate-800">
            <Button
              type="button"
              onClick={() => setIsRestockOpen(false)}
              variant="outline"
              size="sm"
            >
              Batal
            </Button>
            <Button
              type="submit"
              variant="secondary"
              size="sm"
              icon={PlusCircle}
            >
              Proses Stok Masuk
            </Button>
          </div>
        </form>
      </Modal>

      <Toast toast={toast} onClose={() => setToast(null)} />
    </div>
  );
};
