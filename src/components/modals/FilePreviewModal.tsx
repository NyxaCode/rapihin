import React from 'react';
import {
  X,
  FileText,
  Image as ImageIcon,
  Video,
  Music,
  Archive,
  Package,
  Code2,
  File,
  Calendar,
  HardDrive,
  FolderOpen,
  Tag,
  CheckCircle2,
  Hash,
} from 'lucide-react';
import { CategoryId, FileItem } from '../../types';
import { CATEGORY_CONFIG } from '../../constants/tokens';

interface FilePreviewModalProps {
  isOpen: boolean;
  file: FileItem | null;
  onClose: () => void;
  isKept?: boolean;
  onMarkAsKept?: () => void;
}

export const FilePreviewModal: React.FC<FilePreviewModalProps> = ({
  isOpen,
  file,
  onClose,
  isKept,
  onMarkAsKept,
}) => {
  if (!isOpen || !file) return null;

  const config = CATEGORY_CONFIG[file.category];

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

  return (
    <div
      className="fixed inset-0 bg-black/75 backdrop-blur-xs flex items-center justify-center z-50 p-4 select-none animate-in fade-in duration-150"
      onClick={onClose}
    >
      <div
        className="w-full max-w-xl bg-[#1e2226] border border-[#454e58] rounded-xl shadow-2xl overflow-hidden flex flex-col max-h-[85vh]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Modal Header */}
        <div className="h-12 px-4 border-b border-[#333a42] flex items-center justify-between bg-[#191c20] shrink-0">
          <div className="flex items-center gap-2.5 min-w-0">
            <div
              className="w-3 h-3 rounded-full shrink-0"
              style={{ backgroundColor: config.color }}
            />
            <span className="font-semibold text-xs text-[#f3f5f7] truncate">
              Pratinjau Berkas: {file.name}
            </span>
            <span className="px-1.5 py-0.5 bg-[#141619] border border-[#333a42] text-[10px] font-mono uppercase text-[#8ab4f8] rounded shrink-0">
              .{file.extension}
            </span>
          </div>

          <button
            onClick={onClose}
            className="p-1 rounded text-[#7c8792] hover:text-[#f3f5f7] hover:bg-[#2a2f35] transition-colors cursor-pointer"
            title="Tutup (Esc)"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="flex-1 overflow-y-auto p-5 space-y-4">
          {/* Main Preview Box */}
          <div className="w-full rounded-lg bg-[#141619] border border-[#333a42] p-4 flex flex-col items-center justify-center min-h-[160px] relative overflow-hidden">
            {file.category === 'image' ? (
              <div className="flex flex-col items-center justify-center gap-2 text-center">
                <div className="w-24 h-24 rounded-lg bg-[#23272c] border border-[#333a42] flex items-center justify-center shadow-inner">
                  <ImageIcon className="w-12 h-12 text-[#b49bea]" />
                </div>
                <span className="text-[11px] text-[#7c8792] font-mono">
                  {file.name} (Pratinjau Citra)
                </span>
              </div>
            ) : file.contentSnippet ? (
              <div className="w-full text-left font-mono text-xs bg-[#191c20] border border-[#333a42] rounded p-3 text-[#b3bcc5] whitespace-pre-wrap leading-relaxed max-h-48 overflow-y-auto">
                <div className="text-[10px] uppercase tracking-wider text-[#7c8792] border-b border-[#333a42] pb-1 mb-2">
                  Cuplikan Isi Dokumen:
                </div>
                {file.contentSnippet}
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center gap-2 text-center p-3">
                <div className="p-3 bg-[#191c20] rounded-xl border border-[#333a42]">
                  {renderFileIcon(file.category)}
                </div>
                <div className="text-xs font-semibold text-[#f3f5f7]">{file.name}</div>
                <div className="text-[11px] text-[#7c8792] font-mono">
                  Kategori {config.label} • Ekstensi .{file.extension.toUpperCase()}
                </div>
              </div>
            )}
          </div>

          {/* Metadata Grid: Detail nama, ekstensi, size, tanggal, lokasi */}
          <div className="grid grid-cols-2 gap-2 text-xs font-mono">
            <div className="p-2.5 bg-[#191c20] border border-[#333a42] rounded-lg space-y-1">
              <div className="text-[#7c8792] text-[10px] uppercase flex items-center gap-1">
                <HardDrive className="w-3 h-3 text-[#8ab4f8]" />
                <span>Ukuran Berkas</span>
              </div>
              <div className="text-[#f3f5f7] font-bold text-sm">
                {file.sizeFormatted}
              </div>
              <div className="text-[10px] text-[#5a636d]">
                {file.size.toLocaleString()} bytes
              </div>
            </div>

            <div className="p-2.5 bg-[#191c20] border border-[#333a42] rounded-lg space-y-1">
              <div className="text-[#7c8792] text-[10px] uppercase flex items-center gap-1">
                <Calendar className="w-3 h-3 text-[#8ab4f8]" />
                <span>Tanggal Modifikasi</span>
              </div>
              <div className="text-[#f3f5f7] font-bold text-sm">
                {file.modifiedFormatted}
              </div>
              <div className="text-[10px] text-[#5a636d]">
                {file.modified}
              </div>
            </div>
          </div>

          {/* Location & Checksum Info */}
          <div className="p-3 bg-[#191c20] border border-[#333a42] rounded-lg text-xs space-y-2">
            <div>
              <div className="text-[#7c8792] text-[10px] uppercase font-mono flex items-center gap-1 mb-0.5">
                <FolderOpen className="w-3 h-3 text-[#8ab4f8]" />
                <span>Lokasi Penyimpanan Berkas</span>
              </div>
              <div className="font-mono text-[#f3f5f7] bg-[#141619] p-1.5 rounded border border-[#2a2f35] break-all select-text">
                {file.path}
              </div>
            </div>

            {file.checksum && (
              <div className="pt-1.5 border-t border-[#2a2f35] flex items-center justify-between text-[11px] font-mono">
                <span className="text-[#7c8792] flex items-center gap-1">
                  <Hash className="w-3 h-3 text-[#e4b86a]" />
                  <span>Sidik Jari (Checksum):</span>
                </span>
                <span className="text-[#e4b86a] select-text">{file.checksum}</span>
              </div>
            )}

            {file.tags && file.tags.length > 0 && (
              <div className="pt-1.5 border-t border-[#2a2f35] flex items-center gap-1.5 flex-wrap">
                <span className="text-[#7c8792] text-[10px] flex items-center gap-1">
                  <Tag className="w-3 h-3 text-[#7c8792]" />
                  <span>Tags:</span>
                </span>
                {file.tags.map((t) => (
                  <span
                    key={t}
                    className="px-1.5 py-0.2 bg-[#23272c] text-[#e4b86a] rounded text-[10px] font-mono"
                  >
                    #{t}
                  </span>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Modal Footer */}
        <div className="h-12 px-4 border-t border-[#333a42] bg-[#191c20] flex items-center justify-between shrink-0">
          <div>
            {isKept !== undefined && (
              <span
                className={`text-xs font-medium flex items-center gap-1.5 ${
                  isKept ? 'text-[#6fc48a]' : 'text-[#7c8792]'
                }`}
              >
                {isKept ? (
                  <>
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    <span>Status: Disimpan</span>
                  </>
                ) : (
                  <span>Status: Di buang</span>
                )}
              </span>
            )}
          </div>

          <div className="flex items-center gap-2">
            {onMarkAsKept && !isKept && (
              <button
                onClick={() => {
                  onMarkAsKept();
                  onClose();
                }}
                className="h-8 px-3.5 rounded-lg bg-[#6fc48a] hover:bg-[#5bb376] text-[#141619] text-xs font-bold transition-all cursor-pointer shadow-xs"
              >
                Simpan Salinan Ini
              </button>
            )}
            <button
              onClick={onClose}
              className="h-8 px-3 rounded-lg bg-[#23272c] hover:bg-[#2a2f35] text-[#f3f5f7] border border-[#333a42] text-xs font-medium transition-colors cursor-pointer"
            >
              Tutup
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
