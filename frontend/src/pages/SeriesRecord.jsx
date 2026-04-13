import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useQuery, useMutation, gql } from '@apollo/client';
import { ArrowLeft, Save, Play, Square, RotateCcw, Check, CheckCircle2, Zap, Target } from 'lucide-react';
import BottomNav from '../components/BottomNav';
import '../styles/SeriesRecord.css';

// QUERIES
const GET_EX_FOR_RECORD = gql`
  query GetExForRecord($id: ID!) {
    getExercise(id: $id) { id name idealRest }
  }
`;

const CREATE_WORKOUT = gql`
  mutation CreateWorkout($input: CreateWorkoutInput!) {
    createWorkout(input: $input) { id }
  }
`;

export default function SeriesRecord() {
  const navigate = useNavigate();
  const { id: exId } = useParams();
  const userId = localStorage.getItem('evolv_userId');

  const [peso, setPeso] = useState(60);
  const [reps, setReps] = useState(10);
  const [serieAtual, setSerieAtual] = useState(1);
  const [tempoDescanso, setTempoDescanso] = useState(90);
  const [timerAtivo, setTimerAtivo] = useState(false);
  const [concluido, setConcluido] = useState(false);

  const { data, loading } = useQuery(GET_EX_FOR_RECORD, { variables: { id: exId } });
  const [saveWorkout] = useMutation(CREATE_WORKOUT);

  useEffect(() => {
    if (data?.getExercise) setTempoDescanso(data.getExercise.idealRest || 90);
  }, [data]);

  useEffect(() => {
    let int = null;
    if (timerAtivo && tempoDescanso > 0) int = setInterval(() => setTempoDescanso(t => t - 1), 1000);
    else if (tempoDescanso === 0) setTimerAtivo(false);
    return () => clearInterval(int);
  }, [timerAtivo, tempoDescanso]);

  const handleSalvarSerie = async () => {
    try {
      await saveWorkout({
        variables: {
          input: {
            userId: userId,
            workoutDate: new Date().toISOString(),
            logs: [{ exerciseId: exId, sets: 1, reps: reps, weight: parseFloat(peso) }]
          }
        }
      });

      if (serieAtual < 3) {
        setSerieAtual(serieAtual + 1);
        setTempoDescanso(data?.getExercise?.idealRest || 90);
        setTimerAtivo(true);
      } else {
        setConcluido(true);
      }
    } catch (err) {
      alert("Erro ao gravar na nuvem: " + err.message);
    }
  };

  if (loading) return <div className="series-record-page center-all">A carregar biometria...</div>;

  return (
    <div className="series-record-page fade-in">
      <header className="clean-header">
        <button className="icon-back-btn" onClick={() => navigate(-1)}><ArrowLeft size={28} color="#fff" /></button>
        <div className="header-info">
          <h1 className="ex-title">{data?.getExercise?.name}</h1>
          <span className="ex-subtitle">Registo em Tempo Real</span>
        </div>
      </header>

      <div className="content-scroll record-layout">
        {concluido ? (
          <div className="glass-card success-card fade-in">
            <CheckCircle2 size={70} color="var(--evolv-green)" className="pulse-icon" />
            <h2>Séries Guardadas no MongoDB!</h2>
            <button className="green-button full-width mt-20" onClick={() => navigate(`/detalhes/${exId}`)}>VER EVOLUÇÃO</button>
          </div>
        ) : (
          <div className="fade-in">
             <div className="glass-card input-panel">
                <p className="panel-title">CARGA (KG)</p>
                <div className="stepper-modern">
                  <button className="stepper-btn" onClick={() => setPeso(p => p - 1)}>-</button>
                  <div className="value-display-modern">{peso}</div>
                  <button className="stepper-btn" onClick={() => setPeso(p => p + 1)}>+</button>
                </div>
             </div>

             {/* PAINEL DE REPETIÇÕES RESTAURADO */}
             <div className="glass-card input-panel" style={{marginTop: '15px'}}>
                <p className="panel-title">REPETIÇÕES</p>
                <div className="stepper-modern">
                  <button className="stepper-btn" onClick={() => setReps(r => r - 1)}>-</button>
                  <div className="value-display-modern">{reps}</div>
                  <button className="stepper-btn" onClick={() => setReps(r => r + 1)}>+</button>
                </div>
             </div>

             <div className={`glass-card timer-panel ${timerAtivo ? 'timer-active-panel' : ''}`} style={{marginTop: '15px'}}>
                <div className="timer-display-huge">{Math.floor(tempoDescanso/60)}:{String(tempoDescanso%60).padStart(2,'0')}</div>
                <button className="green-button" onClick={() => setTimerAtivo(!timerAtivo)}>{timerAtivo ? "PAUSAR" : "INICIAR DESCANSO"}</button>
             </div>

             <div className="bottom-action-area">
                <button className="green-button save-btn" onClick={handleSalvarSerie}>
                  <Save size={20} /> {serieAtual === 3 ? "FINALIZAR" : "GUARDAR SÉRIE " + serieAtual}
                </button>
             </div>
          </div>
        )}
      </div>
    </div>
  );
}