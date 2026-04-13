import React, { useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useQuery, gql } from '@apollo/client';
import { CheckCircle2, Trash2, Plus, ArrowLeft, Target, Zap, AlertTriangle, Activity, History } from 'lucide-react';
import BottomNav from '../components/BottomNav';
import '../styles/ExerciseDetail.css';

const GET_EXERCISE_DETAIL = gql`
  query GetExercise($id: ID!) {
    getExercise(id: $id) {
      id name subtitle muscleGroup videoUrl idealRest
    }
  }
`;

const GET_EXERCISE_HISTORY = gql`
  query GetExerciseHistory($userId: ID!) {
    getUserWorkouts(userId: $userId) {
      workoutDate
      logs { exerciseId weight reps sets }
    }
  }
`;

export default function ExerciseDetail() {
  const navigate = useNavigate();
  const { id } = useParams(); 
  const userId = localStorage.getItem('evolv_userId');

  // Puxa o exercício direto do Backend!
  const { data: exData, loading: exLoading } = useQuery(GET_EXERCISE_DETAIL, {
    variables: { id },
    fetchPolicy: 'cache-and-network'
  });

  // Puxa o histórico do utilizador
  const { data: histData } = useQuery(GET_EXERCISE_HISTORY, {
    variables: { userId },
    fetchPolicy: 'cache-and-network'
  });

  const exercicio = exData?.getExercise;

  // LÓGICA DO HISTÓRICO E RECORDES (PR)
  let exerciseLogs = [];
  let maxWeight = 0;
  let max1RM = 0;

  if (histData?.getUserWorkouts) {
    histData.getUserWorkouts.forEach(workout => {
      const logsForThisEx = workout.logs.filter(log => log.exerciseId === id);
      logsForThisEx.forEach(log => {
        exerciseLogs.push({ date: workout.workoutDate, ...log });
        
        // Atualiza a Carga Máxima (PR)
        if (log.weight > maxWeight) maxWeight = log.weight;
        
        // Calcula o 1RM (Fórmula de Epley)
        const currentRM = Math.round(log.weight * (1 + log.reps / 30));
        if (currentRM > max1RM) max1RM = currentRM;
      });
    });
  }

  // Ordena a lista do mais recente para o mais antigo
  exerciseLogs.sort((a, b) => new Date(b.date) - new Date(a.date));

  if (exLoading) return <div className="exercise-detail-page fade-in center-all" style={{height: '100vh', display: 'flex', justifyContent: 'center', alignItems: 'center', color: 'var(--evolv-green)'}}><Activity className="spin" /> A carregar da nuvem...</div>;
  if (!exercicio) return <div className="exercise-detail-page center-all" style={{color: '#fff', textAlign: 'center', marginTop: '50px'}}>Exercício não encontrado na base de dados.</div>;

  return (
    <div className="exercise-detail-page fade-in">
      <header className="detail-header">
        <button className="back-btn" onClick={() => navigate('/treino')}>
          <ArrowLeft size={24} color="#fff" />
        </button>
        <div className="title-group">
          <h1 className="ex-title">{exercicio.name}</h1>
          <span className="ex-subtitle">{exercicio.subtitle || exercicio.muscleGroup}</span>
        </div>
      </header>

      <div className="content-scroll detail-layout">
        
        <div className="glass-card video-container">
          {exercicio.videoUrl ? (
            <iframe width="100%" height="210" src={`${exercicio.videoUrl}?modestbranding=1&rel=0`} title="Execução" frameBorder="0" allowFullScreen></iframe>
          ) : (
            <div style={{height: '210px', display: 'flex', justifyContent: 'center', alignItems: 'center', color: 'var(--text-muted)'}}>Sem vídeo disponível</div>
          )}
          <div className="biomechanics-info">
            <p className="execution-tip">
              <Target size={14} color="var(--evolv-green)" style={{ flexShrink: 0, marginTop: '2px' }} /> 
              <span><strong>Foco:</strong> Mantenha a amplitude máxima e controle a fase excêntrica.</span>
            </p>
          </div>
        </div>

        <div className="glass-card performance-grid">
          <div className="perf-item"><span className="perf-label">1RM (Cálculo)</span><strong className="perf-value green-text-glow">{max1RM > 0 ? max1RM : '--'} <small>kg</small></strong></div>
          <div className="perf-divider"></div>
          <div className="perf-item"><span className="perf-label">Carga Max</span><strong className="perf-value">{maxWeight > 0 ? maxWeight : '--'} <small>kg</small></strong></div>
          <div className="perf-divider"></div>
          <div className="perf-item"><span className="perf-label">Descanso</span><strong className="perf-value">{exercicio.idealRest} <small>s</small></strong></div>
        </div>

        {/* LISTA DE HISTÓRICO REAL */}
        <div className="section-header" style={{marginTop: '25px', marginBottom: '10px'}}>
          <p className="section-label" style={{ margin: 0, display: 'flex', alignItems: 'center', gap: '8px' }}><History size={16} /> O SEU HISTÓRICO</p>
        </div>

        <div className="series-list">
          {exerciseLogs.length === 0 ? (
             <p style={{textAlign: 'center', color: 'var(--text-muted)', fontSize: '0.9rem', padding: '10px 0'}}>Ainda não registou séries neste exercício.</p>
          ) : (
            exerciseLogs.map((log, index) => (
              <div key={index} className="glass-card series-item done" style={{marginBottom: '10px'}}>
                <CheckCircle2 color="#000" fill="var(--evolv-green)" size={24} />
                <div className="series-info">
                  <strong>{new Date(log.date).toLocaleDateString('pt-BR')}</strong>
                  <span>{log.weight}kg x {log.reps} repetições</span>
                </div>
              </div>
            ))
          )}
        </div>

        <button className="green-button outline-glow" onClick={() => navigate(`/registro-serie/${exercicio.id}`)} style={{marginTop: '20px'}}>
          <Plus size={20} /> REGISTRAR NOVA SÉRIE
        </button>

        <div className="spacer"></div>
      </div>
      <BottomNav />
    </div>
  );
}