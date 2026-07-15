import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { Button } from '../components/common/Button';
import { Modal } from '../components/common/Modal';
import { Toast } from '../components/common/Toast';
import {
  FileSpreadsheet,
  Plus,
  CheckCircle2,
  XCircle,
  AlertCircle,
  BookOpen
} from 'lucide-react';
import {
  getRequests,
  getMaterials,
  getCourses,
  getUsers,
  createUsageRequest,
  approveUsageRequest,
  rejectUsageRequest
} from '../utils/storage';
import { formatDate, getRequestStatusBadge } from '../utils/formatters';

export const UsageRequests = () => {
  const { currentUser, isAdmin } = useAuth();
  const [requests, setRequests] = useState([]);
  const [materials, setMaterials] = useState([]);
  const [coursesList, setCoursesList] = useState([]);
  const [users, setUsers] = useState([]);

  // Modal states
  const [isNewModalOpen, setIsNewModalOpen] = useState(false);
  const [isProcessModalOpen, setIsProcessModalOpen] = useState(false);
  const [selectedReq, setSelectedReq] = useState(null);
  const [processAction, setProcessAction] = useState('approve');
  const [adminNote, setAdminNote] = useState('');

  // Form state for creating request
  const [formData, setFormData] = useState({
    material_id: '',
    quantity: 1,
    semester: 1,
    practical_hours: 4,
    practical_date: new Date().toISOString().split('T')[0]
  });

  const [toast, setToast] = useState(null);

  const loadData = () => {
    const reqs = getRequests();
    const mats = getMaterials();
    const crs = getCourses();
    const usrs = getUsers();
    setRequests(reqs);
    setMaterials(mats);
    setCoursesList(crs);
    setUsers(usrs);

    if (mats.length > 0 && !formData.material_id) {
      setFormData(prev => ({
        ...prev,
        material_id: mats[0].id,
        semester: mats[0].semester,
        practical_hours: mats[0].practical_hours
      }));
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const matMap = new Map(materials.map(m => [m.id, m]));
  const courseMap = new Map(coursesList.map(c => [c.id, c]));
  const userMap = new Map(users.map(u => [u.id, u.name]));

  const displayRequests = isAdmin
    ? requests
    : requests.filter(r => r.user_id === currentUser?.id);

  const handleMaterialChange = (materialId) => {
    const mat = matMap.get(materialId);
    setFormData(prev => ({
      ...prev,
      material_id: materialId,
      semester: mat ? mat.semester : prev.semester,
      practical_hours: mat ? mat.practical_hours : prev.practical_hours
    }));
  };

  const handleCreateSubmit = (e) => {
    e.preventDefault();
    try {
      createUsageRequest({
        ...formData,
        user_id: currentUser.id
      });
      setToast({ type: 'success', message: 'Permohonan bahan praktikum berhasil dikirim dan menunggu verifikasi admin lab.' });
      setIsNewModalOpen(false);
      loadData();
    } catch (err) {
      setToast({ type: 'error', message: err.message });
    }
  };

  const handleOpenProcess = (req, action) => {
    setSelectedReq(req);
    setProcessAction(action);
    setAdminNote(action === 'approve' ? 'Disetujui untuk kegiatan praktikum' : 'Stok bahan tidak mencukupi');
    setIsProcessModalOpen(true);
  };

  const handleProcessSubmit = (e) => {
    e.preventDefault();
    try {
      if (processAction === 'approve') {
        approveUsageRequest({
          requestId: selectedReq.id,
          adminId: currentUser.id,
          adminNote
        });
        setToast({ type: 'success', message: `Permohonan ID: ${selectedReq.id} BERHASIL DISETUJUI. Sisa stok berkurang otomatis.` });
      } else {
        rejectUsageRequest({
          requestId: selectedReq.id,
          adminId: currentUser.id,
          adminNote
        });
        setToast({ type: 'info', message: `Permohonan ID: ${selectedReq.id} telah ditolak.` });
      }
      setIsProcessModalOpen(false);
      loadData();
    } catch (err) {
      setToast({ type: 'error', message: err.message });
    }
  };

  return (
    <div className="space-y-6">
      
      {/* Header Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-xl font-bold text-slate-900 dark:text-slate-100 font-sans tracking-tight">
              Permohonan & Pemakaian Bahan Habis Pakai
            </h2>
            <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300">
              {requests.filter(r => r.status === 'pending').length} Menunggu Approval
            </span>
          </div>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            Alur pengajuan bahan praktikum oleh mahasiswa/dosen dan verifikasi teknisi laboratorium Bengkel Kerja.
          </p>
        </div>

        <Button
          onClick={() => setIsNewModalOpen(true)}
          variant="secondary"
          size="md"
          icon={Plus}
        >
          Ajukan Bahan Praktikum
        </Button>
      </div>

      {/* Requests Table */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 dark:bg-slate-800/80 text-slate-600 dark:text-slate-400 uppercase font-bold text-[10px] tracking-wider border-b border-slate-200 dark:border-slate-800">
              <tr>
                <th className="px-4 py-3.5">Tgl Pengajuan</th>
                <th className="px-4 py-3.5">Pemohon</th>
                <th className="px-4 py-3.5">Bahan Habis Pakai (BAP)</th>
                <th className="px-4 py-3.5 text-center">Jumlah</th>
                <th className="px-4 py-3.5 text-center">Sisa Stok Available</th>
                <th className="px-4 py-3.5 text-center">Sem. / Jam</th>
                <th className="px-4 py-3.5 text-center">Tgl Praktikum</th>
                <th className="px-4 py-3.5 text-center">Status</th>
                {isAdmin && <th className="px-4 py-3.5 text-right">Approval Admin</th>}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60">
              {displayRequests.map((req) => {
                const mat = matMap.get(req.material_id);
                const crs = courseMap.get(req.course_id || mat?.course_id);
                const isStockInsufficient = mat && mat.stock < req.quantity;
                const statusBadge = getRequestStatusBadge(req.status);

                return (
                  <tr key={req.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/40">
                    <td className="px-4 py-4 font-mono text-slate-500 text-[11px]">
                      {formatDate(req.created_at)}
                    </td>

                    <td className="px-4 py-4 font-semibold text-slate-900 dark:text-slate-100">
                      {userMap.get(req.user_id) || 'User'}
                    </td>

                    <td className="px-4 py-4">
                      <div className="font-bold text-slate-800 dark:text-slate-200">
                        {mat?.material_name || 'Material'}
                      </div>
                      <div className="text-[11px] text-teal-600 dark:text-teal-400 font-medium">
                        {crs ? `${crs.course_name} (${crs.day_of_week} ${crs.start_time}-${crs.end_time})` : 'Umum'}
                      </div>
                    </td>

                    <td className="px-4 py-4 text-center font-bold font-mono text-slate-900 dark:text-white">
                      {req.quantity} {mat?.unit}
                    </td>

                    <td className="px-4 py-4 text-center font-mono">
                      <span className={`px-2 py-0.5 rounded font-semibold ${isStockInsufficient ? 'bg-rose-100 text-rose-700 dark:bg-rose-950 dark:text-rose-300' : 'bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300'}`}>
                        {mat ? `${mat.stock} ${mat.unit}` : 'N/A'}
                      </span>
                    </td>

                    <td className="px-4 py-4 text-center text-slate-600 dark:text-slate-300">
                      Sem {req.semester} ({req.practical_hours} Jam)
                    </td>

                    <td className="px-4 py-4 text-center font-mono text-slate-600 dark:text-slate-300">
                      {formatDate(req.practical_date)}
                    </td>

                    <td className="px-4 py-4 text-center">
                      <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-semibold ${statusBadge.bg}`}>
                        {statusBadge.label}
                      </span>
                      {req.admin_note && (
                        <p className="text-[10px] text-slate-400 italic mt-0.5 max-w-[120px] truncate mx-auto" title={req.admin_note}>
                          "{req.admin_note}"
                        </p>
                      )}
                    </td>

                    {isAdmin && (
                      <td className="px-4 py-4 text-right">
                        {req.status === 'pending' ? (
                          <div className="flex items-center justify-end gap-1.5">
                            <Button
                              onClick={() => handleOpenProcess(req, 'approve')}
                              variant="secondary"
                              size="sm"
                              icon={CheckCircle2}
                            >
                              Approve
                            </Button>
                            <Button
                              onClick={() => handleOpenProcess(req, 'reject')}
                              variant="danger"
                              size="sm"
                              icon={XCircle}
                            >
                              Tolak
                            </Button>
                          </div>
                        ) : (
                          <span className="text-[11px] text-slate-400 font-mono">
                            Selesai diproses
                          </span>
                        )}
                      </td>
                    )}
                  </tr>
                );
              })}

              {displayRequests.length === 0 && (
                <tr>
                  <td colSpan={isAdmin ? 9 : 8} className="py-12 text-center text-slate-500 dark:text-slate-400">
                    <FileSpreadsheet className="w-8 h-8 mx-auto mb-2 opacity-40" />
                    <p className="font-semibold">Belum ada riwayat permohonan bahan yang diajukan.</p>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* New Request Modal */}
      <Modal
        isOpen={isNewModalOpen}
        onClose={() => setIsNewModalOpen(false)}
        title="Formulir Permohonan Bahan Praktikum"
        maxWidth="max-w-lg"
      >
        <form onSubmit={handleCreateSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
              Pilih Bahan Habis Pakai (BAP) *
            </label>
            <select
              value={formData.material_id}
              onChange={(e) => handleMaterialChange(e.target.value)}
              className="w-full px-3.5 py-2.5 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white focus:ring-2 focus:ring-teal-500"
            >
              {materials.map(m => (
                <option key={m.id} value={m.id}>
                  {m.material_name} (Sisa Stok: {m.stock} {m.unit})
                </option>
              ))}
            </select>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                Jumlah Yang Diminta *
              </label>
              <input
                type="number"
                min="1"
                value={formData.quantity}
                onChange={(e) => setFormData({ ...formData, quantity: Number(e.target.value) })}
                required
                className="w-full px-3.5 py-2.5 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                Tanggal Pelaksanaan Praktikum *
              </label>
              <input
                type="date"
                value={formData.practical_date}
                onChange={(e) => setFormData({ ...formData, practical_date: e.target.value })}
                required
                className="w-full px-3.5 py-2.5 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                Semester Praktikum *
              </label>
              <select
                value={formData.semester}
                onChange={(e) => setFormData({ ...formData, semester: Number(e.target.value) })}
                className="w-full px-3.5 py-2.5 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white"
              >
                {[1, 2, 3, 4, 5, 6].map(s => (
                  <option key={s} value={s}>Semester {s}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                Durasi Praktikum (Jam) *
              </label>
              <input
                type="number"
                min="1"
                value={formData.practical_hours}
                onChange={(e) => setFormData({ ...formData, practical_hours: Number(e.target.value) })}
                required
                className="w-full px-3.5 py-2.5 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white"
              />
            </div>
          </div>

          <div className="flex justify-end gap-2 pt-4 border-t border-slate-100 dark:border-slate-800">
            <Button
              type="button"
              onClick={() => setIsNewModalOpen(false)}
              variant="outline"
              size="sm"
            >
              Batal
            </Button>
            <Button
              type="submit"
              variant="secondary"
              size="sm"
            >
              Kirim Permohonan
            </Button>
          </div>
        </form>
      </Modal>

      {/* Admin Process Modal */}
      <Modal
        isOpen={isProcessModalOpen}
        onClose={() => setIsProcessModalOpen(false)}
        title={processAction === 'approve' ? 'Konfirmasi Disetujui (Approve)' : 'Konfirmasi Penolakan Permohonan'}
        maxWidth="max-w-md"
      >
        {selectedReq && (
          <form onSubmit={handleProcessSubmit} className="space-y-4">
            <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800 text-xs space-y-1.5 border border-slate-200 dark:border-slate-700">
              <p><span className="text-slate-500">Pemohon:</span> <span className="font-bold text-slate-900 dark:text-white">{userMap.get(selectedReq.user_id)}</span></p>
              <p><span className="text-slate-500">Item Bahan:</span> <span className="font-bold text-slate-900 dark:text-white">{matMap.get(selectedReq.material_id)?.material_name}</span></p>
              <p><span className="text-slate-500">Jumlah Diminta:</span> <span className="font-bold text-teal-600 dark:text-teal-400">{selectedReq.quantity} {matMap.get(selectedReq.material_id)?.unit}</span></p>
              <p><span className="text-slate-500">Sisa Stok Terkini:</span> <span className="font-bold text-slate-900 dark:text-white">{matMap.get(selectedReq.material_id)?.stock} {matMap.get(selectedReq.material_id)?.unit}</span></p>
            </div>

            {processAction === 'approve' && matMap.get(selectedReq.material_id)?.stock < selectedReq.quantity && (
              <div className="p-3 rounded-xl bg-rose-50 dark:bg-rose-950/80 border border-rose-300 dark:border-rose-800 text-rose-800 dark:text-rose-200 text-xs font-semibold flex items-start gap-2">
                <AlertCircle className="w-4 h-4 text-rose-500 flex-shrink-0 mt-0.5" />
                <span>Peringatan: Stok tidak mencukupi! Sistem akan menolak persetujuan ini.</span>
              </div>
            )}

            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                Catatan / Alasan Verifikasi Admin
              </label>
              <textarea
                rows={2}
                value={adminNote}
                onChange={(e) => setAdminNote(e.target.value)}
                required
                className="w-full px-3.5 py-2.5 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white"
              ></textarea>
            </div>

            <div className="flex justify-end gap-2 pt-4 border-t border-slate-100 dark:border-slate-800">
              <Button
                type="button"
                onClick={() => setIsProcessModalOpen(false)}
                variant="outline"
                size="sm"
              >
                Batal
              </Button>
              <Button
                type="submit"
                variant={processAction === 'approve' ? 'secondary' : 'danger'}
                size="sm"
              >
                {processAction === 'approve' ? 'Konfirmasi Setuju & Potong Stok' : 'Konfirmasi Tolak Permohonan'}
              </Button>
            </div>
          </form>
        )}
      </Modal>

      <Toast toast={toast} onClose={() => setToast(null)} />
    </div>
  );
};
