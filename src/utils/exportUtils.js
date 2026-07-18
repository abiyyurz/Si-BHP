import { jsPDF } from 'jspdf';
import 'jspdf-autotable';
import * as XLSX from 'xlsx';
import { formatDate, formatDateTime } from './formatters';
import { POLBENG_LOGO } from '../data/polbengLogo';

/**
 * PDF Export for Consumable Materials (BHP) Inventory
 */
export const exportMaterialsPDF = (materials = []) => {
  const doc = new jsPDF({ orientation: 'landscape', unit: 'mm', format: 'a4' });

  // Header Title
  doc.addImage(POLBENG_LOGO, 'PNG', 14, 8, 22, 22);
  doc.setFontSize(16);
  doc.setFont('helvetica', 'bold');
  doc.text('POLITEKNIK NEGERI BENGKALIS', 42, 15);
  doc.setFontSize(12);
  doc.setFont('helvetica', 'normal');
  doc.text('LABORATORIUM BENGKEL KERJA, JURUSAN TEKNIK MESIN', 42, 22);
  doc.setFontSize(14);
  doc.setFont('helvetica', 'bold');
  doc.text('LAPORAN INVENTARIS BAHAN HABIS PAKAI (Si-BHP)', 42, 30);

  doc.setFontSize(9);
  doc.setFont('helvetica', 'italic');
  doc.text(`Tanggal Cetak: ${new Date().toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })}`, 42, 35);

  doc.line(14, 38, 283, 38);

  // Table Data Mapping
  const tableData = materials.map((m, idx) => [
    m.no || idx + 1,
    m.material_name,
    `Semester ${m.semester}`,
    m.quality === 'good' ? 'Baik' : m.quality === 'fair' ? 'Cukup' : 'Kurang',
    `${m.stock} ${m.unit}`,
    `${m.min_stock} ${m.unit}`,
    m.stock <= m.min_stock ? 'PERLU REORDER (KRITIS)' : 'Stok Aman'
  ]);

  doc.autoTable({
    startY: 40,
    head: [['No', 'Nama Bahan Habis Pakai (BHP)', 'Semester', 'Kualitas', 'Sisa Stok', 'Batas Min', 'Status Stok']],
    body: tableData,
    theme: 'grid',
    headStyles: { fillColor: [15, 44, 89], textColor: [255, 255, 255], fontStyle: 'bold' },
    alternateRowStyles: { fillColor: [248, 250, 252] },
    styles: { fontSize: 8, cellPadding: 2.5 },
    columnStyles: {
      0: { cellWidth: 12, halign: 'center' },
      1: { cellWidth: 90 },
      2: { cellWidth: 25, halign: 'center' },
      3: { cellWidth: 25, halign: 'center' },
      4: { cellWidth: 28, halign: 'center' },
      5: { cellWidth: 28, halign: 'center' },
      6: { cellWidth: 40, halign: 'center' }
    },
    didParseCell: function (data) {
      if (data.section === 'body' && data.column.index === 6) {
        if (data.cell.raw && data.cell.raw.includes('KRITIS')) {
          data.cell.styles.textColor = [220, 38, 38];
          data.cell.styles.fontStyle = 'bold';
        }
      }
    }
  });

  doc.save(`Si-BHP_Inventaris_Bahan_${new Date().toISOString().split('T')[0]}.pdf`);
};


/**
 * Excel Export for Consumable Materials
 */
export const exportMaterialsExcel = (materials = []) => {
  const excelData = materials.map((m, idx) => ({
    'No': m.no || idx + 1,
    'Nama Bahan Habis Pakai': m.material_name,
    'Semester Praktikum': m.semester,
    'Kualitas': m.quality === 'good' ? 'Baik' : m.quality === 'fair' ? 'Cukup' : 'Kurang',
    'Satuan': m.unit,
    'Sisa Stok': m.stock,
    'Batas Minimum Stok': m.min_stock,
    'Status Peringatan': m.stock <= m.min_stock ? 'KRITIS (Stok Kritis)' : 'NORMAL',
    'Terakhir Diperbarui': formatDateTime(m.updated_at)
  }));

  const worksheet = XLSX.utils.json_to_sheet(excelData);
  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, 'Master BHP');
  XLSX.writeFile(workbook, `Si-BHP_Inventaris_Bahan_${new Date().toISOString().split('T')[0]}.xlsx`);
};

/**
 * PDF Export for Audit Trail & Usage History Log
 */
export const exportHistoryPDF = (transactions = [], materials = [], users = []) => {
  const doc = new jsPDF({ orientation: 'landscape', unit: 'mm', format: 'a4' });
  const matMap = new Map(materials.map(m => [m.id, m]));
  const userMap = new Map(users.map(u => [u.id, u.name]));

  doc.addImage(POLBENG_LOGO, 'PNG', 14, 8, 20, 20);

  doc.setFontSize(16);
  doc.setFont('helvetica', 'bold');
  doc.text('POLITEKNIK NEGERI BENGKALIS', 40, 15);
  doc.setFontSize(12);
  doc.setFont('helvetica', 'normal');
  doc.text('RIWAYAT MUTASI & PENGGUNAAN BAHAN HABIS PAKAI (BHP)', 40, 22);

  doc.setFontSize(9);
  doc.setFont('helvetica', 'italic');
  doc.text(`Tanggal Ekspor: ${new Date().toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })}`, 40, 28);

  doc.line(14, 31, 283, 31);

  const tableData = transactions.map((tx, idx) => {
    const mat = matMap.get(tx.material_id);
    return [
      idx + 1,
      formatDate(tx.date),
      mat ? mat.material_name : 'N/A',
      tx.type === 'in' ? 'Stok Masuk' : tx.type === 'out' ? 'Stok Keluar' : 'Penyesuaian',
      `${tx.quantity} ${mat ? mat.unit : ''}`,
      userMap.get(tx.recorded_by) || 'Sistem',
      tx.note || ''
    ];
  });

  doc.autoTable({
    startY: 33,
    head: [['No', 'Tanggal', 'Nama Bahan Habis Pakai', 'Jenis Mutasi', 'Jumlah', 'Petugas / Pemohon', 'Catatan / Alasan']],
    body: tableData,
    theme: 'striped',
    headStyles: { fillColor: [0, 168, 150], textColor: [255, 255, 255], fontStyle: 'bold' },
    styles: { fontSize: 8.5, cellPadding: 2.5 },
    columnStyles: {
      0: { cellWidth: 12, halign: 'center' },
      1: { cellWidth: 28, halign: 'center' },
      2: { cellWidth: 70 },
      3: { cellWidth: 28, halign: 'center' },
      4: { cellWidth: 25, halign: 'center' },
      5: { cellWidth: 45 },
      6: { cellWidth: 60 }
    }
  });

  doc.save(`Si-BHP_Riwayat_Mutasi_${new Date().toISOString().split('T')[0]}.pdf`);
};

