import React, { createContext, useContext, useState, useEffect } from 'react';
import { getUsers, saveUser, updateUserProfile, initializeDB } from '../utils/storage';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [currentUser, setCurrentUser] = useState(null);
  const [users, setUsers] = useState([]);
  const [darkMode, setDarkMode] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // 1. Initialize Seed DB
    initializeDB();

    // 2. Load Users
    const loadedUsers = getUsers();
    setUsers(loadedUsers);

    // 3. Session Check (Require manual login first time)
    const savedUser = localStorage.getItem('sibap_auth_session');
    if (savedUser) {
      try {
        const parsed = JSON.parse(savedUser);
        const validUser = loadedUsers.find(u => u.id === parsed.id && u.is_active);
        if (validUser) {
          setCurrentUser(validUser);
        } else {
          localStorage.removeItem('sibap_auth_session');
          setCurrentUser(null);
        }
      } catch (e) {
        localStorage.removeItem('sibap_auth_session');
        setCurrentUser(null);
      }
    } else {
      setCurrentUser(null);
    }

    // 4. Default Light Mode Preference
    const savedTheme = localStorage.getItem('sibap_theme');
    const isDark = savedTheme === 'dark';
    setDarkMode(isDark);
    if (isDark) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }

    setLoading(false);
  }, []);

  const toggleDarkMode = () => {
    const nextDark = !darkMode;
    setDarkMode(nextDark);
    if (nextDark) {
      document.documentElement.classList.add('dark');
      localStorage.setItem('sibap_theme', 'dark');
    } else {
      document.documentElement.classList.remove('dark');
      localStorage.setItem('sibap_theme', 'light');
    }
  };

  const loginAsUser = (userId) => {
    const freshUsers = getUsers();
    const target = freshUsers.find(u => u.id === userId);
    if (target) {
      if (!target.is_active) {
        throw new Error("Akun ini telah dinonaktifkan oleh administrator.");
      }
      setCurrentUser(target);
      localStorage.setItem('sibap_auth_session', JSON.stringify(target));
      return target;
    }
    throw new Error("Pengguna tidak ditemukan.");
  };

  const loginWithCredentials = (username, password, role) => {
    const freshUsers = getUsers();
    const cleanUsername = username.trim().toLowerCase();
    const matched = freshUsers.find(
      u => u.username.toLowerCase() === cleanUsername && u.role === role
    );

    if (matched) {
      if (matched.password && matched.password !== password) {
        throw new Error("Password yang Anda masukkan salah.");
      }
      return loginAsUser(matched.id);
    }

    // Fallback: search by username regardless of role
    const matchedByUsername = freshUsers.find(u => u.username.toLowerCase() === cleanUsername);
    if (matchedByUsername) {
      if (matchedByUsername.password && matchedByUsername.password !== password) {
        throw new Error("Password yang Anda masukkan salah.");
      }
      return loginAsUser(matchedByUsername.id);
    }

    throw new Error("Username atau role tidak ditemukan. Silakan daftarkan akun terlebih dahulu.");
  };

  const registerNewAccount = ({ first_name, last_name, username, password, user_type }) => {
    const freshUsers = getUsers();
    const cleanUsername = username.trim().toLowerCase();
    const existing = freshUsers.find(u => u.username.toLowerCase() === cleanUsername);
    if (existing) {
      throw new Error("Username ini sudah digunakan. Silakan pilih username lain.");
    }

    // mahasiswa & dosen are regular users; admin/teknisi is the admin role.
    const role = user_type === 'admin' ? 'admin' : 'user';
    const newUser = saveUser({
      first_name,
      last_name,
      username: cleanUsername,
      password,
      role,
      user_type,
      is_active: true
    });

    setUsers(getUsers());
    return newUser;
  };

  const updateProfile = (patch) => {
    if (!currentUser) throw new Error("Tidak ada sesi aktif.");
    const updated = updateUserProfile(currentUser.id, patch);
    setCurrentUser(updated);
    localStorage.setItem('sibap_auth_session', JSON.stringify(updated));
    setUsers(getUsers());
    return updated;
  };

  const changePassword = (oldPassword, newPassword) => {
    if (!currentUser) throw new Error("Tidak ada sesi aktif.");
    if (currentUser.password && currentUser.password !== oldPassword) {
      throw new Error("Kata sandi lama yang Anda masukkan salah.");
    }
    return updateProfile({ password: newPassword });
  };

  const logout = () => {
    setCurrentUser(null);
    localStorage.removeItem('sibap_auth_session');
  };

  const refreshUsersList = () => {
    setUsers(getUsers());
  };

  return (
    <AuthContext.Provider
      value={{
        currentUser,
        users,
        darkMode,
        loading,
        toggleDarkMode,
        loginAsUser,
        loginWithCredentials,
        registerNewAccount,
        updateProfile,
        changePassword,
        logout,
        refreshUsersList,
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
