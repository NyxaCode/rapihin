import React, { useState } from 'react';
import {
  Folder,
  FolderOpen,
  ChevronRight,
  ChevronDown,
  File,
  FileText,
  Image as ImageIcon,
  Video,
  Music,
  Archive,
  Package,
  Code2,
  Search,
  Settings,
  FolderTree,
  Sliders,
  Sparkles,
  PanelLeftClose,
} from 'lucide-react';
import { FileItem, FolderNode } from '../../types';

interface AppSidebarProps {
  selectedFolderId: string;
  onSelectFolder: (folderId: string) => void;
  selectedFileId: string | null;
  onSelectFile: (fileId: string) => void;
  folders: FolderNode[];
  files: FileItem[];
  onOpenSettings: () => void;
  onToggleSidebar: () => void;
}

export const AppSidebar: React.FC<AppSidebarProps> = ({
  selectedFolderId,
  onSelectFolder,
  selectedFileId,
  onSelectFile,
  folders,
  files,
  onOpenSettings,
  onToggleSidebar,
}) => {
  const [filterQuery, setFilterQuery] = useState('');
  const [expandedFolderIds, setExpandedFolderIds] = useState<string[]>([
    'f-downloads',
    'f-dokumen',
    'f-keuangan',
  ]);

  const toggleFolder = (folderId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setExpandedFolderIds((prev) =>
      prev.includes(folderId) ? prev.filter((id) => id !== folderId) : [...prev, folderId]
    );
  };

  const getFileIcon = (ext: string) => {
    switch (ext.toLowerCase()) {
      case 'pdf':
      case 'docx':
      case 'txt':
        return <FileText className="w-3.5 h-3.5 text-[#83b5e8]" />;
      case 'jpg':
      case 'png':
        return <ImageIcon className="w-3.5 h-3.5 text-[#b49bea]" />;
      case 'mp4':
        return <Video className="w-3.5 h-3.5 text-[#e58e9b]" />;
      case 'm4a':
      case 'mp3':
        return <Music className="w-3.5 h-3.5 text-[#82c99a]" />;
      case 'zip':
        return <Archive className="w-3.5 h-3.5 text-[#e4b86a]" />;
      case 'exe':
      case 'msi':
        return <Package className="w-3.5 h-3.5 text-[#e39a67]" />;
      case 'py':
      case 'json':
        return <Code2 className="w-3.5 h-3.5 text-[#73c9d4]" />;
      default:
        return <File className="w-3.5 h-3.5 text-[#7c8792]" />;
    }
  };

  // Filter folders and files based on user filter input
  const filteredFolders = folders.filter((f) => {
    if (!filterQuery.trim()) return true;
    const q = filterQuery.toLowerCase();
    const folderMatches = f.name.toLowerCase().includes(q) || f.path.toLowerCase().includes(q);
    const childMatches = f.children?.some((c) => c.name.toLowerCase().includes(q));
    const fileMatches = files.some(
      (file) => file.folderId === f.id && file.name.toLowerCase().includes(q)
    );
    return folderMatches || childMatches || fileMatches;
  });

  return (
    <aside className="w-64 bg-[#191c20] border-r border-[#333a42] flex flex-col justify-between py-3 select-none shrink-0 text-xs z-30">
      {/* Top Header & Search Filter */}
      <div className="flex flex-col gap-2.5 px-3">
        {/* App Title */}
        <div className="flex items-center justify-between pb-2 border-b border-[#333a42]">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded bg-[#8ab4f8]/20 flex items-center justify-center text-[#8ab4f8]">
              <FolderTree className="w-3.5 h-3.5" />
            </div>
            <span className="font-bold text-sm text-[#f3f5f7] tracking-tight">Rapihin</span>
            <span className="text-[#7c8792] text-[11px] font-mono">v1.0</span>
          </div>

          <button
            onClick={onToggleSidebar}
            className="p-1 rounded text-[#7c8792] hover:text-[#f3f5f7] hover:bg-[#23272c]"
            title="Sembunyikan Sidebar"
          >
            <PanelLeftClose className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* Tree Search Filter (as requested: "ada filter buat nampilin folder yang di select di situ") */}
        <div className="relative">
          <Search className="w-3.5 h-3.5 text-[#7c8792] absolute left-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
          <input
            type="text"
            value={filterQuery}
            onChange={(e) => setFilterQuery(e.target.value)}
            placeholder="Filter pohon direktori..."
            className="w-full h-7 pl-8 pr-6 bg-[#23272c] border border-[#333a42] focus:border-[#8ab4f8] rounded text-[11px] text-[#f3f5f7] placeholder-[#7c8792] focus:outline-none transition-colors"
          />
          {filterQuery && (
            <button
              onClick={() => setFilterQuery('')}
              className="absolute right-2 top-1/2 -translate-y-1/2 text-[#7c8792] hover:text-[#f3f5f7] text-[10px]"
            >
              ✕
            </button>
          )}
        </div>

        {/* Pure Folder Tree & Files inside it */}
        <div className="flex flex-col overflow-y-auto max-h-[calc(100vh-170px)] pr-1 space-y-0.5">
          <div className="text-[10px] font-semibold uppercase tracking-wider text-[#7c8792] px-1 py-1">
            Pohon Direktori Lokal
          </div>

          {filteredFolders.map((folder) => {
            const isFolderSelected = selectedFolderId === folder.id;
            const isExpanded = expandedFolderIds.includes(folder.id);
            const folderFiles = files.filter((f) => f.folderId === folder.id);

            return (
              <div key={folder.id} className="flex flex-col">
                {/* Parent Folder Row */}
                <button
                  onClick={() => onSelectFolder(folder.id)}
                  className={`h-7 px-2 rounded flex items-center justify-between text-left transition-colors cursor-pointer ${
                    isFolderSelected
                      ? 'bg-[#2c3a4d] text-[#8ab4f8] font-medium'
                      : 'text-[#b3bcc5] hover:bg-[#23272c] hover:text-[#f3f5f7]'
                  }`}
                >
                  <div className="flex items-center gap-1.5 truncate pr-2">
                    <span
                      onClick={(e) => toggleFolder(folder.id, e)}
                      className="p-0.5 text-[#7c8792] hover:text-[#f3f5f7]"
                    >
                      {folder.children || folderFiles.length > 0 ? (
                        isExpanded ? (
                          <ChevronDown className="w-3 h-3" />
                        ) : (
                          <ChevronRight className="w-3 h-3" />
                        )
                      ) : (
                        <div className="w-3 h-3" />
                      )}
                    </span>
                    {isFolderSelected ? (
                      <FolderOpen className="w-3.5 h-3.5 text-[#8ab4f8] shrink-0" />
                    ) : (
                      <Folder className="w-3.5 h-3.5 text-[#7c8792] shrink-0" />
                    )}
                    <span className="truncate">{folder.name}</span>
                  </div>
                  <span className="font-mono text-[10px] text-[#7c8792] tabular-nums">
                    {folder.fileCount}
                  </span>
                </button>

                {/* Subfolders and files inside if expanded */}
                {isExpanded && (
                  <div className="pl-4 border-l border-[#333a42] ml-3 my-0.5 space-y-0.5">
                    {/* Nested Child Folders */}
                    {folder.children?.map((sub) => {
                      const isSubSelected = selectedFolderId === sub.id;
                      return (
                        <button
                          key={sub.id}
                          onClick={() => onSelectFolder(sub.id)}
                          className={`w-full h-6 px-2 rounded flex items-center justify-between text-left text-[11px] transition-colors ${
                            isSubSelected
                              ? 'bg-[#2c3a4d] text-[#8ab4f8] font-medium'
                              : 'text-[#b3bcc5] hover:bg-[#23272c] hover:text-[#f3f5f7]'
                          }`}
                        >
                          <div className="flex items-center gap-1.5 truncate">
                            <Folder className="w-3 h-3 text-[#7c8792] shrink-0" />
                            <span className="truncate">{sub.name}</span>
                          </div>
                          <span className="font-mono text-[9px] text-[#7c8792]">
                            {sub.fileCount}
                          </span>
                        </button>
                      );
                    })}

                    {/* Files inside this folder */}
                    {folderFiles.map((file) => {
                      const isFileSelected = selectedFileId === file.id;
                      return (
                        <button
                          key={file.id}
                          onClick={() => onSelectFile(file.id)}
                          className={`w-full h-6 px-1.5 rounded flex items-center justify-between text-left text-[11px] font-mono transition-colors ${
                            isFileSelected
                              ? 'bg-[#8ab4f8]/20 text-[#8ab4f8] font-semibold'
                              : 'text-[#7c8792] hover:bg-[#23272c] hover:text-[#f3f5f7]'
                          }`}
                          title={`${file.name} (${file.sizeFormatted})`}
                        >
                          <div className="flex items-center gap-1.5 truncate pr-2">
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
      </div>

      {/* Bottom Section: Settings & Quick Actions */}
      <div className="px-3 pt-2 border-t border-[#333a42] flex flex-col gap-1">
        <button
          onClick={onOpenSettings}
          className="h-8 px-2.5 rounded bg-[#23272c] hover:bg-[#2a2f35] text-[#b3bcc5] hover:text-[#f3f5f7] flex items-center justify-between transition-colors focus-ring cursor-pointer"
        >
          <div className="flex items-center gap-2">
            <Settings className="w-3.5 h-3.5 text-[#8ab4f8]" />
            <span>Pengaturan & Mode AI</span>
          </div>
          <kbd className="text-[10px] font-mono text-[#7c8792] px-1 bg-[#141619] rounded border border-[#333a42]">
            Ctrl+,
          </kbd>
        </button>
      </div>
    </aside>
  );
};
