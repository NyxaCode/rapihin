import React, { useState, useEffect, useRef } from 'react';
import {
  ListTodo,
  CheckCircle2,
  Clock,
  Circle,
  Plus,
  Trash2,
  X,
  Sparkles,
  Layers,
  Sliders,
  ChevronRight,
  Tag,
  AlertCircle,
  Check,
  Terminal,
  Play,
  Pause,
  Copy,
  Zap,
  Cpu,
  Database,
  ArrowDown,
} from 'lucide-react';
import { TerminalLogEntry } from './TerminalLogModal';

export const INITIAL_LOG_STREAM: TerminalLogEntry[] = [
  {
    id: 'tl-1',
    timestamp: '21:18:02.104',
    level: 'info',
    module: 'System',
    message: 'Rapihin Core Daemon v2.4 online [PID: 14828, Worker Threads: 4, Arch: x64 Windows 11]',
    durationMs: 12,
  },
  {
    id: 'tl-2',
    timestamp: '21:18:02.320',
    level: 'info',
    module: 'Watcher',
    message: 'ReadDirectoryChangesW listener attached to target: D:\\Downloads, C:\\Users\\Desktop',
    durationMs: 8,
  },
  {
    id: 'tl-3',
    timestamp: '21:18:03.118',
    level: 'info',
    module: 'Watcher',
    message: 'Event FILE_ACTION_ADDED detected: D:\\Downloads\\invoice_vendor_2026.pdf (3.4 MB)',
  },
  {
    id: 'tl-4',
    timestamp: '21:18:03.142',
    level: 'info',
    module: 'HashEngine',
    message: 'Generating cryptographic hash: SHA-256 calculation completed in 24ms -> [7f8a9b21c4...]',
    durationMs: 24,
  },
  {
    id: 'tl-5',
    timestamp: '21:18:03.180',
    level: 'info',
    module: 'Classifier',
    message: 'Rule evaluation #4: Regex match (/invoice|faktur/i) -> Target: D:\\Dokumen\\Keuangan',
    durationMs: 14,
  },
  {
    id: 'tl-6',
    timestamp: '21:18:03.220',
    level: 'success',
    module: 'Mover',
    message: 'Atomic move completed: invoice_vendor_2026.pdf -> D:\\Dokumen\\Keuangan\\ (verified zero bytes loss)',
    durationMs: 40,
  },
  {
    id: 'tl-7',
    timestamp: '21:18:05.890',
    level: 'warn',
    module: 'Watcher',
    message: 'Duplicate file detected: design_mockup_final(1).png matches existing SHA-256 of design_mockup_final.png',
  },
  {
    id: 'tl-8',
    timestamp: '21:18:05.910',
    level: 'warn',
    module: 'RecycleBin',
    message: 'Auto-quarantine policy applied: moving redundant copy to Windows Recycle Bin with rollback ledger',
    durationMs: 20,
  },
  {
    id: 'tl-9',
    timestamp: '21:18:06.012',
    level: 'success',
    module: 'Audit',
    message: 'Snapshot ledger committed: Hash [c9f10a8] branched to MASTER (Total active indexed files: 4,129)',
    durationMs: 16,
  },
];

export interface BacklogItem {
  id: string;
  title: string;
  description: string;
  module: 'Riwayat' | 'Kebersihan' | 'Pengaturan' | 'Perpustakaan' | 'Mesin Engine';
  priority: 'tinggi' | 'sedang' | 'rendah';
  status: 'done' | 'in_progress' | 'todo';
  completedDate?: string;
}

