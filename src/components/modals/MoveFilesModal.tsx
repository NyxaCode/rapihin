import React, { useState } from 'react';
import { Folder, FolderInput, X, Check, ArrowRight, FolderTree } from 'lucide-react';
import { FileItem, FolderNode } from '../../types';

interface MoveFilesModalProps {
  isOpen: boolean;
  onClose: () => void;
  selectedFiles: FileItem[];
  folders: FolderNode[];
  onConfirmMove: (targetFolderId: string, targetFolderPath: string) => void;
}

export const MoveFilesModal: React.FC<MoveFilesModalProps> = ({
  isOpen,
  onClose,
  selectedFiles,
  folders,
  onConfirmMove,
}) => {
  const [selectedFolderId, setSelectedFolderId] = useState<string>(
    folders[0]?.id || ''
  );

  if (!isOpen || selectedFiles.length === 0) return null;

  // Flatten all folders for selection (including children)
  const flattenFolders = (nodeList: FolderNode[]): { id: string; name: string; path: string; depth: number }[] => {
    const res: { id: string; name: string; path: string; depth: number }[] = [];
    const traverse = (items: FolderNode[], depth = 0) => {
      for (const item of items) {
        res.push({ id: item.id, name: item.name, path: item.path, depth });
        if (item.children && item.children.length > 0) {
          traverse(item.children, depth + 1);
        }
      }
    };
    traverse(nodeList);
    return res;
  };

  const flatFolderList = flattenFolders(folders);
  const targetFolder = flatFolderList.find((f) => f.id === selectedFolderId) || flatFolderList[0];

  const handleMove = () => {
    if (!targetFolder) return;
    onConfirmMove(targetFolder.id, targetFolder.path);
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 z-50 select-none animate-in fade-in duration-150">
      <div className="bg-[#1e2226] border border-[#454e58] rounded-2xl shadow-2xl max-w-lg w-full flex flex-col overflow-hidden text-xs">
        {/* Header */}
        <div className="px-5 py-4 border-b border-[#333a42] flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-[#6fc48a]/20 text-[#6fc48a] flex items-center justify-center">
              <FolderInput className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-sm font-bold text-[#f3f5f7]">
                Pindahkan {selectedFiles.length} Berkas
              </h2>
              <p className="text-[11px] text-[#7c8792]">
                Pilih direktori tujuan pemindahan berkas
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

        {/* Selected files preview */}
        <div className="px-5 py-3 bg-[#191c20] border-b border-[#333a42] max-h-28 overflow-y-auto">
          <div className="text-[11px] font-semibold text-[#8ab4f8] mb-1.5 flex items-center justify-between">
            <span>Berkas yang dipindahkan:</span>
            <span className="font-mono text-[#7c8792]">{selectedFiles.length} berkas</span>
          </div>
          <div className="space-y-1">
            {selectedFiles.map((f) => (
              <div key={f.id} className="flex items-center justify-between text-[11px] text-[#b3bcc5]">
                <span className="truncate max-w-[280px] font-medium text-[#f3f5f7]">{f.name}</span>
                <span className="font-mono text-[#7c8792] shrink-0 text-[10px]">{f.sizeFormatted}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Destination Folder Selector */}
        <div className="p-5 flex-1 overflow-y-auto">
          <label className="text-xs font-semibold text-[#f3f5f7] mb-2 flex items-center gap-1.5">
            <FolderTree className="w-3.5 h-3.5 text-[#8ab4f8]" />
            <span>Pilih Folder Tujuan:</span>
          </label>
          <div className="space-y-1.5 max-h-48 overflow-y-auto pr-1">
            {flatFolderList.map((folder) => {
              const isSelected = folder.id === selectedFolderId;
              return (
                <div
                  key={folder.id}
                  onClick={() => setSelectedFolderId(folder.id)}
                  style={{ paddingLeft: `${folder.depth * 16 + 12}px` }}
                  className={`py-2 pr-3 rounded-lg flex items-center justify-between cursor-pointer border transition-all ${
                    isSelected
                      ? 'bg-[#2c3a4d] border-[#8ab4f8] text-[#f3f5f7]'
                      : 'bg-[#141619] border-[#333a42] hover:bg-[#23272c] text-[#b3bcc5]'
                  }`}
                >
                  <div className="flex items-center gap-2 truncate">
                    <Folder className={`w-3.5 h-3.5 ${isSelected ? 'text-[#8ab4f8]' : 'text-[#7c8792]'}`} />
                    <span className="font-medium text-xs truncate">{folder.name}</span>
                    <span className="text-[10px] font-mono text-[#7c8792] truncate hidden sm:inline">
                      ({folder.path})
                    </span>
                  </div>
                  {isSelected && <Check className="w-4 h-4 text-[#8ab4f8] shrink-0" />}
                </div>
              );
            })}
          </div>

          {/* Path Preview */}
          {targetFolder && (
            <div className="mt-4 p-2.5 bg-[#141619] border border-[#333a42] rounded-lg flex items-center gap-2 text-[11px]">
              <span className="text-[#7c8792]">Tujuan:</span>
              <span className="font-mono text-[#8ab4f8] font-semibold truncate">
                {targetFolder.path}
              </span>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-5 py-3.5 bg-[#191c20] border-t border-[#333a42] flex items-center justify-end gap-2.5">
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-lg bg-[#23272c] hover:bg-[#2a2f35] text-[#b3bcc5] hover:text-[#f3f5f7] border border-[#333a42] transition-colors cursor-pointer text-xs font-medium"
          >
            Batal
          </button>
          <button
            onClick={handleMove}
            className="px-4 py-2 rounded-lg bg-[#6fc48a] hover:bg-[#5bb377] text-[#141619] font-bold transition-colors cursor-pointer text-xs flex items-center gap-1.5 shadow-sm"
          >
            <FolderInput className="w-3.5 h-3.5" />
            <span>Pindahkan Sekarang</span>
          </button>
        </div>
      </div>
    </div>
  );
};
