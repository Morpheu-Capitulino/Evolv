import React, { useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, useNavigate, useLocation } from 'react-router-dom';
import { ApolloClient, InMemoryCache, ApolloProvider, createHttpLink, useQuery, gql } from '@apollo/client';
import { setContext } from '@apollo/client/link/context';

import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage'; 
import HomePage from './pages/HomePage';
import TreinoPage from './pages/TreinoPage';
import ExerciseDetail from './pages/ExerciseDetail';
import SeriesRecord from './pages/SeriesRecord'; 
import ProgressoPage from './pages/ProgressoPage';
import AmigosPage from './pages/AmigosPage';
import PerfilPage from './pages/PerfilPage';
import OnboardingPage from './pages/OnboardingPage';
import './styles/App.css';

const httpLink = createHttpLink({
  uri: import.meta.env.VITE_API_URL ? `${import.meta.env.VITE_API_URL}/graphql` : 'http://localhost:8080/graphql',
});

const authLink = setContext((_, { headers }) => {
  const token = localStorage.getItem('evolv_token');
  return {
    headers: {
      ...headers,
      authorization: token ? `Bearer ${token}` : "",
    }
  }
});

const client = new ApolloClient({
  link: authLink.concat(httpLink),
  cache: new InMemoryCache()
});

const VERIFY_TOKEN = gql`
  query VerifyToken {
    me { id }
  }
`;

function AppContent() {
  const navigate = useNavigate();
  const location = useLocation();
  const token = localStorage.getItem('evolv_token');
  
  const { error } = useQuery(VERIFY_TOKEN, {
    skip: !token, 
    fetchPolicy: 'network-only' 
  });

  useEffect(() => {
    if (location.pathname === '/' || location.pathname === '/register') return;

    if (!token || error) {
      console.log("Sessão inválida ou expirada. A redirecionar para Login...");
      localStorage.removeItem('evolv_token');
      localStorage.removeItem('evolv_userId');
      navigate('/'); 
    }
  }, [token, error, navigate, location.pathname]);

  return (
    <div className="mobile-container">
      <Routes>
        <Route path="/" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} /> 
        <Route path="/home" element={<HomePage />} />
        <Route path="/treino" element={<TreinoPage />} />
        
        <Route path="/detalhes" element={<ExerciseDetail />} />
        <Route path="/detalhes/:id" element={<ExerciseDetail />} />
        
        <Route path="/registro-serie" element={<SeriesRecord />} /> 
        <Route path="/registro-serie/:id" element={<SeriesRecord />} /> 

        <Route path="/onboarding" element={<OnboardingPage />} />
        
        <Route path="/progresso" element={<ProgressoPage />} />
        <Route path="/amigos" element={<AmigosPage />} />
        <Route path="/perfil" element={<PerfilPage />} />
      </Routes>
    </div>
  );
}

export default function App() {
  return (
    <ApolloProvider client={client}>
      <Router>
        <AppContent />
      </Router>
    </ApolloProvider>
  );
}