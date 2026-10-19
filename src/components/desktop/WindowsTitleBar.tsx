import React from 'react';
import { Minus, Square, Copy, X, FolderTree, Sliders, Laptop, ShieldCheck } from 'lucide-react';

interface WindowsTitleBarProps {
  isMaximized: boolean;
  onToggleMaximize: () => void;
  onOpenStateTester: () => void;
  activeStateLabel: string;
}

export const WindowsTitleBar: React.FC<WindowsTitleBarProps> = ({
  isMaximized,
  onToggleMaximize,
  onOpenStateTester,
  activeStateLabel,
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

      {/* Center: Simulator state helper badge */}
      <div className="flex items-center gap-2">
        <button
          onClick={onOpenStateTester}
          title="Uji 6 State TDD (Kosong, Memuat, Gagal, dll.) & Matriks Verifikasi"
          className="flex items-center gap-1.5 px-2 py-0.5 rounded text-[11px] bg-[#23272c] hover:bg-[#2a2f35] text-[#8ab4f8] border border-[#333a42] transition-colors focus-ring"
        >
          <Sliders className="w-3 h-3 text-[#8ab4f8]" />
          <span>State TDD: <strong className="font-medium text-[#f3f5f7] capitalize">{activeStateLabel}</strong></span>
        </button>
      </div>

      {/* Right: Window Controls */}
      <div className="flex items-center">
        <button
          className="w-8 h-8 flex items-center justify-center hover:bg-[#2a2f35] text-[#b3bcc5] transition-colors focus-ring"
          title="Minimize"
          aria-label="Minimize"
        >
          <Minus className="w-3.5 h-3.5" />
        </button>
        <button
          onClick={onToggleMaximize}
          className="w-8 h-8 flex items-center justify-center hover:bg-[#2a2f35] text-[#b3bcc5] transition-colors focus-ring"
          title={isMaximized ? "Restore Window" : "Maximize Window"}
          aria-label={isMaximized ? "Restore Window" : "Maximize Window"}
        >
          {isMaximized ? <Copy className="w-3 h-3 rotate-180" /> : <Square className="w-3 h-3" />}
        </button>
        <button
          className="w-8 h-8 flex items-center justify-center hover:bg-[#e07e88] hover:text-white text-[#b3bcc5] transition-colors focus-ring"
          title="Tutup (Simulasi)"
          aria-label="Close"
          onClick={() => {
            alert('Aplikasi desktop Rapihin tetap berjalan di tray Windows.');
          }}
        >
          <X className="w-3.5 h-3.5" />
        </button>
      </div>
    </header>
  );
};
