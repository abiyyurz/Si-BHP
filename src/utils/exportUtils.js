import { jsPDF } from 'jspdf';
import 'jspdf-autotable';
import * as XLSX from 'xlsx';
import { formatDate, formatDateTime } from './formatters';

/**
 * PDF Export for Consumable Materials (BAP) Inventory
 */
export const exportMaterialsPDF = (materials = [], coursesList = []) => {
  const doc = new jsPDF({ orientation: 'landscape', unit: 'mm', format: 'a4' });
  const crsMap = new Map(coursesList.map(c => [c.id, `${c.course_name} (${c.day_of_week || ''} ${c.start_time || ''}-${c.end_time || ''})`]));

  // Header Title
  doc.setFontSize(16);
  doc.setFont('helvetica', 'bold');
  doc.text('POLITEKNIK NEGERI BENGKALIS', 14, 15);
  doc.setFontSize(12);
  doc.setFont('helvetica', 'normal');
  doc.text('LABORATORIUM BENGKEL KERJA - JURUSAN TEKNIK MESIN', 14, 22);
  doc.setFontSize(14);
  doc.setFont('helvetica', 'bold');
  doc.text('LAPORAN INVENTARIS BAHAN HABIS PAKAI (SI-BAP)', 14, 30);

  doc.setFontSize(9);
  doc.setFont('helvetica', 'italic');
  doc.text(`Tanggal Cetak: ${new Date().toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })}`, 14, 35);
  
  doc.line(14, 37, 283, 37);

  // Table Data Mapping
  const tableData = materials.map((m, idx) => [
    m.no || idx + 1,
    m.material_name,
    crsMap.get(m.course_id) || 'Umum / Bengkel',
    `Semester ${m.semester}`,
    `${m.practical_hours} Jam`,
    m.quality === 'good' ? 'Baik' : m.quality === 'fair' ? 'Cukup' : 'Kurang',
    `${m.stock} ${m.unit}`,
    `${m.min_stock} ${m.unit}`,
    m.stock <= m.min_stock ? 'PERLU REORDER (KRITIS)' : 'Stok Aman'
  ]);

  doc.autoTable({
    startY: 40,
    head: [['No', 'Nama Bahan Habis Pakai (BAP)', 'Mata Kuliah Terkait & Jadwal', 'Semester', 'Jam Prac', 'Kualitas', 'Sisa Stok', 'Batas Min', 'Status Stok']],
    body: tableData,
    theme: 'grid',
    headStyles: { fillColor: [15, 44, 89], textColor: [255, 255, 255], fontStyle: 'bold' },
    alternateRowStyles: { fillColor: [248, 250, 252] },
    styles: { fontSize: 8, cellPadding: 2.5 },
    columnStyles: {
      0: { cellWidth: 10, halign: 'center' },
      1: { cellWidth: 65 },
      2: { cellWidth: 60 },
      3: { cellWidth: 20, halign: 'center' },
      4: { cellWidth: 20, halign: 'center' },
      5: { cellWidth: 20, halign: 'center' },
      6: { cellWidth: 22, halign: 'center' },
      7: { cellWidth: 22, halign: 'center' },
      8: { cellWidth: 30, halign: 'center' }
    },
    didParseCell: function (data) {
      if (data.section === 'body' && data.column.index === 8) {
        if (data.cell.raw && data.cell.raw.includes('KRITIS')) {
          data.cell.styles.textColor = [220, 38, 38];
          data.cell.styles.fontStyle = 'bold';
        }
      }
    }
  });

  // Footer & Signatures
  const finalY = doc.lastAutoTable.finalY + 10;
  if (finalY < 170) {
    doc.setFontSize(9);
    doc.setFont('helvetica', 'normal');
    doc.text('Bengkalis, ' + new Date().toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' }), 220, finalY);
    doc.text('Kepala Laboratorium Bengkel Kerja', 220, finalY + 5);
    doc.text('Abiyyu RZ, S.T., M.T.', 220, finalY + 25);
    doc.text('NIP. 19910515 202601 1 002', 220, finalY + 30);
  }

  doc.save(`SI-BAP_Inventaris_Bahan_${new Date().toISOString().split('T')[0]}.pdf`);
};

/**
 * Excel Export for Consumable Materials
 */
export const exportMaterialsExcel = (materials = [], coursesList = []) => {
  const crsMap = new Map(coursesList.map(c => [c.id, `${c.course_name} (${c.day_of_week || ''} ${c.start_time || ''}-${c.end_time || ''})`]));

  const excelData = materials.map((m, idx) => ({
    'No': m.no || idx + 1,
    'Nama Bahan Habis Pakai': m.material_name,
    'Mata Kuliah Terkait': crsMap.get(m.course_id) || 'Umum',
    'Semester Praktikum': m.semester,
    'Jam Praktikum': m.practical_hours,
    'Kualitas': m.quality === 'good' ? 'Baik' : m.quality === 'fair' ? 'Cukup' : 'Kurang',
    'Satuan': m.unit,
    'Sisa Stok': m.stock,
    'Batas Minimum Stok': m.min_stock,
    'Status Peringatan': m.stock <= m.min_stock ? 'KRITIS (Stok Kritis)' : 'NORMAL',
    'Terakhir Diperbarui': formatDateTime(m.updated_at)
  }));

  const worksheet = XLSX.utils.json_to_sheet(excelData);
  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, 'Master BAP');
  XLSX.writeFile(workbook, `SI-BAP_Inventaris_Bahan_${new Date().toISOString().split('T')[0]}.xlsx`);
};

