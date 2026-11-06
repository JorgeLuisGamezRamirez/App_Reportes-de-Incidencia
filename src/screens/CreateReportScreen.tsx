import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, ScrollView, Image } from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { RootStackParamList } from '../navigation/AppNavigator';
import { syncService } from '../services/syncService';
import { CategoryType } from '../types';

type Props = NativeStackScreenProps<RootStackParamList, 'CreateReport'>;

const CATEGORIES: CategoryType[] = ['Infraestructura', 'Seguridad', 'Limpieza', 'Servicios', 'Otro'];

const SAMPLE_PHOTOS = [
  'https://images.unsplash.com/photo-1584438784894-089d6a62b8fa?w=400',
  'https://images.unsplash.com/photo-1541888946425-d0fbb186a5b3?w=400',
  'https://images.unsplash.com/photo-1581094794329-c8112a89af12?w=400'
];

export const CreateReportScreen = ({ route, navigation }: Props) => {
  const existingReport = route.params?.report;

  const [title, setTitle] = useState(existingReport?.title || '');
  const [description, setDescription] = useState(existingReport?.description || '');
  const [category, setCategory] = useState<CategoryType>(existingReport?.category || 'Infraestructura');
  const [location, setLocation] = useState(existingReport?.location || 'Lat: 22.255, Lon: -97.868 (GPS Fijo)');
  const [selectedPhoto, setSelectedPhoto] = useState(existingReport?.photoUrl || SAMPLE_PHOTOS[0]);

  const handleSave = async () => {
    if (!title || !description) {
      alert('Por favor completa el título y la descripción.');
      return;
    }

    await syncService.saveReport({
      id: existingReport?.id,
      title,
      description,
      category,
      location,
      photoUrl: selectedPhoto,
      createdAt: existingReport?.createdAt || Date.now()
    });

    navigation.goBack();
  };

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.header}>{existingReport ? 'Editar Incidencia' : 'Nuevo Reporte Offline'}</Text>

      <Text style={styles.label}>Fotografía del problema</Text>
      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.photoPicker}>
        {SAMPLE_PHOTOS.map((img, idx) => (
          <TouchableOpacity key={idx} onPress={() => setSelectedPhoto(img)}>
            <Image source={{ uri: img }} style={[styles.photoThumb, selectedPhoto === img && styles.photoSelected]} />
          </TouchableOpacity>
        ))}
      </ScrollView>

      <Text style={styles.label}>Título de la incidencia</Text>
      <TextInput placeholder="Ej. Fuga de agua en pasillo" value={title} onChangeText={setTitle} style={styles.input} />

      <Text style={styles.label}>Categoría</Text>
      <View style={styles.categoryRow}>
        {CATEGORIES.map((cat) => (
          <TouchableOpacity 
            key={cat} 
            style={[styles.catChip, category === cat && styles.catChipSelected]} 
            onPress={() => setCategory(cat)}
          >
            <Text style={[styles.catText, category === cat && styles.catTextSelected]}>{cat}</Text>
          </TouchableOpacity>
        ))}
      </View>

      <Text style={styles.label}>Ubicación GPS</Text>
      <TextInput value={location} onChangeText={setLocation} style={styles.input} />

      <Text style={styles.label}>Descripción detallada</Text>
      <TextInput 
        placeholder="Describe las condiciones o detalles adicionales..." 
        value={description} 
        onChangeText={setDescription} 
        style={[styles.input, styles.textArea]} 
        multiline 
      />

      <TouchableOpacity style={styles.saveBtn} onPress={handleSave}>
        <Text style={styles.saveBtnText}>{existingReport ? 'Guardar Cambios' : 'Registrar Localmente'}</Text>
      </TouchableOpacity>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: { padding: 20, backgroundColor: '#FFF' },
  header: { fontSize: 22, fontWeight: 'bold', color: '#1F2937', marginBottom: 16 },
  label: { fontSize: 13, fontWeight: '600', color: '#374151', marginBottom: 6 },
  photoPicker: { flexDirection: 'row', marginBottom: 16 },
  photoThumb: { width: 80, height: 80, borderRadius: 10, marginRight: 10, borderWidth: 2, borderColor: 'transparent' },
  photoSelected: { borderColor: '#4F46E5' },
  input: { borderWidth: 1, borderColor: '#E5E7EB', borderRadius: 10, padding: 12, marginBottom: 16, backgroundColor: '#F9FAFB', fontSize: 14 },
  textArea: { height: 80, textAlignVertical: 'top' },
  categoryRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 6, marginBottom: 16 },
  catChip: { paddingVertical: 6, paddingHorizontal: 12, borderRadius: 16, backgroundColor: '#F3F4F6' },
  catChipSelected: { backgroundColor: '#4F46E5' },
  catText: { fontSize: 12, fontWeight: '600', color: '#4B5563' },
  catTextSelected: { color: '#FFF' },
  saveBtn: { backgroundColor: '#4F46E5', paddingVertical: 14, borderRadius: 12, alignItems: 'center', marginTop: 10 },
  saveBtnText: { color: '#FFF', fontWeight: 'bold', fontSize: 15 }
});
