import {
  initialLabs,
  initialCourses,
  initialMaterials,
  initialUsers,
  initialTransactions,
  initialRequests
} from '../data/initialSeedData';

const KEYS = {
  LABS: 'sibap_labs_v2',
  COURSES: 'sibap_courses_v2',
  MATERIALS: 'sibap_materials_v2',
  USERS: 'sibap_users_v2',
  TRANSACTIONS: 'sibap_transactions_v2',
  REQUESTS: 'sibap_requests_v2',
};

const getItem = (key, defaultData) => {
  try {
    const data = localStorage.getItem(key);
    if (!data) {
      localStorage.setItem(key, JSON.stringify(defaultData));
      return defaultData;
    }
    return JSON.parse(data);
  } catch (error) {
    console.error(`Error reading key ${key} from storage:`, error);
    return defaultData;
  }
};

const setItem = (key, data) => {
  try {
    localStorage.setItem(key, JSON.stringify(data));
  } catch (error) {
    console.error(`Error writing key ${key} to storage:`, error);
  }
};

export const initializeDB = () => {
  // Seed the 13 labs on first run, and also backfill if the labs list is still empty.
  const existingLabs = localStorage.getItem(KEYS.LABS);
  if (!existingLabs || JSON.parse(existingLabs).length === 0) setItem(KEYS.LABS, initialLabs);
  if (!localStorage.getItem(KEYS.COURSES)) setItem(KEYS.COURSES, initialCourses);
  if (!localStorage.getItem(KEYS.MATERIALS)) setItem(KEYS.MATERIALS, initialMaterials);
  if (!localStorage.getItem(KEYS.USERS)) setItem(KEYS.USERS, initialUsers);
  if (!localStorage.getItem(KEYS.TRANSACTIONS)) setItem(KEYS.TRANSACTIONS, initialTransactions);
  if (!localStorage.getItem(KEYS.REQUESTS)) setItem(KEYS.REQUESTS, initialRequests);
};

export const resetDBToDefault = () => {
  setItem(KEYS.LABS, initialLabs);
  setItem(KEYS.COURSES, initialCourses);
  setItem(KEYS.MATERIALS, initialMaterials);
  setItem(KEYS.USERS, initialUsers);
  setItem(KEYS.TRANSACTIONS, initialTransactions);
  setItem(KEYS.REQUESTS, initialRequests);
  window.location.reload();
};

// LABORATORIUM SERVICES
export const getLabs = () => getItem(KEYS.LABS, initialLabs);

export const saveLab = (labData) => {
  const list = getLabs();
  if (!labData.lab_name?.trim()) throw new Error("Nama laboratorium wajib diisi.");
  if (!labData.head_name?.trim()) throw new Error("Nama kepala lab wajib diisi.");

  if (labData.id) {
    const updated = list.map(item => item.id === labData.id ? { ...item, ...labData } : item);
    setItem(KEYS.LABS, updated);
    return labData;
  } else {
    const newItem = {
      ...labData,
      id: `lab-${Date.now()}`,
      created_at: new Date().toISOString()
    };
    setItem(KEYS.LABS, [...list, newItem]);
    return newItem;
  }
};

export const deleteLab = (id) => {
  const list = getLabs();
  setItem(KEYS.LABS, list.filter(item => item.id !== id));
};

// MATA KULIAH TERKAIT (PRACTICAL COURSES) SERVICES
export const getCourses = () => getItem(KEYS.COURSES, initialCourses);

export const saveCourse = (courseData) => {
  const list = getCourses();
  if (courseData.id) {
    const updated = list.map(item => item.id === courseData.id ? { ...item, ...courseData } : item);
    setItem(KEYS.COURSES, updated);
    return courseData;
  } else {
    const newItem = {
      ...courseData,
      id: `mk-${Date.now()}`,
      created_at: new Date().toISOString()
    };
    setItem(KEYS.COURSES, [...list, newItem]);
    return newItem;
  }
};

