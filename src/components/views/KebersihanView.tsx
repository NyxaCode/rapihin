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
  ChevronRight,
  Folder,
  FolderTree,
  PieChart,
  Layers,
} from 'lucide-react';
import { CategoryId, CleanlinessItem, FileItem, FolderNode } from '../../types';
import { CATEGORY_CONFIG } from '../../constants/tokens';
import { FilePreviewModal } from '../modals/FilePreviewModal';

interface KebersihanViewProps {
  cleanlinessItems: CleanlinessItem[];
  files?: FileItem[];
  folders?: FolderNode[];
  selectedFolder?: string;
  onSelectFolder?: (folderPath: string) => void;
  onResolveItem: (itemId: string) => void;
  onRefreshScan: () => void;
  onDeleteFile?: (fileId: string) => void;
}

export const KebersihanView: React.FC<KebersihanViewProps> = ({
  cleanlinessItems,
  files = [],
  folders = [],
  selectedFolder = 'D:\\Downloads',
  onSelectFolder,
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

  // Track which specific files are checked for deletion/cleaning: fileId -> boolean (default true)
  const [filesToDeleteSelection, setFilesToDeleteSelection] = useState<Record<string, boolean>>({});

  const isFileCheckedForDeletion = (fileId: string, defaultChecked = true): boolean => {
    if (filesToDeleteSelection[fileId] !== undefined) {
      return filesToDeleteSelection[fileId];
    }
    return defaultChecked;
  };

  const handleToggleDeleteFile = (fileId: string, defaultChecked = true) => {
    setFilesToDeleteSelection((prev) => {
      const current = prev[fileId] !== undefined ? prev[fileId] : defaultChecked;
      return {
        ...prev,
        [fileId]: !current,
      };
    });
  };

  // Select all or unselect all files for an item
  const handleToggleAllFilesForItem = (itemFiles: FileItem[], keptId?: string) => {
    const candidateFiles = keptId ? itemFiles.filter((f) => f.id !== keptId) : itemFiles;
    const allChecked = candidateFiles.every((f) => isFileCheckedForDeletion(f.id, true));
    setFilesToDeleteSelection((prev) => {
      const updated = { ...prev };
      candidateFiles.forEach((f) => {
        updated[f.id] = !allChecked;
      });
      return updated;
    });
  };

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

  // Format bytes helper for human-readable sizes
  const formatStorageBytes = (bytes: number): string => {
    if (bytes === 0) return '0 B';
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    if (bytes < 1024 * 1024 * 1024) return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
    return `${(bytes / (1024 * 1024 * 1024)).toFixed(2)} GB`;
  };

  // Storage breakdown detail dihitung 100% DINAMIS khusus untuk folder yang dipilih (selectedFolder)
  const storageBreakdown = useMemo(() => {
    // 1. Ambil berkas khusus yang ada di dalam selectedFolder
    const selLower = (selectedFolder || '').toLowerCase();
    const folderFiles = files.filter((f) => f.path.toLowerCase().startsWith(selLower));

    // 2. Total ukuran berkas dalam folder yang dipilih
    const totalFolderBytes = folderFiles.reduce((acc, f) => acc + f.size, 0);
    const totalFolderFormatted = formatStorageBytes(totalFolderBytes);

    // 3. Hitung bobot per Kategori Berkas di dalam folder ini
    const CATEGORY_ORDER: CategoryId[] = [
      'image',
      'video',
      'archive',
      'audio',
      'installer',
      'document',
      'code',
      'other',
    ];

    interface StorageCategoryItem {
      id: string;
      categoryKey: CategoryId;
      name: string;
      color: string;
      fileCount: number;
      sizeBytes: number;
      sizeFormatted: string;
      percentage: number; // Persentase bobot dalam folder ini
    }

    const categories: StorageCategoryItem[] = CATEGORY_ORDER.map((catKey) => {
      const catFiles = folderFiles.filter((f) => f.category === catKey);
      const sizeBytes = catFiles.reduce((acc, f) => acc + f.size, 0);
      const config = CATEGORY_CONFIG[catKey];
      const count = catFiles.length;
      const percentage = totalFolderBytes > 0 ? (sizeBytes / totalFolderBytes) * 100 : 0;

      return {
        id: catKey,
        categoryKey: catKey,
        name: config.label,
        color: config.color,
        fileCount: count,
        sizeBytes,
        sizeFormatted: formatStorageBytes(sizeBytes),
        percentage: Number(percentage.toFixed(1)),
      };
    }).filter((c) => c.sizeBytes > 0 || c.fileCount > 0);

    return {
      categories,
      totalFilesCount: folderFiles.length,
      totalFolderBytes,
      totalFolderFormatted,
    };
  }, [files, selectedFolder]);

  const handleResolveDuplicate = (item: CleanlinessItem) => {
    const keptId = keptFileIds[item.id] || item.files[0]?.id;
    // Only delete files that are NOT kept AND are checked!
    const toDelete = item.files.filter(
      (f) => f.id !== keptId && isFileCheckedForDeletion(f.id, true)
    );

    if (toDelete.length === 0) {
      alert('Tidak ada berkas salinan yang dicentang untuk dibuang.');
      return;
    }

    if (
      confirm(
        `Pertahankan berkas asli dan buang ${toDelete.length} berkas salinan yang dicentang ke Recycle Bin? (Berkas yang tidak dicentang tetap aman).`
      )
    ) {
      if (onDeleteFile) {
        toDelete.forEach((f) => onDeleteFile(f.id));
      }
      onResolveItem(item.id);
    }
  };

  const handleResolveGeneric = (item: CleanlinessItem) => {
    if (item.type === 'zero_byte') {
      const toDelete = item.files.filter((f) => isFileCheckedForDeletion(f.id, true));
      if (toDelete.length === 0) {
        alert('Tidak ada berkas kosong yang dicentang untuk dibersihkan.');
        return;
      }
      if (
        confirm(
          `Buang ${toDelete.length} berkas kosong yang dicentang ke Recycle Bin? (Berkas yang tidak dicentang tetap aman).`
        )
      ) {
        if (onDeleteFile) {
          toDelete.forEach((f) => onDeleteFile(f.id));
        }
        onResolveItem(item.id);
      }
    } else {
      if (confirm(`Bersihkan temuan: ${item.title}?`)) {
        onResolveItem(item.id);
      }
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

          {/* Main Workspace: Treemap Canvas in Center, Storage Anatomy on the Right */}
          <div className="flex-1 flex overflow-hidden">
            {/* SECTION TENGAH: Treemap Visual Canvas (Grid Tree Peta Ruang) */}
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

            {/* SISI KANAN: STORAGE ANATOMY KHUSUS FOLDER TERPILIH */}
            <div className="w-80 shrink-0 bg-[#191c20] border-l border-[#333a42] p-4 flex flex-col overflow-y-auto select-none">
              {/* 1. Header: Total Size dalam Folder yang Dipilih */}
              <div className="mb-3.5 pb-3 border-b border-[#333a42]">
                <div className="flex items-start justify-between">
                  <div className="min-w-0 flex-1">
                    <span className="text-[10px] uppercase font-bold tracking-wider text-[#7c8792] block">
                      Total Ukuran Folder
                    </span>
                    <div className="text-2xl font-bold tracking-tight text-[#f3f5f7] font-mono mt-0.5">
                      {storageBreakdown.totalFolderFormatted}
                    </div>
                  </div>

                  <div className="text-right shrink-0">
                    <span className="text-[10px] text-[#7c8792] block">Jumlah Berkas</span>
                    <span className="font-mono text-xs font-bold text-[#8ab4f8] bg-[#2c3a4d]/60 px-2 py-0.5 rounded border border-[#8ab4f8]/30">
                      {storageBreakdown.totalFilesCount} files
                    </span>
                  </div>
                </div>

                <div className="text-[11px] text-[#b3bcc5] flex items-center gap-1.5 mt-2 truncate font-mono bg-[#141619] px-2 py-1 rounded border border-[#2a2f35]" title={selectedFolder}>
                  <FolderOpen className="w-3.5 h-3.5 text-[#8ab4f8] shrink-0" />
                  <span className="truncate">{selectedFolder || 'D:\\Downloads'}</span>
                </div>
              </div>

              {/* 2. Storage Bar dengan Angka Persentase Bobot di Setiap Segmen */}
              <div className="space-y-1.5 mb-3.5">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-semibold text-[11px] text-[#7c8792] uppercase tracking-wider">
                    Bobot per Kategori
                  </span>
                  <span className="text-[10px] font-mono text-[#8ab4f8]">
                    {storageBreakdown.categories.length} tipe berkas
                  </span>
                </div>

                {/* Multi-segmented Progress Bar dengan Teks Persentase di Dalam Bar */}
                <div className="h-6 w-full bg-[#23272c] rounded-md overflow-hidden flex p-0.5 gap-0.5 shadow-inner border border-[#333a42]">
                  {storageBreakdown.categories.length === 0 ? (
                    <div className="w-full h-full flex items-center justify-center text-[10px] text-[#7c8792] font-mono">
                      Folder ini kosong
                    </div>
                  ) : (
                    storageBreakdown.categories.map((cat) => {
                      if (cat.percentage <= 0) return null;
                      const isFiltered = treemapCategory === cat.categoryKey;
                      const showLabel = cat.percentage >= 10;
                      return (
                        <div
                          key={cat.id}
                          onClick={() => {
                            setTreemapCategory(treemapCategory === cat.categoryKey ? 'all' : cat.categoryKey);
                          }}
                          style={{
                            width: `${cat.percentage}%`,
                            backgroundColor: cat.color,
                          }}
                          className={`h-full rounded-xs transition-all cursor-pointer hover:brightness-125 flex items-center justify-center px-0.5 overflow-hidden select-none relative group ${
                            isFiltered ? 'ring-2 ring-white z-10 brightness-125' : ''
                          }`}
                          title={`${cat.name}: ${cat.sizeFormatted} (${cat.percentage}% dari folder ini • ${cat.fileCount} berkas)`}
                        >
                          {showLabel ? (
                            <span className="text-[10px] font-bold font-mono text-[#141619] tracking-tight truncate drop-shadow-xs">
                              {Math.round(cat.percentage)}%
                            </span>
                          ) : (
                            <span className="opacity-0 group-hover:opacity-100 text-[8px] font-bold text-[#141619] font-mono">
                              {Math.round(cat.percentage)}%
                            </span>
                          )}
                        </div>
                      );
                    })
                  )}
                </div>

                <div className="flex items-center justify-between text-[10px] text-[#7c8792] font-mono">
                  <span>0%</span>
                  <span>Skala 100% Bobot Berkas</span>
                  <span>100%</span>
                </div>
              </div>

              {/* Filter Active Alert / Reset */}
              {treemapCategory !== 'all' && (
                <div className="mb-2.5 px-2.5 py-1.5 bg-[#2c3a4d]/70 border border-[#8ab4f8]/50 rounded-lg flex items-center justify-between text-xs animate-in fade-in">
                  <span className="text-[#8ab4f8] font-medium truncate text-[11px]">
                    Filter: {CATEGORY_CONFIG[treemapCategory]?.label}
                  </span>
                  <button
                    onClick={() => setTreemapCategory('all')}
                    className="text-[10px] text-[#f3f5f7] hover:underline cursor-pointer ml-2 shrink-0 font-semibold"
                  >
                    Tampilkan Semua
                  </button>
                </div>
              )}

              {/* 3. Daftar Kategori dalam Folder Ini */}
              <div className="flex-1 overflow-y-auto space-y-1 divide-y divide-[#23272c]/40 pr-0.5">
                {storageBreakdown.categories.length === 0 ? (
                  <div className="py-8 text-center text-[#7c8792] text-xs">
                    Tidak ada berkas di dalam folder ini.
                  </div>
                ) : (
                  storageBreakdown.categories.map((cat) => {
                    const isFiltered = treemapCategory === cat.categoryKey;
                    return (
                      <div
                        key={cat.id}
                        onClick={() => {
                          setTreemapCategory(treemapCategory === cat.categoryKey ? 'all' : cat.categoryKey);
                        }}
                        className={`flex items-center justify-between py-2 px-2.5 rounded-lg transition-colors cursor-pointer group ${
                          isFiltered
                            ? 'bg-[#2c3a4d] text-[#8ab4f8]'
                            : 'hover:bg-[#23272c] text-[#f3f5f7]'
                        }`}
                        title={`Klik untuk memfilter peta ruang ke kategori ${cat.name}`}
                      >
                        <div className="flex items-center gap-2.5 min-w-0">
                          <div
                            className="w-2.5 h-2.5 rounded-full shrink-0 shadow-xs"
                            style={{ backgroundColor: cat.color }}
                          />
                          <div className="min-w-0">
                            <span className="text-xs font-semibold truncate block">{cat.name}</span>
                            <span className="text-[10px] text-[#7c8792] block font-mono">
                              {cat.fileCount} berkas
                            </span>
                          </div>
                        </div>

                        <div className="flex items-center gap-2 shrink-0">
                          <span className="text-xs font-mono text-[#b3bcc5] tabular-nums font-semibold">
                            {cat.sizeFormatted}
                          </span>
                          <span className="px-1.5 py-0.5 rounded text-[10px] font-mono font-bold bg-[#141619] text-[#8ab4f8] border border-[#333a42] tabular-nums">
                            {cat.percentage}%
                          </span>
                          <ChevronRight className="w-3.5 h-3.5 text-[#7c8792] group-hover:text-[#f3f5f7] transition-colors" />
                        </div>
                      </div>
                    );
                  })
                )}
              </div>

              {/* Quick Action / Information Footer */}
              <div className="mt-auto pt-2.5 border-t border-[#333a42] text-[10px] text-[#7c8792] flex items-center justify-between">
                <span className="truncate">Klik kategori untuk filter peta ruang</span>
                {treemapCategory !== 'all' && (
                  <button
                    onClick={() => setTreemapCategory('all')}
                    className="text-[#8ab4f8] hover:underline cursor-pointer shrink-0 ml-1 font-semibold"
                  >
                    Reset Filter
                  </button>
                )}
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

                  {/* DUPLICATE FILES: format: asli / duplikat | tags | disimpan / di buang with checkbox */}
                  {item.type === 'duplicate' ? (() => {
                    const keptId = keptFileIds[item.id] || item.files[0]?.id;
                    const candidateFiles = item.files.filter((f) => f.id !== keptId);
                    const checkedCandidateCount = candidateFiles.filter((f) => isFileCheckedForDeletion(f.id, true)).length;
                    const skippedCount = candidateFiles.length - checkedCandidateCount;

                    return (
                      <div className="space-y-3 mb-3.5">
                        <div className="flex items-center justify-between text-[11px] text-[#7c8792] px-1">
                          <span>Centang berkas salinan yang ingin dibuang ke Recycle Bin. Berkas yang tidak dicentang tetap aman:</span>
                          <span className="font-mono text-[10px] text-[#8ab4f8]">
                            1 disimpan • {checkedCandidateCount} dicentang dibuang
                            {skippedCount > 0 && (
                              <span className="text-[#e0ab5c]"> • {skippedCount} dilewati (aman)</span>
                            )}
                          </span>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                          {item.files.map((f, idx) => {
                            const isKept = keptId === f.id;
                            const isDeleteChecked = isFileCheckedForDeletion(f.id, true);

                            return (
                              <div
                                key={f.id}
                                onClick={() => handleSetKeptFile(item.id, f.id)}
                                className={`p-3.5 rounded-xl border transition-all cursor-pointer flex flex-col justify-between select-none ${
                                  isKept
                                    ? 'bg-[#15281e] border-[#6fc48a] ring-1 ring-[#6fc48a]/60 shadow-md shadow-[#6fc48a]/10'
                                    : isDeleteChecked
                                    ? 'bg-[#141619] border-[#333a42] hover:border-[#e07e88]/60'
                                    : 'bg-[#141619]/60 border-[#2a2f35] opacity-80 hover:opacity-100'
                                }`}
                              >
                                <div>
                                  {/* 1. Header: asli / duplikat | tags | disimpan / di buang (dengan checkbox) */}
                                  <div className="flex items-center justify-between gap-2 pb-2 mb-2.5 border-b border-[#2a2f35] text-xs">
                                    {/* Sisi Kiri: asli / duplikat | tags */}
                                    <div className="flex items-center gap-2 min-w-0 flex-1">
                                      {/* asli / duplikat */}
                                      <span
                                        className={`font-bold text-xs flex items-center gap-1 shrink-0 ${
                                          isKept ? 'text-[#6fc48a]' : 'text-[#e0ab5c]'
                                        }`}
                                      >
                                        {isKept ? (
                                          <>
                                            <CheckCircle2 className="w-3.5 h-3.5 text-[#6fc48a]" />
                                            <span>Asli</span>
                                          </>
                                        ) : (
                                          <>
                                            <Copy className="w-3.5 h-3.5 text-[#e0ab5c]" />
                                            <span>Duplikat</span>
                                          </>
                                        )}
                                      </span>

                                      <span className="text-[#454e58] select-none font-light">|</span>

                                      {/* tags */}
                                      <div className="flex items-center gap-1 min-w-0 truncate text-[11px]">
                                        <span className="text-[#7c8792] shrink-0 font-medium">tags:</span>
                                        <span
                                          className="font-mono text-[#8ab4f8] truncate"
                                          title={f.tags?.join(', ') || 'tanpa tag'}
                                        >
                                          {f.tags && f.tags.length > 0
                                            ? f.tags.map((t) => (t.startsWith('#') ? t : `#${t}`)).join(' ')
                                            : 'tanpa tag'}
                                        </span>
                                      </div>
                                    </div>

                                    <span className="text-[#454e58] select-none font-light">|</span>

                                    {/* disimpan / di buang (dengan checkbox bila duplikat) */}
                                    <div className="shrink-0 flex items-center">
                                      {isKept ? (
                                        <span className="px-2 py-0.5 rounded text-[11px] font-bold flex items-center gap-1 bg-[#6fc48a]/20 text-[#6fc48a] border border-[#6fc48a]/40">
                                          <Check className="w-3 h-3 stroke-[2.5]" />
                                          <span>Disimpan</span>
                                        </span>
                                      ) : (
                                        <label
                                          onClick={(e) => e.stopPropagation()}
                                          className={`px-2 py-0.5 rounded text-[11px] font-bold flex items-center gap-1.5 cursor-pointer border transition-colors ${
                                            isDeleteChecked
                                              ? 'bg-[#e07e88]/20 text-[#e07e88] border-[#e07e88]/40 hover:bg-[#e07e88]/30'
                                              : 'bg-[#23272c] text-[#7c8792] border-[#333a42] hover:border-[#454e58]'
                                          }`}
                                          title={
                                            isDeleteChecked
                                              ? 'Dicentang: Berkas ini AKAN dibuang ke Recycle Bin. Klik untuk batal membuang.'
                                              : 'Tidak dicentang: Berkas ini TIDAK akan dibuang (dilewati). Klik untuk mencentang.'
                                          }
                                        >
                                          <input
                                            type="checkbox"
                                            checked={isDeleteChecked}
                                            onChange={(e) => {
                                              e.stopPropagation();
                                              handleToggleDeleteFile(f.id, true);
                                            }}
                                            className="w-3.5 h-3.5 rounded bg-[#141619] border-[#e07e88] text-[#e07e88] accent-[#e07e88] cursor-pointer"
                                          />
                                          <span>{isDeleteChecked ? 'Di buang' : 'Jangan buang'}</span>
                                        </label>
                                      )}
                                    </div>
                                  </div>

                                  {/* 2. Nama berkas dan ekstensi */}
                                  <div className="flex items-center gap-2 mb-2.5">
                                    <div
                                      className="font-semibold text-xs text-[#f3f5f7] truncate flex-1"
                                      title={f.name}
                                    >
                                      {f.name}
                                    </div>
                                    <span className="px-1.5 py-0.5 bg-[#23272c] border border-[#333a42] text-[10px] font-mono text-[#8ab4f8] uppercase rounded font-bold shrink-0">
                                      .{f.extension}
                                    </span>
                                  </div>

                                  {/* 3. Tabel: Ekstensi, Ukuran, Tanggal, Path */}
                                  <div className="rounded-lg border border-[#2a2f35] bg-[#191c20] overflow-hidden mb-3">
                                    <table className="w-full text-xs font-mono">
                                      <tbody className="divide-y divide-[#2a2f35]">
                                        <tr className="hover:bg-[#23272c]/30 transition-colors">
                                          <td className="py-1.5 px-2.5 text-[#7c8792] text-[11px] w-24 font-medium">Ekstensi</td>
                                          <td className="py-1.5 px-2.5 text-[#8ab4f8] font-bold">.{f.extension.toUpperCase()}</td>
                                        </tr>
                                        <tr className="hover:bg-[#23272c]/30 transition-colors">
                                          <td className="py-1.5 px-2.5 text-[#7c8792] text-[11px] font-medium">Ukuran</td>
                                          <td className="py-1.5 px-2.5 text-[#f3f5f7] font-semibold tabular-nums">{f.sizeFormatted}</td>
                                        </tr>
                                        <tr className="hover:bg-[#23272c]/30 transition-colors">
                                          <td className="py-1.5 px-2.5 text-[#7c8792] text-[11px] font-medium">Tanggal</td>
                                          <td className="py-1.5 px-2.5 text-[#b3bcc5]">{f.modifiedFormatted}</td>
                                        </tr>
                                        <tr className="hover:bg-[#23272c]/30 transition-colors">
                                          <td className="py-1.5 px-2.5 text-[#7c8792] text-[11px] font-medium align-top">Path</td>
                                          <td className="py-1.5 px-2.5 text-[#7c8792] text-[10px] break-all select-text leading-tight" title={f.path}>
                                            {f.path}
                                          </td>
                                        </tr>
                                      </tbody>
                                    </table>
                                  </div>
                                </div>

                                {/* Tombol Pertinjau */}
                                <button
                                  type="button"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    setPreviewingFile(f);
                                    setPreviewItemId(item.id);
                                  }}
                                  className="w-full h-7 rounded bg-[#23272c] hover:bg-[#2a2f35] border border-[#333a42] hover:border-[#8ab4f8] text-[#8ab4f8] text-xs font-medium flex items-center justify-center gap-1.5 transition-colors cursor-pointer shrink-0"
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
                    );
                  })() : (
                    /* Non-duplicate items like zero_byte or large_file with checkbox */
                    <div className="bg-[#141619] border border-[#333a42] rounded-lg p-2.5 mb-3 space-y-1.5 text-xs font-mono">
                      {item.files.map((f) => {
                        const isChecked = isFileCheckedForDeletion(f.id, true);
                        return (
                          <div key={f.id} className="flex items-center justify-between text-[#b3bcc5] py-1 border-b border-[#23272c] last:border-0">
                            <label
                              className="flex items-center gap-2.5 truncate pr-2 cursor-pointer select-none"
                              onClick={(e) => e.stopPropagation()}
                            >
                              <input
                                type="checkbox"
                                checked={isChecked}
                                onChange={() => handleToggleDeleteFile(f.id, true)}
                                className="w-3.5 h-3.5 rounded bg-[#23272c] border-[#454e58] text-[#e07e88] accent-[#e07e88] cursor-pointer"
                              />
                              <span className={`truncate ${isChecked ? 'text-[#f3f5f7]' : 'text-[#7c8792] line-through'}`}>
                                {f.name}
                              </span>
                              <span className="px-1 py-0.2 rounded bg-[#23272c] text-[10px] text-[#7c8792] uppercase">
                                .{f.extension}
                              </span>
                              {!isChecked && (
                                <span className="text-[10px] text-[#e0ab5c] font-sans font-medium">(Dilewati)</span>
                              )}
                            </label>
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
                        );
                      })}
                    </div>
                  )}

                  {/* Cleanliness Action Footer */}
                  {(() => {
                    const keptId = keptFileIds[item.id] || item.files[0]?.id;
                    const candidateFiles = item.files.filter((f) => f.id !== keptId);
                    const checkedCandidateCount = candidateFiles.filter((f) => isFileCheckedForDeletion(f.id, true)).length;
                    const checkedZeroByteCount = item.files.filter((f) => isFileCheckedForDeletion(f.id, true)).length;

                    const isDuplicate = item.type === 'duplicate';
                    const isZeroByte = item.type === 'zero_byte';
                    const isDisabled = (isDuplicate && checkedCandidateCount === 0) || (isZeroByte && checkedZeroByteCount === 0);

                    return (
                      <div className="flex items-center justify-between pt-2.5 border-t border-[#333a42]/60">
                        <div className="flex items-center gap-1.5 text-[11px] text-[#7c8792]">
                          <ShieldCheck className="w-3.5 h-3.5 text-[#6fc48a]" />
                          <span>
                            {isDuplicate
                              ? checkedCandidateCount > 0
                                ? `Hanya berkas salinan yang dicentang (${checkedCandidateCount} berkas) yang akan dikirim ke Recycle Bin.`
                                : 'Semua salinan dilewati (tidak ada yang akan dihapus).'
                              : isZeroByte
                              ? checkedZeroByteCount > 0
                                ? `Hanya ${checkedZeroByteCount} berkas kosong yang dicentang yang akan dikirim ke Recycle Bin.`
                                : 'Semua berkas dilewati (tidak ada yang akan dihapus).'
                              : 'Aman: Berkas dikirim ke Recycle Bin Windows (dapat dipulihkan).'}
                          </span>
                        </div>

                        <button
                          type="button"
                          disabled={isDisabled}
                          onClick={() => {
                            if (isDuplicate) {
                              handleResolveDuplicate(item);
                            } else {
                              handleResolveGeneric(item);
                            }
                          }}
                          className={`px-3.5 py-1.5 border rounded-lg text-xs font-medium transition-colors flex items-center gap-1.5 shadow-xs ${
                            isDisabled
                              ? 'bg-[#191c20] text-[#5a636d] border-[#2a2f35] cursor-not-allowed'
                              : 'bg-[#23272c] hover:bg-[#e07e88] hover:text-white border-[#333a42] text-[#f3f5f7] cursor-pointer'
                          }`}
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                          <span>
                            {isDuplicate
                              ? checkedCandidateCount > 0
                                ? `Buang ${checkedCandidateCount} Salinan Dicentang ke Recycle Bin`
                                : 'Tidak Ada yang Dicentang'
                              : isZeroByte
                              ? checkedZeroByteCount > 0
                                ? `Bersihkan ${checkedZeroByteCount} Berkas Kosong`
                                : 'Tidak Ada yang Dicentang'
                              : 'Pindahkan ke Arsip'}
                          </span>
                        </button>
                      </div>
                    );
                  })()}
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
