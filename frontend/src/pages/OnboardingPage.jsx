import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useMutation, gql } from '@apollo/client';
import { 
  Flame, Dumbbell, Activity, 
  ArrowRight, ArrowLeft, Target, 
  BrainCircuit, CheckCircle2, Ruler
} from 'lucide-react';
import '../styles/OnboardingPage.css';

const ADD_BODY_MEASUREMENT = gql`
  mutation AddBodyMeasurement(
    $weight: Float!, $height: Float!, $bodyFatPercentage: Float!,
    $arm: Float, $waist: Float, $thigh: Float, $hip: Float
  ) {
    addBodyMeasurement(
      weight: $weight, height: $height, bodyFatPercentage: $bodyFatPercentage,
      arm: $arm, waist: $waist, thigh: $thigh, hip: $hip
    ) { id }
  }
`;

const UPDATE_USER_ONBOARDING = gql`
  mutation UpdateUserOnboarding($id: ID!, $goal: String, $focus: String) {
    updateUser(id: $id, goal: $goal, focus: $focus) { id goal focus }
  }
`;

export default function OnboardingPage() {
  const navigate = useNavigate();
  const [step, setStep] = useState(1);
  const [isProcessing, setIsProcessing] = useState(false);
  
  const [respostas, setRespostas] = useState({
    objetivo: '', foco: '', peso: '', altura: '',
    bf: '', braco: '', cintura: '', coxa: ''
  });

  const [addMeasurement] = useMutation(ADD_BODY_MEASUREMENT);
  const [updateUser] = useMutation(UPDATE_USER_ONBOARDING);

  const handleSelect = (campo, valor) => {
    setRespostas({ ...respostas, [campo]: valor });
    setTimeout(() => setStep(step + 1), 300);
  };

  const handleFinish = async () => {
    if (!respostas.peso || !respostas.altura) {
      return alert("Peso e altura são obrigatórios para os cálculos base.");
    }

    setIsProcessing(true);
    const userId = localStorage.getItem('evolv_userId');
    const parseNum = (val) => val ? parseFloat(val.toString().replace(',', '.')) : 0;

    try {
      await addMeasurement({
        variables: {
          weight: parseNum(respostas.peso),
          height: parseNum(respostas.altura),
          bodyFatPercentage: parseNum(respostas.bf) || 15,
          arm: parseNum(respostas.braco),
          waist: parseNum(respostas.cintura),
          thigh: parseNum(respostas.coxa),
          hip: 0
        }
      });

      // Grava o objetivo e foco no perfil do utilizador
      await updateUser({
        variables: { id: userId, goal: respostas.objetivo, focus: respostas.foco }
      });

      setTimeout(() => navigate('/treino'), 3000);
    } catch (error) {
      alert("Erro ao salvar: " + error.message);
      setIsProcessing(false);
    }
  };

  if (isProcessing) {
    return (
      <div className="onboarding-page center-all fade-in">
        <div className="ai-processing-container">
          <BrainCircuit size={60} color="var(--evolv-green)" className="pulse-icon" />
          <h2 className="mt-20">A analisar biometria...</h2>
          <p>A Evolv AI está a cruzar o seu desejo de focar em <strong>{respostas.foco}</strong> com a realidade das suas medidas para montar a mescla perfeita.</p>
          <div className="progress-bar-bg mt-30" style={{width: '200px', height: '4px'}}>
            <div className="progress-bar-fill loading-bar-animation"></div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="onboarding-page fade-in">
      <div className="onboarding-header">
        {step > 1 ? <button className="back-btn" onClick={() => setStep(step - 1)}><ArrowLeft size={24} /></button> : <div style={{width: 24}}></div>}
        <div className="step-indicators">
          {[1,2,3,4].map(num => <div key={num} className={`step-dot ${step >= num ? 'active' : ''}`}></div>)}
        </div>
        <div style={{width: 24}}></div>
      </div>

      <div className="onboarding-content">
        {step === 1 && (
          <div className="step-container slide-left">
            <h1>Qual é a sua meta principal?</h1>
            <p>Isto dita a intensidade calórica do plano.</p>
            <div className="options-grid">
              <div className={`option-card ${respostas.objetivo === 'Emagrecimento' ? 'selected' : ''}`} onClick={() => handleSelect('objetivo', 'Emagrecimento')}>
                <Flame size={32} className="opt-icon" color="#ff4d4d" />
                <h3>Perder Gordura</h3><span>Definição e queima calórica</span>
              </div>
              <div className={`option-card ${respostas.objetivo === 'Hipertrofia' ? 'selected' : ''}`} onClick={() => handleSelect('objetivo', 'Hipertrofia')}>
                <Dumbbell size={32} className="opt-icon" color="var(--evolv-green)" />
                <h3>Ganhar Massa</h3><span>Foco em hipertrofia (Volume)</span>
              </div>
            </div>
          </div>
        )}

        {step === 2 && (
          <div className="step-container slide-left">
            <h1>Onde quer dar mais ênfase?</h1>
            <p>A IA usará isto como base para equilibrar com as suas medidas físicas.</p>
            <div className="options-grid">
              <div className={`option-card ${respostas.foco === 'Superiores' ? 'selected' : ''}`} onClick={() => handleSelect('foco', 'Superiores')}>
                <Target size={32} className="opt-icon" /><h3>Membros Superiores</h3><span>Peito, Costas e Braços</span>
              </div>
              <div className={`option-card ${respostas.foco === 'Inferiores' ? 'selected' : ''}`} onClick={() => handleSelect('foco', 'Inferiores')}>
                <Target size={32} className="opt-icon" /><h3>Membros Inferiores</h3><span>Pernas e Glúteos</span>
              </div>
              <div className={`option-card ${respostas.foco === 'Core' ? 'selected' : ''}`} onClick={() => handleSelect('foco', 'Core')}>
                <Target size={32} className="opt-icon" /><h3>Core / Abdómen</h3><span>Foco na secagem da barriga</span>
              </div>
            </div>
          </div>
        )}

        {step === 3 && (
          <div className="step-container slide-left">
            <h1>A sua estrutura base</h1>
            <div className="measurements-form">
              <div className="input-box-large"><label>Peso (kg)</label><input type="number" placeholder="Ex: 82.5" value={respostas.peso} onChange={(e) => setRespostas({...respostas, peso: e.target.value})} autoFocus/></div>
              <div className="input-box-large"><label>Altura (m)</label><input type="number" placeholder="Ex: 1.78" value={respostas.altura} onChange={(e) => setRespostas({...respostas, altura: e.target.value})}/></div>
              <div className="input-box-large"><label>Gordura Corporal - BF (%)</label><input type="number" placeholder="Ex: 15" value={respostas.bf} onChange={(e) => setRespostas({...respostas, bf: e.target.value})}/></div>
              <button className="green-button mt-30 btn-large" onClick={() => setStep(4)}>AVANÇAR <ArrowRight size={20} /></button>
            </div>
          </div>
        )}

        {step === 4 && (
          <div className="step-container slide-left">
            <h1>Diagnóstico Muscular</h1>
            <p>Estas medidas permitem à IA descobrir se os seus músculos estão proporcionais ao seu peso.</p>
            <div className="measurements-form">
              <div className="input-box-large"><label>Braço (cm)</label><input type="number" placeholder="Contraído" value={respostas.braco} onChange={(e) => setRespostas({...respostas, braco: e.target.value})} autoFocus/></div>
              <div className="input-box-large"><label>Coxa (cm)</label><input type="number" placeholder="Relaxada" value={respostas.coxa} onChange={(e) => setRespostas({...respostas, coxa: e.target.value})}/></div>
              <div className="input-box-large"><label>Cintura (cm)</label><input type="number" placeholder="Linha do umbigo" value={respostas.cintura} onChange={(e) => setRespostas({...respostas, cintura: e.target.value})}/></div>
              <button className="green-button mt-30 btn-large" onClick={handleFinish}><BrainCircuit size={20} /> GERAR TREINO HÍBRIDO</button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}