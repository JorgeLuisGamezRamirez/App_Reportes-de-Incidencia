export type SyncStatus = 'pending' | 'syncing' | 'synced' | 'error';
export type CategoryType = 'Infraestructura' | 'Seguridad' | 'Limpieza' | 'Servicios' | 'Otro';

export interface IncidentReport {
  id: string;
  title: string;
  description: string;
  category: CategoryType;
  location: string;
  photoUrl?: string;
  createdAt: number;
  syncStatus: SyncStatus;
  syncedAt?: number;
  retryCount: number;
  errorMessage?: string;
}

export interface SyncQueueItem {
  reportId: string;
  action: 'CREATE' | 'UPDATE' | 'DELETE';
  timestamp: number;
}
EOFcat << 'EOF' > src/types/index.ts
export type SyncStatus = 'pending' | 'syncing' | 'synced' | 'error';
export type CategoryType = 'Infraestructura' | 'Seguridad' | 'Limpieza' | 'Servicios' | 'Otro';

export interface IncidentReport {
  id: string;
  title: string;
  description: string;
  category: CategoryType;
  location: string;
  photoUrl?: string;
  createdAt: number;
  syncStatus: SyncStatus;
  syncedAt?: number;
  retryCount: number;
  errorMessage?: string;
}

export interface SyncQueueItem {
  reportId: string;
  action: 'CREATE' | 'UPDATE' | 'DELETE';
  timestamp: number;
}
