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
  suggestionsCount,
}) => {
  const hasSelection = selectedCount > 0;

  // Tombol Rapihkan berubah fungsi: jika ada berkas terpilih, hanya merapihkan berkas tersebut
  const handleRapihkanClick = () => {
    if (hasSelection) {
      onRapikanSelected();
    } else {
      onOpenRapikanModal();
    }
  };

  return (
    <div className="absolute bottom-[20px] left-1/2 -translate-x-1/2 w-[90%] z-40 select-none pointer-events-auto">
      <div className="w-full flex items-center justify-between gap-3 px-3.5 py-2.5 bg-[#1e2226]/95 backdrop-blur-md border border-[#454e58] rounded-2xl shadow-floating-dock transition-all">
        {/* Sisi Kiri: Informasi seleksi & Recycle Bin + Batal, atau 'All files selected' saat tidak ada yang dipilih */}
        <div className="flex-1 flex items-center min-w-0">
          {hasSelection ? (
            <div className="flex items-center gap-3 text-xs">
              <span className="font-medium text-[#f3f5f7] whitespace-nowrap">
                {selectedCount} berkas dipilih
              </span>
              <div className="h-4 w-px bg-[#333a42]" />
              <button
                onClick={onDeleteSelected}
                className="px-3 py-1 bg-[#2a2f35] hover:bg-[#e07e88] hover:text-white text-[#f3f5f7] border border-[#333a42] rounded-md transition-colors flex items-center gap-1.5 cursor-pointer whitespace-nowrap"
                title="Kirim ke Recycle Bin Windows (Delete)"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>Recycle Bin</span>
              </button>
              <button
                onClick={onClearSelection}
                className="text-[#7c8792] hover:text-[#f3f5f7] px-2 py-1 cursor-pointer whitespace-nowrap"
              >
                Batal
              </button>
            </div>
          ) : (
            <div className="flex items-center text-xs">
              <span className="font-medium text-[#8ab4f8]/90 whitespace-nowrap">
                All files selected
              </span>
            </div>
          )}
        </div>

        {/* Sisi Kanan: Pindai & Rapihkan (Teks tetap Rapihkan, berubah fungsi ke berkas terpilih saat ada seleksi) */}
        <div className="flex items-center gap-2 shrink-0">
          {/* Pindai Action */}
          <button
            onClick={onTriggerScan}
            disabled={isScanning}
            className="h-8 px-3.5 rounded-lg bg-[#23272c] hover:bg-[#2a2f35] text-[#f3f5f7] text-xs font-semibold flex items-center gap-2 transition-colors cursor-pointer border border-[#333a42] disabled:opacity-50 shrink-0"
            title="Pindai Direktori Berkas"
          >
            <FolderPlus className={`w-3.5 h-3.5 text-[#8ab4f8] ${isScanning ? 'animate-spin' : ''}`} />
            <span>
              {isScanning ? `Memindai (${scanProgress}%)` : 'Pindai'}
            </span>
          </button>

          {/* Rapihkan Action: Teks tetap 'Rapihkan', berubah fungsi merapikan N item terpilih jika ada seleksi */}
          <button
            onClick={handleRapihkanClick}
            className="h-8 px-4 rounded-lg bg-[#8ab4f8] hover:bg-[#6fa0ed] active:scale-98 text-[#141619] text-xs font-bold flex items-center gap-2 transition-all shadow-md shadow-[#8ab4f8]/20 cursor-pointer shrink-0"
            title={hasSelection ? `Rapihkan ${selectedCount} berkas terpilih` : 'Buka Wizard Rapikan Otomatis'}
          >
            <Wand2 className="w-3.5 h-3.5" />
            <span>Rapihkan</span>
            {hasSelection ? (
              <span
                className="px-1.5 py-0.5 bg-[#141619]/25 text-[#141619] rounded-full text-[10px] font-mono font-bold"
                title={`${selectedCount} item terpilih`}
              >
                {selectedCount}
              </span>
            ) : suggestionsCount > 0 ? (
              <span className="px-1.5 py-0.5 bg-[#141619]/25 text-[#141619] rounded-full text-[10px] font-mono font-bold">
                {suggestionsCount}
              </span>
            ) : null}
          </button>
        </div>
      </div>
    </div>
  );
};
