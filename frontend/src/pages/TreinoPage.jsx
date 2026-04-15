import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useQuery, gql } from '@apollo/client';
import { 
  CheckCircle2, Circle, ChevronRight, Dumbbell, 
  BrainCircuit, Activity, Calendar as CalendarIcon,
  History, X, Flame, AlertTriangle, Trophy
} from 'lucide-react';
import BottomNav from '../components/BottomNav';
import Header from '../components/Header';
import '../styles/TreinoPage.css';

const GET_TREINO_DATA = gql`
  query GetTreinoData($userId: ID!) {
    getMyMeasurements { id weight bodyFatPercentage arm waist thigh hip date }
    getAllExercises { id name }
    me { id focus goal trainingDays isPremium }
    getUserWorkouts(userId: $userId) { workoutDate logs { exerciseId weight reps sets } }
    getUserStreak 
  }
`;

const ROTINAS_FALLBACK = {
  'A': { nome: 'Carregando...', exercicios: [] }
};

export default function TreinoPage() {
  const navigate = useNavigate();
  const userId = localStorage.getItem('evolv_userId');
  
  const [diasSemana, setDiasSemana] = useState([]);
  const [selectedDay, setSelectedDay] = useState(''); 
  const [todayDate, setTodayDate] = useState(''); 
  
  const [activeTab, setActiveTab] = useState('A');
  const [rotinas, setRotinas] = useState(ROTINAS_FALLBACK); 
  const [aiSchedule, setAiSchedule] = useState(null);
  const [showHistoryModal, setShowHistoryModal] = useState(false);
  
  const [treinoScore, setTreinoScore] = useState(0);
  const [alertaInteligente, setAlertaInteligente] = useState(null);

  const { data, loading } = useQuery(GET_TREINO_DATA, { variables: { userId }, fetchPolicy: 'cache-and-network' });

  useEffect(() => {
    if (data && data.me) {
      const { goal, focus } = data.me;
      if (!goal || !focus || goal === 'Não definido' || focus === 'Não definido' || focus === 'Geral') navigate('/onboarding');
    }
  }, [data, navigate]);

  useEffect(() => {
    const days = [];
    const hoje = new Date();
    const hojeFormatado = hoje.toISOString().split('T')[0];
    setTodayDate(hojeFormatado);
    setSelectedDay(hojeFormatado);

    for (let i = -2; i <= 2; i++) { 
      const d = new Date(hoje);
      d.setDate(hoje.getDate() + i);
      days.push({ 
        dia: d.toLocaleDateString('pt-BR', { weekday: 'short' }).replace('.', '').charAt(0).toUpperCase() + d.toLocaleDateString('pt-BR', { weekday: 'short' }).substring(1,3), 
        numero: d.getDate(), 
        fullDate: d.toISOString().split('T')[0],
        isPast: i < 0
      });
    }
    setDiasSemana(days);
  }, []);

  useEffect(() => {
    if (data?.getAllExercises && diasSemana.length > 0) {
      const getId = (nome) => data.getAllExercises.find(e => e.name === nome)?.id || "";
      const focoStr = data.me?.focus || 'Superiores|Intermediário|3_dias';
      const diasPorSemana = focoStr.includes('3_dias') ? 3 : (focoStr.includes('6_dias') ? 6 : 4);
      const isPro = data.me?.isPremium;

      let baseRotinas = {};
      if (diasPorSemana === 3) {
        baseRotinas = {
          'A': { nome: 'Full Body (Força)', exercicios: [
            { id: getId('Agachamento Livre'), nome: 'Agachamento Livre', detalhe: '4 Séries • 6-8 Reps' },
            { id: getId('Supino Reto'), nome: 'Supino Reto', detalhe: '4 Séries • 6-8 Reps' },
            { id: getId('Remada Curvada'), nome: 'Remada Curvada', detalhe: '4 Séries • 8-10 Reps' },
          ]},
          'B': { nome: 'Full Body (Hipertrofia)', exercicios: [
            { id: getId('Leg Press 45'), nome: 'Leg Press 45', detalhe: '3 Séries • 12-15 Reps' },
            { id: getId('Supino Inclinado'), nome: 'Supino Inclinado', detalhe: '3 Séries • 10-12 Reps' },
            { id: getId('Puxada Frente'), nome: 'Puxada Frente', detalhe: '3 Séries • 10-12 Reps' },
          ]}
        };
      } else {
        baseRotinas = { 
          'A': { nome: 'Push (Peito, Ombro, Tríceps)', exercicios: [
            { id: getId('Supino Reto'), nome: 'Supino Reto', detalhe: '4 Séries • 8-12 Reps' },
            { id: getId('Desenvolvimento'), nome: 'Desenvolvimento', detalhe: '4 Séries • 10 Reps' },
            { id: getId('Tríceps Pulley'), nome: 'Tríceps Pulley', detalhe: '4 Séries • 10-15 Reps' },
          ]},
          'B': { nome: 'Pull (Costas e Bíceps)', exercicios: [
            { id: getId('Puxada Frente'), nome: 'Puxada Frente', detalhe: '4 Séries • 10-12 Reps' },
            { id: getId('Rosca Direta'), nome: 'Rosca Direta', detalhe: '3 Séries • 12 Reps' },
          ]},
          'C': { nome: 'Legs (Pernas Completas)', exercicios: [
            { id: getId('Agachamento Livre'), nome: 'Agachamento Livre', detalhe: '4 Séries • 8-10 Reps' },
            { id: getId('Cadeira Extensora'), nome: 'Cadeira Extensora', detalhe: '3 Séries • 12-15 Reps' },
          ]}
        };
      }

      let scoreCalculado = 0;
      if (data.getUserWorkouts) {
        const treinosPassados = data.getUserWorkouts;
        scoreCalculado = treinosPassados.length * 150; 
        
        const fezPernaRecentemente = treinosPassados.slice(0, 7).some(w => w.logs.some(l => l.exerciseId === getId('Agachamento Livre') || l.exerciseId === getId('Leg Press 45')));
        if (!fezPernaRecentemente) setAlertaInteligente("Atenção: Não regista treinos de membros inferiores há mais de 7 dias.");
      }
      setTreinoScore(scoreCalculado);

      const weekMsg = isPro ? "Semana 2: Foco em sobrecarga progressiva (Média/Alta)." : "Desbloqueie a Periodização Automática com o Plano PRO.";

      const schedule = {};
      diasSemana.forEach((d, i) => {
        const tab = i % 2 === 0 ? 'A' : (diasPorSemana === 3 ? 'B' : 'C'); 
        schedule[d.fullDate] = { tab, msg: i === 2 ? `Evolv AI: Split adaptado para ${diasPorSemana} dias. ${weekMsg}` : "Sessão planeada para recuperação muscular otimizada." };
      });

      setAiSchedule(schedule);
      setRotinas(baseRotinas);

      const manualTab = sessionStorage.getItem('evolv_tab_' + selectedDay);
      if (manualTab && baseRotinas[manualTab]) setActiveTab(manualTab);
      else if (schedule[selectedDay]) setActiveTab(schedule[selectedDay].tab);

    }
  }, [data, diasSemana, selectedDay]);

  const handleTabClick = (tab) => {
    setActiveTab(tab);
    sessionStorage.setItem('evolv_tab_' + selectedDay, tab);
  };

  const verificarConcluido = (exId) => {
    if (!data?.getUserWorkouts) return false;
    return data.getUserWorkouts.filter(w => w.workoutDate.startsWith(selectedDay)).some(w => w.logs.some(l => l.exerciseId === exId));
  };

  const getHistoricoAgrupado = () => {
    if (!data?.getUserWorkouts || !data?.getAllExercises) return [];
    const map = {};
    data.getUserWorkouts.forEach(w => {
      const dateKey = w.workoutDate.split('T')[0];
      if (!map[dateKey]) map[dateKey] = new Set();
      w.logs.forEach(l => {
        const ex = data.getAllExercises.find(e => e.id === l.exerciseId);
        if (ex) map[dateKey].add(ex.name);
      });
    });
    return Object.keys(map).sort((a,b) => new Date(b) - new Date(a)).map(d => ({ date: d, exercises: Array.from(map[d]) }));
  };

  if (loading && rotinas === ROTINAS_FALLBACK) return <div className="center-all"><Activity className="spin" color="var(--evolv-green)" /></div>;
  const historico = getHistoricoAgrupado();

  return (
    <div className="treino-page fade-in">
      <Header title="O Seu Treino" rightIcon={<CalendarIcon size={22} color="var(--evolv-green)" />} onRightIconClick={() => setShowHistoryModal(true)} />

      <div className="treino-content main-scroll">
        
        <div className="gamification-bar" style={{display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '0 10px', marginBottom: '15px'}}>
          <div style={{display: 'flex', alignItems: 'center', gap: '5px', color: '#ffaa00'}}><Flame size={18} fill="#ffaa00"/> <strong style={{color:'#fff'}}>3 <span style={{fontSize:'0.7rem', color:'var(--text-muted)'}}>Streak</span></strong></div>
          <div style={{display: 'flex', alignItems: 'center', gap: '5px', background: 'rgba(58, 181, 74, 0.1)', padding: '4px 10px', borderRadius: '15px', border: '1px solid var(--evolv-green)'}}>
            <Trophy size={14} color="var(--evolv-green)"/> <span style={{color: 'var(--evolv-green)', fontWeight: 'bold', fontSize: '0.85rem'}}>Score: {treinoScore}</span>
          </div>
        </div>

        <div className="calendar-strip">
          {diasSemana.map((item) => (
            <div key={item.fullDate} className={`calendar-day ${selectedDay === item.fullDate ? 'active' : ''} ${item.isPast ? 'past-day' : ''}`} onClick={() => setSelectedDay(item.fullDate)}>
              <span className="day-name">{item.dia}</span>
              <span className="day-number">{item.numero}</span>
              {historico.some(h => h.date === item.fullDate) && <div className="done-dot" style={{width: '4px', height: '4px', background: 'var(--evolv-green)', borderRadius: '50%', marginTop: '2px'}}></div>}
              {item.fullDate === todayDate && <div className="active-dot"></div>}
            </div>
          ))}
        </div>

        {alertaInteligente && (
          <div className="glass-card danger fade-in" style={{padding: '12px', margin: '15px 0', borderLeft: '4px solid #ff4d4d', display: 'flex', alignItems: 'center', gap: '10px'}}>
            <AlertTriangle color="#ff4d4d" size={20} flexShrink={0} />
            <p style={{margin: 0, fontSize: '0.85rem', color: '#fff'}}>{alertaInteligente}</p>
          </div>
        )}

        {aiSchedule?.[selectedDay] && (
          <div className="ai-recommendation-banner fade-in">
            <div className="ai-header"><BrainCircuit size={16} color="var(--evolv-green)" /><strong>Evolv AI Coach</strong></div>
            <p>{aiSchedule[selectedDay].msg}</p>
          </div>
        )}

        <div className="workout-tabs" style={{marginTop: '20px'}}>
          {Object.keys(rotinas).map(l => (
            <button key={l} className={`tab-btn ${activeTab === l ? 'active' : ''}`} onClick={() => handleTabClick(l)}>
              Treino {l} {aiSchedule?.[selectedDay]?.tab === l && <span className="ai-star">★</span>}
            </button>
          ))}
        </div>

        {rotinas[activeTab] && rotinas[activeTab].exercicios.length > 0 && (
          <div className="exercicios-list fade-in">
            <div className="selected-workout-header" style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
               <Dumbbell size={20} color="var(--evolv-green)" /><h2>Treino {activeTab}</h2>
            </div>
            <h3 className="workout-desc">{rotinas[activeTab].nome}</h3>
            
            {rotinas[activeTab].exercicios.map((ex) => {
              const concluidoReal = verificarConcluido(ex.id);
              return (
                <div key={ex.id} className={`glass-card exercicio-item ${concluidoReal ? 'concluido' : ''}`} onClick={() => navigate(`/detalhes/${ex.id}`, { state: { detalhe: ex.detalhe } })}>
                  <div className="ex-icon">{concluidoReal ? <CheckCircle2 size={30} color="var(--evolv-green)" fill="rgba(58, 181, 74, 0.2)" /> : <Circle size={30} color="var(--border-glass)" />}</div>
                  <div className="ex-info">
                    <h3 style={{ textDecoration: concluidoReal ? 'line-through' : 'none' }}>{ex.nome}</h3>
                    <span className="detalhe-treino">{concluidoReal ? "✓ Checklist Concluído" : ex.detalhe}</span>
                  </div>
                  <ChevronRight size={20} color="var(--text-muted)" />
                </div>
              );
            })}
          </div>
        )}
        <div className="spacer"></div>
      </div>

      {showHistoryModal && (
        <div className="modal-overlay" onClick={() => setShowHistoryModal(false)}>
          <div className="data-input-modal" onClick={e => e.stopPropagation()}>
            <div className="modal-header-pro" style={{justifyContent: 'space-between'}}>
              <h3 style={{display: 'flex', alignItems: 'center', gap: '8px'}}><History size={18} color="var(--evolv-green)"/> Diário de Treino</h3>
              <button className="icon-btn-close" onClick={() => setShowHistoryModal(false)}><X size={22} /></button>
            </div>
            
            <div className="modal-body-scroll main-scroll" style={{maxHeight: '60vh', padding: '10px'}}>
              {historico.length > 0 ? (
                historico.map((hist, i) => (
                  <div key={i} className="glass-card" style={{padding: '15px', marginBottom: '15px', borderLeft: '3px solid var(--evolv-green)'}}>
                    <div style={{display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '10px', borderBottom: '1px solid rgba(255,255,255,0.1)', paddingBottom: '8px'}}>
                      <CalendarIcon size={16} color="var(--evolv-green)" />
                      <strong style={{color: '#fff', fontSize: '1rem'}}>{new Date(`${hist.date}T12:00:00`).toLocaleDateString('pt-BR', { day: '2-digit', month: 'short', year: 'numeric' })}</strong>
                    </div>
                    <ul style={{ margin: 0, paddingLeft: '20px', color: 'var(--text-muted)', fontSize: '0.9rem', lineHeight: '1.6' }}>
                      {hist.exercises.map((exName, idx) => (
                        <li key={idx}>{exName}</li>
                      ))}
                    </ul>
                  </div>
                ))
              ) : <p style={{textAlign:'center', color:'var(--text-muted)', marginTop: '20px'}}>Ainda não concluiu nenhum exercício. Comece hoje mesmo!</p>}
            </div>
          </div>
        </div>
      )}
      <BottomNav />
    </div>
  );
}