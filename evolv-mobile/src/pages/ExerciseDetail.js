import React, { useEffect, useState } from 'react';
import { 
  View, 
  Text, 
  TouchableOpacity, 
  StyleSheet, 
  ScrollView, 
  SafeAreaView, 
  ActivityIndicator,
  Linking,
  Alert
} from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
import { useQuery, gql } from '@apollo/client';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { 
  ArrowLeft, 
  CheckCircle2, 
  Dumbbell, 
  History, 
  BarChart2, 
  CheckSquare, 
  Plus, 
  PlayCircle 
} from 'lucide-react-native';

const GET_EXERCISE_DETAIL = gql`
  query GetExercise($id: ID!) { 
    getExercise(id: $id) { 
      id 
      name 
      subtitle 
      muscleGroup 
      videoUrl 
      idealRest 
    } 
  }
`;

const GET_EXERCISE_HISTORY = gql`
  query GetExerciseHistory { 
    getUserWorkouts { 
      workoutDate 
      logs { 
        exerciseId 
        weight 
        reps 
        sets 
      } 
    } 
  }
`;

export default function ExerciseDetail() {
  const navigation = useNavigation();
  const route = useRoute();
  
  const { exerciseId, detalhe = 'Séries Livres' } = route.params || {};

  // Queries do GraphQL
  const { data: exData, loading: exLoading, error: exError } = useQuery(GET_EXERCISE_DETAIL, { 
    variables: { id: exerciseId }, 
    skip: !exerciseId,
    fetchPolicy: 'cache-first'
  });

  const { data: histData, loading: histLoading } = useQuery(GET_EXERCISE_HISTORY, { 
    fetchPolicy: 'cache-and-network' 
  });

  const exercicio = exData?.getExercise;

  // Processamento de Dados 
  let exerciseLogs = [];
  let maxWeight = 0;
  let max1RM = 0;
  let volumeTotalHistorico = 0; 

  if (histData?.getUserWorkouts) {
    histData.getUserWorkouts.forEach(w => {
      w.logs
        .filter(l => l.exerciseId === exerciseId)
        .forEach(log => {
          exerciseLogs.push({ date: w.workoutDate, ...log });
          
          if (log.weight > maxWeight) maxWeight = log.weight;
          
          const currentRM = Math.round(log.weight * (1 + log.reps / 30));
          if (currentRM > max1RM) max1RM = currentRM;
          
          volumeTotalHistorico += (log.weight * log.reps * log.sets);
        });
    });
  }

  exerciseLogs.sort((a, b) => new Date(b.date) - new Date(a.date));

  const openVideo = async () => {
    if (exercicio?.videoUrl) {
      try {
        await Linking.openURL(exercicio.videoUrl);
      } catch (err) {
        Alert.alert("Erro", "Não foi possível abrir o link do vídeo.");
      }
    }
  };

  if (exLoading || (!exercicio && !exError)) {
    return (
      <View style={[styles.container, { justifyContent: 'center', alignItems: 'center' }]}>
        <ActivityIndicator size="large" color="#3ab54a" />
      </View>
    );
  }

  if (exError) {
    return (
      <View style={[styles.container, { justifyContent: 'center', alignItems: 'center', padding: 20 }]}>
        <Text style={{ color: '#ff4d4d', textAlign: 'center' }}>Erro ao carregar exercício: {exError.message}</Text>
        <TouchableOpacity style={{ marginTop: 20 }} onPress={() => navigation.goBack()}>
          <Text style={{ color: '#3ab54a' }}>Voltar</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      {/* HEADER */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.backBtn} onPress={() => navigation.goBack()}>
          <ArrowLeft size={24} color="#fff" />
        </TouchableOpacity>
        <View style={styles.titleGroup}>
          <Text style={styles.title}>{exercicio?.name || 'Exercício'}</Text>
          <Text style={styles.subtitle}>
            {exercicio?.subtitle ? `${exercicio.subtitle} | ` : ''}{detalhe}
          </Text>
        </View>
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        
        <View style={styles.glassCard}>
          {exercicio?.videoUrl ? (
            <TouchableOpacity style={styles.videoLinkBox} onPress={openVideo}>
              <PlayCircle size={32} color="#3ab54a" />
              <Text style={styles.videoLinkText}>Assistir Vídeo de Execução</Text>
            </TouchableOpacity>
          ) : (
            <View style={styles.videoMock}>
              <Text style={{color: '#8b92a5'}}>Sem vídeo de execução</Text>
            </View>
          )}

          <View style={styles.checklistContainer}>
            <View style={styles.checklistHeader}>
              <CheckSquare size={16} color="#3ab54a" />
              <Text style={styles.checklistTitle}>Checklist de Execução</Text>
            </View>
            <View style={styles.checkItem}><CheckCircle2 size={14} color="#3ab54a" /><Text style={styles.checkText}>Amplitude completa em todas as reps</Text></View>
            <View style={styles.checkItem}><CheckCircle2 size={14} color="#3ab54a" /><Text style={styles.checkText}>Controle de 2s na fase excêntrica</Text></View>
            <View style={styles.checkItem}><CheckCircle2 size={14} color="#3ab54a" /><Text style={styles.checkText}>Estabilidade do core ativada</Text></View>
          </View>
        </View>

        <View style={styles.glassCardRow}>
          <View style={styles.perfBox}>
            <Text style={styles.perfLabel}>1RM Pro</Text>
            <Text style={[styles.perfValue, { color: '#3ab54a' }]}>
              {max1RM > 0 ? max1RM : '--'} <Text style={styles.perfUnit}>kg</Text>
            </Text>
          </View>
          <View style={styles.perfDivider} />
          <View style={styles.perfBox}>
            <Text style={styles.perfLabel}>Carga Max</Text>
            <Text style={styles.perfValue}>
              {maxWeight > 0 ? maxWeight : '--'} <Text style={styles.perfUnit}>kg</Text>
            </Text>
          </View>
          <View style={styles.perfDivider} />
          <View style={styles.perfBox}>
            <Text style={styles.perfLabel}>Vol. Total</Text>
            <Text style={styles.perfValue}>
              {volumeTotalHistorico > 0 ? (volumeTotalHistorico / 1000).toFixed(1) : '--'} <Text style={styles.perfUnit}>Ton</Text>
            </Text>
          </View>
        </View>

        <View style={styles.historyHeader}>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
            <History size={16} color="#8b92a5" />
            <Text style={styles.sectionTitle}>HISTÓRICO DE CARGA</Text>
          </View>
          <View style={styles.proTag}>
            <BarChart2 size={12} color="#ffaa00" />
            <Text style={styles.proTagText}>PRO Gráficos</Text>
          </View>
        </View>
        
        {histLoading ? (
          <ActivityIndicator size="small" color="#3ab54a" style={{ marginTop: 20 }} />
        ) : exerciseLogs.length === 0 ? (
          <Text style={styles.emptyHistory}>Nenhum registro de carga ainda.</Text>
        ) : (
          exerciseLogs.map((log, index) => {
            const dataFormatada = new Date(`${log.date}T12:00:00`).toLocaleDateString('pt-BR');
            return (
              <View key={index} style={styles.historyCard}>
                <View style={styles.histLeft}>
                  <Dumbbell color="#fff" size={20} opacity={0.5} />
                  <View>
                    <Text style={styles.histDate}>{dataFormatada}</Text>
                    <Text style={styles.histLoad}>{log.weight}kg x {log.reps} repetições</Text>
                  </View>
                </View>
                <Text style={styles.histVol}>Vol: {log.weight * log.reps}kg</Text>
              </View>
            );
          })
        )}

        <TouchableOpacity 
          style={styles.greenBtn}
          onPress={() => navigation.navigate('RegistroSerie', { 
            exerciseId: exercicio?.id, 
            detalhe: detalhe 
          })}
        >
          <Plus size={20} color="#000" />
          <Text style={styles.greenBtnText}>INICIAR SÉRIES</Text>
        </TouchableOpacity>
        
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#090b0f' },
  header: { flexDirection: 'row', alignItems: 'center', padding: 20, paddingTop: 30, marginBottom: 10 },
  backBtn: { marginRight: 15 },
  titleGroup: { flex: 1 },
  title: { color: '#fff', fontSize: 24, fontWeight: '800' },
  subtitle: { color: '#3ab54a', fontSize: 13, fontWeight: 'bold', marginTop: 2 },
  scrollContent: { paddingHorizontal: 20, paddingBottom: 40 },
  
  glassCard: { 
    backgroundColor: 'rgba(255,255,255,0.03)', 
    borderRadius: 16, 
    borderWidth: 1, 
    borderColor: 'rgba(255,255,255,0.08)', 
    marginBottom: 20,
    overflow: 'hidden'
  },
  videoLinkBox: {
    height: 120,
    backgroundColor: 'rgba(58, 181, 74, 0.1)',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 10,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255,255,255,0.05)'
  },
  videoLinkText: {
    color: '#3ab54a',
    fontWeight: '700',
    fontSize: 15
  },
  videoMock: { 
    height: 120, 
    backgroundColor: 'rgba(255,255,255,0.02)', 
    justifyContent: 'center', 
    alignItems: 'center',
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255,255,255,0.05)'
  },
  checklistContainer: { padding: 15 },
  checklistHeader: { flexDirection: 'row', alignItems: 'center', gap: 6, marginBottom: 10 },
  checklistTitle: { color: '#fff', fontWeight: 'bold', fontSize: 14 },
  checkItem: { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 6 },
  checkText: { color: '#8b92a5', fontSize: 13 },
  
  glassCardRow: { 
    flexDirection: 'row', 
    backgroundColor: 'rgba(255,255,255,0.03)', 
    borderRadius: 16, 
    borderWidth: 1, 
    borderColor: 'rgba(255,255,255,0.08)', 
    marginBottom: 30, 
    paddingVertical: 18 
  },
  perfBox: { flex: 1, alignItems: 'center' },
  perfLabel: { color: '#8b92a5', fontSize: 12, marginBottom: 4 },
  perfValue: { color: '#fff', fontSize: 20, fontWeight: '800' },
  perfUnit: { fontSize: 12, color: '#8b92a5', fontWeight: '400' },
  perfDivider: { width: 1, backgroundColor: 'rgba(255,255,255,0.1)' },
  
  historyHeader: { 
    flexDirection: 'row', 
    justifyContent: 'space-between', 
    alignItems: 'center', 
    marginBottom: 15 
  },
  sectionTitle: { color: '#8b92a5', fontWeight: 'bold', fontSize: 12, textTransform: 'uppercase' },
  proTag: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  proTagText: { color: '#ffaa00', fontSize: 11, fontWeight: 'bold' },
  
  emptyHistory: { color: '#777', textAlign: 'center', marginTop: 10, marginBottom: 20, fontSize: 13 },
  historyCard: { 
    flexDirection: 'row', 
    justifyContent: 'space-between', 
    alignItems: 'center', 
    backgroundColor: 'rgba(255,255,255,0.04)', 
    padding: 15, 
    borderRadius: 14, 
    borderLeftWidth: 3, 
    borderLeftColor: '#3ab54a', 
    marginBottom: 12 
  },
  histLeft: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  histDate: { color: '#fff', fontWeight: 'bold', marginBottom: 2 },
  histLoad: { color: '#3ab54a', fontSize: 13, fontWeight: '600' },
  histVol: { color: '#8b92a5', fontSize: 12 },
  
  greenBtn: { 
    flexDirection: 'row',
    justifyContent: 'center',
    backgroundColor: '#3ab54a', 
    padding: 18, 
    borderRadius: 16, 
    alignItems: 'center',
    gap: 8,
    marginTop: 15
  },
  greenBtnText: { color: '#000', fontWeight: '900', fontSize: 16 }
});