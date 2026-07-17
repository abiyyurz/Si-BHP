import React, { createContext, useContext, useState, useEffect } from 'react';
import { supabase } from '../utils/supabase';
import { saveUser, updateUserProfile } from '../utils/storage';
import { verifyPassword, isHashed } from '../utils/password';

const AuthContext = createContext(null);

const SESSION_KEY = 'sibap_auth_session';
// Tanpa "Ingat saya": sesi hangus jika web ditinggalkan lebih dari 5 menit
const IDLE_LIMIT_MS = 5 * 60 * 1000;

export const AuthProvider = ({ children }) => {
  const [currentUser, setCurrentUser] = useState(null);
  const [darkMode, setDarkMode] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const init = async () => {
      // Session check: ambil ulang data user dari database agar selalu segar
      const savedUser = localStorage.getItem(SESSION_KEY);
      if (savedUser) {
        try {
          const parsed = JSON.parse(savedUser);
          // Sesi tanpa "Ingat saya" kedaluwarsa setelah web ditinggalkan 5 menit
          if (!parsed.remember && Date.now() - (parsed.lastSeen || 0) > IDLE_LIMIT_MS) {
            throw new Error('session expired');
          }
          const { data } = await supabase.from('users').select('*').eq('id', parsed.id).single();
          if (data && data.is_active) {
            setCurrentUser(data);
          } else {
            localStorage.removeItem(SESSION_KEY);
          }
        } catch (e) {
          localStorage.removeItem(SESSION_KEY);
        }
      }

      // Theme preference
      const savedTheme = localStorage.getItem('sibap_theme');
      const isDark = savedTheme === 'dark';
      setDarkMode(isDark);
      document.documentElement.classList.toggle('dark', isDark);

      setLoading(false);
    };
    init();
  }, []);

  // Selama web terbuka, perbarui stempel "terakhir terlihat" pada sesi
  // non-"Ingat saya" — jadi hitungan 5 menit dimulai saat web ditinggalkan.
  useEffect(() => {
    if (!currentUser) return;
    const touch = () => {
      try {
        const raw = localStorage.getItem(SESSION_KEY);
        if (!raw) return;
        const s = JSON.parse(raw);
        if (s.remember) return;
        localStorage.setItem(SESSION_KEY, JSON.stringify({ ...s, lastSeen: Date.now() }));
      } catch (e) { /* abaikan */ }
    };
    touch();
    const iv = setInterval(touch, 30 * 1000);
    window.addEventListener('beforeunload', touch);
    document.addEventListener('visibilitychange', touch);
    return () => {
      clearInterval(iv);
      window.removeEventListener('beforeunload', touch);
      document.removeEventListener('visibilitychange', touch);
    };
  }, [currentUser]);

  const toggleDarkMode = () => {
    const nextDark = !darkMode;
    setDarkMode(nextDark);
    document.documentElement.classList.toggle('dark', nextDark);
    localStorage.setItem('sibap_theme', nextDark ? 'dark' : 'light');
  };

  const loginWithCredentials = async (username, password, rememberMe = false) => {
    const cleanUsername = username.trim().toLowerCase();
    const { data: matched, error } = await supabase
      .from('users').select('*').eq('username', cleanUsername).single();

    if (error || !matched) {
      throw new Error("Username tidak ditemukan. Silakan daftarkan akun terlebih dahulu.");
    }
    if (!(await verifyPassword(password, matched.password))) {
      throw new Error("Password yang Anda masukkan salah.");
    }
    if (!matched.is_active) {
      throw new Error("Akun ini telah dinonaktifkan oleh administrator.");
    }

    // Akun lama yang password-nya masih teks polos di-upgrade ke hash saat login berhasil
    if (matched.password && !isHashed(matched.password)) {
      await updateUserProfile(matched.id, { password });
    }

    setCurrentUser(matched);
    localStorage.setItem(SESSION_KEY, JSON.stringify({
      id: matched.id,
      remember: !!rememberMe,
      lastSeen: Date.now()
    }));
    return matched;
  };

  // Lupa password: cocokkan username + email terdaftar, lalu set password baru.
  const resetPasswordByEmail = async ({ username, email, newPassword }) => {
    if ((newPassword || '').length < 8) throw new Error("Password baru minimal 8 karakter.");
    const cleanUsername = username.trim().toLowerCase();
    const { data: matched, error } = await supabase
      .from('users').select('*').eq('username', cleanUsername).single();

    if (error || !matched) throw new Error("Username tidak ditemukan.");
    if (!matched.email || matched.email.trim().toLowerCase() !== email.trim().toLowerCase()) {
      throw new Error("Email tidak cocok dengan email yang terdaftar pada akun ini.");
    }
    if (!matched.is_active) throw new Error("Akun ini telah dinonaktifkan oleh administrator.");

    await updateUserProfile(matched.id, { password: newPassword });
    return matched;
  };

  const registerNewAccount = async ({ first_name, last_name, username, email, password, user_type }) => {
    if ((password || '').length < 8) throw new Error("Password minimal 8 karakter.");
    // mahasiswa & dosen/tendik adalah user biasa; admin/teknisi punya role admin.
    const role = user_type === 'admin' ? 'admin' : 'user';
    const newUser = await saveUser({
      first_name,
      last_name,
      username: username.trim().toLowerCase(),
      email: email?.trim().toLowerCase(),
      password,
      role,
      user_type,
      is_active: true
    });
    return newUser;
  };

  const updateProfile = async (patch) => {
    if (!currentUser) throw new Error("Tidak ada sesi aktif.");
    const updated = await updateUserProfile(currentUser.id, patch);
    setCurrentUser(updated);
    return updated;
  };

  const changePassword = async (oldPassword, newPassword) => {
    if (!currentUser) throw new Error("Tidak ada sesi aktif.");
    if ((newPassword || '').length < 8) throw new Error("Kata sandi baru minimal 8 karakter.");
    if (!(await verifyPassword(oldPassword, currentUser.password))) {
      throw new Error("Kata sandi lama yang Anda masukkan salah.");
    }
    return updateProfile({ password: newPassword });
  };

  const logout = () => {
    setCurrentUser(null);
    localStorage.removeItem(SESSION_KEY);
  };

  return (
    <AuthContext.Provider
      value={{
        currentUser,
        darkMode,
        loading,
        toggleDarkMode,
        loginWithCredentials,
        registerNewAccount,
        resetPasswordByEmail,
        updateProfile,
        changePassword,
        logout,
        isAdmin: currentUser?.role === 'admin'
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
