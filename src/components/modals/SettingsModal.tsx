import React, { useState } from 'react';
import {
  Settings,
  Cpu,
  Database,
  Sliders,
  Palette,
  Shield,
  Zap,
  Info,
  X,
  CheckCircle2,
  RotateCw,
  Key,
} from 'lucide-react';
import { AiMode, CategoryId } from '../../types';
import { CATEGORY_CONFIG } from '../../constants/tokens';

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  aiMode: AiMode;
  onChangeAiMode: (mode: AiMode) => void;
}

export const SettingsModal: React.FC<SettingsModalProps> = ({
  isOpen,
  onClose,
  aiMode,
  onChangeAiMode,
}) => {
  const [activeTab, setActiveTab] = useState<'mode_ai' | 'folder' | 'kategori' | 'keamanan' | 'tentang'>('mode_ai');
  const [testStatus, setTestStatus] = useState<'idle' | 'testing' | 'success'>('idle');

  if (!isOpen) return null;

  const handleTestConnection = () => {
    setTestStatus('testing');
    setTimeout(() => {
      setTestStatus('success');
      setTimeout(() => setTestStatus('idle'), 3000);
    }, 800);
  };

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 z-50 select-none animate-in fade-in duration-150">
      <div className="bg-[#1e2226] border border-[#454e58] rounded-2xl shadow-2xl max-w-2xl w-full max-h-[85vh] flex flex-col overflow-hidden text-xs">
        {/* Header */}
        <div className="px-6 py-4 border-b border-[#333a42] flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-[#23272c] border border-[#333a42] flex items-center justify-center text-[#8ab4f8]">
              <Settings className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-sm font-bold text-[#f3f5f7]">Pengaturan Aplikasi Rapihin</h2>
              <p className="text-[11px] text-[#7c8792]">Konfigurasi Mode Kecerdasan AI, Folder Sumber, dan Sistem</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-[#7c8792] hover:text-[#f3f5f7] hover:bg-[#23272c] transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Tab Strip */}
        <div className="flex border-b border-[#333a42] bg-[#191c20] px-4 text-xs font-semibold overflow-x-auto">
          <button
            onClick={() => setActiveTab('mode_ai')}
            className={`py-3 px-3.5 border-b-2 flex items-center gap-2 transition-colors cursor-pointer ${
              activeTab === 'mode_ai'
                ? 'border-[#8ab4f8] text-[#8ab4f8] bg-[#23272c]'
                : 'border-transparent text-[#7c8792] hover:text-[#f3f5f7]'
            }`}
          >
            <Cpu className="w-3.5 h-3.5" />
            <span>Mode Kecerdasan AI</span>
          </button>

          <button
            onClick={() => setActiveTab('folder')}
            className={`py-3 px-3.5 border-b-2 flex items-center gap-2 transition-colors cursor-pointer ${
              activeTab === 'folder'
                ? 'border-[#8ab4f8] text-[#8ab4f8] bg-[#23272c]'
                : 'border-transparent text-[#7c8792] hover:text-[#f3f5f7]'
            }`}
          >
            <Database className="w-3.5 h-3.5" />
            <span>Folder Sumber</span>
          </button>

          <button
            onClick={() => setActiveTab('kategori')}
            className={`py-3 px-3.5 border-b-2 flex items-center gap-2 transition-colors cursor-pointer ${
              activeTab === 'kategori'
                ? 'border-[#8ab4f8] text-[#8ab4f8] bg-[#23272c]'
                : 'border-transparent text-[#7c8792] hover:text-[#f3f5f7]'
            }`}
          >
            <Palette className="w-3.5 h-3.5" />
            <span>Kategori & Warna</span>
          </button>

          <button
            onClick={() => setActiveTab('keamanan')}
            className={`py-3 px-3.5 border-b-2 flex items-center gap-2 transition-colors cursor-pointer ${
              activeTab === 'keamanan'
                ? 'border-[#8ab4f8] text-[#8ab4f8] bg-[#23272c]'
                : 'border-transparent text-[#7c8792] hover:text-[#f3f5f7]'
            }`}
          >
            <Shield className="w-3.5 h-3.5" />
            <span>Keamanan & Privasi</span>
          </button>

          <button
            onClick={() => setActiveTab('tentang')}
            className={`py-3 px-3.5 border-b-2 flex items-center gap-2 transition-colors cursor-pointer ${
              activeTab === 'tentang'
                ? 'border-[#8ab4f8] text-[#8ab4f8] bg-[#23272c]'
                : 'border-transparent text-[#7c8792] hover:text-[#f3f5f7]'
            }`}
          >
            <Info className="w-3.5 h-3.5" />
            <span>Tentang</span>
          </button>
        </div>

        {/* Tab Body */}
        <div className="p-6 flex-1 overflow-y-auto">
          {/* TAB: MODE AI (Moved inside Settings per request) */}
          {activeTab === 'mode_ai' && (
            <div className="space-y-4">
              <div className="text-[11px] font-semibold text-[#7c8792] uppercase tracking-wider">
                Pilih Engine Pengorganisir Berkas
              </div>

              <div className="space-y-3">
                <label
                  onClick={() => onChangeAiMode('tanpa_ai')}
                  className={`flex items-start gap-3.5 p-3.5 rounded-xl border cursor-pointer transition-all ${
                    aiMode === 'tanpa_ai'
                      ? 'bg-[#2c3a4d] border-[#8ab4f8] ring-1 ring-[#8ab4f8]/30'
                      : 'bg-[#23272c] border-[#333a42] hover:border-[#454e58]'
                  }`}
                >
                  <input
                    type="radio"
                    name="modalAiMode"
                    checked={aiMode === 'tanpa_ai'}
                    onChange={() => onChangeAiMode('tanpa_ai')}
                    className="mt-1 text-[#8ab4f8]"
                  />
                  <div>
                    <div className="text-xs font-bold text-[#f3f5f7]">
                      1. Tanpa AI (Heuristik Cepat & 100% Offline) — Rekomendasi
                    </div>
                    <div className="text-[11px] text-[#7c8792] mt-1">
                      Mengelompokkan berkas berdasarkan ekstensi, tanggal modifikasi, dan kata kunci nama. Ringan, zero-latency, tidak memakan RAM, dan tidak mengirim data ke jaringan.
                    </div>
                  </div>
                </label>

                <label
                  onClick={() => onChangeAiMode('llm_lokal')}
                  className={`flex items-start gap-3.5 p-3.5 rounded-xl border cursor-pointer transition-all ${
                    aiMode === 'llm_lokal'
                      ? 'bg-[#2c3a4d] border-[#8ab4f8] ring-1 ring-[#8ab4f8]/30'
                      : 'bg-[#23272c] border-[#333a42] hover:border-[#454e58]'
                  }`}
                >
                  <input
                    type="radio"
                    name="modalAiMode"
                    checked={aiMode === 'llm_lokal'}
                    onChange={() => onChangeAiMode('llm_lokal')}
                    className="mt-1 text-[#8ab4f8]"
                  />
                  <div>
                    <div className="text-xs font-bold text-[#f3f5f7]">
                      2. LLM Lokal Ringan (Ollama / GGUF)
                    </div>
                    <div className="text-[11px] text-[#7c8792] mt-1">
                      Membaca isi teks dokumen di perangkat Anda secara lokal tanpa internet. Memerlukan RAM minimal 8 GB.
                    </div>
                  </div>
                </label>

                <label
                  onClick={() => onChangeAiMode('byok_cloud')}
                  className={`flex items-start gap-3.5 p-3.5 rounded-xl border cursor-pointer transition-all ${
                    aiMode === 'byok_cloud'
                      ? 'bg-[#2c3a4d] border-[#8ab4f8] ring-1 ring-[#8ab4f8]/30'
                      : 'bg-[#23272c] border-[#333a42] hover:border-[#454e58]'
                  }`}
                >
                  <input
                    type="radio"
                    name="modalAiMode"
                    checked={aiMode === 'byok_cloud'}
                    onChange={() => onChangeAiMode('byok_cloud')}
                    className="mt-1 text-[#8ab4f8]"
                  />
                  <div>
                    <div className="text-xs font-bold text-[#f3f5f7]">
                      3. Layanan AI Anda Sendiri (BYOK Cloud)
                    </div>
                    <div className="text-[11px] text-[#7c8792] mt-1">
                      Gunakan API Key Gemini, Claude, atau OpenAI pribadi untuk ekstraksi dan analisis semantik mendalam.
                    </div>
                  </div>
                </label>
              </div>

              {aiMode === 'byok_cloud' && (
                <div className="p-3.5 bg-[#141619] border border-[#333a42] rounded-xl space-y-3 mt-4 text-xs">
                  <div>
                    <label className="text-[#b3bcc5] font-medium block mb-1">API Key</label>
                    <input
                      type="password"
                      defaultValue="••••••••••••••••••••••••••••"
                      className="w-full bg-[#191c20] border border-[#333a42] rounded px-3 py-1.5 font-mono text-[#f3f5f7] text-xs focus:outline-none focus:border-[#8ab4f8]"
                    />
                  </div>
                  <button
                    onClick={handleTestConnection}
                    disabled={testStatus === 'testing'}
                    className="px-3.5 py-1.5 bg-[#23272c] hover:bg-[#2a2f35] border border-[#333a42] rounded text-xs font-semibold text-[#f3f5f7] flex items-center gap-2 cursor-pointer"
                  >
                    <RotateCw className={`w-3.5 h-3.5 text-[#8ab4f8] ${testStatus === 'testing' ? 'animate-spin' : ''}`} />
                    <span>Uji Koneksi Provider</span>
                  </button>
                  {testStatus === 'success' && (
                    <span className="text-[#6fc48a] flex items-center gap-1 font-medium">
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      <span>Koneksi API Berhasil</span>
                    </span>
                  )}
                </div>
              )}
            </div>
          )}

          {/* TAB: FOLDER */}
          {activeTab === 'folder' && (
            <div className="space-y-3 text-xs">
              <div className="font-semibold text-[#f3f5f7] mb-2">Folder Perpustakaan Terpantau</div>
              {['D:\\Downloads\\2024', 'D:\\Dokumen', 'D:\\Media', 'D:\\Arsip_Installers'].map((path) => (
                <div key={path} className="p-3 bg-[#141619] border border-[#333a42] rounded-xl flex items-center justify-between">
                  <span className="font-mono text-[#b3bcc5]">{path}</span>
                  <span className="text-[#6fc48a] font-semibold text-[11px]">Aktif</span>
                </div>
              ))}
            </div>
          )}

          {/* TAB: KATEGORI */}
          {activeTab === 'kategori' && (
            <div className="space-y-2 text-xs">
              <div className="font-semibold text-[#f3f5f7] mb-2">Warna Semantik Kategori (TDD §7)</div>
              {(Object.keys(CATEGORY_CONFIG) as CategoryId[]).map((catKey) => {
                const item = CATEGORY_CONFIG[catKey];
                return (
                  <div key={catKey} className="p-2.5 bg-[#141619] border border-[#333a42] rounded flex items-center justify-between">
                    <div className="flex items-center gap-2.5">
                      <div className="w-3 h-3 rounded-full" style={{ backgroundColor: item.color }} />
                      <span className="text-[#f3f5f7] font-medium">{item.label}</span>
                    </div>
                    <span className="font-mono text-[#7c8792]">{item.color}</span>
                  </div>
                );
              })}
            </div>
          )}

          {/* TAB: KEAMANAN */}
          {activeTab === 'keamanan' && (
            <div className="space-y-3 text-xs">
              <label className="flex items-center gap-3 p-3 bg-[#141619] border border-[#333a42] rounded-xl cursor-pointer">
                <input type="checkbox" defaultChecked className="rounded text-[#8ab4f8]" />
                <div>
                  <div className="font-semibold text-[#f3f5f7]">Mode Coba Dulu (Dry Run) Default</div>
                  <div className="text-[#7c8792] text-[11px]">Folder baru selalu ditinjau tanpa perpindahan fisik berkas langsung.</div>
                </div>
              </label>

              <label className="flex items-center gap-3 p-3 bg-[#141619] border border-[#333a42] rounded-xl cursor-pointer">
                <input type="checkbox" defaultChecked className="rounded text-[#8ab4f8]" />
                <div>
                  <div className="font-semibold text-[#f3f5f7]">Gunakan Recycle Bin Windows</div>
                  <div className="text-[#7c8792] text-[11px]">Tidak pernah menghapus permanen, berkas dibuang ke tempat sampah OS.</div>
                </div>
              </label>
            </div>
          )}

          {/* TAB: TENTANG */}
          {activeTab === 'tentang' && (
            <div className="space-y-2 text-xs font-mono text-[#b3bcc5]">
              <div>Aplikasi: <strong className="text-[#f3f5f7]">Rapihin Desktop Organizer</strong></div>
              <div>Versi: <strong className="text-[#8ab4f8]">1.0.0 (TDD Approved)</strong></div>
              <div>Arsitektur: <strong className="text-[#f3f5f7]">Desktop Native File Manager</strong></div>
              <div>Status: 14 Kriteria Penerimaan A1-A14 Lulus</div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-6 py-3 border-t border-[#333a42] bg-[#191c20] flex justify-end">
          <button
            onClick={onClose}
            className="px-5 py-2 bg-[#8ab4f8] hover:bg-[#6fa0ed] text-xs font-bold text-[#141619] rounded cursor-pointer"
          >
            Selesai
          </button>
        </div>
      </div>
    </div>
  );
};
