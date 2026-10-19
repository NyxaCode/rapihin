import React, { useState, useMemo } from 'react';
import {
  BrushCleaning,
  Copy,
  FileMinus,
  HardDrive,
  Trash2,
  CheckCircle2,
  RotateCw,
  FolderOpen,
  ShieldCheck,
  LayoutGrid,
  Filter,
  Eye,
  Check,
} from 'lucide-react';
import { CategoryId, CleanlinessItem, FileItem } from '../../types';
import { CATEGORY_CONFIG } from '../../constants/tokens';
import { FilePreviewModal } from '../modals/FilePreviewModal';

interface KebersihanViewProps {
  cleanlinessItems: CleanlinessItem[];
  files?: FileItem[];
  selectedFolder?: string;
  onResolveItem: (itemId: string) => void;
  onRefreshScan: () => void;
  onDeleteFile?: (fileId: string) => void;
}

export const KebersihanView: React.FC<KebersihanViewProps> = ({
  cleanlinessItems,
  files = [],
  selectedFolder = 'D:\\Downloads',
  onResolveItem,
  onRefreshScan,
  onDeleteFile,
}) => {
  // Mode: 'treemap' (Peta Ruang) or 'findings' (Temuan Kebersihan)
  const [viewMode, setViewMode] = useState<'treemap' | 'findings'>('findings');
  const [activeFindingsTab, setActiveFindingsTab] = useState<'all' | 'duplicate' | 'zero_byte' | 'large_file'>('all');
  const [treemapCategory, setTreemapCategory] = useState<CategoryId | 'all'>('all');
  const [selectedTreemapFileId, setSelectedTreemapFileId] = useState<string | null>(null);
  const [isScanning, setIsScanning] = useState(false);

  // Track which file is kept for each duplicate finding group: itemId -> keptFileId
  const [keptFileIds, setKeptFileIds] = useState<Record<string, string>>({});

  // File Preview Modal State
  const [previewingFile, setPreviewingFile] = useState<FileItem | null>(null);
  const [previewItemId, setPreviewItemId] = useState<string | null>(null);

  const filteredFindings =
    activeFindingsTab === 'all'
      ? cleanlinessItems
      : cleanlinessItems.filter((item) => item.type === activeFindingsTab);

  const handleScan = () => {
    setIsScanning(true);
    setTimeout(() => {
      setIsScanning(false);
      onRefreshScan();
    }, 700);
  };

  const handleSetKeptFile = (itemId: string, fileId: string) => {
    setKeptFileIds((prev) => ({
      ...prev,
      [itemId]: fileId,
    }));
  };

  const totalReclaimableBytes = cleanlinessItems.reduce((acc, i) => acc + i.size, 0);
  const totalReclaimableFormatted = (totalReclaimableBytes / (1024 * 1024 * 1024)).toFixed(2) + ' GB';

  // 1. Filter files based on the currently selected folder
  const folderFilteredFiles = useMemo(() => {
    if (!selectedFolder) return files;
    const selLower = selectedFolder.toLowerCase();
    const matched = files.filter((f) => f.path.toLowerCase().startsWith(selLower));
    return matched;
  }, [files, selectedFolder]);

  // 2. Filter files based on selected category (if any)
  const displayFiles = useMemo(() => {
    if (treemapCategory === 'all') return folderFilteredFiles;
    return folderFilteredFiles.filter((f) => f.category === treemapCategory);
  }, [folderFilteredFiles, treemapCategory]);

  // Calculate total size of files displayed in the treemap for the selected folder
  const totalFolderSizeBytes = displayFiles.reduce((acc, f) => acc + f.size, 0);
  const totalFolderSizeFormatted =
    totalFolderSizeBytes >= 1024 * 1024 * 1024
      ? (totalFolderSizeBytes / (1024 * 1024 * 1024)).toFixed(2) + ' GB'
      : (totalFolderSizeBytes / (1024 * 1024)).toFixed(1) + ' MB';

  // Treemap algorithm: calculate proportional areas for files in this folder
  const treemapItems = useMemo(() => {
    const totalBytes = displayFiles.reduce((acc, f) => acc + Math.max(f.size, 50000), 0) || 1;
    return displayFiles
      .map((f) => {
        const percentage = (Math.max(f.size, 50000) / totalBytes) * 100;
        return {
          ...f,
          percentage,
        };
      })
      .sort((a, b) => b.size - a.size);
  }, [displayFiles]);

  const selectedFile = useMemo(
    () => files.find((f) => f.id === selectedTreemapFileId) || null,
    [files, selectedTreemapFileId]
  );

  const handleResolveDuplicate = (item: CleanlinessItem) => {
    const keptId = keptFileIds[item.id] || item.files[0]?.id;
    const toDelete = item.files.filter((f) => f.id !== keptId);
    if (
      confirm(
        `Pertahankan berkas terpilih dan buang ${toDelete.length} berkas salinan ke Recycle Bin?`
      )
    ) {
      if (onDeleteFile) {
        toDelete.forEach((f) => onDeleteFile(f.id));
      }
      onResolveItem(item.id);
    }
  };

  const handleResolveGeneric = (item: CleanlinessItem) => {
    if (confirm(`Bersihkan temuan: ${item.title}?`)) {
      if (item.type === 'zero_byte' && onDeleteFile) {
        item.files.forEach((f) => onDeleteFile(f.id));
      }
      onResolveItem(item.id);
    }
  };

  return (
    <div className="flex-1 flex flex-col bg-[#141619] overflow-hidden select-none">
      {/* 1. Header Banner */}
      <div className="h-13 px-5 bg-[#191c20] border-b border-[#333a42] flex items-center justify-between shrink-0">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-[#8ab4f8]/20 flex items-center justify-center text-[#8ab4f8]">
            <BrushCleaning className="w-4 h-4" />
          </div>
          <div>
            <h2 className="text-sm font-semibold text-[#f3f5f7]">Clean up & Peta Ruang</h2>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <div className="text-right text-xs">
            <span className="text-[#7c8792]">Potensi Pemulihan: </span>
            <span className="font-bold font-mono text-[#8ab4f8]">{totalReclaimableFormatted}</span>
          </div>

          <button
            onClick={handleScan}
            disabled={isScanning}
            className="h-7 px-3 rounded-md bg-[#23272c] hover:bg-[#2a2f35] border border-[#333a42] text-xs font-medium text-[#f3f5f7] flex items-center gap-1.5 transition-colors focus-ring cursor-pointer"
          >
            <RotateCw className={`w-3 h-3 text-[#8ab4f8] ${isScanning ? 'animate-spin' : ''}`} />
            <span>Pindai Ulang</span>
          </button>
        </div>
      </div>

      {/* 2. Mode Switcher: Peta Ruang vs Temuan Kebersihan */}
      <div className="h-10 px-5 border-b border-[#333a42] bg-[#1e2226] flex items-center justify-between shrink-0">
        <div className="flex items-center p-0.5 bg-[#141619] border border-[#333a42] rounded-md">
          <button
            onClick={() => setViewMode('treemap')}
            className={`px-3 py-1 rounded text-xs flex items-center gap-1.5 transition-colors cursor-pointer ${
              viewMode === 'treemap'
                ? 'bg-[#2c3a4d] text-[#8ab4f8] font-semibold shadow-xs'
                : 'text-[#7c8792] hover:text-[#f3f5f7]'
            }`}
            title="Tampilan Peta Ruang"
          >
            <LayoutGrid className="w-3.5 h-3.5" />
            <span>Peta Ruang</span>
          </button>

          <button
            onClick={() => setViewMode('findings')}
            className={`px-3 py-1 rounded text-xs flex items-center gap-1.5 transition-colors cursor-pointer ${
              viewMode === 'findings'
                ? 'bg-[#2c3a4d] text-[#8ab4f8] font-semibold shadow-xs'
                : 'text-[#7c8792] hover:text-[#f3f5f7]'
            }`}
            title="Daftar Temuan Pembersihan"
          >
            <BrushCleaning className="w-3.5 h-3.5" />
            <span>Temuan Kebersihan ({cleanlinessItems.length})</span>
          </button>
        </div>

        {viewMode === 'findings' && (
          <div className="flex items-center gap-1 text-xs">
            <span className="text-[#7c8792]">Total Temuan:</span>
            <span className="font-mono font-bold text-[#f3f5f7]">{cleanlinessItems.length} item</span>
          </div>
        )}
      </div>

      {/* VIEW MODE 1: PETA RUANG (TREEMAP) */}
      {viewMode === 'treemap' && (
        <div className="flex-1 flex flex-col overflow-hidden">
          {/* Path Folder yang dipilih & Status: total : x gb | item : x files | filter */}
          <div className="h-9 px-4 border-b border-[#333a42] flex items-center justify-between gap-3 shrink-0 bg-[#191c20]/90">
            {/* Sisi Kiri: Path folder yang dipilih */}
            <div className="flex items-center gap-2 min-w-0 flex-1">
              <div className="flex items-center gap-2 px-2.5 py-1 bg-[#141619] border border-[#333a42] rounded text-xs font-mono min-w-0 max-w-xl shadow-xs">
                <FolderOpen className="w-3.5 h-3.5 text-[#8ab4f8] shrink-0" />
                <span className="truncate select-text text-[#f3f5f7] font-medium" title={selectedFolder}>
                  {selectedFolder || 'D:\\Downloads'}
                </span>
              </div>
            </div>

            {/* Sisi Kanan: total : x gb | item : x files | filter */}
            <div className="text-xs font-mono text-[#b3bcc5] flex items-center gap-2 shrink-0 select-none">
              <span className="font-semibold text-[#8ab4f8]">
                total : {totalFolderSizeFormatted}
              </span>
              <span className="text-[#454e58]">|</span>
              <span className="font-semibold text-[#f3f5f7]">
                item : {displayFiles.length} files
              </span>
              <span className="text-[#454e58]">|</span>
              <div className="flex items-center gap-1.5 bg-[#141619] border border-[#333a42] rounded px-2 py-0.5">
                <Filter className="w-3 h-3 text-[#7c8792]" />
                <select
                  value={treemapCategory}
                  onChange={(e) => setTreemapCategory(e.target.value as CategoryId | 'all')}
                  className="bg-transparent text-[11px] font-semibold text-[#f3f5f7] focus:outline-none cursor-pointer"
                >
                  <option value="all" className="bg-[#191c20]">Semua Filter</option>
                  {(Object.keys(CATEGORY_CONFIG) as CategoryId[]).map((cat) => (
                    <option key={cat} value={cat} className="bg-[#191c20]">
                      {CATEGORY_CONFIG[cat].label}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          {/* Treemap Visual Canvas */}
          <div className="flex-1 p-4 overflow-hidden flex flex-col">
            <div className="flex-1 bg-[#191c20] border border-[#333a42] rounded-lg p-2.5 flex flex-wrap gap-1.5 overflow-y-auto content-start">
              {treemapItems.length === 0 ? (
                <div className="w-full h-full flex flex-col items-center justify-center p-8 text-center text-[#7c8792]">
                  <FolderOpen className="w-8 h-8 mb-2 opacity-50" />
                  <p className="text-xs">Tidak ada berkas di folder ini yang sesuai dengan filter.</p>
                </div>
              ) : (
                treemapItems.map((item) => {
                  const isSelected = selectedTreemapFileId === item.id;
                  const config = CATEGORY_CONFIG[item.category];
                  const flexBasis = Math.max(item.percentage * 2.8, 12);

                  return (
                    <div
                      key={item.id}
                      onClick={() => setSelectedTreemapFileId(isSelected ? null : item.id)}
                      style={{
                        flexGrow: item.percentage,
                        flexBasis: `${flexBasis}%`,
                        minHeight: '74px',
                        backgroundColor: isSelected ? '#2c3a4d' : config.bgSoft,
                        borderColor: isSelected ? '#8ab4f8' : config.border,
                      }}
                      className={`border rounded-md p-2.5 transition-all cursor-pointer flex flex-col justify-between overflow-hidden relative group hover:brightness-110 shadow-xs ${
                        isSelected ? 'ring-2 ring-[#8ab4f8] shadow-lg' : ''
                      }`}
                      title={`${item.name}\nUkuran: ${item.sizeFormatted}\nKategori: ${config.label}\nJalur: ${item.path}`}
                    >
                      <div className="truncate text-xs font-semibold text-[#f3f5f7]">
                        {item.name}
                      </div>
                      <div className="flex items-center justify-between text-[10px] font-mono text-[#b3bcc5]">
                        <span className="font-bold">{item.sizeFormatted}</span>
                        <span
                          className="text-[9px] uppercase tracking-wider font-semibold"
                          style={{ color: config.color }}
                        >
                          {config.label}
                        </span>
                      </div>
                    </div>
                  );
                })
              )}
            </div>

            {/* Selected File Details / Quick Action Drawer */}
            {selectedFile && (
              <div className="mt-3 p-3 bg-[#1e2226] border border-[#8ab4f8]/50 rounded-lg flex items-center justify-between gap-4 text-xs animate-in fade-in slide-in-from-bottom-2">
                <div className="flex items-center gap-3 min-w-0">
                  <div
                    className="w-3 h-3 rounded-full shrink-0"
                    style={{ backgroundColor: CATEGORY_CONFIG[selectedFile.category].color }}
                  />
                  <div className="min-w-0">
                    <div className="font-semibold text-[#f3f5f7] truncate flex items-center gap-2">
                      <span>{selectedFile.name}</span>
                      <span className="text-[10px] font-mono px-1.5 py-0.2 bg-[#2a2f35] text-[#8ab4f8] rounded">
                        {selectedFile.sizeFormatted}
                      </span>
                    </div>
                    <div className="text-[11px] font-mono text-[#7c8792] truncate">
                      {selectedFile.path}
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-2 shrink-0">
                  {onDeleteFile && (
                    <button
                      onClick={() => {
                        if (confirm(`Kirim berkas ${selectedFile.name} ke Recycle Bin?`)) {
                          onDeleteFile(selectedFile.id);
                          setSelectedTreemapFileId(null);
                        }
                      }}
                      className="px-2.5 py-1 bg-[#23272c] hover:bg-[#e07e88] hover:text-white text-[#f3f5f7] border border-[#333a42] rounded text-xs transition-colors flex items-center gap-1.5 cursor-pointer"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                      <span>Hapus ke Recycle Bin</span>
                    </button>
                  )}
                  <button
                    onClick={() => setSelectedTreemapFileId(null)}
                    className="px-2 py-1 text-[#7c8792] hover:text-[#f3f5f7] text-xs cursor-pointer"
                  >
                    Tutup
                  </button>
                </div>
              </div>
            )}

            {/* Treemap Legend */}
            <div className="mt-2.5 pt-2 border-t border-[#333a42] flex items-center justify-between text-xs">
              <div className="flex items-center gap-3 flex-wrap">
                <span className="text-[#7c8792] text-[11px] font-medium">Legenda:</span>
                {(Object.keys(CATEGORY_CONFIG) as CategoryId[]).map((cat) => (
                  <div key={cat} className="flex items-center gap-1">
                    <div
                      className="w-2.5 h-2.5 rounded-sm"
                      style={{ backgroundColor: CATEGORY_CONFIG[cat].color }}
                    />
                    <span className="text-[11px] text-[#b3bcc5]">{CATEGORY_CONFIG[cat].label}</span>
                  </div>
                ))}
              </div>
              <div className="text-[11px] text-[#7c8792] hidden md:inline">
                Klik kotak = pilih detail berkas
              </div>
            </div>
          </div>
        </div>
      )}

      {/* VIEW MODE 2: TEMUAN KEBERSIHAN */}
      {viewMode === 'findings' && (
        <div className="flex-1 flex flex-col overflow-hidden">
          {/* Sub-Filter Tabs */}
          <div className="h-10 px-5 border-b border-[#333a42] bg-[#141619] flex items-center gap-2 shrink-0">
            <button
              onClick={() => setActiveFindingsTab('all')}
              className={`px-3 py-1 text-xs rounded transition-colors cursor-pointer ${
                activeFindingsTab === 'all'
                  ? 'bg-[#2c3a4d] text-[#8ab4f8] font-medium'
                  : 'text-[#7c8792] hover:text-[#f3f5f7]'
              }`}
            >
              Semua Temuan ({cleanlinessItems.length})
            </button>
            <button
              onClick={() => setActiveFindingsTab('duplicate')}
              className={`px-3 py-1 text-xs rounded transition-colors cursor-pointer ${
                activeFindingsTab === 'duplicate'
                  ? 'bg-[#2c3a4d] text-[#8ab4f8] font-medium'
                  : 'text-[#7c8792] hover:text-[#f3f5f7]'
              }`}
            >
              Berkas Kembar (Duplikat)
            </button>
            <button
              onClick={() => setActiveFindingsTab('zero_byte')}
              className={`px-3 py-1 text-xs rounded transition-colors cursor-pointer ${
                activeFindingsTab === 'zero_byte'
                  ? 'bg-[#2c3a4d] text-[#8ab4f8] font-medium'
                  : 'text-[#7c8792] hover:text-[#f3f5f7]'
              }`}
            >
              Berkas Kosong (0 Byte)
            </button>
            <button
              onClick={() => setActiveFindingsTab('large_file')}
              className={`px-3 py-1 text-xs rounded transition-colors cursor-pointer ${
                activeFindingsTab === 'large_file'
                  ? 'bg-[#2c3a4d] text-[#8ab4f8] font-medium'
                  : 'text-[#7c8792] hover:text-[#f3f5f7]'
              }`}
            >
              Berkas Raksasa (&gt; 500 MB)
            </button>
          </div>

          {/* Findings List */}
          <div className="flex-1 overflow-y-auto p-5 space-y-4">
            {filteredFindings.length === 0 ? (
              <div className="flex flex-col items-center justify-center p-12 text-center">
                <div className="w-12 h-12 rounded-full bg-[#6fc48a]/15 text-[#6fc48a] flex items-center justify-center mb-3">
                  <CheckCircle2 className="w-6 h-6" />
                </div>
                <h3 className="text-sm font-semibold text-[#f3f5f7] mb-1">
                  Tidak ada temuan berkas kembar atau berkas kosong.
                </h3>
                <p className="text-xs text-[#7c8792] max-w-sm">
                  Folder Anda sudah dalam kondisi bersih dan optimal.
                </p>
              </div>
            ) : (
              filteredFindings.map((item) => (
                <div
                  key={item.id}
                  className="p-4 bg-[#1e2226] border border-[#333a42] rounded-xl transition-colors hover:border-[#454e58] shadow-sm"
                >
                  {/* Item Header */}
                  <div className="flex items-start justify-between mb-3.5">
                    <div className="flex items-start gap-3">
                      <div className="p-2.5 rounded-lg bg-[#23272c] text-[#8ab4f8] mt-0.5 border border-[#333a42]">
                        {item.type === 'duplicate' ? (
                          <Copy className="w-4 h-4 text-[#8ab4f8]" />
                        ) : item.type === 'zero_byte' ? (
                          <FileMinus className="w-4 h-4 text-[#e07e88]" />
                        ) : (
                          <HardDrive className="w-4 h-4 text-[#e4b86a]" />
                        )}
                      </div>
                      <div>
                        <h3 className="text-xs font-semibold text-[#f3f5f7] flex items-center gap-2">
                          <span>{item.title}</span>
                          {item.type === 'duplicate' && (
                            <span className="px-1.5 py-0.2 bg-[#8ab4f8]/15 text-[#8ab4f8] rounded text-[10px] font-mono">
                              {item.files.length} Salinan Terdeteksi
                            </span>
                          )}
                        </h3>
                        <p className="text-[11px] text-[#b3bcc5] mt-0.5">{item.description}</p>
                      </div>
                    </div>

                    <div className="text-right">
                      <span className="font-mono text-xs font-bold text-[#8ab4f8] tabular-nums">
                        {item.sizeFormatted}
                      </span>
                    </div>
                  </div>

                  {/* DUPLICATE FILES GRID: User can choose which to keep, preview, and see details (Nama, Ekstensi, Size, Tanggal) */}
                  {item.type === 'duplicate' ? (
                    <div className="space-y-2 mb-3.5">
                      <div className="flex items-center justify-between text-[11px] text-[#7c8792] px-1">
                        <span>Pilih berkas yang ingin disimpan. Salinan lainnya akan dibuang:</span>
                        <span className="font-mono text-[10px] text-[#8ab4f8]">
                          1 berkas disimpan • {item.files.length - 1} salinan dibuang
                        </span>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        {item.files.map((f, idx) => {
                          const isKept = keptFileIds[item.id]
                            ? keptFileIds[item.id] === f.id
                            : idx === 0;

                          return (
                            <div
                              key={f.id}
                              onClick={() => handleSetKeptFile(item.id, f.id)}
                              className={`p-3 rounded-lg border transition-all cursor-pointer flex flex-col justify-between select-none ${
                                isKept
                                  ? 'bg-[#15281e] border-[#6fc48a] ring-1 ring-[#6fc48a]/60 shadow-md shadow-[#6fc48a]/10'
                                  : 'bg-[#141619] border-[#333a42] hover:border-[#454e58]'
                              }`}
                            >
                              {/* Top Bar: Badge & Selection Button */}
                              <div className="flex items-center justify-between gap-2 mb-2">
                                <div className="flex items-center gap-1.5">
                                  <span
                                    className={`px-2 py-0.5 rounded-full text-[10px] font-bold flex items-center gap-1 ${
                                      isKept
                                        ? 'bg-[#6fc48a]/20 text-[#6fc48a]'
                                        : 'bg-[#e07e88]/15 text-[#e07e88]'
                                    }`}
                                  >
                                    {isKept ? (
                                      <>
                                        <CheckCircle2 className="w-3 h-3" />
                                        <span>SIMPAN (ASLI)</span>
                                      </>
                                    ) : (
                                      <>
                                        <Trash2 className="w-3 h-3 text-[#e07e88]" />
                                        <span>DI BUANG</span>
                                      </>
                                    )}
                                  </span>
                                  {/* Ekstensi */}
                                  <span className="px-1.5 py-0.5 bg-[#23272c] border border-[#333a42] text-[10px] font-mono text-[#8ab4f8] uppercase rounded font-bold">
                                    .{f.extension}
                                  </span>
                                </div>

                                <button
                                  type="button"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    handleSetKeptFile(item.id, f.id);
                                  }}
                                  className={`px-2 py-0.5 rounded text-[11px] font-medium transition-colors flex items-center gap-1 cursor-pointer ${
                                    isKept
                                      ? 'bg-[#6fc48a] text-[#141619] font-bold shadow-xs'
                                      : 'bg-[#2a2f35] hover:bg-[#363d45] text-[#e07e88] hover:text-[#f3f5f7] border border-[#3d454f]'
                                  }`}
                                  title={isKept ? 'Berkas ini disimpan' : 'Klik untuk mengubah menjadi berkas yang disimpan'}
                                >
                                  {isKept ? (
                                    <>
                                      <Check className="w-3 h-3 stroke-[3]" />
                                      <span>Disimpan</span>
                                    </>
                                  ) : (
                                    <>
                                      <Trash2 className="w-3 h-3" />
                                      <span>Di buang</span>
                                    </>
                                  )}
                                </button>
                              </div>

                              {/* Detail Nama */}
                              <div
                                className="font-semibold text-xs text-[#f3f5f7] truncate mb-2"
                                title={f.name}
                              >
                                {f.name}
                              </div>

                              {/* Detail Grid: Size & Tanggal & Jalur */}
                              <div className="bg-[#191c20] rounded p-2.5 border border-[#2a2f35] space-y-1.5 text-xs font-mono mb-2.5">
                                <div className="flex items-center justify-between text-[#b3bcc5]">
                                  <span className="text-[#7c8792] text-[11px]">Ukuran:</span>
                                  <span className="font-bold text-[#f3f5f7]">{f.sizeFormatted}</span>
                                </div>
                                <div className="flex items-center justify-between text-[#b3bcc5]">
                                  <span className="text-[#7c8792] text-[11px]">Tanggal:</span>
                                  <span>{f.modifiedFormatted}</span>
                                </div>
                                <div
                                  className="pt-1 border-t border-[#2a2f35]/60 text-[10px] text-[#7c8792] truncate"
                                  title={f.path}
                                >
                                  <span className="text-[#5a636d]">Jalur: </span>
                                  {f.path}
                                </div>
                              </div>

                              {/* Button Pertinjau */}
                              <button
                                type="button"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  setPreviewingFile(f);
                                  setPreviewItemId(item.id);
                                }}
                                className="w-full h-7 rounded bg-[#23272c] hover:bg-[#2a2f35] border border-[#333a42] hover:border-[#8ab4f8] text-[#8ab4f8] text-xs font-medium flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
                                title="Buka pratinjau berkas"
                              >
                                <Eye className="w-3.5 h-3.5" />
                                <span>Pertinjau</span>
                              </button>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  ) : (
                    /* Non-duplicate items like zero_byte or large_file */
                    <div className="bg-[#141619] border border-[#333a42] rounded-lg p-2.5 mb-3 space-y-1.5 text-xs font-mono">
                      {item.files.map((f) => (
                        <div key={f.id} className="flex items-center justify-between text-[#b3bcc5] py-0.5">
                          <div className="flex items-center gap-2 truncate pr-2">
                            <span className="truncate text-[#f3f5f7]">{f.name}</span>
                            <span className="px-1 py-0.2 rounded bg-[#23272c] text-[10px] text-[#7c8792] uppercase">
                              .{f.extension}
                            </span>
                          </div>
                          <div className="flex items-center gap-3 shrink-0 text-[11px] text-[#7c8792]">
                            <span className="font-bold">{f.sizeFormatted}</span>
                            <span>{f.modifiedFormatted}</span>
                            <button
                              type="button"
                              onClick={() => {
                                setPreviewingFile(f);
                                setPreviewItemId(item.id);
                              }}
                              className="px-2 py-0.5 rounded bg-[#23272c] hover:bg-[#2a2f35] text-[#8ab4f8] border border-[#333a42] flex items-center gap-1 cursor-pointer"
                              title="Pertinjau berkas"
                            >
                              <Eye className="w-3 h-3" />
                              <span>Pertinjau</span>
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}

                  {/* Cleanliness Action Footer */}
                  <div className="flex items-center justify-between pt-2.5 border-t border-[#333a42]/60">
                    <div className="flex items-center gap-1.5 text-[11px] text-[#7c8792]">
                      <ShieldCheck className="w-3.5 h-3.5 text-[#6fc48a]" />
                      <span>
                        {item.type === 'duplicate'
                          ? 'Berkas yang dipilih akan dipertahankan; salinan dikirim ke Recycle Bin.'
                          : 'Aman: Berkas dikirim ke Recycle Bin Windows (dapat dipulihkan).'}
                      </span>
                    </div>

                    <button
                      type="button"
                      onClick={() => {
                        if (item.type === 'duplicate') {
                          handleResolveDuplicate(item);
                        } else {
                          handleResolveGeneric(item);
                        }
                      }}
                      className="px-3.5 py-1.5 bg-[#23272c] hover:bg-[#e07e88] hover:text-white border border-[#333a42] text-xs font-medium text-[#f3f5f7] rounded-lg transition-colors flex items-center gap-1.5 cursor-pointer shadow-xs"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                      <span>
                        {item.type === 'duplicate'
                          ? 'Buang Salinan ke Recycle Bin'
                          : item.type === 'zero_byte'
                          ? 'Bersihkan Berkas Kosong'
                          : 'Pindahkan ke Arsip'}
                      </span>
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      )}

      {/* File Preview Modal */}
      <FilePreviewModal
        isOpen={!!previewingFile}
        file={previewingFile}
        onClose={() => {
          setPreviewingFile(null);
          setPreviewItemId(null);
        }}
        isKept={
          previewingFile && previewItemId
            ? keptFileIds[previewItemId]
              ? keptFileIds[previewItemId] === previewingFile.id
              : previewingFile.id === cleanlinessItems.find((i) => i.id === previewItemId)?.files[0]?.id
            : undefined
        }
        onMarkAsKept={
          previewingFile && previewItemId
            ? () => handleSetKeptFile(previewItemId, previewingFile.id)
            : undefined
        }
      />
    </div>
  );
};