/**
 * PDF Export for Audit Trail & Usage History Log
 */
export const exportHistoryPDF = (transactions = [], materials = [], users = []) => {
  const doc = new jsPDF({ orientation: 'landscape', unit: 'mm', format: 'a4' });
  const matMap = new Map(materials.map(m => [m.id, m]));
  const userMap = new Map(users.map(u => [u.id, u.name]));

  doc.setFontSize(16);
  doc.setFont('helvetica', 'bold');
  doc.text('POLITEKNIK NEGERI BENGKALIS', 14, 15);
  doc.setFontSize(12);
  doc.setFont('helvetica', 'normal');
  doc.text('RIWAYAT MUTASI & PENGGUNAAN BAHAN HABIS PAKAI (BAP)', 14, 22);

  doc.setFontSize(9);
  doc.setFont('helvetica', 'italic');
  doc.text(`Tanggal Ekspor: ${new Date().toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })}`, 14, 28);

  doc.line(14, 30, 283, 30);

  const tableData = transactions.map((tx, idx) => {
    const mat = matMap.get(tx.material_id);
    return [
      idx + 1,
      formatDate(tx.date),
      mat ? mat.material_name : 'N/A',
      tx.type === 'in' ? 'Stok Masuk' : tx.type === 'out' ? 'Stok Keluar' : 'Penyesuaian',
      `${tx.quantity} ${mat ? mat.unit : ''}`,
      userMap.get(tx.recorded_by) || 'Sistem',
      tx.note || '-'
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

  doc.save(`SI-BAP_Riwayat_Mutasi_${new Date().toISOString().split('T')[0]}.pdf`);
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
      'Nama Bahan BAP': mat ? mat.material_name : 'N/A',
      'Tipe Transaksi': tx.type === 'in' ? 'Stok Masuk' : tx.type === 'out' ? 'Stok Keluar (Pemakaian)' : 'Penyesuaian',
      'Jumlah': tx.quantity,
      'Satuan': mat ? mat.unit : '',
      'Dicatat Oleh': userMap.get(tx.recorded_by) || 'Sistem',
      'Catatan / Keterangan': tx.note || ''
    };
  });

  const worksheet = XLSX.utils.json_to_sheet(excelData);
  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, 'Riwayat Mutasi BAP');
  XLSX.writeFile(workbook, `SI-BAP_Riwayat_Mutasi_${new Date().toISOString().split('T')[0]}.xlsx`);
};
