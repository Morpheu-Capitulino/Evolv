import React, { useState } from 'react';
import { useQuery, useMutation, gql } from '@apollo/client';
import { Search, Trophy, UserPlus, Check, X, User as UserIcon, AlertTriangle, Eye, ArrowLeft, Dumbbell, Target } from 'lucide-react';
import BottomNav from '../components/BottomNav';
import '../styles/AmigosPage.css';

const GET_COMMUNITY_DATA = gql`
  query GetCommunityData {
    getAllUsers { id name exercisesCompleted goal focus }
    me { 
      id 
      friendIds 
      pendingRequestIds 
    }
  }
`;

const SEND_REQUEST = gql` mutation SendRequest($userId: ID!, $targetId: ID!) { sendFriendRequest(userId: $userId, targetId: $targetId) { id } } `;
const RESPOND_REQUEST = gql` mutation Respond($userId: ID!, $requesterId: ID!, $accept: Boolean!) { respondToRequest(userId: $userId, requesterId: $requesterId, accept: $accept) { id } } `;

export default function AmigosPage() {
  const userId = localStorage.getItem('evolv_userId');
  const [activeTab, setActiveTab] = useState('ranking');
  const [searchTerm, setSearchTerm] = useState('');
  
  const [showSearchModal, setShowSearchModal] = useState(false);
  const [viewingProfile, setViewingProfile] = useState(null);
  const [toastMessage, setToastMessage] = useState('');

  const { data, loading, refetch } = useQuery(GET_COMMUNITY_DATA, { fetchPolicy: 'network-only' });
  const [sendRequest] = useMutation(SEND_REQUEST);
  const [respond] = useMutation(RESPOND_REQUEST, { onCompleted: () => refetch() });

  const showToast = (msg) => { setToastMessage(msg); setTimeout(() => setToastMessage(''), 3500); };

  const meusAmigos = data?.me?.friendIds || [];
  const convitesPendentes = data?.me?.pendingRequestIds || [];

  const ranking = data?.getAllUsers 
    ? data.getAllUsers
        .filter(u => u.id === userId || meusAmigos.includes(u.id))
        .sort((a, b) => (b.exercisesCompleted || 0) - (a.exercisesCompleted || 0)) 
    : [];

  const solicitacoes = data?.getAllUsers?.filter(u => convitesPendentes.includes(u.id)) || [];

  const resultadosPesquisa = data?.getAllUsers
    ? data.getAllUsers.filter(u => 
        u.id !== userId && 
        !meusAmigos.includes(u.id) && 
        u.name.toLowerCase().includes(searchTerm.toLowerCase())
      )
    : [];

  const handleConvidar = (targetId) => {
    sendRequest({ variables: { userId, targetId } });
    showToast('Convite enviado com sucesso!');
    setViewingProfile(null);
    setShowSearchModal(false);
  };

  return (
    <div className="amigos-page fade-in" style={{position: 'relative'}}>
      
      {toastMessage && (
        <div className="toast-notification">
          <Check size={20} /><span>{toastMessage}</span>
        </div>
      )}

      <header className="treino-header-modern">
        <div className="header-left">
          <span className="greeting">Evolv Social</span>
          <h1 className="page-title">Clube Privado</h1>
        </div>
      </header>

      <div className="treino-content main-scroll">
        <div className="workout-tabs">
          <button className={`tab-btn ${activeTab === 'ranking' ? 'active' : ''}`} onClick={() => setActiveTab('ranking')}>Ranking Semanal</button>
          <button className={`tab-btn ${activeTab === 'requests' ? 'active' : ''}`} onClick={() => setActiveTab('requests')}>
            Solicitações {solicitacoes.length > 0 && <span className="badge-count">{solicitacoes.length}</span>}
          </button>
        </div>

        {activeTab === 'ranking' ? (
          <div className="ranking-list fade-in">
            {ranking.map((atleta, index) => (
              <div key={atleta.id} className={`glass-card ranking-item ${atleta.id === userId ? 'is-me' : ''}`}>
                <div className="rank-pos">{index + 1}º</div>
                <div className="avatar-sm" style={{flexShrink: 0}}>{atleta.name.charAt(0)}</div>
                
                <div className="rank-info" style={{ minWidth: 0, paddingRight: '10px' }}>
                  <strong style={{ wordBreak: 'break-word', display: 'block', lineHeight: '1.2', marginBottom: '3px' }}>{atleta.name}</strong>
                  <span>{atleta.exercisesCompleted || 0} exercícios feitos</span>
                </div>
                
                {index === 0 && <Trophy size={20} color="#ffaa00" style={{flexShrink: 0}} />}
              </div>
            ))}
          </div>
        ) : (
          <div className="requests-list fade-in">
            {solicitacoes.length === 0 ? (
              <p className="empty-msg">Nenhuma solicitação pendente.</p>
            ) : (
              solicitacoes.map(req => (
                <div key={req.id} className="glass-card request-item" style={{display: 'flex', justifyContent: 'space-between', padding: '15px', gap: '10px', alignItems: 'center'}}>
                  
                  <div className="user-info" style={{display: 'flex', gap: '10px', alignItems: 'center', flex: 1, minWidth: 0}}>
                    <UserIcon size={20} color="var(--evolv-green)" style={{flexShrink: 0}} />
                    <strong style={{ wordBreak: 'break-word', display: 'block', lineHeight: '1.2' }}>{req.name}</strong>
                  </div>

                  <div className="request-actions" style={{display: 'flex', gap: '10px', flexShrink: 0}}>
                    <button style={{background: 'var(--evolv-green)', border: 'none', borderRadius: '50%', width: '35px', height: '35px', display: 'flex', justifyContent: 'center', alignItems: 'center'}} onClick={() => respond({ variables: { userId, requesterId: req.id, accept: true } })}><Check size={18} color="#000"/></button>
                    <button style={{background: 'rgba(255, 77, 77, 0.1)', border: 'none', borderRadius: '50%', width: '35px', height: '35px', display: 'flex', justifyContent: 'center', alignItems: 'center'}} onClick={() => respond({ variables: { userId, requesterId: req.id, accept: false } })}><X size={18} color="#ff4d4d"/></button>
                  </div>
                </div>
              ))
            )}
          </div>
        )}
      </div>

      <button className="fab-add-workout outline-glow" onClick={() => setShowSearchModal(true)}>
        <UserPlus size={24} color="#000" />
      </button>

      {showSearchModal && (
        <div className="modal-overlay" onClick={() => { setShowSearchModal(false); setViewingProfile(null); }}>
          <div className="data-input-modal" onClick={e => e.stopPropagation()}>
            
            {viewingProfile ? (
              <div className="mini-profile-view fade-in">
                <button className="back-btn-modal" onClick={() => setViewingProfile(null)}>
                  <ArrowLeft size={20} /> Voltar à pesquisa
                </button>
                
                <div className="profile-header-center">
                  <div className="avatar-xl">{viewingProfile.name.charAt(0)}</div>
                  <h3 style={{
                    margin: '10px 0 5px', 
                    textAlign: 'center', 
                    lineHeight: '1.2',
                    wordBreak: 'break-word',
                    fontSize: viewingProfile.name.length > 18 ? '1.1rem' : '1.3rem' 
                  }}>
                    {viewingProfile.name}
                  </h3>
                  
                  <div className="user-badges" style={{justifyContent: 'center', marginBottom: '25px'}}>
                    <span className="badge highlight-badge">{viewingProfile.goal && viewingProfile.goal !== 'Não definido' ? viewingProfile.goal : 'Geral'}</span>
                    <span className="badge">{viewingProfile.focus && viewingProfile.focus !== 'Geral' ? viewingProfile.focus : 'Corpo Todo'}</span>
                  </div>
                </div>

                <div className="grid-2-col" style={{marginBottom: '25px'}}>
                  <div className="glass-card" style={{padding: '20px 10px', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '8px', background: 'rgba(0,0,0,0.3)', border: '1px solid var(--border-glass)', borderRadius: '16px'}}>
                    <Dumbbell size={26} color="var(--evolv-green)" />
                    <span style={{fontSize: '0.7rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '1px', fontWeight: '700'}}>Exercícios</span>
                    <strong style={{fontSize: '1.4rem', color: '#fff', fontWeight: '800', lineHeight: '1'}}>{viewingProfile.exercisesCompleted || 0}</strong>
                  </div>
                  
                  <div className="glass-card" style={{padding: '20px 10px', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '8px', background: 'rgba(0,0,0,0.3)', border: '1px solid var(--border-glass)', borderRadius: '16px'}}>
                    <Target size={26} color="#00d2ff" />
                    <span style={{fontSize: '0.7rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '1px', fontWeight: '700'}}>Nível</span>
                    <strong style={{fontSize: '1.1rem', color: '#fff', fontWeight: '800', lineHeight: '1', marginTop: '3px'}}>
                      {(viewingProfile.exercisesCompleted || 0) > 50 ? 'Avançado' : 'Iniciante'}
                    </strong>
                  </div>
                </div>

                <button className="green-button full-width" onClick={() => handleConvidar(viewingProfile.id)}>
                  <UserPlus size={20} /> ENVIAR CONVITE
                </button>
              </div>
            ) : (
              <div className="search-view fade-in">
                <h3 style={{marginBottom: '15px'}}>Pesquisar Atletas</h3>
                <div className="search-bar-pro" style={{marginBottom: '20px'}}>
                  <input 
                    style={{width: '100%', padding: '12px', borderRadius: '12px', background: 'rgba(0,0,0,0.3)', border: '1px solid var(--border-glass)', color: '#fff'}} 
                    type="text" 
                    placeholder="Escreva o nome do amigo..." 
                    onChange={e => setSearchTerm(e.target.value)} 
                    autoFocus
                  />
                </div>
                
                <div className="search-results" style={{display: 'flex', flexDirection: 'column', gap: '10px', maxHeight: '250px', overflowY: 'auto'}}>
                  {resultadosPesquisa.map(u => (
                    <div key={u.id} className="search-res-item" style={{display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '12px', background: 'rgba(255,255,255,0.05)', borderRadius: '12px', gap: '10px'}}>
                      
                      <span style={{fontWeight: '700', fontSize: '0.95rem', wordBreak: 'break-word', lineHeight: '1.2', flex: 1}}>{u.name}</span>
                      
                      <div style={{display: 'flex', gap: '8px', flexShrink: 0}}>
                        <button className="icon-btn-secondary" onClick={() => setViewingProfile(u)}>
                          <Eye size={18} color="var(--text-muted)" />
                        </button>
                        <button className="btn-invite" onClick={() => handleConvidar(u.id)}>
                          <UserPlus size={16} style={{marginRight: '5px'}}/> Convidar
                        </button>
                      </div>
                    </div>
                  ))}

                  {searchTerm && resultadosPesquisa.length === 0 && (
                    <p style={{textAlign: 'center', color: 'var(--text-muted)', fontSize: '0.9rem'}}>Nenhum atleta encontrado.</p>
                  )}
                </div>
              </div>
            )}

          </div>
        </div>
      )}
      <BottomNav />
    </div>
  );
}