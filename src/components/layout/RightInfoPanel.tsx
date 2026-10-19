import React from 'react';
import {
  MoreVertical,
  ChevronsRight,
  Pin,
  Activity,
  FileText,
  Image as ImageIcon,
  HardDrive,
  Calendar,
  Tag,
  FolderOpen,
} from 'lucide-react';
import { FileItem, FolderNode } from '../../types';

interface RightInfoPanelProps {
  selectedFolder: FolderNode | null;
  selectedFile: FileItem | null;
  onClose: () => void;
  onOpenFolderInExplorer?: () => void;
}

export const RightInfoPanel: React.FC<RightInfoPanelProps> = ({
  selectedFolder,
  selectedFile,
  onClose,
  onOpenFolderInExplorer,
}) => {
  const currentTitle = selectedFile?.name || selectedFolder?.name || 'Ikigai Labs';
  const currentSize = selectedFile?.sizeFormatted || selectedFolder?.sizeFormatted || '180.2 MB';
  const createdDate = selectedFile?.createdFormatted || '12/03/2024';
  const modifiedDate = selectedFile?.modifiedFormatted || '06/12/2024';

  const tags = selectedFile?.tags || ['Sales', 'Marketing', 'Analytics'];

  return (
    <aside className="w-72 bg-white border-l border-[#e2e8f0] p-5 flex flex-col justify-between shrink-0 select-none overflow-y-auto text-xs">
      <div className="space-y-6">
        {/* Header matching image.png */}
        <div className="flex items-center justify-between">
          <h2 className="text-base font-bold text-slate-900 tracking-tight">Info</h2>
          <button
            onClick={onClose}
            className="p-1 rounded-md text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors"
            title="Sembunyikan Panel Info"
          >
            <ChevronsRight className="w-4 h-4" />
          </button>
        </div>

        {/* Metric Cards matching image.png */}
        <div className="space-y-3">
          {/* Card 1: Documents */}
          <div className="p-4 bg-white border border-slate-200/80 rounded-2xl shadow-soft-card">
            <div className="flex items-center justify-between text-slate-500 mb-1">
              <span className="font-medium text-xs">Documents</span>
              <button className="text-slate-400 hover:text-slate-600">
                <MoreVertical className="w-3.5 h-3.5" />
              </button>
            </div>
            <div className="text-xl font-bold text-slate-900 tracking-tight mb-3">
              48.5 GB
            </div>
            {/* Blue Progress Bar */}
            <div className="w-full h-1.5 bg-slate-100 rounded-full overflow-hidden">
              <div className="h-full bg-blue-500 rounded-full" style={{ width: '65%' }} />
            </div>
          </div>

          {/* Card 2: Images */}
          <div className="p-4 bg-white border border-slate-200/80 rounded-2xl shadow-soft-card">
            <div className="flex items-center justify-between text-slate-500 mb-1">
              <span className="font-medium text-xs">Images</span>
              <button className="text-slate-400 hover:text-slate-600">
                <MoreVertical className="w-3.5 h-3.5" />
              </button>
            </div>
            <div className="text-xl font-bold text-slate-900 tracking-tight mb-3">
              182.4 MB
            </div>
            {/* Red Progress Bar */}
            <div className="w-full h-1.5 bg-slate-100 rounded-full overflow-hidden">
              <div className="h-full bg-red-500 rounded-full" style={{ width: '38%' }} />
            </div>
          </div>
        </div>

        {/* Properties Section matching image.png */}
        <div className="space-y-3">
          <h3 className="font-bold text-sm text-slate-900 tracking-tight">Properties</h3>
          <div className="space-y-2 text-xs text-slate-600">
            <div className="flex items-center justify-between">
              <span className="text-slate-500">Size</span>
              <span className="font-medium text-slate-900">{currentSize}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-slate-500">Created</span>
              <span className="font-medium text-slate-900">{createdDate}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-slate-500">Last modification</span>
              <span className="font-medium text-slate-900">{modifiedDate}</span>
            </div>
          </div>
        </div>

        {/* Tags Section matching image.png */}
        <div className="space-y-3">
          <h3 className="font-bold text-sm text-slate-900 tracking-tight">Tags</h3>
          <div className="flex flex-wrap gap-2">
            {tags.map((t, idx) => {
              const dotColor =
                idx === 0 ? 'bg-blue-500 text-blue-700' : idx === 1 ? 'bg-slate-400 text-slate-700' : 'bg-red-400 text-red-700';
              return (
                <span
                  key={t}
                  className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium border border-slate-200/60 bg-slate-50/70"
                >
                  <span className={`w-1.5 h-1.5 rounded-full ${idx === 0 ? 'bg-blue-500' : idx === 1 ? 'bg-slate-500' : 'bg-red-500'}`} />
                  <span className="text-slate-700">{t}</span>
                </span>
              );
            })}
          </div>
        </div>
      </div>

      {/* Bottom links matching image.png */}
      <div className="pt-6 border-t border-slate-100 space-y-3 font-medium text-slate-600">
        <button
          onClick={() => alert('Daftar berkas yang dipin disematkan.')}
          className="flex items-center gap-2.5 hover:text-slate-900 transition-colors w-full text-left"
        >
          <Pin className="w-4 h-4 text-slate-400" />
          <span>Pinned items</span>
        </button>

        <button
          onClick={() => alert('Log aktivitas berkas terakhir.')}
          className="flex items-center gap-2.5 hover:text-slate-900 transition-colors w-full text-left"
        >
          <Activity className="w-4 h-4 text-slate-400" />
          <span>Activity</span>
        </button>
      </div>
    </aside>
  );
};
