import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { User, Lock, Share, Download, X } from 'lucide-react';
import axios from 'axios';
import GreenButton from '../components/GreenButton';
import '../styles/LoginPage.css';

export default function LoginPage() {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [erro, setErro] = useState('');
  const [loading, setLoading] = useState(false);

  const [keepConnected, setKeepConnected] = useState(false);
  const [deferredPrompt, setDeferredPrompt] = useState(null);
  const [isInstallable, setIsInstallable] = useState(false);
  const [showIOSPrompt, setShowIOSPrompt] = useState(false);

  useEffect(() => {
    const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent) && !window.MSStream;
    const isStandalone = window.matchMedia('(display-mode: standalone)').matches || window.navigator.standalone;

    if (isIOS && !isStandalone) {
      setShowIOSPrompt(true);
    }

    const handleBeforeInstallPrompt = (e) => {
      e.preventDefault();
      setDeferredPrompt(e);
      setIsInstallable(true);
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    return () => window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
  }, []);

  const handleInstallAndroid = async () => {
    if (!deferredPrompt) return;
    deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;
    if (outcome === 'accepted') setIsInstallable(false);
    setDeferredPrompt(null);
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    setErro('');
    setLoading(true);

    try {
      const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8080';
      const response = await axios.post(`${API_URL}/api/auth/login`, {
        email,
        password,
        keepConnected
      });

      localStorage.setItem('evolv_token', response.data.token);
      localStorage.setItem('evolv_userId', response.data.userId);
      navigate('/home');
    } catch (err) {
      setErro(err.response?.data?.error || 'Erro nas credenciais.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-page">
      <div className="overlay"></div>
      
      <div className="login-content fade-in">
        
        <div className="header-logo-section">
          <h1 className="evolv-logo">Evolv</h1>
          <p className="evolv-tagline">Treino Híbrido & Competição</p>
        </div>

        {showIOSPrompt && (
          <div className="pwa-install-banner ios-banner fade-in">
            <button className="close-pwa-btn" onClick={() => setShowIOSPrompt(false)}>
              <X size={16} color="rgba(255,255,255,0.4)" />
            </button>
            <div className="pwa-icon-wrapper">
              <Download size={24} color="var(--evolv-green, #3ab54a)" />
            </div>
            <div className="pwa-text-content">
              <strong>Instalar App Evolv</strong>
              <p>Clique em <Share size={12} style={{display:'inline', verticalAlign:'middle'}}/> e selecione <strong>Adicionar ao Ecrã Principal</strong>.</p>
            </div>
          </div>
        )}

        {isInstallable && (
          <div className="pwa-install-banner android-banner fade-in">
             <div className="pwa-icon-wrapper">
              <Download size={28} color="var(--evolv-green, #3ab54a)" />
            </div>
            <div className="pwa-text-content">
              <strong>Instalar App Evolv</strong>
              <p>Aceda aos seus treinos com um clique.</p>
            </div>
            <button className="btn-install-action" onClick={handleInstallAndroid}>
              <Download size={14} color="#000" /> INSTALAR
            </button>
          </div>
        )}

        <form className="login-form" onSubmit={handleLogin}>
          {erro && <div className="error-msg">{erro}</div>}
          
          <div className="input-group">
            <User className="input-icon" size={20} />
            <input type="email" placeholder="Email" value={email} onChange={(e) => setEmail(e.target.value)} required />
          </div>
          
          <div className="input-group">
            <Lock className="input-icon" size={20} />
            <input type="password" placeholder="Palavra-passe" value={password} onChange={(e) => setPassword(e.target.value)} required />
          </div>

          <div className="keep-connected-wrapper" onClick={() => setKeepConnected(!keepConnected)}>
            <div className={`modern-checkbox ${keepConnected ? 'checked' : ''}`}>
              {keepConnected && <CheckSquareModern />}
            </div>
            <span>Manter-me conectado por 30 dias</span>
          </div>

          <div className="button-container">
            <GreenButton text={loading ? "A autenticar..." : "ENTRAR"} type="submit" disabled={loading} />
          </div>

          <p className="login-link">
            Não tem conta? <span onClick={() => navigate('/register')}>Registre-se</span>
          </p>
        </form>

      </div>
    </div>
  );
}

const CheckSquareModern = () => (
  <svg width="12" height="10" viewBox="0 0 12 10" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M1 5L4.5 8.5L11 1.5" stroke="#000" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
  </svg>
);