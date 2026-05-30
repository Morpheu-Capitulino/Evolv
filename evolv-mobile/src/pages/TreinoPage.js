import React, { useEffect, useMemo, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  ActivityIndicator,
  Modal,
  SafeAreaView,
} from 'react-native';

import AsyncStorage from '@react-native-async-storage/async-storage';
import { useNavigation } from '@react-navigation/native';
import { useQuery, gql } from '@apollo/client';

import {
  CheckCircle2,
  Circle,
  ChevronRight,
  Dumbbell,
  BrainCircuit,
  Calendar,
  History,
  X,
  Flame,
  AlertTriangle,
  Trophy,
  Star,
} from 'lucide-react-native';

import BottomNav from '../../components/BottomNav';

const GET_TREINO_DATA = gql`
  # O userId aqui em cima ainda pode ficar caso outras mutations precisem no futuro, 
  # ou podemos remover se nada mais usar, mas vamos apenas ajustar o getUserWorkouts
  query GetTreinoData {
    getMyMeasurements {
      id
      weight
      bodyFatPercentage
      arm
      waist
      thigh
      hip
      date
    }

    getAllExercises {
      id
      name
    }

    me {
      id
      focus
      goal
      trainingDays
      isPremium
    }

    # REMOVIDO o (userId: $userId). Agora o backend pega pelo Token automaticamente!
    getUserWorkouts {
      workoutDate
      logs {
        exerciseId
        weight
        reps
        sets
      }
    }

    getUserStreak
  }
`;

