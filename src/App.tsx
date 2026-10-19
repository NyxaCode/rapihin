/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useMemo } from 'react';
import { WindowsTitleBar } from './components/desktop/WindowsTitleBar';
import { NavRail } from './components/layout/NavRail';
import { ContextSidebar } from './components/layout/ContextSidebar';
import { FloatingBottomDock } from './components/layout/FloatingBottomDock';
import { InspectorPanel } from './components/layout/InspectorPanel';
import { StatusBar } from './components/layout/StatusBar';
import { PerpustakaanView } from './components/views/PerpustakaanView';
import { KebersihanView } from './components/views/KebersihanView';
import { RiwayatView } from './components/views/RiwayatView';
import { PengaturanView } from './components/views/PengaturanView';
import { RapikanModal } from './components/modals/RapikanModal';
import { MoveFilesModal } from './components/modals/MoveFilesModal';
import { EditFilesModal } from './components/modals/EditFilesModal';
import { CommandPalette } from './components/modals/CommandPalette';
import { BacklogModal } from './components/modals/BacklogModal';
import { TerminalLogModal } from './components/modals/TerminalLogModal';
import {
  ActiveArea,
  AiMode,
  CategoryId,
  CleanlinessItem,
  DynamicCollection,
  FileItem,
  OperationManifest,
  ScreenState,
  SuggestionRow,
  ViewMode,
} from './types';
import {
  INITIAL_CLEANLINESS,
  INITIAL_COLLECTIONS,
  INITIAL_FILES,
  INITIAL_FOLDERS,
  INITIAL_MANIFESTS,
  INITIAL_SUGGESTIONS,
} from './data/mockData';

