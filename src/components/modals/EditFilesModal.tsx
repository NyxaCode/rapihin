import React, { useState, useEffect } from 'react';
import { Edit3, X, Tag, Star, FolderCheck, Check } from 'lucide-react';
import { CategoryId, FileItem } from '../../types';

interface EditFilesModalProps {
  isOpen: boolean;
  onClose: () => void;
  selectedFiles: FileItem[];
  onSave: (updates: {
    name?: string;
    category?: CategoryId;
    tagsToAdd?: string[];
    rating?: number;
  }) => void;
}

const CATEGORIES: { value: CategoryId; label: string; color: string }[] = [
  { value: 'document', label: 'Dokumen', color: '#83b5e8' },
  { value: 'image', label: 'Gambar', color: '#b49bea' },
  { value: 'video', label: 'Video', color: '#e58e9b' },
  { value: 'audio', label: 'Audio', color: '#7cc792' },
  { value: 'installer', label: 'Installer', color: '#e0ab5c' },
  { value: 'archive', label: 'Arsip', color: '#6fc48a' },
  { value: 'code', label: 'Kode', color: '#e58e9b' },
  { value: 'other', label: 'Lainnya', color: '#7c8792' },
];

export const EditFilesModal: React.FC<EditFilesModalProps> = ({
  isOpen,
  onClose,
  selectedFiles,
  onSave,
}) => {
  const isSingle = selectedFiles.length === 1;
  const firstFile = selectedFiles[0];

  const [fileName, setFileName] = useState('');
  const [category, setCategory] = useState<CategoryId>('document');
  const [newTag, setNewTag] = useState('');
  const [tags, setTags] = useState<string[]>([]);
  const [rating, setRating] = useState<number>(0);

  useEffect(() => {
    if (firstFile) {
      setFileName(firstFile.name);
      setCategory(firstFile.category);
      setTags(firstFile.tags || []);
      setRating(firstFile.rating || 0);
    }
  }, [firstFile, isOpen]);

  if (!isOpen || selectedFiles.length === 0) return null;

  const handleAddTag = () => {
    const trimmed = newTag.trim().toLowerCase();
    if (trimmed && !tags.includes(trimmed)) {
      setTags([...tags, trimmed]);
      setNewTag('');
    }
  };

  const handleRemoveTag = (tagToRemove: string) => {
    setTags(tags.filter((t) => t !== tagToRemove));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave({
      name: isSingle ? fileName.trim() : undefined,
      category,
      tagsToAdd: tags,
      rating,
    });
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 z-50 select-none animate-in fade-in duration-150">
      <div className="bg-[#1e2226] border border-[#454e58] rounded-2xl shadow-2xl max-w-md w-full flex flex-col overflow-hidden text-xs">
        {/* Header */}
        <div className="px-5 py-4 border-b border-[#333a42] flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-[#8ab4f8]/20 text-[#8ab4f8] flex items-center justify-center">
              <Edit3 className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-sm font-bold text-[#f3f5f7]">
                {isSingle ? 'Edit Berkas' : `Edit ${selectedFiles.length} Berkas`}
              </h2>
              <p className="text-[11px] text-[#7c8792]">
                {isSingle ? 'Ubah nama berkas, kategori, tag, atau rating' : 'Ubah kategori dan tag bersama'}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-[#7c8792] hover:text-[#f3f5f7] hover:bg-[#2a2f35] transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-5 space-y-4">
          {/* File Name (single file only) */}
          {isSingle && (
            <div>
              <label className="block text-xs font-semibold text-[#f3f5f7] mb-1.5">
                Nama Berkas:
              </label>
              <input
                type="text"
                value={fileName}
                onChange={(e) => setFileName(e.target.value)}
                required
                className="w-full h-9 px-3 bg-[#141619] border border-[#333a42] focus:border-[#8ab4f8] rounded-lg text-xs text-[#f3f5f7] focus:outline-none font-mono"
              />
            </div>
          )}

          {/* Category selection */}
          <div>
            <label className="block text-xs font-semibold text-[#f3f5f7] mb-1.5 flex items-center gap-1.5">
              <FolderCheck className="w-3.5 h-3.5 text-[#8ab4f8]" />
              <span>Kategori:</span>
            </label>
            <div className="grid grid-cols-4 gap-1.5">
              {CATEGORIES.map((cat) => {
                const isSelected = category === cat.value;
                return (
                  <button
                    key={cat.value}
                    type="button"
                    onClick={() => setCategory(cat.value)}
                    className={`py-1.5 px-2 rounded-lg border text-[11px] font-medium flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
                      isSelected
                        ? 'bg-[#2c3a4d] border-[#8ab4f8] text-[#8ab4f8] font-bold'
                        : 'bg-[#141619] border-[#333a42] text-[#7c8792] hover:bg-[#23272c]'
                    }`}
                  >
                    <div
                      className="w-2 h-2 rounded-full shrink-0"
                      style={{ backgroundColor: cat.color }}
                    />
                    <span className="truncate">{cat.label}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Tags */}
          <div>
            <label className="block text-xs font-semibold text-[#f3f5f7] mb-1.5 flex items-center gap-1.5">
              <Tag className="w-3.5 h-3.5 text-[#8ab4f8]" />
              <span>Tag / Label:</span>
            </label>
            <div className="flex gap-2 mb-2">
              <input
                type="text"
                value={newTag}
                onChange={(e) => setNewTag(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault();
                    handleAddTag();
                  }
                }}
                placeholder="Tambah tag baru..."
                className="flex-1 h-8 px-3 bg-[#141619] border border-[#333a42] focus:border-[#8ab4f8] rounded-lg text-xs text-[#f3f5f7] focus:outline-none"
              />
              <button
                type="button"
                onClick={handleAddTag}
                className="px-3 h-8 bg-[#23272c] hover:bg-[#2a2f35] border border-[#333a42] text-[#f3f5f7] rounded-lg text-xs font-medium cursor-pointer"
              >
                Tambah
              </button>
            </div>
            <div className="flex flex-wrap gap-1.5 min-h-6">
              {tags.map((tag) => (
                <span
                  key={tag}
                  className="px-2 py-0.5 rounded-md bg-[#23272c] border border-[#333a42] text-[#b3bcc5] text-[11px] flex items-center gap-1"
                >
                  <span>#{tag}</span>
                  <button
                    type="button"
                    onClick={() => handleRemoveTag(tag)}
                    className="hover:text-[#e07e88] cursor-pointer"
                  >
                    <X className="w-3 h-3" />
                  </button>
                </span>
              ))}
            </div>
          </div>

          {/* Rating */}
          <div>
            <label className="block text-xs font-semibold text-[#f3f5f7] mb-1.5 flex items-center gap-1.5">
              <Star className="w-3.5 h-3.5 text-[#e0ab5c]" />
              <span>Prioritas / Rating:</span>
            </label>
            <div className="flex items-center gap-1">
              {[1, 2, 3, 4, 5].map((star) => (
                <button
                  key={star}
                  type="button"
                  onClick={() => setRating(rating === star ? 0 : star)}
                  className="p-1 hover:scale-110 transition-transform cursor-pointer"
                >
                  <Star
                    className={`w-4 h-4 ${
                      star <= rating
                        ? 'fill-[#e0ab5c] text-[#e0ab5c]'
                        : 'text-[#454e58]'
                    }`}
                  />
                </button>
              ))}
              <span className="ml-2 text-[11px] font-mono text-[#7c8792]">
                {rating > 0 ? `${rating} Bintang` : 'Tanpa Rating'}
              </span>
            </div>
          </div>

          {/* Action buttons */}
          <div className="pt-3 border-t border-[#333a42] flex items-center justify-end gap-2.5">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-lg bg-[#23272c] hover:bg-[#2a2f35] text-[#b3bcc5] hover:text-[#f3f5f7] border border-[#333a42] transition-colors cursor-pointer text-xs font-medium"
            >
              Batal
            </button>
            <button
              type="submit"
              className="px-4 py-2 rounded-lg bg-[#8ab4f8] hover:bg-[#6fa0ed] text-[#141619] font-bold transition-colors cursor-pointer text-xs flex items-center gap-1.5 shadow-sm"
            >
              <Check className="w-3.5 h-3.5" />
              <span>Simpan Perubahan</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