/**
 * Excel Export for Audit Trail & Usage History Log
 */
export const exportHistoryExcel = (transactions = [], materials = [], users = []) => {
  const matMap = new Map(materials.map(m => [m.id, m]));
  const userMap = new Map(users.map(u => [u.id, u.name]));

  const excelData = transactions.map((tx, idx) => {
    const mat = matMap.get(tx.material_id);
    return {
      'No': idx + 1,
      'Tanggal Transaksi': tx.date,
      'Nama Bahan BHP': mat ? mat.material_name : 'N/A',
      'Tipe Transaksi': tx.type === 'in' ? 'Stok Masuk' : tx.type === 'out' ? 'Stok Keluar (Pemakaian)' : 'Penyesuaian',
      'Jumlah': tx.quantity,
      'Satuan': mat ? mat.unit : '',
      'Dicatat Oleh': userMap.get(tx.recorded_by) || 'Sistem',
      'Catatan / Keterangan': tx.note || ''
    };
  });

  const worksheet = XLSX.utils.json_to_sheet(excelData);
  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, 'Riwayat Mutasi BHP');
  XLSX.writeFile(workbook, `Si-BHP_Riwayat_Mutasi_${new Date().toISOString().split('T')[0]}.xlsx`);
};

/**
 * PDF Export — Laporan Pengadaan (Kebutuhan Beli Ulang BHP)
 * rows: [{ no, name, lab, unit, ideal, current, need }]
 */
export const exportProcurementPDF = (rows = []) => {
  const doc = new jsPDF({ orientation: 'landscape', unit: 'mm', format: 'a4' });

  doc.addImage(POLBENG_LOGO, 'PNG', 14, 8, 20, 20);
  doc.setFontSize(16);
  doc.setFont('helvetica', 'bold');
  doc.text('POLITEKNIK NEGERI BENGKALIS', 40, 15);
  doc.setFontSize(12);
  doc.setFont('helvetica', 'normal');
  doc.text('LAPORAN KEBUTUHAN PENGADAAN BAHAN HABIS PAKAI (BHP)', 40, 22);
  doc.setFontSize(9);
  doc.setFont('helvetica', 'italic');
  doc.text(`Tanggal Cetak: ${new Date().toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })}`, 40, 28);
  doc.line(14, 31, 283, 31);

  const tableData = rows.map((r, idx) => [
    r.no || idx + 1,
    r.name,
    r.lab || '',
    `${r.ideal} ${r.unit}`,
    `${r.current} ${r.unit}`,
    `${r.need} ${r.unit}`
  ]);

  doc.autoTable({
    startY: 34,
    head: [['No', 'Nama Bahan Habis Pakai (BHP)', 'Lab/Bengkel', 'Stok Ideal', 'Stok Sekarang', 'Perlu Dibeli']],
    body: tableData,
    theme: 'grid',
    headStyles: { fillColor: [15, 44, 89], textColor: [255, 255, 255], fontStyle: 'bold' },
    alternateRowStyles: { fillColor: [248, 250, 252] },
    styles: { fontSize: 8, cellPadding: 2.5 },
    columnStyles: {
      0: { cellWidth: 12, halign: 'center' },
      1: { cellWidth: 85 },
      2: { cellWidth: 60 },
      3: { cellWidth: 28, halign: 'center' },
      4: { cellWidth: 30, halign: 'center' },
      5: { cellWidth: 32, halign: 'center' }
    },
    didParseCell: function (data) {
      if (data.section === 'body' && data.column.index === 5) {
        const val = parseInt(String(data.cell.raw), 10);
        if (val > 0) {
          data.cell.styles.textColor = [220, 38, 38];
          data.cell.styles.fontStyle = 'bold';
        }
      }
    }
  });

  doc.save(`Si-BHP_Laporan_Pengadaan_${new Date().toISOString().split('T')[0]}.pdf`);
};

/**
 * Excel Export — Laporan Pengadaan
 */
export const exportProcurementExcel = (rows = []) => {
  const excelData = rows.map((r, idx) => ({
    'No': r.no || idx + 1,
    'Nama Bahan Habis Pakai': r.name,
    'Lab/Bengkel': r.lab || '',
    'Satuan': r.unit,
    'Stok Ideal': r.ideal,
    'Stok Sekarang': r.current,
    'Perlu Dibeli': r.need
  }));

  const worksheet = XLSX.utils.json_to_sheet(excelData);
  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, 'Kebutuhan Pengadaan');
  XLSX.writeFile(workbook, `Si-BHP_Laporan_Pengadaan_${new Date().toISOString().split('T')[0]}.xlsx`);
};
