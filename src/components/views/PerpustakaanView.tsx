import React, { useState, useMemo } from 'react';
import {
  List,
  Grid,
  ArrowUpDown,
  Filter,
  FileText,
  Image as ImageIcon,
  Video,
  Music,
  Archive,
  Package,
  Code2,
  File,
  FolderOpen,
  Folder,
  Trash2,
  Edit2,
  Star,
  ExternalLink,
} from 'lucide-react';
import { CategoryId, FileItem, ScreenState, ViewMode } from '../../types';
import { CATEGORY_CONFIG } from '../../constants/tokens';

interface PerpustakaanViewProps {
  files: FileItem[];
  folderCount?: number;
  selectedFileIds: string[];
  onToggleSelectFile: (fileId: string, isShiftOrCtrl?: boolean) => void;
  onSelectAllFiles: () => void;
  onClearSelection: () => void;
  viewMode: ViewMode;
  onChangeViewMode: (mode: ViewMode) => void;
  currentPath: string;
  screenState: ScreenState;
  onRetry: () => void;
  onStartRapikanSelected: () => void;
  onDeleteSelected: () => void;
  onToggleHistoryGraph?: () => void;
  isHistoryGraphOpen?: boolean;
  onToggleSidebar?: () => void;
  isSidebarOpen?: boolean;
  onToggleInspector?: () => void;
  isInspectorOpen?: boolean;
}