export const deleteCourse = (id) => {
  const list = getCourses();
  const updated = list.filter(item => item.id !== id);
  setItem(KEYS.COURSES, updated);
};

// MATERIALS SERVICES
export const getMaterials = () => getItem(KEYS.MATERIALS, initialMaterials);

export const getMaterialById = (id) => {
  const list = getMaterials();
  return list.find(item => item.id === id);
};

export const saveMaterial = (materialData) => {
  const list = getMaterials();
  const numStock = Number(materialData.stock) || 0;
  const numMinStock = Number(materialData.min_stock) || 0;

  if (numStock < 0 || numMinStock < 0) {
    throw new Error("Stok dan batas minimum tidak boleh bernilai negatif.");
  }

  if (materialData.id) {
    const updated = list.map(item => {
      if (item.id === materialData.id) {
        return {
          ...item,
          ...materialData,
          stock: numStock,
          min_stock: numMinStock,
          semester: Number(materialData.semester),
          practical_hours: Number(materialData.practical_hours),
          updated_at: new Date().toISOString()
        };
      }
      return item;
    });
    setItem(KEYS.MATERIALS, updated);
    return materialData;
  } else {
    const maxNo = list.reduce((max, item) => (item.no > max ? item.no : max), 0);
    const newItem = {
      ...materialData,
      id: `mat-${Date.now()}`,
      no: maxNo + 1,
      stock: numStock,
      min_stock: numMinStock,
      semester: Number(materialData.semester),
      practical_hours: Number(materialData.practical_hours),
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };
    setItem(KEYS.MATERIALS, [...list, newItem]);
    return newItem;
  }
};

export const deleteMaterial = (id) => {
  const list = getMaterials();
  const updated = list.filter(item => item.id !== id);
  setItem(KEYS.MATERIALS, updated);
};

// STOCK TRANSACTIONS & RECORDING
export const getTransactions = () => getItem(KEYS.TRANSACTIONS, initialTransactions);

export const recordIncomingStock = ({ material_id, quantity, date, recorded_by, note }) => {
  const qty = Number(quantity);
  if (!qty || qty <= 0) {
    throw new Error("Jumlah stok masuk harus lebih dari 0.");
  }

  const materials = getMaterials();
  const targetMat = materials.find(m => m.id === material_id);
  if (!targetMat) throw new Error("Material tidak ditemukan.");

  const updatedMaterials = materials.map(m => {
    if (m.id === material_id) {
      return {
        ...m,
        stock: m.stock + qty,
        updated_at: new Date().toISOString()
      };
    }
    return m;
  });
  setItem(KEYS.MATERIALS, updatedMaterials);

  const transactions = getTransactions();
  const newTx = {
    id: `tx-${Date.now()}`,
    material_id,
    type: 'in',
    quantity: qty,
    date: date || new Date().toISOString().split('T')[0],
    recorded_by,
    note: note || 'Stok masuk baru (Pengadaan / Penambahan)',
    created_at: new Date().toISOString()
  };
  setItem(KEYS.TRANSACTIONS, [newTx, ...transactions]);

  return newTx;
};

// USAGE REQUESTS & APPROVAL ENGINE
export const getRequests = () => getItem(KEYS.REQUESTS, initialRequests);

export const createUsageRequest = (requestData) => {
  const qty = Number(requestData.quantity);
  if (!qty || qty <= 0) {
    throw new Error("Jumlah barang yang diminta harus lebih besar dari 0.");
  }

  const materials = getMaterials();
  const material = materials.find(m => m.id === requestData.material_id);
  if (!material) {
    throw new Error("Material yang dipilih tidak ditemukan.");
  }

  const requests = getRequests();
  const newRequest = {
    id: `req-${Date.now()}`,
    material_id: requestData.material_id,
    course_id: material.course_id,
    user_id: requestData.user_id,
    quantity: qty,
    semester: Number(requestData.semester || material.semester),
    practical_hours: Number(requestData.practical_hours || material.practical_hours),
    practical_date: requestData.practical_date || new Date().toISOString().split('T')[0],
    status: 'pending',
    admin_note: '',
    processed_by: null,
    created_at: new Date().toISOString()
  };

  setItem(KEYS.REQUESTS, [newRequest, ...requests]);
  return newRequest;
};

