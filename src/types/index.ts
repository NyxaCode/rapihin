export type CategoryId =
  | 'image'
  | 'video'
  | 'audio'
  | 'document'
  | 'archive'
  | 'installer'
  | 'code'
  | 'other';

export interface FileItem {
  id: string;
  name: string;
  extension: string;
  size: number; // in bytes
  sizeFormatted: string;
  modified: string;
  modifiedFormatted: string;
  createdFormatted?: string;
  path: string;
  folderId?: string;
  category: CategoryId;
  categoryLabel: string;
  tags: string[];
  rating: number; // 0 to 5
  isLocked?: boolean;
  isSuggested?: boolean;
  suggestedFolder?: string;
  checksum?: string;
  previewType: 'image' | 'text' | 'audio' | 'video' | 'pdf' | 'code' | 'archive' | 'binary';
  previewUrl?: string;
  contentSnippet?: string;
}

export interface FolderNode {
  id: string;
  name: string;
  path: string;
  parentId?: string | null;
  fileCount: number;
  sizeFormatted: string;
  notesCount?: number;
  color?: string;
  children?: FolderNode[];
  previewSnippet?: string;
}

export type ViewMode = 'grid' | 'list';

export type ActiveArea =
  | 'perpustakaan'
  | 'riwayat'
  | 'kebersihan'
  | 'pengaturan'
  | 'bantuan';

export interface DynamicCollection {
  id: string;
  name: string;
  iconName: string;
  count: number;
  filterQuery: string;
  isLocked?: boolean;
}

export type AiMode = 'tanpa_ai' | 'llm_lokal' | 'byok_cloud';

export type ScreenState = 'normal' | 'empty' | 'loading' | 'error' | 'offline' | 'partial' | 'cancelled';

export interface SuggestionRow {
  id: string;
  fileId: string;
  originalPath: string;
  fileName: string;
  targetFolder: string;
  targetPath: string;
  reason: string;
  confidence: 'tinggi' | 'sedang' | 'rendah';
  engine: 'Heuristik Format' | 'Ekstraktor Tanggal' | 'Analisis Isi Dokumen' | 'Aturan Kustom';
  selected: boolean;
  hasConflict?: boolean;
  conflictResolvedName?: string;
  status: 'pending' | 'applied' | 'skipped' | 'failed';
}

export interface HistoryCommitNode {
  id: string;
  commitHash: string;
  title: string;
  author: string;
  timestamp: string;
  filesAffected: number;
  operationType: string;
  folderSnapshot: FolderNode[];
  status: 'applied' | 'reverted' | 'current';
  branch?: 'master' | 'develop' | 'feature-clean' | 'feature-ai';
  branchLabel?: string;
  branchColor?: string;
  laneIndex?: number; // 0: Master, 1: Develop, 2: Feature-Clean, 3: Feature-AI
  colIndex?: number;
  diffSummary?: {
    addedCount: number;
    deletedCount: number;
    modifiedCount: number;
  };
  details: {
    from: string;
    to: string;
    fileName: string;
    reason: string;
    type?: 'added' | 'deleted' | 'moved';
    sizeFormatted?: string;
    category?: CategoryId;
  }[];
}

export interface OperationManifest {
  id: string;
  timestamp: string;
  operationType: string;
  totalFiles: number;
  successCount: number;
  failedCount: number;
  status: 'sukses' | 'gagal_sebagian' | 'dibatalkan';
  items: {
    fileName: string;
    from: string;
    to: string;
    reason: string;
    engine: string;
    success: boolean;
    errorReason?: string;
  }[];
}

export interface CleanlinessItem {
  id: string;
  type: 'duplicate' | 'zero_byte' | 'large_file' | 'similar_file';
  title: string;
  description: string;
  size: number;
  sizeFormatted: string;
  files: FileItem[];
  suggestedAction: 'trash_duplicates' | 'delete_zero_byte' | 'archive_large' | 'merge_versions';
}
