import React from 'react';
import { useNavigate, useParams, useLocation } from 'react-router-dom';
import { useQuery, gql } from '@apollo/client';
import { CheckCircle2, Plus, ArrowLeft, Target, Activity, History, Dumbbell, BarChart2, CheckSquare } from 'lucide-react';
import BottomNav from '../components/BottomNav';
import '../styles/ExerciseDetail.css';

const GET_EXERCISE_DETAIL = gql`
  query GetExercise($id: ID!) { getExercise(id: $id) { id name subtitle muscleGroup videoUrl idealRest } }
`;
const GET_EXERCISE_HISTORY = gql`
  query GetExerciseHistory($userId: ID!) { getUserWorkouts(userId: $userId) { workoutDate logs { exerciseId weight reps sets } } }
`;

export default function ExerciseDetail() {
  const navigate = useNavigate();
  const { id } = useParams(); 
  const { state } = useLocation(); 
  const userId = localStorage.getItem('evolv_userId');

  const { data: exData, loading: exLoading } = useQuery(GET_EXERCISE_DETAIL, { variables: { id }, fetchPolicy: 'cache-and-network' });
  const { data: histData } = useQuery(GET_EXERCISE_HISTORY, { variables: { userId }, fetchPolicy: 'cache-and-network' });

  const exercicio = exData?.getExercise;
  const prescricao = state?.detalhe || 'Séries Livres';

  let exerciseLogs = [];
  let maxWeight = 0;
  let max1RM = 0;
  let volumeTotalHistorico = 0; 

  if (histData?.getUserWorkouts) {
    histData.getUserWorkouts.forEach(w => {
      w.logs.filter(l => l.exerciseId === id).forEach(log => {
        exerciseLogs.push({ date: w.workoutDate, ...log });
        if (log.weight > maxWeight) maxWeight = log.weight;
        const currentRM = Math.round(log.weight * (1 + log.reps / 30));
        if (currentRM > max1RM) max1RM = currentRM;
        volumeTotalHistorico += (log.weight * log.reps * log.sets);
      });
    });
  }

  exerciseLogs.sort((a, b) => new Date(b.date) - new Date(a.date));

  if (exLoading) return <div className="exercise-detail-page center-all"><Activity className="spin" /></div>;

  return (
    <div className="exercise-detail-page fade-in">
      <header className="detail-header">
        <button className="back-btn" onClick={() => navigate('/treino')}><ArrowLeft size={24} color="#fff" /></button>
        <div className="title-group">
          <h1 className="ex-title">{exercicio?.name}</h1>
          <span className="ex-subtitle" style={{color: 'var(--evolv-green)', fontWeight: 'bold'}}>{exercicio?.subtitle} | {prescricao}</span>
        </div>
      </header>

      <div className="content-scroll detail-layout">
        
        <div className="glass-card video-container">
          {exercicio?.videoUrl ? (
            <iframe width="100%" height="210" src={`${exercicio.videoUrl}?modestbranding=1&rel=0`} title="Execução" frameBorder="0" allowFullScreen></iframe>
          ) : <div style={{height: '210px', display: 'flex', justifyContent: 'center', alignItems: 'center', color: 'var(--text-muted)'}}>Sem vídeo</div>}
          
          <div className="biomechanics-info" style={{padding: '15px'}}>
            <h4 style={{fontSize: '0.85rem', color: '#fff', margin: '0 0 10px 0', display: 'flex', alignItems: 'center', gap: '5px'}}>
              <CheckSquare size={16} color="var(--evolv-green)"/> Checklist de Execução
            </h4>
            <ul style={{listStyle: 'none', padding: 0, margin: 0, color: 'var(--text-muted)', fontSize: '0.8rem', lineHeight: '1.8'}}>
              <li><CheckCircle2 size={12} color="var(--evolv-green)" style={{marginRight: '5px'}}/> Amplitude completa em todas as reps</li>
              <li><CheckCircle2 size={12} color="var(--evolv-green)" style={{marginRight: '5px'}}/> Controlo de 2s na fase excêntrica (descida)</li>
              <li><CheckCircle2 size={12} color="var(--evolv-green)" style={{marginRight: '5px'}}/> Estabilidade do core ativada</li>
            </ul>
          </div>
        </div>

        <div className="glass-card performance-grid">
          <div className="perf-item"><span className="perf-label">1RM Pro</span><strong className="perf-value green-text-glow">{max1RM > 0 ? max1RM : '--'} <small>kg</small></strong></div>
          <div className="perf-divider"></div>
          <div className="perf-item"><span className="perf-label">Carga Max</span><strong className="perf-value">{maxWeight > 0 ? maxWeight : '--'} <small>kg</small></strong></div>
          <div className="perf-divider"></div>
          <div className="perf-item"><span className="perf-label">Vol. Total</span><strong className="perf-value">{volumeTotalHistorico > 0 ? (volumeTotalHistorico/1000).toFixed(1) : '--'} <small>Ton</small></strong></div>
        </div>

        <div className="section-header" style={{marginTop: '25px', marginBottom: '10px', display: 'flex', justifyContent: 'space-between'}}>
          <p className="section-label" style={{ margin: 0, display: 'flex', alignItems: 'center', gap: '8px' }}><History size={16} /> HISTÓRICO DE CARGA</p>
          <span style={{fontSize: '0.7rem', color: '#ffaa00', display: 'flex', alignItems: 'center', gap: '4px'}}><BarChart2 size={12}/> PRO Gráficos</span>
        </div>

        <div className="series-list">
          {exerciseLogs.length === 0 ? (
             <p style={{textAlign: 'center', color: 'var(--text-muted)', fontSize: '0.9rem', padding: '10px 0'}}>Nenhum registo de carga ainda.</p>
          ) : (
            exerciseLogs.map((log, index) => (
              <div key={index} className="glass-card series-item done" style={{marginBottom: '10px', display: 'flex', justifyContent: 'space-between', alignItems: 'center'}}>
                <div style={{display: 'flex', alignItems: 'center', gap: '15px'}}>
                  <Dumbbell color="#fff" size={20} opacity="0.5" />
                  <div className="series-info">
                    <strong>{new Date(log.date).toLocaleDateString('pt-BR')}</strong>
                    <span style={{color: 'var(--evolv-green)'}}>{log.weight}kg x {log.reps} repetições</span>
                  </div>
                </div>
                <div style={{textAlign: 'right', fontSize: '0.7rem', color: 'var(--text-muted)'}}>
                  Vol: {log.weight * log.reps}kg
                </div>
              </div>
            ))
          )}
        </div>

        <button className="green-button outline-glow" onClick={() => navigate(`/registro-serie/${exercicio?.id}`, { state: { detalhe: prescricao } })} style={{marginTop: '20px'}}>
          <Plus size={20} /> INICIAR SÉRIES
        </button>
        <div className="spacer"></div>
      </div>
      <BottomNav />
    </div>
  );
}