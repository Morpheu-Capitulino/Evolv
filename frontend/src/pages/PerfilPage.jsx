import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useQuery, useMutation, gql } from '@apollo/client';
import axios from 'axios';
import { 
  Star, LogOut, Edit3, CheckCircle2, AlertTriangle, 
  Crown, ChevronRight, Key, Eye, EyeOff, Lock
} from 'lucide-react';
import BottomNav from '../components/BottomNav';
import '../styles/PerfilPage.css';

const GET_PROFILE_DATA = gql`
  query GetProfileData {
    me { id name email goal focus isPremium exercisesCompleted }
    getUserStreak
    getUserWorkouts {
      logs { weight reps sets }
    }
  }
`;

const UPDATE_USER = gql`
  mutation UpdateUser($id: ID!, $name: String, $email: String) {
    updateUser(id: $id, name: $name, email: $email) { id name email }
  }
`;

export default function PerfilPage() {
  const navigate = useNavigate();
  const userId = localStorage.getItem('evolv_userId');

  const [userData, setUserData] = useState({ 
    nome: 'A carregar...', 
    email: '...', 
    isPremium: false, 
    meta: 'Geral', 
    foco: 'Corpo Todo',
    exerciciosConcluidos: 0
  });
  
  const [showEditModal, setShowEditModal] = useState(false);
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [showLogoutModal, setShowLogoutModal] = useState(false);
  
  const [editForm, setEditForm] = useState({ nome: '', email: '' });
  const [passForm, setPassForm] = useState({ atual: '', nova: '', confirmar: '' });
  
  const [showPassAtual, setShowPassAtual] = useState(false);
  const [showPassNova, setShowPassNova] = useState(false);

  const [toastMessage, setToastMessage] = useState('');
  const [toastType, setToastType] = useState('success'); 

  const { data, loading } = useQuery(GET_PROFILE_DATA, {
    fetchPolicy: 'network-only',
    onCompleted: (dados) => {
      if (dados.me) {
        setUserData({
          nome: dados.me.name,
          email: dados.me.email,
          isPremium: dados.me.isPremium || false,
          meta: dados.me.goal && dados.me.goal !== 'Não definido' ? dados.me.goal : 'Hipertrofia',
          foco: dados.me.focus && dados.me.focus !== 'Geral' ? `Foco: ${dados.me.focus.split('|')[0]}` : 'Foco Global',
          exerciciosConcluidos: dados.me.exercisesCompleted || 0
        });
      }
    }
  });

  const [updateUser, { loading: savingProfile }] = useMutation(UPDATE_USER, {
    onCompleted: (dadosCompletos) => {
      setUserData(prev => ({ ...prev, nome: dadosCompletos.updateUser.name, email: dadosCompletos.updateUser.email }));
      setShowEditModal(false);
      mostrarAviso("Perfil atualizado com sucesso!", "success");
    }
  });

  const mostrarAviso = (mensagem, tipo = 'success') => {
    setToastMessage(mensagem);
    setToastType(tipo);
    setTimeout(() => { setToastMessage(''); }, 3500);
  };

  const handleSaveProfile = () => {
    if(!editForm.nome || !editForm.email) return mostrarAviso("Preencha todos os campos.", "error");
    updateUser({ variables: { id: userId, name: editForm.nome, email: editForm.email } });
  };

  const handleSavePassword = async () => {
    if (!passForm.atual || !passForm.nova || !passForm.confirmar) {
      return mostrarAviso("Preencha todas as senhas.", "error");
    }
    if (passForm.nova !== passForm.confirmar) {
      return mostrarAviso("A nova senha e a confirmação não coincidem.", "error");
    }
    if (passForm.nova.length < 6) {
      return mostrarAviso("A nova senha deve ter no mínimo 6 caracteres.", "error");
    }

    try {
      const token = localStorage.getItem('evolv_token');
      const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8080';
      await axios.post(`${API_URL}/api/auth/change-password`, {
        userId,
        senhaAtual: passForm.atual,
        novaSenha: passForm.nova
      }, {
        headers: { Authorization: `Bearer ${token}` }
      });

      setShowPasswordModal(false);
      setPassForm({ atual: '', nova: '', confirmar: '' });
      mostrarAviso("Senha alterada com sucesso!", "success");
    } catch (err) {
      mostrarAviso(err.response?.data?.error || "Erro ao alterar senha. Verifique a sua senha atual.", "error");
    }
  };

  const confirmLogout = () => {
    localStorage.removeItem('evolv_token');
    localStorage.removeItem('evolv_userId');
    navigate('/');
  };

  const streak = data?.getUserStreak || 0;
  
  let totalVolumeKg = 0;
  if (data?.getUserWorkouts) {
    data.getUserWorkouts.forEach(workout => {
      workout.logs.forEach(log => {
        totalVolumeKg += (log.weight * log.reps * log.sets);
      });
    });
  }
  
  const volumeDisplay = totalVolumeKg > 1000 ? (totalVolumeKg / 1000).toFixed(1) : totalVolumeKg;
  const volumeUnit = totalVolumeKg > 1000 ? 'Ton' : 'kg';

  return (
    <div className="perfil-page fade-in">
    
      {toastMessage && (
        <div className={`toast-notification ${toastType === 'error' ? 'error-toast' : 'success-toast'}`}>
          {toastType === 'error' ? <AlertTriangle size={20} /> : <CheckCircle2 size={20} />}
          <span>{toastMessage}</span>
        </div>
      )}

      <header className="treino-header-modern">
        <div className="header-left">
          <span className="greeting">Painel de Controlo</span>
          <h1 className="page-title">O Meu Perfil</h1>
        </div>
        <div className="header-right">
          <div className="calendar-icon-btn" onClick={() => { setEditForm({ nome: userData.nome, email: userData.email }); setShowEditModal(true); }}>
            <Edit3 size={20} color="var(--evolv-green)" />
          </div>
        </div>
      </header>

      <div className="treino-content main-scroll">
        
        <div className="glass-card user-main-card">
          <div className={`user-avatar-large ${userData.isPremium ? 'premium-glow' : ''}`}>
            {loading ? '...' : userData.nome.charAt(0)}
          </div>
          <div className="user-main-info">
            <h2>{loading ? 'A carregar...' : userData.nome} {userData.isPremium && <Star size={18} color="#ffaa00" fill="#ffaa00" style={{marginLeft:'5px'}}/>}</h2>
            <p className="user-email">{loading ? '...' : userData.email}</p>
            <div className="user-badges">
              <span className="badge highlight-badge">{loading ? '...' : userData.meta}</span>
              <span className="badge">{loading ? '...' : userData.foco}</span>
            </div>
          </div>
        </div>

        <div className="quick-stats-row fade-in">
          <div className="glass-card q-stat">
            <span className="q-label">Treinos</span>
            <strong className="q-value">{loading ? '--' : userData.exerciciosConcluidos}</strong>
          </div>
          <div className="glass-card q-stat">
            <span className="q-label">Sequência</span>
            <strong className="q-value">{loading ? '--' : streak} <small>dias</small></strong>
          </div>
          <div className="glass-card q-stat">
            <span className="q-label">Volume</span>
            <strong className="q-value">{loading ? '--' : volumeDisplay} <small>{volumeUnit}</small></strong>
          </div>
        </div>

        {/* MENU DE DEFINIÇÕES E SEGURANÇA */}
        <div className="settings-section fade-in">
          <h4 className="section-title-sm">A Minha Conta</h4>
          <div className="glass-card settings-list">
            
            <div className="setting-item" onClick={() => mostrarAviso("O Plano Pro já está ativo!", "success")}>
              <div className="s-icon" style={{color: '#ffaa00'}}><Crown size={18} /></div>
              <span className="s-text">Plano Evolv Pro</span>
              <span className="s-status premium">Ativo</span>
              <ChevronRight size={18} color="var(--text-muted)" />
            </div>

            <div className="setting-item" onClick={() => setShowPasswordModal(true)}>
              <div className="s-icon" style={{color: '#ff4d4d'}}><Key size={18} /></div>
              <span className="s-text">Segurança e Senha</span>
              <ChevronRight size={18} color="var(--text-muted)" />
            </div>

          </div>
        </div>

        <button className="btn-logout outline-glow-danger" onClick={() => setShowLogoutModal(true)}>
          <LogOut size={20} /> TERMINAR SESSÃO
        </button>
        <div className="spacer"></div>
      </div>

      {showEditModal && (
        <div className="modal-overlay" onClick={() => setShowEditModal(false)}>
          <div className="data-input-modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header-pro">
              <h3>Editar Perfil</h3>
            </div>
            <div className="modal-body-pro">
              <div className="input-group-pro">
                <label>Nome Completo</label>
                <input type="text" value={editForm.nome} onChange={(e) => setEditForm({...editForm, nome: e.target.value})} />
              </div>
              <div className="input-group-pro">
                <label>Email</label>
                <input type="email" value={editForm.email} onChange={(e) => setEditForm({...editForm, email: e.target.value})} />
              </div>
            </div>
            <div className="modal-actions-pro">
              <button className="btn-cancel-modal-pro" onClick={() => setShowEditModal(false)}>CANCELAR</button>
              <button className="btn-save-data-pro" onClick={handleSaveProfile} disabled={savingProfile}>
                {savingProfile ? "A GUARDAR..." : "SALVAR"}
              </button>
            </div>
          </div>
        </div>
      )}

      {showPasswordModal && (
        <div className="modal-overlay" onClick={() => setShowPasswordModal(false)}>
          <div className="data-input-modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header-pro" style={{marginBottom: '15px'}}>
              <div className="m-icon-wrapper" style={{borderColor: '#ff4d4d', color: '#ff4d4d', background: 'rgba(255, 77, 77, 0.1)'}}>
                <Lock size={24} />
              </div>
              <h3>Alterar Senha</h3>
            </div>
            
            <div className="modal-body-pro">
              <div className="input-group-pro">
                <label>Senha Atual</label>
                <div className="password-input-wrapper">
                  <input 
                    type={showPassAtual ? "text" : "password"} 
                    placeholder="Introduza a senha atual"
                    value={passForm.atual} 
                    onChange={(e) => setPassForm({...passForm, atual: e.target.value})} 
                  />
                  <button type="button" className="eye-btn" onClick={() => setShowPassAtual(!showPassAtual)}>
                    {showPassAtual ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                </div>
              </div>

              <div className="section-divider" style={{margin: '5px 0'}}></div>

              <div className="input-group-pro">
                <label>Nova Senha</label>
                <div className="password-input-wrapper">
                  <input 
                    type={showPassNova ? "text" : "password"} 
                    placeholder="Mínimo 6 caracteres"
                    value={passForm.nova} 
                    onChange={(e) => setPassForm({...passForm, nova: e.target.value})} 
                  />
                  <button type="button" className="eye-btn" onClick={() => setShowPassNova(!showPassNova)}>
                    {showPassNova ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                </div>
              </div>

              <div className="input-group-pro">
                <label>Confirmar Nova Senha</label>
                <div className="password-input-wrapper">
                  <input 
                    type={showPassNova ? "text" : "password"} 
                    placeholder="Repita a nova senha"
                    value={passForm.confirmar} 
                    onChange={(e) => setPassForm({...passForm, confirmar: e.target.value})} 
                  />
                </div>
              </div>

            </div>
            <div className="modal-actions-pro">
              <button className="btn-cancel-modal-pro" onClick={() => setShowPasswordModal(false)}>CANCELAR</button>
              <button className="btn-save-data-pro" onClick={handleSavePassword}>ATUALIZAR</button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL DE LOGOUT */}
      {showLogoutModal && (
        <div className="modal-overlay" onClick={() => setShowLogoutModal(false)}>
          <div className="delete-modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal-icon-wrapper-danger" style={{margin: '0 auto 20px', width: '65px', height: '65px', borderRadius: '50%', background: 'rgba(211, 47, 47, 0.15)', display: 'flex', justifyContent: 'center', alignItems: 'center', color: '#ff4d4d'}}>
              <AlertTriangle size={32} />
            </div>
            <h3 style={{color: '#fff', fontSize: '1.3rem', marginBottom: '10px', textAlign: 'center'}}>Terminar Sessão?</h3>
            <p style={{color: 'var(--text-muted)', fontSize: '0.9rem', marginBottom: '25px', textAlign: 'center'}}>Terá de introduzir as suas credenciais novamente para aceder ao plano de treino.</p>
            <div className="modal-actions-pro">
              <button className="btn-cancel-modal-pro" onClick={() => setShowLogoutModal(false)}>CANCELAR</button>
              <button className="btn-confirm-delete" onClick={confirmLogout} style={{flex: 1, padding: '16px', borderRadius: '14px', border: 'none', background: '#d32f2f', color: '#fff', fontWeight: '700'}}>SAIR</button>
            </div>
          </div>
        </div>
      )}
      <BottomNav />
    </div>
  );
}