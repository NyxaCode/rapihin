import React, { useState, useEffect, useRef } from 'react';
import {
  Terminal,
  Play,
  Pause,
  Trash2,
  Copy,
  Check,
  X,
  Zap,
  Activity,
  Maximize2,
  Filter,
  ArrowDown,
  RefreshCw,
  Cpu,
  Database,
  Radio,
  FileCheck2,
} from 'lucide-react';

export interface TerminalLogEntry {
  id: string;
  timestamp: string;
  level: 'info' | 'success' | 'warn' | 'error';
  module: 'Watcher' | 'HashEngine' | 'Classifier' | 'Mover' | 'RecycleBin' | 'Audit' | 'System';
  message: string;
  durationMs?: number;
  details?: Record<string, any>;
}

const INITIAL_LOG_STREAM: TerminalLogEntry[] = [
  {
    id: 'tl-1',
    timestamp: '21:18:02.104',
    level: 'info',
    module: 'System',
    message: 'Rapihin Core Daemon v2.4 initialized [PID: 14828, Worker Threads: 4, Arch: x64 Windows 11]',
    durationMs: 12,
  },
  {
    id: 'tl-2',
    timestamp: '21:18:02.320',
    level: 'info',
    module: 'Watcher',
    message: 'ReadDirectoryChangesW listener attached to target paths: D:\\Downloads, C:\\Users\\Desktop',
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

const SIMULATED_STREAM_EVENTS: Omit<TerminalLogEntry, 'id' | 'timestamp'>[] = [
  {
    level: 'info',
    module: 'Watcher',
    message: 'File modified in background: D:\\Downloads\\project_notes.md (+142 bytes written)',
    durationMs: 6,
  },
  {
    level: 'info',
    module: 'Classifier',
    message: 'Smart classifier matched tag: [Dokumen, Catatan, Dev] via deterministic rule engine',
    durationMs: 18,
  },
  {
    level: 'success',
    module: 'Mover',
    message: 'Organized file D:\\Downloads\\presentation_deck.pptx -> D:\\Presentasi\\ (28.4 MB in 38ms)',
    durationMs: 38,
  },
  {
    level: 'info',
    module: 'HashEngine',
    message: 'Background verification: BLAKE3 incremental checksum verified for 8 cache blocks',
    durationMs: 11,
  },
  {
    level: 'warn',
    module: 'System',
    message: 'Target drive D:\\ I/O saturation at 14% - worker queue throttled 5ms for background smoothness',
    durationMs: 5,
  },
  {
    level: 'success',
    module: 'Audit',
    message: 'Git snapshot tree updated: 1 file added, 0 deleted, tree depth 4 levels',
    durationMs: 22,
  },
  {
    level: 'info',
    module: 'Watcher',
    message: 'Temporary browser download temp file cleaned: C:\\Users\\AppData\\Local\\Temp\\cr_temp.tmp',
    durationMs: 9,
  },
];

interface TerminalLogModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const TerminalLogModal: React.FC<TerminalLogModalProps> = ({
  isOpen,
  onClose,
}) => {
  const [logs, setLogs] = useState<TerminalLogEntry[]>(INITIAL_LOG_STREAM);
  const [filterLevel, setFilterLevel] = useState<'all' | 'info' | 'success' | 'warn' | 'error'>('all');
  const [filterModule, setFilterModule] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [isLiveStreaming, setIsLiveStreaming] = useState(true);
  const [commandInput, setCommandInput] = useState('');
  const [commandHistory, setCommandHistory] = useState<string[]>([]);
  const [historyIndex, setHistoryIndex] = useState(-1);
  const [copied, setCopied] = useState(false);
  const [autoScroll, setAutoScroll] = useState(true);

  const terminalEndRef = useRef<HTMLDivElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  // Auto-scroll to bottom if autoScroll is enabled
  useEffect(() => {
    if (autoScroll && isOpen) {
      terminalEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [logs, autoScroll, isOpen]);

  // Real-time simulated log streaming
  useEffect(() => {
    if (!isOpen || !isLiveStreaming) return;

    const interval = setInterval(() => {
      const now = new Date();
      const timeStr = `${String(now.getHours()).padStart(2, '0')}:${String(
        now.getMinutes()
      ).padStart(2, '0')}:${String(now.getSeconds()).padStart(2, '0')}.${String(
        now.getMilliseconds()
      ).padStart(3, '0')}`;

      const randomIndex = Math.floor(Math.random() * SIMULATED_STREAM_EVENTS.length);
      const template = SIMULATED_STREAM_EVENTS[randomIndex];

      const newEntry: TerminalLogEntry = {
        ...template,
        id: `tl-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
        timestamp: timeStr,
      };

      setLogs((prev) => {
        const next = [...prev, newEntry];
        // Keep max 200 logs in memory for performance
        if (next.length > 200) return next.slice(next.length - 200);
        return next;
      });
    }, 4500);

    return () => clearInterval(interval);
  }, [isOpen, isLiveStreaming]);

  if (!isOpen) return null;

  // Trigger immediate test event
  const handleTriggerTestEvent = () => {
    const now = new Date();
    const timeStr = `${String(now.getHours()).padStart(2, '0')}:${String(
      now.getMinutes()
    ).padStart(2, '0')}:${String(now.getSeconds()).padStart(2, '0')}.${String(
      now.getMilliseconds()
    ).padStart(3, '0')}`;

    const testEntries: TerminalLogEntry[] = [
      {
        id: `tl-test-${Date.now()}-1`,
        timestamp: timeStr,
        level: 'info',
        module: 'Watcher',
        message: 'Manual Trigger: Memindai instan folder D:\\Downloads\\ (14 berkas terverifikasi)',
        durationMs: 14,
      },
      {
        id: `tl-test-${Date.now()}-2`,
        timestamp: timeStr,
        level: 'success',
        module: 'Mover',
        message: 'Eksekusi pemindahan aturan otomatis: 2 berkas dipindahkan ke folder target',
        durationMs: 32,
      },
    ];

    setLogs((prev) => [...prev, ...testEntries]);
  };

  // Handle command prompt execution
  const handleCommandSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const cmd = commandInput.trim();
    if (!cmd) return;

    setCommandHistory((prev) => [...prev, cmd]);
    setHistoryIndex(-1);
    setCommandInput('');

    const now = new Date();
    const timeStr = `${String(now.getHours()).padStart(2, '0')}:${String(
      now.getMinutes()
    ).padStart(2, '0')}:${String(now.getSeconds()).padStart(2, '0')}.${String(
      now.getMilliseconds()
    ).padStart(3, '0')}`;

    const cmdLower = cmd.toLowerCase();

    if (cmdLower === 'clear' || cmdLower === 'cls') {
      setLogs([]);
      return;
    }

    if (cmdLower === 'help') {
      setLogs((prev) => [
        ...prev,
        {
          id: `cmd-${Date.now()}`,
          timestamp: timeStr,
          level: 'info',
          module: 'System',
          message: `COMMAND HELPER:\n  status    - Cek status daemon, worker threads, dan pemantau folder\n  scan      - Jalankan pemindaian instan direktori aktif\n  organize  - Simulasi pemindahan berkas sesuai preset\n  clear     - Bersihkan layar log terminal\n  stats     - Tampilkan ringkasan metrik IO dan memori\n  pause     - Jeda aliran log real-time\n  resume    - Lanjutkan aliran log real-time`,
        },
      ]);
      return;
    }

    if (cmdLower === 'status') {
      setLogs((prev) => [
        ...prev,
        {
          id: `cmd-${Date.now()}`,
          timestamp: timeStr,
          level: 'success',
          module: 'System',
          message: `DAEMON STATUS: Online | PID: 14828 | Watchers: 2 paths aktif (D:\\Downloads, C:\\Users\\Desktop) | Worker Threads: 4 | Memory: 42.8 MB`,
        },
      ]);
      return;
    }

    if (cmdLower === 'scan') {
      setLogs((prev) => [
        ...prev,
        {
          id: `cmd-${Date.now()}`,
          timestamp: timeStr,
          level: 'info',
          module: 'Watcher',
          message: `[SCAN] Memindai 14 berkas di D:\\Downloads. Semua hash SHA-256 tersinkronisasi.`,
          durationMs: 28,
        },
      ]);
      return;
    }

    if (cmdLower === 'organize') {
      setLogs((prev) => [
        ...prev,
        {
          id: `cmd-${Date.now()}`,
          timestamp: timeStr,
          level: 'success',
          module: 'Classifier',
          message: `[ORGANIZE] Evaluasi 7 aturan selesai. 0 berkas tertunda, folder bersih.`,
          durationMs: 44,
        },
      ]);
      return;
    }

    if (cmdLower === 'pause') {
      setIsLiveStreaming(false);
      setLogs((prev) => [
        ...prev,
        {
          id: `cmd-${Date.now()}`,
          timestamp: timeStr,
          level: 'warn',
          module: 'System',
          message: `Aliran log otomatis dijeda. Ketik 'resume' untuk melanjutkan.`,
        },
      ]);
      return;
    }

    if (cmdLower === 'resume') {
      setIsLiveStreaming(true);
      setLogs((prev) => [
        ...prev,
        {
          id: `cmd-${Date.now()}`,
          timestamp: timeStr,
          level: 'success',
          module: 'System',
          message: `Aliran log otomatis dilanjutkan.`,
        },
      ]);
      return;
    }

    if (cmdLower === 'stats') {
      setLogs((prev) => [
        ...prev,
        {
          id: `cmd-${Date.now()}`,
          timestamp: timeStr,
          level: 'info',
          module: 'System',
          message: `METRICS: Total berkas terindeks: 14 | Total ukuran: 3.8 GB | Snapshot commit: 5 | Uptime daemon: 02h 45m 12s`,
        },
      ]);
      return;
    }

    // Default unknown command
    setLogs((prev) => [
      ...prev,
      {
        id: `cmd-${Date.now()}`,
        timestamp: timeStr,
        level: 'warn',
        module: 'System',
        message: `Perintah tidak dikenal: '${cmd}'. Ketik 'help' untuk melihat daftar perintah.`,
      },
    ]);
  };

  // Copy logs
  const handleCopyLogs = () => {
    const text = logs
      .map(
        (l) =>
          `[${l.timestamp}] [${l.level.toUpperCase()}] [${l.module}] ${l.message} ${
            l.durationMs ? `(+${l.durationMs}ms)` : ''
          }`
      )
      .join('\n');
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  // Clear logs
  const handleClearLogs = () => {
    setLogs([]);
  };

  // Filtered log entries
  const filteredLogs = logs.filter((log) => {
    if (filterLevel !== 'all' && log.level !== filterLevel) return false;
    if (filterModule !== 'all' && log.module !== filterModule) return false;
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      return (
        log.message.toLowerCase().includes(q) ||
        log.module.toLowerCase().includes(q) ||
        log.level.toLowerCase().includes(q)
      );
    }
    return true;
  });

  const totalLogs = logs.length;
  const successCount = logs.filter((l) => l.level === 'success').length;
  const warnCount = logs.filter((l) => l.level === 'warn').length;
  const errorCount = logs.filter((l) => l.level === 'error').length;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-black/70 backdrop-blur-xs select-none animate-in fade-in">
      <div className="bg-[#0f1217] border border-[#2d333b] rounded-xl w-full max-w-4xl flex flex-col h-[85vh] shadow-2xl overflow-hidden font-mono text-xs">
        {/* Top Header: Terminal Title & Controls */}
        <div className="h-11 px-4 bg-[#161b22] border-b border-[#2d333b] flex items-center justify-between shrink-0 select-none">
          <div className="flex items-center gap-3">
            <div className="w-6 h-6 rounded-md bg-[#238636]/20 border border-[#238636]/40 flex items-center justify-center text-[#3fb950]">
              <Terminal className="w-3.5 h-3.5" />
            </div>
            <div className="flex items-center gap-2">
              <span className="font-bold text-[#f0f6fc] tracking-tight">Terminal Log Realtime</span>
              <span className="text-[#484f58]">·</span>
              <div className="flex items-center gap-1.5 px-2 py-0.5 rounded text-[10px] bg-[#1f242c] text-[#8b949e] border border-[#30363d]">
                <span
                  className={`w-2 h-2 rounded-full ${
                    isLiveStreaming ? 'bg-[#3fb950] animate-pulse shadow-[0_0_8px_#3fb950]' : 'bg-[#e3b341]'
                  }`}
                />
                <span className="font-semibold text-[#c9d1d9]">
                  {isLiveStreaming ? 'DAEMON LIVE' : 'STREAM DIJEDA'}
                </span>
              </div>
            </div>
          </div>

          {/* Quick HUD Metrics */}
          <div className="hidden md:flex items-center gap-4 text-[11px] text-[#8b949e]">
            <div className="flex items-center gap-1.5">
              <Cpu className="w-3.5 h-3.5 text-[#58a6ff]" />
              <span>PID 14828 · CPU 0.4%</span>
            </div>
            <div className="flex items-center gap-1.5">
              <Database className="w-3.5 h-3.5 text-[#a371f7]" />
              <span>RAM 42.8 MB</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-[#3fb950]" />
              <span className="text-[#3fb950] font-bold">{successCount} OK</span>
            </div>
            {warnCount > 0 && (
              <div className="flex items-center gap-1.5 text-[#d29922]">
                <span className="w-2 h-2 rounded-full bg-[#d29922]" />
                <span>{warnCount} Warn</span>
              </div>
            )}
          </div>

          {/* Window action buttons */}
          <div className="flex items-center gap-1.5">
            <button
              onClick={() => setIsLiveStreaming(!isLiveStreaming)}
              className={`flex items-center gap-1 px-2.5 py-1 rounded text-[11px] border transition-colors cursor-pointer ${
                isLiveStreaming
                  ? 'bg-[#1f242c] border-[#30363d] text-[#8b949e] hover:text-[#f0f6fc]'
                  : 'bg-[#238636] border-[#2ea043] text-white'
              }`}
              title={isLiveStreaming ? 'Jeda aliran log' : 'Lanjutkan aliran log'}
            >
              {isLiveStreaming ? <Pause className="w-3 h-3" /> : <Play className="w-3 h-3" />}
              <span>{isLiveStreaming ? 'Jeda' : 'Lanjut'}</span>
            </button>

            <button
              onClick={onClose}
              className="p-1.5 rounded-md hover:bg-[#21262d] text-[#8b949e] hover:text-[#f0f6fc] transition-colors cursor-pointer"
              title="Tutup Terminal"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Toolbar: Filters & Actions */}
        <div className="p-2.5 bg-[#0d1117] border-b border-[#21262d] flex flex-wrap items-center justify-between gap-2.5 shrink-0">
          <div className="flex items-center gap-2 flex-wrap">
            {/* Level filters */}
            <div className="flex items-center bg-[#161b22] p-0.5 rounded-md border border-[#30363d] text-[11px]">
              {(['all', 'info', 'success', 'warn', 'error'] as const).map((lvl) => (
                <button
                  key={lvl}
                  onClick={() => setFilterLevel(lvl)}
                  className={`px-2 py-0.5 rounded uppercase font-semibold transition-colors cursor-pointer ${
                    filterLevel === lvl
                      ? 'bg-[#21262d] text-[#58a6ff]'
                      : 'text-[#8b949e] hover:text-[#c9d1d9]'
                  }`}
                >
                  {lvl === 'all' ? `Semua (${totalLogs})` : lvl}
                </button>
              ))}
            </div>

            {/* Module dropdown */}
            <select
              value={filterModule}
              onChange={(e) => setFilterModule(e.target.value)}
              className="bg-[#161b22] border border-[#30363d] text-[#c9d1d9] rounded px-2 py-1 text-[11px] focus:outline-hidden focus:border-[#58a6ff] cursor-pointer"
            >
              <option value="all">Semua Modul</option>
              <option value="Watcher">Watcher</option>
              <option value="HashEngine">HashEngine</option>
              <option value="Classifier">Classifier</option>
              <option value="Mover">Mover</option>
              <option value="RecycleBin">RecycleBin</option>
              <option value="Audit">Audit</option>
              <option value="System">System</option>
            </select>

            {/* Keyword search input */}
            <div className="relative">
              <input
                type="text"
                placeholder="Cari kata kunci log..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="bg-[#161b22] border border-[#30363d] text-[#c9d1d9] placeholder-[#484f58] rounded px-2.5 py-1 text-[11px] w-40 sm:w-52 focus:outline-hidden focus:border-[#58a6ff]"
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery('')}
                  className="absolute right-1.5 top-1/2 -translate-y-1/2 text-[#8b949e] hover:text-[#f0f6fc]"
                >
                  <X className="w-3 h-3" />
                </button>
              )}
            </div>
          </div>

          {/* Action buttons */}
          <div className="flex items-center gap-2">
            <button
              onClick={handleTriggerTestEvent}
              className="flex items-center gap-1 px-2.5 py-1 bg-[#1f242c] hover:bg-[#262c36] text-[#58a6ff] border border-[#30363d] hover:border-[#58a6ff]/50 rounded text-[11px] font-semibold transition-colors cursor-pointer"
              title="Simulasikan event berkas baru sekarang"
            >
              <Zap className="w-3 h-3 text-[#e3b341]" />
              <span>Uji Event Baru</span>
            </button>

            <button
              onClick={handleCopyLogs}
              className="flex items-center gap-1 px-2.5 py-1 bg-[#161b22] hover:bg-[#21262d] text-[#8b949e] hover:text-[#f0f6fc] border border-[#30363d] rounded text-[11px] transition-colors cursor-pointer"
              title="Salin seluruh isi log"
            >
              {copied ? <Check className="w-3 h-3 text-[#3fb950]" /> : <Copy className="w-3 h-3" />}
              <span>{copied ? 'Tersalin' : 'Salin'}</span>
            </button>

            <button
              onClick={handleClearLogs}
              className="p-1 hover:bg-[#21262d] text-[#8b949e] hover:text-[#f85149] rounded transition-colors cursor-pointer"
              title="Bersihkan log (clear)"
            >
              <Trash2 className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        {/* Terminal Canvas Stream (Hacker / Developer Dark Canvas) */}
        <div
          ref={containerRef}
          className="flex-1 p-3 sm:p-4 overflow-y-auto bg-[#0a0c10] text-[#c9d1d9] space-y-1 select-text scrollbar-thin"
        >
          {filteredLogs.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center text-[#484f58] space-y-2 select-none py-12">
              <Terminal className="w-8 h-8 opacity-40" />
              <p className="text-xs">Tidak ada log yang sesuai dengan filter.</p>
              <button
                onClick={() => {
                  setFilterLevel('all');
                  setFilterModule('all');
                  setSearchQuery('');
                }}
                className="text-[11px] text-[#58a6ff] hover:underline cursor-pointer"
              >
                Reset Semua Filter
              </button>
            </div>
          ) : (
            filteredLogs.map((log) => {
              const levelColor =
                log.level === 'success'
                  ? 'text-[#3fb950] bg-[#238636]/20 border-[#2ea043]/30'
                  : log.level === 'warn'
                  ? 'text-[#d29922] bg-[#9e6a03]/20 border-[#bb8009]/30'
                  : log.level === 'error'
                  ? 'text-[#f85149] bg-[#da3633]/20 border-[#f85149]/30'
                  : 'text-[#58a6ff] bg-[#1f6feb]/20 border-[#388bfd]/30';

              const moduleColor =
                log.module === 'Watcher'
                  ? 'text-[#a5d6ff]'
                  : log.module === 'HashEngine'
                  ? 'text-[#d2a8ff]'
                  : log.module === 'Classifier'
                  ? 'text-[#7ee787]'
                  : log.module === 'Mover'
                  ? 'text-[#ffa657]'
                  : log.module === 'RecycleBin'
                  ? 'text-[#ff7b72]'
                  : 'text-[#8b949e]';

              return (
                <div
                  key={log.id}
                  className="flex items-start gap-2 hover:bg-[#161b22]/50 py-0.5 px-1 rounded transition-colors group leading-relaxed font-mono text-[11.5px]"
                >
                  {/* Timestamp */}
                  <span className="text-[#484f58] shrink-0 text-[10.5px] tabular-nums pt-0.5">
                    {log.timestamp}
                  </span>

                  {/* Level badge */}
                  <span
                    className={`px-1.5 py-0.2 rounded text-[9.5px] font-bold border uppercase shrink-0 ${levelColor}`}
                  >
                    {log.level}
                  </span>

                  {/* Module badge */}
                  <span className={`font-semibold shrink-0 ${moduleColor}`}>
                    [{log.module}]
                  </span>

                  {/* Message body */}
                  <span className="flex-1 break-all text-[#e6edf3]">
                    {log.message}
                  </span>

                  {/* Duration latency */}
                  {log.durationMs !== undefined && (
                    <span className="text-[#8b949e] text-[10px] tabular-nums shrink-0 opacity-70 group-hover:opacity-100">
                      +{log.durationMs}ms
                    </span>
                  )}
                </div>
              );
            })
          )}
          <div ref={terminalEndRef} />
        </div>

        {/* Interactive Command Prompt Line */}
        <div className="p-2.5 bg-[#161b22] border-t border-[#21262d] flex items-center justify-between gap-3 shrink-0">
          <form onSubmit={handleCommandSubmit} className="flex-1 flex items-center gap-2">
            <span className="text-[#3fb950] font-bold shrink-0 flex items-center gap-1">
              <span>rapihin-daemon@win11:~$</span>
            </span>
            <input
              type="text"
              value={commandInput}
              onChange={(e) => setCommandInput(e.target.value)}
              placeholder="Ketik perintah (contoh: 'status', 'scan', 'organize', 'help', 'clear')..."
              className="flex-1 bg-[#0d1117] border border-[#30363d] focus:border-[#58a6ff] text-[#f0f6fc] placeholder-[#484f58] rounded px-3 py-1 text-[11.5px] focus:outline-hidden font-mono"
            />
            <button
              type="submit"
              className="px-3 py-1 bg-[#238636] hover:bg-[#2ea043] text-white rounded text-[11px] font-semibold transition-colors cursor-pointer"
            >
              Kirim
            </button>
          </form>

          {/* Auto-scroll toggle */}
          <div className="flex items-center gap-2 text-[11px] text-[#8b949e] shrink-0">
            <label className="flex items-center gap-1.5 cursor-pointer">
              <input
                type="checkbox"
                checked={autoScroll}
                onChange={(e) => setAutoScroll(e.target.checked)}
                className="rounded accent-[#238636] cursor-pointer"
              />
              <span>Auto-scroll</span>
            </label>
          </div>
        </div>
      </div>
    </div>
  );
};
