import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Home, Dumbbell, TrendingUp, Users, User } from 'lucide-react';
import '../styles/BottomNav.css';

export default function BottomNav() {
  const navigate = useNavigate();
  const location = useLocation();

  const isActive = (path) => location.pathname === path ? 'active' : '';

  return (
    <nav className="bottom-nav">
      <div className={`nav-item ${isActive('/home')}`} onClick={() => navigate('/home')}>
        <Home size={24} />
        <span>Home</span>
      </div>
      <div className={`nav-item ${isActive('/treino')}`} onClick={() => navigate('/treino')}>
        <Dumbbell size={24} />
        <span>Treino</span>
      </div>
      <div className={`nav-item ${isActive('/progresso')}`} onClick={() => navigate('/progresso')}>
        <TrendingUp size={24} />
        <span>Progresso</span>
      </div>
      <div className={`nav-item ${isActive('/amigos')}`} onClick={() => navigate('/amigos')}>
        <Users size={24} />
        <span>Amigos</span>
      </div>
      <div className={`nav-item ${isActive('/perfil')}`} onClick={() => navigate('/perfil')}>
        <User size={24} />
        <span>Perfil</span>
      </div>
    </nav>
  );
}