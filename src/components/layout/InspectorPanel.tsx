import React, { useState } from 'react';
import {
  FileText,
  Image as ImageIcon,
  Video,
  Music,
  Archive,
  Package,
  Code2,
  File,
  ExternalLink,
  FolderOpen,
  Copy,
  Star,
  Lock,
  Unlock,
  Tag,
  Plus,
  X,
  Fingerprint,
  Calendar,
  HardDrive,
  Info,
} from 'lucide-react';
import { CategoryId, FileItem } from '../../types';
import { CATEGORY_CONFIG, MIKRO_KOPI_TERMS } from '../../constants/tokens';

interface InspectorPanelProps {
  selectedFiles: FileItem[];
  allFiles: FileItem[];
  onUpdateFileCategory: (fileId: string, category: CategoryId) => void;
  onUpdateFileRating: (fileId: string, rating: number) => void;
  onAddFileTag: (fileId: string, tag: string) => void;
  onRemoveFileTag: (fileId: string, tag: string) => void;
  onToggleLockCategory: (fileId: string) => void;
  onCloseInspector: () => void;
}

export const InspectorPanel: React.FC<InspectorPanelProps> = ({
  selectedFiles,
  allFiles,
  onUpdateFileCategory,
  onUpdateFileRating,
  onAddFileTag,
  onRemoveFileTag,
  onToggleLockCategory,
  onCloseInspector,
}) => {
  const [newTagInput, setNewTagInput] = useState('');
  const [copiedNotification, setCopiedNotification] = useState(false);

  const file = selectedFiles.length === 1 ? selectedFiles[0] : null;

  const handleCopyPath = (path: string) => {
    navigator.clipboard?.writeText(path);
    setCopiedNotification(true);
    setTimeout(() => setCopiedNotification(false), 2000);
  };

  const handleAddTag = (e: React.FormEvent) => {
    e.preventDefault();
    if (!file || !newTagInput.trim()) return;
    onAddFileTag(file.id, newTagInput.trim().toLowerCase().replace(/^#/, ''));
    setNewTagInput('');
  };

  const renderFileIcon = (category: CategoryId) => {
    switch (category) {
      case 'image':
        return <ImageIcon className="w-8 h-8 text-[#b49bea]" />;
      case 'video':
        return <Video className="w-8 h-8 text-[#e58e9b]" />;
      case 'audio':
        return <Music className="w-8 h-8 text-[#82c99a]" />;
      case 'document':
        return <FileText className="w-8 h-8 text-[#83b5e8]" />;
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

  // State 1: Nothing selected -> Show folder overview
  if (selectedFiles.length === 0) {
    const totalSize = allFiles.reduce((acc, f) => acc + f.size, 0);
    const formattedTotal = (totalSize / (1024 * 1024 * 1024)).toFixed(2) + ' GB';

    return (
      <aside className="w-[320px] bg-[#191c20] border-l border-[#333a42] p-4 flex flex-col justify-between shrink-0 select-none overflow-y-auto">
        <div>
          <div className="flex items-center justify-between pb-3 border-b border-[#333a42] mb-4">
            <h3 className="text-xs font-semibold uppercase tracking-wider text-[#7c8792]">
              Ringkasan Folder
            </h3>
            <button
              onClick={onCloseInspector}
              className="p-1 rounded text-[#7c8792] hover:text-[#f3f5f7] hover:bg-[#2a2f35]"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="p-3 bg-[#23272c] border border-[#333a42] rounded-lg mb-4">
            <div className="text-xs text-[#b3bcc5] mb-1">Folder Aktif</div>
            <div className="font-semibold text-sm text-[#f3f5f7] break-all">Downloads &gt; 2024</div>
            <div className="mt-3 flex items-center justify-between text-xs text-[#7c8792] font-mono">
              <span>{allFiles.length} berkas</span>
              <span>{formattedTotal}</span>
            </div>
          </div>

          <div className="text-xs font-semibold uppercase tracking-wider text-[#7c8792] mb-2">
            Komposisi Berkas
          </div>
          <div className="space-y-2">
            {(['document', 'image', 'video', 'archive', 'installer', 'code', 'audio'] as CategoryId[]).map(
              (cat) => {
                const count = allFiles.filter((f) => f.category === cat).length;
                if (count === 0) return null;
                const config = CATEGORY_CONFIG[cat];
                return (
                  <div key={cat} className="flex items-center justify-between text-xs py-1">
                    <div className="flex items-center gap-2">
                      <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: config.color }} />
                      <span className="text-[#b3bcc5]">{config.label}</span>
                    </div>
                    <span className="font-mono text-[#7c8792]">{count} berkas</span>
                  </div>
                );
              }
            )}
          </div>
        </div>

        <div className="p-3 bg-[#23272c]/50 border border-[#333a42] rounded text-[11px] text-[#7c8792]">
          Pilih salah satu berkas di daftar untuk melihat pratinjau, rincian metadata, dan pengaturan tag.
        </div>
      </aside>
    );
  }

  // State 2: Multiple files selected
  if (selectedFiles.length > 1) {
    const totalSelectedBytes = selectedFiles.reduce((acc, f) => acc + f.size, 0);
    const formattedBytes =
      totalSelectedBytes > 1024 * 1024 * 1024
        ? (totalSelectedBytes / (1024 * 1024 * 1024)).toFixed(2) + ' GB'
        : (totalSelectedBytes / (1024 * 1024)).toFixed(1) + ' MB';

    return (
      <aside className="w-[320px] bg-[#191c20] border-l border-[#333a42] p-4 flex flex-col justify-between shrink-0 select-none overflow-y-auto">
        <div>
          <div className="flex items-center justify-between pb-3 border-b border-[#333a42] mb-4">
            <h3 className="text-xs font-semibold uppercase tracking-wider text-[#7c8792]">
              Pilihan Banyak ({selectedFiles.length})
            </h3>
            <button
              onClick={onCloseInspector}
              className="p-1 rounded text-[#7c8792] hover:text-[#f3f5f7] hover:bg-[#2a2f35]"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="p-3 bg-[#23272c] border border-[#333a42] rounded-lg mb-4">
            <div className="text-xs text-[#b3bcc5]">{selectedFiles.length} berkas dipilih</div>
            <div className="text-lg font-bold font-mono text-[#f3f5f7] mt-1">{formattedBytes}</div>
          </div>

          <div className="text-xs font-medium text-[#b3bcc5] mb-2">Aksi Massal:</div>
          <div className="space-y-2">
            <button
              onClick={() => alert(`Kirim ${selectedFiles.length} berkas ke antrian Rapikan Otomatis.`)}
              className="w-full h-8 px-3 rounded bg-[#23272c] hover:bg-[#2a2f35] border border-[#333a42] text-xs text-[#f3f5f7] font-medium transition-colors text-left flex items-center justify-between"
            >
              <span>Rapikan {selectedFiles.length} Berkas Ini</span>
              <ExternalLink className="w-3.5 h-3.5 text-[#8ab4f8]" />
            </button>
            <button
              onClick={() => {
                const tag = prompt('Masukkan nama tag untuk semua berkas terpilih:');
                if (tag) {
                  selectedFiles.forEach((f) => onAddFileTag(f.id, tag));
                }
              }}
              className="w-full h-8 px-3 rounded bg-[#23272c] hover:bg-[#2a2f35] border border-[#333a42] text-xs text-[#f3f5f7] font-medium transition-colors text-left flex items-center justify-between"
            >
              <span>Tambah Tag Massal</span>
              <Tag className="w-3.5 h-3.5 text-[#8ab4f8]" />
            </button>
          </div>
        </div>

        <div className="text-[11px] text-[#7c8792]">
          Tip: Tekan <kbd className="px-1 py-0.5 bg-[#23272c] rounded border border-[#333a42]">Space</kbd> untuk memilih/lepas baris aktif.
        </div>
      </aside>
    );
  }

  // State 3: Single file selected
  if (!file) return null;

  const categoryConfig = CATEGORY_CONFIG[file.category];

  return (
    <aside className="w-[320px] bg-[#191c20] border-l border-[#333a42] p-4 flex flex-col justify-between shrink-0 select-none overflow-y-auto">
      <div>
        {/* Header & Close */}
        <div className="flex items-center justify-between pb-2 border-b border-[#333a42] mb-3">
          <span className="text-xs font-semibold uppercase tracking-wider text-[#7c8792]">
            Detail Berkas
          </span>
          <button
            onClick={onCloseInspector}
            className="p-1 rounded text-[#7c8792] hover:text-[#f3f5f7] hover:bg-[#2a2f35]"
            title="Tutup Panel Inspector"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* Visual Preview Box */}
        <div className="w-full h-36 bg-[#141619] border border-[#333a42] rounded-lg overflow-hidden flex flex-col items-center justify-center p-3 relative group mb-3">
          {file.previewType === 'image' ? (
            <div className="w-full h-full rounded flex flex-col items-center justify-center bg-gradient-to-br from-[#1e2226] to-[#2a2f35] border border-[#333a42]">
              <ImageIcon className="w-10 h-10 text-[#b49bea] mb-1" />
              <span className="text-[11px] text-[#b3bcc5]">Pratinjau Gambar 4K</span>
            </div>
          ) : file.previewType === 'pdf' || file.previewType === 'text' ? (
            <div className="w-full h-full p-2.5 bg-[#23272c] border border-[#333a42] rounded text-[10px] text-[#b3bcc5] font-mono leading-relaxed overflow-hidden">
              <div className="text-[9px] uppercase tracking-wider text-[#7c8792] mb-1 font-bold">
                Teks Dokumen:
              </div>
              {file.contentSnippet || 'Memuat cuplikan isi dokumen...'}
            </div>
          ) : (
            <div className="flex flex-col items-center gap-1.5 text-center">
              {renderFileIcon(file.category)}
              <span className="text-xs font-mono uppercase text-[#7c8792]">.{file.extension}</span>
            </div>
          )}
        </div>

        {/* File Name */}
        <div className="mb-3">
          <div className="font-semibold text-sm text-[#f3f5f7] break-words select-text" title={file.name}>
            {file.name}
          </div>
        </div>

        {/* Category Picker & Lock */}
        <div className="mb-3 p-2.5 bg-[#23272c] border border-[#333a42] rounded-md">
          <div className="flex items-center justify-between text-xs mb-1.5">
            <span className="text-[#7c8792]">Kategori</span>
            <button
              onClick={() => onToggleLockCategory(file.id)}
              className="flex items-center gap-1 text-[11px] text-[#8ab4f8] hover:text-[#6fa0ed]"
              title={file.isLocked ? 'Kategori dikunci (tidak diubah otomatis)' : 'Kunci kategori'}
            >
              {file.isLocked ? (
                <>
                  <Lock className="w-3 h-3 text-[#e0ab5c]" />
                  <span className="text-[#e0ab5c]">Terkunci</span>
                </>
              ) : (
                <>
                  <Unlock className="w-3 h-3 text-[#7c8792]" />
                  <span className="text-[#7c8792]">Otomatis</span>
                </>
              )}
            </button>
          </div>

          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full shrink-0" style={{ backgroundColor: categoryConfig.color }} />
            <select
              value={file.category}
              onChange={(e) => onUpdateFileCategory(file.id, e.target.value as CategoryId)}
              className="w-full bg-[#191c20] border border-[#333a42] text-xs text-[#f3f5f7] rounded px-2 py-1 focus:outline-none focus:border-[#8ab4f8]"
            >
              {(Object.keys(CATEGORY_CONFIG) as CategoryId[]).map((catKey) => (
                <option key={catKey} value={catKey}>
                  {CATEGORY_CONFIG[catKey].label}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Metadata List with Tabular Cascadia numbers */}
        <div className="space-y-2 mb-3 text-xs">
          <div className="flex items-center justify-between py-1 border-b border-[#23272c]">
            <span className="text-[#7c8792] flex items-center gap-1.5">
              <HardDrive className="w-3.5 h-3.5" />
              <span>Ukuran</span>
            </span>
            <span className="font-mono text-[#f3f5f7] tabular-nums">{file.sizeFormatted}</span>
          </div>

          <div className="flex items-center justify-between py-1 border-b border-[#23272c]">
            <span className="text-[#7c8792] flex items-center gap-1.5">
              <Calendar className="w-3.5 h-3.5" />
              <span>Diubah</span>
            </span>
            <span className="font-mono text-[#f3f5f7] tabular-nums">{file.modifiedFormatted}</span>
          </div>

          <div className="flex items-center justify-between py-1 border-b border-[#23272c]">
            <span className="text-[#7c8792] flex items-center gap-1.5">
              <Fingerprint className="w-3.5 h-3.5" />
              <span title="Sidik jari berkas untuk deteksi duplikat">{MIKRO_KOPI_TERMS.hash}</span>
            </span>
            <span className="font-mono text-[11px] text-[#8ab4f8] tabular-nums truncate max-w-[140px]" title={file.checksum}>
              {file.checksum}
            </span>
          </div>
        </div>

        {/* Star Rating */}
        <div className="mb-3">
          <div className="text-xs text-[#7c8792] mb-1.5">Kepentingan / Rating</div>
          <div className="flex items-center gap-1">
            {[1, 2, 3, 4, 5].map((star) => (
              <button
                key={star}
                onClick={() => onUpdateFileRating(file.id, star === file.rating ? 0 : star)}
                className="p-1 text-[#7c8792] hover:text-[#e0ab5c] transition-colors focus-ring rounded"
                title={`Rating ${star}`}
              >
                <Star
                  className={`w-4 h-4 ${
                    star <= file.rating ? 'fill-[#e0ab5c] text-[#e0ab5c]' : 'text-[#454e58]'
                  }`}
                />
              </button>
            ))}
            <span className="text-[11px] text-[#7c8792] ml-2">
              {file.rating > 0 ? `${file.rating}/5` : 'Tanpa rating'}
            </span>
          </div>
        </div>

        {/* Tags Management */}
        <div className="mb-4">
          <div className="text-xs text-[#7c8792] mb-1.5">Label / Tag</div>
          <div className="flex flex-wrap gap-1 mb-2">
            {file.tags.map((t) => (
              <span
                key={t}
                className="inline-flex items-center gap-1 px-2 py-0.5 bg-[#23272c] border border-[#333a42] text-[11px] text-[#b3bcc5] rounded"
              >
                #{t}
                <button
                  onClick={() => onRemoveFileTag(file.id, t)}
                  className="hover:text-[#e07e88] focus-ring"
                >
                  <X className="w-2.5 h-2.5" />
                </button>
              </span>
            ))}
          </div>

          <form onSubmit={handleAddTag} className="flex gap-1.5">
            <input
              type="text"
              value={newTagInput}
              onChange={(e) => setNewTagInput(e.target.value)}
              placeholder="Tambah tag baru..."
              className="flex-1 bg-[#141619] border border-[#333a42] rounded px-2 py-1 text-xs text-[#f3f5f7] focus:outline-none focus:border-[#8ab4f8]"
            />
            <button
              type="submit"
              className="px-2 py-1 bg-[#23272c] hover:bg-[#2a2f35] border border-[#333a42] text-xs text-[#b3bcc5] rounded flex items-center"
            >
              <Plus className="w-3 h-3" />
            </button>
          </form>
        </div>
      </div>

      {/* Primary Explorer Actions */}
      <div className="pt-3 border-t border-[#333a42] space-y-1.5">
        <button
          onClick={() => alert(`Membuka berkas: ${file.path}`)}
          className="w-full h-8 px-3 rounded bg-[#8ab4f8] hover:bg-[#6fa0ed] text-[#141619] text-xs font-semibold flex items-center justify-center gap-1.5 transition-colors focus-ring"
        >
          <ExternalLink className="w-3.5 h-3.5" />
          <span>Buka Berkas</span>
        </button>

        <button
          onClick={() => alert(`Membuka lokasi berkas di Windows Explorer: ${file.path}`)}
          className="w-full h-8 px-3 rounded bg-[#23272c] hover:bg-[#2a2f35] border border-[#333a42] text-xs text-[#f3f5f7] flex items-center justify-center gap-1.5 transition-colors focus-ring"
        >
          <FolderOpen className="w-3.5 h-3.5 text-[#8ab4f8]" />
          <span>Buka Lokasi di Explorer</span>
        </button>

        <button
          onClick={() => handleCopyPath(file.path)}
          className="w-full h-7 px-2 rounded text-[11px] text-[#7c8792] hover:text-[#f3f5f7] hover:bg-[#23272c] flex items-center justify-center gap-1.5 transition-colors"
        >
          <Copy className="w-3 h-3" />
          <span>{copiedNotification ? 'Jalur Tersalin!' : 'Salin Jalur Path'}</span>
        </button>
      </div>
    </aside>
  );
};