export const approveUsageRequest = ({ requestId, adminId, adminNote }) => {
  const requests = getRequests();
  const req = requests.find(r => r.id === requestId);
  if (!req) throw new Error("Permohonan tidak ditemukan.");
  if (req.status !== 'pending') throw new Error("Permohonan ini sudah diproses sebelumnya.");

  const materials = getMaterials();
  const material = materials.find(m => m.id === req.material_id);
  if (!material) throw new Error("Material yang diminta tidak tersedia.");

  if (material.stock < req.quantity) {
    throw new Error(`Stok tidak mencukupi! Sisa stok ${material.material_name} adalah ${material.stock} ${material.unit}, namun permohonan meminta ${req.quantity} ${material.unit}.`);
  }

  const updatedMaterials = materials.map(m => {
    if (m.id === req.material_id) {
      return {
        ...m,
        stock: m.stock - req.quantity,
        updated_at: new Date().toISOString()
      };
    }
    return m;
  });
  setItem(KEYS.MATERIALS, updatedMaterials);

  const transactions = getTransactions();
  const newTx = {
    id: `tx-${Date.now()}`,
    material_id: req.material_id,
    type: 'out',
    quantity: req.quantity,
    date: new Date().toISOString().split('T')[0],
    recorded_by: adminId,
    note: `Disetujui untuk permohonan ID: ${req.id}. ${adminNote ? 'Catatan: ' + adminNote : ''}`,
    created_at: new Date().toISOString()
  };
  setItem(KEYS.TRANSACTIONS, [newTx, ...transactions]);

  const updatedRequests = requests.map(r => {
    if (r.id === requestId) {
      return {
        ...r,
        status: 'approved',
        admin_note: adminNote || 'Disetujui',
        processed_by: adminId
      };
    }
    return r;
  });
  setItem(KEYS.REQUESTS, updatedRequests);

  return { success: true };
};

export const rejectUsageRequest = ({ requestId, adminId, adminNote }) => {
  const requests = getRequests();
  const req = requests.find(r => r.id === requestId);
  if (!req) throw new Error("Permohonan tidak ditemukan.");
  if (req.status !== 'pending') throw new Error("Permohonan ini sudah diproses sebelumnya.");

  const updatedRequests = requests.map(r => {
    if (r.id === requestId) {
      return {
        ...r,
        status: 'rejected',
        admin_note: adminNote || 'Permohonan ditolak oleh admin lab.',
        processed_by: adminId
      };
    }
    return r;
  });
  setItem(KEYS.REQUESTS, updatedRequests);
  return { success: true };
};

// Writes a note-only entry into the immutable ledger (records who did what & why).
const recordAuditEntry = ({ material_id, quantity = 0, type = 'adjustment', recorded_by, note }) => {
  const transactions = getTransactions();
  setItem(KEYS.TRANSACTIONS, [{
    id: `tx-${Date.now()}`,
    material_id,
    type,
    quantity,
    date: new Date().toISOString().split('T')[0],
    recorded_by,
    note,
    created_at: new Date().toISOString()
  }, ...transactions]);
};

