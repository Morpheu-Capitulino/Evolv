import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { User, Lock, Dumbbell, Mail, ArrowLeft } from 'lucide-react';
import axios from 'axios';
import GreenButton from '../components/GreenButton';
import '../styles/RegisterPage.css';

export default function RegisterPage() {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({ name: '', email: '', password: '', confirmPassword: '' });
  const [erro, setErro] = useState('');
  const [sucesso, setSucesso] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleRegister = async (e) => {
    e.preventDefault();
    setErro('');
    
    if (formData.password !== formData.confirmPassword) {
      return setErro('As palavras-passe não coincidem.');
    }

    setLoading(true);

    try {
      await axios.post('http://localhost:8080/api/auth/register', {
        name: formData.name,
        email: formData.email,
        password: formData.password
      });

      setSucesso(true);
      setTimeout(() => navigate('/'), 2500);
      
    } catch (err) {
      setErro(err.response?.data?.error || 'Erro ao tentar criar a conta.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="register-page">
      <div className="overlay"></div>
      <div className="register-content fade-in">
        
        <button className="back-to-login" onClick={() => navigate('/')}>
          <ArrowLeft size={20} />
        </button>

        <h1 className="evolv-logo mini-logo-register">Criar Conta</h1>
        
        {sucesso ? (
          <div className="success-message">
            <Dumbbell size={40} color="var(--evolv-green)" />
            <h2>Conta criada!</h2>
            <p>A redirecionar para o login...</p>
          </div>
        ) : (
          <form className="register-form" onSubmit={handleRegister}>
            {erro && <div style={{ color: '#ff4d4d', marginBottom: '15px', textAlign: 'center', fontSize: '0.85rem', fontWeight: 'bold' }}>{erro}</div>}
            
            <div className="input-group">
              <User className="input-icon" size={20} />
              <input type="text" name="name" placeholder="Nome Completo" value={formData.name} onChange={handleChange} required />
            </div>

            <div className="input-group">
              <Mail className="input-icon" size={20} />
              <input type="email" name="email" placeholder="Email" value={formData.email} onChange={handleChange} required />
            </div>
            
            <div className="input-group">
              <Lock className="input-icon" size={20} />
              <input type="password" name="password" placeholder="Palavra-passe" value={formData.password} onChange={handleChange} required />
            </div>

            <div className="input-group">
              <Lock className="input-icon" size={20} />
              <input type="password" name="confirmPassword" placeholder="Confirmar Palavra-passe" value={formData.confirmPassword} onChange={handleChange} required />
            </div>
            
            <div className="button-container" style={{ marginTop: '10px' }}>
              <GreenButton text={loading ? "A processar..." : "Registar"} type="submit" disabled={loading} />
            </div>

            <p className="login-link">
              Já tem conta? <span onClick={() => navigate('/')}>Faça Login</span>
            </p>
          </form>
        )}
      </div>
    </div>
  );
}