export default function App() {
  // Navigation & layout state per TDD §6
  const [activeArea, setActiveArea] = useState<ActiveArea>('perpustakaan');
  const [viewMode, setViewMode] = useState<ViewMode>('list'); // Default: Table list
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [isInspectorOpen, setIsInspectorOpen] = useState(true);
  const [isMaximized, setIsMaximized] = useState(false);

  // Settings sub-tab state per TDD §8.5
  const [settingsTab, setSettingsTab] = useState('umum');

  // Search & Filter state
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedFolder, setSelectedFolder] = useState('D:\\Downloads');
  const [selectedCollectionId, setSelectedCollectionId] = useState<string | null>(null);
  const [selectedTag, setSelectedTag] = useState<string | null>(null);

  // Data states
  const [files, setFiles] = useState<FileItem[]>(INITIAL_FILES);
  const [selectedFileIds, setSelectedFileIds] = useState<string[]>(['f-1']);
  const [suggestions, setSuggestions] = useState<SuggestionRow[]>(INITIAL_SUGGESTIONS);
  const [cleanlinessItems, setCleanlinessItems] = useState<CleanlinessItem[]>(INITIAL_CLEANLINESS);
  const [manifests, setManifests] = useState<OperationManifest[]>(INITIAL_MANIFESTS);
  const [collections] = useState<DynamicCollection[]>(INITIAL_COLLECTIONS);

  // AI & Performance Mode
  const [aiMode, setAiMode] = useState<AiMode>('tanpa_ai');
  const [screenState, setScreenState] = useState<ScreenState>('normal');
  const [isScanning, setIsScanning] = useState(false);
  const [scanProgress, setScanProgress] = useState(0);

  // Modals
  const [isRapikanModalOpen, setIsRapikanModalOpen] = useState(false);
  const [isMoveModalOpen, setIsMoveModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isCommandPaletteOpen, setIsCommandPaletteOpen] = useState(false);
  const [isBacklogOpen, setIsBacklogOpen] = useState(false);
  const [isTerminalLogOpen, setIsTerminalLogOpen] = useState(false);

  // Extract all unique tags
  const allTags = useMemo(() => {
    const set = new Set<string>();
    files.forEach((f) => f.tags.forEach((t) => set.add(t)));
    return Array.from(set);
  }, [files]);

  // Filtered files based on active criteria
  const filteredFiles = useMemo(() => {
    let result = [...files];

    // Search query filter
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      result = result.filter(
        (f) =>
          f.name.toLowerCase().includes(q) ||
          f.tags.some((t) => t.toLowerCase().includes(q)) ||
          f.categoryLabel.toLowerCase().includes(q) ||
          f.extension.toLowerCase().includes(q)
      );
    }

    // Exact prefix folder filter from Folder Tree
    if (selectedFolder) {
      result = result.filter((f) =>
        f.path.toLowerCase().startsWith(selectedFolder.toLowerCase())
      );
    }

    return result;
  }, [files, searchQuery, selectedFolder]);

  // Selected file items for inspector
  const selectedFilesList = useMemo(() => {
    return files.filter((f) => selectedFileIds.includes(f.id));
  }, [files, selectedFileIds]);

  const selectedSizeFormatted = useMemo(() => {
    const bytes = selectedFilesList.reduce((acc, f) => acc + f.size, 0);
    if (bytes === 0) return '0 B';
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    if (bytes < 1024 * 1024 * 1024) return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
    return `${(bytes / (1024 * 1024 * 1024)).toFixed(2)} GB`;
  }, [selectedFilesList]);

  // Handle Ctrl+K shortcut globally
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        setIsCommandPaletteOpen((prev) => !prev);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  // Handler: Trigger Scan simulation
  const handleTriggerScan = () => {
    setIsScanning(true);
    setScanProgress(0);

    const interval = setInterval(() => {
      setScanProgress((prev) => {
        if (prev >= 100) {
          clearInterval(interval);
          setIsScanning(false);
          return 100;
        }
        return prev + 20;
      });
    }, 150);
  };

  // Selection handlers
  const handleToggleSelectFile = (fileId: string, isShiftOrCtrl = false) => {
    if (isShiftOrCtrl) {
      setSelectedFileIds((prev) =>
        prev.includes(fileId) ? prev.filter((id) => id !== fileId) : [...prev, fileId]
      );
    } else {
      setSelectedFileIds([fileId]);
    }
  };

  const handleSelectAllFiles = () => {
    setSelectedFileIds(filteredFiles.map((f) => f.id));
  };

  const handleClearSelection = () => {
    setSelectedFileIds([]);
  };

  // Update file rating
  const handleUpdateRating = (fileId: string, rating: number) => {
    setFiles((prev) =>
      prev.map((f) => (f.id === fileId ? { ...f, rating } : f))
    );
  };

  // Add tag to file
  const handleAddTag = (fileId: string, tag: string) => {
    setFiles((prev) =>
      prev.map((f) => {
        if (f.id === fileId && !f.tags.includes(tag)) {
          return { ...f, tags: [...f.tags, tag] };
        }
        return f;
      })
    );
  };

  // Remove tag from file
  const handleRemoveTag = (fileId: string, tagToRemove: string) => {
    setFiles((prev) =>
      prev.map((f) => {
        if (f.id === fileId) {
          return { ...f, tags: f.tags.filter((t) => t !== tagToRemove) };
        }
        return f;
      })
    );
  };

  // Rapikan suggestions handlers
  const handleToggleSuggestion = (id: string) => {
    setSuggestions((prev) =>
      prev.map((s) => (s.id === id ? { ...s, selected: !s.selected } : s))
    );
  };

  const handleSelectAllSuggestions = () => {
    const allSelected = suggestions.every((s) => s.selected);
    setSuggestions((prev) => prev.map((s) => ({ ...s, selected: !allSelected })));
  };

  const handleApplySuggestions = () => {
    const selected = suggestions.filter((s) => s.selected && s.status === 'pending');
    if (selected.length === 0) return;

    // Move files in file system
    setFiles((prev) =>
      prev.map((file) => {
        const match = selected.find((s) => s.fileId === file.id);
        if (match) {
          return {
            ...file,
            path: match.targetPath,
            suggestedFolder: undefined,
            isSuggested: false,
          };
        }
        return file;
      })
    );

    // Update suggestions status
    setSuggestions((prev) =>
      prev.map((s) => (s.selected ? { ...s, status: 'applied' } : s))
    );

    // Log new operation manifest for instant rollback
    const newManifest: OperationManifest = {
      id: `man-${Date.now()}`,
      timestamp: new Date().toLocaleDateString('id-ID', {
        day: 'numeric',
        month: 'short',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      }),
      operationType: `Rapikan Otomatis (${selected.length} berkas dipindahkan)`,
      totalFiles: selected.length,
      successCount: selected.length,
      failedCount: 0,
      status: 'sukses',
      items: selected.map((s) => ({
        fileName: s.fileName,
        from: s.originalPath,
        to: s.targetPath,
        reason: s.reason,
        engine: s.engine,
        success: true,
      })),
    };

    setManifests((prev) => [newManifest, ...prev]);
  };

  const handleUndoLastOperation = () => {
    if (manifests.length === 0) return;
    const last = manifests[0];

    // Rollback paths
    setFiles((prev) =>
      prev.map((file) => {
        const item = last.items.find((i) => i.to === file.path);
        if (item) {
          return { ...file, path: item.from };
        }
        return file;
      })
    );

    setManifests((prev) => prev.slice(1));
  };

  const handleRollbackManifest = (manifestId: string) => {
    const target = manifests.find((m) => m.id === manifestId);
    if (!target) return;

    setFiles((prev) =>
      prev.map((file) => {
        const item = target.items.find((i) => i.to === file.path);
        if (item) {
          return { ...file, path: item.from };
        }
        return file;
      })
    );

    setManifests((prev) => prev.filter((m) => m.id !== manifestId));
  };

  const handleResolveCleanlinessItem = (itemId: string) => {
    setCleanlinessItems((prev) => prev.filter((item) => item.id !== itemId));
  };

  const handleDeleteSelected = () => {
    if (selectedFileIds.length === 0) return;
    if (confirm(`Kirim ${selectedFileIds.length} berkas terpilih ke Recycle Bin?`)) {
      setFiles((prev) => prev.filter((f) => !selectedFileIds.includes(f.id)));
      setSelectedFileIds([]);
    }
  };

  const handleConfirmMove = (targetFolderId: string, targetFolderPath: string) => {
    setFiles((prev) =>
      prev.map((f) => {
        if (selectedFileIds.includes(f.id)) {
          return {
            ...f,
            folderId: targetFolderId,
            path: `${targetFolderPath}\\${f.name}`,
          };
        }
        return f;
      })
    );
  };

  const handleSaveEdit = (updates: {
    name?: string;
    category?: CategoryId;
    tagsToAdd?: string[];
    rating?: number;
  }) => {
    setFiles((prev) =>
      prev.map((f) => {
        if (selectedFileIds.includes(f.id)) {
          const updated = { ...f };
          if (updates.name && selectedFileIds.length === 1) {
            updated.name = updates.name;
            const ext = updates.name.split('.').pop() || f.extension;
            updated.extension = ext;
          }
          if (updates.category) {
            updated.category = updates.category;
            updated.categoryLabel = updates.category;
          }
          if (updates.tagsToAdd) {
            updated.tags = updates.tagsToAdd;
          }
          if (updates.rating !== undefined) {
            updated.rating = updates.rating;
          }
          return updated;
        }
        return f;
      })
    );
  };

  const handleStartRapikanSelected = () => {
    if (selectedFileIds.length === 0) {
      setIsRapikanModalOpen(true);
      return;
    }
    const selectedFilesList = files.filter((f) => selectedFileIds.includes(f.id));

    setSuggestions((prev) => {
      const updated = prev.map((s) => ({
        ...s,
        selected: selectedFileIds.includes(s.fileId),
      }));

      const existingFileIds = new Set(updated.map((s) => s.fileId));
      selectedFilesList.forEach((file) => {
        if (!existingFileIds.has(file.id)) {
          let target = 'D:\\Dokumen';
          let targetFolder = 'Dokumen';
          if (file.category === 'image' || file.category === 'video' || file.category === 'audio') {
            target = 'D:\\Media';
            targetFolder = 'Media';
          } else if (file.category === 'installer') {
            target = 'D:\\Installers';
            targetFolder = 'Installers';
          } else if (file.category === 'code') {
            target = 'D:\\Kode';
            targetFolder = 'Kode';
          } else if (file.category === 'archive') {
            target = 'D:\\Arsip';
            targetFolder = 'Arsip';
          }

          updated.push({
            id: `sug-sel-${file.id}`,
            fileId: file.id,
            fileName: file.name,
            originalPath: file.path,
            targetFolder: targetFolder,
            targetPath: `${target}\\${file.name}`,
            reason: `Pengelompokan berkas kategori ${file.categoryLabel}`,
            engine: 'Heuristik Format',
            confidence: 'tinggi',
            status: 'pending',
            selected: true,
          });
        }
      });

      return updated;
    });

    setIsRapikanModalOpen(true);
  };

  return (
    <div className="h-screen w-screen bg-[#141619] text-[#f3f5f7] flex flex-col overflow-hidden select-none font-sans">
      {/* 1. Desktop Shell Title Bar (Windows 11 style) */}
      <WindowsTitleBar
        isMaximized={isMaximized}
        onToggleMaximize={() => setIsMaximized(!isMaximized)}
        onOpenBacklog={() => setIsBacklogOpen(true)}
        onOpenTerminalLog={() => setIsTerminalLogOpen(true)}
      />

      {/* 2. Central Working Area (4-Zone Layout per TDD §6) */}
      <div className="flex-1 flex overflow-hidden">
        {/* Zone 1: NavRail (68px fixed width) */}
        <NavRail
          activeArea={activeArea}
          onSelectArea={(area) => setActiveArea(area)}
          cleanlinessCount={cleanlinessItems.length}
        />

        {/* Zone 2: Context Sidebar (Folder Tree & Files only) - Sembunyikan saat di halaman Riwayat agar tidak ada 2 pohon folder */}
        {isSidebarOpen && activeArea !== 'riwayat' && (
          <ContextSidebar
            activeArea={activeArea}
            folders={INITIAL_FOLDERS}
            files={files}
            selectedFolder={selectedFolder}
            onSelectFolder={(folder) => {
              setSelectedFolder(folder);
            }}
            selectedFileId={selectedFileIds[0] || null}
            onSelectFile={(id) => {
              setSelectedFileIds([id]);
            }}
            settingsTab={settingsTab}
            onSelectSettingsTab={setSettingsTab}
            onAddFolder={() => {
              const name = prompt('Masukkan jalur folder lokal baru:', 'D:\\Proyek_Baru');
              if (name) setSelectedFolder(name);
            }}
          />
        )}

        {/* Zone 3: Main Working Canvas (Section Tengah) */}
        <main className="flex-1 flex flex-col overflow-hidden relative">
          {activeArea === 'perpustakaan' && (
            <PerpustakaanView
              files={filteredFiles}
              folderCount={INITIAL_FOLDERS.length}
              selectedFileIds={selectedFileIds}
              onToggleSelectFile={handleToggleSelectFile}
              onSelectAllFiles={handleSelectAllFiles}
              onClearSelection={handleClearSelection}
              viewMode={viewMode}
              onChangeViewMode={setViewMode}
              currentPath={selectedFolder}
              screenState={screenState}
              onRetry={() => setScreenState('normal')}
              onStartRapikanSelected={() => setIsRapikanModalOpen(true)}
              onDeleteSelected={handleDeleteSelected}
              onToggleHistoryGraph={() => setActiveArea('riwayat')}
              isHistoryGraphOpen={false}
              onToggleSidebar={() => setIsSidebarOpen(!isSidebarOpen)}
              isSidebarOpen={isSidebarOpen}
              onToggleInspector={() => setIsInspectorOpen(!isInspectorOpen)}
              isInspectorOpen={isInspectorOpen}
            />
          )}

          {activeArea === 'kebersihan' && (
            <KebersihanView
              cleanlinessItems={cleanlinessItems}
              files={files}
              folders={INITIAL_FOLDERS}
              selectedFolder={selectedFolder}
              onSelectFolder={setSelectedFolder}
              onResolveItem={handleResolveCleanlinessItem}
              onRefreshScan={handleTriggerScan}
              onDeleteFile={(id) => {
                setFiles((prev) => prev.filter((f) => f.id !== id));
                setSelectedFileIds((prev) => prev.filter((fid) => fid !== id));
              }}
            />
          )}

          {activeArea === 'riwayat' && (
            <RiwayatView
              manifests={manifests}
              files={files}
              folders={INITIAL_FOLDERS}
              onRollback={handleRollbackManifest}
            />
          )}

          {activeArea === 'pengaturan' && (
            <PengaturanView
              activeTab={settingsTab}
              onSelectTab={setSettingsTab}
              aiMode={aiMode}
              onChangeAiMode={setAiMode}
            />
          )}

          {/* Flying Menu / Floating Bottom Dock:
              - Disatukan dengan panel aksi berkas terpilih
              - Mentok di bawah section tengah (50px dari batas viewport bawah)
              - Width 90% section tengah
          */}
          {activeArea === 'perpustakaan' && (
            <FloatingBottomDock
              selectedCount={selectedFileIds.length}
              onClearSelection={handleClearSelection}
              onRapikanSelected={handleStartRapikanSelected}
              onDeleteSelected={handleDeleteSelected}
              isScanning={isScanning}
              scanProgress={scanProgress}
              onTriggerScan={handleTriggerScan}
              onOpenRapikanModal={() => setIsRapikanModalOpen(true)}
              suggestionsCount={suggestions.filter((s) => s.status === 'pending').length}
            />
          )}
        </main>

        {/* Zone 4: Inspector Panel (320px fixed collapsible) */}
        {isInspectorOpen && activeArea === 'perpustakaan' && (
          <InspectorPanel
            selectedFiles={selectedFilesList}
            allFiles={files}
            onUpdateFileCategory={(fileId, category) => {
              setFiles((prev) =>
                prev.map((f) => (f.id === fileId ? { ...f, category, categoryLabel: category } : f))
              );
            }}
            onUpdateFileRating={handleUpdateRating}
            onAddFileTag={handleAddTag}
            onRemoveFileTag={handleRemoveTag}
            onToggleLockCategory={(fileId) => {
              setFiles((prev) =>
                prev.map((f) => (f.id === fileId ? { ...f, isLocked: !f.isLocked } : f))
              );
            }}
            onCloseInspector={() => setIsInspectorOpen(false)}
          />
        )}
      </div>

      {/* 3. Bottom Status Bar (28px fixed) */}
      <StatusBar
        totalFiles={filteredFiles.length}
        selectedCount={selectedFileIds.length}
        selectedSizeFormatted={selectedSizeFormatted}
        isScanning={isScanning}
        scanProgress={scanProgress}
        aiMode={aiMode}
        onOpenBacklog={() => setIsBacklogOpen(true)}
        onOpenTerminalLog={() => setIsTerminalLogOpen(true)}
      />

      {/* Modals & Dialogs */}
      <RapikanModal
        isOpen={isRapikanModalOpen}
        onClose={() => setIsRapikanModalOpen(false)}
        suggestions={suggestions}
        onToggleSuggestion={handleToggleSuggestion}
        onSelectAllSuggestions={handleSelectAllSuggestions}
        onApplySelected={handleApplySuggestions}
        onUndoLastOperation={handleUndoLastOperation}
      />

      <MoveFilesModal
        isOpen={isMoveModalOpen}
        onClose={() => setIsMoveModalOpen(false)}
        selectedFiles={selectedFilesList}
        folders={INITIAL_FOLDERS}
        onConfirmMove={handleConfirmMove}
      />

      <EditFilesModal
        isOpen={isEditModalOpen}
        onClose={() => setIsEditModalOpen(false)}
        selectedFiles={selectedFilesList}
        onSave={handleSaveEdit}
      />

      <CommandPalette
        isOpen={isCommandPaletteOpen}
        onClose={() => setIsCommandPaletteOpen(false)}
        onSelectArea={(area) => setActiveArea(area)}
        onTriggerScan={handleTriggerScan}
        onStartRapikan={() => setIsRapikanModalOpen(true)}
      />

      <BacklogModal
        isOpen={isBacklogOpen}
        onClose={() => setIsBacklogOpen(false)}
      />

      <TerminalLogModal
        isOpen={isTerminalLogOpen}
        onClose={() => setIsTerminalLogOpen(false)}
      />
    </div>
  );
}
