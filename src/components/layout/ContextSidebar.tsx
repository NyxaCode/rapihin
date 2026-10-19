import React, { useState, useMemo } from 'react';
import {
  Folder,
  FolderOpen,
  FolderTree,
  ChevronRight,
  ChevronDown,
  Plus,
  Search,
  FileText,
  Image as ImageIcon,
  Video,
  Music,
  Archive,
  Package,
  Code2,
  Sliders,
  Cpu,
  Palette as PaletteIcon,
  Terminal,
  X,
} from 'lucide-react';
import { ActiveArea, FileItem, FolderNode } from '../../types';

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

  const getFileBadge = (ext: string) => {
    const extLower = ext.toLowerCase();
    if (extLower === 'pdf') {
      return (
        <span className="flex items-center gap-1">
          <span className="px-1 py-0.2 rounded text-[8.5px] font-bold font-mono bg-[#ef4444]/20 text-[#ef4444] border border-[#ef4444]/30">
            PDF
          </span>
        </span>
      );
    }
    if (['doc', 'docx'].includes(extLower)) {
      return (
        <span className="flex items-center gap-1">
          <span className="px-1 py-0.2 rounded text-[8.5px] font-bold font-mono bg-[#2563eb]/20 text-[#60a5fa] border border-[#2563eb]/30">
            DOC
          </span>
        </span>
      );
    }
    if (['png', 'jpg', 'jpeg', 'webp', 'svg'].includes(extLower)) {
      return <ImageIcon className="w-3.5 h-3.5 text-[#b49bea] shrink-0" />;
    }
    if (['mp4', 'mov', 'mkv'].includes(extLower)) {
      return <Video className="w-3.5 h-3.5 text-[#f87171] shrink-0" />;
    }
    if (['mp3', 'wav', 'flac'].includes(extLower)) {
      return <Music className="w-3.5 h-3.5 text-[#34d399] shrink-0" />;
    }
    if (['zip', 'rar', '7z'].includes(extLower)) {
      return <Archive className="w-3.5 h-3.5 text-[#e5ac38] shrink-0" />;
    }
    if (['exe', 'msi'].includes(extLower)) {
      return <Package className="w-3.5 h-3.5 text-[#fb923c] shrink-0" />;
    }
    if (['ts', 'tsx', 'js', 'json', 'py'].includes(extLower)) {
      return <Code2 className="w-3.5 h-3.5 text-[#38bdf8] shrink-0" />;
    }
    return <FileText className="w-3.5 h-3.5 text-[#9ea5b1] shrink-0" />;
  };

  // Extract unique available tags
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

  // Obsidian-style query parser
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

  const matchesType = (file: FileItem, typeQuery: string) => {
    const cat = file.category.toLowerCase();
    const ext = file.extension.toLowerCase();
    const q = typeQuery.toLowerCase();

    if (q === 'doc' || q === 'document' || q === 'dokumen') {
      return cat === 'document' || ['pdf', 'doc', 'docx', 'txt', 'rtf', 'xlsx', 'pptx'].includes(ext);
    }
    if (q === 'img' || q === 'image' || q === 'gambar' || q === 'foto') {
      return cat === 'image' || ['png', 'jpg', 'jpeg', 'webp', 'svg', 'gif'].includes(ext);
    }
    if (q === 'video' || q === 'vid') {
      return cat === 'video' || ['mp4', 'mov', 'mkv', 'avi'].includes(ext);
    }
    if (q === 'audio' || q === 'musik') {
      return cat === 'audio' || ['mp3', 'wav', 'flac', 'm4a'].includes(ext);
    }
    if (q === 'code' || q === 'kode') {
      return cat === 'code' || ['ts', 'tsx', 'js', 'py', 'json', 'html', 'css'].includes(ext);
    }
    return cat === q || ext === q || ext === q.replace(/^\./, '');
  };

  const matchesFile = (file: FileItem) => {
    if (!parsedQuery.hasFilter) return true;

    if (parsedQuery.types.length > 0) {
      const typeMatch = parsedQuery.types.some((t) => matchesType(file, t));
      if (!typeMatch) return false;
    }

    if (parsedQuery.tags.length > 0) {
      const fileTagsClean = file.tags.map((t) => t.replace(/^#/, '').toLowerCase());
      const tagMatch = parsedQuery.tags.some((qTag) =>
        fileTagsClean.some((fTag) => fTag.includes(qTag))
      );
      if (!tagMatch) return false;
    }

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

  // Special rendering when in Settings area
  if (activeArea === 'pengaturan') {
    const settingsTabs = [
      { id: 'umum', label: 'Umum & Tampilan', icon: Sliders, count: '4' },
      { id: 'aturan', label: 'Aturan & Kategori', icon: PaletteIcon, count: '7' },
      { id: 'kecerdasan', label: 'Kecerdasan & Privasi', icon: Cpu, count: '3' },
      { id: 'pemantauan_log', label: 'Pemantauan Log', icon: Terminal, count: 'LIVE' },
    ];

    return (
      <aside className="w-64 bg-[#13161c] border-r border-[#222630] flex flex-col select-none shrink-0 overflow-hidden text-xs">
        <div className="p-3 border-b border-[#222630] shrink-0">
          <span className="text-[10px] font-bold uppercase tracking-widest text-[#555a64] flex items-center gap-1.5">
            <Sliders className="w-3.5 h-3.5 text-[#0a84ff]" />
            <span>Kategori Pengaturan</span>
          </span>
        </div>

        <div className="flex-1 overflow-y-auto p-2 space-y-1">
          {settingsTabs.map((tab) => {
            const Icon = tab.icon;
            const isActive = settingsTab === tab.id;

            return (
              <button
                key={tab.id}
                onClick={() => onSelectSettingsTab(tab.id)}
                className={`w-full h-9 px-3 rounded-xl flex items-center justify-between text-left text-xs transition-all cursor-pointer ${
                  isActive
                    ? 'bg-[#1e2229] text-[#f5f7fa] font-bold border border-white/10 shadow-[inset_0_1px_0_0_rgba(255,255,255,0.08),0_2px_8px_rgba(0,0,0,0.3)]'
                    : 'text-[#8a919e] hover:bg-[#181c23] hover:text-[#f5f7fa]'
                }`}
              >
                <div className="flex items-center gap-2 truncate">
                  <Icon className={`w-4 h-4 shrink-0 ${isActive ? 'text-[#0a84ff]' : 'text-[#616875]'}`} />
                  <span className="truncate">{tab.label}</span>
                </div>
                <div className="flex items-center gap-1.5 shrink-0">
                  <span
                    className={`px-1.5 py-0.2 rounded text-[10px] font-mono font-bold ${
                      tab.id === 'pemantauan_log'
                        ? 'bg-[#2ea043]/20 text-[#3fb950] border border-[#2ea043]/30'
                        : 'bg-[#101217] text-[#616875] border border-white/5'
                    }`}
                  >
                    {tab.count}
                  </span>
                  {isActive && (
                    <div className="w-[3px] h-4 bg-[#0a84ff] rounded-full shadow-[0_0_6px_#0a84ff]" />
                  )}
                </div>
              </button>
            );
          })}
        </div>
      </aside>
    );
  }

  return (
    <aside className="w-68 bg-[#13161c] border-r border-[#222630] flex flex-col select-none shrink-0 overflow-hidden text-xs">
      {/* 1. Header: Pohon Direktori & Tambah Folder */}
      <div className="p-3 border-b border-[#222630] shrink-0 space-y-2.5">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <FolderTree className="w-4 h-4 text-[#e5ac38]" />
            <span className="text-[11px] font-bold uppercase tracking-wider text-[#9ea5b1]">
              Pohon Direktori
            </span>
          </div>
          <button
            onClick={onAddFolder}
            className="p-1 rounded-md bg-[#181c23] hover:bg-[#20252e] text-[#8a919e] hover:text-[#f5f7fa] border border-white/5 transition-colors cursor-pointer"
            title="Tambah Folder Baru"
          >
            <Plus className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* Quick Search inside Folders */}
        <div className="relative">
          <Search className="w-3.5 h-3.5 text-[#555a64] absolute left-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
          <input
            type="text"
            value={filterQuery}
            onChange={(e) => setFilterQuery(e.target.value)}
            placeholder="Cari berkas / type:doc..."
            className="w-full h-7 pl-8 pr-7 bg-[#101217] border border-white/5 rounded-lg text-[11px] text-[#f5f7fa] placeholder-[#555a64] focus:outline-hidden focus:border-[#0a84ff] transition-colors font-mono"
          />
          {filterQuery && (
            <button
              onClick={() => setFilterQuery('')}
              className="absolute right-2 top-1/2 -translate-y-1/2 text-[#555a64] hover:text-white"
            >
              <X className="w-3 h-3" />
            </button>
          )}
        </div>
      </div>

      {/* 2. Scrollable Middle Area: DIRECTORY TREE */}
      <div className="flex-1 overflow-y-auto px-2 py-2 space-y-0.5 scrollbar-thin">
            {folders.map((folder) => {
              const folderFiles = files.filter(
                (f) =>
                  (f.folderId === folder.id || (f.path.startsWith(folder.path) && !folder.children?.some((c) => f.path.startsWith(c.path)))) &&
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

              return (
                <div key={folder.id} className="flex flex-col">
                  {/* Folder Item with Warm Honey Gold Accent */}
                  <button
                    onClick={() => onSelectFolder(folder.path, folder.id)}
                    className={`h-7 px-2 rounded-lg flex items-center justify-between text-left transition-all cursor-pointer group ${
                      isSelected
                        ? 'bg-[#1e2229] text-[#f5f7fa] font-semibold border border-white/8 shadow-xs'
                        : 'text-[#8a919e] hover:bg-[#181c23] hover:text-[#f5f7fa]'
                    }`}
                    title={folder.path}
                  >
                    <div className="flex items-center gap-1.5 truncate pr-1">
                      <span
                        onClick={(e) => toggleExpand(folder.id, e)}
                        className="p-0.5 text-[#555a64] hover:text-[#f5f7fa] rounded cursor-pointer"
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

                      {/* Warm Mustard / Honey Gold Folder Icon */}
                      <Folder
                        className={`w-3.5 h-3.5 shrink-0 transition-transform ${
                          isSelected || isExpanded
                            ? 'text-[#e5ac38] fill-[#e5ac38]/20 stroke-[2]'
                            : 'text-[#e5ac38] group-hover:scale-105'
                        }`}
                      />

                      <span className="truncate text-[11.5px]">{folder.name}</span>
                    </div>

                    <span className="font-mono text-[9px] text-[#555a64] tabular-nums shrink-0">
                      {folderFiles.length}
                    </span>
                  </button>

                  {/* Subfolder & Nested Files */}
                  {isExpanded && (
                    <div className="pl-4 border-l border-[#222630] ml-3 my-0.5 space-y-0.5">
                      {/* Nested Subfolders */}
                      {folder.children?.map((sub) => {
                        const isSubSelected = selectedFolder === sub.path;
                        const subFiles = files.filter(
                          (f) =>
                            (f.folderId === sub.id || f.path.startsWith(sub.path)) &&
                            matchesFile(f)
                        );

                        return (
                          <div key={sub.id} className="flex flex-col">
                            <button
                              onClick={() => onSelectFolder(sub.path, sub.id)}
                              className={`h-6 px-2 rounded-md flex items-center justify-between text-left text-[11px] transition-colors cursor-pointer ${
                                isSubSelected
                                  ? 'bg-[#1e2229] text-[#f5f7fa] font-semibold'
                                  : 'text-[#8a919e] hover:bg-[#181c23] hover:text-[#f5f7fa]'
                              }`}
                              title={sub.path}
                            >
                              <div className="flex items-center gap-1.5 truncate pr-1">
                                <Folder className="w-3 h-3 text-[#e5ac38] fill-[#e5ac38]/20 shrink-0" />
                                <span className="truncate">{sub.name}</span>
                              </div>
                              <span className="font-mono text-[9px] text-[#555a64]">
                                {subFiles.length}
                              </span>
                            </button>

                            {/* Files inside Subfolder with AeroBox-style badges */}
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
                                      ? 'bg-[#0a84ff]/20 text-[#0a84ff] font-semibold'
                                      : 'text-[#616875] hover:bg-[#181c23] hover:text-[#f5f7fa]'
                                  }`}
                                  title={`${file.name} (${file.sizeFormatted})`}
                                >
                                  <div className="flex items-center gap-1.5 truncate pr-1">
                                    {getFileBadge(file.extension)}
                                    <span className="truncate">{file.name}</span>
                                  </div>
                                  <span className="text-[9px] text-[#444a54] shrink-0">
                                    {file.sizeFormatted}
                                  </span>
                                </button>
                              );
                            })}
                          </div>
                        );
                      })}

                      {/* Parent Folder Direct Files */}
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
                                ? 'bg-[#0a84ff]/20 text-[#0a84ff] font-semibold'
                                : 'text-[#616875] hover:bg-[#181c23] hover:text-[#f5f7fa]'
                            }`}
                            title={`${file.name} (${file.sizeFormatted})`}
                          >
                            <div className="flex items-center gap-1.5 truncate pr-1">
                              {getFileBadge(file.extension)}
                              <span className="truncate">{file.name}</span>
                            </div>
                            <span className="text-[9px] text-[#444a54] shrink-0">
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

      {/* 3. Subtle Local Drive Status */}
      <div className="px-3 py-2.5 border-t border-[#222630] shrink-0 flex items-center justify-between text-[11px] text-[#616875] font-mono">
        <span className="flex items-center gap-1.5">
          <span className="w-1.5 h-1.5 rounded-full bg-[#3fb950]" />
          <span>Drive Lokal (D:)</span>
        </span>
        <span className="text-[#8a919e]">NTFS</span>
      </div>
    </aside>
  );
};
