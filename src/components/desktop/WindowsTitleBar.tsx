import React from 'react';
import { Minus, Square, Copy, X, FolderTree, ListTodo, Terminal } from 'lucide-react';

interface WindowsTitleBarProps {
  isMaximized: boolean;
  onToggleMaximize: () => void;
  onOpenBacklog: () => void;
  onOpenTerminalLog?: () => void;
}

export const WindowsTitleBar: React.FC<WindowsTitleBarProps> = ({
  isMaximized,
  onToggleMaximize,
  onOpenBacklog,
  onOpenTerminalLog,
}) => {
  return (
    <header className="h-8 bg-[#191c20] text-[#b3bcc5] border-b border-[#333a42] flex items-center justify-between px-3 select-none text-xs z-50">
      {/* Left: App icon and title */}
      <div className="flex items-center gap-2">
        <div className="w-4 h-4 rounded bg-[#8ab4f8]/20 flex items-center justify-center text-[#8ab4f8]">
          <FolderTree className="w-3 h-3" />
        </div>
        <span className="font-semibold text-[#f3f5f7] tracking-tight">Rapihin</span>
        <span className="text-[#7c8792]">·</span>
        <span className="text-[#b3bcc5] hidden sm:inline">Windows Desktop File Organizer & Asset Library</span>
      </div>

      {/* Center: Popup Buttons (Panel Backlog & Terminal Log Realtime) */}
      <div className="flex items-center gap-2">
        <button
          onClick={onOpenBacklog}
          title="Buka Panel Backlog & Roadmap Pengembangan Fitur"
          className="flex items-center gap-1.5 px-2.5 py-0.5 rounded text-[11px] bg-[#23272c] hover:bg-[#2a2f35] text-[#8ab4f8] hover:text-[#f3f5f7] border border-[#333a42] hover:border-[#8ab4f8]/50 transition-colors focus-ring cursor-pointer shadow-xs"
        >
          <ListTodo className="w-3.5 h-3.5 text-[#8ab4f8]" />
          <span className="font-semibold">Panel Backlog</span>
          <span className="px-1.5 py-0.2 rounded text-[9px] font-mono font-bold bg-[#2ea043]/20 text-[#3fb950] border border-[#2ea043]/30">
            Roadmap
          </span>
        </button>

        {onOpenTerminalLog && (
          <button
            onClick={onOpenTerminalLog}
            title="Buka Terminal Log Realtime (Mesin & Daemon)"
            className="flex items-center gap-1.5 px-2.5 py-0.5 rounded text-[11px] bg-[#23272c] hover:bg-[#2a2f35] text-[#7ee787] hover:text-[#f3f5f7] border border-[#333a42] hover:border-[#3fb950]/50 transition-colors focus-ring cursor-pointer shadow-xs font-mono"
          >
            <Terminal className="w-3.5 h-3.5 text-[#3fb950]" />
            <span className="font-semibold font-sans">Terminal Log</span>
            <span className="flex items-center gap-1 px-1.5 py-0.2 rounded text-[9px] font-bold bg-[#2ea043]/20 text-[#3fb950] border border-[#2ea043]/30">
              <span className="w-1.5 h-1.5 rounded-full bg-[#3fb950] animate-pulse"></span>
              LIVE
            </span>
          </button>
        )}
      </div>

      {/* Right: Window Controls */}
      <div className="flex items-center">
        <button
          className="w-8 h-8 flex items-center justify-center hover:bg-[#2a2f35] text-[#b3bcc5] transition-colors focus-ring cursor-pointer"
          title="Minimize"
          aria-label="Minimize"
        >
          <Minus className="w-3.5 h-3.5" />
        </button>
        <button
          onClick={onToggleMaximize}
          className="w-8 h-8 flex items-center justify-center hover:bg-[#2a2f35] text-[#b3bcc5] transition-colors focus-ring cursor-pointer"
          title={isMaximized ? "Restore Window" : "Maximize Window"}
          aria-label={isMaximized ? "Restore Window" : "Maximize Window"}
        >
          {isMaximized ? <Copy className="w-3 h-3 rotate-180" /> : <Square className="w-3 h-3" />}
        </button>
        <button
          className="w-8 h-8 flex items-center justify-center hover:bg-[#e07e88] hover:text-white text-[#b3bcc5] transition-colors focus-ring cursor-pointer"
          title="Tutup (Simulasi)"
          aria-label="Close"
          onClick={() => {
            console.log('[System] Aplikasi desktop Rapihin diminimalkan ke system tray Windows.');
          }}
        >
          <X className="w-3.5 h-3.5" />
        </button>
      </div>
    </header>
  );
};
