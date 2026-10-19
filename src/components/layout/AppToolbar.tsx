import React, { useState } from 'react';
import {
  Search,
  X,
  Play,
  RotateCw,
  Wand2,
  Cpu,
  ChevronDown,
  Sidebar as SidebarIcon,
  PanelRight,
  CheckCircle2,
  FolderPlus,
} from 'lucide-react';
import { ActiveArea, AiMode } from '../../types';

interface AppToolbarProps {
  activeArea: ActiveArea;
  searchQuery: string;
  onSearchChange: (query: string) => void;
  onOpenCommandPalette: () => void;
  aiMode: AiMode;
  onChangeAiMode: (mode: AiMode) => void;
  isScanning: boolean;
  scanProgress: number;
  onTriggerScan: () => void;
  onToggleSidebar: () => void;
  onToggleInspector: () => void;
  isSidebarOpen: boolean;
  isInspectorOpen: boolean;
  onStartRapikan: () => void;
}

export const AppToolbar: React.FC<AppToolbarProps> = ({
  activeArea,
  searchQuery,
  onSearchChange,
  onOpenCommandPalette,
  aiMode,
  onChangeAiMode,
  isScanning,
  scanProgress,
  onTriggerScan,
  onToggleSidebar,
  onToggleInspector,
  isSidebarOpen,
  isInspectorOpen,
  onStartRapikan,
}) => {
  const [showAiDropdown, setShowAiDropdown] = useState(false);

  const getAiModeLabel = (mode: AiMode) => {
    switch (mode) {
      case 'tanpa_ai':
        return 'Mode: Tanpa AI';
      case 'llm_lokal':
        return 'Mode: LLM Lokal';
      case 'byok_cloud':
        return 'Mode: BYOK Cloud';
    }
  };

  return (
    <div className="h-12 bg-[#1e2226] border-b border-[#333a42] px-3 flex items-center justify-between gap-3 shrink-0 z-30">
      {/* Left: View toggles & Search Input */}
      <div className="flex items-center gap-2 flex-1 max-w-xl">
        <button
          onClick={onToggleSidebar}
          className={`p-1.5 rounded hover:bg-[#2a2f35] transition-colors focus-ring ${
            isSidebarOpen ? 'text-[#8ab4f8]' : 'text-[#7c8792]'
          }`}
          title={isSidebarOpen ? 'Sembunyikan Sidebar' : 'Tampilkan Sidebar'}
          aria-label="Toggle Sidebar"
        >
          <SidebarIcon className="w-4 h-4" />
        </button>

        {/* Search bar with Ctrl+K shortcut affordance */}
        <div className="relative flex-1">
          <Search className="w-4 h-4 text-[#7c8792] absolute left-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            placeholder="Cari berkas, tag, atau ekstensi... (Ctrl+K)"
            className="w-full h-8 pl-8 pr-16 bg-[#23272c] hover:bg-[#2a2f35] focus:bg-[#23272c] border border-[#333a42] focus:border-[#8ab4f8] rounded-md text-xs text-[#f3f5f7] placeholder-[#7c8792] focus:outline-none transition-colors"
          />
          {searchQuery ? (
            <button
              onClick={() => onSearchChange('')}
              className="absolute right-2 top-1/2 -translate-y-1/2 p-0.5 rounded text-[#7c8792] hover:text-[#f3f5f7] hover:bg-[#31373e]"
              title="Bersihkan pencarian"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          ) : (
            <kbd
              onClick={onOpenCommandPalette}
              className="absolute right-2 top-1/2 -translate-y-1/2 px-1.5 py-0.5 text-[10px] font-mono text-[#7c8792] bg-[#141619] rounded border border-[#333a42] cursor-pointer hover:text-[#f3f5f7]"
            >
              Ctrl+K
            </kbd>
          )}
        </div>
      </div>

      {/* Middle: Scanning Progress (if active) */}
      {isScanning && (
        <div className="hidden md:flex items-center gap-2 px-2.5 py-1 bg-[#23272c] border border-[#333a42] rounded-md text-xs">
          <RotateCw className="w-3.5 h-3.5 text-[#8ab4f8] animate-spin" />
          <span className="text-[#b3bcc5] text-[11px]">Memindai berkas: {scanProgress}%</span>
          <div className="w-20 h-1.5 bg-[#141619] rounded-full overflow-hidden">
            <div
              className="h-full bg-[#8ab4f8] transition-all duration-200"
              style={{ width: `${scanProgress}%` }}
            />
          </div>
        </div>
      )}

      {/* Right: Actions, AI Mode switcher & Inspector Toggle */}
      <div className="flex items-center gap-2">
        {/* Contextual primary action */}
        {activeArea === 'perpustakaan' && (
          <button
            onClick={onTriggerScan}
            disabled={isScanning}
            className="h-8 px-3 rounded-md bg-[#23272c] hover:bg-[#2a2f35] text-[#f3f5f7] border border-[#333a42] text-xs font-medium flex items-center gap-1.5 transition-colors focus-ring cursor-pointer"
          >
            <FolderPlus className="w-3.5 h-3.5 text-[#8ab4f8]" />
            <span>Pindai Folder</span>
          </button>
        )}

        {activeArea === 'perpustakaan' && (
          <button
            onClick={onStartRapikan}
            className="h-8 px-3 rounded-md bg-[#8ab4f8] hover:bg-[#6fa0ed] text-[#141619] text-xs font-semibold flex items-center gap-1.5 transition-colors shadow-sm focus-ring cursor-pointer"
          >
            <Wand2 className="w-3.5 h-3.5" />
            <span>Rapikan</span>
          </button>
        )}

        {/* AI Mode Selector Dropdown */}
        <div className="relative">
          <button
            onClick={() => setShowAiDropdown(!showAiDropdown)}
            className="h-8 px-2.5 rounded-md bg-[#23272c] hover:bg-[#2a2f35] text-[#b3bcc5] hover:text-[#f3f5f7] border border-[#333a42] text-xs flex items-center gap-1.5 transition-colors focus-ring"
            title="Ganti Mode Kecerdasan"
          >
            <Cpu className="w-3.5 h-3.5 text-[#8ab4f8]" />
            <span className="font-mono text-[11px]">{getAiModeLabel(aiMode)}</span>
            <ChevronDown className="w-3 h-3 text-[#7c8792]" />
          </button>

          {showAiDropdown && (
            <div className="absolute right-0 top-full mt-1 w-64 bg-[#23272c] border border-[#333a42] rounded-md shadow-xl py-1 text-xs z-50">
              <div className="px-3 py-1.5 text-[10px] font-semibold uppercase tracking-wider text-[#7c8792] border-b border-[#333a42]">
                Pilihan Mode Kecerdasan
              </div>
              <button
                onClick={() => {
                  onChangeAiMode('tanpa_ai');
                  setShowAiDropdown(false);
                }}
                className={`w-full px-3 py-2 text-left flex items-start gap-2 hover:bg-[#2a2f35] transition-colors ${
                  aiMode === 'tanpa_ai' ? 'text-[#8ab4f8] bg-[#8ab4f8]/10' : 'text-[#f3f5f7]'
                }`}
              >
                <div className="pt-0.5">
                  {aiMode === 'tanpa_ai' ? <CheckCircle2 className="w-3.5 h-3.5" /> : <div className="w-3.5 h-3.5" />}
                </div>
                <div>
                  <div className="font-medium">Tanpa AI (Bawaan)</div>
                  <div className="text-[11px] text-[#7c8792]">Heuristik jenis berkas, tanggal & nama. Cepat & aman 100% offline.</div>
                </div>
              </button>

              <button
                onClick={() => {
                  onChangeAiMode('llm_lokal');
                  setShowAiDropdown(false);
                }}
                className={`w-full px-3 py-2 text-left flex items-start gap-2 hover:bg-[#2a2f35] transition-colors ${
                  aiMode === 'llm_lokal' ? 'text-[#8ab4f8] bg-[#8ab4f8]/10' : 'text-[#f3f5f7]'
                }`}
              >
                <div className="pt-0.5">
                  {aiMode === 'llm_lokal' ? <CheckCircle2 className="w-3.5 h-3.5" /> : <div className="w-3.5 h-3.5" />}
                </div>
                <div>
                  <div className="font-medium">LLM Lokal Ringan</div>
                  <div className="text-[11px] text-[#7c8792]">Model lokal (Ollama/GGUF) tanpa kirim data ke internet.</div>
                </div>
              </button>

              <button
                onClick={() => {
                  onChangeAiMode('byok_cloud');
                  setShowAiDropdown(false);
                }}
                className={`w-full px-3 py-2 text-left flex items-start gap-2 hover:bg-[#2a2f35] transition-colors ${
                  aiMode === 'byok_cloud' ? 'text-[#8ab4f8] bg-[#8ab4f8]/10' : 'text-[#f3f5f7]'
                }`}
              >
                <div className="pt-0.5">
                  {aiMode === 'byok_cloud' ? <CheckCircle2 className="w-3.5 h-3.5" /> : <div className="w-3.5 h-3.5" />}
                </div>
                <div>
                  <div className="font-medium">Layanan AI Anda (BYOK)</div>
                  <div className="text-[11px] text-[#7c8792]">Koneksi API provider kustom (Gemini / Claude / OpenAI).</div>
                </div>
              </button>
            </div>
          )}
        </div>

        {/* Inspector toggle */}
        <button
          onClick={onToggleInspector}
          className={`p-1.5 rounded hover:bg-[#2a2f35] transition-colors focus-ring ${
            isInspectorOpen ? 'text-[#8ab4f8]' : 'text-[#7c8792]'
          }`}
          title={isInspectorOpen ? 'Sembunyikan Panel Detail' : 'Tampilkan Panel Detail'}
          aria-label="Toggle Inspector"
        >
          <PanelRight className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};
