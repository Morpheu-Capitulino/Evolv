import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useQuery, gql } from '@apollo/client';
import { 
  CheckCircle2, Circle, ChevronRight, Play, Dumbbell, 
  Clock, BrainCircuit, Activity, Lock, Calendar as CalendarIcon,
  History, Square, Target
} from 'lucide-react';
import BottomNav from '../components/BottomNav';
import Header from '../components/Header';
import '../styles/TreinoPage.css';

const GET_TREINO_DATA = gql`
  query GetTreinoData($userId: ID!, $date: String!) {
    getMyMeasurements { id weight bodyFatPercentage arm waist thigh hip date }
    getAllExercises { id name }
    me { id focus goal trainingDays } # Adicionámos 'goal'
    getUserWorkouts(userId: $userId, date: $date) {
      logs { exerciseId weight reps sets }
    }
  }
`;

export default function TreinoPage() {
  const navigate = useNavigate();
  const userId = localStorage.getItem('evolv_userId');
  
  // Agenda e Tempo
  const [diasSemana, setDiasSemana] = useState([]);
  const [selectedDay, setSelectedDay] = useState(''); 
  const [todayDate, setTodayDate] = useState(''); 
  
  // Treino e Interface
  const [activeTab, setActiveTab] = useState('A');
  const [rotinas, setRotinas] = useState(null);
  const [aiSchedule, setAiSchedule] = useState(null);
  const [isStarted, setIsStarted] = useState(false);
  const [timeElapsed, setTimeElapsed] = useState(0);
  const [showHistoryModal, setShowHistoryModal] = useState(false);

  const { data, loading } = useQuery(GET_TREINO_DATA, {
    variables: { userId, date: selectedDay || new Date().toISOString().split('T')[0] },
    fetchPolicy: 'cache-and-network',
    skip: !selectedDay
  });

  useEffect(() => {
    const days = [];
    const hoje = new Date();
    const hojeFormatado = hoje.toISOString().split('T')[0];
    setTodayDate(hojeFormatado);
    setSelectedDay(hojeFormatado);

    for (let i = 0; i <= 4; i++) {
      const d = new Date(hoje);
      d.setDate(hoje.getDate() + i);
      const fullDate = d.toISOString().split('T')[0];
      let diaNome = d.toLocaleDateString('pt-BR', { weekday: 'short' }).replace('.', '');
      days.push({ 
        dia: diaNome.charAt(0).toUpperCase() + diaNome.slice(1), 
        numero: d.getDate(), 
        fullDate: fullDate 
      });
    }
    setDiasSemana(days);
  }, []);

  useEffect(() => {
    if (data?.getAllExercises && data?.getMyMeasurements && diasSemana.length > 0) {
      const getId = (nome) => data.getAllExercises.find(e => e.name === nome)?.id || "";
      
      const baseRotinas = {
        'A': { nome: 'Peito, Ombros e Tríceps', exercicios: [
          { id: getId('Supino Reto'), nome: 'Supino Reto', detalhe: '4 Séries • 8-12 Reps' },
          { id: getId('Supino Inclinado'), nome: 'Supino Inclinado', detalhe: '3 Séries • 10-12 Reps' },
          { id: getId('Desenvolvimento'), nome: 'Desenvolvimento', detalhe: '4 Séries • 10 Reps' },
          { id: getId('Tríceps Pulley'), nome: 'Tríceps Pulley', detalhe: '4 Séries • 10-15 Reps' },
        ]},
        'B': { nome: 'Costas e Bíceps', exercicios: [
          { id: getId('Puxada Frente'), nome: 'Puxada Frente', detalhe: '4 Séries • 10-12 Reps' },
          { id: getId('Remada Curvada'), nome: 'Remada Curvada', detalhe: '4 Séries • 8-10 Reps' },
          { id: getId('Rosca Direta'), nome: 'Rosca Direta', detalhe: '3 Séries • 12 Reps' },
        ]},
        'C': { nome: 'Pernas Completo', exercicios: [
          { id: getId('Agachamento Livre'), nome: 'Agachamento Livre', detalhe: '4 Séries • 8-10 Reps' },
          { id: getId('Leg Press 45'), nome: 'Leg Press 45', detalhe: '4 Séries • 12-15 Reps' },
          { id: getId('Cadeira Extensora'), nome: 'Cadeira Extensora', detalhe: '3 Séries • 12-15 Reps' },
        ]},
        'D': { nome: 'Core e Cardio', exercicios: [
          { id: getId('Abdominal Máquina'), nome: 'Abdominal Máquina', detalhe: '4 Séries • 20 Reps' },
          { id: getId('Levantamento Terra'), nome: 'Levantamento Terra', detalhe: '4 Séries • 8 Reps' },
        ]}
      };

      const m = data.getMyMeasurements[0];
      const objetivo = data.me?.goal || 'Geral'; 
      const foco = data.me?.focus || 'Membros Superiores';
      const deficit = m.bodyFatPercentage > 18 ? 'D' : (m.arm < 36 ? 'A' : 'C');
      
      const schedule = {};
      diasSemana.forEach((d, i) => {
        const tab = i % 2 === 0 ? deficit : (foco === 'Superiores' ? 'A' : 'B');
        
        // CORREÇÃO: MENSAGEM DINÂMICA E MAIS DESCRITIVA
        let msg = "Plano híbrido de evolução contínua.";
        if (i === 0) {
          msg = `IA Coach: Para o teu objetivo de **${objetivo}** com foco em **${foco}**, o plano de hoje é estruturado para ${deficit === 'D' ? "queima de gordura e core" : deficit === 'A' ? "desenvolver membros superiores" : "focar nos membros inferiores"}. Vamos lá!`;
        } else if (i === 1) {
          msg = "IA Coach: Próxima sessão focada no desenvolvimento de força e técnica.";
        }
        
        schedule[d.fullDate] = { tab, msg };
      });

      setAiSchedule(schedule);
      setRotinas(baseRotinas);
      if (schedule[selectedDay]) setActiveTab(schedule[selectedDay].tab);
    }
  }, [data, diasSemana, selectedDay]);

  useEffect(() => {
    let interval;
    if (isStarted) interval = setInterval(() => setTimeElapsed(prev => prev + 1), 1000);
    return () => clearInterval(interval);
  }, [isStarted]);

  const verificarConcluido = (exId) => {
    if (!data?.getUserWorkouts) return false;
    return data.getUserWorkouts.some(w => w.logs.some(l => l.exerciseId === exId));
  };

  const formatTime = (s) => `${Math.floor(s/60).toString().padStart(2,'0')}:${(s%60).toString().padStart(2,'0')}`;

  if (loading && !rotinas) return <div className="center-all" style={{color:'#fff'}}><Activity className="spin" /> Sincronizando...</div>;

  return (
    <div className="treino-page fade-in">
      <Header 
        title="O Seu Treino" 
        rightIcon={<CalendarIcon size={22} color="var(--evolv-green)" />} 
        onRightIconClick={() => setShowHistoryModal(true)} 
      />

      <div className="treino-content main-scroll">
        
        {/* CALENDÁRIO STRIP */}
        <div className="calendar-strip">
          {diasSemana.map((item) => (
            <div 
              key={item.fullDate} 
              className={`calendar-day ${selectedDay === item.fullDate ? 'active' : ''}`}
              onClick={() => setSelectedDay(item.fullDate)}
            >
              <span className="day-name">{item.dia}</span>
              <span className="day-number">{item.numero}</span>
              {item.fullDate === todayDate && <div className="active-dot"></div>}
            </div>
          ))}
        </div>

        {aiSchedule?.[selectedDay] && (
          <div className="ai-recommendation-banner fade-in">
            <div className="ai-header"><BrainCircuit size={16} color="var(--evolv-green)" /><strong>Evolv AI Coach</strong></div>
            <p>{aiSchedule[selectedDay].msg}</p>
          </div>
        )}

        {isStarted && selectedDay === todayDate && (
          <div className="glass-card dashboard-card active-dash fade-in">
            <div className="dash-top">
              <div className="timer-display">
                <Clock size={22} color="var(--evolv-green)" />
                <span className="time pulse-text">{formatTime(timeElapsed)}</span>
              </div>
              <button className="action-circle-btn btn-pause" onClick={() => setIsStarted(false)}>
                <Square fill="#000" size={18} />
              </button>
            </div>
          </div>
        )}

        <div className="workout-tabs">
          {['A', 'B', 'C', 'D'].map(l => (
            <button key={l} className={`tab-btn ${activeTab === l ? 'active' : ''}`} onClick={() => setActiveTab(l)}>
              {l} {aiSchedule?.[selectedDay]?.tab === l && <span className="ai-star">★</span>}
            </button>
          ))}
        </div>

        {rotinas && (
          <div className="exercicios-list fade-in">
            <div className="selected-workout-header" style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
               <Dumbbell size={20} color="var(--evolv-green)" />
               <h2>Treino {activeTab}</h2>
            </div>
            
            <h3 className="workout-desc">{rotinas[activeTab].nome}</h3>
            
            {rotinas[activeTab].exercicios.map((ex) => {
              const concluidoReal = verificarConcluido(ex.id);
              return (
                <div 
                  key={ex.id} 
                  className={`glass-card exercicio-item ${concluidoReal ? 'concluido' : ''}`}
                  onClick={() => navigate(`/detalhes/${ex.id}`)}
                >
                  <div className="ex-icon">
                    {concluidoReal ? (
                      <CheckCircle2 size={30} color="var(--evolv-green)" fill="rgba(58, 181, 74, 0.2)" />
                    ) : (
                      <Circle size={30} color="var(--border-glass)" />
                    )}
                  </div>
                  <div className="ex-info">
                    <h3 style={{ textDecoration: concluidoReal ? 'line-through' : 'none' }}>{ex.nome}</h3>
                    <span className="detalhe-treino">{concluidoReal ? "✓ Registado" : ex.detalhe}</span>
                  </div>
                  <ChevronRight size={20} color="var(--text-muted)" />
                </div>
              );
            })}
          </div>
        )}

        <div className="treino-actions">
          {selectedDay === todayDate && !isStarted && (
            <button className="green-button start-btn" onClick={() => setIsStarted(true)}>
              <Play fill="#000" size={20} /> INICIAR TREINO
            </button>
          )}
        </div>

        <div className="spacer"></div>
      </div>

      {/* MODAL DE HISTÓRICO */}
      {showHistoryModal && (
        <div className="modal-overlay" onClick={() => setShowHistoryModal(false)}>
          <div className="data-input-modal" onClick={e => e.stopPropagation()}>
            <div className="modal-header-pro"><h3><History size={20} /> Dias Treinados</h3></div>
            <div className="modal-body-scroll main-scroll" style={{maxHeight: '350px'}}>
              {data?.me?.trainingDays?.length > 0 ? (
                [...data.me.trainingDays].reverse().map((dia, i) => (
                  <div key={i} className="glass-card" style={{padding: '15px', marginBottom: '10px', display: 'flex', alignItems: 'center', gap: '12px', borderLeft: '3px solid var(--evolv-green)'}}>
                    <CheckCircle2 color="var(--evolv-green)" size={20} />
                    <span style={{color: '#fff', fontWeight: 'bold'}}>{new Date(`${dia}T12:00:00`).toLocaleDateString('pt-BR', { day: '2-digit', month: 'short' })}</span>
                  </div>
                ))
              ) : <p style={{textAlign:'center', color:'var(--text-muted)'}}>Sem histórico.</p>}
            </div>
            <button className="btn-cancel-modal-pro full-width" style={{marginTop:'15px'}} onClick={() => setShowHistoryModal(false)}>FECHAR</button>
          </div>
        </div>
      )}

      <BottomNav />
    </div>
  );
}