const INITIAL_BACKLOG_ITEMS: BacklogItem[] = [
  {
    id: 'b-1',
    title: 'Pohon Folder Tunggal Snapshot di Halaman Riwayat',
    description: 'Menghilangkan pohon folder sidebar yang ganda saat di halaman riwayat agar navigasi bersih 1 pohon.',
    module: 'Riwayat',
    priority: 'tinggi',
    status: 'done',
    completedDate: '19 Okt 2026',
  },
  {
    id: 'b-2',
    title: 'Garis Waktu Node Git dengan Scrollbar Horizontal',
    description: 'Membuat kanvas grafik multi-branch Git dapat digeser secara horizontal dengan scroll bar dan tombol panah.',
    module: 'Riwayat',
    priority: 'tinggi',
    status: 'done',
    completedDate: '19 Okt 2026',
  },
  {
    id: 'b-3',
    title: 'Penanda Berkas Ada (Hijau +) & Ditiadakan (Merah -) Langsung di Pohon',
    description: 'Menampilkan berkas ditiadakan (merah strikethrough) dan berkas baru (hijau) langsung di dalam folder bersangkutan ala GitHub Desktop.',
    module: 'Riwayat',
    priority: 'tinggi',
    status: 'done',
    completedDate: '19 Okt 2026',
  },
  {
    id: 'b-4',
    title: 'Penyederhanaan Halaman Pengaturan ke 4 Kategori Terpadu',
    description: 'Menggabungkan 11 pemisah tab kecil menjadi 4 modul utama (Umum, Aturan, Kecerdasan, dan Pemantauan Log).',
    module: 'Pengaturan',
    priority: 'sedang',
    status: 'done',
    completedDate: '19 Okt 2026',
  },
  {
    id: 'b-5',
    title: 'Panel Pemantauan Log Pengerjaan (Real-Time Engine Logs)',
    description: 'Menambahkan kanvas terminal log eksekusi latar belakang, filter tingkat keparahan, simulasi tugas, dan salin log.',
    module: 'Pengaturan',
    priority: 'tinggi',
    status: 'done',
    completedDate: '19 Okt 2026',
  },
  {
    id: 'b-6',
    title: 'Tata Letak Peta Ruang (Treemap Tengah & Storage Anatomy Kanan)',
    description: 'Menempatkan kanvas visualisasi treemap di center dan storage anatomy folder terpilih di sisi kanan.',
    module: 'Kebersihan',
    priority: 'tinggi',
    status: 'done',
    completedDate: '19 Okt 2026',
  },
  {
    id: 'b-7',
    title: 'Checkbox Pemilihan Berkas Temuan Kebersihan ke Recycle Bin',
    description: 'Memastikan berkas yang tidak dicentang aman dan tidak terbuang ke tempat sampah OS.',
    module: 'Kebersihan',
    priority: 'tinggi',
    status: 'done',
    completedDate: '19 Okt 2026',
  },
  {
    id: 'b-8',
    title: 'Kalkulasi Bobot Storage Bar Dinamis dari Pohon Berkas',
    description: 'Mengganti data tiruan 97% dengan persentase dan bobot kategori berkas riil dari folder aktif.',
    module: 'Kebersihan',
    priority: 'sedang',
    status: 'done',
    completedDate: '19 Okt 2026',
  },
  {
    id: 'b-9',
    title: 'Daemon Pemantau Perubahan Berkas Latar Belakang (FileSystemWatcher)',
    description: 'Mendeteksi berkas baru yang diunduh secara instan tanpa perlu menekan tombol pindai manual.',
    module: 'Mesin Engine',
    priority: 'tinggi',
    status: 'in_progress',
  },
  {
    id: 'b-10',
    title: 'Ekstraksi Metadata EXIF Gambar & Resolusi Otomatis',
    description: 'Membaca tanggal foto, lokasi GPS, dan dimensi kamera untuk penataan otomatis ke folder Tahun/Bulan.',
    module: 'Perpustakaan',
    priority: 'sedang',
    status: 'in_progress',
  },
  {
    id: 'b-11',
    title: 'Penjadwalan Pembersihan Sampah Mingguan Otomatis',
    description: 'Pengingat audit mingguan untuk berkas kembar dan berkas instalasi lama yang tidak terpakai.',
    module: 'Kebersihan',
    priority: 'sedang',
    status: 'todo',
  },
  {
    id: 'b-12',
    title: 'Aturan Penamaan Berkas Kustom Berbasis Regex',
    description: 'Memungkinkan pengguna mendefinisikan formula penamaan berkas spesifik seperti invoice_[nomor]_[vendor].',
    module: 'Pengaturan',
    priority: 'rendah',
    status: 'todo',
  },
  {
    id: 'b-13',
    title: 'Dukungan Sinkronisasi Cloud Storage (Google Drive / OneDrive)',
    description: 'Memantau dan merapikan folder cloud yang disinkronkan secara lokal di Windows Explorer.',
    module: 'Mesin Engine',
    priority: 'rendah',
    status: 'todo',
  },
];

interface BacklogModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialTab?: 'backlog' | 'terminal_log';
}

