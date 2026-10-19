import React from 'react';
import {
  GitCommit,
  GitBranch,
  RotateCcw,
  CheckCircle2,
  Folder,
  ChevronRight,
  X,
  History,
  Eye,
  Calendar,
} from 'lucide-react';
import { HistoryCommitNode } from '../../types';

interface HistoryNodeGraphProps {
  nodes: HistoryCommitNode[];
  activeNodeId: string;
  onSelectNode: (nodeId: string) => void;
  onRollbackToNode: (node: HistoryCommitNode) => void;
  isOpen: boolean;
  onClose: () => void;
}

export const HistoryNodeGraph: React.FC<HistoryNodeGraphProps> = ({
  nodes,
  activeNodeId,
  onSelectNode,
  onRollbackToNode,
  isOpen,
  onClose,
}) => {
  if (!isOpen) return null;

  const activeNode = nodes.find((n) => n.id === activeNodeId) || nodes[0];

  return (
    <div className="bg-[#191c20] border-b border-[#333a42] p-4 shrink-0 transition-all select-none text-xs">
      <div className="max-w-7xl mx-auto flex flex-col gap-3">
        {/* Top Info Bar */}
        <div className="flex items-center justify-between pb-2 border-b border-[#23272c]">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded bg-[#8ab4f8]/20 flex items-center justify-center text-[#8ab4f8]">
              <GitBranch className="w-3.5 h-3.5" />
            </div>
            <div>
              <div className="font-semibold text-[#f3f5f7] flex items-center gap-2">
                <span>Pohon Riwayat Operasi (Git Commit Node Graph)</span>
                <span className="text-[10px] font-mono text-[#8ab4f8]">Snapshot Timeline</span>
              </div>
              <p className="text-[11px] text-[#7c8792]">
                Klik node untuk melihat struktur folder pada titik waktu tersebut & berpindah antar snapshot.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => onRollbackToNode(activeNode)}
              className="px-3 py-1.5 bg-[#e0ab5c]/20 hover:bg-[#e0ab5c]/30 text-[#e0ab5c] border border-[#e0ab5c]/40 rounded text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Kembalikan ke Node Ini ({activeNode.commitHash})</span>
            </button>
            <button
              onClick={onClose}
              className="p-1 rounded text-[#7c8792] hover:text-[#f3f5f7] hover:bg-[#23272c]"
              title="Tutup Graph"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* GitHub-style Commit Nodes Line */}
        <div className="flex items-center gap-2 overflow-x-auto py-1 px-1">
          {nodes.map((node, index) => {
            const isSelected = node.id === activeNodeId;
            const isLatest = index === 0;

            return (
              <div key={node.id} className="flex items-center gap-2 shrink-0">
                <button
                  onClick={() => onSelectNode(node.id)}
                  className={`group flex items-center gap-2.5 p-2.5 rounded-lg transition-all border text-left cursor-pointer ${
                    isSelected
                      ? 'bg-[#2c3a4d] border-[#8ab4f8] shadow-sm'
                      : 'bg-[#23272c] border-[#333a42] hover:border-[#454e58]'
                  }`}
                >
                  {/* Commit Dot */}
                  <div
                    className={`w-3.5 h-3.5 rounded-full flex items-center justify-center font-bold text-[8px] shrink-0 ${
                      isSelected
                        ? 'bg-[#8ab4f8] text-[#141619] ring-2 ring-[#8ab4f8]/30'
                        : isLatest
                        ? 'bg-[#6fc48a] text-[#141619]'
                        : 'bg-[#5a636d] text-white'
                    }`}
                  />

                  <div className="flex flex-col">
                    <div className="flex items-center gap-2">
                      <span className="font-mono text-[10px] text-[#8ab4f8] font-bold">
                        {node.commitHash}
                      </span>
                      {isLatest && (
                        <span className="px-1 py-0.2 bg-[#6fc48a]/20 text-[#6fc48a] text-[9px] rounded font-bold font-mono">
                          TERKINI
                        </span>
                      )}
                    </div>
                    <span className="text-xs font-semibold text-[#f3f5f7] truncate max-w-[190px]">
                      {node.title}
                    </span>
                    <span className="text-[10px] font-mono text-[#7c8792]">
                      {node.timestamp} · {node.filesAffected} berkas
                    </span>
                  </div>
                </button>

                {/* Connecting branch line */}
                {index < nodes.length - 1 && (
                  <div className="w-5 h-0.5 bg-[#333a42] shrink-0 relative flex items-center justify-center">
                    <ChevronRight className="w-3 h-3 text-[#5a636d] absolute" />
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {/* Folder Structure Preview Strip at the selected commit snapshot */}
        <div className="bg-[#141619] border border-[#333a42] rounded-lg p-2.5 flex items-center justify-between gap-3 text-xs">
          <div className="flex items-center gap-2">
            <Eye className="w-3.5 h-3.5 text-[#8ab4f8]" />
            <span className="text-[#7c8792]">Pratinjau Snapshot:</span>
            <span className="font-semibold text-[#f3f5f7]">{activeNode.title}</span>
          </div>

          <div className="flex items-center gap-2 overflow-x-auto text-[11px] font-mono">
            {activeNode.folderSnapshot.map((f) => (
              <div
                key={f.id}
                className="flex items-center gap-1.5 px-2 py-0.5 bg-[#23272c] rounded border border-[#333a42] text-[#b3bcc5] shrink-0"
              >
                <Folder className="w-3 h-3 text-[#8ab4f8]" />
                <span className="font-medium">{f.name}</span>
                <span className="text-[#7c8792] text-[10px]">({f.fileCount})</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
