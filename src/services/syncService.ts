import AsyncStorage from '@react-native-async-storage/async-storage';
import { IncidentReport, SyncStatus } from '../types';

const REPORTS_KEY = '@offline_incidents_reports';
const SERVER_STATUS_KEY = '@mock_server_online';
const LAST_SYNC_KEY = '@last_successful_sync';

export const syncService = {
  // Estado simulado de conexión con el servidor
  isServerOnline: async (): Promise<boolean> => {
    const status = await AsyncStorage.getItem(SERVER_STATUS_KEY);
    return status === null ? true : JSON.parse(status);
  },

  toggleServerStatus: async (): Promise<boolean> => {
    const current = await syncService.isServerOnline();
    await AsyncStorage.setItem(SERVER_STATUS_KEY, JSON.stringify(!current));
    return !current;
  },

  getLastSyncTime: async (): Promise<number | null> => {
    const time = await AsyncStorage.getItem(LAST_SYNC_KEY);
    return time ? parseInt(time, 10) : null;
  },

  // Obtener todos los reportes locales
  getReports: async (): Promise<IncidentReport[]> => {
    const data = await AsyncStorage.getItem(REPORTS_KEY);
    return data ? JSON.parse(data) : [];
  },

  // Crear o Editar Reporte (Offline First)
  saveReport: async (report: Omit<IncidentReport, 'syncStatus' | 'retryCount'> & { id?: string }): Promise<IncidentReport> => {
    const reports = await syncService.getReports();
    const isEdit = !!report.id;

    const newReport: IncidentReport = {
      id: report.id || 'rep_' + Date.now(),
      title: report.title,
      description: report.description,
      category: report.category,
      location: report.location,
      photoUrl: report.photoUrl || 'https://images.unsplash.com/photo-1584438784894-089d6a62b8fa?w=400',
      createdAt: report.createdAt || Date.now(),
      syncStatus: 'pending',
      retryCount: 0
    };

    if (isEdit) {
      const idx = reports.findIndex(r => r.id === newReport.id);
      if (idx !== -1) reports[idx] = newReport;
    } else {
      reports.unshift(newReport);
    }

    await AsyncStorage.setItem(REPORTS_KEY, JSON.stringify(reports));
    return newReport;
  },

  // Eliminar Reporte
  deleteReport: async (id: string) => {
    const reports = await syncService.getReports();
    const updated = reports.filter(r => r.id !== id);
    await AsyncStorage.setItem(REPORTS_KEY, JSON.stringify(updated));
  },

  // Ejecutar Procesamiento de la Cola de Sincronización
  processSyncQueue: async (onProgress?: (progress: number, total: number) => void): Promise<{ success: number; failed: number }> => {
    const online = await syncService.isServerOnline();
    if (!online) return { success: 0, failed: 0 };

    let reports = await syncService.getReports();
    const pendingList = reports.filter(r => r.syncStatus === 'pending' || r.syncStatus === 'error');
    
    if (pendingList.length === 0) return { success: 0, failed: 0 };

    let successCount = 0;
    let failedCount = 0;

    for (let i = 0; i < pendingList.length; i++) {
      const report = pendingList[i];
      report.syncStatus = 'syncing';
      await AsyncStorage.setItem(REPORTS_KEY, JSON.stringify(reports));
      if (onProgress) onProgress(i + 1, pendingList.length);

      // Simular latencia de red de envío REST API
      await new Promise(res => setTimeout(res, 800));

      const isStillOnline = await syncService.isServerOnline();
      if (isStillOnline) {
        report.syncStatus = 'synced';
        report.syncedAt = Date.now();
        report.errorMessage = undefined;
        successCount++;
      } else {
        report.syncStatus = 'error';
        report.retryCount += 1;
        report.errorMessage = 'Conexión interrumpida durante el envío.';
        failedCount++;
      }

      await AsyncStorage.setItem(REPORTS_KEY, JSON.stringify(reports));
    }

    if (successCount > 0) {
      await AsyncStorage.setItem(LAST_SYNC_KEY, Date.now().toString());
    }

    return { success: successCount, failed: failedCount };
  }
};
