import React, { useState, useEffect } from 'react';
import { Search, Folder, Wand2, BrushCleaning, History, Settings, X, ArrowRight } from 'lucide-react';
import { ActiveArea } from '../../types';

interface CommandPaletteProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectArea: (area: ActiveArea) => void;
  onTriggerScan: () => void;
  onStartRapikan: () => void;
}

export const CommandPalette: React.FC<CommandPaletteProps> = ({
  isOpen,
  onClose,
  onSelectArea,
  onTriggerScan,
  onStartRapikan,
}) => {
  const [query, setQuery] = useState('');

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
        e.preventDefault();
        // Toggle palette
      } else if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const commands = [
    {
      id: 'goto_perpustakaan',
      label: 'Buka Folder Berkas',
      area: 'perpustakaan' as ActiveArea,
      shortcut: 'Ctrl+1',
      icon: Folder,
      action: () => {
        onSelectArea('perpustakaan');
        onClose();
      },
    },
    {
      id: 'goto_rapikan',
      label: 'Mulai Rapikan Otomatis (Wizard Popup)',
      shortcut: 'Ctrl+R',
      icon: Wand2,
      action: () => {
        onStartRapikan();
        onClose();
      },
    },
    {
      id: 'goto_kebersihan',
      label: 'Buka Halaman Clean up (Peta Ruang & Temuan)',
      area: 'kebersihan' as ActiveArea,
      shortcut: 'Ctrl+2',
      icon: BrushCleaning,
      action: () => {
        onSelectArea('kebersihan');
        onClose();
      },
    },
    {
      id: 'goto_riwayat',
      label: 'Lihat Riwayat & Kembalikan (Rollback)',
      area: 'riwayat' as ActiveArea,
      shortcut: 'Ctrl+4',
      icon: History,
      action: () => {
        onSelectArea('riwayat');
        onClose();
      },
    },
    {
      id: 'goto_pengaturan',
      label: 'Buka Pengaturan Aplikasi',
      area: 'pengaturan' as ActiveArea,
      shortcut: 'Ctrl+,',
      icon: Settings,
      action: () => {
        onSelectArea('pengaturan');
        onClose();
      },
    },
    {
      id: 'scan_now',
      label: 'Pindai Ulang Folder Sumber Sekarang',
      shortcut: 'F5',
      icon: Folder,
      action: () => {
        onTriggerScan();
        onClose();
      },
    },
  ];

  const filteredCommands = commands.filter((c) =>
    c.label.toLowerCase().includes(query.toLowerCase())
  );

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-xs flex items-start justify-center pt-24 p-4 z-50">
      <div className="bg-[#1e2226] border border-[#454e58] rounded-xl shadow-2xl max-w-lg w-full overflow-hidden flex flex-col">
        {/* Input */}
        <div className="p-3 border-b border-[#333a42] flex items-center gap-2.5">
          <Search className="w-4 h-4 text-[#8ab4f8] shrink-0" />
          <input
            autoFocus
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Ketik perintah atau cari area aplikasi... (Esc untuk tutup)"
            className="flex-1 bg-transparent text-xs text-[#f3f5f7] placeholder-[#7c8792] focus:outline-none"
          />
          <button onClick={onClose} className="p-1 rounded text-[#7c8792] hover:text-[#f3f5f7]">
            <X className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* Command list */}
        <div className="max-h-64 overflow-y-auto p-1.5 space-y-0.5">
          {filteredCommands.length === 0 ? (
            <div className="p-4 text-center text-xs text-[#7c8792]">Perintah tidak ditemukan.</div>
          ) : (
            filteredCommands.map((cmd) => {
              const Icon = cmd.icon;
              return (
                <button
                  key={cmd.id}
                  onClick={cmd.action}
                  className="w-full h-9 px-3 rounded-md text-xs text-left flex items-center justify-between text-[#b3bcc5] hover:bg-[#2c3a4d] hover:text-[#f3f5f7] transition-colors group"
                >
                  <div className="flex items-center gap-2.5">
                    <Icon className="w-4 h-4 text-[#8ab4f8]" />
                    <span>{cmd.label}</span>
                  </div>
                  {cmd.shortcut && (
                    <kbd className="px-1.5 py-0.5 text-[10px] font-mono text-[#7c8792] bg-[#141619] border border-[#333a42] rounded">
                      {cmd.shortcut}
                    </kbd>
                  )}
                </button>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
};
