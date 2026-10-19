import React from 'react';
import { Cpu, HardDrive, CheckCircle2, ShieldAlert } from 'lucide-react';
import { AiMode } from '../../types';

interface StatusBarProps {
  totalFiles: number;
  selectedCount: number;
  selectedSizeFormatted: string;
  isScanning: boolean;
  scanProgress: number;
  aiMode: AiMode;
  onOpenBacklog?: () => void;
  onOpenTerminalLog?: () => void;
}

export const StatusBar: React.FC<StatusBarProps> = ({
  totalFiles,
  selectedCount,
  selectedSizeFormatted,
  isScanning,
  scanProgress,
  aiMode,
  onOpenBacklog,
  onOpenTerminalLog,
}) => {
  const getAiModeLabel = (mode: AiMode) => {
    switch (mode) {
      case 'tanpa_ai':
        return 'mode: Tanpa AI';
      case 'llm_lokal':
        return 'mode: LLM Lokal (GGUF)';
      case 'byok_cloud':
        return 'mode: BYOK Cloud';
    }
  };

  return (
    <footer className="h-7 bg-[#191c20] border-t border-[#333a42] px-3 flex items-center justify-between text-[11px] text-[#7c8792] select-none shrink-0 font-mono z-30">
      {/* Left: Item counts & selection */}
      <div className="flex items-center gap-3">
        <span className="text-[#b3bcc5]">
          {isScanning ? (
            <span className="text-[#8ab4f8] animate-pulse">Memindai berkas... ({scanProgress}%)</span>
          ) : (
            'Siap.'
          )}
        </span>
        <span className="text-[#333a42]">|</span>
        <span className="text-[#b3bcc5] tabular-nums">
          {totalFiles} berkas
        </span>
        {selectedCount > 0 && (
          <>
            <span className="text-[#333a42]">|</span>
            <span className="text-[#8ab4f8] tabular-nums">
              {selectedCount} dipilih ({selectedSizeFormatted})
            </span>
          </>
        )}
      </div>

      {/* Right: Engine mode, Disk space & TDD Verification */}
      <div className="flex items-center gap-3">
        <div className="flex items-center gap-1.5 text-[#b3bcc5]">
          <Cpu className="w-3 h-3 text-[#8ab4f8]" />
          <span>{getAiModeLabel(aiMode)}</span>
        </div>
        <span className="text-[#333a42]">|</span>
        <div className="flex items-center gap-1.5 text-[#b3bcc5]">
          <HardDrive className="w-3 h-3 text-[#7c8792]" />
          <span>disk: 84 GB bebas</span>
        </div>
        <span className="text-[#333a42]">|</span>
        <button
          onClick={onOpenBacklog}
          className="flex items-center gap-1 text-[#8ab4f8] hover:text-[#f3f5f7] cursor-pointer"
          title="Buka Panel Backlog & Roadmap Pengembangan"
        >
          <CheckCircle2 className="w-3 h-3 text-[#6fc48a]" />
          <span>Panel Backlog</span>
        </button>
        {onOpenTerminalLog && (
          <>
            <span className="text-[#333a42]">|</span>
            <button
              onClick={onOpenTerminalLog}
              className="flex items-center gap-1.5 text-[#3fb950] hover:text-[#7ee787] cursor-pointer"
              title="Buka Terminal Log Realtime Daemon & File System"
            >
              <span className="w-1.5 h-1.5 rounded-full bg-[#3fb950] animate-pulse"></span>
              <span>Terminal Log</span>
            </button>
          </>
        )}
      </div>
    </footer>
  );
};
