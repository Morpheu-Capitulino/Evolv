import React, { useState, useEffect } from 'react';
import { useNavigate, useParams, useLocation } from 'react-router-dom';
import { useQuery, useMutation, gql } from '@apollo/client';
import { ArrowLeft, Save, CheckCircle2, FastForward, Timer, Trash2, TrendingUp, TrendingDown, Activity } from 'lucide-react';
import '../styles/SeriesRecord.css';

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

export default function SeriesRecord() {
  const navigate = useNavigate();
  const { id: exId } = useParams();
  const { state } = useLocation(); 

  const prescricao = state?.detalhe || '3 Séries • 10-12 Reps';
  const matchSeries = prescricao.match(/(\d+)\s*Série/i);
  const maxSeries = matchSeries ? parseInt(matchSeries[1]) : 3;
  const metaRepsTexto = prescricao.includes('•') ? prescricao.split('•')[1].trim() : '10 Reps';

  const [peso, setPeso] = useState(60);
  const [reps, setReps] = useState(10);
  const [serieAtual, setSerieAtual] = useState(1);
  const [workoutIdAtual, setWorkoutIdAtual] = useState(null); 
  const [seriesGuardadasHoje, setSeriesGuardadasHoje] = useState([]); 
  
  const [tempoDescanso, setTempoDescanso] = useState(90);
  const [isResting, setIsResting] = useState(false); 
  const [concluido, setConcluido] = useState(false);


  const { data, loading } = useQuery(GET_EX_FOR_RECORD, { variables: { id: exId } });
  const [saveWorkout, { loading: saving }] = useMutation(CREATE_WORKOUT);
  const [deleteLog] = useMutation(DELETE_WORKOUT_LOG);

  const insightIA = data?.getExerciseInsights;

  useEffect(() => {
    if (data?.getExercise && !isResting) setTempoDescanso(data.getExercise.idealRest || 90);
  }, [data, isResting]);

  useEffect(() => {
    let int = null;
    if (isResting && tempoDescanso > 0) int = setInterval(() => setTempoDescanso(t => t - 1), 1000);
    else if (isResting && tempoDescanso === 0) setIsResting(false);
    return () => clearInterval(int);
  }, [isResting, tempoDescanso]);

  const handleSalvarSerie = async () => {
    try {
      const response = await saveWorkout({
        variables: {
          input: {
            workoutDate: new Date().toISOString().split('T')[0], 
            logs: [{ exerciseId: exId, sets: 1, reps, weight: parseFloat(peso) }]
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
        setConcluido(true);
      }
    } catch (err) {
      alert("Erro ao gravar: " + err.message);
    }
  };

  const apagarSerieHoje = async (index) => {
    if (!workoutIdAtual) return;
    try {
      await deleteLog({ variables: { workoutId: workoutIdAtual, logIndex: index } });
      
      const novas = [...seriesGuardadasHoje];
      novas.splice(index, 1);
      setSeriesGuardadasHoje(novas);
      setSerieAtual(serieAtual > 1 ? serieAtual - 1 : 1);
    } catch (err) {
      alert("Erro ao apagar série.");
    }
  };

  if (loading) return <div className="series-record-page center-all" style={{color:'var(--evolv-green)'}}><Activity className="spin" /> A carregar IA...</div>;

  return (
    <div className="series-record-page fade-in">
      <header className="clean-header">
        <button className="icon-back-btn" onClick={() => navigate(-1)}><ArrowLeft size={28} color="#fff" /></button>
        <div className="header-info">
          <h1 className="ex-title">{data?.getExercise?.name}</h1>
          <span className="ex-subtitle">Série {serieAtual} de {maxSeries}</span>
        </div>
      </header>

      <div className="content-scroll record-layout">
        {concluido ? (
           <div className="glass-card success-card fade-in">
             <CheckCircle2 size={70} color="var(--evolv-green)" className="pulse-icon" />
             <h2>Treino Esmagado!</h2>
             <p>Volume de hoje: <strong>{seriesGuardadasHoje.reduce((acc, s) => acc + (s.reps * s.weight), 0)} kg</strong></p>
             <button className="green-button full-width mt-20" onClick={() => navigate('/treino')}>VOLTAR AO TREINO</button>
           </div>
        ) : isResting ? (
          <div className="rest-screen fade-in" style={{textAlign: 'center', marginTop: '30px'}}>
             <Timer size={45} color="var(--evolv-green)" className="pulse-icon" style={{margin:'0 auto 15px'}} />
             <h2 style={{color: 'var(--evolv-green)'}}>Descanso Ativo</h2>
             <div className={`timer-display-huge pulse-text ${tempoDescanso <= 5 ? 'ending' : ''}`} style={{fontSize: '5rem', fontWeight: '800', color: tempoDescanso <= 5 ? '#ff4d4d' : '#fff', margin: '40px 0'}}>
                {Math.floor(tempoDescanso/60)}:{String(tempoDescanso%60).padStart(2,'0')}
             </div>
             <button className="btn-glass-outline" onClick={() => setIsResting(false)}><FastForward size={18} /> PULAR DESCANSO</button>
          </div>
        ) : (
          <div className="fade-in">
             {insightIA && serieAtual === 1 && (
               <div className="ai-progression-alert fade-in" style={{background: 'rgba(58, 181, 74, 0.1)', border: `1px solid ${insightIA.status === 'down' ? '#ff4d4d' : 'var(--evolv-green)'}`, padding: '10px', borderRadius: '10px', marginBottom: '15px', display: 'flex', alignItems: 'center', gap: '10px'}}>
                 {insightIA.status === 'up' ? <TrendingUp color="var(--evolv-green)" /> : (insightIA.status === 'down' ? <TrendingDown color="#ff4d4d" /> : <Activity color="var(--evolv-green)" />)}
                 <span style={{fontSize: '0.85rem', color: '#fff'}}>{insightIA.suggestion}</span>
               </div>
             )}

             <div className="glass-card input-panel">
                <p className="panel-title">CARGA (KG)</p>
                <div className="stepper-modern">
                  <button className="stepper-btn" onClick={() => setPeso(p => p - 1)}>-</button>
                  <div className="value-display-modern">{peso}</div>
                  <button className="stepper-btn" onClick={() => setPeso(p => p + 1)}>+</button>
                </div>
             </div>

             <div className="glass-card input-panel" style={{marginTop: '15px'}}>
                <p className="panel-title">REPETIÇÕES <span style={{float:'right', color:'var(--evolv-green)', textTransform:'none'}}>Meta: {metaRepsTexto}</span></p>
                <div className="stepper-modern">
                  <button className="stepper-btn" onClick={() => setReps(r => r - 1)}>-</button>
                  <div className="value-display-modern">{reps}</div>
                  <button className="stepper-btn" onClick={() => setReps(r => r + 1)}>+</button>
                </div>
             </div>

             {seriesGuardadasHoje.length > 0 && (
               <div className="today-logs glass-card" style={{marginTop: '15px', padding: '15px'}}>
                 <h4 style={{margin:'0 0 10px 0', fontSize:'0.85rem', color:'var(--text-muted)'}}>Séries de Hoje</h4>
                 {seriesGuardadasHoje.map((s, i) => (
                   <div key={i} style={{display:'flex', justifyContent:'space-between', alignItems:'center', borderBottom:'1px solid rgba(255,255,255,0.1)', padding:'8px 0'}}>
                     <span style={{color:'#fff'}}>Série {s.setNum}</span>
                     <span style={{color:'var(--evolv-green)', fontWeight:'bold'}}>{s.weight}kg x {s.reps}</span>
                     <button onClick={() => apagarSerieHoje(i)} style={{background:'transparent', border:'none', color:'#ff4d4d'}}><Trash2 size={16}/></button>
                   </div>
                 ))}
               </div>
             )}

             <div className="bottom-action-area">
                <button className="green-button save-btn" onClick={handleSalvarSerie} disabled={saving}>
                  <Save size={20} /> {saving ? "A GUARDAR..." : (serieAtual === maxSeries ? "FINALIZAR EXERCÍCIO" : `GUARDAR SÉRIE ${serieAtual}`)}
                </button>
             </div>
          </div>
        )}
      </div>
    </div>
  );
}