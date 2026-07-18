-- =====================================================================
-- SI-BHP — RESET stok bahan + audit, lalu ISI BHP Bengkel Kerja Bangku dan Plat
-- Sumber: Usulan BHP BENGKEL KERJA BANGKU 2026.xlsx
-- Cara pakai: Supabase -> SQL Editor -> New query -> paste semua -> Run.
-- PERINGATAN: ini MENGHAPUS semua permohonan, transaksi (audit), dan bahan.
-- =====================================================================

-- 1) Reset: hapus audit & permohonan dulu (requests FK -> materials), lalu bahan.
delete from transactions;
delete from requests;
delete from materials;

-- 2) Isi bahan Bengkel Kerja Bangku dan Plat (lab-02).
--    stock  = Persediaan Excel; bila 0 diisi penuh (= target) biar tak kosong.
--    target = Persediaan + Usulan (stok ideal). min_stock ~20% target (>=1).
insert into materials (id, no, material_name, specification, lab_id, semester, unit, stock, min_stock, target_stock) values
  ('mat-bkb-01', 1, 'Plat Allumunium', '0.8 mm', 'lab-02', 1, 'lembar', 3, 9, 43),
  ('mat-bkb-02', 2, 'Palu Karet', '120z', 'lab-02', 1, 'buah', 3, 7, 33),
  ('mat-bkb-03', 3, 'Siku Baja', '12'' x30', 'lab-02', 1, 'buah', 5, 8, 37),
  ('mat-bkb-04', 4, 'Besi Baja Penyiku Siku', 'siku perata 70 mm x100mm', 'lab-02', 1, 'buah', 2, 2, 7),
  ('mat-bkb-05', 5, 'Tang Rivet', 'hand rivetera', 'lab-02', 1, 'buah', 10, 2, 10),
  ('mat-bkb-06', 6, 'Rivet', 'Iron Nails,  2.3mm 1/8"', 'lab-02', 1, 'kotak', 1, 2, 6),
  ('mat-bkb-07', 7, 'Rivet', 'Iron Nails 4.0 mm 5/32"', 'lab-02', 1, 'kotak', 1, 2, 6),
  ('mat-bkb-08', 8, 'Rivet', 'Iron Nails 4.8 mm.3/16"', 'lab-02', 1, 'kotak', 1, 2, 6),
  ('mat-bkb-09', 9, 'Nachi', 'Standard 3mm', 'lab-02', 1, 'buah', 25, 5, 25),
  ('mat-bkb-10', 10, 'Nachi', 'Standard 3,5 mm', 'lab-02', 1, 'buah', 15, 3, 15),
  ('mat-bkb-11', 11, 'Nachi', 'Standard 4. mm', 'lab-02', 1, 'buah', 15, 3, 15),
  ('mat-bkb-12', 12, 'Nachi', 'Standard 4,5 mm', 'lab-02', 1, 'buah', 15, 3, 15),
  ('mat-bkb-13', 13, 'Nachi', 'Standard 5, mm', 'lab-02', 1, 'buah', 15, 3, 15),
  ('mat-bkb-14', 14, 'Besi Padu', 'standard st 37', 'lab-02', 1, 'batang', 2, 3, 12),
  ('mat-bkb-15', 15, 'Palu Tekiro', 'kepala kambing 8 OZ', 'lab-02', 1, 'buah', 5, 1, 5),
  ('mat-bkb-16', 16, 'Bor Tangan', 'BOSCH GBM 320 PN.06011A45K0', 'lab-02', 1, 'buah', 1, 1, 3),
  ('mat-bkb-17', 17, 'Gerinda', 'GWS060 / Angle Grinder 4" GWS 060', 'lab-02', 1, 'buah', 1, 1, 3),
  ('mat-bkb-18', 18, 'Mata Gergaji Besi Sandflex Bahco', '12''''/300 mm', 'lab-02', 1, 'buah', 10, 15, 74),
  ('mat-bkb-19', 19, 'Gunting Seng Lurus', 'KAWAT STRAIGHT PATTERN SNIPS SELLERY 12 INCH / PLAT', 'lab-02', 1, 'buah', 1, 3, 11),
  ('mat-bkb-20', 20, 'Kuas Eterna 3 Inch', '3 inch', 'lab-02', 1, 'buah', 30, 6, 30),
  ('mat-bkb-21', 21, 'Kaca Mata Safety Bening Nankai', '', 'lab-02', 1, 'buah', 100, 20, 100),
  ('mat-bkb-22', 22, 'Sarung Tangan Kain Bintik Karet Anti Slip', '', 'lab-02', 1, 'pasang', 100, 20, 100),
  ('mat-bkb-23', 23, 'Mata Gerinda Potong', '100 x 1 x 16 mm (Ultra cut)', 'lab-02', 1, 'pcs', 30, 6, 30),
  ('mat-bkb-24', 24, 'Kikir Kasar 12 Inch Jason', 'ukuran : 12"', 'lab-02', 1, 'pcs', 10, 7, 35),
  ('mat-bkb-25', 25, 'Kikir Halus 12 Inchi Jason', 'ukuran : 12"', 'lab-02', 1, 'pcs', 10, 7, 35),
  ('mat-bkb-26', 26, 'Mitutoyo Sketmat', '0-150mm 0.02mm / JANGKA SORONG 6" / Mitutoyo 530-312', 'lab-02', 1, 'buah', 2, 2, 10),
  ('mat-bkb-27', 27, 'Bestguard Kikir Bulat 10"', 'ukuran : 10"', 'lab-02', 1, 'pcs', 5, 4, 20),
  ('mat-bkb-28', 28, 'Besi Begel', '4mm 201 1.5m', 'lab-02', 1, 'batang', 10, 2, 10);