export const BacklogModal: React.FC<BacklogModalProps> = ({
  isOpen,
  onClose,
  initialTab = 'backlog',
}) => {
  const [activeTab, setActiveTab] = useState<'backlog' | 'terminal_log'>(initialTab);
  const [items, setItems] = useState<BacklogItem[]>(INITIAL_BACKLOG_ITEMS);
  const [filterStatus, setFilterStatus] = useState<'all' | 'done' | 'in_progress' | 'todo'>('all');
  const [searchQuery, setSearchQuery] = useState('');

  // Terminal log state for TAB 2
  const [terminalLogs, setTerminalLogs] = useState<TerminalLogEntry[]>(INITIAL_LOG_STREAM);
  const [terminalFilter, setTerminalFilter] = useState<'all' | 'info' | 'success' | 'warn' | 'error'>('all');
  const [terminalCmd, setTerminalCmd] = useState('');
  const [isLiveStreaming, setIsLiveStreaming] = useState(true);
  const [copiedLog, setCopiedLog] = useState(false);
  const logEndRef = useRef<HTMLDivElement>(null);

  // Form state for adding new backlog item
  const [isAddingNew, setIsAddingNew] = useState(false);
  const [newTitle, setNewTitle] = useState('');
  const [newDesc, setNewDesc] = useState('');
  const [newModule, setNewModule] = useState<BacklogItem['module']>('Perpustakaan');
  const [newPriority, setNewPriority] = useState<BacklogItem['priority']>('sedang');
  const [newStatus, setNewStatus] = useState<BacklogItem['status']>('todo');

  // Auto-scroll terminal log
  useEffect(() => {
    if (activeTab === 'terminal_log') {
      logEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [terminalLogs, activeTab]);

  // Real-time simulated stream
  useEffect(() => {
    if (!isOpen || !isLiveStreaming || activeTab !== 'terminal_log') return;
    const interval = setInterval(() => {
      const now = new Date();
      const timeStr = `${String(now.getHours()).padStart(2, '0')}:${String(
        now.getMinutes()
      ).padStart(2, '0')}:${String(now.getSeconds()).padStart(2, '0')}.${String(
        now.getMilliseconds()
      ).padStart(3, '0')}`;

      const events = [
        {
          level: 'info' as const,
          module: 'Watcher' as const,
          message: 'File modified in background: D:\\Downloads\\project_notes.md (+142 bytes written)',
          durationMs: 6,
        },
        {
          level: 'success' as const,
          module: 'Mover' as const,
          message: 'Organized file D:\\Downloads\\deck.pptx -> D:\\Presentasi\\ (28.4 MB in 38ms)',
          durationMs: 38,
        },
        {
          level: 'info' as const,
          module: 'HashEngine' as const,
          message: 'BLAKE3 incremental checksum verified for 8 cache blocks',
          durationMs: 11,
        },
        {
          level: 'warn' as const,
          module: 'System' as const,
          message: 'Target drive D:\\ I/O saturation at 14% - worker queue throttled 5ms',
          durationMs: 5,
        },
      ];

      const template = events[Math.floor(Math.random() * events.length)];
      setTerminalLogs((prev) => [
        ...prev,
        {
          ...template,
          id: `tl-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
          timestamp: timeStr,
        },
      ]);
    }, 4000);

    return () => clearInterval(interval);
  }, [isOpen, isLiveStreaming, activeTab]);

  if (!isOpen) return null;

  // Toggle item status (done <-> todo)
  const handleToggleStatus = (id: string) => {
    setItems((prev) =>
      prev.map((item) => {
        if (item.id === id) {
          const nextStatus = item.status === 'done' ? 'todo' : 'done';
          return {
            ...item,
            status: nextStatus,
            completedDate: nextStatus === 'done' ? '19 Okt 2026' : undefined,
          };
        }
        return item;
      })
    );
  };

  // Delete item
  const handleDeleteItem = (id: string) => {
    setItems((prev) => prev.filter((i) => i.id !== id));
  };

  // Add new backlog item
  const handleAddNewItem = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle.trim()) return;

    const newItem: BacklogItem = {
      id: `b-${Date.now()}`,
      title: newTitle.trim(),
      description: newDesc.trim() || 'Tidak ada catatan tambahan.',
      module: newModule,
      priority: newPriority,
      status: newStatus,
      completedDate: newStatus === 'done' ? '19 Okt 2026' : undefined,
    };

    setItems((prev) => [newItem, ...prev]);
    setNewTitle('');
    setNewDesc('');
    setIsAddingNew(false);
  };

  // Metrics
  const totalCount = items.length;
  const doneCount = items.filter((i) => i.status === 'done').length;
  const inProgressCount = items.filter((i) => i.status === 'in_progress').length;
  const todoCount = items.filter((i) => i.status === 'todo').length;
  const percentage = totalCount > 0 ? Math.round((doneCount / totalCount) * 100) : 0;

  // Filtered items
  const filteredItems = items.filter((item) => {
    if (filterStatus !== 'all' && item.status !== filterStatus) return false;
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      return (
        item.title.toLowerCase().includes(q) ||
        item.description.toLowerCase().includes(q) ||
        item.module.toLowerCase().includes(q)
      );
    }
    return true;
  });

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs select-none animate-in fade-in">
      <div className="bg-[#191c20] border border-[#333a42] rounded-xl w-full max-w-4xl flex flex-col max-h-[85vh] shadow-2xl overflow-hidden">
        {/* Header Modal */}
        <div className="p-4 border-b border-[#333a42] bg-[#1e2226] flex items-center justify-between shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-[#8ab4f8]/20 flex items-center justify-center text-[#8ab4f8]">
              {activeTab === 'backlog' ? (
                <ListTodo className="w-4 h-4 text-[#8ab4f8]" />
              ) : (
                <Terminal className="w-4 h-4 text-[#3fb950]" />
              )}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-sm font-bold text-[#f3f5f7]">
                  {activeTab === 'backlog'
                    ? 'Panel Backlog & Roadmap Pengembangan'
                    : 'Terminal Log Realtime (Engine & Daemon)'}
                </h3>
                {activeTab === 'backlog' ? (
                  <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-[#2ea043]/20 text-[#3fb950] border border-[#2ea043]/40">
                    {percentage}% Selesai
                  </span>
                ) : (
                  <span className="flex items-center gap-1.5 px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-[#2ea043]/20 text-[#3fb950] border border-[#2ea043]/40">
                    <span className="w-1.5 h-1.5 rounded-full bg-[#3fb950] animate-pulse"></span>
                    DAEMON ONLINE
                  </span>
                )}
              </div>
              <p className="text-[11px] text-[#7c8792]">
                {activeTab === 'backlog'
                  ? 'Daftar fitur, tugas pengembangan yang telah selesai, dan rencana berikutnya'
                  : 'Pemantauan aliran log aktivitas latar belakang, pemindahan berkas, dan daemon'}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {/* Tab Switcher: Backlog vs Terminal Log Realtime */}
            <div className="flex items-center bg-[#141619] p-0.5 rounded-lg border border-[#333a42] text-xs">
              <button
                onClick={() => setActiveTab('backlog')}
                className={`px-3 py-1 rounded-md transition-colors cursor-pointer font-medium ${
                  activeTab === 'backlog'
                    ? 'bg-[#2c3a4d] text-[#8ab4f8]'
                    : 'text-[#7c8792] hover:text-[#f3f5f7]'
                }`}
              >
                Backlog ({items.length})
              </button>
              <button
                onClick={() => setActiveTab('terminal_log')}
                className={`flex items-center gap-1.5 px-3 py-1 rounded-md transition-colors cursor-pointer font-medium ${
                  activeTab === 'terminal_log'
                    ? 'bg-[#238636]/30 text-[#3fb950] border border-[#2ea043]/40'
                    : 'text-[#7c8792] hover:text-[#f3f5f7]'
                }`}
              >
                <Terminal className="w-3.5 h-3.5 text-[#3fb950]" />
                <span>Terminal Log</span>
                <span className="w-1.5 h-1.5 rounded-full bg-[#3fb950] animate-pulse"></span>
              </button>
            </div>

            <button
              onClick={onClose}
              className="p-1.5 rounded-md hover:bg-[#23272c] text-[#7c8792] hover:text-[#f3f5f7] transition-colors cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* TAB 1: BACKLOG VIEW */}
        {activeTab === 'backlog' && (
          <div className="flex-1 flex flex-col overflow-hidden">
            {/* Progress Bar & Metric HUD */}
            <div className="p-4 bg-[#141619] border-b border-[#23272c] flex flex-col gap-2.5 shrink-0">
              <div className="flex items-center justify-between text-xs">
                <div className="flex items-center gap-3 font-mono">
                  <span className="text-[#3fb950] font-bold flex items-center gap-1">
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    {doneCount} Selesai
                  </span>
                  <span className="text-[#eab308] font-bold flex items-center gap-1">
                    <Clock className="w-3.5 h-3.5" />
                    {inProgressCount} Dikerjakan
                  </span>
                  <span className="text-[#8ab4f8] font-bold flex items-center gap-1">
                    <Circle className="w-3.5 h-3.5" />
                    {todoCount} Rencana
                  </span>
                </div>
                <span className="font-mono text-xs text-[#b3bcc5]">
                  {doneCount} dari {totalCount} tugas selesai
                </span>
              </div>

              {/* Multi-segmented Progress Bar */}
              <div className="h-2 w-full bg-[#23272c] rounded-full overflow-hidden flex">
                <div
                  style={{ width: `${(doneCount / totalCount) * 100}%` }}
                  className="h-full bg-[#3fb950] transition-all"
                />
                <div
                  style={{ width: `${(inProgressCount / totalCount) * 100}%` }}
                  className="h-full bg-[#eab308] transition-all"
                />
                <div
                  style={{ width: `${(todoCount / totalCount) * 100}%` }}
                  className="h-full bg-[#8ab4f8] transition-all"
                />
              </div>
            </div>

            {/* Filter Bar & Add Button */}
            <div className="p-3 border-b border-[#333a42] bg-[#191c20] flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 shrink-0">
              <div className="flex items-center gap-1 bg-[#141619] p-0.5 rounded-lg border border-[#333a42] text-xs overflow-x-auto">
                <button
                  onClick={() => setFilterStatus('all')}
                  className={`px-2.5 py-1 rounded transition-colors cursor-pointer ${
                    filterStatus === 'all'
                      ? 'bg-[#2c3a4d] text-[#8ab4f8] font-bold'
                      : 'text-[#7c8792] hover:text-[#f3f5f7]'
                  }`}
                >
                  Semua ({totalCount})
                </button>
                <button
                  onClick={() => setFilterStatus('done')}
                  className={`px-2.5 py-1 rounded transition-colors cursor-pointer ${
                    filterStatus === 'done'
                      ? 'bg-[#2ea043]/30 text-[#3fb950] font-bold'
                      : 'text-[#7c8792] hover:text-[#3fb950]'
                  }`}
                >
                  Selesai ({doneCount})
                </button>
                <button
                  onClick={() => setFilterStatus('in_progress')}
                  className={`px-2.5 py-1 rounded transition-colors cursor-pointer ${
                    filterStatus === 'in_progress'
                      ? 'bg-[#eab308]/30 text-[#eab308] font-bold'
                      : 'text-[#7c8792] hover:text-[#eab308]'
                  }`}
                >
                  Dikerjakan ({inProgressCount})
                </button>
                <button
                  onClick={() => setFilterStatus('todo')}
                  className={`px-2.5 py-1 rounded transition-colors cursor-pointer ${
                    filterStatus === 'todo'
                      ? 'bg-[#8ab4f8]/30 text-[#8ab4f8] font-bold'
                      : 'text-[#7c8792] hover:text-[#8ab4f8]'
                  }`}
                >
                  Rencana ({todoCount})
                </button>
              </div>

              <div className="flex items-center gap-2">
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Cari item backlog..."
                  className="h-7 px-2.5 bg-[#141619] border border-[#333a42] rounded-md text-xs text-[#f3f5f7] placeholder-[#7c8792] focus:outline-none focus:border-[#8ab4f8]"
                />
                <button
                  onClick={() => setIsAddingNew(!isAddingNew)}
                  className="h-7 px-3 bg-[#8ab4f8] hover:bg-[#6fa0ed] text-[#141619] rounded-md text-xs font-bold flex items-center gap-1 transition-colors cursor-pointer shrink-0"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Tambah</span>
                </button>
              </div>
            </div>

            {/* Form Tambah Item Baru (Expandable) */}
            {isAddingNew && (
              <form
                onSubmit={handleAddNewItem}
                className="p-4 bg-[#1e2226] border-b border-[#333a42] space-y-3 animate-in fade-in shrink-0"
              >
                <div className="flex items-center justify-between text-xs font-bold text-[#8ab4f8]">
                  <span>Tambah Item Backlog Baru</span>
                  <button
                    type="button"
                    onClick={() => setIsAddingNew(false)}
                    className="text-[#7c8792] hover:text-[#f3f5f7] cursor-pointer"
                  >
                    Batal
                  </button>
                </div>

                <input
                  type="text"
                  required
                  value={newTitle}
                  onChange={(e) => setNewTitle(e.target.value)}
                  placeholder="Judul fitur atau tugas..."
                  className="w-full bg-[#141619] border border-[#333a42] rounded-md px-3 py-1.5 text-xs text-[#f3f5f7] focus:outline-none focus:border-[#8ab4f8]"
                />

                <textarea
                  value={newDesc}
                  onChange={(e) => setNewDesc(e.target.value)}
                  placeholder="Deskripsi singkat rincian tugas..."
                  rows={2}
                  className="w-full bg-[#141619] border border-[#333a42] rounded-md px-3 py-1.5 text-xs text-[#f3f5f7] focus:outline-none focus:border-[#8ab4f8]"
                />

                <div className="flex items-center justify-between gap-3 text-xs flex-wrap">
                  <div className="flex items-center gap-2">
                    <span className="text-[#7c8792]">Modul:</span>
                    <select
                      value={newModule}
                      onChange={(e) => setNewModule(e.target.value as any)}
                      className="bg-[#141619] border border-[#333a42] rounded px-2 py-1 text-xs text-[#f3f5f7]"
                    >
                      <option value="Riwayat">Riwayat</option>
                      <option value="Kebersihan">Kebersihan</option>
                      <option value="Pengaturan">Pengaturan</option>
                      <option value="Perpustakaan">Perpustakaan</option>
                      <option value="Mesin Engine">Mesin Engine</option>
                    </select>

                    <span className="text-[#7c8792] ml-2">Prioritas:</span>
                    <select
                      value={newPriority}
                      onChange={(e) => setNewPriority(e.target.value as any)}
                      className="bg-[#141619] border border-[#333a42] rounded px-2 py-1 text-xs text-[#f3f5f7]"
                    >
                      <option value="tinggi">Tinggi</option>
                      <option value="sedang">Sedang</option>
                      <option value="rendah">Rendah</option>
                    </select>
                  </div>

                  <button
                    type="submit"
                    className="px-4 py-1.5 bg-[#3fb950] hover:bg-[#2ea043] text-[#141619] font-bold rounded-md text-xs cursor-pointer transition-colors"
                  >
                    Simpan ke Backlog
                  </button>
                </div>
              </form>
            )}

            {/* List Item Backlog */}
            <div className="flex-1 overflow-y-auto p-4 space-y-2">
              {filteredItems.length === 0 ? (
                <div className="py-12 text-center text-[#7c8792] text-xs">
                  Tidak ada item backlog yang sesuai filter.
                </div>
              ) : (
                filteredItems.map((item) => {
                  const isDone = item.status === 'done';
                  const isInProgress = item.status === 'in_progress';

                  return (
                    <div
                      key={item.id}
                      className={`p-3 rounded-lg border transition-all flex items-start justify-between gap-3 ${
                        isDone
                          ? 'bg-[#141619]/60 border-[#2ea043]/30 hover:border-[#2ea043]/60'
                          : isInProgress
                          ? 'bg-[#1e2226] border-[#eab308]/40 hover:border-[#eab308]'
                          : 'bg-[#191c20] border-[#333a42] hover:border-[#454e58]'
                      }`}
                    >
                      {/* Checkbox toggle status */}
                      <button
                        onClick={() => handleToggleStatus(item.id)}
                        className={`mt-0.5 w-4.5 h-4.5 rounded flex items-center justify-center transition-colors cursor-pointer shrink-0 ${
                          isDone
                            ? 'bg-[#2ea043] text-[#141619]'
                            : 'border border-[#333a42] hover:border-[#8ab4f8] bg-[#141619]'
                        }`}
                        title={isDone ? 'Tandai belum selesai' : 'Tandai selesai'}
                      >
                        {isDone && <Check className="w-3.5 h-3.5 font-bold" />}
                      </button>

                      {/* Content */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 flex-wrap">
                          <span
                            className={`text-xs font-semibold ${
                              isDone ? 'text-[#b3bcc5] line-through' : 'text-[#f3f5f7]'
                            }`}
                          >
                            {item.title}
                          </span>

                          {/* Modul badge */}
                          <span className="px-1.5 py-0.2 rounded text-[10px] font-mono bg-[#141619] text-[#8ab4f8] border border-[#333a42]">
                            {item.module}
                          </span>

                          {/* Priority badge */}
                          <span
                            className={`px-1.5 py-0.2 rounded text-[9px] font-mono font-bold uppercase ${
                              item.priority === 'tinggi'
                                ? 'bg-[#f85149]/15 text-[#f85149] border border-[#f85149]/30'
                                : item.priority === 'sedang'
                                ? 'bg-[#eab308]/15 text-[#eab308] border border-[#eab308]/30'
                                : 'bg-[#7c8792]/15 text-[#b3bcc5] border border-[#7c8792]/30'
                            }`}
                          >
                            {item.priority}
                          </span>

                          {/* Status badge */}
                          {isDone ? (
                            <span className="px-1.5 py-0.2 rounded text-[9px] font-mono font-bold bg-[#2ea043]/20 text-[#3fb950] border border-[#2ea043]/40">
                              SELESAI ({item.completedDate})
                            </span>
                          ) : isInProgress ? (
                            <span className="px-1.5 py-0.2 rounded text-[9px] font-mono font-bold bg-[#eab308]/20 text-[#eab308] border border-[#eab308]/40">
                              SEDANG DIKERJAKAN
                            </span>
                          ) : (
                            <span className="px-1.5 py-0.2 rounded text-[9px] font-mono font-bold bg-[#8ab4f8]/15 text-[#8ab4f8] border border-[#8ab4f8]/30">
                              RENCANA
                            </span>
                          )}
                        </div>

                        <p className="text-[11px] text-[#7c8792] mt-1 leading-relaxed">
                          {item.description}
                        </p>
                      </div>

                      {/* Delete button */}
                      <button
                        onClick={() => handleDeleteItem(item.id)}
                        className="p-1 hover:bg-[#23272c] rounded text-[#7c8792] hover:text-[#e07e88] transition-colors cursor-pointer shrink-0"
                        title="Hapus item backlog ini"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  );
                })
              )}
            </div>
          </div>
        )}

        {/* TAB 2: TERMINAL LOG REALTIME (MENGGANTIKAN UJI STATE TDD) */}
        {activeTab === 'terminal_log' && (
          <div className="flex-1 flex flex-col overflow-hidden bg-[#0a0c10] font-mono text-xs">
            {/* Terminal Toolbar */}
            <div className="p-2.5 bg-[#141619] border-b border-[#2d333b] flex flex-wrap items-center justify-between gap-2 shrink-0">
              <div className="flex items-center gap-2 flex-wrap">
                {/* Level filters */}
                <div className="flex items-center bg-[#1e2226] p-0.5 rounded border border-[#333a42] text-[11px]">
                  {(['all', 'info', 'success', 'warn', 'error'] as const).map((lvl) => (
                    <button
                      key={lvl}
                      onClick={() => setTerminalFilter(lvl)}
                      className={`px-2 py-0.5 rounded uppercase font-semibold transition-colors cursor-pointer ${
                        terminalFilter === lvl
                          ? 'bg-[#2a2f35] text-[#3fb950]'
                          : 'text-[#7c8792] hover:text-[#f3f5f7]'
                      }`}
                    >
                      {lvl === 'all' ? `Semua (${terminalLogs.length})` : lvl}
                    </button>
                  ))}
                </div>

                <div className="hidden sm:flex items-center gap-2 text-[10.5px] text-[#7c8792]">
                  <span className="flex items-center gap-1">
                    <Cpu className="w-3 h-3 text-[#8ab4f8]" /> PID: 14828
                  </span>
                  <span>·</span>
                  <span className="flex items-center gap-1">
                    <Database className="w-3 h-3 text-[#a371f7]" /> RAM: 42 MB
                  </span>
                </div>
              </div>

              {/* Action buttons */}
              <div className="flex items-center gap-1.5">
                <button
                  onClick={() => setIsLiveStreaming(!isLiveStreaming)}
                  className={`flex items-center gap-1 px-2 py-0.5 rounded text-[11px] border transition-colors cursor-pointer ${
                    isLiveStreaming
                      ? 'bg-[#1e2226] border-[#333a42] text-[#7c8792] hover:text-[#f3f5f7]'
                      : 'bg-[#238636] border-[#2ea043] text-white'
                  }`}
                  title={isLiveStreaming ? 'Jeda aliran log' : 'Lanjutkan streaming log'}
                >
                  {isLiveStreaming ? <Pause className="w-3 h-3" /> : <Play className="w-3 h-3" />}
                  <span>{isLiveStreaming ? 'Jeda' : 'Lanjut'}</span>
                </button>

                <button
                  onClick={() => {
                    const now = new Date();
                    const timeStr = `${String(now.getHours()).padStart(2, '0')}:${String(
                      now.getMinutes()
                    ).padStart(2, '0')}:${String(now.getSeconds()).padStart(2, '0')}.${String(
                      now.getMilliseconds()
                    ).padStart(3, '0')}`;
                    setTerminalLogs((prev) => [
                      ...prev,
                      {
                        id: `tl-test-${Date.now()}`,
                        timestamp: timeStr,
                        level: 'success',
                        module: 'Watcher',
                        message: 'Event Uji Realtime: Pemindaian selesai (14 berkas sinkron, 0 konflik IO)',
                        durationMs: 14,
                      },
                    ]);
                  }}
                  className="flex items-center gap-1 px-2 py-0.5 bg-[#1e2226] hover:bg-[#252a30] text-[#8ab4f8] border border-[#333a42] rounded text-[11px] transition-colors cursor-pointer"
                  title="Kirim event uji seketika"
                >
                  <Zap className="w-3 h-3 text-[#eab308]" />
                  <span>Uji Event</span>
                </button>

                <button
                  onClick={() => {
                    const text = terminalLogs
                      .map((l) => `[${l.timestamp}] [${l.level.toUpperCase()}] [${l.module}] ${l.message}`)
                      .join('\n');
                    navigator.clipboard.writeText(text);
                    setCopiedLog(true);
                    setTimeout(() => setCopiedLog(false), 2000);
                  }}
                  className="flex items-center gap-1 px-2 py-0.5 bg-[#1e2226] hover:bg-[#252a30] text-[#7c8792] hover:text-[#f3f5f7] border border-[#333a42] rounded text-[11px] transition-colors cursor-pointer"
                  title="Salin log terminal"
                >
                  {copiedLog ? <Check className="w-3 h-3 text-[#3fb950]" /> : <Copy className="w-3 h-3" />}
                  <span>{copiedLog ? 'Tersalin' : 'Salin'}</span>
                </button>

                <button
                  onClick={() => setTerminalLogs([])}
                  className="p-1 hover:bg-[#23272c] text-[#7c8792] hover:text-[#f85149] rounded transition-colors cursor-pointer"
                  title="Bersihkan log terminal"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>

            {/* Terminal Stream Canvas */}
            <div className="flex-1 p-3 overflow-y-auto space-y-1 select-text scrollbar-thin">
              {terminalLogs
                .filter((l) => terminalFilter === 'all' || l.level === terminalFilter)
                .map((log) => {
                  const levelColor =
                    log.level === 'success'
                      ? 'text-[#3fb950] bg-[#238636]/20 border-[#2ea043]/30'
                      : log.level === 'warn'
                      ? 'text-[#eab308] bg-[#eab308]/20 border-[#eab308]/30'
                      : log.level === 'error'
                      ? 'text-[#f85149] bg-[#da3633]/20 border-[#f85149]/30'
                      : 'text-[#8ab4f8] bg-[#1f6feb]/20 border-[#388bfd]/30';

                  return (
                    <div
                      key={log.id}
                      className="flex items-start gap-2 hover:bg-[#161b22]/60 py-0.5 px-1 rounded transition-colors leading-relaxed text-[11px]"
                    >
                      <span className="text-[#555e69] shrink-0 text-[10px] tabular-nums">
                        {log.timestamp}
                      </span>
                      <span className={`px-1 py-0.1 rounded text-[9px] font-bold border uppercase shrink-0 ${levelColor}`}>
                        {log.level}
                      </span>
                      <span className="text-[#a5d6ff] font-semibold shrink-0">
                        [{log.module}]
                      </span>
                      <span className="flex-1 break-all text-[#e6edf3]">
                        {log.message}
                      </span>
                      {log.durationMs !== undefined && (
                        <span className="text-[#7c8792] text-[10px] shrink-0">
                          +{log.durationMs}ms
                        </span>
                      )}
                    </div>
                  );
                })}
              <div ref={logEndRef} />
            </div>

            {/* Command Prompt Line */}
            <div className="p-2 bg-[#141619] border-t border-[#2d333b] flex items-center gap-2 shrink-0">
              <span className="text-[#3fb950] font-bold text-[11px]">rapihin@win11:~$</span>
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  const cmd = terminalCmd.trim().toLowerCase();
                  if (!cmd) return;
                  setTerminalCmd('');
                  const now = new Date();
                  const timeStr = `${String(now.getHours()).padStart(2, '0')}:${String(
                    now.getMinutes()
                  ).padStart(2, '0')}:${String(now.getSeconds()).padStart(2, '0')}.${String(
                    now.getMilliseconds()
                  ).padStart(3, '0')}`;

                  if (cmd === 'clear' || cmd === 'cls') {
                    setTerminalLogs([]);
                    return;
                  }
                  if (cmd === 'status') {
                    setTerminalLogs((prev) => [
                      ...prev,
                      {
                        id: `cmd-${Date.now()}`,
                        timestamp: timeStr,
                        level: 'success',
                        module: 'System',
                        message: 'DAEMON: Aktif | Watcher: 2 direktori (D:\\Downloads, Desktop) | 0 antrian gagal',
                      },
                    ]);
                    return;
                  }
                  if (cmd === 'help') {
                    setTerminalLogs((prev) => [
                      ...prev,
                      {
                        id: `cmd-${Date.now()}`,
                        timestamp: timeStr,
                        level: 'info',
                        module: 'System',
                        message: 'Perintah yang tersedia: status, clear, help, organize, scan',
                      },
                    ]);
                    return;
                  }
                  setTerminalLogs((prev) => [
                    ...prev,
                    {
                      id: `cmd-${Date.now()}`,
                      timestamp: timeStr,
                      level: 'warn',
                      module: 'System',
                      message: `Perintah '${cmd}' diterima dan dieksekusi. Ketik 'help' untuk daftar lengkap.`,
                    },
                  ]);
                }}
                className="flex-1 flex items-center gap-2"
              >
                <input
                  type="text"
                  value={terminalCmd}
                  onChange={(e) => setTerminalCmd(e.target.value)}
                  placeholder="Ketik 'status', 'help', 'scan', atau 'clear'..."
                  className="flex-1 bg-[#0a0c10] border border-[#333a42] text-[#f3f5f7] placeholder-[#555e69] rounded px-2 py-0.5 text-[11px] focus:outline-hidden focus:border-[#3fb950]"
                />
                <button
                  type="submit"
                  className="px-2.5 py-0.5 bg-[#238636] hover:bg-[#2ea043] text-white rounded text-[11px] font-semibold cursor-pointer"
                >
                  Eksekusi
                </button>
              </form>
            </div>
          </div>
        )}

        {/* Footer */}
        <div className="p-3 bg-[#1e2226] border-t border-[#333a42] flex items-center justify-between text-xs text-[#7c8792]">
          <span>Gunakan panel ini untuk melacak dan menambahkan backlog fitur</span>
          <button
            onClick={onClose}
            className="px-4 py-1.5 bg-[#23272c] hover:bg-[#2a2f35] border border-[#333a42] text-[#f3f5f7] rounded-md font-semibold transition-colors cursor-pointer"
          >
            Tutup
          </button>
        </div>
      </div>
    </div>
  );
};
