import React from 'react';
import { Cpu, HardDrive, CheckCircle2 } from 'lucide-react';
import { AiMode } from '../../types';

interface StatusBarProps {
  totalFiles: number;
  selectedCount: number;
  selectedSizeFormatted: string;
  isScanning: boolean;
  scanProgress: number;
  aiMode: AiMode;
  onOpenBacklog?: () => void;
}

export const StatusBar: React.FC<StatusBarProps> = ({
  totalFiles,
  selectedCount,
  selectedSizeFormatted,
  isScanning,
  scanProgress,
  aiMode,
  onOpenBacklog,
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
    <footer className="h-7 bg-[#111318] border-t border-[#20242c] px-3 flex items-center justify-between text-[11px] text-[#616875] select-none shrink-0 font-mono z-30">
      {/* Left: Item counts & selection */}
      <div className="flex items-center gap-3">
        <span className="text-[#9ea5b1]">
          {isScanning ? (
            <span className="text-[#0a84ff] animate-pulse">Memindai berkas... ({scanProgress}%)</span>
          ) : (
            'Siap.'
          )}
        </span>
        <span className="text-[#20242c]">|</span>
        <span className="text-[#9ea5b1] tabular-nums">
          {totalFiles} berkas
        </span>
        {selectedCount > 0 && (
          <>
            <span className="text-[#20242c]">|</span>
            <span className="text-[#0a84ff] font-bold tabular-nums">
              {selectedCount} dipilih ({selectedSizeFormatted})
            </span>
          </>
        )}
      </div>

      {/* Right: Engine mode, Disk space & Backlog */}
      <div className="flex items-center gap-3">
        <div className="flex items-center gap-1.5 text-[#9ea5b1]">
          <Cpu className="w-3 h-3 text-[#0a84ff]" />
          <span>{getAiModeLabel(aiMode)}</span>
        </div>
        <span className="text-[#20242c]">|</span>
        <div className="flex items-center gap-1.5 text-[#9ea5b1]">
          <HardDrive className="w-3 h-3 text-[#616875]" />
          <span>disk: 84 GB bebas</span>
        </div>
        <span className="text-[#20242c]">|</span>
        <button
          onClick={onOpenBacklog}
          className="flex items-center gap-1 text-[#0a84ff] hover:text-[#f5f7fa] cursor-pointer"
          title="Buka Panel Backlog"
        >
          <CheckCircle2 className="w-3 h-3 text-[#3fb950]" />
          <span>Panel Backlog</span>
        </button>
      </div>
    </footer>
  );
};
