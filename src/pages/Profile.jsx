import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { Button } from '../components/common/Button';
import { Toast } from '../components/common/Toast';
import { User, Shield, Key, Mail, Building, Calendar, CheckCircle2 } from 'lucide-react';
import { formatDate } from '../utils/formatters';

export const Profile = () => {
  const { currentUser } = useAuth();
  const [oldPassword, setOldPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [toast, setToast] = useState(null);

  const handleChangePassword = (e) => {
    e.preventDefault();
    if (newPassword !== confirmPassword) {
      setToast({ type: 'error', message: 'Konfirmasi kata sandi baru tidak cocok.' });
      return;
    }
    if (newPassword.length < 6) {
      setToast({ type: 'error', message: 'Kata sandi baru minimal 6 karakter.' });
      return;
    }
    setToast({ type: 'success', message: 'Kata sandi berhasil diperbarui.' });
    setOldPassword('');
    setNewPassword('');
    setConfirmPassword('');
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      
      {/* Profile Header */}
      <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col sm:flex-row items-center gap-6">
        <div className="w-20 h-20 rounded-2xl bg-gradient-to-tr from-polbeng-blue to-teal-500 text-white flex items-center justify-center font-black text-3xl shadow-lg">
          {currentUser?.name?.charAt(0) || 'U'}
        </div>
        <div className="space-y-1 text-center sm:text-left">
          <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2">
            <h2 className="text-xl font-bold text-slate-900 dark:text-slate-100">
              {currentUser?.name}
            </h2>
            <span className={`px-2.5 py-0.5 rounded-full text-xs font-bold uppercase tracking-wider ${
              currentUser?.role === 'admin'
                ? 'bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300'
                : 'bg-teal-100 text-teal-800 dark:bg-teal-950 dark:text-teal-300'
            }`}>
              {currentUser?.role === 'admin' ? 'Admin / Teknisi Lab' : 'Pengguna Praktikum'}
            </span>
          </div>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            {currentUser?.email}
          </p>
          <p className="text-xs font-semibold text-teal-600 dark:text-teal-400 pt-1">
            Unit Laboratorium Bengkel Kerja • Politeknik Negeri Bengkalis
          </p>
        </div>
      </div>

      {/* Account Info Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        
        {/* Info Detail */}
        <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
          <h3 className="text-base font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
            <User className="w-4 h-4 text-polbeng-blue dark:text-sky-400" />
            <span>Rincian Akun Pengguna</span>
          </h3>

          <div className="space-y-3 text-xs divide-y divide-slate-100 dark:divide-slate-800">
            <div className="pt-2 flex justify-between">
              <span className="text-slate-500">Alamat Email:</span>
              <span className="font-semibold text-slate-900 dark:text-slate-200">{currentUser?.email}</span>
            </div>
            <div className="pt-2 flex justify-between">
              <span className="text-slate-500">Hak Akses:</span>
              <span className="font-semibold text-slate-900 dark:text-slate-200 uppercase">{currentUser?.role}</span>
            </div>
            <div className="pt-2 flex justify-between">
              <span className="text-slate-500">Terdaftar Sejak:</span>
              <span className="font-semibold text-slate-900 dark:text-slate-200">{formatDate(currentUser?.created_at)}</span>
            </div>
            <div className="pt-2 flex justify-between">
              <span className="text-slate-500">Status Akun:</span>
              <span className="font-bold text-emerald-600">Aktif Terverifikasi</span>
            </div>
          </div>
        </div>

        {/* Change Password Form */}
        <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
          <h3 className="text-base font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
            <Key className="w-4 h-4 text-amber-500" />
            <span>Ubah Kata Sandi (Security)</span>
          </h3>

          <form onSubmit={handleChangePassword} className="space-y-3">
            <div>
              <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 mb-1">
                Kata Sandi Lama
              </label>
              <input
                type="password"
                value={oldPassword}
                onChange={(e) => setOldPassword(e.target.value)}
                required
                className="w-full px-3 py-2 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 mb-1">
                Kata Sandi Baru
              </label>
              <input
                type="password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                required
                className="w-full px-3 py-2 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 mb-1">
                Konfirmasi Kata Sandi Baru
              </label>
              <input
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                required
                className="w-full px-3 py-2 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white"
              />
            </div>

            <Button
              type="submit"
              variant="primary"
              size="sm"
              className="w-full mt-2"
            >
              Perbarui Kata Sandi
            </Button>
          </form>
        </div>

      </div>

      <Toast toast={toast} onClose={() => setToast(null)} />
    </div>
  );
};
