import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { Button } from '../components/common/Button';
import { Modal } from '../components/common/Modal';
import { Toast } from '../components/common/Toast';
import { Wrench, Plus, Edit, Trash2, Calendar } from 'lucide-react';
import { getEquipment, saveEquipment, deleteEquipment, getMaterials } from '../utils/storage';
import { formatDate } from '../utils/formatters';

export const Equipment = () => {
  const { isAdmin } = useAuth();
  const [equipmentList, setEquipmentList] = useState([]);
  const [materials, setMaterials] = useState([]);
  const [isOpenModal, setIsOpenModal] = useState(false);
  const [selectedEq, setSelectedEq] = useState(null);

  const [formData, setFormData] = useState({
    equipment_name: '',
    description: ''
  });

  const [toast, setToast] = useState(null);

  const loadData = () => {
    setEquipmentList(getEquipment());
    setMaterials(getMaterials());
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleOpenAdd = () => {
    setSelectedEq(null);
    setFormData({ equipment_name: '', description: '' });
    setIsOpenModal(true);
  };

  const handleOpenEdit = (eq) => {
    setSelectedEq(eq);
    setFormData({ equipment_name: eq.equipment_name, description: eq.description || '' });
    setIsOpenModal(true);
  };

  const handleSave = (e) => {
    e.preventDefault();
    try {
      if (!formData.equipment_name.trim()) throw new Error("Nama peralatan tidak boleh kosong.");
      saveEquipment({
        ...(selectedEq ? { id: selectedEq.id } : {}),
        ...formData
      });
      setToast({ type: 'success', message: `Data peralatan "${formData.equipment_name}" tersimpan.` });
      setIsOpenModal(false);
      loadData();
    } catch (err) {
      setToast({ type: 'error', message: err.message });
    }
  };

  const handleDelete = (eq) => {
    // Check if equipment is linked to materials
    const linkedCount = materials.filter(m => m.equipment_id === eq.id).length;
    if (linkedCount > 0) {
      setToast({ type: 'warning', message: `Tidak dapat menghapus "${eq.equipment_name}" karena terikat pada ${linkedCount} jenis bahan BHP.` });
      return;
    }

    if (confirm(`Apakah Anda yakin ingin menghapus data peralatan: "${eq.equipment_name}"?`)) {
      deleteEquipment(eq.id);
      setToast({ type: 'info', message: `Peralatan "${eq.equipment_name}" telah dihapus.` });
      loadData();
    }
  };

  return (
    <div className="space-y-6">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-xl font-bold text-slate-900 dark:text-slate-100 font-sans tracking-tight">
              Master Data Peralatan Laboratorium
            </h2>
            <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-sky-100 text-sky-800 dark:bg-sky-950 dark:text-sky-300">
              {equipmentList.length} Mesin & Fasilitas
            </span>
          </div>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            Daftar mesin bubut, mesin las SMAW, gerinda, bor duduk, dan ragum bangku kerja.
          </p>
        </div>

        {isAdmin && (
          <Button
            onClick={handleOpenAdd}
            variant="primary"
            size="sm"
            icon={Plus}
          >
            Tambah Peralatan Baru
          </Button>
        )}
      </div>

      {/* Equipment Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {equipmentList.map((eq) => {
          const linkedMaterials = materials.filter(m => m.equipment_id === eq.id);

          return (
            <div
              key={eq.id}
              className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm hover:shadow-md transition-all space-y-4 flex flex-col justify-between"
            >
              <div className="space-y-2">
                <div className="flex items-start justify-between">
                  <div className="p-2.5 rounded-xl bg-sky-50 dark:bg-sky-950/60 text-sky-600 dark:text-sky-400 border border-sky-200 dark:border-sky-800">
                    <Wrench className="w-5 h-5" />
                  </div>

                  {isAdmin && (
                    <div className="flex items-center gap-1">
                      <button
                        onClick={() => handleOpenEdit(eq)}
                        className="p-1 text-slate-400 hover:text-blue-500 p-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                        title="Edit Peralatan"
                      >
                        <Edit className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleDelete(eq)}
                        className="p-1 text-slate-400 hover:text-rose-500 p-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                        title="Hapus Peralatan"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  )}
                </div>

                <h3 className="text-base font-bold text-slate-900 dark:text-slate-100">
                  {eq.equipment_name}
                </h3>

                <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed line-clamp-3">
                  {eq.description || 'Fasilitas kerja bengkel praktikum Jurusan Teknik Mesin Polbeng.'}
                </p>
              </div>

              <div className="pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-xs text-slate-500">
                <span className="font-semibold text-teal-600 dark:text-teal-400">
                  {linkedMaterials.length} Jenis BHP Terkait
                </span>
                <span className="flex items-center gap-1 font-mono text-[11px]">
                  <Calendar className="w-3.5 h-3.5" />
                  {formatDate(eq.created_at)}
                </span>
              </div>
            </div>
          );
        })}
      </div>

      {/* Form Modal */}
      <Modal
        isOpen={isOpenModal}
        onClose={() => setIsOpenModal(false)}
        title={selectedEq ? `Edit Peralatan: ${selectedEq.equipment_name}` : 'Tambah Peralatan Lab Baru'}
        maxWidth="max-w-md"
      >
        <form onSubmit={handleSave} className="space-y-4">
          <div>
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
              Nama Peralatan / Mesin *
            </label>
            <input
              type="text"
              value={formData.equipment_name}
              onChange={(e) => setFormData({ ...formData, equipment_name: e.target.value })}
              placeholder="Contoh: Mesin Bubut Konvensional #01"
              required
              className="w-full px-3.5 py-2.5 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white focus:ring-2 focus:ring-teal-500"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
              Deskripsi & Spesifikasi
            </label>
            <textarea
              rows={3}
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              placeholder="Spesifikasi mesin, kapasitas, atau peruntukan praktikum..."
              className="w-full px-3.5 py-2.5 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white"
            ></textarea>
          </div>

          <div className="flex justify-end gap-2 pt-4 border-t border-slate-100 dark:border-slate-800">
            <Button
              type="button"
              onClick={() => setIsOpenModal(false)}
              variant="outline"
              size="sm"
            >
              Batal
            </Button>
            <Button
              type="submit"
              variant="primary"
              size="sm"
            >
              Simpan Peralatan
            </Button>
          </div>
        </form>
      </Modal>

      <Toast toast={toast} onClose={() => setToast(null)} />
    </div>
  );
};
