import React, { useState, useEffect } from 'react';
import { 
  View, 
  Text, 
  TouchableOpacity, 
  StyleSheet, 
  SafeAreaView, 
  ScrollView, 
  ActivityIndicator,
  Alert 
} from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
import { useQuery, useMutation, gql } from '@apollo/client';
import { 
  ArrowLeft, 
  Save, 
  CheckCircle2, 
  FastForward, 
  Timer, 
  Trash2, 
  TrendingUp, 
  TrendingDown, 
  Activity 
} from 'lucide-react-native';

const GET_EX_FOR_RECORD = gql`
  query GetExForRecord($id: ID!) { 
    getExercise(id: $id) { id name idealRest }
    getExerciseInsights(exerciseId: $id) { suggestion status }
  }
`;

const CREATE_WORKOUT = gql`
  mutation CreateWorkout($input: CreateWorkoutInput!) { 
    createWorkout(input: $input) { id } 
  }
`;

const DELETE_WORKOUT_LOG = gql`
  mutation DeleteWorkoutLog($workoutId: ID!, $logIndex: Int!) {
    deleteWorkoutLog(workoutId: $workoutId, logIndex: $logIndex) { id }
  }
`;

const FINISH_WORKOUT = gql`
  mutation FinishWorkout($exerciseCount: Int!) {
    finishWorkout(exerciseCount: $exerciseCount) {
      id
      exercisesCompleted
    }
  }
`;

