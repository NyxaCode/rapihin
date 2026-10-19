import React from 'react';
import {
  Folder,
  BrushCleaning,
  History,
  Settings,
  HelpCircle,
} from 'lucide-react';
import { ActiveArea } from '../../types';

interface NavRailProps {
  activeArea: ActiveArea;
  onSelectArea: (area: ActiveArea) => void;
  cleanlinessCount: number;
}

export const NavRail: React.FC<NavRailProps> = ({
  activeArea,
  onSelectArea,
  cleanlinessCount,
}) => {
  const navItems = [
    {
      id: 'perpustakaan' as ActiveArea,
      label: 'Folder',
      shortcut: 'Ctrl+1',
      icon: Folder,
    },
    {
      id: 'kebersihan' as ActiveArea,
      label: 'Clean up',
      shortcut: 'Ctrl+2',
      icon: BrushCleaning,
      badge: cleanlinessCount > 0 ? cleanlinessCount : undefined,
    },
    {
      id: 'riwayat' as ActiveArea,
      label: 'Riwayat',
      shortcut: 'Ctrl+3',
      icon: History,
    },
    {
      id: 'pengaturan' as ActiveArea,
      label: 'Pengaturan',
      shortcut: 'Ctrl+,',
      icon: Settings,
    },
  ];

  return (
    <nav
      className="w-[68px] bg-[#191c20] border-r border-[#333a42] flex flex-col justify-between py-3 shrink-0 z-40 select-none"
      aria-label="Navigasi Utama"
    >
      {/* Top navigation items */}
      <div className="flex flex-col items-center gap-1.5">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = activeArea === item.id;

          return (
            <button
              key={item.id}
              onClick={() => onSelectArea(item.id)}
              className={`relative w-12 h-12 rounded-lg flex flex-col items-center justify-center gap-1 transition-all group focus-ring cursor-pointer ${
                isActive
                  ? 'bg-[#8ab4f8]/15 text-[#8ab4f8]'
                  : 'text-[#b3bcc5] hover:bg-[#23272c] hover:text-[#f3f5f7]'
              }`}
              title={`${item.label} (${item.shortcut})`}
              aria-label={`${item.label} (${item.shortcut})`}
              aria-current={isActive ? 'page' : undefined}
            >
              <Icon className={`w-5 h-5 transition-transform ${isActive ? 'scale-105 stroke-[2.2]' : 'stroke-[1.8]'}`} />
              <span className="text-[10px] font-medium tracking-tight text-center truncate max-w-[56px] leading-tight">
                {item.label}
              </span>

              {/* Active left indicator bar */}
              {isActive && (
                <div className="absolute -left-2 top-2 bottom-2 w-1 bg-[#8ab4f8] rounded-r-full" />
              )}

              {/* Badge indicator */}
              {item.badge !== undefined && (
                <span className="absolute top-1 right-1 px-1 min-w-[16px] h-4 text-[9px] font-mono font-bold bg-[#8ab4f8] text-[#141619] rounded-full flex items-center justify-center">
                  {item.badge}
                </span>
              )}
            </button>
          );
        })}
      </div>

      {/* Bottom utility icons */}
      <div className="flex flex-col items-center gap-1">
        <button
          onClick={() => onSelectArea('bantuan')}
          className="w-10 h-10 rounded-lg flex items-center justify-center text-[#7c8792] hover:bg-[#23272c] hover:text-[#f3f5f7] transition-colors focus-ring cursor-pointer"
          title="Bantuan & Panduan Sistem (F1)"
          aria-label="Bantuan dan Dokumentasi"
        >
          <HelpCircle className="w-4 h-4" />
        </button>
      </div>
    </nav>
  );
};
