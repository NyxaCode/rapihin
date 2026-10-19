import React from 'react';
import { FolderPlus, Wand2, Trash2 } from 'lucide-react';

interface FloatingBottomDockProps {
  selectedCount: number;
  onClearSelection: () => void;
  onRapikanSelected: () => void;
  onDeleteSelected: () => void;
  isScanning: boolean;
  scanProgress: number;
  onTriggerScan: () => void;
  onOpenRapikanModal: () => void;
  suggestionsCount: number;
}

export const FloatingBottomDock: React.FC<FloatingBottomDockProps> = ({
  selectedCount,
  onClearSelection,
  onRapikanSelected,
  onDeleteSelected,
  isScanning,
  scanProgress,
  onTriggerScan,
  onOpenRapikanModal,
}) => {
  const hasSelection = selectedCount > 0;

  const handleRapihkanClick = () => {
    if (hasSelection) {
      onRapikanSelected();
    } else {
      onOpenRapikanModal();
    }
  };

  return (
    <div className="absolute bottom-[20px] left-1/2 -translate-x-1/2 w-[90%] z-40 select-none pointer-events-auto">
      <div className="w-full flex items-center justify-between gap-3 px-4 py-2.5 bg-[#13161c]/95 backdrop-blur-md border border-white/10 rounded-2xl shadow-[0_16px_40px_rgba(0,0,0,0.8),inset_0_1px_0_0_rgba(255,255,255,0.1)] transition-all">
        {/* Sisi Kiri: Informasi seleksi & Recycle Bin + Batal */}
        <div className="flex-1 flex items-center min-w-0">
          {hasSelection ? (
            <div className="flex items-center gap-3 text-xs">
              <span className="font-bold text-[#f5f7fa] whitespace-nowrap">
                {selectedCount} berkas dipilih
              </span>
              <div className="h-4 w-px bg-[#262b36]" />
              <button
                onClick={onDeleteSelected}
                className="px-3 py-1 bg-[#181c23] hover:bg-[#f85149] hover:text-white text-[#f5f7fa] border border-white/8 rounded-xl transition-all flex items-center gap-1.5 cursor-pointer whitespace-nowrap shadow-xs"
                title="Kirim ke Recycle Bin Windows (Delete)"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>Recycle Bin</span>
              </button>
              <button
                onClick={onClearSelection}
                className="text-[#616875] hover:text-[#f5f7fa] px-2 py-1 cursor-pointer whitespace-nowrap transition-colors"
              >
                Batal
              </button>
            </div>
          ) : (
            <div className="flex items-center text-xs">
              <span className="font-semibold text-[#0a84ff] whitespace-nowrap">
                Semua berkas siap dirapikan
              </span>
            </div>
          )}
        </div>

        {/* Sisi Kanan: Pindai & Rapihkan */}
        <div className="flex items-center gap-2 shrink-0">
          {/* Pindai Action */}
          <button
            onClick={onTriggerScan}
            disabled={isScanning}
            className="h-8 px-3.5 rounded-xl bg-[#181c23] hover:bg-[#20252e] text-[#f5f7fa] text-xs font-semibold flex items-center gap-2 transition-colors cursor-pointer border border-white/8 disabled:opacity-50 shrink-0 shadow-xs"
            title="Pindai Direktori Berkas"
          >
            <FolderPlus className={`w-3.5 h-3.5 text-[#0a84ff] ${isScanning ? 'animate-spin' : ''}`} />
            <span>
              {isScanning ? `Memindai (${scanProgress}%)` : 'Pindai'}
            </span>
          </button>

          {/* Rapihkan Action with Electric Cobalt Blue Accent */}
          <button
            onClick={handleRapihkanClick}
            className="h-8 px-4 rounded-xl bg-[#0a84ff] hover:bg-[#0070e0] active:scale-98 text-white text-xs font-bold flex items-center gap-2 transition-all shadow-[0_4px_16px_rgba(10,132,255,0.4)] cursor-pointer shrink-0"
            title={hasSelection ? `Rapihkan ${selectedCount} berkas terpilih` : 'Buka Wizard Rapikan Otomatis'}
          >
            <Wand2 className="w-3.5 h-3.5 fill-white/80" />
            <span>Rapikan</span>
            {hasSelection && (
              <span
                className="px-1.5 py-0.2 bg-white/20 text-white rounded-full text-[10px] font-mono font-bold"
                title={`${selectedCount} item terpilih`}
              >
                {selectedCount}
              </span>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};