export default function SeriesRecord() {
  const navigation = useNavigation();
  const route = useRoute();

  const { exerciseId, detalhe = '3 Séries • 10-12 Reps' } = route.params || {};

  const matchSeries = detalhe.match(/(\d+)\s*Série/i);
  const maxSeries = matchSeries ? parseInt(matchSeries[1], 10) : 3;
  const metaRepsTexto = detalhe.includes('•') ? detalhe.split('•')[1].trim() : '10 Reps';

  const [peso, setPeso] = useState(60);
  const [reps, setReps] = useState(10);
  const [serieAtual, setSerieAtual] = useState(1);
  const [workoutIdAtual, setWorkoutIdAtual] = useState(null); 
  const [seriesGuardadasHoje, setSeriesGuardadasHoje] = useState([]); 
  
  const [tempoDescanso, setTempoDescanso] = useState(90);
  const [isResting, setIsResting] = useState(false); 
  const [concluido, setConcluido] = useState(false);

  const { data, loading } = useQuery(GET_EX_FOR_RECORD, { 
    variables: { id: exerciseId },
    skip: !exerciseId,
    fetchPolicy: 'cache-and-network'
  });
  
  const [saveWorkout, { loading: saving }] = useMutation(CREATE_WORKOUT);
  const [deleteLog] = useMutation(DELETE_WORKOUT_LOG);
  const [finishWorkoutMutation] = useMutation(FINISH_WORKOUT);

  const insightIA = data?.getExerciseInsights;

  useEffect(() => {
    if (data?.getExercise && !isResting) {
      setTempoDescanso(data.getExercise.idealRest || 90);
    }
  }, [data, isResting]);

  useEffect(() => {
    let int = null;
    if (isResting && tempoDescanso > 0) {
      int = setInterval(() => setTempoDescanso(t => t - 1), 1000);
    } else if (isResting && tempoDescanso === 0) {
      setIsResting(false);
    }
    return () => clearInterval(int);
  }, [isResting, tempoDescanso]);

  const handleSalvarSerie = async () => {
    try {
      const response = await saveWorkout({
        variables: {
          input: {
            workoutDate: new Date().toISOString().split('T')[0],
            logs: [{ 
              exerciseId: exerciseId, 
              sets: 1, 
              reps, 
              weight: parseFloat(peso) 
            }]
          }
        }
      });

      setWorkoutIdAtual(response.data.createWorkout.id);
      
      const novaSerie = { reps, weight: peso, setNum: serieAtual };
      setSeriesGuardadasHoje([...seriesGuardadasHoje, novaSerie]);

      if (serieAtual < maxSeries) {
        setSerieAtual(serieAtual + 1);
        setIsResting(true); 
      } else {
        await finishWorkoutMutation({ variables: { exerciseCount: 1 } });
        setConcluido(true);
      }
    } catch (err) {
      Alert.alert("Erro", "Erro ao gravar a série: " + err.message);
    }
  };

  const apagarSerieHoje = async (index) => {
    if (!workoutIdAtual) return;
    try {
      await deleteLog({ 
        variables: { workoutId: workoutIdAtual, logIndex: index } 
      });
      
      const novas = [...seriesGuardadasHoje];
      novas.splice(index, 1);
      setSeriesGuardadasHoje(novas);
      setSerieAtual(serieAtual > 1 ? serieAtual - 1 : 1);
    } catch (err) {
      Alert.alert("Erro", "Erro ao apagar série.");
    }
  };

  if (loading || !exerciseId) {
    return (
      <View style={[styles.container, { justifyContent: 'center', alignItems: 'center' }]}>
        <ActivityIndicator size="large" color="#3ab54a" />
      </View>
    );
  }

  const renderAiIcon = () => {
    if (!insightIA) return null;
    if (insightIA.status === 'up') return <TrendingUp color="#3ab54a" size={20} />;
    if (insightIA.status === 'down') return <TrendingDown color="#ff4d4d" size={20} />;
    return <Activity color="#3ab54a" size={20} />;
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity style={styles.backBtn} onPress={() => navigation.goBack()}>
          <ArrowLeft size={28} color="#fff" />
        </TouchableOpacity>
        <View style={styles.headerInfo}>
          <Text style={styles.exTitle}>{data?.getExercise?.name || 'Exercício'}</Text>
          <Text style={styles.exSubtitle}>Série {serieAtual} de {maxSeries}</Text>
        </View>
      </View>

      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        
        {concluido ? (
           <View style={styles.successCard}>
             <CheckCircle2 size={70} color="#3ab54a" style={{ marginBottom: 20 }} />
             <Text style={styles.successTitle}>Treino Esmagado!</Text>
             <Text style={styles.successVolume}>
               Volume de hoje: <Text style={{fontWeight: 'bold', color: '#fff'}}>
                 {seriesGuardadasHoje.reduce((acc, s) => acc + (s.reps * s.weight), 0)} kg
               </Text>
             </Text>
             <TouchableOpacity 
               style={[styles.btnFull, { marginTop: 30 }]} 
               onPress={() => navigation.navigate('Treino')}
             >
               <Text style={styles.btnFullText}>VOLTAR AO TREINO</Text>
             </TouchableOpacity>
           </View>

        ) : isResting ? (
          <View style={styles.restCard}>
             <Timer size={50} color="#3ab54a" style={{ marginBottom: 15 }} />
             <Text style={styles.restTitle}>Descanso Ativo</Text>
             
             <Text style={[
               styles.timerHuge, 
               tempoDescanso <= 5 && { color: '#ff4d4d' }
             ]}>
                {Math.floor(tempoDescanso/60)}:{String(tempoDescanso%60).padStart(2,'0')}
             </Text>
             
             <TouchableOpacity style={styles.btnOutline} onPress={() => setIsResting(false)}>
               <FastForward size={18} color="#fff" />
               <Text style={{color: '#fff', marginLeft: 10, fontWeight: 'bold'}}>PULAR DESCANSO</Text>
             </TouchableOpacity>
          </View>

        ) : (
          <View>
             {insightIA && serieAtual === 1 && (
               <View style={[
                 styles.aiAlert, 
                 { borderColor: insightIA.status === 'down' ? '#ff4d4d' : '#3ab54a' }
               ]}>
                 {renderAiIcon()}
                 <Text style={styles.aiAlertText}>{insightIA.suggestion}</Text>
               </View>
             )}

             <View style={styles.inputPanel}>
                <Text style={styles.panelTitle}>CARGA (KG)</Text>
                <View style={styles.stepper}>
                  <TouchableOpacity style={styles.stepBtn} onPress={() => setPeso(p => p > 0 ? p - 1 : 0)}>
                    <Text style={styles.stepText}>-</Text>
                  </TouchableOpacity>
                  <Text style={styles.stepValue}>{peso}</Text>
                  <TouchableOpacity style={styles.stepBtn} onPress={() => setPeso(p => p + 1)}>
                    <Text style={styles.stepText}>+</Text>
                  </TouchableOpacity>
                </View>
             </View>

             <View style={styles.inputPanel}>
                <View style={{flexDirection: 'row', justifyContent: 'space-between', width: '100%'}}>
                  <Text style={styles.panelTitle}>REPETIÇÕES</Text>
                  <Text style={styles.metaReps}>Meta: {metaRepsTexto}</Text>
                </View>
                
                <View style={styles.stepper}>
                  <TouchableOpacity style={styles.stepBtn} onPress={() => setReps(r => r > 0 ? r - 1 : 0)}>
                    <Text style={styles.stepText}>-</Text>
                  </TouchableOpacity>
                  <Text style={styles.stepValue}>{reps}</Text>
                  <TouchableOpacity style={styles.stepBtn} onPress={() => setReps(r => r + 1)}>
                    <Text style={styles.stepText}>+</Text>
                  </TouchableOpacity>
                </View>
             </View>

             {seriesGuardadasHoje.length > 0 && (
               <View style={styles.logsCard}>
                 <Text style={styles.logsTitle}>Séries de Hoje</Text>
                 {seriesGuardadasHoje.map((s, i) => (
                   <View key={i} style={styles.logItem}>
                     <Text style={{color:'#fff', fontSize: 15}}>Série {s.setNum}</Text>
                     <View style={{flexDirection: 'row', alignItems: 'center', gap: 15}}>
                       <Text style={{color:'#3ab54a', fontWeight:'bold', fontSize: 15}}>
                         {s.weight}kg x {s.reps}
                       </Text>
                       <TouchableOpacity onPress={() => apagarSerieHoje(i)}>
                         <Trash2 size={18} color="#ff4d4d" />
                       </TouchableOpacity>
                     </View>
                   </View>
                 ))}
               </View>
             )}

             <TouchableOpacity 
                style={[styles.saveBtn, saving && {opacity: 0.7}]} 
                onPress={handleSalvarSerie}
                disabled={saving}
             >
                <Save size={20} color="#000" />
                <Text style={styles.saveText}>
                  {saving ? "A GUARDAR..." : (serieAtual === maxSeries ? "FINALIZAR EXERCÍCIO" : `GUARDAR SÉRIE ${serieAtual}`)}
                </Text>
             </TouchableOpacity>
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#090b0f' },
  header: { flexDirection: 'row', alignItems: 'center', padding: 20, paddingTop: 30, gap: 15 },
  backBtn: { padding: 5 },
  headerInfo: { flex: 1 },
  exTitle: { color: '#fff', fontSize: 22, fontWeight: '800', textTransform: 'uppercase' },
  exSubtitle: { color: '#3ab54a', fontSize: 13, fontWeight: 'bold', marginTop: 4 },
  
  content: { padding: 20, flexGrow: 1, justifyContent: 'center' },
  
  // AI Box
  aiAlert: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(58, 181, 74, 0.1)',
    borderWidth: 1,
    padding: 15,
    borderRadius: 12,
    marginBottom: 20,
    gap: 12
  },
  aiAlertText: { color: '#fff', fontSize: 13, flex: 1, lineHeight: 20 },

  // Painéis de Input 
  inputPanel: { 
    backgroundColor: 'rgba(255,255,255,0.03)', 
    padding: 25, 
    borderRadius: 20, 
    alignItems: 'center', 
    marginBottom: 15, 
    borderWidth: 1, 
    borderColor: 'rgba(255,255,255,0.08)' 
  },
  panelTitle: { color: '#8b92a5', fontSize: 13, fontWeight: 'bold', marginBottom: 20, letterSpacing: 1 },
  metaReps: { color: '#3ab54a', fontSize: 13, fontWeight: 'bold' },
  stepper: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', width: '100%', paddingHorizontal: 10 },
  stepBtn: { width: 55, height: 55, borderRadius: 16, backgroundColor: 'rgba(255,255,255,0.05)', justifyContent: 'center', alignItems: 'center', borderWidth: 1, borderColor: 'rgba(255,255,255,0.1)' },
  stepText: { color: '#fff', fontSize: 26, fontWeight: '400' },
  stepValue: { color: '#fff', fontSize: 44, fontWeight: '800', textShadowColor: 'rgba(255,255,255,0.1)', textShadowOffset: {width: 0, height: 0}, textShadowRadius: 10 },
  
  // Histórico do dia 
  logsCard: {
    backgroundColor: 'rgba(255,255,255,0.03)',
    borderRadius: 16,
    padding: 20,
    marginTop: 5,
    marginBottom: 15,
    borderWidth: 1, 
    borderColor: 'rgba(255,255,255,0.08)' 
  },
  logsTitle: { color: '#8b92a5', fontSize: 13, fontWeight: 'bold', marginBottom: 15 },
  logItem: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingVertical: 12, borderBottomWidth: 1, borderBottomColor: 'rgba(255,255,255,0.05)' },

  // Botões de Ação
  saveBtn: { flexDirection: 'row', justifyContent: 'center', alignItems: 'center', backgroundColor: '#3ab54a', padding: 20, borderRadius: 16, marginTop: 10 },
  saveText: { color: '#000', fontWeight: '900', fontSize: 15, marginLeft: 10, letterSpacing: 1 },
  
  // Tela de Descanso
  restCard: { alignItems: 'center', justifyContent: 'center', paddingVertical: 40 },
  restTitle: { color: '#3ab54a', fontSize: 24, fontWeight: '800', marginTop: 10 },
  timerHuge: { color: '#fff', fontSize: 75, fontWeight: '900', marginVertical: 40, fontVariant: ['tabular-nums'] },
  btnOutline: { flexDirection: 'row', padding: 15, paddingHorizontal: 25, borderWidth: 1, borderColor: 'rgba(255,255,255,0.2)', borderRadius: 12, alignItems: 'center' },
  
  // Tela de Sucesso
  successCard: { alignItems: 'center', backgroundColor: 'rgba(58,181,74,0.05)', padding: 40, borderRadius: 24, borderColor: '#3ab54a', borderWidth: 1 },
  successTitle: { color: '#fff', fontSize: 26, fontWeight: '800', marginBottom: 10 },
  successVolume: { color: '#8b92a5', fontSize: 16 },
  btnFull: { backgroundColor: '#3ab54a', padding: 18, borderRadius: 16, width: '100%', alignItems: 'center' },
  btnFullText: { color: '#000', fontWeight: '900', fontSize: 15, letterSpacing: 1 }
});