import React from 'react';
import { Minus, Square, Copy, X, ListTodo, Folder } from 'lucide-react';

interface WindowsTitleBarProps {
  isMaximized: boolean;
  onToggleMaximize: () => void;
  onOpenBacklog: () => void;
}

export const WindowsTitleBar: React.FC<WindowsTitleBarProps> = ({
  isMaximized,
  onToggleMaximize,
  onOpenBacklog,
}) => {
  return (
    <header className="h-9 bg-[#111318] text-[#9ea5b1] border-b border-[#20242c] flex items-center justify-between px-3 select-none text-xs z-50">
      {/* Left: AeroBox-style glossy squircle icon and app branding */}
      <div className="flex items-center gap-2.5">
        <div className="relative w-5 h-5 rounded-[6px] bg-gradient-to-b from-[#0a84ff] to-[#0055d4] p-[1px] shadow-[0_2px_6px_rgba(10,132,255,0.4),inset_0_1px_1px_rgba(255,255,255,0.4)] flex items-center justify-center">
          <div className="w-full h-full rounded-[5px] bg-gradient-to-b from-[#1b8aff] to-[#0052cc] flex items-center justify-center">
            <Folder className="w-3 h-3 text-white fill-white/80" />
          </div>
        </div>
        <span className="font-bold text-[#f5f7fa] tracking-tight text-[13px]">Rapihin</span>
        <span className="text-[#3b4250]">·</span>
        <span className="text-[#6d7583] hidden sm:inline text-[11px] font-medium">Desktop File Organizer & Asset Library</span>
      </div>

      {/* Center: Single tactile button Panel Backlog */}
      <div className="flex items-center">
        <button
          onClick={onOpenBacklog}
          title="Buka Panel Backlog"
          className="flex items-center gap-1.5 px-3 py-1 rounded-md text-[11px] bg-[#1a1d24] hover:bg-[#222630] text-[#f5f7fa] border border-[#2d323e] hover:border-[#3d4554] transition-all focus-ring cursor-pointer shadow-[inset_0_1px_0_0_rgba(255,255,255,0.06),0_1px_3px_rgba(0,0,0,0.4)]"
        >
          <ListTodo className="w-3.5 h-3.5 text-[#0a84ff]" />
          <span className="font-semibold">Panel Backlog</span>
        </button>
      </div>

      {/* Right: Window Controls */}
      <div className="flex items-center">
        <button
          className="w-8 h-8 flex items-center justify-center hover:bg-[#1f232c] text-[#9ea5b1] hover:text-[#f5f7fa] transition-colors focus-ring cursor-pointer"
          title="Minimize"
          aria-label="Minimize"
        >
          <Minus className="w-3.5 h-3.5" />
        </button>
        <button
          onClick={onToggleMaximize}
          className="w-8 h-8 flex items-center justify-center hover:bg-[#1f232c] text-[#9ea5b1] hover:text-[#f5f7fa] transition-colors focus-ring cursor-pointer"
          title={isMaximized ? "Restore Window" : "Maximize Window"}
          aria-label={isMaximized ? "Restore Window" : "Maximize Window"}
        >
          {isMaximized ? <Copy className="w-3 h-3 rotate-180" /> : <Square className="w-3 h-3" />}
        </button>
        <button
          className="w-8 h-8 flex items-center justify-center hover:bg-[#f85149] hover:text-white text-[#9ea5b1] transition-colors focus-ring cursor-pointer"
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
