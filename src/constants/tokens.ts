import { CategoryId } from '../types';

export const CATEGORY_CONFIG: Record<
  CategoryId,
  { label: string; color: string; border: string; bgSoft: string; icon: string }
> = {
  image: {
    label: 'Gambar',
    color: '#b49bea',
    border: 'rgba(180, 155, 234, 0.4)',
    bgSoft: 'rgba(180, 155, 234, 0.12)',
    icon: 'Image',
  },
  video: {
    label: 'Video',
    color: '#e58e9b',
    border: 'rgba(229, 142, 155, 0.4)',
    bgSoft: 'rgba(229, 142, 155, 0.12)',
    icon: 'Video',
  },
  audio: {
    label: 'Audio',
    color: '#82c99a',
    border: 'rgba(130, 201, 154, 0.4)',
    bgSoft: 'rgba(130, 201, 154, 0.12)',
    icon: 'Music',
  },
  document: {
    label: 'Dokumen',
    color: '#83b5e8',
    border: 'rgba(131, 181, 232, 0.4)',
    bgSoft: 'rgba(131, 181, 232, 0.12)',
    icon: 'FileText',
  },
  archive: {
    label: 'Arsip',
    color: '#e4b86a',
    border: 'rgba(228, 184, 106, 0.4)',
    bgSoft: 'rgba(228, 184, 106, 0.12)',
    icon: 'Archive',
  },
  installer: {
    label: 'Installer',
    color: '#e39a67',
    border: 'rgba(227, 154, 103, 0.4)',
    bgSoft: 'rgba(227, 154, 103, 0.12)',
    icon: 'Package',
  },
  code: {
    label: 'Kode',
    color: '#73c9d4',
    border: 'rgba(115, 201, 212, 0.4)',
    bgSoft: 'rgba(115, 201, 212, 0.12)',
    icon: 'Code2',
  },
  other: {
    label: 'Lain-lain',
    color: '#9aa4ad',
    border: 'rgba(154, 164, 173, 0.4)',
    bgSoft: 'rgba(154, 164, 173, 0.12)',
    icon: 'File',
  },
};

/**
 * Kamus istilah sesuai TDD Bagian 12:
 * Bahasa awam di UI utama, istilah teknis hanya di menu Lanjutan.
 */
export const MIKRO_KOPI_TERMS = {
  hash: 'Sidik jari berkas',
  confidence: 'Keyakinan',
  extractor: 'Pembaca isi',
  ocr: 'Baca tulisan di gambar',
  fts: 'Pencarian isi',
  cluster: 'Kelompok berkas',
  dryRun: 'Coba dulu tanpa memindahkan',
  manifest: 'Catatan perubahan',
  rollback: 'Kembalikan',
  collision: 'Penamaan otomatis saat nama sama',
  byok: 'Sambungkan ke layanan AI milik Anda',
  zeroByte: 'Berkas kosong (0 byte)',
  duplicate: 'Berkas kembar',
  quarantine: 'Perlu dicek',
  staging: 'Daftar tinjauan',
  heuristic: 'Aturan otomatis dari jenis dan nama',
  ingest: 'Pindai berkas',
};

export const APP_SHORTCUTS = [
  { key: 'Ctrl+1', label: 'Perpustakaan' },
  { key: 'Ctrl+2', label: 'Rapikan Otomatis' },
  { key: 'Ctrl+3', label: 'Pemeriksaan Kebersihan' },
  { key: 'Ctrl+4', label: 'Riwayat & Kembalikan' },
  { key: 'Ctrl+,', label: 'Pengaturan' },
  { key: 'Ctrl+K', label: 'Command Palette' },
  { key: 'Ctrl+F', label: 'Pencarian Berkas' },
  { key: 'F2', label: 'Ubah Nama' },
  { key: 'Ctrl+Z', label: 'Kembalikan Operasi Terakhir' },
  { key: 'Delete', label: 'Kirim ke Recycle Bin' },
];
