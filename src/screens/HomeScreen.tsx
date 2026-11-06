import React, { useState, useCallback, useEffect } from 'react';
import { View, Text, FlatList, StyleSheet, TouchableOpacity, Image, ActivityIndicator, LayoutAnimation, Platform, UIManager } from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { useFocusEffect } from '@react-navigation/native';
import { RootStackParamList } from '../navigation/AppNavigator';
import { syncService } from '../services/syncService';
import { IncidentReport } from '../types';

if (Platform.OS === 'android' && UIManager.setLayoutAnimationEnabledExperimental) {
  UIManager.setLayoutAnimationEnabledExperimental(true);
}

type Props = NativeStackScreenProps<RootStackParamList, 'Home'>;

export const HomeScreen = ({ navigation }: Props) => {
  const [reports, setReports] = useState<IncidentReport[]>([]);
  const [isOnline, setIsOnline] = useState<boolean>(true);
  const [isSyncing, setIsSyncing] = useState<boolean>(false);
  const [lastSync, setLastSync] = useState<string>('Nunca');
  const [progressText, setProgressText] = useState<string>('');

  const loadData = async () => {
    const data = await syncService.getReports();
    const online = await syncService.isServerOnline();
    const lastSyncTime = await syncService.getLastSyncTime();
    
    setReports(data);
    setIsOnline(online);
    if (lastSyncTime) {
      const date = new Date(lastSyncTime);
      setLastSync(date.toLocaleTimeString() + ' (' + date.toLocaleDateString() + ')');
    }
  };

  useFocusEffect(
    useCallback(() => {
      loadData();
    }, [])
  );

  // Auto-sincronización al detectar conexión disponible
  useEffect(() => {
    if (isOnline) {
      handleSync();
    }
  }, [isOnline]);

  const handleToggleNetwork = async () => {
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    const newStatus = await syncService.toggleServerStatus();
    setIsOnline(newStatus);
  };

  const handleSync = async () => {
    if (isSyncing) return;
    setIsSyncing(true);
    setProgressText('Iniciando cola...');

    await syncService.processSyncQueue((curr, total) => {
      setProgressText(`Sincronizando ${curr} de ${total}...`);
    });

    setIsSyncing(false);
    setProgressText('');
    loadData();
  };

  const handleDelete = async (id: string) => {
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    await syncService.deleteReport(id);
    loadData();
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'synced': return { label: '✓ SINCRO', color: '#10B981', bg: '#D1FAE5' };
      case 'syncing': return { label: '⏳ ENVIANDO...', color: '#3B82F6', bg: '#DBEAFE' };
      case 'error': return { label: '⚠️ REINTENTO', color: '#EF4444', bg: '#FEE2E2' };
      default: return { label: '☁️ OFFLINE (EN COLA)', color: '#F59E0B', bg: '#FEF3C7' };
    }
  };

  return (
    <View style={styles.container}>
      {/* Barra de Estado de Red y Control Simulado */}
      <View style={[styles.networkBanner, isOnline ? styles.bannerOnline : styles.bannerOffline]}>
        <View style={styles.networkInfo}>
          <Text style={styles.networkStatusText}>
            {isOnline ? '🟢 Red Conectada (Servidor Disponible)' : '🔴 Modo Offline (Sin Conexión a Servidor)'}
          </Text>
          <Text style={styles.lastSyncText}>Última sincro: {lastSync}</Text>
        </View>
        <TouchableOpacity style={styles.toggleNetBtn} onPress={handleToggleNetwork}>
          <Text style={styles.toggleNetText}>{isOnline ? 'Desconectar' : 'Conectar'}</Text>
        </TouchableOpacity>
      </View>

      {/* Botón de Sincronización Manual y Estado de la Cola */}
      <View style={styles.actionHeader}>
        <TouchableOpacity 
          style={[styles.syncBtn, (!isOnline || isSyncing) && styles.syncBtnDisabled]} 
          onPress={handleSync}
          disabled={!isOnline || isSyncing}
        >
          {isSyncing ? (
            <ActivityIndicator color="#FFF" size="small" />
          ) : (
            <Text style={styles.syncBtnText}>🔄 Sincronizar Ahora</Text>
          )}
        </TouchableOpacity>
      </View>

      {progressText ? <Text style={styles.progressLabel}>{progressText}</Text> : null}

      {/* Listado de Reportes */}
      <FlatList
        data={reports}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => {
          const badge = getStatusBadge(item.syncStatus);
          return (
            <View style={styles.card}>
              <Image source={{ uri: item.photoUrl }} style={styles.cardImg} />
              <View style={styles.cardContent}>
                <View style={styles.cardHeader}>
                  <Text style={styles.cardTitle}>{item.title}</Text>
                  <View style={[styles.badge, { backgroundColor: badge.bg }]}>
                    <Text style={[styles.badgeText, { color: badge.color }]}>{badge.label}</Text>
                  </View>
                </View>
                <Text style={styles.cardDesc}>{item.description}</Text>
                <Text style={styles.cardMeta}>📍 {item.location} • 🏷️ {item.category}</Text>
                {item.errorMessage ? <Text style={styles.errorText}>❌ {item.errorMessage}</Text> : null}

                <View style={styles.cardActions}>
                  <TouchableOpacity 
                    style={styles.editBtn} 
                    onPress={() => navigation.navigate('CreateReport', { report: item })}
                  >
                    <Text style={styles.btnText}>✏️ Editar</Text>
                  </TouchableOpacity>
                  <TouchableOpacity style={styles.deleteBtn} onPress={() => handleDelete(item.id)}>
                    <Text style={styles.btnText}>🗑️ Eliminar</Text>
                  </TouchableOpacity>
                </View>
              </View>
            </View>
          );
        }}
        ListEmptyComponent={
          <View style={styles.emptyBox}>
            <Text style={{ fontSize: 40 }}>📝</Text>
            <Text style={styles.emptyTitle}>Sin reportes registrados</Text>
            <Text style={styles.emptySub}>Puedes registrar incidencias aun sin conexión a Internet.</Text>
          </View>
        }
      />

      <TouchableOpacity style={styles.fab} onPress={() => navigation.navigate('CreateReport', {})}>
        <Text style={styles.fabText}>+ Nuevo Reporte Offline</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F3F4F6' },
  networkBanner: { flexDirection: 'row', padding: 12, alignItems: 'center', justifyContent: 'space-between' },
  bannerOnline: { backgroundColor: '#10B981' },
  bannerOffline: { backgroundColor: '#EF4444' },
  networkInfo: { flex: 1 },
  networkStatusText: { color: '#FFF', fontWeight: 'bold', fontSize: 13 },
  lastSyncText: { color: '#E0E7FF', fontSize: 11, marginTop: 2 },
  toggleNetBtn: { backgroundColor: 'rgba(255,255,255,0.2)', paddingVertical: 6, paddingHorizontal: 12, borderRadius: 8 },
  toggleNetText: { color: '#FFF', fontSize: 12, fontWeight: 'bold' },
  actionHeader: { padding: 12, backgroundColor: '#FFF' },
  syncBtn: { backgroundColor: '#4F46E5', paddingVertical: 12, borderRadius: 10, alignItems: 'center' },
  syncBtnDisabled: { backgroundColor: '#9CA3AF' },
  syncBtnText: { color: '#FFF', fontWeight: 'bold', fontSize: 14 },
  progressLabel: { textAlign: 'center', color: '#4B5563', fontSize: 12, marginVertical: 4 },
  card: { backgroundColor: '#FFF', marginHorizontal: 12, marginTop: 12, borderRadius: 16, overflow: 'hidden', elevation: 2 },
  cardImg: { width: '100%', height: 140 },
  cardContent: { padding: 14 },
  cardHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 },
  cardTitle: { fontSize: 17, fontWeight: 'bold', color: '#1F2937', flex: 1 },
  badge: { paddingHorizontal: 8, paddingVertical: 3, borderRadius: 6 },
  badgeText: { fontSize: 10, fontWeight: 'bold' },
  cardDesc: { fontSize: 13, color: '#4B5563', marginBottom: 6 },
  cardMeta: { fontSize: 11, color: '#9CA3AF' },
  errorText: { fontSize: 11, color: '#DC2626', marginTop: 4, fontWeight: '600' },
  cardActions: { flexDirection: 'row', gap: 10, marginTop: 12 },
  editBtn: { flex: 1, backgroundColor: '#EEF2FF', paddingVertical: 8, borderRadius: 8, alignItems: 'center' },
  deleteBtn: { flex: 1, backgroundColor: '#FEE2E2', paddingVertical: 8, borderRadius: 8, alignItems: 'center' },
  btnText: { fontSize: 12, fontWeight: '600', color: '#374151' },
  emptyBox: { alignItems: 'center', marginTop: 60 },
  emptyTitle: { fontSize: 16, fontWeight: 'bold', color: '#4B5563', marginTop: 8 },
  emptySub: { fontSize: 12, color: '#9CA3AF', textAlign: 'center', marginTop: 4 },
  fab: { position: 'absolute', bottom: 20, right: 20, left: 20, backgroundColor: '#4F46E5', paddingVertical: 14, borderRadius: 12, alignItems: 'center', elevation: 5 },
  fabText: { color: '#FFF', fontWeight: 'bold', fontSize: 15 }
});
