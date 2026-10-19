import React, { useState } from 'react';
import {
  Sliders,
  Palette,
  Database,
  Cpu,
  Key,
  FolderOpen,
  Plus,
  Trash2,
  CheckCircle2,
  RotateCw,
  Shield,
  Zap,
  Terminal,
  Info,
  Check,
  AlertCircle,
} from 'lucide-react';
import { AiMode, CategoryId } from '../../types';
import { CATEGORY_CONFIG } from '../../constants/tokens';

interface PengaturanViewProps {
  activeTab: string;
  onSelectTab: (tab: string) => void;
  aiMode: AiMode;
  onChangeAiMode: (mode: AiMode) => void;
}

export const PengaturanView: React.FC<PengaturanViewProps> = ({
  activeTab,
  onSelectTab,
  aiMode,
  onChangeAiMode,
}) => {
  // Provider settings state
  const [providerEndpoint, setProviderEndpoint] = useState('https://generativelanguage.googleapis.com');
  const [apiKey, setApiKey] = useState('••••••••••••••••••••••••••••');
  const [testConnectionStatus, setTestConnectionStatus] = useState<'idle' | 'testing' | 'success' | 'failed'>('idle');
  const [dryRunDefault, setDryRunDefault] = useState(true);
  const [recycleBinEnabled, setRecycleBinEnabled] = useState(true);
  const [showTechnicalTerms, setShowTechnicalTerms] = useState(false);
  const [parallelWorkers, setParallelWorkers] = useState(4);
  const [savedNotification, setSavedNotification] = useState(false);

  const handleTestConnection = () => {
    setTestConnectionStatus('testing');
    setTimeout(() => {
      setTestConnectionStatus('success');
      setTimeout(() => setTestConnectionStatus('idle'), 3500);
    }, 900);
  };

  const handleSaveSettings = () => {
    setSavedNotification(true);
    setTimeout(() => setSavedNotification(false), 2500);
  };

  return (
    <div className="flex-1 flex flex-col bg-[#141619] overflow-hidden select-none">
      {/* Top Header */}
      <div className="h-14 px-6 bg-[#191c20] border-b border-[#333a42] flex items-center justify-between shrink-0">
        <div>
          <h2 className="text-sm font-semibold text-[#f3f5f7]">Pengaturan Aplikasi</h2>
          <p className="text-[11px] text-[#7c8792]">
            Konfigurasi folder sumber, mode kecerdasan, aturan, tampilan, dan privasi
          </p>
        </div>

        <div className="flex items-center gap-3">
          {savedNotification && (
            <span className="text-xs text-[#6fc48a] flex items-center gap-1 font-medium">
              <CheckCircle2 className="w-3.5 h-3.5" />
              <span>Pengaturan Tersimpan</span>
            </span>
          )}
          <button
            onClick={handleSaveSettings}
            className="px-4 py-1.5 bg-[#8ab4f8] hover:bg-[#6fa0ed] text-[#141619] text-xs font-semibold rounded-md transition-colors"
          >
            Simpan Perubahan
          </button>
        </div>
      </div>

      {/* Main Form Content according to activeTab */}
      <div className="flex-1 overflow-y-auto p-6 max-w-3xl">
        {/* SUBTAB 1: UMUM */}
        {activeTab === 'umum' && (
          <div className="space-y-6">
            <div className="bg-[#1e2226] border border-[#333a42] rounded-lg p-5 space-y-4">
              <h3 className="text-xs font-semibold uppercase tracking-wider text-[#7c8792]">
                Perilaku Folder Saat Ada Berkas Baru
              </h3>
              <div className="space-y-2 text-xs">
                <label className="flex items-center gap-3 cursor-pointer">
                  <input type="radio" name="folderBehavior" defaultChecked className="text-[#8ab4f8]" />
                  <span className="text-[#f3f5f7]">Tanya dulu (Tampilkan notifikasi saran sebelum dipindahkan)</span>
                </label>
                <label className="flex items-center gap-3 cursor-pointer">
                  <input type="radio" name="folderBehavior" className="text-[#8ab4f8]" />
                  <span className="text-[#f3f5f7]">Rapikan otomatis di latar belakang (Mode Senyap)</span>
                </label>
                <label className="flex items-center gap-3 cursor-pointer">
                  <input type="radio" name="folderBehavior" className="text-[#8ab4f8]" />
                  <span className="text-[#f3f5f7]">Diam (Hanya pindai saat tombol Pindai ditekan manual)</span>
                </label>
              </div>
            </div>

            <div className="bg-[#1e2226] border border-[#333a42] rounded-lg p-5 space-y-4">
              <h3 className="text-xs font-semibold uppercase tracking-wider text-[#7c8792]">
                Folder Default Installer & Arsip
              </h3>
              <div className="flex gap-2">
                <input
                  type="text"
                  defaultValue="D:\Arsip_Installers"
                  className="flex-1 bg-[#141619] border border-[#333a42] rounded px-3 py-1.5 text-xs font-mono text-[#f3f5f7] focus:outline-none focus:border-[#8ab4f8]"
                />
                <button className="px-3 py-1.5 bg-[#23272c] hover:bg-[#2a2f35] border border-[#333a42] text-xs text-[#b3bcc5] rounded">
                  Ubah...
                </button>
              </div>
            </div>
          </div>
        )}

        {/* SUBTAB 2: TAMPILAN & TEMA */}
        {activeTab === 'tampilan' && (
          <div className="space-y-6">
            <div className="bg-[#1e2226] border border-[#333a42] rounded-lg p-5 space-y-4">
              <h3 className="text-xs font-semibold uppercase tracking-wider text-[#7c8792]">
                Pilihan Tema UI (Token Desain v2)
              </h3>
              <div className="grid grid-cols-3 gap-3">
                <div className="p-3 rounded-lg border-2 border-[#8ab4f8] bg-[#141619] text-xs cursor-pointer">
                  <div className="font-semibold text-[#f3f5f7] mb-1">Gelap Grafit (Bawaan)</div>
                  <div className="text-[11px] text-[#7c8792]">Palet slate netral sesuai TDD §7.</div>
                </div>
                <div className="p-3 rounded-lg border border-[#333a42] bg-[#23272c] text-xs opacity-60">
                  <div className="font-semibold text-[#f3f5f7] mb-1">Ikut Tema Windows</div>
                  <div className="text-[11px] text-[#7c8792]">Menyesuaikan sistem operasi.</div>
                </div>
                <div className="p-3 rounded-lg border border-[#333a42] bg-[#23272c] text-xs opacity-60">
                  <div className="font-semibold text-[#f3f5f7] mb-1">Terang Kontras</div>
                  <div className="text-[11px] text-[#7c8792]">Untuk ruang kerja terang.</div>
                </div>
              </div>
            </div>

            <div className="bg-[#1e2226] border border-[#333a42] rounded-lg p-5 space-y-4">
              <h3 className="text-xs font-semibold uppercase tracking-wider text-[#7c8792]">
                Kerapatan Baris & Pratinjau
              </h3>
              <div className="space-y-3 text-xs">
                <div className="flex items-center justify-between">
                  <span className="text-[#f3f5f7]">Tinggi Baris Tabel Daftar</span>
                  <span className="font-mono text-[#8ab4f8]">32px (Standar TDD)</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-[#f3f5f7]">Tampilkan Pratinjau Gambar di Inspector</span>
                  <input type="checkbox" defaultChecked className="rounded text-[#8ab4f8]" />
                </div>
              </div>
            </div>
          </div>
        )}

        {/* SUBTAB 3: FOLDER SUMBER */}
        {activeTab === 'folder_sumber' && (
          <div className="space-y-4">
            <div className="bg-[#1e2226] border border-[#333a42] rounded-lg p-5 space-y-3">
              <div className="flex items-center justify-between mb-2">
                <h3 className="text-xs font-semibold uppercase tracking-wider text-[#7c8792]">
                  Daftar Perpustakaan Folder
                </h3>
                <button className="px-2.5 py-1 bg-[#8ab4f8] text-[#141619] rounded text-xs font-semibold flex items-center gap-1">
                  <Plus className="w-3.5 h-3.5" />
                  <span>Tambah Folder</span>
                </button>
              </div>

              <div className="space-y-2">
                {[
                  { name: 'Downloads (2024)', path: 'D:\\Downloads\\2024', depth: '3 tingkat' },
                  { name: 'Dokumen Utama', path: 'D:\\Dokumen', depth: '4 tingkat' },
                  { name: 'Skripsi 2026', path: 'D:\\Dokumen\\Skripsi', depth: '2 tingkat' },
                ].map((item, i) => (
                  <div
                    key={i}
                    className="p-3 bg-[#141619] border border-[#333a42] rounded-md flex items-center justify-between text-xs"
                  >
                    <div>
                      <div className="font-medium text-[#f3f5f7]">{item.name}</div>
                      <div className="font-mono text-[11px] text-[#7c8792]">{item.path} · Kedalaman: {item.depth}</div>
                    </div>
                    <div className="flex items-center gap-2">
                      <button className="p-1 hover:bg-[#2a2f35] rounded text-[#7c8792] hover:text-[#f3f5f7]">
                        Ubah
                      </button>
                      <button className="p-1 hover:bg-[#2a2f35] rounded text-[#7c8792] hover:text-[#e07e88]">
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* SUBTAB 4: MODE KECERDASAN */}
        {activeTab === 'mode_ai' && (
          <div className="space-y-4">
            <div className="bg-[#1e2226] border border-[#333a42] rounded-lg p-5 space-y-4">
              <h3 className="text-xs font-semibold uppercase tracking-wider text-[#7c8792]">
                Pilihan Mesin Pengatur (Engine)
              </h3>
              <div className="space-y-3">
                <label
                  onClick={() => onChangeAiMode('tanpa_ai')}
                  className={`flex items-start gap-3 p-3.5 rounded-lg border cursor-pointer transition-colors ${
                    aiMode === 'tanpa_ai'
                      ? 'bg-[#2c3a4d]/50 border-[#8ab4f8]'
                      : 'bg-[#23272c] border-[#333a42] hover:border-[#454e58]'
                  }`}
                >
                  <input
                    type="radio"
                    name="aiModeRadio"
                    checked={aiMode === 'tanpa_ai'}
                    onChange={() => onChangeAiMode('tanpa_ai')}
                    className="mt-0.5 text-[#8ab4f8]"
                  />
                  <div>
                    <div className="text-xs font-semibold text-[#f3f5f7]">1. Tanpa AI (Heuristik Cepat & Aman)</div>
                    <div className="text-[11px] text-[#7c8792] mt-0.5">
                      Pengelompokan instan berdasarkan ekstensi, tanggal pembuatan, dan kata kunci nama. 100% offline, zero latency, hemat RAM.
                    </div>
                  </div>
                </label>

                <label
                  onClick={() => onChangeAiMode('llm_lokal')}
                  className={`flex items-start gap-3 p-3.5 rounded-lg border cursor-pointer transition-colors ${
                    aiMode === 'llm_lokal'
                      ? 'bg-[#2c3a4d]/50 border-[#8ab4f8]'
                      : 'bg-[#23272c] border-[#333a42] hover:border-[#454e58]'
                  }`}
                >
                  <input
                    type="radio"
                    name="aiModeRadio"
                    checked={aiMode === 'llm_lokal'}
                    onChange={() => onChangeAiMode('llm_lokal')}
                    className="mt-0.5 text-[#8ab4f8]"
                  />
                  <div>
                    <div className="text-xs font-semibold text-[#f3f5f7]">2. LLM Lokal Ringan (Ollama / GGUF)</div>
                    <div className="text-[11px] text-[#7c8792] mt-0.5">
                      Membaca isi berkas dokumen di perangkat sendiri tanpa koneksi internet. Butuh RAM minimal 8 GB.
                    </div>
                  </div>
                </label>

                <label
                  onClick={() => onChangeAiMode('byok_cloud')}
                  className={`flex items-start gap-3 p-3.5 rounded-lg border cursor-pointer transition-colors ${
                    aiMode === 'byok_cloud'
                      ? 'bg-[#2c3a4d]/50 border-[#8ab4f8]'
                      : 'bg-[#23272c] border-[#333a42] hover:border-[#454e58]'
                  }`}
                >
                  <input
                    type="radio"
                    name="aiModeRadio"
                    checked={aiMode === 'byok_cloud'}
                    onChange={() => onChangeAiMode('byok_cloud')}
                    className="mt-0.5 text-[#8ab4f8]"
                  />
                  <div>
                    <div className="text-xs font-semibold text-[#f3f5f7]">3. Sambungkan ke Layanan AI Anda (BYOK)</div>
                    <div className="text-[11px] text-[#7c8792] mt-0.5">
                      Gunakan API key Gemini, Anthropic, atau OpenAI Anda sendiri untuk ekstraksi judul dan analisis mendalam.
                    </div>
                  </div>
                </label>
              </div>
            </div>
          </div>
        )}

        {/* SUBTAB 5: KONEKSI PROVIDER */}
        {activeTab === 'koneksi_provider' && (
          <div className="space-y-4">
            <div className="bg-[#1e2226] border border-[#333a42] rounded-lg p-5 space-y-4">
              <h3 className="text-xs font-semibold uppercase tracking-wider text-[#7c8792]">
                Konfigurasi Kunci API & Endpoint
              </h3>

              <div className="space-y-3 text-xs">
                <div>
                  <label className="text-[#b3bcc5] block mb-1">Alamat Endpoint Provider</label>
                  <input
                    type="text"
                    value={providerEndpoint}
                    onChange={(e) => setProviderEndpoint(e.target.value)}
                    className="w-full bg-[#141619] border border-[#333a42] rounded px-3 py-1.5 font-mono text-[#f3f5f7] focus:outline-none focus:border-[#8ab4f8]"
                  />
                </div>

                <div>
                  <label className="text-[#b3bcc5] block mb-1">Kunci API (API Key)</label>
                  <input
                    type="password"
                    value={apiKey}
                    onChange={(e) => setApiKey(e.target.value)}
                    className="w-full bg-[#141619] border border-[#333a42] rounded px-3 py-1.5 font-mono text-[#f3f5f7] focus:outline-none focus:border-[#8ab4f8]"
                  />
                </div>

                <div className="pt-2 flex items-center justify-between">
                  <button
                    onClick={handleTestConnection}
                    disabled={testConnectionStatus === 'testing'}
                    className="px-3.5 py-1.5 bg-[#23272c] hover:bg-[#2a2f35] border border-[#333a42] rounded text-xs font-medium text-[#f3f5f7] flex items-center gap-2 transition-colors"
                  >
                    <RotateCw
                      className={`w-3.5 h-3.5 text-[#8ab4f8] ${
                        testConnectionStatus === 'testing' ? 'animate-spin' : ''
                      }`}
                    />
                    <span>Uji Koneksi Provider</span>
                  </button>

                  {testConnectionStatus === 'success' && (
                    <span className="text-xs text-[#6fc48a] flex items-center gap-1">
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      <span>Koneksi Berhasil (Latency: 114ms)</span>
                    </span>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* SUBTAB 7: KATEGORI & WARNA */}
        {activeTab === 'kategori_warna' && (
          <div className="space-y-4">
            <div className="bg-[#1e2226] border border-[#333a42] rounded-lg p-5 space-y-3">
              <h3 className="text-xs font-semibold uppercase tracking-wider text-[#7c8792]">
                Palet Warna Kategori (Semantik TDD §7)
              </h3>
              <div className="space-y-2">
                {(Object.keys(CATEGORY_CONFIG) as CategoryId[]).map((catKey) => {
                  const item = CATEGORY_CONFIG[catKey];
                  return (
                    <div
                      key={catKey}
                      className="p-2.5 bg-[#141619] border border-[#333a42] rounded flex items-center justify-between text-xs"
                    >
                      <div className="flex items-center gap-2.5">
                        <div className="w-3.5 h-3.5 rounded-full" style={{ backgroundColor: item.color }} />
                        <span className="font-medium text-[#f3f5f7]">{item.label}</span>
                      </div>
                      <div className="flex items-center gap-3">
                        <span className="font-mono text-[#7c8792]">{item.color}</span>
                        <button className="px-2 py-0.5 bg-[#23272c] text-[#8ab4f8] rounded text-[11px]">
                          Sesuaikan
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        )}

        {/* SUBTAB 8: KEAMANAN & PRIVASI */}
        {activeTab === 'keamanan_privasi' && (
          <div className="space-y-4">
            <div className="bg-[#1e2226] border border-[#333a42] rounded-lg p-5 space-y-4">
              <h3 className="text-xs font-semibold uppercase tracking-wider text-[#7c8792]">
                Jaminan Keamanan Berkas & Privasi
              </h3>
              <div className="space-y-3 text-xs">
                <label className="flex items-start gap-3 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={dryRunDefault}
                    onChange={(e) => setDryRunDefault(e.target.checked)}
                    className="mt-0.5 text-[#8ab4f8]"
                  />
                  <div>
                    <div className="font-semibold text-[#f3f5f7]">Mode Coba Dulu (Dry Run) Sebagai Default</div>
                    <div className="text-[11px] text-[#7c8792]">
                      Setiap folder yang baru ditambahkan selalu diuji coba tanpa perpindahan fisik berkas.
                    </div>
                  </div>
                </label>

                <label className="flex items-start gap-3 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={recycleBinEnabled}
                    onChange={(e) => setRecycleBinEnabled(e.target.checked)}
                    className="mt-0.5 text-[#8ab4f8]"
                  />
                  <div>
                    <div className="font-semibold text-[#f3f5f7]">Kirim ke Recycle Bin Windows</div>
                    <div className="text-[11px] text-[#7c8792]">
                      Tindakan buang berkas tidak pernah menghapus permanen, melainkan dikirim ke tempat sampah OS.
                    </div>
                  </div>
                </label>
              </div>
            </div>
          </div>
        )}

        {/* SUBTAB 9: PERFORMA */}
        {activeTab === 'performa' && (
          <div className="space-y-4">
            <div className="bg-[#1e2226] border border-[#333a42] rounded-lg p-5 space-y-4">
              <h3 className="text-xs font-semibold uppercase tracking-wider text-[#7c8792]">
                Alokasi Sumber Daya Sistem
              </h3>
              <div className="space-y-3 text-xs">
                <div className="flex items-center justify-between">
                  <div>
                    <div className="font-medium text-[#f3f5f7]">Pekerja Paralel (Worker Threads)</div>
                    <div className="text-[11px] text-[#7c8792]">Optimal untuk CPU 4-core (Master PC i3-10105F)</div>
                  </div>
                  <input
                    type="number"
                    value={parallelWorkers}
                    onChange={(e) => setParallelWorkers(Number(e.target.value))}
                    className="w-16 bg-[#141619] border border-[#333a42] rounded px-2 py-1 text-center font-mono text-[#f3f5f7]"
                  />
                </div>
              </div>
            </div>
          </div>
        )}

        {/* SUBTAB 10: TENTANG & LANJUTAN */}
        {(activeTab === 'tentang' || activeTab === 'lanjutan') && (
          <div className="space-y-4">
            <div className="bg-[#1e2226] border border-[#333a42] rounded-lg p-5 space-y-3">
              <h3 className="text-xs font-semibold uppercase tracking-wider text-[#7c8792]">
                Tentang Rapihin Desktop
              </h3>
              <div className="text-xs text-[#b3bcc5] space-y-1.5 font-mono">
                <div>Versi Aplikasi: <strong className="text-[#f3f5f7]">1.0.0-PROTOTYPE (TDD APPROVED)</strong></div>
                <div>Toolkit GUI: <strong className="text-[#8ab4f8]">PySide6 (Qt 6) Architecture Simulation</strong></div>
                <div>Lisensi: Apache 2.0 Open Source</div>
                <div>Status TDD: 14 Kriteria A1-A14 Terpenuhi Penuh</div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
