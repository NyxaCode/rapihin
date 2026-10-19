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
  const [statusFeedback, setStatusFeedback] = useState<string | null>(null);

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

  const showFeedback = (msg: string) => {
    setStatusFeedback(msg);
    setTimeout(() => setStatusFeedback(null), 2500);
  };

  const renderFileIcon = (category: CategoryId) => {
    switch (category) {
      case 'image':
        return <ImageIcon className="w-8 h-8 text-[#b49bea]" />;
      case 'video':
        return <Video className="w-8 h-8 text-[#f87171]" />;
      case 'audio':
        return <Music className="w-8 h-8 text-[#34d399]" />;
      case 'document':
        return <FileText className="w-8 h-8 text-[#60a5fa]" />;
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

  // State 1: Nothing selected -> Show folder overview
  if (selectedFiles.length === 0) {
    const totalSize = allFiles.reduce((acc, f) => acc + f.size, 0);
    const formattedTotal = (totalSize / (1024 * 1024 * 1024)).toFixed(2) + ' GB';

    return (
      <aside className="w-[320px] bg-[#13161c] border-l border-[#222630] p-4 flex flex-col justify-between shrink-0 select-none overflow-y-auto">
        <div>
          <div className="flex items-center justify-between pb-3 border-b border-[#222630] mb-4">
            <h3 className="text-[10px] font-bold uppercase tracking-widest text-[#555a64]">
              Ringkasan Folder
            </h3>
            <button
              onClick={onCloseInspector}
              className="p-1 rounded-lg text-[#616875] hover:text-[#f5f7fa] hover:bg-[#181c23] cursor-pointer"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="p-3 bg-[#181c23] border border-white/6 rounded-xl shadow-[inset_0_1px_0_0_rgba(255,255,255,0.06)] mb-4">
            <div className="text-[11px] text-[#8a919e] mb-1">Folder Aktif</div>
            <div className="font-bold text-sm text-[#f5f7fa] break-all">Downloads &gt; 2026</div>
            <div className="mt-3 flex items-center justify-between text-xs text-[#616875] font-mono">
              <span>{allFiles.length} berkas</span>
              <span>{formattedTotal}</span>
            </div>
          </div>

          <div className="text-[10px] font-bold uppercase tracking-widest text-[#555a64] mb-2">
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
                      <span className="text-[#9ea5b1]">{config.label}</span>
                    </div>
                    <span className="font-mono text-[#616875]">{count} berkas</span>
                  </div>
                );
              }
            )}
          </div>
        </div>

        <div className="p-3 bg-[#181c23]/60 border border-white/5 rounded-xl text-[11px] text-[#616875] leading-relaxed">
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
      <aside className="w-[320px] bg-[#13161c] border-l border-[#222630] p-4 flex flex-col justify-between shrink-0 select-none overflow-y-auto">
        <div>
          <div className="flex items-center justify-between pb-3 border-b border-[#222630] mb-4">
            <h3 className="text-[10px] font-bold uppercase tracking-widest text-[#555a64]">
              Pilihan Banyak ({selectedFiles.length})
            </h3>
            <button
              onClick={onCloseInspector}
              className="p-1 rounded-lg text-[#616875] hover:text-[#f5f7fa] hover:bg-[#181c23] cursor-pointer"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="p-3.5 bg-[#181c23] border border-white/6 rounded-xl shadow-[inset_0_1px_0_0_rgba(255,255,255,0.06)] mb-4">
            <div className="text-xs text-[#8a919e]">{selectedFiles.length} berkas dipilih</div>
            <div className="text-xl font-bold font-mono text-[#f5f7fa] mt-1">{formattedBytes}</div>
          </div>

          <div className="text-xs font-semibold text-[#9ea5b1] mb-2">Aksi Massal:</div>
          <div className="space-y-2">
            <button
              onClick={() => showFeedback(`${selectedFiles.length} berkas ditambahkan ke antrian rapikan`)}
              className="w-full h-8 px-3 rounded-xl bg-[#181c23] hover:bg-[#20252e] border border-white/8 text-xs text-[#f5f7fa] font-medium transition-colors text-left flex items-center justify-between cursor-pointer"
            >
              <span>Rapikan {selectedFiles.length} Berkas Ini</span>
              <ExternalLink className="w-3.5 h-3.5 text-[#0a84ff]" />
            </button>
          </div>

          {statusFeedback && (
            <div className="mt-3 p-2 bg-[#0a84ff]/15 border border-[#0a84ff]/30 text-[#0a84ff] rounded-lg text-xs font-medium text-center">
              {statusFeedback}
            </div>
          )}
        </div>

        <div className="text-[11px] text-[#616875]">
          Tip: Tekan <kbd className="px-1 py-0.5 bg-[#181c23] rounded border border-[#222630]">Space</kbd> untuk memilih/lepas baris aktif.
        </div>
      </aside>
    );
  }

  // State 3: Single file selected
  if (!file) return null;

  const categoryConfig = CATEGORY_CONFIG[file.category];

  return (
    <aside className="w-[320px] bg-[#13161c] border-l border-[#222630] p-4 flex flex-col justify-between shrink-0 select-none overflow-y-auto">
      <div>
        {/* Header & Close */}
        <div className="flex items-center justify-between pb-2 border-b border-[#222630] mb-3">
          <span className="text-[10px] font-bold uppercase tracking-widest text-[#555a64]">
            Detail Berkas
          </span>
          <button
            onClick={onCloseInspector}
            className="p-1 rounded-lg text-[#616875] hover:text-[#f5f7fa] hover:bg-[#181c23] cursor-pointer"
            title="Tutup Panel Inspector"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* Visual Preview Box */}
        <div className="w-full h-36 bg-[#101217] border border-white/6 rounded-xl overflow-hidden flex flex-col items-center justify-center p-3 relative group mb-3 shadow-[inset_0_1px_3px_rgba(0,0,0,0.6)]">
          {file.previewType === 'image' ? (
            <div className="w-full h-full rounded-lg flex flex-col items-center justify-center bg-gradient-to-br from-[#181c23] to-[#1e232d] border border-white/8">
              <ImageIcon className="w-10 h-10 text-[#b49bea] mb-1" />
              <span className="text-[11px] text-[#9ea5b1]">Pratinjau Gambar</span>
            </div>
          ) : file.previewType === 'pdf' || file.previewType === 'text' ? (
            <div className="w-full h-full p-2.5 bg-[#181c23] border border-white/6 rounded-lg text-[10px] text-[#9ea5b1] font-mono leading-relaxed overflow-hidden">
              <div className="text-[9px] uppercase tracking-wider text-[#616875] mb-1 font-bold">
                Teks Dokumen:
              </div>
              {file.contentSnippet || 'Memuat cuplikan isi dokumen...'}
            </div>
          ) : (
            <div className="flex flex-col items-center gap-1.5 text-center">
              {renderFileIcon(file.category)}
              <span className="text-xs font-mono uppercase text-[#616875]">.{file.extension}</span>
            </div>
          )}
        </div>

        {/* File Name */}
        <div className="mb-3">
          <div className="font-bold text-sm text-[#f5f7fa] break-words select-text" title={file.name}>
            {file.name}
          </div>
        </div>

        {/* Category Picker & Lock */}
        <div className="mb-3 p-2.5 bg-[#181c23] border border-white/6 rounded-xl shadow-[inset_0_1px_0_0_rgba(255,255,255,0.06)]">
          <div className="flex items-center justify-between text-xs mb-1.5">
            <span className="text-[#8a919e]">Kategori</span>
            <button
              onClick={() => onToggleLockCategory(file.id)}
              className="flex items-center gap-1 text-[11px] text-[#0a84ff] hover:text-[#0070e0] cursor-pointer"
              title={file.isLocked ? 'Kategori dikunci (tidak diubah otomatis)' : 'Kunci kategori'}
            >
              {file.isLocked ? (
                <>
                  <Lock className="w-3 h-3 text-[#e5ac38]" />
                  <span className="text-[#e5ac38] font-semibold">Terkunci</span>
                </>
              ) : (
                <>
                  <Unlock className="w-3 h-3 text-[#616875]" />
                  <span className="text-[#616875]">Otomatis</span>
                </>
              )}
            </button>
          </div>

          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full shrink-0" style={{ backgroundColor: categoryConfig.color }} />
            <select
              value={file.category}
              onChange={(e) => onUpdateFileCategory(file.id, e.target.value as CategoryId)}
              className="w-full bg-[#101217] border border-white/8 text-xs text-[#f5f7fa] rounded-lg px-2.5 py-1 focus:outline-hidden focus:border-[#0a84ff] cursor-pointer"
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
          <div className="flex items-center justify-between py-1 border-b border-[#20242c]">
            <span className="text-[#8a919e] flex items-center gap-1.5">
              <HardDrive className="w-3.5 h-3.5 text-[#616875]" />
              <span>Ukuran</span>
            </span>
            <span className="font-mono text-[#f5f7fa] tabular-nums">{file.sizeFormatted}</span>
          </div>

          <div className="flex items-center justify-between py-1 border-b border-[#20242c]">
            <span className="text-[#8a919e] flex items-center gap-1.5">
              <Calendar className="w-3.5 h-3.5 text-[#616875]" />
              <span>Diubah</span>
            </span>
            <span className="font-mono text-[#f5f7fa] tabular-nums">{file.modifiedFormatted}</span>
          </div>

          <div className="flex items-center justify-between py-1 border-b border-[#20242c]">
            <span className="text-[#8a919e] flex items-center gap-1.5">
              <Fingerprint className="w-3.5 h-3.5 text-[#616875]" />
              <span title="Sidik jari berkas untuk deteksi duplikat">{MIKRO_KOPI_TERMS.hash}</span>
            </span>
            <span className="font-mono text-[11px] text-[#0a84ff] tabular-nums truncate max-w-[140px]" title={file.checksum}>
              {file.checksum}
            </span>
          </div>
        </div>

        {/* Star Rating */}
        <div className="mb-3">
          <div className="text-xs text-[#8a919e] mb-1.5">Kepentingan / Rating</div>
          <div className="flex items-center gap-1">
            {[1, 2, 3, 4, 5].map((star) => (
              <button
                key={star}
                onClick={() => onUpdateFileRating(file.id, star === file.rating ? 0 : star)}
                className="p-1 text-[#616875] hover:text-[#e5ac38] transition-colors focus-ring rounded cursor-pointer"
                title={`Rating ${star}`}
              >
                <Star
                  className={`w-4 h-4 ${
                    star <= file.rating ? 'fill-[#e5ac38] text-[#e5ac38]' : 'text-[#343b47]'
                  }`}
                />
              </button>
            ))}
            <span className="text-[11px] text-[#616875] ml-2">
              {file.rating > 0 ? `${file.rating}/5` : 'Tanpa rating'}
            </span>
          </div>
        </div>

        {/* Tags Management */}
        <div className="mb-4">
          <div className="text-xs text-[#8a919e] mb-1.5">Label / Tag</div>
          <div className="flex flex-wrap gap-1 mb-2">
            {file.tags.map((t) => (
              <span
                key={t}
                className="inline-flex items-center gap-1 px-2 py-0.5 bg-[#181c23] border border-white/8 text-[11px] text-[#9ea5b1] rounded-md font-mono"
              >
                #{t}
                <button
                  onClick={() => onRemoveFileTag(file.id, t)}
                  className="hover:text-[#f85149] focus-ring cursor-pointer"
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
              className="flex-1 bg-[#101217] border border-white/8 rounded-lg px-2.5 py-1 text-xs text-[#f5f7fa] placeholder-[#555a64] focus:outline-hidden focus:border-[#0a84ff]"
            />
            <button
              type="submit"
              className="px-2.5 py-1 bg-[#181c23] hover:bg-[#20252e] border border-white/8 text-xs text-[#9ea5b1] hover:text-[#f5f7fa] rounded-lg flex items-center cursor-pointer"
            >
              <Plus className="w-3 h-3" />
            </button>
          </form>
        </div>
      </div>

      {/* Primary Explorer Actions */}
      <div className="pt-3 border-t border-[#222630] space-y-1.5">
        <button
          onClick={() => showFeedback(`Membuka berkas: ${file.name}`)}
          className="w-full h-8 px-3 rounded-xl bg-[#0a84ff] hover:bg-[#0070e0] text-white text-xs font-bold flex items-center justify-center gap-1.5 shadow-[0_2px_8px_rgba(10,132,255,0.4)] transition-all cursor-pointer"
        >
          <ExternalLink className="w-3.5 h-3.5" />
          <span>Buka Berkas</span>
        </button>

        <button
          onClick={() => showFeedback(`Lokasi di Windows Explorer: ${file.path}`)}
          className="w-full h-8 px-3 rounded-xl bg-[#181c23] hover:bg-[#20252e] border border-white/8 text-xs text-[#f5f7fa] flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
        >
          <FolderOpen className="w-3.5 h-3.5 text-[#e5ac38]" />
          <span>Buka Lokasi di Explorer</span>
        </button>

        <button
          onClick={() => handleCopyPath(file.path)}
          className="w-full h-7 px-2 rounded-lg text-[11px] text-[#616875] hover:text-[#f5f7fa] hover:bg-[#181c23] flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
        >
          <Copy className="w-3 h-3" />
          <span>{copiedNotification ? 'Jalur Tersalin!' : 'Salin Jalur Path'}</span>
        </button>

        {statusFeedback && (
          <div className="p-1.5 bg-[#0a84ff]/15 border border-[#0a84ff]/30 text-[#0a84ff] rounded-lg text-xs font-medium text-center animate-in fade-in">
            {statusFeedback}
          </div>
        )}
      </div>
    </aside>
  );
};
