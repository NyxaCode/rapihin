import React, { useState, useMemo } from 'react';
import {
  Folder,
  FolderOpen,
  ChevronRight,
  ChevronDown,
  Plus,
  Search,
  File,
  FileText,
  Image as ImageIcon,
  Video,
  Music,
  Archive,
  Package,
  Code2,
  Sliders,
  Database,
  Shield,
  Cpu,
  Key,
  Palette as PaletteIcon,
  Zap,
  Terminal,
  Info,
  Tag as TagIcon,
  Sparkles,
  X,
  HelpCircle,
} from 'lucide-react';
import { ActiveArea, FileItem, FolderNode, CategoryId } from '../../types';

interface ContextSidebarProps {
  activeArea: ActiveArea;
  folders: FolderNode[];
  files: FileItem[];
  selectedFolder: string;
  onSelectFolder: (folderPath: string, folderId?: string) => void;
  selectedFileId: string | null;
  onSelectFile: (fileId: string) => void;
  settingsTab: string;
  onSelectSettingsTab: (tab: string) => void;
  onAddFolder: () => void;
}

interface ParsedQuery {
  types: string[];
  tags: string[];
  words: string[];
  hasFilter: boolean;
}

export const ContextSidebar: React.FC<ContextSidebarProps> = ({
  activeArea,
  folders,
  files,
  selectedFolder,
  onSelectFolder,
  selectedFileId,
  onSelectFile,
  settingsTab,
  onSelectSettingsTab,
  onAddFolder,
}) => {
  const [filterQuery, setFilterQuery] = useState('');
  const [isSearchFocused, setIsSearchFocused] = useState(false);
  const [showHelperMenu, setShowHelperMenu] = useState(false);
  const [expandedFolders, setExpandedFolders] = useState<Record<string, boolean>>({
    'f-downloads': true,
    'f-dokumen': true,
  });

  const toggleExpand = (folderId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setExpandedFolders((prev) => ({
      ...prev,
      [folderId]: !prev[folderId],
    }));
  };

  const getFileIcon = (ext: string) => {
    switch (ext.toLowerCase()) {
      case 'pdf':
      case 'docx':
      case 'txt':
      case 'doc':
      case 'xlsx':
      case 'pptx':
        return <FileText className="w-3.5 h-3.5 text-[#83b5e8] shrink-0" />;
      case 'jpg':
      case 'jpeg':
      case 'png':
      case 'webp':
      case 'svg':
        return <ImageIcon className="w-3.5 h-3.5 text-[#b49bea] shrink-0" />;
      case 'mp4':
      case 'mov':
      case 'mkv':
        return <Video className="w-3.5 h-3.5 text-[#e58e9b] shrink-0" />;
      case 'mp3':
      case 'm4a':
      case 'wav':
      case 'flac':
        return <Music className="w-3.5 h-3.5 text-[#82c99a] shrink-0" />;
      case 'zip':
      case 'rar':
      case '7z':
      case 'tar':
        return <Archive className="w-3.5 h-3.5 text-[#e4b86a] shrink-0" />;
      case 'exe':
      case 'msi':
      case 'dmg':
        return <Package className="w-3.5 h-3.5 text-[#e39a67] shrink-0" />;
      case 'py':
      case 'json':
      case 'ts':
      case 'tsx':
      case 'js':
      case 'html':
      case 'css':
        return <Code2 className="w-3.5 h-3.5 text-[#73c9d4] shrink-0" />;
      default:
        return <File className="w-3.5 h-3.5 text-[#7c8792] shrink-0" />;
    }
  };

  // Extract unique available tags from files
  const availableTags = useMemo(() => {
    const tagSet = new Set<string>();
    files.forEach((f) => {
      f.tags.forEach((t) => {
        const clean = t.replace(/^#/, '').toLowerCase().trim();
        if (clean) tagSet.add(clean);
      });
    });
    return Array.from(tagSet).sort();
  }, [files]);

  // Obsidian-style query parser:
  // Supports:
  // - type:image, type:document, type:pdf, type:code, ext:pdf, category:video
  // - tag:keuangan, tags:proyek, #invoice, #kerja
  // - plain text search by name or path
  const parsedQuery: ParsedQuery = useMemo(() => {
    const raw = filterQuery.trim();
    if (!raw) {
      return { types: [], tags: [], words: [], hasFilter: false };
    }

    const tokens = raw.split(/\s+/);
    const types: string[] = [];
    const tags: string[] = [];
    const words: string[] = [];

    tokens.forEach((token) => {
      if (!token) return;
      const lower = token.toLowerCase();

      if (lower.startsWith('type:') || lower.startsWith('ext:') || lower.startsWith('category:')) {
        const val = lower.split(':')[1]?.trim();
        if (val) types.push(val);
      } else if (lower.startsWith('tag:') || lower.startsWith('tags:')) {
        const val = lower.split(':')[1]?.replace(/^#/, '').trim();
        if (val) tags.push(val);
      } else if (lower.startsWith('#') && lower.length > 1) {
        const val = lower.replace(/^#/, '').trim();
        if (val) tags.push(val);
      } else {
        words.push(lower);
      }
    });

    return {
      types,
      tags,
      words,
      hasFilter: types.length > 0 || tags.length > 0 || words.length > 0,
    };
  }, [filterQuery]);

  // Category normalization mapping
  const matchesType = (file: FileItem, typeQuery: string) => {
    const cat = file.category.toLowerCase();
    const ext = file.extension.toLowerCase();
    const q = typeQuery.toLowerCase();

    if (q === 'doc' || q === 'document' || q === 'dokumen') {
      return cat === 'document' || ['pdf', 'doc', 'docx', 'txt', 'rtf', 'xlsx', 'pptx'].includes(ext);
    }
    if (q === 'img' || q === 'image' || q === 'gambar' || q === 'foto') {
      return cat === 'image' || ['png', 'jpg', 'jpeg', 'webp', 'svg', 'gif', 'bmp'].includes(ext);
    }
    if (q === 'video' || q === 'vid') {
      return cat === 'video' || ['mp4', 'mov', 'mkv', 'avi', 'webm'].includes(ext);
    }
    if (q === 'audio' || q === 'musik' || q === 'sound') {
      return cat === 'audio' || ['mp3', 'wav', 'flac', 'm4a', 'ogg'].includes(ext);
    }
    if (q === 'code' || q === 'kode' || q === 'script') {
      return cat === 'code' || ['ts', 'tsx', 'js', 'jsx', 'py', 'json', 'html', 'css', 'sql'].includes(ext);
    }
    if (q === 'archive' || q === 'arsip' || q === 'zip') {
      return cat === 'archive' || ['zip', 'rar', '7z', 'tar', 'gz'].includes(ext);
    }
    if (q === 'installer' || q === 'app' || q === 'aplikasi') {
      return cat === 'installer' || ['exe', 'msi', 'dmg', 'deb'].includes(ext);
    }

    // Direct match against category or extension
    return cat === q || ext === q || ext === q.replace(/^\./, '');
  };

  // Check if a file matches the Obsidian filter query
  const matchesFile = (file: FileItem) => {
    if (!parsedQuery.hasFilter) return true;

    // Check types
    if (parsedQuery.types.length > 0) {
      const typeMatch = parsedQuery.types.some((t) => matchesType(file, t));
      if (!typeMatch) return false;
    }

    // Check tags
    if (parsedQuery.tags.length > 0) {
      const fileTagsClean = file.tags.map((t) => t.replace(/^#/, '').toLowerCase());
      const tagMatch = parsedQuery.tags.some((qTag) =>
        fileTagsClean.some((fTag) => fTag.includes(qTag))
      );
      if (!tagMatch) return false;
    }

    // Check plain words
    if (parsedQuery.words.length > 0) {
      const fileNameLower = file.name.toLowerCase();
      const filePathLower = file.path.toLowerCase();
      const wordMatch = parsedQuery.words.every(
        (w) => fileNameLower.includes(w) || filePathLower.includes(w)
      );
      if (!wordMatch) return false;
    }

    return true;
  };

  const TYPE_OPTIONS = [
    { id: 'doc', label: 'Dokumen', token: 'type:doc', color: 'text-[#83b5e8]' },
    { id: 'img', label: 'Gambar', token: 'type:img', color: 'text-[#b49bea]' },
    { id: 'code', label: 'Kode', token: 'type:code', color: 'text-[#73c9d4]' },
    { id: 'video', label: 'Video', token: 'type:video', color: 'text-[#e58e9b]' },
    { id: 'audio', label: 'Audio', token: 'type:audio', color: 'text-[#82c99a]' },
    { id: 'archive', label: 'Arsip', token: 'type:archive', color: 'text-[#e4b86a]' },
    { id: 'installer', label: 'Aplikasi', token: 'type:installer', color: 'text-[#e39a67]' },
  ];

  const currentTypeToken = useMemo(() => {
    if (parsedQuery.types.length === 0) return '';
    const firstType = parsedQuery.types[0];
    const match = TYPE_OPTIONS.find((t) => t.id === firstType || t.token.includes(firstType));
    return match ? match.token : `type:${firstType}`;
  }, [parsedQuery.types]);

  const currentTagToken = useMemo(() => {
    if (parsedQuery.tags.length === 0) return '';
    return `tag:${parsedQuery.tags[0]}`;
  }, [parsedQuery.tags]);

  const handleSelectType = (val: string) => {
    let tokens = filterQuery.split(/\s+/).filter(Boolean);
    tokens = tokens.filter(
      (t) =>
        !t.toLowerCase().startsWith('type:') &&
        !t.toLowerCase().startsWith('ext:') &&
        !t.toLowerCase().startsWith('category:')
    );
    if (val) {
      tokens.push(val);
    }
    setFilterQuery(tokens.join(' ') + (tokens.length > 0 ? ' ' : ''));
  };

  const handleSelectTag = (val: string) => {
    let tokens = filterQuery.split(/\s+/).filter(Boolean);
    tokens = tokens.filter(
      (t) =>
        !t.toLowerCase().startsWith('tag:') &&
        !t.toLowerCase().startsWith('tags:') &&
        !t.startsWith('#')
    );
    if (val) {
      tokens.push(val);
    }
    setFilterQuery(tokens.join(' ') + (tokens.length > 0 ? ' ' : ''));
  };

  const toggleToken = (token: string) => {
    const raw = filterQuery.trim();
    if (!raw) {
      setFilterQuery(token + ' ');
      return;
    }
    const tokens = raw.split(/\s+/).filter(Boolean);
    const index = tokens.findIndex((t) => t.toLowerCase() === token.toLowerCase());
    if (index >= 0) {
      tokens.splice(index, 1);
      setFilterQuery(tokens.join(' ') + (tokens.length > 0 ? ' ' : ''));
    } else {
      tokens.push(token);
      setFilterQuery(tokens.join(' ') + ' ');
    }
  };

  // Helper to append a token to search input
  const appendToken = (token: string) => {
    setFilterQuery((prev) => {
      const trimmed = prev.trim();
      if (!trimmed) return token + ' ';
      if (trimmed.includes(token)) return prev;
      return `${trimmed} ${token} `;
    });
  };

  // If in Settings view, render Settings Subtabs navigation
  if (activeArea === 'pengaturan') {
    const settingsTabs = [
      { id: 'umum', label: 'Umum & Tampilan', icon: Sliders, count: '4' },
      { id: 'aturan', label: 'Aturan & Kategori', icon: PaletteIcon, count: '7' },
      { id: 'kecerdasan', label: 'Kecerdasan & Privasi', icon: Cpu, count: '3' },
      { id: 'pemantauan_log', label: 'Pemantauan Log Pengerjaan', icon: Terminal, count: 'Live' },
    ];

    return (
      <aside className="w-64 bg-[#191c20] border-r border-[#333a42] flex flex-col py-3 select-none shrink-0 overflow-y-auto">
        <div className="px-4 pb-2 mb-2 border-b border-[#333a42]">
          <h2 className="text-xs font-semibold uppercase tracking-wider text-[#7c8792]">
            Kategori Pengaturan
          </h2>
        </div>
        <div className="flex flex-col gap-0.5 px-2">
          {settingsTabs.map((tab) => {
            const Icon = tab.icon;
            const isActive = settingsTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => onSelectSettingsTab(tab.id)}
                className={`h-8 px-2.5 rounded-md text-xs flex items-center justify-between transition-colors focus-ring cursor-pointer ${
                  isActive
                    ? 'bg-[#2c3a4d] text-[#8ab4f8] font-medium'
                    : 'text-[#b3bcc5] hover:bg-[#23272c] hover:text-[#f3f5f7]'
                }`}
              >
                <div className="flex items-center gap-2 truncate">
                  <Icon className="w-3.5 h-3.5 shrink-0" />
                  <span className="truncate">{tab.label}</span>
                </div>
                <div className="flex items-center gap-1.5 shrink-0">
                  <span
                    className={`px-1.5 py-0.2 rounded text-[10px] font-mono font-bold ${
                      tab.id === 'pemantauan_log'
                        ? 'bg-[#2ea043]/20 text-[#3fb950] border border-[#2ea043]/40'
                        : 'bg-[#141619] text-[#7c8792] border border-[#333a42]'
                    }`}
                  >
                    {tab.count}
                  </span>
                  {isActive && <ChevronRight className="w-3.5 h-3.5 text-[#8ab4f8]" />}
                </div>
              </button>
            );
          })}
        </div>
      </aside>
    );
  }

  // Count total matching files for query indicator
  const matchingFilesCount = files.filter(matchesFile).length;

  // Render purely Folder Tree and Files with Obsidian-style Filter
  return (
    <aside className="w-64 bg-[#191c20] border-r border-[#333a42] flex flex-col select-none shrink-0 overflow-hidden text-xs">
      {/* Top Header: Pohon Direktori + Tambah Folder */}
      <div className="p-3 border-b border-[#333a42] shrink-0 space-y-2">
        <div className="flex items-center justify-between">
          <span className="text-[11px] font-bold uppercase tracking-wider text-[#7c8792] flex items-center gap-1.5">
            <Folder className="w-3.5 h-3.5 text-[#8ab4f8]" />
            <span>Pohon Folder & Berkas</span>
          </span>
          <button
            onClick={onAddFolder}
            className="p-1 rounded bg-[#23272c] hover:bg-[#2a2f35] text-[#7c8792] hover:text-[#8ab4f8] transition-colors cursor-pointer"
            title="Tambah Folder Lokal Baru"
          >
            <Plus className="w-3 h-3" />
          </button>
        </div>

        {/* Tree Obsidian Search & Filter Bar */}
        <div className="relative">
          <Search className="w-3 h-3 text-[#7c8792] absolute left-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
          <input
            type="text"
            value={filterQuery}
            onFocus={() => setIsSearchFocused(true)}
            onChange={(e) => setFilterQuery(e.target.value)}
            placeholder="Cari atau type:pdf tag:keuangan..."
            className="w-full h-7 pl-7 pr-12 bg-[#141619] border border-[#333a42] rounded text-[11px] text-[#f3f5f7] placeholder-[#7c8792] focus:outline-none focus:border-[#8ab4f8] transition-colors font-mono"
            title="Sintaks Obsidian: type:doc, type:image, type:code, tag:keuangan, #proyek, atau nama berkas"
          />
          <div className="absolute right-1.5 top-1/2 -translate-y-1/2 flex items-center gap-1">
            {filterQuery && (
              <button
                onClick={() => setFilterQuery('')}
                className="text-[#7c8792] hover:text-[#f3f5f7] text-[10px] p-0.5 cursor-pointer"
                title="Hapus pencarian"
              >
                <X className="w-3 h-3" />
              </button>
            )}
            <button
              onClick={() => setShowHelperMenu(!showHelperMenu)}
              className={`p-0.5 rounded text-[10px] cursor-pointer ${
                showHelperMenu ? 'bg-[#8ab4f8]/20 text-[#8ab4f8]' : 'text-[#7c8792] hover:text-[#f3f5f7]'
              }`}
              title="Panduan Filter Obsidian (type: / tag:)"
            >
              <HelpCircle className="w-3 h-3" />
            </button>
          </div>
        </div>

        {/* Quick Filter: Dropdowns for Tipe and Tag */}
        <div className="grid grid-cols-2 gap-1.5 pt-0.5">
          {/* Dropdown Tipe */}
          <div className="relative">
            <select
              value={currentTypeToken}
              onChange={(e) => handleSelectType(e.target.value)}
              className="w-full h-6.5 pl-2 pr-5 bg-[#141619] border border-[#333a42] hover:border-[#454e58] rounded text-[10px] text-[#b3bcc5] focus:outline-none focus:border-[#8ab4f8] transition-colors cursor-pointer appearance-none truncate"
              title="Pilih filter tipe berkas"
            >
              <option value="" className="bg-[#191c20] text-[#7c8792]">Tipe: Semua</option>
              {TYPE_OPTIONS.map((t) => (
                <option key={t.id} value={t.token} className="bg-[#191c20] text-[#f3f5f7]">
                  {t.label} ({t.token})
                </option>
              ))}
            </select>
            <ChevronDown className="w-3 h-3 text-[#7c8792] absolute right-1.5 top-1/2 -translate-y-1/2 pointer-events-none" />
          </div>

          {/* Dropdown Tag */}
          <div className="relative">
            <select
              value={currentTagToken}
              onChange={(e) => handleSelectTag(e.target.value)}
              className="w-full h-6.5 pl-2 pr-5 bg-[#141619] border border-[#333a42] hover:border-[#454e58] rounded text-[10px] text-[#b3bcc5] focus:outline-none focus:border-[#8ab4f8] transition-colors cursor-pointer appearance-none truncate"
              title="Pilih filter tag berkas"
            >
              <option value="" className="bg-[#191c20] text-[#7c8792]">Tag: Semua</option>
              {availableTags.map((tag) => (
                <option key={tag} value={`tag:${tag}`} className="bg-[#191c20] text-[#f3f5f7]">
                  #{tag}
                </option>
              ))}
            </select>
            <ChevronDown className="w-3 h-3 text-[#7c8792] absolute right-1.5 top-1/2 -translate-y-1/2 pointer-events-none" />
          </div>
        </div>

        {/* Scrollable Quick Pills Bar (Bisa di-scroll horizontal atau gunakan dropdown di atas) */}
        <div
          onWheel={(e) => {
            if (e.deltaY !== 0) {
              e.currentTarget.scrollLeft += e.deltaY;
            }
          }}
          className="flex items-center gap-1 overflow-x-auto pb-1 pt-0.5 text-[10px] font-mono scrollbar-thin scrollbar-thumb-[#333a42] scrollbar-track-transparent select-none"
          title="Scroll horizontal dengan mouse wheel atau swipe untuk melihat semua filter cepat"
        >
          {TYPE_OPTIONS.map((opt) => {
            const isActive =
              parsedQuery.types.includes(opt.id) ||
              filterQuery.toLowerCase().includes(opt.token);
            return (
              <button
                key={opt.id}
                onClick={() => toggleToken(opt.token)}
                className={`px-1.5 py-0.5 rounded border transition-colors cursor-pointer shrink-0 flex items-center gap-1 ${
                  isActive
                    ? 'bg-[#2c3a4d] text-[#8ab4f8] border-[#8ab4f8] font-bold shadow-xs'
                    : 'bg-[#23272c] hover:bg-[#2a2f35] text-[#b3bcc5] border-[#333a42]'
                }`}
                title={`Klik untuk aktifkan/nonaktifkan ${opt.token}`}
              >
                <span className={opt.color}>{opt.token}</span>
                {isActive && <span className="text-[8px] text-[#8ab4f8]">✓</span>}
              </button>
            );
          })}
          {availableTags.map((tag) => {
            const tagToken = `tag:${tag}`;
            const isActive =
              parsedQuery.tags.includes(tag) ||
              filterQuery.toLowerCase().includes(tagToken) ||
              filterQuery.toLowerCase().includes(`#${tag}`);
            return (
              <button
                key={tag}
                onClick={() => toggleToken(tagToken)}
                className={`px-1.5 py-0.5 rounded border transition-colors cursor-pointer shrink-0 flex items-center gap-1 ${
                  isActive
                    ? 'bg-[#3e3427] text-[#e4b86a] border-[#e4b86a] font-bold shadow-xs'
                    : 'bg-[#23272c] hover:bg-[#2a2f35] text-[#e4b86a]/90 border-[#333a42]'
                }`}
                title={`Klik untuk aktifkan/nonaktifkan #${tag}`}
              >
                <span>#{tag}</span>
                {isActive && <span className="text-[8px] text-[#e4b86a]">✓</span>}
              </button>
            );
          })}
        </div>

        {/* Expanded Obsidian Syntax Cheat Sheet Popover */}
        {showHelperMenu && (
          <div className="p-2.5 bg-[#141619] border border-[#333a42] rounded-md text-[10px] text-[#b3bcc5] space-y-1.5 animate-in fade-in">
            <div className="flex items-center justify-between text-[#8ab4f8] font-semibold">
              <span className="flex items-center gap-1">
                <Sparkles className="w-3 h-3" />
                <span>Filter ala Obsidian Note</span>
              </span>
              <button
                onClick={() => setShowHelperMenu(false)}
                className="text-[#7c8792] hover:text-[#f3f5f7] cursor-pointer"
              >
                ✕
              </button>
            </div>
            <div className="space-y-1 font-mono text-[9px]">
              <div>
                <span className="text-[#8ab4f8]">type:doc</span> | <span className="text-[#b49bea]">type:img</span> | <span className="text-[#73c9d4]">type:code</span> | <span className="text-[#e58e9b]">type:video</span>
              </div>
              <div>
                <span className="text-[#e4b86a]">tag:keuangan</span> atau <span className="text-[#e4b86a]">#proyek</span>
              </div>
              <div className="text-[#7c8792]">
                Kombinasi: <span className="text-[#f3f5f7]">laporan type:pdf #keuangan</span>
              </div>
            </div>
            {availableTags.length > 0 && (
              <div className="pt-1 border-t border-[#333a42]/60 flex items-center gap-1 flex-wrap">
                <span className="text-[#7c8792]">Tag tersedia:</span>
                {availableTags.map((tag) => (
                  <span
                    key={tag}
                    onClick={() => {
                      appendToken(`tag:${tag}`);
                      setShowHelperMenu(false);
                    }}
                    className="px-1 py-0.2 bg-[#23272c] text-[#e4b86a] rounded cursor-pointer hover:bg-[#333a42]"
                  >
                    #{tag}
                  </span>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Active Query Status Indicator */}
        {parsedQuery.hasFilter && (
          <div className="flex items-center justify-between text-[10px] px-1 text-[#8ab4f8]">
            <span className="font-mono">
              Hasil filter: {matchingFilesCount} berkas
            </span>
            <button
              onClick={() => setFilterQuery('')}
              className="text-[#7c8792] hover:text-[#e07e88] cursor-pointer underline text-[9px]"
            >
              Reset
            </button>
          </div>
        )}
      </div>

      {/* Pure Folder Tree & Files List */}
      <div className="flex-1 overflow-y-auto p-2 space-y-0.5">
        {folders.map((folder) => {
          // When filtering, auto-expand if matching files exist inside
          const folderFiles = files.filter(
            (f) =>
              (f.folderId === folder.id || (f.path.startsWith(folder.path) && !folder.children?.some(c => f.path.startsWith(c.path)))) &&
              matchesFile(f)
          );

          const subfolderMatches = folder.children?.some((sub) =>
            files.some((f) => (f.folderId === sub.id || f.path.startsWith(sub.path)) && matchesFile(f))
          );

          const isExpanded = parsedQuery.hasFilter
            ? folderFiles.length > 0 || subfolderMatches
            : !!expandedFolders[folder.id];

          const isSelected = selectedFolder === folder.path;
          const hasChildren = (folder.children && folder.children.length > 0) || folderFiles.length > 0;

          // If filtering and folder has no matching files and folder name doesn't match, hide it
          const folderNameMatches = parsedQuery.words.some((w) => folder.name.toLowerCase().includes(w));
          if (parsedQuery.hasFilter && !folderNameMatches && folderFiles.length === 0 && !subfolderMatches) {
            return null;
          }

          return (
            <div key={folder.id} className="flex flex-col">
              {/* Folder Header Item */}
              <button
                onClick={() => onSelectFolder(folder.path, folder.id)}
                className={`h-7 px-2 rounded flex items-center justify-between text-left transition-colors cursor-pointer group ${
                  isSelected
                    ? 'bg-[#2c3a4d] text-[#8ab4f8] font-semibold'
                    : 'text-[#b3bcc5] hover:bg-[#23272c] hover:text-[#f3f5f7]'
                }`}
                title={folder.path}
              >
                <div className="flex items-center gap-1.5 truncate pr-2">
                  <span
                    onClick={(e) => toggleExpand(folder.id, e)}
                    className="p-0.5 text-[#7c8792] hover:text-[#f3f5f7] rounded cursor-pointer"
                  >
                    {hasChildren ? (
                      isExpanded ? (
                        <ChevronDown className="w-3 h-3" />
                      ) : (
                        <ChevronRight className="w-3 h-3" />
                      )
                    ) : (
                      <div className="w-3 h-3" />
                    )}
                  </span>
                  {isSelected || isExpanded ? (
                    <FolderOpen className="w-3.5 h-3.5 text-[#8ab4f8] shrink-0" />
                  ) : (
                    <Folder className="w-3.5 h-3.5 text-[#7c8792] shrink-0 group-hover:text-[#8ab4f8]" />
                  )}
                  <span className="truncate">{folder.name}</span>
                </div>
                <span className="font-mono text-[10px] text-[#7c8792] tabular-nums shrink-0">
                  {folderFiles.length}
                </span>
              </button>

              {/* Subfolders & Files inside when expanded */}
              {isExpanded && (
                <div className="pl-4 border-l border-[#333a42] ml-3 my-0.5 space-y-0.5">
                  {/* Nested Subfolders */}
                  {folder.children?.map((sub) => {
                    const isSubSelected = selectedFolder === sub.path;
                    const subFiles = files.filter(
                      (f) =>
                        (f.folderId === sub.id || f.path.startsWith(sub.path)) &&
                        matchesFile(f)
                    );

                    const subNameMatches = parsedQuery.words.some((w) => sub.name.toLowerCase().includes(w));
                    if (parsedQuery.hasFilter && !subNameMatches && subFiles.length === 0) {
                      return null;
                    }

                    return (
                      <div key={sub.id} className="flex flex-col">
                        <button
                          onClick={() => onSelectFolder(sub.path, sub.id)}
                          className={`h-6 px-2 rounded flex items-center justify-between text-left text-[11px] transition-colors cursor-pointer ${
                            isSubSelected
                              ? 'bg-[#2c3a4d] text-[#8ab4f8] font-semibold'
                              : 'text-[#b3bcc5] hover:bg-[#23272c] hover:text-[#f3f5f7]'
                          }`}
                          title={sub.path}
                        >
                          <div className="flex items-center gap-1.5 truncate pr-1">
                            <Folder className="w-3 h-3 text-[#7c8792] shrink-0" />
                            <span className="truncate">{sub.name}</span>
                          </div>
                          <span className="font-mono text-[9px] text-[#7c8792]">
                            {subFiles.length}
                          </span>
                        </button>

                        {/* Files inside Subfolder */}
                        {subFiles.map((file) => {
                          const isFileSelected = selectedFileId === file.id;
                          return (
                            <button
                              key={file.id}
                              onClick={() => {
                                onSelectFile(file.id);
                                onSelectFolder(sub.path, sub.id);
                              }}
                              className={`h-6 px-1.5 rounded flex items-center justify-between text-left text-[11px] font-mono transition-colors cursor-pointer ${
                                isFileSelected
                                  ? 'bg-[#8ab4f8]/20 text-[#8ab4f8] font-semibold'
                                  : 'text-[#7c8792] hover:bg-[#23272c] hover:text-[#f3f5f7]'
                              }`}
                              title={`${file.name} (${file.sizeFormatted})\nTags: ${file.tags.join(', ')}`}
                            >
                              <div className="flex items-center gap-1.5 truncate pr-1">
                                {getFileIcon(file.extension)}
                                <span className="truncate">{file.name}</span>
                              </div>
                              <span className="text-[9px] text-[#5a636d] shrink-0">
                                {file.sizeFormatted}
                              </span>
                            </button>
                          );
                        })}
                      </div>
                    );
                  })}

                  {/* Files inside Parent Folder */}
                  {folderFiles.map((file) => {
                    const isFileSelected = selectedFileId === file.id;
                    return (
                      <button
                        key={file.id}
                        onClick={() => {
                          onSelectFile(file.id);
                          onSelectFolder(folder.path, folder.id);
                        }}
                        className={`w-full h-6 px-1.5 rounded flex items-center justify-between text-left text-[11px] font-mono transition-colors cursor-pointer ${
                          isFileSelected
                            ? 'bg-[#8ab4f8]/20 text-[#8ab4f8] font-semibold'
                            : 'text-[#7c8792] hover:bg-[#23272c] hover:text-[#f3f5f7]'
                        }`}
                        title={`${file.name} (${file.sizeFormatted})\nTags: ${file.tags.join(', ')}`}
                      >
                        <div className="flex items-center gap-1.5 truncate pr-1">
                          {getFileIcon(file.extension)}
                          <span className="truncate">{file.name}</span>
                        </div>
                        <span className="text-[9px] text-[#5a636d] shrink-0">
                          {file.sizeFormatted}
                        </span>
                      </button>
                    );
                  })}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </aside>
  );
};
