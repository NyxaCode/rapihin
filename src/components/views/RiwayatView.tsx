import React, { useState } from 'react';
import {
  History,
  RotateCcw,
  CheckCircle2,
  AlertTriangle,
  FileText,
  ChevronRight,
  X,
  FileWarning,
  ExternalLink,
} from 'lucide-react';
import { OperationManifest } from '../../types';

interface RiwayatViewProps {
  manifests: OperationManifest[];
  onRollback: (manifestId: string) => void;
}

export const RiwayatView: React.FC<RiwayatViewProps> = ({ manifests, onRollback }) => {
  const [selectedManifest, setSelectedManifest] = useState<OperationManifest | null>(null);

  return (
    <div className="flex-1 flex flex-col bg-[#141619] overflow-hidden select-none">
      {/* Header Banner */}
      <div className="h-14 px-6 bg-[#191c20] border-b border-[#333a42] flex items-center justify-between shrink-0">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-[#8ab4f8]/20 flex items-center justify-center text-[#8ab4f8]">
            <History className="w-4 h-4" />
          </div>
          <div>
            <h2 className="text-sm font-semibold text-[#f3f5f7]">Riwayat Operasi & Catatan Manifest</h2>
            <p className="text-[11px] text-[#7c8792]">
              Setiap berkas yang dipindahkan tercatat lengkap dan dapat dikembalikan (Rollback) kapan saja
            </p>
          </div>
        </div>

        {manifests.length > 0 && (
          <button
            onClick={() => {
              if (confirm('Kembalikan operasi terakhir? Berkas akan dipindahkan kembali ke lokasi awal.')) {
                onRollback(manifests[0].id);
              }
            }}
            className="h-8 px-3 rounded-md bg-[#23272c] hover:bg-[#2a2f35] border border-[#333a42] text-xs font-medium text-[#e0ab5c] flex items-center gap-1.5 transition-colors focus-ring"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Kembalikan Terakhir (Ctrl+Z)</span>
          </button>
        )}
      </div>

      {/* Manifest Table per TDD §8.7 */}
      <div className="flex-1 flex flex-col overflow-hidden">
        <div className="h-8 bg-[#1e2226] border-b border-[#333a42] px-6 flex items-center text-xs font-semibold text-[#7c8792] shrink-0">
          <div className="w-36">Waktu Eksekusi</div>
          <div className="flex-1 min-w-[200px]">Nama Operasi & Modul</div>
          <div className="w-24 text-center">Jumlah Berkas</div>
          <div className="w-32 text-center">Hasil</div>
          <div className="w-28 text-right pr-2">Aksi</div>
        </div>

        <div className="flex-1 overflow-y-auto divide-y divide-[#23272c]">
          {manifests.length === 0 ? (
            <div className="flex flex-col items-center justify-center p-12 text-center">
              <FileText className="w-10 h-10 text-[#7c8792] mb-2" />
              <div className="text-xs font-semibold text-[#f3f5f7]">Belum ada operasi tercatat.</div>
              <div className="text-[11px] text-[#7c8792]">Riwayat akan muncul saat Anda merapikan atau memindahkan berkas.</div>
            </div>
          ) : (
            manifests.map((m) => (
              <div
                key={m.id}
                className="h-12 px-6 flex items-center text-xs text-[#b3bcc5] hover:bg-[#23272c] transition-colors"
              >
                <div className="w-36 font-mono text-[11px] text-[#7c8792]">{m.timestamp}</div>
                <div className="flex-1 min-w-[200px] font-medium text-[#f3f5f7] truncate pr-4">
                  {m.operationType}
                </div>
                <div className="w-24 text-center font-mono tabular-nums">{m.totalFiles}</div>
                <div className="w-32 flex justify-center">
                  {m.status === 'sukses' ? (
                    <span className="inline-flex items-center gap-1 text-[#6fc48a] font-medium">
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      <span>Sukses</span>
                    </span>
                  ) : (
                    <span className="inline-flex items-center gap-1 text-[#e0ab5c] font-medium">
                      <AlertTriangle className="w-3.5 h-3.5" />
                      <span>{m.failedCount} Gagal</span>
                    </span>
                  )}
                </div>
                <div className="w-28 text-right flex items-center justify-end gap-2 pr-2">
                  <button
                    onClick={() => setSelectedManifest(m)}
                    className="px-2 py-1 bg-[#23272c] hover:bg-[#2a2f35] border border-[#333a42] rounded text-[11px] text-[#8ab4f8] transition-colors"
                  >
                    Detail
                  </button>
                  <button
                    onClick={() => {
                      if (confirm(`Kembalikan operasi "${m.operationType}"?`)) {
                        onRollback(m.id);
                      }
                    }}
                    className="p-1 hover:bg-[#2a2f35] text-[#7c8792] hover:text-[#e0ab5c] rounded transition-colors"
                    title="Kembalikan operasi ini"
                  >
                    <RotateCcw className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Manifest Detail Modal */}
      {selectedManifest && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 z-50">
          <div className="bg-[#1e2226] border border-[#454e58] rounded-xl shadow-2xl max-w-2xl w-full max-h-[80vh] flex flex-col overflow-hidden">
            <div className="px-5 py-4 border-b border-[#333a42] flex items-center justify-between">
              <div>
                <h3 className="text-sm font-semibold text-[#f3f5f7]">
                  Rincian Catatan Manifest ({selectedManifest.id})
                </h3>
                <div className="text-[11px] text-[#7c8792] font-mono mt-0.5">
                  Waktu: {selectedManifest.timestamp} · Total: {selectedManifest.totalFiles} berkas
                </div>
              </div>
              <button
                onClick={() => setSelectedManifest(null)}
                className="p-1 rounded text-[#7c8792] hover:text-[#f3f5f7] hover:bg-[#2a2f35]"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="p-5 flex-1 overflow-y-auto space-y-3">
              {selectedManifest.items.map((item, idx) => (
                <div
                  key={idx}
                  className={`p-3 rounded-lg border text-xs ${
                    item.success
                      ? 'bg-[#23272c] border-[#333a42]'
                      : 'bg-[#e07e88]/10 border-[#e07e88]/30'
                  }`}
                >
                  <div className="flex items-center justify-between font-mono font-medium text-[#f3f5f7] mb-1">
                    <span className="truncate pr-2">{item.fileName}</span>
                    <span
                      className={`text-[10px] uppercase font-bold ${
                        item.success ? 'text-[#6fc48a]' : 'text-[#e07e88]'
                      }`}
                    >
                      {item.success ? 'Sukses' : 'Gagal Sebagian'}
                    </span>
                  </div>

                  <div className="text-[11px] font-mono text-[#7c8792] space-y-0.5">
                    <div>Asal: {item.from}</div>
                    <div className="text-[#8ab4f8]">Tujuan: {item.to}</div>
                    <div>Alasan: {item.reason} ({item.engine})</div>
                  </div>

                  {item.errorReason && (
                    <div className="mt-2 p-2 bg-[#141619] rounded border border-[#e07e88]/40 text-[#e07e88] text-[11px] flex items-center gap-2">
                      <FileWarning className="w-4 h-4 shrink-0" />
                      <span>{item.errorReason}</span>
                    </div>
                  )}
                </div>
              ))}
            </div>

            <div className="px-5 py-3 border-t border-[#333a42] flex items-center justify-between bg-[#191c20]">
              <div className="text-[11px] text-[#7c8792]">
                Pemeriksaan integritas: Berkas asli diverifikasi sebelum pemindahan.
              </div>
              <button
                onClick={() => setSelectedManifest(null)}
                className="px-4 py-1.5 bg-[#8ab4f8] text-[#141619] text-xs font-semibold rounded hover:bg-[#6fa0ed]"
              >
                Tutup
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