export const PerpustakaanView: React.FC<PerpustakaanViewProps> = ({
  files,
  folderCount = 5,
  selectedFileIds,
  onToggleSelectFile,
  onSelectAllFiles,
  onClearSelection,
  viewMode,
  onChangeViewMode,
  currentPath,
  screenState,
  onRetry,
  onStartRapikanSelected,
  onDeleteSelected,
}) => {
  const [sortField, setSortField] = useState<'name' | 'size' | 'modified' | 'category'>('name');
  const [sortAsc, setSortAsc] = useState(true);
  const [filterCategory, setFilterCategory] = useState<CategoryId | 'all'>('all');
  const [contextMenu, setContextMenu] = useState<{ x: number; y: number; file: FileItem } | null>(null);

  const handleSort = (field: 'name' | 'size' | 'modified' | 'category') => {
    if (sortField === field) {
      setSortAsc(!sortAsc);
    } else {
      setSortField(field);
      setSortAsc(true);
    }
  };

  const filteredAndSortedFiles = useMemo(() => {
    let result = [...files];
    if (filterCategory !== 'all') {
      result = result.filter((f) => f.category === filterCategory);
    }
    result.sort((a, b) => {
      let comparison = 0;
      if (sortField === 'name') {
        comparison = a.name.localeCompare(b.name);
      } else if (sortField === 'size') {
        comparison = a.size - b.size;
      } else if (sortField === 'modified') {
        comparison = new Date(b.modified).getTime() - new Date(a.modified).getTime();
      } else if (sortField === 'category') {
        comparison = a.category.localeCompare(b.category);
      }
      return sortAsc ? comparison : -comparison;
    });
    return result;
  }, [files, filterCategory, sortField, sortAsc]);

  const handleContextMenu = (e: React.MouseEvent, file: FileItem) => {
    e.preventDefault();
    setContextMenu({
      x: Math.min(e.clientX, window.innerWidth - 200),
      y: Math.min(e.clientY, window.innerHeight - 240),
      file,
    });
  };

  // Close context menu on outside click
  React.useEffect(() => {
    const handleClose = () => setContextMenu(null);
    window.addEventListener('click', handleClose);
    return () => window.removeEventListener('click', handleClose);
  }, []);

  const renderFileIcon = (cat: CategoryId) => {
    switch (cat) {
      case 'document':
        return <FileText className="w-8 h-8 text-[#60a5fa]" />;
      case 'image':
        return <ImageIcon className="w-8 h-8 text-[#b49bea]" />;
      case 'video':
        return <Video className="w-8 h-8 text-[#f87171]" />;
      case 'audio':
        return <Music className="w-8 h-8 text-[#34d399]" />;
      case 'archive':
        return <Archive className="w-8 h-8 text-[#e5ac38]" />;
      case 'installer':
        return <Package className="w-8 h-8 text-[#fb923c]" />;
      case 'code':
        return <Code2 className="w-8 h-8 text-[#38bdf8]" />;
      default:
        return <File className="w-8 h-8 text-[#9ea5b1]" />;
    }
  };

  // Loading skeleton
  if (screenState === 'loading') {
    return (
      <div className="flex-1 flex flex-col p-4 bg-[#0d0f12] overflow-hidden select-none">
        <div className="h-8 flex items-center justify-between mb-4">
          <div className="h-4 w-48 bg-[#181c23] rounded-lg animate-pulse" />
          <div className="h-8 w-32 bg-[#181c23] rounded-lg animate-pulse" />
        </div>
        <div className="space-y-1.5 flex-1">
          {Array.from({ length: 8 }).map((_, i) => (
            <div
              key={i}
              className="h-9 bg-[#13161c] border border-white/5 rounded-xl px-3 flex items-center justify-between animate-pulse"
            >
              <div className="flex items-center gap-3">
                <div className="w-4 h-4 bg-[#1e2229] rounded" />
                <div className="w-56 h-3 bg-[#1e2229] rounded" />
              </div>
              <div className="flex items-center gap-6">
                <div className="w-16 h-3 bg-[#1e2229] rounded" />
                <div className="w-20 h-3 bg-[#1e2229] rounded" />
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  // Empty state
  if (screenState === 'empty') {
    return (
      <div className="flex-1 flex flex-col items-center justify-center p-8 bg-[#0d0f12] text-center select-none">
        <div className="w-16 h-16 rounded-2xl bg-[#13161c] border border-white/8 flex items-center justify-center text-[#e5ac38] mb-3 shadow-[inset_0_1px_3px_rgba(0,0,0,0.6)]">
          <FolderOpen className="w-8 h-8 fill-[#e5ac38]/20" />
        </div>
        <h3 className="text-sm font-bold text-[#f5f7fa] mb-1">
          Folder ini kosong atau semua berkas dikecualikan.
        </h3>
        <p className="text-xs text-[#616875] max-w-sm mb-4">
          Tidak ada berkas yang ditemukan dalam direktori ini sesuai dengan kriteria filter saat ini.
        </p>
        <button
          onClick={onRetry}
          className="px-4 py-2 bg-[#1e2229] hover:bg-[#252a33] border border-white/10 text-xs text-[#f5f7fa] font-bold rounded-xl transition-all cursor-pointer shadow-xs"
        >
          Muat Ulang Berkas
        </button>
      </div>
    );
  }

  const allSelected = filteredAndSortedFiles.length > 0 && selectedFileIds.length === filteredAndSortedFiles.length;

  return (
    <div className="flex-1 flex flex-col bg-[#0d0f12] overflow-hidden select-none relative">
      {/* 1. Header: Folder Path di kiri & Status Item di kanan */}
      <div className="h-10 px-4 border-b border-[#20242c] flex items-center justify-between gap-4 shrink-0 bg-[#111318]/90">
        {/* Folder Path Address Bar */}
        <div className="flex items-center gap-2 min-w-0 flex-1">
          <div className="flex items-center gap-2 px-3 py-1 bg-[#101217] border border-white/6 rounded-xl text-xs font-mono min-w-0 max-w-xl shadow-[inset_0_1px_3px_rgba(0,0,0,0.5)]">
            <FolderOpen className="w-3.5 h-3.5 text-[#e5ac38] fill-[#e5ac38]/20 shrink-0" />
            <span className="truncate select-text text-[#f5f7fa] font-semibold" title={currentPath}>
              {currentPath || 'D:\\Downloads\\2026'}
            </span>
          </div>
        </div>

        {/* Status Item */}
        <div className="text-xs font-mono text-[#8a919e] flex items-center gap-2 shrink-0 select-none">
          <span className="font-semibold text-[#e5ac38]">folder: {folderCount} Item</span>
          <span className="text-[#2c323e]">|</span>
          <span className="font-semibold text-[#f5f7fa]">file: {filteredAndSortedFiles.length} item</span>
        </div>
      </div>

      {/* 2. Center Navbar: View Switcher (Daftar / Grid) & Category Filter */}
      <div className="h-11 px-4 border-b border-[#20242c] bg-[#14171d] flex items-center justify-between shrink-0">
        {/* Left/Center: View Switcher with AeroBox Tactile Styling */}
        <div className="flex items-center p-0.5 bg-[#101217] border border-white/6 rounded-xl shadow-[inset_0_1px_3px_rgba(0,0,0,0.5)]">
          <button
            onClick={() => onChangeViewMode('list')}
            className={`px-3 py-1 rounded-lg text-xs flex items-center gap-1.5 transition-all cursor-pointer ${
              viewMode === 'list'
                ? 'bg-[#1e2229] text-white font-bold border border-white/10 shadow-[inset_0_1px_0_0_rgba(255,255,255,0.08),0_1px_4px_rgba(0,0,0,0.4)]'
                : 'text-[#616875] hover:text-[#f5f7fa]'
            }`}
            title="Tampilan Tabel Berkas (Daftar)"
          >
            <List className="w-3.5 h-3.5" />
            <span>Daftar</span>
          </button>
          <button
            onClick={() => onChangeViewMode('grid')}
            className={`px-3 py-1 rounded-lg text-xs flex items-center gap-1.5 transition-all cursor-pointer ${
              viewMode === 'grid'
                ? 'bg-[#1e2229] text-white font-bold border border-white/10 shadow-[inset_0_1px_0_0_rgba(255,255,255,0.08),0_1px_4px_rgba(0,0,0,0.4)]'
                : 'text-[#616875] hover:text-[#f5f7fa]'
            }`}
            title="Tampilan Kartu Thumbnail (Grid)"
          >
            <Grid className="w-3.5 h-3.5" />
            <span>Grid</span>
          </button>
        </div>

        {/* Far Right: Category Filter */}
        <div className="flex items-center gap-2">
          <span className="text-[11px] text-[#616875] font-semibold hidden sm:inline uppercase tracking-wider">Kategori:</span>
          <div className="flex items-center gap-1.5 bg-[#101217] border border-white/6 rounded-xl px-2.5 py-1 shadow-[inset_0_1px_3px_rgba(0,0,0,0.5)]">
            <Filter className="w-3.5 h-3.5 text-[#0a84ff]" />
            <select
              value={filterCategory}
              onChange={(e) => setFilterCategory(e.target.value as CategoryId | 'all')}
              className="bg-transparent text-xs font-semibold text-[#f5f7fa] focus:outline-hidden cursor-pointer"
            >
              <option value="all" className="bg-[#13161c]">Semua Kategori</option>
              {(Object.keys(CATEGORY_CONFIG) as CategoryId[]).map((cat) => (
                <option key={cat} value={cat} className="bg-[#13161c]">
                  {CATEGORY_CONFIG[cat].label}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* 3. CONTENT VIEW 1: DAFTAR (LIST) */}
      {viewMode === 'list' && (
        <div className="flex-1 flex flex-col overflow-hidden pb-2">
          {/* Table Header */}
          <div className="h-8 bg-[#14171d] border-b border-[#20242c] px-4 flex items-center text-xs font-semibold text-[#616875] shrink-0 uppercase tracking-wider text-[10.5px]">
            <div className="w-7 flex items-center">
              <input
                type="checkbox"
                checked={allSelected}
                onChange={onSelectAllFiles}
                className="rounded accent-[#0a84ff] cursor-pointer"
                title="Pilih semua baris (Ctrl+A)"
              />
            </div>
            <div
              className="flex-1 min-w-[200px] flex items-center gap-1 cursor-pointer hover:text-[#f5f7fa]"
              onClick={() => handleSort('name')}
            >
              <span>Nama Berkas</span>
              {sortField === 'name' && <ArrowUpDown className="w-3 h-3 text-[#0a84ff]" />}
            </div>
            <div
              className="w-24 text-right flex items-center justify-end gap-1 cursor-pointer hover:text-[#f5f7fa]"
              onClick={() => handleSort('size')}
            >
              <span>Ukuran</span>
              {sortField === 'size' && <ArrowUpDown className="w-3 h-3 text-[#0a84ff]" />}
            </div>
            <div
              className="w-28 text-right flex items-center justify-end gap-1 cursor-pointer hover:text-[#f5f7fa]"
              onClick={() => handleSort('modified')}
            >
              <span>Diubah</span>
              {sortField === 'modified' && <ArrowUpDown className="w-3 h-3 text-[#0a84ff]" />}
            </div>
            <div className="w-20 text-center">Jenis</div>
            <div
              className="w-32 pl-4 flex items-center gap-1 cursor-pointer hover:text-[#f5f7fa]"
              onClick={() => handleSort('category')}
            >
              <span>Kategori</span>
              {sortField === 'category' && <ArrowUpDown className="w-3 h-3 text-[#0a84ff]" />}
            </div>
          </div>

          {/* Table Body */}
          <div className="flex-1 overflow-y-auto divide-y divide-[#181c23]/70 pb-36 scrollbar-thin">
            {filteredAndSortedFiles.map((file) => {
              const isSelected = selectedFileIds.includes(file.id);
              const config = CATEGORY_CONFIG[file.category];

              return (
                <div
                  key={file.id}
                  onClick={(e) => onToggleSelectFile(file.id, e.ctrlKey || e.metaKey || e.shiftKey)}
                  onContextMenu={(e) => handleContextMenu(e, file)}
                  className={`h-8 px-4 flex items-center text-xs transition-colors cursor-pointer ${
                    isSelected
                      ? 'bg-[#1c2738] text-[#f5f7fa] font-medium'
                      : 'hover:bg-[#15181e] text-[#9ea5b1]'
                  }`}
                >
                  <div className="w-7 flex items-center" onClick={(e) => e.stopPropagation()}>
                    <input
                      type="checkbox"
                      checked={isSelected}
                      onChange={() => onToggleSelectFile(file.id, true)}
                      className="rounded accent-[#0a84ff] cursor-pointer"
                    />
                  </div>
                  <div className="flex-1 min-w-[200px] flex items-center gap-2 truncate pr-2">
                    <span className="truncate font-semibold text-[#f5f7fa]">{file.name}</span>
                    {file.isSuggested && (
                      <span className="text-[10px] text-[#0a84ff] font-bold" title="Ada saran pengelompokan folder">
                        *
                      </span>
                    )}
                  </div>
                  <div className="w-24 text-right font-mono text-[#616875] tabular-nums">
                    {file.sizeFormatted}
                  </div>
                  <div className="w-28 text-right font-mono text-[#616875] tabular-nums">
                    {file.modifiedFormatted}
                  </div>
                  <div className="w-20 text-center font-mono text-[10.5px] uppercase text-[#616875] font-semibold">
                    {file.extension}
                  </div>
                  <div className="w-32 pl-4 flex items-center gap-1.5">
                    <div
                      className="w-2 h-2 rounded-full shrink-0"
                      style={{ backgroundColor: config.color }}
                    />
                    <span className="truncate text-[#9ea5b1]">{config.label}</span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* 4. CONTENT VIEW 2: GRID VIEW with AeroBox Rounded Squircle Cards */}
      {viewMode === 'grid' && (
        <div className="flex-1 overflow-y-auto p-4 pb-36 scrollbar-thin">
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-3.5">
            {filteredAndSortedFiles.map((file) => {
              const isSelected = selectedFileIds.includes(file.id);
              const config = CATEGORY_CONFIG[file.category];

              return (
                <div
                  key={file.id}
                  onClick={(e) => onToggleSelectFile(file.id, e.ctrlKey || e.metaKey || e.shiftKey)}
                  onContextMenu={(e) => handleContextMenu(e, file)}
                  className={`border rounded-2xl p-3 flex flex-col transition-all cursor-pointer group select-none shadow-[0_2px_8px_rgba(0,0,0,0.3)] ${
                    isSelected
                      ? 'bg-[#182333] border-[#0a84ff] shadow-[0_0_12px_rgba(10,132,255,0.3),inset_0_1px_0_0_rgba(255,255,255,0.1)]'
                      : 'bg-[#14171d] border-white/6 hover:bg-[#181c23] hover:border-white/12 shadow-[inset_0_1px_0_0_rgba(255,255,255,0.06)]'
                  }`}
                >
                  {/* Aspect Ratio Box with inner debossed cavity */}
                  <div
                    className="w-full aspect-square bg-[#101217] rounded-xl flex flex-col items-center justify-center mb-2.5 overflow-hidden relative border border-white/5 shadow-[inset_0_1px_3px_rgba(0,0,0,0.6)] group-hover:border-white/10 transition-colors"
                  >
                    <div
                      className="absolute top-2 left-2 w-2 h-2 rounded-full"
                      style={{ backgroundColor: config.color }}
                      title={`Kategori: ${config.label}`}
                    />

                    <div className="transform group-hover:scale-105 transition-transform duration-150">
                      {renderFileIcon(file.category)}
                    </div>

                    <span className="text-[10px] font-mono uppercase text-[#616875] font-bold mt-1">
                      .{file.extension}
                    </span>
                  </div>

                  <div className="truncate text-xs font-bold text-[#f5f7fa]" title={file.name}>
                    {file.name}
                  </div>
                  <div className="text-[11px] font-mono text-[#616875] mt-0.5">
                    {file.sizeFormatted}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Context Menu */}
      {contextMenu && (
        <div
          style={{ top: contextMenu.y, left: contextMenu.x }}
          className="fixed bg-[#181c23] border border-white/10 rounded-xl shadow-2xl py-1 text-xs w-48 z-50 select-none shadow-[0_12px_32px_rgba(0,0,0,0.7)]"
          onClick={(e) => e.stopPropagation()}
        >
          <div className="px-3 py-1.5 text-[10px] text-[#616875] font-mono truncate border-b border-[#222630] mb-1">
            {contextMenu.file.name}
          </div>
          <button
            onClick={() => {
              console.log(`[AeroBox] Buka berkas: ${contextMenu.file.name}`);
              setContextMenu(null);
            }}
            className="w-full px-3 py-1.5 text-left text-[#f5f7fa] hover:bg-[#1e2229] flex items-center gap-2 cursor-pointer"
          >
            <File className="w-3.5 h-3.5 text-[#0a84ff]" />
            <span>Buka Berkas</span>
          </button>
          <button
            onClick={() => {
              console.log(`[AeroBox] Buka lokasi di explorer: ${contextMenu.file.path}`);
              setContextMenu(null);
            }}
            className="w-full px-3 py-1.5 text-left text-[#f5f7fa] hover:bg-[#1e2229] flex items-center gap-2 cursor-pointer"
          >
            <FolderOpen className="w-3.5 h-3.5 text-[#e5ac38]" />
            <span>Buka Lokasi di Explorer</span>
          </button>
          <div className="h-px bg-[#222630] my-1" />
          <button
            onClick={() => {
              onDeleteSelected();
              setContextMenu(null);
            }}
            className="w-full px-3 py-1.5 text-left text-[#f85149] hover:bg-[#f85149]/20 flex items-center gap-2 cursor-pointer"
          >
            <Trash2 className="w-3.5 h-3.5" />
            <span>Kirim ke Recycle Bin</span>
          </button>
        </div>
      )}
    </div>
  );
};
