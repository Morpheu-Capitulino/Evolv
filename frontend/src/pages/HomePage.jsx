import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useQuery, gql } from '@apollo/client';
import { Play, TrendingUp, Activity, Flame, Trophy, Users, Target, Dumbbell } from 'lucide-react';
import BottomNav from '../components/BottomNav';
import '../styles/HomePage.css';

const GET_HOME_DATA = gql`
  query GetHomeData {
    me {
      id
      name
      exercisesCompleted
      focus
      goal
      friendIds
    }
  }
`;

export default function HomePage() {
  const navigate = useNavigate();

  const { data, loading } = useQuery(GET_HOME_DATA, { fetchPolicy: 'cache-and-network' });
  
  useEffect(() => {
    if (data && data.me) {
      const { goal, focus } = data.me;
      if (!goal || !focus || goal === 'Não definido' || focus === 'Não definido' || focus === 'Geral') {
        navigate('/onboarding');
      }
    }
  }, [data, navigate]);

  const currentUser = data?.me;
  
  const primeiroNome = currentUser?.name?.split(' ')[0] || 'Atleta';

  const totalExercicios = currentUser?.exercisesCompleted || 0;
  const focoAtual = currentUser?.focus || 'Geral';
  const totalAmigos = currentUser?.friendIds?.length || 0;

  return (
    <div className="home-page fade-in">
      <header className="home-header">
        <div className="user-greeting">
          <div className="profile-pic-mini">
            <span style={{color: '#fff', fontWeight: 'bold'}}>{primeiroNome.charAt(0)}</span>
          </div>
          <div>
            <h1 className="greeting-text">
              {loading ? 'A carregar...' : `Olá, ${primeiroNome}`}
            </h1>
            <span className="greeting-sub">Pronto para superar limites?</span>
          </div>
        </div>
        <h2 className="evolv-logo mini-logo">Evolv</h2>
      </header>

      <div className="content-scroll home-layout">
        <div className="glass-card interactive-stats">
          
          <div className="stats-tabs">
            <button className="stat-tab active" style={{width: '100%', cursor: 'default'}}>
              Visão Geral do Perfil
            </button>
          </div>

          <div className="stats-grid fade-in-fast">
            <div className="stat-box">
              <Dumbbell size={22} className="stat-icon green-glow" />
              <strong>{totalExercicios}</strong>
              <span>Exercícios</span>
            </div>
            
            <div className="stat-box">
              <Target size={22} className="stat-icon orange-glow" />
              <strong style={{fontSize: focoAtual.length > 9 ? '0.85rem' : '1.1rem'}}>{focoAtual}</strong>
              <span>Foco Atual</span>
            </div>
            
            <div className="stat-box">
              <Users size={22} className="stat-icon gold-glow" />
              <strong>{totalAmigos}</strong>
              <span>Amigos</span>
            </div>
          </div>

        </div>

        <p className="section-label">AÇÃO PRINCIPAL</p>
        <div className="glass-card main-cta" onClick={() => navigate('/treino')}>
          <div className="cta-info">
            <span className="cta-badge">Treino de Hoje</span>
            <h3>Bora Treinar!</h3>
            <span className="cta-desc">Inicie seu treino agora</span>
          </div>
          <button className="play-btn"><Play size={26} fill="#000" color="#000" /></button>
        </div>

        <p className="section-label">EXPLORAR</p>
        <div className="horizontal-scroll">
          <div className="glass-card explore-card" onClick={() => navigate('/progresso')}>
            <TrendingUp size={24} className="explore-icon" />
            <h4>Evolução</h4>
            <span>Ver gráficos</span>
          </div>
          <div className="glass-card explore-card" onClick={() => navigate('/amigos')}>
            <Activity size={24} className="explore-icon" />
            <h4>Comunidade</h4>
            <span>Ranking</span>
          </div>
        </div>
        <div className="spacer"></div>
      </div>
      <BottomNav />
    </div>
  );
}