import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useQuery, gql } from '@apollo/client';
import { LogOut, Settings, Target, Flame, Dumbbell, Activity, ShieldCheck, ChevronRight } from 'lucide-react';
import BottomNav from '../components/BottomNav';
import '../styles/App.css'; 

const GET_PROFILE_DATA = gql`
  query GetProfileData {
    me {
      id
      name
      email
      focus
      goal
      exercisesCompleted
      isPremium
    }
    getUserStreak
    getUserWorkouts {
      logs { weight reps sets }
    }
  }
`;

export default function PerfilPage() {
  const navigate = useNavigate();
  const { data, loading } = useQuery(GET_PROFILE_DATA, { fetchPolicy: 'cache-and-network' });

  const handleLogout = () => {
    localStorage.removeItem('evolv_token');
    localStorage.removeItem('evolv_userId');
    navigate('/');
  };

  if (loading) return <div className="center-all"><Activity className="spin" color="var(--evolv-green)" size={40}/></div>;

  const user = data?.me;
  const streak = data?.getUserStreak || 0;
  
  let totalVolumeKg = 0;
  if (data?.getUserWorkouts) {
    data.getUserWorkouts.forEach(workout => {
      workout.logs.forEach(log => {
        totalVolumeKg += (log.weight * log.reps * log.sets);
      });
    });
  }

  const volumeEmTon = totalVolumeKg > 1000 ? (totalVolumeKg / 1000).toFixed(1) + ' Ton' : totalVolumeKg + ' kg';
  const iniciais = user?.name ? user.name.substring(0, 2).toUpperCase() : 'EV';

  return (
    <div className="fade-in" style={{ padding: '20px', paddingBottom: '100px', minHeight: '100vh', background: '#0d1117' }}>
      
      <header style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '30px', marginTop: '10px' }}>
        <h1 style={{ fontSize: '1.6rem', color: '#fff', margin: 0 }}>Meu Perfil</h1>
        <button style={{ background: 'transparent', border: 'none', color: 'var(--text-muted)' }}><Settings size={24} /></button>
      </header>

      <div className="glass-card" style={{ display: 'flex', alignItems: 'center', gap: '20px', padding: '20px', marginBottom: '25px', position: 'relative', overflow: 'hidden' }}>
        {user?.isPremium && <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: '4px', background: 'var(--evolv-green)' }}></div>}
        
        <div style={{ width: '70px', height: '70px', borderRadius: '50%', background: 'rgba(58, 181, 74, 0.1)', border: '2px solid var(--evolv-green)', display: 'flex', justifyContent: 'center', alignItems: 'center', color: 'var(--evolv-green)', fontSize: '1.5rem', fontWeight: 'bold', flexShrink: 0 }}>
          {iniciais}
        </div>
        
        <div style={{ flex: 1 }}>
          <h2 style={{ color: '#fff', fontSize: '1.2rem', margin: '0 0 5px 0', display: 'flex', alignItems: 'center', gap: '8px' }}>
            {user?.name} {user?.isPremium && <ShieldCheck size={18} color="var(--evolv-green)" />}
          </h2>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem', margin: 0 }}>{user?.email}</p>
          <div style={{ display: 'inline-block', background: 'rgba(255, 255, 255, 0.05)', padding: '4px 10px', borderRadius: '20px', fontSize: '0.75rem', color: '#aaa', marginTop: '10px' }}>
            Plano: <strong style={{ color: user?.isPremium ? 'var(--evolv-green)' : '#fff' }}>{user?.isPremium ? 'PRO' : 'Básico'}</strong>
          </div>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '10px', marginBottom: '30px' }}>
        <div className="glass-card" style={{ padding: '15px 10px', textAlign: 'center' }}>
          <Dumbbell size={22} color="var(--evolv-green)" style={{ margin: '0 auto 8px' }} />
          <strong style={{ display: 'block', color: '#fff', fontSize: '1.2rem' }}>{user?.exercisesCompleted || 0}</strong>
          <span style={{ color: 'var(--text-muted)', fontSize: '0.7rem' }}>CONCLUÍDOS</span>
        </div>
        <div className="glass-card" style={{ padding: '15px 10px', textAlign: 'center' }}>
          <Flame size={22} color="#ffaa00" style={{ margin: '0 auto 8px' }} />
          <strong style={{ display: 'block', color: '#fff', fontSize: '1.2rem' }}>{streak}</strong>
          <span style={{ color: 'var(--text-muted)', fontSize: '0.7rem' }}>OFENSIVA</span>
        </div>
        <div className="glass-card" style={{ padding: '15px 10px', textAlign: 'center' }}>
          <Activity size={22} color="#00d2ff" style={{ margin: '0 auto 8px' }} />
          <strong style={{ display: 'block', color: '#fff', fontSize: '1.2rem' }}>{volumeEmTon}</strong>
          <span style={{ color: 'var(--text-muted)', fontSize: '0.7rem' }}>VOLUME</span>
        </div>
      </div>

      <h3 style={{ color: '#fff', fontSize: '1rem', marginBottom: '15px' }}>Preferências da IA</h3>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', marginBottom: '30px' }}>
        
        <div className="glass-card" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '16px', cursor: 'pointer' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
            <div style={{ background: 'rgba(255, 255, 255, 0.05)', padding: '10px', borderRadius: '12px' }}><Target size={20} color="#fff" /></div>
            <div>
              <span style={{ color: 'var(--text-muted)', fontSize: '0.8rem', display: 'block' }}>Objetivo Principal</span>
              <strong style={{ color: '#fff', fontSize: '0.95rem' }}>{user?.goal || 'Não definido'}</strong>
            </div>
          </div>
          <ChevronRight size={20} color="var(--text-muted)" />
        </div>

        <div className="glass-card" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '16px', cursor: 'pointer' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
            <div style={{ background: 'rgba(58, 181, 74, 0.1)', padding: '10px', borderRadius: '12px' }}><Activity size={20} color="var(--evolv-green)" /></div>
            <div>
              <span style={{ color: 'var(--text-muted)', fontSize: '0.8rem', display: 'block' }}>Foco de Treino</span>
              <strong style={{ color: '#fff', fontSize: '0.95rem' }}>{user?.focus?.split('|')[0] || 'Não definido'}</strong>
            </div>
          </div>
          <ChevronRight size={20} color="var(--text-muted)" />
        </div>

      </div>

      <button onClick={handleLogout} style={{ width: '100%', background: 'rgba(255, 77, 77, 0.1)', border: '1px solid rgba(255, 77, 77, 0.3)', color: '#ff4d4d', padding: '16px', borderRadius: '14px', fontSize: '0.95rem', fontWeight: 'bold', display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '10px', cursor: 'pointer' }}>
        <LogOut size={20} /> TERMINAR SESSÃO
      </button>

      <BottomNav />
    </div>
  );
}