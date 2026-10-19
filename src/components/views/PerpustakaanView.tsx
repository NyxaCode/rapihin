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
  AlertCircle,
  FolderOpen,
  Folder,
  ArrowLeft,
  Wand2,
  Trash2,
  Edit2,
  Star,
  GitBranch,
  PanelLeft,
  PanelRight,
} from 'lucide-react';
import { CategoryId, FileItem, FolderNode, ScreenState, ViewMode } from '../../types';
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
  onToggleHistoryGraph,
  isHistoryGraphOpen,
  onToggleSidebar,
  isSidebarOpen,
  onToggleInspector,
  isInspectorOpen,
}) => {
  const [sortField, setSortField] = useState<'name' | 'size' | 'modified' | 'category'>('name');
  const [sortAsc, setSortAsc] = useState(true);
  const [filterCategory, setFilterCategory] = useState<CategoryId | 'all'>('all');

  // Context Menu State
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
        comparison = new Date(a.modified).getTime() - new Date(b.modified).getTime();
      } else if (sortField === 'category') {
        comparison = a.category.localeCompare(b.category);
      }
      return sortAsc ? comparison : -comparison;
    });
    return result;
  }, [files, filterCategory, sortField, sortAsc]);

  const handleContextMenu = (e: React.MouseEvent, file: FileItem) => {
    e.preventDefault();
    setContextMenu({ x: e.clientX, y: e.clientY, file });
  };

  // Close context menu on global click
  React.useEffect(() => {
    const handleClick = () => setContextMenu(null);
    window.addEventListener('click', handleClick);
    return () => window.removeEventListener('click', handleClick);
  }, []);



  const renderFileIcon = (cat: CategoryId) => {
    switch (cat) {
      case 'document':
        return <FileText className="w-8 h-8 text-[#83b5e8]" />;
      case 'image':
        return <ImageIcon className="w-8 h-8 text-[#b49bea]" />;
      case 'video':
        return <Video className="w-8 h-8 text-[#e58e9b]" />;
      case 'audio':
        return <Music className="w-8 h-8 text-[#82c99a]" />;
      case 'archive':
        return <Archive className="w-8 h-8 text-[#e4b86a]" />;
      case 'installer':
        return <Package className="w-8 h-8 text-[#e39a67]" />;
      case 'code':
        return <Code2 className="w-8 h-8 text-[#73c9d4]" />;
      default:
        return <File className="w-8 h-8 text-[#9aa4ad]" />;
    }
  };

  // Handle TDD §11 State rendering
  if (screenState === 'loading') {
    return (
      <div className="flex-1 flex flex-col p-4 bg-[#141619] overflow-hidden select-none">
        <div className="h-8 flex items-center justify-between mb-4">
          <div className="h-4 w-48 bg-[#23272c] rounded animate-pulse" />
          <div className="h-8 w-32 bg-[#23272c] rounded animate-pulse" />
        </div>
        <div className="space-y-1.5 flex-1">
          {Array.from({ length: 8 }).map((_, i) => (
            <div
              key={i}
              className="h-8 bg-[#1e2226] border border-[#2a2f35] rounded px-3 flex items-center justify-between animate-pulse"
            >
              <div className="flex items-center gap-3">
                <div className="w-4 h-4 bg-[#2a2f35] rounded" />
                <div className="w-56 h-3 bg-[#2a2f35] rounded" />
              </div>
              <div className="flex items-center gap-6">
                <div className="w-16 h-3 bg-[#2a2f35] rounded" />
                <div className="w-20 h-3 bg-[#2a2f35] rounded" />
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (screenState === 'empty') {
    return (
      <div className="flex-1 flex flex-col items-center justify-center p-8 bg-[#141619] text-center select-none">
        <div className="w-16 h-16 rounded-full bg-[#23272c] border border-[#333a42] flex items-center justify-center text-[#7c8792] mb-3">
          <FolderOpen className="w-8 h-8" />
        </div>
        <h3 className="text-sm font-semibold text-[#f3f5f7] mb-1">
          Folder ini kosong atau semua berkas dikecualikan.
        </h3>
        <p className="text-xs text-[#7c8792] max-w-sm mb-4">
          Tidak ada berkas yang ditemukan dalam direktori ini sesuai dengan kriteria filter saat ini.
        </p>
        <button
          onClick={onRetry}
          className="px-4 py-2 bg-[#23272c] hover:bg-[#2a2f35] border border-[#333a42] text-xs text-[#f3f5f7] font-medium rounded-md transition-colors cursor-pointer"
        >
          Muat Ulang Berkas
        </button>
      </div>
    );
  }

  const allSelected = filteredAndSortedFiles.length > 0 && selectedFileIds.length === filteredAndSortedFiles.length;

  return (
    <div className="flex-1 flex flex-col bg-[#141619] overflow-hidden select-none relative">
      {/* 1. Header: Folder Path di kiri & Status Item di kanan */}
      <div className="h-9 px-4 border-b border-[#333a42] flex items-center justify-between gap-4 shrink-0 bg-[#191c20]/90">
        {/* Folder Path (Address Bar style, tanpa teks label 'Direktori Aktif') */}
        <div className="flex items-center gap-2 min-w-0 flex-1">
          <div className="flex items-center gap-2 px-2.5 py-1 bg-[#141619] border border-[#333a42] rounded text-xs font-mono min-w-0 max-w-xl shadow-xs">
            <FolderOpen className="w-3.5 h-3.5 text-[#8ab4f8] shrink-0" />
            <span className="truncate select-text text-[#f3f5f7] font-medium" title={currentPath}>
              {currentPath || 'D:\\Downloads\\2024'}
            </span>
          </div>
        </div>

        {/* Status Item: folder: N Item | file: N item */}
        <div className="text-xs font-mono text-[#b3bcc5] flex items-center gap-2 shrink-0 select-none">
          <span className="font-semibold text-[#8ab4f8]">folder: {folderCount} Item</span>
          <span className="text-[#454e58]">|</span>
          <span className="font-semibold text-[#f3f5f7]">file: {filteredAndSortedFiles.length} item</span>
        </div>
      </div>

      {/* 2. Center Navbar: View Switcher (Daftar, Grid, Treemap) on Left/Center, and Category Filter at Far Right */}
      {/* (as explicitly requested: "trus kedua ui daftar grid dan treemap jadiin di center navbar aja, kategorii di paling kanan nav section center") */}
      <div className="h-11 px-4 border-b border-[#333a42] bg-[#1e2226] flex items-center justify-between shrink-0">
        {/* Left/Center: View Switcher */}
        <div className="flex items-center p-0.5 bg-[#141619] border border-[#333a42] rounded-md">
          <button
            onClick={() => onChangeViewMode('list')}
            className={`px-3 py-1 rounded text-xs flex items-center gap-1.5 transition-colors cursor-pointer ${
              viewMode === 'list'
                ? 'bg-[#2c3a4d] text-[#8ab4f8] font-semibold shadow-xs'
                : 'text-[#7c8792] hover:text-[#f3f5f7]'
            }`}
            title="Tampilan Tabel Berkas (Daftar)"
          >
            <List className="w-3.5 h-3.5" />
            <span>Daftar</span>
          </button>
          <button
            onClick={() => onChangeViewMode('grid')}
            className={`px-3 py-1 rounded text-xs flex items-center gap-1.5 transition-colors cursor-pointer ${
              viewMode === 'grid'
                ? 'bg-[#2c3a4d] text-[#8ab4f8] font-semibold shadow-xs'
                : 'text-[#7c8792] hover:text-[#f3f5f7]'
            }`}
            title="Tampilan Kartu Thumbnail (Grid)"
          >
            <Grid className="w-3.5 h-3.5" />
            <span>Grid</span>
          </button>
        </div>

        {/* Far Right: Category Filter as requested */}
        <div className="flex items-center gap-2">
          <span className="text-xs text-[#7c8792] font-medium hidden sm:inline">Kategori:</span>
          <div className="flex items-center gap-1.5 bg-[#141619] border border-[#333a42] rounded-md px-2.5 py-1">
            <Filter className="w-3.5 h-3.5 text-[#7c8792]" />
            <select
              value={filterCategory}
              onChange={(e) => setFilterCategory(e.target.value as CategoryId | 'all')}
              className="bg-transparent text-xs font-semibold text-[#f3f5f7] focus:outline-none cursor-pointer"
            >
              <option value="all" className="bg-[#191c20]">Semua Kategori</option>
              {(Object.keys(CATEGORY_CONFIG) as CategoryId[]).map((cat) => (
                <option key={cat} value={cat} className="bg-[#191c20]">
                  {CATEGORY_CONFIG[cat].label}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* 3. CONTENT VIEW 1: DAFTAR (LIST) - 32px height table per TDD §8.3 */}
      {viewMode === 'list' && (
        <div className="flex-1 flex flex-col overflow-hidden pb-2">
          {/* Table Header */}
          <div className="h-8 bg-[#1e2226] border-b border-[#333a42] px-4 flex items-center text-xs font-semibold text-[#7c8792] shrink-0">
            <div className="w-7 flex items-center">
              <input
                type="checkbox"
                checked={allSelected}
                onChange={onSelectAllFiles}
                className="rounded bg-[#23272c] border-[#454e58] text-[#8ab4f8] focus:ring-0 cursor-pointer"
                title="Pilih semua baris (Ctrl+A)"
              />
            </div>
            <div
              className="flex-1 min-w-[200px] flex items-center gap-1 cursor-pointer hover:text-[#f3f5f7]"
              onClick={() => handleSort('name')}
            >
              <span>Nama Berkas</span>
              {sortField === 'name' && <ArrowUpDown className="w-3 h-3 text-[#8ab4f8]" />}
            </div>
            <div
              className="w-24 text-right flex items-center justify-end gap-1 cursor-pointer hover:text-[#f3f5f7]"
              onClick={() => handleSort('size')}
            >
              <span>Ukuran</span>
              {sortField === 'size' && <ArrowUpDown className="w-3 h-3 text-[#8ab4f8]" />}
            </div>
            <div
              className="w-28 text-right flex items-center justify-end gap-1 cursor-pointer hover:text-[#f3f5f7]"
              onClick={() => handleSort('modified')}
            >
              <span>Diubah</span>
              {sortField === 'modified' && <ArrowUpDown className="w-3 h-3 text-[#8ab4f8]" />}
            </div>
            <div className="w-20 text-center">Jenis</div>
            <div
              className="w-32 pl-4 flex items-center gap-1 cursor-pointer hover:text-[#f3f5f7]"
              onClick={() => handleSort('category')}
            >
              <span>Kategori</span>
              {sortField === 'category' && <ArrowUpDown className="w-3 h-3 text-[#8ab4f8]" />}
            </div>
          </div>

          {/* Table Body */}
          <div className="flex-1 overflow-y-auto divide-y divide-[#23272c]/60 pb-36">
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
                      ? 'bg-[#2c3a4d] text-[#f3f5f7]'
                      : 'hover:bg-[#23272c] text-[#b3bcc5]'
                  }`}
                >
                  <div className="w-7 flex items-center" onClick={(e) => e.stopPropagation()}>
                    <input
                      type="checkbox"
                      checked={isSelected}
                      onChange={() => onToggleSelectFile(file.id, true)}
                      className="rounded bg-[#23272c] border-[#454e58] text-[#8ab4f8] focus:ring-0 cursor-pointer"
                    />
                  </div>
                  <div className="flex-1 min-w-[200px] flex items-center gap-2 truncate pr-2">
                    <span className="truncate font-medium text-[#f3f5f7]">{file.name}</span>
                    {file.isSuggested && (
                      <span className="text-[10px] text-[#8ab4f8] font-bold" title="Ada saran pengelompokan folder">
                        *
                      </span>
                    )}
                  </div>
                  <div className="w-24 text-right font-mono text-[#7c8792] tabular-nums">
                    {file.sizeFormatted}
                  </div>
                  <div className="w-28 text-right font-mono text-[#7c8792] tabular-nums">
                    {file.modifiedFormatted}
                  </div>
                  <div className="w-20 text-center font-mono text-[11px] uppercase text-[#7c8792]">
                    {file.extension}
                  </div>
                  <div className="w-32 pl-4 flex items-center gap-1.5">
                    <div
                      className="w-2 h-2 rounded-full shrink-0"
                      style={{ backgroundColor: config.color }}
                    />
                    <span className="truncate">{config.label}</span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* 4. CONTENT VIEW 2: GRID VIEW */}
      {viewMode === 'grid' && (
        <div className="flex-1 overflow-y-auto p-4 pb-36">
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-3">
            {filteredAndSortedFiles.map((file) => {
              const isSelected = selectedFileIds.includes(file.id);
              const config = CATEGORY_CONFIG[file.category];

              return (
                <div
                  key={file.id}
                  onClick={(e) => onToggleSelectFile(file.id, e.ctrlKey || e.metaKey || e.shiftKey)}
                  onContextMenu={(e) => handleContextMenu(e, file)}
                  className={`border rounded-xl p-2.5 flex flex-col transition-all cursor-pointer group select-none ${
                    isSelected
                      ? 'bg-[#2c3a4d] border-[#8ab4f8] ring-1 ring-[#8ab4f8]'
                      : 'bg-[#1e2226] border-[#333a42] hover:bg-[#23272c] hover:border-[#454e58]'
                  }`}
                >
                  {/* 1:1 Aspect Ratio Icon Box */}
                  <div
                    className="w-full aspect-square bg-[#141619] rounded-lg flex flex-col items-center justify-center mb-2 overflow-hidden relative border border-[#333a42]/50 group-hover:border-[#454e58] transition-colors"
                    style={{
                      borderBottomColor: config.color,
                      borderBottomWidth: '2.5px',
                    }}
                  >
                    {/* Category Color Dot at Top-Left */}
                    <div
                      className="absolute top-2 left-2 w-2 h-2 rounded-full shadow-xs"
                      style={{ backgroundColor: config.color }}
                      title={`Kategori: ${config.label}`}
                    />

                    {/* File Icon */}
                    <div className="transform group-hover:scale-110 transition-transform duration-150">
                      {renderFileIcon(file.category)}
                    </div>

                    {/* File Extension */}
                    <span className="text-[10px] font-mono uppercase text-[#7c8792] font-semibold mt-1">
                      .{file.extension}
                    </span>
                  </div>

                  {/* Clean Info: Name and Size only */}
                  <div className="truncate text-xs font-medium text-[#f3f5f7]" title={file.name}>
                    {file.name}
                  </div>
                  <div className="text-[11px] font-mono text-[#7c8792] mt-0.5">
                    {file.sizeFormatted}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}




      {/* Context Menu per TDD §6 & §8.3 */}
      {contextMenu && (
        <div
          style={{ top: contextMenu.y, left: contextMenu.x }}
          className="fixed bg-[#23272c] border border-[#454e58] rounded-md shadow-2xl py-1 text-xs w-48 z-50 select-none"
          onClick={(e) => e.stopPropagation()}
        >
          <div className="px-3 py-1 text-[10px] text-[#7c8792] truncate border-b border-[#333a42] mb-1">
            {contextMenu.file.name}
          </div>
          <button
            onClick={() => {
              alert(`Membuka berkas: ${contextMenu.file.name}`);
              setContextMenu(null);
            }}
            className="w-full px-3 py-1.5 text-left text-[#f3f5f7] hover:bg-[#2c3a4d] flex items-center gap-2"
          >
            <File className="w-3.5 h-3.5 text-[#8ab4f8]" />
            <span>Buka Berkas</span>
          </button>
          <button
            onClick={() => {
              alert(`Membuka lokasi di Windows Explorer: ${contextMenu.file.path}`);
              setContextMenu(null);
            }}
            className="w-full px-3 py-1.5 text-left text-[#f3f5f7] hover:bg-[#2c3a4d] flex items-center gap-2"
          >
            <FolderOpen className="w-3.5 h-3.5 text-[#8ab4f8]" />
            <span>Buka Lokasi di Explorer</span>
          </button>
          <button
            onClick={() => {
              const newName = prompt('Ubah nama berkas:', contextMenu.file.name);
              if (newName) alert(`Nama diubah menjadi: ${newName}`);
              setContextMenu(null);
            }}
            className="w-full px-3 py-1.5 text-left text-[#f3f5f7] hover:bg-[#2c3a4d] flex items-center gap-2"
          >
            <Edit2 className="w-3.5 h-3.5 text-[#7c8792]" />
            <span>Ubah Nama (F2)</span>
          </button>
          <button
            onClick={() => {
              alert(`Kategori dikunci: ${contextMenu.file.name}`);
              setContextMenu(null);
            }}
            className="w-full px-3 py-1.5 text-left text-[#f3f5f7] hover:bg-[#2c3a4d] flex items-center gap-2"
          >
            <Star className="w-3.5 h-3.5 text-[#e0ab5c]" />
            <span>Kunci Kategori</span>
          </button>
          <div className="h-px bg-[#333a42] my-1" />
          <button
            onClick={() => {
              if (confirm(`Kirim "${contextMenu.file.name}" ke Recycle Bin?`)) {
                onDeleteSelected();
              }
              setContextMenu(null);
            }}
            className="w-full px-3 py-1.5 text-left text-[#e07e88] hover:bg-[#e07e88]/20 flex items-center gap-2"
          >
            <Trash2 className="w-3.5 h-3.5" />
            <span>Kirim ke Recycle Bin</span>
          </button>
        </div>
      )}
    </div>
  );
};
