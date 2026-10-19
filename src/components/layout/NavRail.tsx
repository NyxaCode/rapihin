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
      className="w-[70px] bg-[#13161c] border-r border-[#222630] flex flex-col justify-between py-3.5 shrink-0 z-40 select-none shadow-[2px_0_12px_rgba(0,0,0,0.3)]"
      aria-label="Navigasi Utama"
    >
      {/* Top navigation items */}
      <div className="flex flex-col items-center gap-2">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = activeArea === item.id;

          return (
            <button
              key={item.id}
              onClick={() => onSelectArea(item.id)}
              className={`relative w-[52px] h-[52px] rounded-xl flex flex-col items-center justify-center gap-1 transition-all group focus-ring cursor-pointer ${
                isActive
                  ? 'bg-[#1e2229] text-[#f5f7fa] border border-white/10 shadow-[inset_0_1px_0_0_rgba(255,255,255,0.08),0_2px_8px_rgba(0,0,0,0.4)]'
                  : 'text-[#8a919e] hover:bg-[#181c23] hover:text-[#f5f7fa] border border-transparent'
              }`}
              title={`${item.label} (${item.shortcut})`}
              aria-label={`${item.label} (${item.shortcut})`}
              aria-current={isActive ? 'page' : undefined}
            >
              <Icon
                className={`w-5 h-5 transition-transform ${
                  isActive
                    ? item.id === 'perpustakaan'
                      ? 'text-[#e5ac38] scale-105 stroke-[2.2]'
                      : 'text-[#0a84ff] scale-105 stroke-[2.2]'
                    : 'stroke-[1.8]'
                }`}
              />
              <span className="text-[10px] font-semibold tracking-tight text-center truncate max-w-[50px] leading-tight">
                {item.label}
              </span>

              {/* Signature AeroBox Cobalt Blue Pill Indicator on Left Edge */}
              {isActive && (
                <div className="absolute -left-[9px] top-3 bottom-3 w-[3.5px] bg-[#0a84ff] rounded-r-full shadow-[0_0_8px_#0a84ff]" />
              )}

              {/* Badge indicator */}
              {item.badge !== undefined && (
                <span className="absolute top-1 right-1 px-1 min-w-[16px] h-4 text-[9px] font-mono font-bold bg-[#0a84ff] text-white rounded-full flex items-center justify-center shadow-[0_0_6px_rgba(10,132,255,0.6)]">
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
          className="w-10 h-10 rounded-xl flex items-center justify-center text-[#616875] hover:bg-[#181c23] hover:text-[#f5f7fa] transition-colors focus-ring cursor-pointer border border-transparent hover:border-[#272c38]"
          title="Bantuan & Panduan Sistem (F1)"
          aria-label="Bantuan dan Dokumentasi"
        >
          <HelpCircle className="w-4 h-4" />
        </button>
      </div>
    </nav>
  );
};
