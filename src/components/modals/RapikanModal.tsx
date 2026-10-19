import React, { useState } from 'react';
import {
  Wand2,
  CheckCircle2,
  AlertTriangle,
  ArrowRight,
  RotateCcw,
  ShieldCheck,
  X,
  Play,
  RotateCw,
  Info,
  Check,
} from 'lucide-react';
import { SuggestionRow } from '../../types';

interface RapikanModalProps {
  isOpen: boolean;
  onClose: () => void;
  suggestions: SuggestionRow[];
  onToggleSuggestion: (id: string) => void;
  onSelectAllSuggestions: () => void;
  onApplySelected: () => void;
  onUndoLastOperation: () => void;
}

export const RapikanModal: React.FC<RapikanModalProps> = ({
  isOpen,
  onClose,
  suggestions,
  onToggleSuggestion,
  onSelectAllSuggestions,
  onApplySelected,
  onUndoLastOperation,
}) => {
  const [currentStep, setCurrentStep] = useState<1 | 2 | 3>(2);
  const [isApplying, setIsApplying] = useState(false);
  const [applyProgress, setApplyProgress] = useState(0);

  if (!isOpen) return null;

  const selectedCount = suggestions.filter((s) => s.selected).length;

  const handleStartApplying = () => {
    setIsApplying(true);
    setApplyProgress(0);

    let progress = 0;
    const interval = setInterval(() => {
      progress += 25;
      setApplyProgress(progress);
      if (progress >= 100) {
        clearInterval(interval);
        setIsApplying(false);
        setCurrentStep(3);
        onApplySelected();
      }
    }, 200);
  };

  const getConfidenceBadge = (confidence: 'tinggi' | 'sedang' | 'rendah') => {
    switch (confidence) {
      case 'tinggi':
        return (
          <span className="inline-flex items-center gap-1 text-[#6fc48a] font-semibold text-xs">
            <CheckCircle2 className="w-3.5 h-3.5" />
            <span>Tinggi</span>
          </span>
        );
      case 'sedang':
        return (
          <span className="inline-flex items-center gap-1 text-[#e0ab5c] font-semibold text-xs">
            <Info className="w-3.5 h-3.5" />
            <span>Sedang</span>
          </span>
        );
      case 'rendah':
        return (
          <span className="inline-flex items-center gap-1 text-[#e07e88] font-semibold text-xs">
            <AlertTriangle className="w-3.5 h-3.5" />
            <span>Rendah</span>
          </span>
        );
    }
  };

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 z-50 select-none animate-in fade-in duration-150">
      <div className="bg-[#1e2226] border border-[#454e58] rounded-2xl shadow-2xl max-w-3xl w-full max-h-[85vh] flex flex-col overflow-hidden text-xs">
        {/* Modal Header */}
        <div className="px-6 py-4 border-b border-[#333a42] flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-[#8ab4f8]/20 text-[#8ab4f8] flex items-center justify-center">
              <Wand2 className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-sm font-bold text-[#f3f5f7]">
                Rapikan Otomatis — Langkah {currentStep} dari 3
              </h2>
              <p className="text-[11px] text-[#7c8792]">
                {currentStep === 1 && 'Pilih aturan pengelompokan dan folder target'}
                {currentStep === 2 && 'Tinjau saran pemindahan berkas sebelum diterapkan (Safety First)'}
                {currentStep === 3 && 'Proses pemindahan selesai dengan catatan manifest rollback'}
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-[#7c8792] hover:text-[#f3f5f7] hover:bg-[#2a2f35] transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* STEP 2: TINJAU SARAN (TABLE) */}
        {currentStep === 2 && (
          <div className="flex-1 flex flex-col overflow-hidden">
            {/* If applying */}
            {isApplying && (
              <div className="p-3 bg-[#23272c] border-b border-[#333a42] flex items-center gap-3">
                <RotateCw className="w-4 h-4 text-[#8ab4f8] animate-spin" />
                <div className="flex-1">
                  <div className="text-xs font-semibold text-[#8ab4f8] mb-1">
                    Menerapkan pemindahan berkas... ({applyProgress}%)
                  </div>
                  <div className="h-1.5 bg-[#141619] rounded-full overflow-hidden">
                    <div
                      className="h-full bg-[#8ab4f8] transition-all duration-200"
                      style={{ width: `${applyProgress}%` }}
                    />
                  </div>
                </div>
              </div>
            )}

            {/* Table Header */}
            <div className="h-8 bg-[#191c20] border-b border-[#333a42] px-6 flex items-center text-xs font-semibold text-[#7c8792] shrink-0">
              <div className="w-8">
                <input
                  type="checkbox"
                  checked={suggestions.length > 0 && selectedCount === suggestions.length}
                  onChange={onSelectAllSuggestions}
                  className="rounded bg-[#23272c] border-[#454e58] text-[#8ab4f8] cursor-pointer"
                />
              </div>
              <div className="w-1/3 truncate">Asal Berkas</div>
              <div className="w-1/4 truncate">Tujuan Rekomendasi</div>
              <div className="flex-1 truncate">Alasan</div>
              <div className="w-20 text-center">Keyakinan</div>
            </div>

            {/* Table Body */}
            <div className="flex-1 overflow-y-auto divide-y divide-[#23272c] p-2">
              {suggestions.map((row) => (
                <div
                  key={row.id}
                  onClick={() => onToggleSuggestion(row.id)}
                  className={`h-11 px-4 flex items-center text-xs rounded-lg transition-colors cursor-pointer ${
                    row.selected ? 'bg-[#2c3a4d]/70 text-[#f3f5f7]' : 'hover:bg-[#23272c] text-[#b3bcc5]'
                  }`}
                >
                  <div className="w-8" onClick={(e) => e.stopPropagation()}>
                    <input
                      type="checkbox"
                      checked={row.selected}
                      onChange={() => onToggleSuggestion(row.id)}
                      className="rounded bg-[#23272c] border-[#454e58] text-[#8ab4f8] cursor-pointer"
                    />
                  </div>
                  <div className="w-1/3 truncate font-medium text-[#f3f5f7] pr-3 font-mono text-[11px]">
                    {row.fileName}
                  </div>
                  <div className="w-1/4 truncate text-[#8ab4f8] font-mono text-[11px] pr-3">
                    {row.targetFolder}
                    {row.hasConflict && (
                      <span className="ml-1 text-[#e0ab5c] text-[10px] font-sans">(Bentrok teratasi)</span>
                    )}
                  </div>
                  <div className="flex-1 truncate text-[#7c8792] pr-3 text-[11px]">
                    {row.reason}
                  </div>
                  <div className="w-20 flex justify-center">
                    {getConfidenceBadge(row.confidence)}
                  </div>
                </div>
              ))}
            </div>

            {/* Footer Actions */}
            <div className="px-6 py-3 border-t border-[#333a42] bg-[#191c20] flex items-center justify-between">
              <div className="text-xs text-[#b3bcc5]">
                <strong>{suggestions.length}</strong> saran ·{' '}
                <strong className="text-[#8ab4f8]">{selectedCount}</strong> dipilih
              </div>

              <div className="flex items-center gap-3">
                <button
                  onClick={onClose}
                  className="px-4 py-1.5 bg-[#23272c] hover:bg-[#2a2f35] border border-[#333a42] text-xs font-semibold text-[#b3bcc5] rounded transition-colors"
                >
                  Batal
                </button>
                <button
                  disabled={selectedCount === 0 || isApplying}
                  onClick={handleStartApplying}
                  className="px-5 py-1.5 bg-[#8ab4f8] hover:bg-[#6fa0ed] disabled:opacity-50 text-xs font-bold text-[#141619] rounded shadow-sm transition-colors flex items-center gap-2 cursor-pointer"
                >
                  <Play className="w-3.5 h-3.5 fill-[#141619]" />
                  <span>Terapkan ({selectedCount})</span>
                </button>
              </div>
            </div>
          </div>
        )}

        {/* STEP 3: SELESAI & KEMBALIKAN */}
        {currentStep === 3 && (
          <div className="p-8 flex flex-col items-center justify-center text-center">
            <div className="w-12 h-12 rounded-full bg-[#6fc48a]/20 text-[#6fc48a] flex items-center justify-center mb-3">
              <CheckCircle2 className="w-6 h-6" />
            </div>
            <h3 className="text-base font-bold text-[#f3f5f7] mb-1">
              Berkas Berhasil Dikelompokkan!
            </h3>
            <p className="text-xs text-[#b3bcc5] max-w-md mb-6">
              Semua berkas yang disetujui telah dipindahkan ke folder target masing-masing dengan catatan manifest tersimpan.
            </p>

            <div className="flex items-center gap-3">
              <button
                onClick={() => {
                  onUndoLastOperation();
                  alert('Perubahan telah dibatalkan & dikembalikan ke folder awal.');
                  onClose();
                }}
                className="px-4 py-2 bg-[#23272c] hover:bg-[#2a2f35] text-xs font-semibold text-[#e0ab5c] border border-[#333a42] rounded flex items-center gap-2 cursor-pointer"
              >
                <RotateCcw className="w-4 h-4" />
                <span>Kembalikan (Undo)</span>
              </button>

              <button
                onClick={onClose}
                className="px-5 py-2 bg-[#8ab4f8] hover:bg-[#6fa0ed] text-xs font-bold text-[#141619] rounded cursor-pointer"
              >
                Tutup
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