// Hard-delete a request that never touched stock (pending / rejected). Logged to the ledger.
export const deleteUsageRequest = ({ requestId, adminId, reason }) => {
  if (!reason?.trim()) throw new Error("Alasan penghapusan wajib diisi.");
  const requests = getRequests();
  const req = requests.find(r => r.id === requestId);
  if (!req) throw new Error("Permohonan tidak ditemukan.");
  if (req.status === 'approved') {
    throw new Error("Permohonan yang sudah disetujui tidak boleh dihapus. Gunakan 'Batalkan' agar stok dikembalikan.");
  }

  setItem(KEYS.REQUESTS, requests.filter(r => r.id !== requestId));

  const mat = getMaterials().find(m => m.id === req.material_id);
  recordAuditEntry({
    material_id: req.material_id,
    quantity: 0,
    type: 'adjustment',
    recorded_by: adminId,
    note: `Permohonan (${req.status}) ${req.quantity} ${mat?.unit || ''} dihapus oleh admin. Alasan: ${reason.trim()}`
  });
  return { success: true };
};

// Cancel an APPROVED request: return the stock and record a reversal in the ledger. Soft-marks the request.
export const cancelApprovedRequest = ({ requestId, adminId, reason }) => {
  if (!reason?.trim()) throw new Error("Alasan pembatalan wajib diisi.");
  const requests = getRequests();
  const req = requests.find(r => r.id === requestId);
  if (!req) throw new Error("Permohonan tidak ditemukan.");
  if (req.status !== 'approved') throw new Error("Hanya permohonan berstatus Disetujui yang dapat dibatalkan.");

  const materials = getMaterials();
  const mat = materials.find(m => m.id === req.material_id);
  const updatedMaterials = materials.map(m =>
    m.id === req.material_id ? { ...m, stock: m.stock + req.quantity, updated_at: new Date().toISOString() } : m
  );
  setItem(KEYS.MATERIALS, updatedMaterials);

  recordAuditEntry({
    material_id: req.material_id,
    quantity: req.quantity,
    type: 'in',
    recorded_by: adminId,
    note: `Pembatalan permohonan disetujui — pengembalian stok ${req.quantity} ${mat?.unit || ''}. Alasan: ${reason.trim()}`
  });

  setItem(KEYS.REQUESTS, requests.map(r =>
    r.id === requestId ? { ...r, status: 'cancelled', admin_note: `Dibatalkan: ${reason.trim()}`, processed_by: adminId } : r
  ));
  return { success: true };
};

// USER MANAGEMENT SERVICES (USERNAME BASED)
export const getUsers = () => getItem(KEYS.USERS, initialUsers);

export const saveUser = (userData) => {
  const users = getUsers();
  // Only derive name from first/last when those parts are supplied (registration);
  // admin-created users pass `name` directly and must not be overwritten.
  const hasParts = userData.first_name !== undefined || userData.last_name !== undefined;
  const derivedName = hasParts
    ? `${userData.first_name || ''} ${userData.last_name || ''}`.trim()
    : (userData.name || '');

  if (userData.id) {
    const updated = users.map(u => u.id === userData.id ? { ...u, ...userData, name: derivedName || u.name } : u);
    setItem(KEYS.USERS, updated);
    return userData;
  } else {
    const newUser = {
      ...userData,
      id: `usr-${Date.now()}`,
      name: derivedName || userData.name || 'Pengguna',
      is_active: true,
      created_at: new Date().toISOString()
    };
    setItem(KEYS.USERS, [...users, newUser]);
    return newUser;
  }
};

export const updateUserProfile = (userId, patch) => {
  const users = getUsers();
  let updatedUser = null;
  const updated = users.map(u => {
    if (u.id === userId) {
      const merged = { ...u, ...patch };
      if (patch.first_name !== undefined || patch.last_name !== undefined) {
        merged.name = `${merged.first_name || ''} ${merged.last_name || ''}`.trim() || merged.name;
      }
      updatedUser = merged;
      return merged;
    }
    return u;
  });
  if (!updatedUser) throw new Error("Pengguna tidak ditemukan.");
  setItem(KEYS.USERS, updated);
  return updatedUser;
};

export const toggleUserStatus = (userId) => {
  const users = getUsers();
  const updated = users.map(u => {
    if (u.id === userId) {
      return { ...u, is_active: !u.is_active };
    }
    return u;
  });
  setItem(KEYS.USERS, updated);
};