export default function TreinoPage() {
  const navigation = useNavigation();

  const [userId, setUserId] = useState(null);

  const [diasSemana, setDiasSemana] = useState([]);
  const [selectedDay, setSelectedDay] = useState('');
  const [todayDate, setTodayDate] = useState('');

  const [activeTab, setActiveTab] = useState('A');
  const [rotinas, setRotinas] = useState({});
  const [aiSchedule, setAiSchedule] = useState({});

  const [showHistoryModal, setShowHistoryModal] = useState(false);

  const [treinoScore, setTreinoScore] = useState(0);
  const [alertaInteligente, setAlertaInteligente] = useState(null);

  useEffect(() => {
    async function loadUser() {
      const id = await AsyncStorage.getItem('evolv_userId');
      setUserId(id);
    }
    loadUser();
  }, []);

  const { data, loading, error } = useQuery(GET_TREINO_DATA, {
    fetchPolicy: 'cache-and-network',
  });

  useEffect(() => {
    if (data?.me) {
      const { goal, focus } = data.me;
      if (
        !goal ||
        !focus ||
        goal === 'Não definido' ||
        focus === 'Não definido' ||
        focus === 'Geral'
      ) {
        navigation.navigate('Onboarding');
      }
    }
  }, [data]);

  useEffect(() => {
    const days = [];
    const hoje = new Date();
    const hojeFormatado = hoje.toISOString().split('T')[0];

    setTodayDate(hojeFormatado);
    setSelectedDay(hojeFormatado);

    for (let i = -2; i <= 2; i++) {
      const d = new Date(hoje);
      d.setDate(hoje.getDate() + i);

      let diaSemanaStr = d.toLocaleDateString('pt-BR', { weekday: 'short' }).replace('.', '');
      diaSemanaStr = diaSemanaStr.charAt(0).toUpperCase() + diaSemanaStr.slice(1, 3);

      days.push({
        dia: diaSemanaStr,
        numero: d.getDate(),
        fullDate: d.toISOString().split('T')[0],
        isPast: i < 0,
      });
    }
    setDiasSemana(days);
  }, []);

  useEffect(() => {
    if (!data?.getAllExercises || diasSemana.length === 0) return;

    const getId = (nome) => data.getAllExercises.find((e) => e.name === nome)?.id || '';

    // Lógica portada da Web (.jsx)
    const focoStr = data.me?.focus || 'Superiores|Intermediário|3_dias';
    const diasPorSemana = focoStr.includes('3_dias') ? 3 : focoStr.includes('6_dias') ? 6 : 4;
    const isPro = data.me?.isPremium;

    let baseRotinas = {};

    if (diasPorSemana === 3) {
      baseRotinas = {
        A: {
          nome: 'Full Body (Força)',
          exercicios: [
            { id: getId('Agachamento Livre'), nome: 'Agachamento Livre', detalhe: '4 Séries • 6-8 Reps' },
            { id: getId('Supino Reto'), nome: 'Supino Reto', detalhe: '4 Séries • 6-8 Reps' },
            { id: getId('Remada Curvada'), nome: 'Remada Curvada', detalhe: '4 Séries • 8-10 Reps' },
          ],
        },
        B: {
          nome: 'Full Body (Hipertrofia)',
          exercicios: [
            { id: getId('Leg Press 45'), nome: 'Leg Press 45', detalhe: '3 Séries • 12-15 Reps' },
            { id: getId('Supino Inclinado'), nome: 'Supino Inclinado', detalhe: '3 Séries • 10-12 Reps' },
            { id: getId('Puxada Frente'), nome: 'Puxada Frente', detalhe: '3 Séries • 10-12 Reps' },
          ],
        },
      };
    } else {
      baseRotinas = {
        A: {
          nome: 'Push (Peito, Ombro, Tríceps)',
          exercicios: [
            { id: getId('Supino Reto'), nome: 'Supino Reto', detalhe: '4 Séries • 8-12 Reps' },
            { id: getId('Desenvolvimento'), nome: 'Desenvolvimento', detalhe: '4 Séries • 10 Reps' },
            { id: getId('Tríceps Pulley'), nome: 'Tríceps Pulley', detalhe: '4 Séries • 10-15 Reps' },
          ],
        },
        B: {
          nome: 'Pull (Costas e Bíceps)',
          exercicios: [
            { id: getId('Puxada Frente'), nome: 'Puxada Frente', detalhe: '4 Séries • 10-12 Reps' },
            { id: getId('Rosca Direta'), nome: 'Rosca Direta', detalhe: '3 Séries • 12 Reps' },
          ],
        },
        C: {
          nome: 'Legs (Pernas Completas)',
          exercicios: [
            { id: getId('Agachamento Livre'), nome: 'Agachamento Livre', detalhe: '4 Séries • 8-10 Reps' },
            { id: getId('Cadeira Extensora'), nome: 'Cadeira Extensora', detalhe: '3 Séries • 12-15 Reps' },
          ],
        },
      };
    }

    setRotinas(baseRotinas);

    let scoreCalculado = 0;
    if (data.getUserWorkouts) {
      const treinosPassados = data.getUserWorkouts;
      scoreCalculado = treinosPassados.length * 150;

      const fezPernaRecentemente = treinosPassados
        .slice(0, 7)
        .some((w) =>
          w.logs.some(
            (l) => l.exerciseId === getId('Agachamento Livre') || l.exerciseId === getId('Leg Press 45')
          )
        );

      if (!fezPernaRecentemente && treinosPassados.length > 0) {
        setAlertaInteligente('Atenção: Não registra treinos de membros inferiores há mais de 7 dias.');
      } else {
        setAlertaInteligente(null);
      }
    }
    setTreinoScore(scoreCalculado);

    const weekMsg = isPro
      ? 'Semana 2: Foco em sobrecarga progressiva (Média/Alta).'
      : 'Desbloqueie a Periodização Automática com o Plano PRO.';

    const schedule = {};
    diasSemana.forEach((d, i) => {
      const tab = i % 2 === 0 ? 'A' : diasPorSemana === 3 ? 'B' : 'C';
      schedule[d.fullDate] = {
        tab,
        msg: i === 2
          ? `Evolv AI: Split adaptado para ${diasPorSemana} dias. ${weekMsg}`
          : 'Sessão planejada para recuperação muscular otimizada.',
      };
    });

    setAiSchedule(schedule);

    if (schedule[selectedDay] && !Object.keys(baseRotinas).includes(activeTab)) {
       setActiveTab(schedule[selectedDay].tab);
    } else if (schedule[selectedDay]) {
       setActiveTab(schedule[selectedDay].tab);
    }

  }, [data, diasSemana, selectedDay]);

  const verificarConcluido = (exId) => {
    if (!data?.getUserWorkouts) return false;
    return data.getUserWorkouts
      .filter((w) => w.workoutDate.startsWith(selectedDay))
      .some((w) => w.logs.some((l) => l.exerciseId === exId));
  };

  const historico = useMemo(() => {
    if (!data?.getUserWorkouts || !data?.getAllExercises) return [];
    const map = {};

    data.getUserWorkouts.forEach((w) => {
      const dateKey = w.workoutDate.split('T')[0];
      if (!map[dateKey]) map[dateKey] = new Set();
      w.logs.forEach((l) => {
        const ex = data.getAllExercises.find((e) => e.id === l.exerciseId);
        if (ex) map[dateKey].add(ex.name);
      });
    });

    return Object.keys(map)
      .sort((a, b) => new Date(b) - new Date(a))
      .map((d) => ({
        date: d,
        exercises: Array.from(map[d]),
      }));
  }, [data]);


  useEffect(() => {
    if (error) {
      console.error("ERRO GRAPHQL NO TREINO:", error.message);
    }
  }, [error]);

  if (loading || !userId || Object.keys(rotinas).length === 0) {
    return (
      <View style={styles.loadingContainer}>
        {error ? (
          <Text style={{ color: '#ff4d4d', padding: 20, textAlign: 'center' }}>
            Erro ao carregar dados: {error.message}
          </Text>
        ) : (
          <ActivityIndicator size="large" color="#3ab54a" />
        )}
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        
        <View style={styles.header}>
          <View>
            <Text style={styles.title}>O Seu Treino</Text>
            <Text style={styles.subtitle}>Evolv AI Training System</Text>
          </View>
          <TouchableOpacity onPress={() => setShowHistoryModal(true)}>
            <Calendar size={24} color="#3ab54a" />
          </TouchableOpacity>
        </View>

        <View style={styles.topRow}>
          <View style={styles.streakBox}>
            <Flame size={18} color="#ffaa00" fill="#ffaa00" />
            <Text style={styles.streakText}>
              3 <Text style={{ fontSize: 12, color: '#888' }}>Streak</Text>
            </Text>
          </View>

          <View style={styles.scoreBox}>
            <Trophy size={16} color="#3ab54a" />
            <Text style={styles.scoreText}>Score: {treinoScore}</Text>
          </View>
        </View>

        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginBottom: 20 }}>
          {diasSemana.map((item) => {
            const hasHistory = historico.some((h) => h.date === item.fullDate);
            
            return (
              <TouchableOpacity
                key={item.fullDate}
                style={[
                  styles.dayCard,
                  selectedDay === item.fullDate && styles.dayCardActive,
                  item.isPast && { opacity: 0.7 }
                ]}
                onPress={() => setSelectedDay(item.fullDate)}
              >
                <Text style={styles.dayName}>{item.dia}</Text>
                <Text style={styles.dayNumber}>{item.numero}</Text>

                {hasHistory && <View style={styles.historyDot} />}
                {item.fullDate === todayDate && <View style={styles.todayDot} />}
              </TouchableOpacity>
            );
          })}
        </ScrollView>

        {alertaInteligente && (
          <View style={styles.alertBox}>
            <AlertTriangle size={20} color="#ff4d4d" />
            <Text style={styles.alertText}>{alertaInteligente}</Text>
          </View>
        )}

        {aiSchedule[selectedDay] && (
          <View style={styles.aiBox}>
            <View style={styles.aiHeader}>
              <BrainCircuit size={16} color="#3ab54a" />
              <Text style={styles.aiTitle}>Evolv AI Coach</Text>
            </View>
            <Text style={styles.aiText}>{aiSchedule[selectedDay].msg}</Text>
          </View>
        )}

        <View style={styles.tabs}>
          {Object.keys(rotinas).map((tab) => {
             const isAiRecommended = aiSchedule?.[selectedDay]?.tab === tab;
             return (
              <TouchableOpacity
                key={tab}
                style={[styles.tabButton, activeTab === tab && styles.tabButtonActive]}
                onPress={() => setActiveTab(tab)}
              >
                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4 }}>
                  <Text style={[styles.tabText, activeTab === tab && styles.tabTextActive]}>
                    Treino {tab}
                  </Text>
                  {isAiRecommended && (
                    <Star size={12} color={activeTab === tab ? '#000' : '#3ab54a'} fill={activeTab === tab ? '#000' : '#3ab54a'} />
                  )}
                </View>
              </TouchableOpacity>
            );
          })}
        </View>

        {rotinas[activeTab] && (
          <View style={{ marginBottom: 40 }}>
            <View style={styles.workoutHeader}>
              <Dumbbell size={22} color="#3ab54a" />
              <Text style={styles.workoutTitle}>Treino {activeTab}</Text>
            </View>
            <Text style={styles.workoutDesc}>{rotinas[activeTab].nome}</Text>

            {rotinas[activeTab].exercicios.map((ex) => {
              const concluido = verificarConcluido(ex.id);
              return (
                <TouchableOpacity
                    key={ex.id}
                    style={[styles.exerciseCard, concluido && styles.exerciseDone]}
                    onPress={() =>
                      navigation.navigate('ExerciseDetail', { 
                        exerciseId: ex.id,
                        detalhe: ex.detalhe,
                      })
                    }
                  >
                  <View style={{ marginRight: 15 }}>
                    {concluido ? (
                      <CheckCircle2 size={30} color="#3ab54a" />
                    ) : (
                      <Circle size={30} color="#555" />
                    )}
                  </View>

                  <View style={{ flex: 1 }}>
                    <Text style={[styles.exerciseTitle, concluido && { textDecorationLine: 'line-through' }]}>
                      {ex.nome}
                    </Text>
                    <Text style={styles.exerciseDesc}>
                      {concluido ? '✓ Checklist Concluído' : ex.detalhe}
                    </Text>
                  </View>

                  <ChevronRight size={20} color="#777" />
                </TouchableOpacity>
              );
            })}
          </View>
        )}
      </ScrollView>
      
      <Modal visible={showHistoryModal} transparent animationType="fade">
        <View style={styles.modalOverlay}>
          <View style={styles.modalBox}>
            <View style={styles.modalHeader}>
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
                <History size={18} color="#3ab54a" />
                <Text style={styles.modalTitle}>Diário de Treino</Text>
              </View>
              <TouchableOpacity onPress={() => setShowHistoryModal(false)}>
                <X size={22} color="#fff" />
              </TouchableOpacity>
            </View>

            <ScrollView>
              {historico.length > 0 ? (
                historico.map((hist, index) => {
                  const dataFormatada = new Date(`${hist.date}T12:00:00`).toLocaleDateString('pt-BR', {
                    day: '2-digit',
                    month: 'short',
                    year: 'numeric'
                  });

                  return (
                    <View key={index} style={styles.historyCard}>
                      <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6, marginBottom: 8 }}>
                        <Calendar size={14} color="#3ab54a" />
                        <Text style={styles.historyDate}>{dataFormatada}</Text>
                      </View>
                      
                      <View style={{ paddingLeft: 10 }}>
                        {hist.exercises.map((e, i) => (
                          <Text key={i} style={styles.historyExercise}>• {e}</Text>
                        ))}
                      </View>
                    </View>
                  );
                })
              ) : (
                <Text style={{ textAlign: 'center', color: '#777', marginTop: 20 }}>
                  Ainda não concluiu nenhum exercício. Comece hoje mesmo!
                </Text>
              )}
            </ScrollView>
          </View>
        </View>
      </Modal>
      <BottomNav />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#090b0f',
  },
  content: {
    padding: 20,
    paddingBottom: 120,
  },
  loadingContainer: {
    flex: 1,
    backgroundColor: '#090b0f',
    justifyContent: 'center',
    alignItems: 'center',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  title: {
    color: '#fff',
    fontSize: 28,
    fontWeight: '800',
  },
  subtitle: {
    color: '#777',
    marginTop: 4,
  },
  topRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 20,
    paddingHorizontal: 5,
  },
  streakBox: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  streakText: {
    color: '#fff',
    fontWeight: '700',
    fontSize: 16,
  },
  scoreBox: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(58,181,74,0.1)',
    borderWidth: 1,
    borderColor: '#3ab54a',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    gap: 6,
  },
  scoreText: {
    color: '#3ab54a',
    fontWeight: '700',
    fontSize: 13,
  },
  dayCard: {
    width: 70,
    height: 85,
    borderRadius: 18,
    backgroundColor: 'rgba(255,255,255,0.04)',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.08)',
  },
  dayCardActive: {
    borderColor: '#3ab54a',
    backgroundColor: 'rgba(58,181,74,0.12)',
  },
  dayName: {
    color: '#888',
    fontSize: 12,
    marginBottom: 5,
  },
  dayNumber: {
    color: '#fff',
    fontSize: 24,
    fontWeight: '800',
  },
  historyDot: {
    width: 4,
    height: 4,
    borderRadius: 999,
    backgroundColor: '#3ab54a',
    marginTop: 4,
  },
  todayDot: {
    width: 20,
    height: 3,
    borderRadius: 2,
    backgroundColor: '#3ab54a',
    marginTop: 6,
    position: 'absolute',
    bottom: 8,
  },
  alertBox: {
    flexDirection: 'row',
    backgroundColor: 'rgba(255,77,77,0.1)',
    borderLeftWidth: 4,
    borderLeftColor: '#ff4d4d',
    padding: 15,
    borderRadius: 12,
    marginBottom: 20,
    alignItems: 'center',
    gap: 12,
  },
  alertText: {
    color: '#fff',
    flex: 1,
    fontSize: 13,
  },
  aiBox: {
    backgroundColor: 'rgba(58,181,74,0.08)',
    borderLeftWidth: 3,
    borderLeftColor: '#3ab54a',
    padding: 15,
    borderRadius: 12,
    marginBottom: 20,
  },
  aiHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 8,
  },
  aiTitle: {
    color: '#3ab54a',
    fontWeight: '800',
  },
  aiText: {
    color: '#ccc',
    lineHeight: 20,
  },
  tabs: {
    flexDirection: 'row',
    gap: 10,
    marginBottom: 25,
  },
  tabButton: {
    flex: 1,
    paddingVertical: 14,
    borderRadius: 14,
    backgroundColor: 'rgba(255,255,255,0.05)',
    alignItems: 'center',
  },
  tabButtonActive: {
    backgroundColor: '#3ab54a',
  },
  tabText: {
    color: '#777',
    fontWeight: '700',
  },
  tabTextActive: {
    color: '#000',
  },
  workoutHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    marginBottom: 5,
  },
  workoutTitle: {
    color: '#fff',
    fontSize: 22,
    fontWeight: '800',
  },
  workoutDesc: {
    color: '#888',
    fontSize: 15,
    marginBottom: 20,
    fontWeight: '600',
  },
  exerciseCard: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 18,
    borderRadius: 18,
    backgroundColor: 'rgba(255,255,255,0.04)',
    marginBottom: 14,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.08)',
  },
  exerciseDone: {
    borderColor: '#3ab54a',
    backgroundColor: 'rgba(58,181,74,0.06)',
  },
  exerciseTitle: {
    color: '#fff',
    fontWeight: '700',
    fontSize: 16,
  },
  exerciseDesc: {
    color: '#888',
    marginTop: 4,
    fontSize: 13,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.85)',
    justifyContent: 'center',
    padding: 20,
  },
  modalBox: {
    backgroundColor: '#11151c',
    borderRadius: 24,
    padding: 20,
    maxHeight: '75%',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  modalTitle: {
    color: '#fff',
    fontSize: 18,
    fontWeight: '800',
  },
  historyCard: {
    padding: 15,
    backgroundColor: 'rgba(255,255,255,0.03)',
    borderLeftWidth: 3,
    borderLeftColor: '#3ab54a',
    borderRadius: 14,
    marginBottom: 15,
  },
  historyDate: {
    color: '#fff',
    fontWeight: '700',
    fontSize: 15,
  },
  historyExercise: {
    color: '#aaa',
    marginBottom: 6,
    fontSize: 13,
    lineHeight: 20,
  },
});