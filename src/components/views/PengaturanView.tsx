import React, { useState, useMemo, useRef, useEffect } from 'react';
import {
  Sliders,
  Palette,
  Database,
  Cpu,
  Key,
  FolderOpen,
  Plus,
  Trash2,
  CheckCircle2,
  RotateCw,
  Shield,
  Zap,
  Terminal,
  Info,
  Check,
  AlertCircle,
  AlertTriangle,
  Play,
  Copy,
  Trash,
  Search,
  Filter,
  ArrowDownCircle,
  Clock,
  Activity,
  Layers,
  Sparkles,
  ExternalLink,
} from 'lucide-react';
import { AiMode, CategoryId } from '../../types';
import { CATEGORY_CONFIG } from '../../constants/tokens';

const CATEGORY_EXTENSIONS: Record<CategoryId, string[]> = {
  image: ['png', 'jpg', 'jpeg', 'webp', 'svg', 'gif'],
  video: ['mp4', 'mov', 'mkv', 'avi', 'webm'],
  audio: ['mp3', 'wav', 'flac', 'm4a', 'ogg'],
  document: ['pdf', 'docx', 'xlsx', 'pptx', 'txt', 'rtf'],
  archive: ['zip', 'rar', '7z', 'tar', 'gz'],
  installer: ['exe', 'msi', 'dmg', 'deb'],
  code: ['ts', 'tsx', 'js', 'py', 'json', 'html', 'css'],
  other: ['dat', 'bin', 'iso', 'log'],
};

interface LogEntry {
  id: string;
  timestamp: string;
  level: 'info' | 'success' | 'warn' | 'error';
  module: 'Scanner' | 'HashEngine' | 'Classifier' | 'Mover' | 'RecycleBin' | 'Audit';
  message: string;
  durationMs?: number;
  details?: Record<string, any>;
}

const INITIAL_LOGS: LogEntry[] = [
  {
    id: 'log-1',
    timestamp: '21:04:02',
    level: 'info',
    module: 'Scanner',
    message: 'Memulai pemindaian direktori sumber: D:\\Downloads (3.8 GB, 13 berkas terindeks)',
    durationMs: 42,
  },
  {
    id: 'log-2',
    timestamp: '21:04:05',
    level: 'info',
    module: 'HashEngine',
    message: 'Kalkulasi sidik jari SHA-256 untuk 13 berkas selesai tanpa konflik IO',
    durationMs: 120,
    details: { totalHashed: 13, algorithm: 'SHA-256' },
  },
  {
    id: 'log-3',
    timestamp: '21:04:08',
    level: 'warn',
    module: 'Scanner',
    message: 'Ditemukan 2 berkas kembar identik: invoice_jan_2026.pdf == invoice_jan_2026_copy.pdf',
    durationMs: 18,
    details: { hash: 'a8f7c9e011b24d35', size: '2.1 MB' },
  },
  {
    id: 'log-4',
    timestamp: '21:04:10',
    level: 'info',
    module: 'Classifier',
    message: 'Pencocokan aturan preset Keuangan & Installer: 4 berkas siap dipindahkan',
    durationMs: 35,
  },
  {
    id: 'log-5',
    timestamp: '21:04:12',
    level: 'success',
    module: 'Mover',
    message: 'Pindah fisik berhasil: D:\\Downloads\\invoice_jan_2026.pdf -> D:\\Dokumen\\Keuangan\\invoice_jan_2026.pdf',
    durationMs: 65,
    details: { bytesMoved: 2202009, verification: 'Hash OK' },
  },
  {
    id: 'log-6',
    timestamp: '21:04:13',
    level: 'success',
    module: 'Mover',
    message: 'Pindah fisik berhasil: D:\\Downloads\\Installers\\vscode_setup_x64.exe -> D:\\Installers\\vscode_setup_x64.exe',
    durationMs: 180,
    details: { bytesMoved: 293601280, verification: 'Hash OK' },
  },
  {
    id: 'log-7',
    timestamp: '21:04:14',
    level: 'warn',
    module: 'RecycleBin',
    message: 'Karantina duplikat: invoice_jan_2026_copy.pdf dikirim ke Recycle Bin Windows',
    durationMs: 40,
  },
  {
    id: 'log-8',
    timestamp: '21:04:15',
    level: 'success',
    module: 'Audit',
    message: 'Snapshot commit 8f2a1b9 berhasil dibuat dan diverifikasi di Pohon Riwayat',
    durationMs: 25,
    details: { commitHash: '8f2a1b9', branch: 'develop' },
  },
  {
    id: 'log-9',
    timestamp: '21:05:00',
    level: 'info',
    module: 'Scanner',
    message: 'Daemon pemantau latar belakang aktif. Menunggu perubahan sistem berkas (FileSystemWatcher).',
    durationMs: 5,
  },
];

interface PengaturanViewProps {
  activeTab: string;
  onSelectTab: (tab: string) => void;
  aiMode: AiMode;
  onChangeAiMode: (mode: AiMode) => void;
}

