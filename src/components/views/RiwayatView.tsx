import React, { useState, useMemo, useRef } from 'react';
import {
  RotateCcw,
  GitBranch,
  Folder,
  FolderOpen,
  ChevronRight,
  ChevronDown,
  ChevronLeft,
  Plus,
  Minus,
  FileText,
  Search,
  CheckCircle2,
  File,
  Image as ImageIcon,
  Video,
  Music,
  Archive,
  Package,
  Code2,
  SlidersHorizontal,
  FolderTree,
  Undo2,
  Sparkles,
} from 'lucide-react';
import { FileItem, FolderNode, HistoryCommitNode, OperationManifest } from '../../types';
import { INITIAL_FOLDERS, INITIAL_HISTORY_NODES } from '../../data/mockData';

interface RiwayatViewProps {
  manifests?: OperationManifest[];
  files?: FileItem[];
  folders?: FolderNode[];
  onRollback: (manifestId: string) => void;
  onRestoreFile?: (fileName: string, originalPath: string) => void;
}

export const RiwayatView: React.FC<RiwayatViewProps> = ({
  manifests = [],
  files = [],
  folders = INITIAL_FOLDERS,
  onRollback,
  onRestoreFile,
}) => {
  // Commit nodes state
  const [historyNodes] = useState<HistoryCommitNode[]>(INITIAL_HISTORY_NODES);
  const [activeNodeId, setActiveNodeId] = useState<string>(
    INITIAL_HISTORY_NODES[0]?.id || 'node-dev-4'
  );

  // Search & Filter state
  const [searchQuery, setSearchQuery] = useState('');
  const [filterMode, setFilterMode] = useState<'all' | 'changes_only'>('all');

  // Expanded folders state (default to all expanded for quick visibility)
  const [expandedFolders, setExpandedFolders] = useState<Record<string, boolean>>({
    'f-downloads': true,
    'f-dokumen': true,
    'f-dokumen-keuangan': true,
    'f-dokumen-skripsi': true,
    'f-dokumen-operasional': true,
    'f-media': true,
    'f-media-foto': true,
    'f-media-video': true,
    'f-installers': true,
    'f-kode': true,
  });

  // Timeline horizontal scroll ref
  const timelineScrollRef = useRef<HTMLDivElement>(null);

  // Toggle folder expand/collapse
  const toggleFolder = (folderId: string) => {
    setExpandedFolders((prev) => ({ ...prev, [folderId]: !prev[folderId] }));
  };

  // Expand all / collapse all
  const handleExpandAll = () => {
    const updated: Record<string, boolean> = {};
    const recurse = (list: FolderNode[]) => {
      list.forEach((f) => {
        updated[f.id] = true;
        if (f.children) recurse(f.children);
      });
    };
    recurse(folders);
    setExpandedFolders(updated);
  };

  const handleCollapseAll = () => {
    setExpandedFolders({});
  };

  // Timeline scroll buttons
  const scrollTimeline = (direction: 'left' | 'right') => {
    if (timelineScrollRef.current) {
      const scrollAmount = direction === 'left' ? -350 : 350;
      timelineScrollRef.current.scrollBy({ left: scrollAmount, behavior: 'smooth' });
    }
  };

  // Active commit node
  const activeNode = useMemo(() => {
    return historyNodes.find((n) => n.id === activeNodeId) || historyNodes[0];
  }, [historyNodes, activeNodeId]);

  // Diff items in the active commit
  const commitDiffs = useMemo(() => {
    return activeNode.details.map((item, idx) => ({
      ...item,
      id: `${activeNode.id}-${idx}`,
    }));
  }, [activeNode]);

  // Statistics for active commit
  const commitStats = useMemo(() => {
    let added = 0;
    let deleted = 0;
    commitDiffs.forEach((item) => {
      if (item.type === 'added') added++;
      else if (item.type === 'deleted') deleted++;
      else if (item.type === 'moved') {
        added++;
        deleted++;
      }
    });
    return { added, deleted, totalChanges: added + deleted };
  }, [commitDiffs]);

  // Handle Rollback
  const handleRollbackActiveCommit = () => {
    if (
      confirm(
        `Rollback ke snapshot "${activeNode.commitHash}" (${activeNode.title})?\nSemua berkas akan dipulihkan ke posisi pada snapshot ini.`
      )
    ) {
      onRollback(activeNode.id);
    }
  };

  // Handle Restore single file
  const handleRestoreFileAction = (fileName: string, originalPath: string) => {
    if (confirm(`Pulihkan berkas "${fileName}" ke lokasi semula (${originalPath})?`)) {
      if (onRestoreFile) {
        onRestoreFile(fileName, originalPath);
      } else {
        alert(`Berkas ${fileName} berhasil dipulihkan ke ${originalPath}`);
      }
    }
  };

  // Helper: File Icon based on category or extension
  const renderFileIcon = (category: string, ext: string) => {
    const c = category?.toLowerCase() || '';
    const e = ext?.toLowerCase() || '';
    if (c === 'image' || ['png', 'jpg', 'jpeg', 'webp', 'svg'].includes(e)) {
      return <ImageIcon className="w-3.5 h-3.5 text-[#b49bea] shrink-0" />;
    }
    if (c === 'video' || ['mp4', 'mkv', 'mov', 'avi'].includes(e)) {
      return <Video className="w-3.5 h-3.5 text-[#e58e9b] shrink-0" />;
    }
    if (c === 'audio' || ['mp3', 'wav', 'flac'].includes(e)) {
      return <Music className="w-3.5 h-3.5 text-[#82c99a] shrink-0" />;
    }
    if (c === 'archive' || ['zip', 'rar', '7z'].includes(e)) {
      return <Archive className="w-3.5 h-3.5 text-[#e5b567] shrink-0" />;
    }
    if (c === 'installer' || ['exe', 'msi'].includes(e)) {
      return <Package className="w-3.5 h-3.5 text-[#73c9d4] shrink-0" />;
    }
    if (c === 'code' || ['ts', 'tsx', 'js', 'json', 'py'].includes(e)) {
      return <Code2 className="w-3.5 h-3.5 text-[#83b5e8] shrink-0" />;
    }
    return <FileText className="w-3.5 h-3.5 text-[#8ab4f8] shrink-0" />;
  };

  // Recursive renderer for Folder Node in the single tree
  const renderFolderSnapshot = (folder: FolderNode, depth = 0) => {
    const folderPathLower = folder.path.toLowerCase();

    // 1. Files DELETED / MOVED FROM this folder (Merah / -)
    const deletedHere = commitDiffs.filter((item) => {
      const isFromHere = item.from.toLowerCase().startsWith(folderPathLower);
      // Ensure it matches this exact folder level, not subfolder
      const remainder = item.from.slice(folder.path.length).replace(/^[\\/]/, '');
      const isInDirectFolder = !remainder.includes('\\') && !remainder.includes('/');
      return isFromHere && isInDirectFolder && (item.type === 'deleted' || item.type === 'moved');
    });

    // 2. Files ADDED / MOVED TO this folder (Hijau / +)
    const addedHere = commitDiffs.filter((item) => {
      const isToHere = item.to.toLowerCase().startsWith(folderPathLower);
      const remainder = item.to.slice(folder.path.length).replace(/^[\\/]/, '');
      const isInDirectFolder = !remainder.includes('\\') && !remainder.includes('/');
      return isToHere && isInDirectFolder && (item.type === 'added' || item.type === 'moved');
    });

    // 3. Unchanged files currently residing in this folder
    const unchangedHere = files.filter((f) => {
      const isInFolder = f.path.toLowerCase().startsWith(folderPathLower);
      const remainder = f.path.slice(folder.path.length).replace(/^[\\/]/, '');
      const isInDirectFolder = !remainder.includes('\\') && !remainder.includes('/');
      // Not already accounted as newly added in this snapshot
      const isNewlyAdded = addedHere.some((a) => a.fileName.toLowerCase() === f.name.toLowerCase());
      // Nor deleted
      const isDeleted = deletedHere.some((d) => d.fileName.toLowerCase() === f.name.toLowerCase());
      return isInFolder && isInDirectFolder && !isNewlyAdded && !isDeleted;
    });

    // Changes count for this folder
    const folderAddedCount = addedHere.length;
    const folderDeletedCount = deletedHere.length;
    const hasChangesInThisFolder = folderAddedCount > 0 || folderDeletedCount > 0;

    // Check if children have changes
    const checkChildrenHaveChanges = (children?: FolderNode[]): boolean => {
      if (!children) return false;
      return children.some((c) => {
        const cPathLower = c.path.toLowerCase();
        const hasAdd = commitDiffs.some(
          (d) =>
            (d.type === 'added' || d.type === 'moved') &&
            d.to.toLowerCase().startsWith(cPathLower)
        );
        const hasDel = commitDiffs.some(
          (d) =>
            (d.type === 'deleted' || d.type === 'moved') &&
            d.from.toLowerCase().startsWith(cPathLower)
        );
        return hasAdd || hasDel || checkChildrenHaveChanges(c.children);
      });
    };

    const hasSubfolderChanges = checkChildrenHaveChanges(folder.children);

    // If filtering by changes only and no changes in folder nor subfolders, skip
    if (filterMode === 'changes_only' && !hasChangesInThisFolder && !hasSubfolderChanges) {
      return null;
    }

    // Filter files based on search query
    const q = searchQuery.toLowerCase().trim();
    const matchesSearch = (name: string, path: string) => {
      if (!q) return true;
      return name.toLowerCase().includes(q) || path.toLowerCase().includes(q);
    };

    const visibleDeleted = deletedHere.filter((d) => matchesSearch(d.fileName, d.from));
    const visibleAdded = addedHere.filter((a) => matchesSearch(a.fileName, a.to));
    const visibleUnchanged =
      filterMode === 'changes_only'
        ? []
        : unchangedHere.filter((u) => matchesSearch(u.name, u.path));

    const totalVisibleFiles = visibleDeleted.length + visibleAdded.length + visibleUnchanged.length;
    const isExpanded = !!expandedFolders[folder.id];

    return (
      <div key={folder.id} className="flex flex-col">
        {/* FOLDER HEADER ROW */}
        <div
          onClick={() => toggleFolder(folder.id)}
          className={`group flex items-center justify-between py-2 px-3 rounded-lg transition-colors cursor-pointer select-none ${
            hasChangesInThisFolder
              ? 'bg-[#191c20] hover:bg-[#20252b] border border-[#333a42]/80 my-0.5'
              : 'hover:bg-[#191c20] text-[#b3bcc5]'
          }`}
          style={{ paddingLeft: `${Math.max(12, depth * 22 + 12)}px` }}
        >
          <div className="flex items-center gap-2 min-w-0">
            {/* Expand / Collapse Chevron */}
            <span className="p-0.5 text-[#7c8792] group-hover:text-[#f3f5f7] transition-transform">
              {isExpanded ? (
                <ChevronDown className="w-3.5 h-3.5" />
              ) : (
                <ChevronRight className="w-3.5 h-3.5" />
              )}
            </span>

            {/* Folder Icon */}
            {isExpanded ? (
              <FolderOpen className="w-4 h-4 text-[#8ab4f8] shrink-0" />
            ) : (
              <Folder className="w-4 h-4 text-[#7c8792] group-hover:text-[#8ab4f8] shrink-0 transition-colors" />
            )}

            {/* Folder Name & Full Path */}
            <span className="text-xs font-semibold text-[#f3f5f7] truncate">
              {folder.name}
            </span>
            <span className="text-[11px] font-mono text-[#7c8792] truncate hidden md:inline">
              ({folder.path})
            </span>
          </div>

          {/* RIGHT BADGES: IJO (+) & MERAH (-) ALA GITHUB DESKTOP */}
          <div className="flex items-center gap-2 shrink-0 font-mono text-[11px]">
            {folderAddedCount > 0 && (
              <span
                className="px-2 py-0.5 rounded-md bg-[#2ea043]/20 text-[#3fb950] font-bold border border-[#2ea043]/50 flex items-center gap-1 shadow-xs"
                title={`${folderAddedCount} berkas baru ada di folder ini`}
              >
                <Plus className="w-3 h-3" />
                <span>{folderAddedCount} baru</span>
              </span>
            )}
            {folderDeletedCount > 0 && (
              <span
                className="px-2 py-0.5 rounded-md bg-[#f85149]/20 text-[#f85149] font-bold border border-[#f85149]/50 flex items-center gap-1 shadow-xs"
                title={`${folderDeletedCount} berkas ditiadakan dari folder ini`}
              >
                <Minus className="w-3 h-3" />
                <span>{folderDeletedCount} ditiadakan</span>
              </span>
            )}
            <span className="text-[10px] text-[#7c8792] px-1.5 py-0.5 bg-[#141619] rounded border border-[#23272c]">
              {totalVisibleFiles} berkas
            </span>
          </div>
        </div>

        {/* FOLDER CONTENTS (SUBFOLDERS & FILES DIRECTLY IN THE TREE) */}
        {isExpanded && (
          <div className="flex flex-col space-y-1 my-1">
            {/* 1. Subfolders */}
            {folder.children &&
              folder.children.map((sub) => renderFolderSnapshot(sub, depth + 1))}

            {/* 2. BERKAS DITIADAKAN DARI FOLDER INI (MERAH / -) */}
            {visibleDeleted.map((item) => (
              <div
                key={`del-${item.id}`}
                className="mx-3 my-0.5 p-2.5 rounded-lg bg-[#f85149]/10 border border-[#f85149]/35 flex items-center justify-between gap-3 text-xs animate-in fade-in transition-all"
                style={{ marginLeft: `${depth * 22 + 36}px` }}
              >
                <div className="flex items-center gap-2.5 min-w-0">
                  {/* Badge Kotak Merah (-) */}
                  <div className="w-5 h-5 rounded bg-[#f85149]/25 border border-[#f85149]/60 flex items-center justify-center text-[#f85149] shrink-0 font-bold">
                    <Minus className="w-3.5 h-3.5" />
                  </div>

                  <div className="min-w-0">
                    <div className="flex items-center gap-2 truncate">
                      <span className="font-mono font-semibold text-[#f85149] line-through truncate text-xs">
                        {item.fileName}
                      </span>
                      <span className="px-1.5 py-0.2 rounded text-[9px] font-bold font-mono bg-[#f85149]/20 text-[#f85149] border border-[#f85149]/40 shrink-0">
                        DITIADAKAN DARI FOLDER INI
                      </span>
                    </div>

                    <div className="text-[10px] text-[#f85149]/80 truncate mt-0.5 font-mono flex items-center gap-1.5">
                      <span>↳</span>
                      {item.type === 'moved' ? (
                        <span>Dipindahkan ke: <strong className="text-white/90">{item.to}</strong></span>
                      ) : (
                        <span>Dihapus ke Recycle Bin ({item.reason})</span>
                      )}
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-3 shrink-0">
                  <span className="font-mono text-xs text-[#f85149] font-bold">
                    - {item.sizeFormatted}
                  </span>
                  <button
                    onClick={() => handleRestoreFileAction(item.fileName, item.from)}
                    className="px-2 py-1 bg-[#141619] hover:bg-[#23272c] border border-[#f85149]/50 text-[10px] font-semibold text-[#f85149] rounded transition-colors cursor-pointer flex items-center gap-1"
                    title="Pulihkan berkas ini ke folder ini kembali"
                  >
                    <Undo2 className="w-3 h-3" />
                    <span>Pulihkan</span>
                  </button>
                </div>
              </div>
            ))}

            {/* 3. BERKAS BARU DI FOLDER INI (HIJAU / +) */}
            {visibleAdded.map((item) => (
              <div
                key={`add-${item.id}`}
                className="mx-3 my-0.5 p-2.5 rounded-lg bg-[#2ea043]/10 border border-[#2ea043]/35 flex items-center justify-between gap-3 text-xs animate-in fade-in transition-all"
                style={{ marginLeft: `${depth * 22 + 36}px` }}
              >
                <div className="flex items-center gap-2.5 min-w-0">
                  {/* Badge Kotak Hijau (+) */}
                  <div className="w-5 h-5 rounded bg-[#2ea043]/25 border border-[#2ea043]/60 flex items-center justify-center text-[#3fb950] shrink-0 font-bold">
                    <Plus className="w-3.5 h-3.5" />
                  </div>

                  <div className="min-w-0">
                    <div className="flex items-center gap-2 truncate">
                      <span className="font-mono font-bold text-[#3fb950] truncate text-xs">
                        {item.fileName}
                      </span>
                      <span className="px-1.5 py-0.2 rounded text-[9px] font-bold font-mono bg-[#2ea043]/20 text-[#3fb950] border border-[#2ea043]/40 shrink-0">
                        FILE BARU DI FOLDER INI
                      </span>
                    </div>

                    <div className="text-[10px] text-[#3fb950]/80 truncate mt-0.5 font-mono flex items-center gap-1.5">
                      <span>↳</span>
                      <span>Dari: <strong className="text-white/90">{item.from}</strong> ({item.reason})</span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-3 shrink-0">
                  <span className="font-mono text-xs text-[#3fb950] font-bold">
                    + {item.sizeFormatted}
                  </span>
                </div>
              </div>
            ))}

            {/* 4. BERKAS TIDAK BERUBAH (NETRAL / TETAP ADA) */}
            {visibleUnchanged.map((file) => (
              <div
                key={`unchanged-${file.id}`}
                className="mx-3 py-1.5 px-3 rounded hover:bg-[#191c20] text-[#7c8792] hover:text-[#b3bcc5] text-xs flex items-center justify-between transition-colors"
                style={{ marginLeft: `${depth * 22 + 36}px` }}
              >
                <div className="flex items-center gap-2 min-w-0 truncate">
                  {renderFileIcon(file.category, file.extension)}
                  <span className="font-mono truncate">{file.name}</span>
                  <span className="text-[10px] text-[#555f6d] font-mono shrink-0 hidden sm:inline">
                    · Tetap ada
                  </span>
                </div>

                <div className="flex items-center gap-2 shrink-0 font-mono text-[11px] text-[#555f6d]">
                  <span>{file.sizeFormatted}</span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="flex-1 flex flex-col bg-[#141619] overflow-hidden select-none">
      {/* 1. TOP HEADER & INTERACTIVE SCROLLABLE GIT COMMIT TIMELINE */}
      <div className="bg-[#191c20] border-b border-[#333a42] flex flex-col shrink-0 shadow-sm">
        {/* Info Strip Atas */}
        <div className="h-12 px-5 border-b border-[#23272c] flex items-center justify-between shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-[#8ab4f8]/20 flex items-center justify-center text-[#8ab4f8]">
              <GitBranch className="w-4 h-4" />
            </div>
            <div>
              <div className="text-xs font-bold text-[#f3f5f7] flex items-center gap-2">
                <span>Pohon Riwayat & Garis Waktu Snapshot</span>
                <span className="px-1.5 py-0.5 rounded text-[10px] font-mono font-bold bg-[#2c3a4d] text-[#8ab4f8] border border-[#8ab4f8]/30">
                  {historyNodes.length} Titik Snapshot
                </span>
              </div>
              <div className="text-[11px] text-[#7c8792]">
                Geser node dengan scroll bar di bawah untuk berpindah antar titik riwayat
              </div>
            </div>
          </div>

          <div className="flex items-center gap-3">
            {/* Scroll Navigation Controls */}
            <div className="flex items-center bg-[#141619] border border-[#333a42] rounded-md p-0.5">
              <button
                onClick={() => scrollTimeline('left')}
                className="p-1 text-[#7c8792] hover:text-[#f3f5f7] hover:bg-[#23272c] rounded cursor-pointer transition-colors"
                title="Geser timeline ke kiri"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              <button
                onClick={() => scrollTimeline('right')}
                className="p-1 text-[#7c8792] hover:text-[#f3f5f7] hover:bg-[#23272c] rounded cursor-pointer transition-colors"
                title="Geser timeline ke kanan"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>

            <div className="text-right text-xs hidden md:block">
              <span className="text-[#7c8792]">Snapshot Aktif: </span>
              <span className="font-mono font-bold text-[#8ab4f8]">{activeNode.commitHash}</span>
              <span className="text-[#7c8792]"> ({activeNode.branchLabel})</span>
            </div>

            <button
              onClick={handleRollbackActiveCommit}
              className="h-8 px-3.5 rounded-md bg-[#e0ab5c]/20 hover:bg-[#e0ab5c]/30 border border-[#e0ab5c]/50 text-xs font-semibold text-[#e0ab5c] flex items-center gap-1.5 transition-colors cursor-pointer shadow-xs"
              title="Pulihkan seluruh susunan berkas ke titik riwayat snapshot ini"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Rollback ke Titik Ini</span>
            </button>
          </div>
        </div>

        {/* 2. HORIZONTAL SCROLLABLE TIMELINE GRAPH WITH PROMINENT SCROLLBAR */}
        <div
          ref={timelineScrollRef}
          className="px-5 py-3 overflow-x-auto bg-[#141619]/80 scrollbar-thin scrollbar-track-[#141619] scrollbar-thumb-[#333a42] hover:scrollbar-thumb-[#8ab4f8] transition-colors"
          style={{ scrollBehavior: 'smooth' }}
        >
          {/* Canvas container with guaranteed width so it smoothly scrolls horizontally */}
          <div className="relative min-w-[1320px] h-[190px] flex items-center select-none">
            {/* SVG Graph Drawing (Extended Width 1320px for Smooth Scrolling) */}
            <svg className="w-full h-full overflow-visible" viewBox="0 0 1320 190">
              <defs>
                <filter id="glow-selected" x="-30%" y="-30%" width="160%" height="160%">
                  <feGaussianBlur stdDeviation="3" result="blur" />
                  <feComposite in="SourceGraphic" in2="blur" operator="over" />
                </filter>
              </defs>

              {/* BRANCH 0: MASTER (Ungu - #8b5cf6) at y=26 */}
              <line x1="130" y1="26" x2="1150" y2="26" stroke="#8b5cf6" strokeWidth="3.5" strokeLinecap="round" />
              <line x1="1150" y1="26" x2="1240" y2="26" stroke="#8b5cf6" strokeWidth="3.5" strokeDasharray="5,6" />
              <circle cx="1260" cy="26" r="4.5" fill="#8b5cf6" />

              {/* BRANCH 1: DEVELOP (Oranye - #f97316) at y=76 */}
              {/* Diverge from Master Node (x=165, y=26) down to Develop Node (x=275, y=76) */}
              <path
                d="M 165 26 C 165 56, 215 76, 275 76"
                fill="none"
                stroke="#f97316"
                strokeWidth="4"
                strokeLinecap="round"
              />
              <line x1="275" y1="76" x2="1150" y2="76" stroke="#f97316" strokeWidth="3.5" strokeLinecap="round" />
              <line x1="1150" y1="76" x2="1240" y2="76" stroke="#f97316" strokeWidth="3.5" strokeDasharray="5,6" />
              <circle cx="1260" cy="76" r="4.5" fill="#f97316" />

              {/* BRANCH 2: FEATURE CLEAN (Kuning - #eab308) at y=126 */}
              {/* Diverge from Develop (x=415, y=76) to Feature Clean (x=550, y=126) */}
              <path
                d="M 415 76 C 415 106, 470 126, 550 126"
                fill="none"
                stroke="#eab308"
                strokeWidth="4"
                strokeLinecap="round"
              />
              {/* Merge back up to Develop (x=700, y=76) */}
              <path
                d="M 550 126 C 630 126, 670 106, 700 76"
                fill="none"
                stroke="#eab308"
                strokeWidth="4"
                strokeLinecap="round"
              />

              {/* BRANCH 3: FEATURE AI (Cyan - #06b6d4) at y=168 */}
              {/* Diverge from Develop (x=275, y=76) to Feature AI (x=415, y=168) */}
              <path
                d="M 275 76 C 275 130, 340 168, 415 168"
                fill="none"
                stroke="#06b6d4"
                strokeWidth="4"
                strokeLinecap="round"
              />
              <line x1="415" y1="168" x2="880" y2="168" stroke="#06b6d4" strokeWidth="3.5" strokeLinecap="round" />
              {/* Merge back up to Develop (x=1020, y=76) */}
              <path
                d="M 880 168 C 960 168, 990 106, 1020 76"
                fill="none"
                stroke="#06b6d4"
                strokeWidth="4"
                strokeLinecap="round"
              />

              {/* RENDER COMMIT NODES ON THE GRAPH */}
              {/* 1. MASTER COMMITS */}
              {[
                { x: 165, y: 26, id: 'node-master-0', hash: '8a1200f', title: 'Master Init' },
                { x: 340, y: 26, id: 'node-master-1', hash: '9c3311b', title: 'Release v1.1' },
                { x: 700, y: 26, id: 'node-master-2', hash: 'b45522c', title: 'Snapshot v1.2' },
                { x: 1020, y: 26, id: 'node-master-3', hash: 'd67733d', title: 'Merge Staging' },
              ].map((n) => {
                const isSelected = activeNodeId === n.id;
                return (
                  <g key={n.id} onClick={() => setActiveNodeId(n.id)} className="cursor-pointer group">
                    {isSelected && (
                      <circle cx={n.x} cy={n.y} r="22" fill="#8b5cf6" fillOpacity="0.25" className="animate-pulse" />
                    )}
                    <circle
                      cx={n.x}
                      cy={n.y}
                      r="13"
                      fill="#8b5cf6"
                      stroke={isSelected ? '#ffffff' : '#8b5cf6'}
                      strokeWidth={isSelected ? '2.5' : '1'}
                    />
                    <circle cx={n.x} cy={n.y} r="8.5" fill="#141619" />
                    <circle cx={n.x} cy={n.y} r="5" fill={isSelected ? '#ffffff' : '#8b5cf6'} />
                    {/* Label below node */}
                    <text x={n.x} y={n.y - 18} textAnchor="middle" fill="#b3bcc5" fontSize="10" fontFamily="monospace">
                      {n.hash}
                    </text>
                  </g>
                );
              })}

              {/* 2. DEVELOP COMMITS (Utama untuk perubahan berkas) */}
              {[
                { x: 275, y: 76, id: 'node-dev-1', hash: '1a73f88', title: 'Struktur Dokumen' },
                { x: 415, y: 76, id: 'node-dev-2', hash: '2f48d91', title: 'Staging Media' },
                { x: 700, y: 76, id: 'node-dev-3', hash: '4c99e12', title: 'Merge Kebersihan' },
                { x: 860, y: 76, id: 'node-dev-4', hash: '8f2a1b9', title: 'Rapikan Keuangan & Installer' },
                { x: 1020, y: 76, id: 'node-dev-5', hash: '9e11f02', title: 'Staging Terkini' },
              ].map((n) => {
                const isSelected = activeNodeId === n.id;
                return (
                  <g key={n.id} onClick={() => setActiveNodeId(n.id)} className="cursor-pointer group">
                    {isSelected && (
                      <circle cx={n.x} cy={n.y} r="22" fill="#f97316" fillOpacity="0.25" className="animate-pulse" />
                    )}
                    <circle
                      cx={n.x}
                      cy={n.y}
                      r="14"
                      fill="#f97316"
                      stroke={isSelected ? '#ffffff' : '#f97316'}
                      strokeWidth={isSelected ? '2.5' : '1'}
                    />
                    <circle cx={n.x} cy={n.y} r="9.5" fill="#141619" />
                    <circle cx={n.x} cy={n.y} r="5.5" fill={isSelected ? '#ffffff' : '#f97316'} />
                    <text x={n.x} y={n.y - 18} textAnchor="middle" fill="#f3f5f7" fontSize="11" fontWeight="bold" fontFamily="monospace">
                      {n.hash}
                    </text>
                  </g>
                );
              })}

              {/* 3. FEATURE YELLOW COMMITS */}
              {[
                { x: 550, y: 126, id: 'node-feat-clean-1', hash: '6d11a88', title: 'Audit Sampah' },
              ].map((n) => {
                const isSelected = activeNodeId === n.id;
                return (
                  <g key={n.id} onClick={() => setActiveNodeId(n.id)} className="cursor-pointer group">
                    {isSelected && (
                      <circle cx={n.x} cy={n.y} r="22" fill="#eab308" fillOpacity="0.25" className="animate-pulse" />
                    )}
                    <circle
                      cx={n.x}
                      cy={n.y}
                      r="13"
                      fill="#eab308"
                      stroke={isSelected ? '#ffffff' : '#eab308'}
                      strokeWidth={isSelected ? '2.5' : '1'}
                    />
                    <circle cx={n.x} cy={n.y} r="8.5" fill="#141619" />
                    <circle cx={n.x} cy={n.y} r="5" fill={isSelected ? '#ffffff' : '#eab308'} />
                    <text x={n.x} y={n.y - 18} textAnchor="middle" fill="#b3bcc5" fontSize="10" fontFamily="monospace">
                      {n.hash}
                    </text>
                  </g>
                );
              })}

              {/* 4. FEATURE CYAN COMMITS */}
              {[
                { x: 415, y: 168, id: 'node-feat-ai-1', hash: '4a09c21', title: 'Fitur Klasifikasi' },
                { x: 620, y: 168, id: 'node-feat-ai-2', hash: '5e71f33', title: 'Restorasi Batch' },
                { x: 880, y: 168, id: 'node-feat-ai-3', hash: '7c32e99', title: 'Indeks Metadata' },
              ].map((n) => {
                const isSelected = activeNodeId === n.id;
                return (
                  <g key={n.id} onClick={() => setActiveNodeId(n.id)} className="cursor-pointer group">
                    {isSelected && (
                      <circle cx={n.x} cy={n.y} r="22" fill="#06b6d4" fillOpacity="0.25" className="animate-pulse" />
                    )}
                    <circle
                      cx={n.x}
                      cy={n.y}
                      r="13"
                      fill="#06b6d4"
                      stroke={isSelected ? '#ffffff' : '#06b6d4'}
                      strokeWidth={isSelected ? '2.5' : '1'}
                    />
                    <circle cx={n.x} cy={n.y} r="8.5" fill="#141619" />
                    <circle cx={n.x} cy={n.y} r="5" fill={isSelected ? '#ffffff' : '#06b6d4'} />
                    <text x={n.x} y={n.y - 18} textAnchor="middle" fill="#b3bcc5" fontSize="10" fontFamily="monospace">
                      {n.hash}
                    </text>
                  </g>
                );
              })}
            </svg>

            {/* Left Lane Badges (Master, Develop, Feature) */}
            <div className="absolute left-0 top-0 bottom-0 w-28 flex flex-col justify-around py-2 pointer-events-none select-none">
              <span className="h-6 w-24 rounded px-2.5 flex items-center justify-center text-[10px] font-bold tracking-wider text-white bg-[#8b5cf6] shadow-sm">
                MASTER
              </span>
              <span className="h-6 w-24 rounded px-2.5 flex items-center justify-center text-[10px] font-bold tracking-wider text-white bg-[#f97316] shadow-sm">
                DEVELOP
              </span>
              <span className="h-6 w-24 rounded px-2.5 flex items-center justify-center text-[10px] font-bold tracking-wider text-white bg-[#eab308] shadow-sm">
                FEATURE
              </span>
              <span className="h-6 w-24 rounded px-2.5 flex items-center justify-center text-[10px] font-bold tracking-wider text-white bg-[#06b6d4] shadow-sm">
                FEATURE
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* 2. FULL SECTION WORKSPACE: SATU POHON FOLDER SNAPSHOT (SINGLE TREE FOLDER SECTION) */}
      <div className="flex-1 flex flex-col overflow-hidden bg-[#141619]">
        {/* Action & Filter Toolbar for Snapshot Tree */}
        <div className="p-3.5 bg-[#191c20] border-b border-[#333a42] flex flex-col lg:flex-row lg:items-center justify-between gap-3 shrink-0">
          <div className="flex items-center gap-2.5 min-w-0">
            <div className="w-7 h-7 rounded-lg bg-[#2c3a4d] flex items-center justify-center text-[#8ab4f8]">
              <FolderTree className="w-4 h-4" />
            </div>
            <div className="min-w-0">
              <div className="flex items-center gap-2 flex-wrap">
                <span
                  className="px-2 py-0.5 rounded text-[10px] font-bold font-mono text-white"
                  style={{ backgroundColor: activeNode.branchColor || '#f97316' }}
                >
                  {activeNode.branchLabel}
                </span>
                <span className="font-mono text-xs font-bold text-[#8ab4f8]">
                  {activeNode.commitHash}
                </span>
                <span className="text-xs font-semibold text-[#f3f5f7] truncate">
                  {activeNode.title}
                </span>
              </div>
              <div className="text-[11px] text-[#7c8792] mt-0.5">
                Snapshot direktori oleh {activeNode.author} · {activeNode.timestamp}
              </div>
            </div>
          </div>

          {/* Quick Filter Buttons & Search Input */}
          <div className="flex items-center gap-2.5 shrink-0 flex-wrap">
            {/* Filter Toggle: Semua vs Hanya Perubahan */}
            <div className="flex items-center p-0.5 bg-[#141619] border border-[#333a42] rounded-lg text-xs">
              <button
                onClick={() => setFilterMode('all')}
                className={`px-3 py-1 rounded-md transition-colors cursor-pointer font-medium ${
                  filterMode === 'all'
                    ? 'bg-[#2c3a4d] text-[#8ab4f8] shadow-xs'
                    : 'text-[#7c8792] hover:text-[#f3f5f7]'
                }`}
              >
                Semua Isi Folder
              </button>
              <button
                onClick={() => setFilterMode('changes_only')}
                className={`px-3 py-1 rounded-md flex items-center gap-1.5 transition-colors cursor-pointer font-medium ${
                  filterMode === 'changes_only'
                    ? 'bg-[#2ea043]/30 text-[#3fb950] font-bold shadow-xs'
                    : 'text-[#7c8792] hover:text-[#3fb950]'
                }`}
              >
                <Sparkles className="w-3.5 h-3.5" />
                <span>Hanya Perubahan (+ / -)</span>
              </button>
            </div>

            {/* Expand / Collapse All buttons */}
            <div className="flex items-center gap-1 text-xs text-[#7c8792]">
              <button
                onClick={handleExpandAll}
                className="px-2 py-1 hover:bg-[#23272c] hover:text-[#f3f5f7] rounded border border-[#333a42] transition-colors cursor-pointer text-[11px]"
                title="Buka semua subfolder"
              >
                Buka Semua
              </button>
              <button
                onClick={handleCollapseAll}
                className="px-2 py-1 hover:bg-[#23272c] hover:text-[#f3f5f7] rounded border border-[#333a42] transition-colors cursor-pointer text-[11px]"
                title="Tutup semua subfolder"
              >
                Tutup Semua
              </button>
            </div>

            {/* Search input in Snapshot */}
            <div className="relative">
              <Search className="w-3.5 h-3.5 text-[#7c8792] absolute left-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Cari berkas di snapshot..."
                className="w-48 h-8 pl-8 pr-3 bg-[#141619] border border-[#333a42] rounded-md text-xs text-[#f3f5f7] placeholder-[#7c8792] focus:outline-none focus:border-[#8ab4f8]"
              />
            </div>
          </div>
        </div>

        {/* Changes Indicator Legend Strip */}
        <div className="h-8 px-5 bg-[#141619] border-b border-[#23272c] flex items-center justify-between text-xs text-[#7c8792] shrink-0 font-mono">
          <div className="flex items-center gap-4">
            <span className="flex items-center gap-1.5 text-[#3fb950]">
              <span className="w-2 h-2 rounded-full bg-[#3fb950]" />
              <strong>{commitStats.added}</strong> Berkas Baru / Bertambah (+)
            </span>
            <span className="flex items-center gap-1.5 text-[#f85149]">
              <span className="w-2 h-2 rounded-full bg-[#f85149]" />
              <strong>{commitStats.deleted}</strong> Berkas Ditiadakan / Berpindah (-)
            </span>
          </div>

          <span className="text-[11px] hidden sm:inline">
            Status snapshot terverifikasi integritas hash SHA-256
          </span>
        </div>

        {/* MAIN FOLDER TREE SCROLLABLE CANVAS (SINGLE UNIFIED TREE) */}
        <div className="flex-1 overflow-y-auto p-4 space-y-1">
          {folders.map((rootFolder) => renderFolderSnapshot(rootFolder, 0))}
        </div>
      </div>
    </div>
  );
};