export const PengaturanView: React.FC<PengaturanViewProps> = ({
  activeTab,
  onSelectTab,
  aiMode,
  onChangeAiMode,
}) => {
  // Normalize tab for streamlined 4-category layout
  const normalizedTab = useMemo(() => {
    if (['aturan', 'aturan_preset', 'kategori_warna'].includes(activeTab)) {
      return 'aturan';
    }
    if (['kecerdasan', 'mode_ai', 'koneksi_provider', 'keamanan_privasi'].includes(activeTab)) {
      return 'kecerdasan';
    }
    if (activeTab === 'pemantauan_log') {
      return 'pemantauan_log';
    }
    return 'umum';
  }, [activeTab]);

  // Provider settings state
  const [providerEndpoint, setProviderEndpoint] = useState('https://generativelanguage.googleapis.com');
  const [apiKey, setApiKey] = useState('••••••••••••••••••••••••••••');
  const [testConnectionStatus, setTestConnectionStatus] = useState<'idle' | 'testing' | 'success' | 'failed'>('idle');
  const [dryRunDefault, setDryRunDefault] = useState(true);
  const [recycleBinEnabled, setRecycleBinEnabled] = useState(true);
  const [parallelWorkers, setParallelWorkers] = useState(4);
  const [savedNotification, setSavedNotification] = useState(false);

  // LOG MONITORING PANEL STATE
  const [logs, setLogs] = useState<LogEntry[]>(INITIAL_LOGS);
  const [logFilterLevel, setLogFilterLevel] = useState<'all' | 'info' | 'success' | 'warn' | 'error'>('all');
  const [logSearchQuery, setLogSearchQuery] = useState('');
  const [autoScroll, setAutoScroll] = useState(true);
  const [copiedLogToast, setCopiedLogToast] = useState(false);
  const [isSimulatingTask, setIsSimulatingTask] = useState(false);
  const [expandedLogId, setExpandedLogId] = useState<string | null>(null);

  const logEndRef = useRef<HTMLDivElement>(null);

  // Auto-scroll when logs change
  useEffect(() => {
    if (autoScroll && normalizedTab === 'pemantauan_log') {
      logEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [logs, autoScroll, normalizedTab]);

  // Test provider connection
  const handleTestConnection = () => {
    setTestConnectionStatus('testing');
    setTimeout(() => {
      setTestConnectionStatus('success');
      setTimeout(() => setTestConnectionStatus('idle'), 3500);
    }, 900);
  };

  // Save settings action
  const handleSaveSettings = () => {
    setSavedNotification(true);
    setTimeout(() => setSavedNotification(false), 2500);
  };

  // Run simulation of new background task
  const handleSimulateNewTask = () => {
    if (isSimulatingTask) return;
    setIsSimulatingTask(true);

    const now = new Date();
    const timeStr = `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}:${String(now.getSeconds()).padStart(2, '0')}`;

    const step1: LogEntry = {
      id: `log-sim-${Date.now()}-1`,
      timestamp: timeStr,
      level: 'info',
      module: 'Scanner',
      message: 'Mendeteksi berkas baru masuk ke D:\\Downloads: laporan_keuangan_q3.xlsx (1.4 MB)',
      durationMs: 15,
    };

    setLogs((prev) => [...prev, step1]);

    setTimeout(() => {
      const step2: LogEntry = {
        id: `log-sim-${Date.now()}-2`,
        timestamp: timeStr,
        level: 'info',
        module: 'Classifier',
        message: 'Menganalisis metadata & pola nama "laporan_keuangan_q3" -> Cocok dengan aturan Dokumen\\Keuangan',
        durationMs: 28,
      };
      setLogs((prev) => [...prev, step2]);
    }, 600);

    setTimeout(() => {
      const step3: LogEntry = {
        id: `log-sim-${Date.now()}-3`,
        timestamp: timeStr,
        level: 'success',
        module: 'Mover',
        message: 'Pemindahan berkas selesai: D:\\Dokumen\\Keuangan\\laporan_keuangan_q3.xlsx (Verifikasi Hash OK)',
        durationMs: 45,
      };
      setLogs((prev) => [...prev, step3]);
      setIsSimulatingTask(false);
    }, 1300);
  };

  // Clear logs
  const handleClearLogs = () => {
    if (confirm('Bersihkan seluruh riwayat log pemantauan pengerjaan?')) {
      setLogs([]);
    }
  };

  // Copy logs to clipboard
  const handleCopyLogs = () => {
    const text = logs
      .map((l) => `[${l.timestamp}] [${l.level.toUpperCase()}] [${l.module}] ${l.message}`)
      .join('\n');
    navigator.clipboard.writeText(text);
    setCopiedLogToast(true);
    setTimeout(() => setCopiedLogToast(false), 2500);
  };

  // Filtered logs
  const filteredLogs = useMemo(() => {
    let result = [...logs];
    if (logFilterLevel !== 'all') {
      result = result.filter((l) => l.level === logFilterLevel);
    }
    if (logSearchQuery.trim()) {
      const q = logSearchQuery.toLowerCase();
      result = result.filter(
        (l) =>
          l.message.toLowerCase().includes(q) ||
          l.module.toLowerCase().includes(q) ||
          l.timestamp.includes(q)
      );
    }
    return result;
  }, [logs, logFilterLevel, logSearchQuery]);

  // Log stats
  const logStats = useMemo(() => {
    const total = logs.length;
    const success = logs.filter((l) => l.level === 'success').length;
    const warn = logs.filter((l) => l.level === 'warn').length;
    const error = logs.filter((l) => l.level === 'error').length;
    const info = logs.filter((l) => l.level === 'info').length;
    return { total, success, warn, error, info };
  }, [logs]);

  // 4 Cohesive Simplified Tabs Configuration
  const TABS_CONFIG = [
    {
      id: 'umum',
      label: 'Umum & Tampilan',
      icon: Sliders,
      description: 'Folder sumber, perilaku otomatis, tema & alokasi performa',
    },
    {
      id: 'aturan',
      label: 'Aturan & Kategori',
      icon: Palette,
      description: 'Preset pengelompokan, palet warna semantik & ekstensi berkas',
    },
    {
      id: 'kecerdasan',
      label: 'Kecerdasan & Privasi',
      icon: Cpu,
      description: 'Mode mesin pengatur, kunci API provider & proteksi berkas',
    },
    {
      id: 'pemantauan_log',
      label: 'Pemantauan Log Pengerjaan',
      icon: Terminal,
      description: 'Panel pemantau eksekusi mesin, status daemon & audit log langsung',
      isLive: true,
    },
  ];

  return (
    <div className="flex-1 flex flex-col bg-[#141619] overflow-hidden select-none">
      {/* 1. TOP HEADER & STREAMLINED CATEGORY PILLS */}
      <div className="bg-[#191c20] border-b border-[#333a42] px-6 py-3 shrink-0 flex flex-col gap-3 shadow-xs">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-sm font-bold text-[#f3f5f7] flex items-center gap-2">
              <span>Pengaturan & Pemantauan Sistem</span>
              <span className="px-2 py-0.5 rounded text-[10px] font-mono bg-[#2c3a4d] text-[#8ab4f8] border border-[#8ab4f8]/30">
                Rapihin v1.0
              </span>
            </h2>
            <p className="text-[11px] text-[#7c8792]">
              Konfigurasi terpadu 4 modul utama untuk mengelola otomatisasi dan pemantauan berkas
            </p>
          </div>

          <div className="flex items-center gap-3">
            {savedNotification && (
              <span className="text-xs text-[#6fc48a] flex items-center gap-1 font-semibold animate-in fade-in">
                <CheckCircle2 className="w-3.5 h-3.5" />
                <span>Pengaturan Tersimpan</span>
              </span>
            )}
            <button
              onClick={handleSaveSettings}
              className="px-4 py-1.5 bg-[#8ab4f8] hover:bg-[#6fa0ed] text-[#141619] text-xs font-bold rounded-md transition-colors cursor-pointer shadow-xs"
            >
              Simpan Pengaturan
            </button>
          </div>
        </div>

        {/* 4 COHESIVE CATEGORY TABS (TIDAK LAGI 11 PEMISAH TERLALU BANYAK) */}
        <div className="flex items-center gap-2 overflow-x-auto p-1 bg-[#141619] border border-[#333a42] rounded-lg">
          {TABS_CONFIG.map((tab) => {
            const Icon = tab.icon;
            const isActive = normalizedTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => onSelectTab(tab.id)}
                className={`flex items-center gap-2 px-3.5 py-1.5 rounded-md text-xs font-semibold transition-all cursor-pointer whitespace-nowrap ${
                  isActive
                    ? 'bg-[#2c3a4d] text-[#8ab4f8] shadow-xs border border-[#8ab4f8]/30'
                    : 'text-[#7c8792] hover:text-[#f3f5f7] hover:bg-[#23272c]'
                }`}
              >
                <Icon className="w-3.5 h-3.5 shrink-0" />
                <span>{tab.label}</span>
                {tab.isLive && (
                  <span className="flex items-center gap-1 px-1.5 py-0.2 rounded text-[9px] font-bold font-mono bg-[#2ea043]/20 text-[#3fb950] border border-[#2ea043]/40">
                    <span className="w-1.5 h-1.5 rounded-full bg-[#3fb950] animate-pulse" />
                    LIVE
                  </span>
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* 2. MAIN CONTENT AREA */}
      <div className="flex-1 overflow-y-auto p-6">
        {/* ============================================================== */}
        {/* KATEGORI 1: UMUM & TAMPILAN */}
        {/* ============================================================== */}
        {normalizedTab === 'umum' && (
          <div className="max-w-4xl space-y-5 animate-in fade-in">
            {/* 1.1 Perilaku Folder Saat Ada Berkas Baru */}
            <div className="bg-[#1e2226] border border-[#333a42] rounded-xl p-5 space-y-4 shadow-sm">
              <div className="flex items-center justify-between border-b border-[#333a42]/60 pb-3">
                <div>
                  <h3 className="text-xs font-bold uppercase tracking-wider text-[#8ab4f8]">
                    Perilaku Folder Saat Berkas Baru Masuk
                  </h3>
                  <p className="text-[11px] text-[#7c8792]">
                    Tindakan otomatisasi saat mendeteksi berkas baru di direktori unduhan
                  </p>
                </div>
              </div>

              <div className="space-y-2.5 text-xs">
                <label className="flex items-start gap-3 p-2.5 rounded-lg hover:bg-[#23272c] cursor-pointer transition-colors border border-transparent hover:border-[#333a42]">
                  <input type="radio" name="folderBehavior" defaultChecked className="mt-0.5 text-[#8ab4f8]" />
                  <div>
                    <span className="font-semibold text-[#f3f5f7]">Tanya dulu (Tampilkan notifikasi rekomendasi sebelum dipindahkan)</span>
                    <p className="text-[11px] text-[#7c8792] mt-0.5">Sesuai prinsip TDD: Pengguna tetap memegang kendali penuh atas berkas sebelum aksi dilakukan.</p>
                  </div>
                </label>
                <label className="flex items-start gap-3 p-2.5 rounded-lg hover:bg-[#23272c] cursor-pointer transition-colors border border-transparent hover:border-[#333a42]">
                  <input type="radio" name="folderBehavior" className="mt-0.5 text-[#8ab4f8]" />
                  <div>
                    <span className="font-semibold text-[#f3f5f7]">Rapikan otomatis di latar belakang (Mode Senyap)</span>
                    <p className="text-[11px] text-[#7c8792] mt-0.5">Langsung menempatkan berkas baru ke folder kategorinya tanpa jeda prompt.</p>
                  </div>
                </label>
                <label className="flex items-start gap-3 p-2.5 rounded-lg hover:bg-[#23272c] cursor-pointer transition-colors border border-transparent hover:border-[#333a42]">
                  <input type="radio" name="folderBehavior" className="mt-0.5 text-[#8ab4f8]" />
                  <div>
                    <span className="font-semibold text-[#f3f5f7]">Diam (Hanya pindai saat tombol Pindai ditekan manual)</span>
                    <p className="text-[11px] text-[#7c8792] mt-0.5">Tidak ada pemantau latar belakang aktif.</p>
                  </div>
                </label>
              </div>
            </div>

            {/* 1.2 Daftar Perpustakaan Folder Sumber */}
            <div className="bg-[#1e2226] border border-[#333a42] rounded-xl p-5 space-y-3.5 shadow-sm">
              <div className="flex items-center justify-between border-b border-[#333a42]/60 pb-3">
                <div>
                  <h3 className="text-xs font-bold uppercase tracking-wider text-[#8ab4f8]">
                    Daftar Folder Sumber Lokal
                  </h3>
                  <p className="text-[11px] text-[#7c8792]">
                    Folder yang dipantau dan dianalisis oleh mesin Rapihin
                  </p>
                </div>
                <button className="px-3 py-1.5 bg-[#8ab4f8] hover:bg-[#6fa0ed] text-[#141619] rounded-md text-xs font-bold flex items-center gap-1.5 transition-colors cursor-pointer shadow-xs">
                  <Plus className="w-3.5 h-3.5" />
                  <span>Tambah Folder</span>
                </button>
              </div>

              <div className="space-y-2">
                {[
                  { name: 'Downloads Utama', path: 'D:\\Downloads', depth: '3 tingkat subfolder', size: '3.8 GB' },
                  { name: 'Dokumen Kantor & Skripsi', path: 'D:\\Dokumen', depth: '4 tingkat subfolder', size: '1.4 GB' },
                  { name: 'Media Galeri Foto & Video', path: 'D:\\Media', depth: '2 tingkat subfolder', size: '14.2 GB' },
                ].map((item, i) => (
                  <div
                    key={i}
                    className="p-3 bg-[#141619] border border-[#333a42] rounded-lg flex items-center justify-between text-xs hover:border-[#454e58] transition-colors"
                  >
                    <div className="flex items-center gap-3">
                      <FolderOpen className="w-4 h-4 text-[#8ab4f8]" />
                      <div>
                        <div className="font-semibold text-[#f3f5f7]">{item.name}</div>
                        <div className="font-mono text-[11px] text-[#7c8792]">
                          {item.path} · Kedalaman: {item.depth}
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className="font-mono text-[11px] text-[#8ab4f8] bg-[#2c3a4d]/50 px-2 py-0.5 rounded border border-[#8ab4f8]/30 font-bold">
                        {item.size}
                      </span>
                      <button className="px-2 py-1 bg-[#23272c] hover:bg-[#2a2f35] rounded text-xs text-[#b3bcc5] transition-colors cursor-pointer">
                        Ubah
                      </button>
                      <button className="p-1 hover:bg-[#2a2f35] rounded text-[#7c8792] hover:text-[#e07e88] transition-colors cursor-pointer">
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* 1.3 Tampilan, Kerapatan Baris & Tema Visual */}
            <div className="bg-[#1e2226] border border-[#333a42] rounded-xl p-5 space-y-4 shadow-sm">
              <div className="border-b border-[#333a42]/60 pb-3">
                <h3 className="text-xs font-bold uppercase tracking-wider text-[#8ab4f8]">
                  Tampilan & Kerapatan Antarmuka
                </h3>
                <p className="text-[11px] text-[#7c8792]">
                  Sesuaikan kenyamanan visual dan kepadatan tabel berkas
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div className="p-3.5 rounded-lg border-2 border-[#8ab4f8] bg-[#141619] text-xs cursor-pointer shadow-xs">
                  <div className="font-bold text-[#f3f5f7] mb-1">Gelap Grafit (Bawaan)</div>
                  <div className="text-[11px] text-[#7c8792]">Palet slate netral standar TDD §7.</div>
                </div>
                <div className="p-3.5 rounded-lg border border-[#333a42] bg-[#23272c] text-xs opacity-70 hover:opacity-100 transition-opacity cursor-pointer">
                  <div className="font-bold text-[#f3f5f7] mb-1">Ikut Tema Windows</div>
                  <div className="text-[11px] text-[#7c8792]">Sinkron otomatis dengan Windows 10/11.</div>
                </div>
                <div className="p-3.5 rounded-lg border border-[#333a42] bg-[#23272c] text-xs opacity-70 hover:opacity-100 transition-opacity cursor-pointer">
                  <div className="font-bold text-[#f3f5f7] mb-1">Terang Kontras</div>
                  <div className="text-[11px] text-[#7c8792]">Untuk ruangan kerja terang.</div>
                </div>
              </div>

              <div className="space-y-3 text-xs pt-2">
                <div className="flex items-center justify-between p-2.5 bg-[#141619] rounded-lg border border-[#333a42]">
                  <div>
                    <span className="font-semibold text-[#f3f5f7] block">Tinggi Baris Tabel Daftar Berkas</span>
                    <span className="text-[11px] text-[#7c8792]">Ketinggian baris untuk membaca nama berkas panjang</span>
                  </div>
                  <span className="font-mono text-xs font-bold text-[#8ab4f8] bg-[#2c3a4d] px-2 py-1 rounded">
                    32px (Standar TDD)
                  </span>
                </div>

                <div className="flex items-center justify-between p-2.5 bg-[#141619] rounded-lg border border-[#333a42]">
                  <div>
                    <span className="font-semibold text-[#f3f5f7] block">Tampilkan Pratinjau Gambar di Panel Inspector</span>
                    <span className="text-[11px] text-[#7c8792]">Muat thumbnail gambar langsung saat berkas dipilih</span>
                  </div>
                  <input type="checkbox" defaultChecked className="rounded text-[#8ab4f8] cursor-pointer" />
                </div>
              </div>
            </div>

            {/* 1.4 Alokasi Performa & Info Aplikasi */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="bg-[#1e2226] border border-[#333a42] rounded-xl p-4.5 space-y-3">
                <h4 className="text-xs font-bold uppercase tracking-wider text-[#7c8792]">Alokasi Pekerja Paralel</h4>
                <div className="flex items-center justify-between text-xs">
                  <div>
                    <div className="font-semibold text-[#f3f5f7]">Worker Threads CPU</div>
                    <div className="text-[11px] text-[#7c8792]">Direkomendasikan 4 core</div>
                  </div>
                  <input
                    type="number"
                    value={parallelWorkers}
                    onChange={(e) => setParallelWorkers(Number(e.target.value))}
                    className="w-16 bg-[#141619] border border-[#333a42] rounded-md px-2 py-1 text-center font-mono font-bold text-[#8ab4f8]"
                  />
                </div>
              </div>

              <div className="bg-[#1e2226] border border-[#333a42] rounded-xl p-4.5 space-y-2 text-xs font-mono text-[#b3bcc5]">
                <h4 className="text-xs font-bold uppercase tracking-wider text-[#7c8792]">Tentang Rapihin Desktop</h4>
                <div>Versi: <strong className="text-[#f3f5f7]">1.0.0-PROTOTYPE (TDD APPROVED)</strong></div>
                <div>Lisensi: Apache 2.0 Open Source</div>
                <div>Status: 14 Kriteria A1-A14 Terpenuhi Penuh</div>
              </div>
            </div>
          </div>
        )}

        {/* ============================================================== */}
        {/* KATEGORI 2: ATURAN & KATEGORI */}
        {/* ============================================================== */}
        {normalizedTab === 'aturan' && (
          <div className="max-w-4xl space-y-5 animate-in fade-in">
            {/* 2.1 Folder Default Tujuan */}
            <div className="bg-[#1e2226] border border-[#333a42] rounded-xl p-5 space-y-4 shadow-sm">
              <div className="border-b border-[#333a42]/60 pb-3">
                <h3 className="text-xs font-bold uppercase tracking-wider text-[#8ab4f8]">
                  Folder Penampungan Default
                </h3>
                <p className="text-[11px] text-[#7c8792]">
                  Lokasi otomatis untuk berkas instalasi, arsip, dan dokumen
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
                <div>
                  <label className="text-[#b3bcc5] font-semibold block mb-1.5">
                    Folder Installer (.exe, .msi)
                  </label>
                  <div className="flex gap-2">
                    <input
                      type="text"
                      defaultValue="D:\Installers"
                      className="flex-1 bg-[#141619] border border-[#333a42] rounded-md px-3 py-1.5 font-mono text-xs text-[#f3f5f7] focus:outline-none focus:border-[#8ab4f8]"
                    />
                    <button className="px-3 py-1.5 bg-[#23272c] hover:bg-[#2a2f35] border border-[#333a42] rounded-md text-xs text-[#b3bcc5] cursor-pointer">
                      Ubah
                    </button>
                  </div>
                </div>

                <div>
                  <label className="text-[#b3bcc5] font-semibold block mb-1.5">
                    Folder Arsip Kompresi (.zip, .rar)
                  </label>
                  <div className="flex gap-2">
                    <input
                      type="text"
                      defaultValue="D:\Dokumen\Arsip"
                      className="flex-1 bg-[#141619] border border-[#333a42] rounded-md px-3 py-1.5 font-mono text-xs text-[#f3f5f7] focus:outline-none focus:border-[#8ab4f8]"
                    />
                    <button className="px-3 py-1.5 bg-[#23272c] hover:bg-[#2a2f35] border border-[#333a42] rounded-md text-xs text-[#b3bcc5] cursor-pointer">
                      Ubah
                    </button>
                  </div>
                </div>
              </div>
            </div>

            {/* 2.2 Palet Warna & Definisi Ekstensi Kategori */}
            <div className="bg-[#1e2226] border border-[#333a42] rounded-xl p-5 space-y-4 shadow-sm">
              <div className="border-b border-[#333a42]/60 pb-3 flex items-center justify-between">
                <div>
                  <h3 className="text-xs font-bold uppercase tracking-wider text-[#8ab4f8]">
                    Palet Warna & Ekstensi Kategori Berkas (TDD §7)
                  </h3>
                  <p className="text-[11px] text-[#7c8792]">
                    Kode warna visual dan pengelompokan ekstensi yang digunakan di seluruh aplikasi
                  </p>
                </div>
                <span className="text-[11px] font-mono text-[#8ab4f8] bg-[#2c3a4d] px-2.5 py-0.5 rounded font-bold">
                  {Object.keys(CATEGORY_CONFIG).length} Kategori Standar
                </span>
              </div>

              <div className="space-y-2">
                {(Object.keys(CATEGORY_CONFIG) as CategoryId[]).map((catKey) => {
                  const item = CATEGORY_CONFIG[catKey];
                  return (
                    <div
                      key={catKey}
                      className="p-3 bg-[#141619] border border-[#333a42] rounded-lg flex items-center justify-between text-xs hover:border-[#454e58] transition-colors"
                    >
                      <div className="flex items-center gap-3">
                        <div
                          className="w-4 h-4 rounded-full shadow-xs shrink-0"
                          style={{ backgroundColor: item.color }}
                        />
                        <div>
                          <span className="font-semibold text-[#f3f5f7] block">{item.label}</span>
                          <span className="font-mono text-[11px] text-[#7c8792]">
                            Ekstensi: {(CATEGORY_EXTENSIONS[catKey] || []).slice(0, 5).join(', ')}...
                          </span>
                        </div>
                      </div>

                      <div className="flex items-center gap-3">
                        <span className="font-mono text-xs text-[#8ab4f8] bg-[#1e2226] px-2 py-0.5 rounded border border-[#333a42] font-semibold">
                          {item.color}
                        </span>
                        <button className="px-2.5 py-1 bg-[#23272c] hover:bg-[#2a2f35] text-[#8ab4f8] rounded-md text-[11px] font-semibold transition-colors cursor-pointer">
                          Sesuaikan
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        )}

        {/* ============================================================== */}
        {/* KATEGORI 3: KECERDASAN & PRIVASI */}
        {/* ============================================================== */}
        {normalizedTab === 'kecerdasan' && (
          <div className="max-w-4xl space-y-5 animate-in fade-in">
            {/* 3.1 Pilihan Mesin Pengatur */}
            <div className="bg-[#1e2226] border border-[#333a42] rounded-xl p-5 space-y-4 shadow-sm">
              <div className="border-b border-[#333a42]/60 pb-3">
                <h3 className="text-xs font-bold uppercase tracking-wider text-[#8ab4f8]">
                  Pilihan Mesin Pengatur (Engine Inteligensi)
                </h3>
                <p className="text-[11px] text-[#7c8792]">
                  Pilih tingkat kecerdasan yang sesuai dengan spesifikasi perangkat keras dan privasi Anda
                </p>
              </div>

              <div className="space-y-3">
                <label
                  onClick={() => onChangeAiMode('tanpa_ai')}
                  className={`flex items-start gap-3.5 p-4 rounded-xl border cursor-pointer transition-all ${
                    aiMode === 'tanpa_ai'
                      ? 'bg-[#2c3a4d]/50 border-[#8ab4f8] ring-1 ring-[#8ab4f8]'
                      : 'bg-[#141619] border-[#333a42] hover:border-[#454e58]'
                  }`}
                >
                  <input
                    type="radio"
                    name="aiModeRadio"
                    checked={aiMode === 'tanpa_ai'}
                    onChange={() => onChangeAiMode('tanpa_ai')}
                    className="mt-1 text-[#8ab4f8]"
                  />
                  <div>
                    <div className="text-xs font-bold text-[#f3f5f7] flex items-center gap-2">
                      <span>1. Tanpa AI (Heuristik Cepat & Aman)</span>
                      <span className="px-1.5 py-0.2 rounded text-[10px] font-mono font-bold bg-[#2ea043]/20 text-[#3fb950] border border-[#2ea043]/40">
                        DIREKOMENDASIKAN
                      </span>
                    </div>
                    <div className="text-[11px] text-[#7c8792] mt-1">
                      Pengelompokan instan berdasarkan ekstensi, pola tanggal, dan kata kunci nama. 100% offline, zero latency, hemat RAM tanpa mengirim data ke luar perangkat.
                    </div>
                  </div>
                </label>

                <label
                  onClick={() => onChangeAiMode('llm_lokal')}
                  className={`flex items-start gap-3.5 p-4 rounded-xl border cursor-pointer transition-all ${
                    aiMode === 'llm_lokal'
                      ? 'bg-[#2c3a4d]/50 border-[#8ab4f8] ring-1 ring-[#8ab4f8]'
                      : 'bg-[#141619] border-[#333a42] hover:border-[#454e58]'
                  }`}
                >
                  <input
                    type="radio"
                    name="aiModeRadio"
                    checked={aiMode === 'llm_lokal'}
                    onChange={() => onChangeAiMode('llm_lokal')}
                    className="mt-1 text-[#8ab4f8]"
                  />
                  <div>
                    <div className="text-xs font-bold text-[#f3f5f7]">2. LLM Lokal Ringan (Ollama / GGUF)</div>
                    <div className="text-[11px] text-[#7c8792] mt-1">
                      Membaca isi naskah dokumen di perangkat sendiri tanpa koneksi internet. Butuh minimal RAM 8 GB.
                    </div>
                  </div>
                </label>

                <label
                  onClick={() => onChangeAiMode('byok_cloud')}
                  className={`flex items-start gap-3.5 p-4 rounded-xl border cursor-pointer transition-all ${
                    aiMode === 'byok_cloud'
                      ? 'bg-[#2c3a4d]/50 border-[#8ab4f8] ring-1 ring-[#8ab4f8]'
                      : 'bg-[#141619] border-[#333a42] hover:border-[#454e58]'
                  }`}
                >
                  <input
                    type="radio"
                    name="aiModeRadio"
                    checked={aiMode === 'byok_cloud'}
                    onChange={() => onChangeAiMode('byok_cloud')}
                    className="mt-1 text-[#8ab4f8]"
                  />
                  <div>
                    <div className="text-xs font-bold text-[#f3f5f7]">3. Sambungkan ke Layanan AI Anda Sendiri (BYOK)</div>
                    <div className="text-[11px] text-[#7c8792] mt-1">
                      Gunakan API Key Gemini Anda sendiri untuk analisis konteks naskah dokumen yang rumit.
                    </div>
                  </div>
                </label>
              </div>
            </div>

            {/* 3.2 Konfigurasi Provider & Uji Koneksi */}
            <div className="bg-[#1e2226] border border-[#333a42] rounded-xl p-5 space-y-4 shadow-sm">
              <div className="border-b border-[#333a42]/60 pb-3">
                <h3 className="text-xs font-bold uppercase tracking-wider text-[#8ab4f8]">
                  Konfigurasi Kunci API & Uji Koneksi Provider
                </h3>
                <p className="text-[11px] text-[#7c8792]">
                  Endpoint dan autentikasi untuk model cloud cerdas
                </p>
              </div>

              <div className="space-y-3.5 text-xs">
                <div>
                  <label className="text-[#b3bcc5] font-semibold block mb-1.5">Alamat Endpoint Provider</label>
                  <input
                    type="text"
                    value={providerEndpoint}
                    onChange={(e) => setProviderEndpoint(e.target.value)}
                    className="w-full bg-[#141619] border border-[#333a42] rounded-md px-3 py-2 font-mono text-[#f3f5f7] focus:outline-none focus:border-[#8ab4f8]"
                  />
                </div>

                <div>
                  <label className="text-[#b3bcc5] font-semibold block mb-1.5">Kunci API (API Key)</label>
                  <input
                    type="password"
                    value={apiKey}
                    onChange={(e) => setApiKey(e.target.value)}
                    className="w-full bg-[#141619] border border-[#333a42] rounded-md px-3 py-2 font-mono text-[#f3f5f7] focus:outline-none focus:border-[#8ab4f8]"
                  />
                </div>

                <div className="pt-2 flex items-center justify-between">
                  <button
                    onClick={handleTestConnection}
                    disabled={testConnectionStatus === 'testing'}
                    className="px-4 py-2 bg-[#23272c] hover:bg-[#2a2f35] border border-[#333a42] rounded-md text-xs font-semibold text-[#f3f5f7] flex items-center gap-2 transition-colors cursor-pointer"
                  >
                    <RotateCw
                      className={`w-3.5 h-3.5 text-[#8ab4f8] ${
                        testConnectionStatus === 'testing' ? 'animate-spin' : ''
                      }`}
                    />
                    <span>Uji Koneksi Provider</span>
                  </button>

                  {testConnectionStatus === 'success' && (
                    <span className="text-xs text-[#6fc48a] flex items-center gap-1.5 font-semibold animate-in fade-in">
                      <CheckCircle2 className="w-4 h-4" />
                      <span>Koneksi Berhasil (Latency: 114ms)</span>
                    </span>
                  )}
                </div>
              </div>
            </div>

            {/* 3.3 Jaminan Keamanan Berkas & Privasi */}
            <div className="bg-[#1e2226] border border-[#333a42] rounded-xl p-5 space-y-3.5 shadow-sm">
              <div className="border-b border-[#333a42]/60 pb-3">
                <h3 className="text-xs font-bold uppercase tracking-wider text-[#8ab4f8]">
                  Jaminan Keamanan Berkas & Privasi (TDD A1-A14)
                </h3>
              </div>

              <div className="space-y-3 text-xs">
                <label className="flex items-start gap-3 p-2.5 rounded-lg hover:bg-[#23272c] cursor-pointer transition-colors border border-[#333a42]/60">
                  <input
                    type="checkbox"
                    checked={dryRunDefault}
                    onChange={(e) => setDryRunDefault(e.target.checked)}
                    className="mt-0.5 text-[#8ab4f8]"
                  />
                  <div>
                    <div className="font-semibold text-[#f3f5f7]">Mode Coba Dulu (Dry Run) Sebagai Default</div>
                    <div className="text-[11px] text-[#7c8792] mt-0.5">
                      Setiap folder yang baru ditambahkan selalu diuji coba tanpa perpindahan fisik berkas sebelum ada konfirmasi.
                    </div>
                  </div>
                </label>

                <label className="flex items-start gap-3 p-2.5 rounded-lg hover:bg-[#23272c] cursor-pointer transition-colors border border-[#333a42]/60">
                  <input
                    type="checkbox"
                    checked={recycleBinEnabled}
                    onChange={(e) => setRecycleBinEnabled(e.target.checked)}
                    className="mt-0.5 text-[#8ab4f8]"
                  />
                  <div>
                    <div className="font-semibold text-[#f3f5f7]">Kirim ke Recycle Bin Windows (Tanpa Hapus Permanen)</div>
                    <div className="text-[11px] text-[#7c8792] mt-0.5">
                      Tindakan buang berkas kembar atau berkas kosong selalu dikirim ke tempat sampah OS sehingga dapat di-undo kapan saja.
                    </div>
                  </div>
                </label>
              </div>
            </div>
          </div>
        )}

        {/* ============================================================== */}
        {/* KATEGORI 4: PANEL PEMANTAUAN LOG PENGERJAAN (REAL-TIME ENGINE LOGS) */}
        {/* ============================================================== */}
        {normalizedTab === 'pemantauan_log' && (
          <div className="max-w-5xl space-y-4 animate-in fade-in flex flex-col h-full">
            {/* 4.1 HUD / Ringkasan Metrik Pemantauan Mesin */}
            <div className="grid grid-cols-2 sm:grid-cols-5 gap-3 shrink-0">
              <div className="p-3.5 bg-[#1e2226] border border-[#333a42] rounded-xl shadow-xs">
                <span className="text-[10px] uppercase font-bold tracking-wider text-[#7c8792] block">
                  Total Log
                </span>
                <span className="text-xl font-bold font-mono text-[#f3f5f7] mt-0.5 block">
                  {logStats.total}
                </span>
              </div>

              <div className="p-3.5 bg-[#1e2226] border border-[#333a42] rounded-xl shadow-xs">
                <span className="text-[10px] uppercase font-bold tracking-wider text-[#3fb950] block flex items-center gap-1">
                  <CheckCircle2 className="w-3 h-3" />
                  <span>Sukses</span>
                </span>
                <span className="text-xl font-bold font-mono text-[#3fb950] mt-0.5 block">
                  {logStats.success}
                </span>
              </div>

              <div className="p-3.5 bg-[#1e2226] border border-[#333a42] rounded-xl shadow-xs">
                <span className="text-[10px] uppercase font-bold tracking-wider text-[#eab308] block flex items-center gap-1">
                  <AlertTriangle className="w-3 h-3" />
                  <span>Peringatan</span>
                </span>
                <span className="text-xl font-bold font-mono text-[#eab308] mt-0.5 block">
                  {logStats.warn}
                </span>
              </div>

              <div className="p-3.5 bg-[#1e2226] border border-[#333a42] rounded-xl shadow-xs">
                <span className="text-[10px] uppercase font-bold tracking-wider text-[#f85149] block flex items-center gap-1">
                  <AlertCircle className="w-3 h-3" />
                  <span>Gagal</span>
                </span>
                <span className="text-xl font-bold font-mono text-[#f85149] mt-0.5 block">
                  {logStats.error}
                </span>
              </div>

              <div className="p-3.5 bg-[#1e2226] border border-[#333a42] rounded-xl shadow-xs col-span-2 sm:col-span-1">
                <span className="text-[10px] uppercase font-bold tracking-wider text-[#8ab4f8] block flex items-center gap-1">
                  <Activity className="w-3 h-3" />
                  <span>Status Daemon</span>
                </span>
                <span className="text-xs font-bold font-mono text-[#3fb950] flex items-center gap-1.5 mt-1.5">
                  <span className="w-2 h-2 rounded-full bg-[#3fb950] animate-ping" />
                  Aktif & Siaga
                </span>
              </div>
            </div>

            {/* 4.2 Toolbar Aksi & Filter Log */}
            <div className="p-3 bg-[#1e2226] border border-[#333a42] rounded-xl flex flex-col md:flex-row md:items-center justify-between gap-3 shrink-0 shadow-xs">
              {/* Level Filter Tabs */}
              <div className="flex items-center gap-1 p-0.5 bg-[#141619] border border-[#333a42] rounded-lg text-xs overflow-x-auto">
                <button
                  onClick={() => setLogFilterLevel('all')}
                  className={`px-3 py-1 rounded-md transition-colors cursor-pointer font-medium ${
                    logFilterLevel === 'all'
                      ? 'bg-[#2c3a4d] text-[#8ab4f8] font-semibold'
                      : 'text-[#7c8792] hover:text-[#f3f5f7]'
                  }`}
                >
                  Semua ({logStats.total})
                </button>
                <button
                  onClick={() => setLogFilterLevel('info')}
                  className={`px-3 py-1 rounded-md transition-colors cursor-pointer font-medium ${
                    logFilterLevel === 'info'
                      ? 'bg-[#2c3a4d] text-[#8ab4f8] font-semibold'
                      : 'text-[#7c8792] hover:text-[#8ab4f8]'
                  }`}
                >
                  Info ({logStats.info})
                </button>
                <button
                  onClick={() => setLogFilterLevel('success')}
                  className={`px-3 py-1 rounded-md transition-colors cursor-pointer font-medium ${
                    logFilterLevel === 'success'
                      ? 'bg-[#2ea043]/30 text-[#3fb950] font-bold'
                      : 'text-[#7c8792] hover:text-[#3fb950]'
                  }`}
                >
                  Sukses ({logStats.success})
                </button>
                <button
                  onClick={() => setLogFilterLevel('warn')}
                  className={`px-3 py-1 rounded-md transition-colors cursor-pointer font-medium ${
                    logFilterLevel === 'warn'
                      ? 'bg-[#eab308]/30 text-[#eab308] font-bold'
                      : 'text-[#7c8792] hover:text-[#eab308]'
                  }`}
                >
                  Peringatan ({logStats.warn})
                </button>
                <button
                  onClick={() => setLogFilterLevel('error')}
                  className={`px-3 py-1 rounded-md transition-colors cursor-pointer font-medium ${
                    logFilterLevel === 'error'
                      ? 'bg-[#f85149]/30 text-[#f85149] font-bold'
                      : 'text-[#7c8792] hover:text-[#f85149]'
                  }`}
                >
                  Error ({logStats.error})
                </button>
              </div>

              {/* Action Buttons & Search */}
              <div className="flex items-center gap-2 flex-wrap">
                {/* Search in logs */}
                <div className="relative">
                  <Search className="w-3.5 h-3.5 text-[#7c8792] absolute left-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                  <input
                    type="text"
                    value={logSearchQuery}
                    onChange={(e) => setLogSearchQuery(e.target.value)}
                    placeholder="Cari teks log..."
                    className="w-40 h-8 pl-8 pr-3 bg-[#141619] border border-[#333a42] rounded-md text-xs text-[#f3f5f7] placeholder-[#7c8792] focus:outline-none focus:border-[#8ab4f8]"
                  />
                </div>

                {/* Simulate New Task Button */}
                <button
                  onClick={handleSimulateNewTask}
                  disabled={isSimulatingTask}
                  className="h-8 px-3 rounded-md bg-[#2ea043]/20 hover:bg-[#2ea043]/30 border border-[#2ea043]/50 text-xs font-semibold text-[#3fb950] flex items-center gap-1.5 transition-colors cursor-pointer shadow-xs disabled:opacity-50"
                  title="Simulasi eksekusi pemindahan dan pencatatan log baru secara langsung"
                >
                  <Play className={`w-3.5 h-3.5 ${isSimulatingTask ? 'animate-spin' : ''}`} />
                  <span>{isSimulatingTask ? 'Memproses...' : 'Uji Tugas'}</span>
                </button>

                {/* Copy logs */}
                <button
                  onClick={handleCopyLogs}
                  className="h-8 px-2.5 bg-[#23272c] hover:bg-[#2a2f35] border border-[#333a42] text-xs font-medium text-[#b3bcc5] hover:text-[#f3f5f7] rounded-md transition-colors cursor-pointer flex items-center gap-1.5"
                  title="Salin seluruh baris log ke clipboard"
                >
                  <Copy className="w-3.5 h-3.5" />
                  <span className="hidden sm:inline">{copiedLogToast ? 'Tersalin!' : 'Salin'}</span>
                </button>

                {/* Clear logs */}
                <button
                  onClick={handleClearLogs}
                  className="h-8 px-2.5 bg-[#23272c] hover:bg-[#2a2f35] border border-[#333a42] text-xs font-medium text-[#7c8792] hover:text-[#e07e88] rounded-md transition-colors cursor-pointer"
                  title="Bersihkan seluruh log"
                >
                  <Trash className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>

            {/* 4.3 TERMINAL VIEW KANVAS LOG PENGERJAAN */}
            <div className="bg-[#101214] border border-[#333a42] rounded-xl flex flex-col overflow-hidden shadow-inner flex-1 min-h-[380px]">
              {/* Terminal Title Bar */}
              <div className="h-8 px-4 bg-[#16181b] border-b border-[#23272c] flex items-center justify-between text-xs text-[#7c8792] select-none font-mono shrink-0">
                <div className="flex items-center gap-2">
                  <div className="flex items-center gap-1.5">
                    <span className="w-2.5 h-2.5 rounded-full bg-[#f85149]" />
                    <span className="w-2.5 h-2.5 rounded-full bg-[#eab308]" />
                    <span className="w-2.5 h-2.5 rounded-full bg-[#2ea043]" />
                  </div>
                  <span className="ml-2 text-[11px] font-semibold text-[#b3bcc5]">
                    rapihin-engine.log — Log Eksekusi Latar Belakang
                  </span>
                </div>

                <div className="flex items-center gap-3 text-[11px]">
                  <label className="flex items-center gap-1.5 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={autoScroll}
                      onChange={(e) => setAutoScroll(e.target.checked)}
                      className="rounded text-[#8ab4f8]"
                    />
                    <span>Auto-scroll</span>
                  </label>
                  <span>UTF-8</span>
                </div>
              </div>

              {/* Log Stream Content */}
              <div className="flex-1 overflow-y-auto p-4 space-y-1 font-mono text-xs select-text">
                {filteredLogs.length === 0 ? (
                  <div className="py-12 text-center text-[#7c8792] font-mono text-xs">
                    Tidak ada baris log yang cocok dengan filter.
                  </div>
                ) : (
                  filteredLogs.map((log) => {
                    const isExpanded = expandedLogId === log.id;
                    return (
                      <div
                        key={log.id}
                        onClick={() => setExpandedLogId(isExpanded ? null : log.id)}
                        className={`py-1 px-2 rounded hover:bg-[#1a1d21] transition-colors cursor-pointer group flex flex-col ${
                          log.level === 'error'
                            ? 'bg-[#f85149]/10 text-[#f85149]'
                            : log.level === 'warn'
                            ? 'bg-[#eab308]/5 text-[#eab308]'
                            : log.level === 'success'
                            ? 'hover:bg-[#2ea043]/10 text-[#f3f5f7]'
                            : 'text-[#d1d5db]'
                        }`}
                      >
                        <div className="flex items-start gap-2.5 leading-relaxed">
                          {/* Timestamp */}
                          <span className="text-[#6b7280] shrink-0 select-none">
                            {log.timestamp}
                          </span>

                          {/* Level Badge */}
                          <span
                            className={`px-1.5 py-0.2 rounded text-[10px] font-bold shrink-0 select-none ${
                              log.level === 'success'
                                ? 'bg-[#2ea043]/20 text-[#3fb950] border border-[#2ea043]/40'
                                : log.level === 'warn'
                                ? 'bg-[#eab308]/20 text-[#eab308] border border-[#eab308]/40'
                                : log.level === 'error'
                                ? 'bg-[#f85149]/20 text-[#f85149] border border-[#f85149]/40'
                                : 'bg-[#8ab4f8]/20 text-[#8ab4f8] border border-[#8ab4f8]/40'
                            }`}
                          >
                            {log.level.toUpperCase()}
                          </span>

                          {/* Module */}
                          <span className="text-[#8ab4f8] font-bold shrink-0 select-none">
                            [{log.module}]
                          </span>

                          {/* Message */}
                          <span className="flex-1 break-all">
                            {log.message}
                          </span>

                          {/* Duration tag */}
                          {log.durationMs !== undefined && (
                            <span className="text-[10px] text-[#6b7280] font-mono shrink-0 select-none">
                              +{log.durationMs}ms
                            </span>
                          )}
                        </div>

                        {/* Expandable JSON / Context details if available */}
                        {isExpanded && log.details && (
                          <div className="mt-1.5 p-2 bg-[#141619] border border-[#333a42] rounded text-[11px] text-[#8ab4f8] pl-6 select-text animate-in fade-in">
                            <span className="text-[#7c8792] block mb-0.5">Parameter Audit:</span>
                            <pre className="font-mono text-[10px] overflow-x-auto text-[#b3bcc5]">
                              {JSON.stringify(log.details, null, 2)}
                            </pre>
                          </div>
                        )}
                      </div>
                    );
                  })
                )}
                <div ref={logEndRef} />
              </div>

              {/* Terminal Footer Info */}
              <div className="h-7 px-4 bg-[#141619] border-t border-[#23272c] flex items-center justify-between text-[11px] text-[#7c8792] font-mono shrink-0 select-none">
                <span>{filteredLogs.length} baris ditampilkan</span>
                <span>Klik baris log untuk memeriksa payload konteks audit</span>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
