import React, { useState, useEffect } from 'react';
import { useQuery, useMutation, gql } from '@apollo/client';
import { 
  TrendingUp, Activity, Scale, Percent, Plus, 
  Ruler, Target, ChevronUp, ChevronDown,
  Calendar, History, X, RotateCcw, AlertTriangle, CheckCircle2
} from 'lucide-react';
import BottomNav from '../components/BottomNav';
import Header from '../components/Header';
import '../styles/ProgressoPage.css';

// ==========================================
// QUERIES E MUTATIONS (BANCO DE DADOS)
// ==========================================
const GET_MY_MEASUREMENTS = gql`
  query GetMyMeasurements { getMyMeasurements { id weight height bodyFatPercentage arm waist thigh hip date } }
`;

const ADD_BODY_MEASUREMENT = gql`
  mutation AddBodyMeasurement(
    $weight: Float!, $height: Float!, $bodyFatPercentage: Float!,
    $arm: Float, $waist: Float, $thigh: Float, $hip: Float
  ) {
    addBodyMeasurement(weight: $weight, height: $height, bodyFatPercentage: $bodyFatPercentage, arm: $arm, waist: $waist, thigh: $thigh, hip: $hip) { id weight }
  }
`;

// Função matemática para gerar a evolução percentual
const calcularKPI = (atual, anterior) => {
  if (!atual) return { valor: 0, diff: 0, percent: 0, subiu: false, primeiro: true };
  if (!anterior) return { valor: atual, diff: 0, percent: 0, subiu: false, primeiro: true };
  const diff = atual - anterior;
  const percent = ((Math.abs(diff) / anterior) * 100).toFixed(1);
  return { valor: atual, diff: diff.toFixed(1), percent: percent, subiu: diff > 0, primeiro: false };
};

export default function ProgressoPage() {
  const [activeTab, setActiveTab] = useState('mapa');
  const [modelView, setModelView] = useState('frontal'); 

  const [showMedidasModal, setShowMedidasModal] = useState(false);
  const [showHistoryModal, setShowHistoryModal] = useState(false);
  
  const [comparativo, setComparativo] = useState(null);
  const [inputMedidas, setInputMedidas] = useState({ peso: '', bf: '', altura: '', braco: '', cintura: '', coxa: '', quadril: '' });

  // Puxa os dados reais da Nuvem (MongoDB)
  const { data, loading, refetch } = useQuery(GET_MY_MEASUREMENTS, { fetchPolicy: 'network-only' });
  const [addMeasurement, { loading: saving }] = useMutation(ADD_BODY_MEASUREMENT, {
    onCompleted: () => { refetch(); setShowMedidasModal(false); }
  });

  // Atualiza as métricas sempre que a base de dados carregar
  useEffect(() => {
    if (data?.getMyMeasurements?.length > 0) {
      const m1 = data.getMyMeasurements[0]; // Avaliação mais recente
      const m2 = data.getMyMeasurements[1]; // Avaliação anterior

      setComparativo({
        peso: calcularKPI(m1.weight, m2?.weight),
        bf: calcularKPI(m1.bodyFatPercentage, m2?.bodyFatPercentage),
        braco: calcularKPI(m1.arm, m2?.arm),
        waist: calcularKPI(m1.waist, m2?.waist),
        thigh: calcularKPI(m1.thigh, m2?.thigh),
        hip: calcularKPI(m1.hip, m2?.hip),
        dataUltima: new Date(m1.date).toLocaleDateString('pt-BR')
      });
    }
  }, [data]);

  // =====================================================================
  // A MÁGICA: Conectar os centímetros reais (DB) às cores do SVG 3D
  // Nível 3 = Verde (Bom), Nível 2 = Laranja (Mantido), Nível 1 = Vermelho (Mau)
  // =====================================================================
  const getStatus = (kpiData, inverso = false) => {
    if (!kpiData || kpiData.primeiro || parseFloat(kpiData.diff) === 0) return 2; 
    if (inverso) return kpiData.subiu ? 1 : 3; // Cintura/Gordura: Subir é mau (Vermelho), Descer é bom (Verde)
    return kpiData.subiu ? 3 : 1; // Braço/Perna: Subir é bom (Verde), Descer é mau (Vermelho)
  };

  const musculosStatus = comparativo ? {
    peitoral: getStatus(comparativo.braco),
    deltoides: getStatus(comparativo.braco),
    biceps: getStatus(comparativo.braco),
    triceps: getStatus(comparativo.braco),
    dorsais: getStatus(comparativo.braco),
    trapezio: getStatus(comparativo.braco),
    abdominais: getStatus(comparativo.waist, true), // Cintura (inverso)
    lombar: getStatus(comparativo.waist, true),     // Cintura (inverso)
    quadriceps: getStatus(comparativo.thigh),       // Coxa
    isquiotibiais: getStatus(comparativo.thigh),    // Coxa
    panturrilhas: getStatus(comparativo.thigh),     // Coxa
    gluteos: getStatus(comparativo.hip)             // Quadril
  } : {
    peitoral: 2, deltoides: 2, biceps: 2, abdominais: 2, quadriceps: 2,
    trapezio: 2, dorsais: 2, triceps: 2, lombar: 2, gluteos: 2, isquiotibiais: 2, panturrilhas: 2
  };

  const getStatusColor = (nivel) => {
    if (nivel === 1) return '#ff4d4d'; // Vermelho
    if (nivel === 2) return '#ffaa00'; // Laranja
    return 'var(--evolv-green)';       // Verde
  };

  const nomesMusculos = {
    peitoral: 'Peitoral & Core', deltoides: 'Ombros', biceps: 'Bíceps Braquial', abdominais: 'Abdómen', quadriceps: 'Quadríceps',
    trapezio: 'Trapézio', dorsais: 'Dorsais (Costas)', triceps: 'Tríceps', lombar: 'Lombar', gluteos: 'Glúteos', isquiotibiais: 'Posterior da Coxa', panturrilhas: 'Panturrilhas'
  };

  // Cálculos do Painel de Simetria
  const totalMusculos = Object.keys(musculosStatus).length;
  const musculosEmEvolucao = Object.values(musculosStatus).filter(v => v === 3).length;
  const simetriaScore = Math.round((musculosEmEvolucao / totalMusculos) * 100);

  // Guardar nova avaliação na Nuvem
  const handleSaveMedidas = () => {
    const parse = (val) => val === '' ? null : parseFloat(val.toString().replace(',', '.'));
    addMeasurement({
      variables: {
        weight: parse(inputMedidas.peso), height: parse(inputMedidas.altura), bodyFatPercentage: parse(inputMedidas.bf) || 0,
        arm: parse(inputMedidas.braco), waist: parse(inputMedidas.cintura), thigh: parse(inputMedidas.coxa), hip: parse(inputMedidas.quadril)
      }
    });
  };

  return (
    <div className="progresso-page fade-in">
      <header className="treino-header-modern">
        <div className="header-left">
          <span className="greeting">Análise de Desempenho</span>
          <h1 className="page-title">Evolução Corporal</h1>
        </div>
        <div className="header-right">
          <button className="calendar-icon-btn" onClick={() => setShowHistoryModal(true)} style={{background: 'transparent', border: 'none'}}>
            <History size={22} color="var(--evolv-green)" />
          </button>
        </div>
      </header>

      <div className="treino-content main-scroll">
        
        {/* TABS DE NAVEGAÇÃO */}
        <div className="workout-tabs" style={{marginBottom: '15px'}}>
          <button className={`tab-btn ${activeTab === 'mapa' ? 'active' : ''}`} onClick={() => setActiveTab('mapa')}>Mapa Muscular</button>
          <button className={`tab-btn ${activeTab === 'medidas' ? 'active' : ''}`} onClick={() => setActiveTab('medidas')}>Medidas & Índices</button>
        </div>

        {loading ? ( <div className="center-all" style={{marginTop: '50px'}}><Activity className="spin" color="var(--evolv-green)" size={40}/></div> ) : (
          <>
            {/* ============================================================== */}
            {/* ABA 1: MAPA MUSCULAR 3D INTERATIVO */}
            {/* ============================================================== */}
            {activeTab === 'mapa' && (
              <div className="fade-in">
                {comparativo && <div className="last-eval-badge" style={{marginBottom: '15px'}}><Calendar size={14} /><span>Baseado na avaliação de: <strong>{comparativo.dataUltima}</strong></span></div>}
                
                <div className="model-controls" style={{display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px'}}>
                  <span className="view-label" style={{color: '#fff', fontSize: '0.9rem'}}>Visão: <strong style={{color: 'var(--evolv-green)'}}>{modelView === 'frontal' ? 'Frontal' : 'Posterior'}</strong></span>
                  <button className="green-button" style={{padding: '8px 15px', fontSize: '0.8rem', width: 'auto'}} onClick={() => setModelView(modelView === 'frontal' ? 'posterior' : 'frontal')}>
                    <RotateCcw size={14} /> GIRAR CORPO
                  </button>
                </div>

                {/* O BONECO SVG */}
                <div className="scanner-container glass-card" style={{position: 'relative', display: 'flex', justifyContent: 'center', padding: '30px 0'}}>
                  <svg viewBox="0 0 200 400" className="human-model-svg" style={{width: '180px', height: '360px', filter: 'drop-shadow(0px 0px 15px rgba(0,0,0,0.5))'}}>
                    {/* Cabeça e Pescoço Base */}
                    <path d="M 90 20 C 85 15, 115 15, 110 20 C 115 25, 115 45, 100 50 C 85 45, 85 25, 90 20 Z" fill="rgba(255,255,255,0.1)" stroke="#333" />
                    <path d="M 90 50 L 110 50 L 115 65 L 85 65 Z" fill="rgba(255,255,255,0.1)" stroke="#333" />

                    {modelView === 'frontal' ? (
                      <g className="fade-in">
                        {/* Peitoral */}
                        <g className="body-part">
                          <path d="M 68 75 L 100 75 L 100 120 L 70 115 Z" fill={getStatusColor(musculosStatus.peitoral)} strokeOpacity="0.4" />
                          <path d="M 132 75 L 100 75 L 100 120 L 130 115 Z" fill={getStatusColor(musculosStatus.peitoral)} strokeOpacity="0.4" />
                        </g>
                        {/* Deltoides */}
                        <g className="body-part">
                          <path d="M 65 75 Q 45 80, 52 105 L 70 110 Z" fill={getStatusColor(musculosStatus.deltoides)} />
                          <path d="M 135 75 Q 155 80, 148 105 L 130 110 Z" fill={getStatusColor(musculosStatus.deltoides)} />
                        </g>
                        {/* Biceps */}
                        <g className="body-part">
                          <path d="M 49 105 Q 35 125, 45 150 L 58 150 L 68 110 Z" fill={getStatusColor(musculosStatus.biceps)} />
                          <path d="M 151 105 Q 165 125, 155 150 L 142 150 L 132 110 Z" fill={getStatusColor(musculosStatus.biceps)} />
                        </g>
                        {/* Abdominais */}
                        <g className="body-part">
                          <rect x="78" y="125" width="44" height="60" rx="10" fill={getStatusColor(musculosStatus.abdominais)} />
                          <line x1="100" y1="130" x2="100" y2="180" stroke="#111" strokeWidth="2" opacity="0.3" />
                          <line x1="82" y1="145" x2="118" y2="145" stroke="#111" strokeWidth="2" opacity="0.3" />
                          <line x1="82" y1="160" x2="118" y2="160" stroke="#111" strokeWidth="2" opacity="0.3" />
                        </g>
                        {/* Quadriceps */}
                        <g className="body-part">
                          <path d="M 72 218 Q 55 250, 68 310 L 98 310 Q 102 250, 95 218 Z" fill={getStatusColor(musculosStatus.quadriceps)} />
                          <path d="M 128 218 Q 145 250, 132 310 L 102 310 Q 98 250, 105 218 Z" fill={getStatusColor(musculosStatus.quadriceps)} />
                        </g>
                      </g>
                    ) : (
                      <g className="fade-in">
                        {/* Trapezio */}
                        <g className="body-part">
                          <path d="M 85 65 L 115 65 L 128 85 L 100 110 L 72 85 Z" fill={getStatusColor(musculosStatus.trapezio)} />
                        </g>
                        {/* Dorsais */}
                        <g className="body-part">
                          <path d="M 72 85 L 100 110 L 128 85 L 125 140 L 100 160 L 75 140 Z" fill={getStatusColor(musculosStatus.dorsais)} />
                        </g>
                        {/* Triceps */}
                        <g className="body-part">
                          <path d="M 49 105 Q 35 125, 45 150 L 58 150 L 68 110 Z" fill={getStatusColor(musculosStatus.triceps)} />
                          <path d="M 151 105 Q 165 125, 155 150 L 142 150 L 132 110 Z" fill={getStatusColor(musculosStatus.triceps)} />
                        </g>
                        {/* Lombar */}
                        <g className="body-part">
                          <path d="M 80 160 L 120 160 L 125 185 L 75 185 Z" fill={getStatusColor(musculosStatus.lombar)} />
                        </g>
                        {/* Gluteos */}
                        <g className="body-part">
                          <path d="M 72 185 L 128 185 C 140 215, 110 225, 100 220 C 90 225, 60 215, 72 185 Z" fill={getStatusColor(musculosStatus.gluteos)} />
                        </g>
                        {/* Isquiotibiais */}
                        <g className="body-part">
                          <path d="M 75 220 Q 65 250, 70 310 L 95 310 Q 95 250, 100 220 Z" fill={getStatusColor(musculosStatus.isquiotibiais)} />
                          <path d="M 125 220 Q 135 250, 130 310 L 105 310 Q 105 250, 100 220 Z" fill={getStatusColor(musculosStatus.isquiotibiais)} />
                        </g>
                        {/* Panturrilhas */}
                        <g className="body-part">
                          <path d="M 68 315 C 50 340, 65 370, 72 390 L 88 390 Q 95 340, 88 315 Z" fill={getStatusColor(musculosStatus.panturrilhas)} />
                          <path d="M 132 315 C 150 340, 135 370, 128 390 L 112 390 Q 105 340, 112 315 Z" fill={getStatusColor(musculosStatus.panturrilhas)} />
                        </g>
                      </g>
                    )}
                    {/* Antebraços Base */}
                    <path d="M 45 152 L 35 200 L 48 200 L 58 152 M 155 152 L 165 200 L 152 200 L 142 152" fill="rgba(255,255,255,0.1)" stroke="#333" />
                  </svg>
                </div>

                {/* LEGENDA E SCORE */}
                <div className="glass-card legend-card" style={{display: 'flex', justifyContent: 'space-around', padding: '15px', marginTop: '15px'}}>
                  <div style={{display: 'flex', alignItems: 'center', gap:'5px', fontSize:'0.8rem', color:'#fff'}}><div style={{width:'10px', height:'10px', borderRadius:'50%', background:'var(--evolv-green)'}}></div>Hipertrofia</div>
                  <div style={{display: 'flex', alignItems: 'center', gap:'5px', fontSize:'0.8rem', color:'#fff'}}><div style={{width:'10px', height:'10px', borderRadius:'50%', background:'#ffaa00'}}></div>Manutenção</div>
                  <div style={{display: 'flex', alignItems: 'center', gap:'5px', fontSize:'0.8rem', color:'#fff'}}><div style={{width:'10px', height:'10px', borderRadius:'50%', background:'#ff4d4d'}}></div>Alerta/Perda</div>
                </div>

                <div className="glass-card" style={{padding: '20px', marginTop: '15px', display: 'flex', alignItems: 'center', gap: '20px'}}>
                  <div className="score-circle" style={{position: 'relative', width: '80px', height: '80px'}}>
                    <svg viewBox="0 0 36 36" style={{width: '100%', height: '100%'}}>
                      <path d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" fill="none" stroke="rgba(255,255,255,0.1)" strokeWidth="3" />
                      <path d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" fill="none" stroke="var(--evolv-green)" strokeWidth="3" strokeDasharray={`${simetriaScore}, 100`} />
                    </svg>
                    <span style={{position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)', color: '#fff', fontWeight: 'bold'}}>{simetriaScore}%</span>
                  </div>
                  <div>
                    <h4 style={{margin: '0 0 5px 0', color: '#fff'}}>Score de Simetria Corporal</h4>
                    <p style={{margin: 0, fontSize: '0.85rem', color: 'var(--text-muted)'}}><CheckCircle2 size={14} color="var(--evolv-green)" style={{verticalAlign:'middle'}}/> {musculosEmEvolucao} áreas evoluindo positivamente</p>
                  </div>
                </div>

                <h3 className="section-title-sm mt-20" style={{marginTop: '25px', color: '#fff', fontSize: '1.1rem'}}>Diagnóstico Baseado nas Medidas</h3>
                <div className="diagnostico-list" style={{display: 'flex', flexDirection: 'column', gap: '10px'}}>
                  {Object.keys(musculosStatus).map(key => {
                    if (musculosStatus[key] === 3 && modelView === 'frontal') return (
                      <div key={key} className="glass-card" style={{borderLeft: '4px solid var(--evolv-green)', padding: '15px', display: 'flex', gap: '15px', alignItems: 'center'}}>
                        <TrendingUp size={24} color="var(--evolv-green)" />
                        <div><strong style={{color: '#fff', display: 'block'}}>{nomesMusculos[key]}</strong><span style={{fontSize: '0.85rem', color: 'var(--text-muted)'}}>As suas medidas registaram crescimento. O volume atual está perfeito.</span></div>
                      </div>
                    );
                    if (musculosStatus[key] === 1 && modelView === 'posterior') return (
                      <div key={key} className="glass-card" style={{borderLeft: '4px solid #ff4d4d', padding: '15px', display: 'flex', gap: '15px', alignItems: 'center'}}>
                        <AlertTriangle size={24} color="#ff4d4d" />
                        <div><strong style={{color: '#fff', display: 'block'}}>{nomesMusculos[key]}</strong><span style={{fontSize: '0.85rem', color: 'var(--text-muted)'}}>Estagnação ou perda detectada. A IA irá aumentar a carga no próximo treino.</span></div>
                      </div>
                    );
                    return null;
                  })}
                  {musculosEmEvolucao === 0 && <p style={{color: 'var(--text-muted)', textAlign: 'center'}}>Nenhuma mudança drástica registada entre as duas últimas avaliações.</p>}
                </div>
              </div>
            )}

            {/* ============================================================== */}
            {/* ABA 2: MEDIDAS BRUTAS E GRIDS (CÓDIGO ATUAL) */}
            {/* ============================================================== */}
            {activeTab === 'medidas' && (
              <div className="fade-in">
                {comparativo && <div className="last-eval-badge" style={{marginBottom: '15px'}}><Calendar size={14} /><span>Última avaliação: <strong>{comparativo.dataUltima}</strong></span></div>}

                <div className="metrics-grid-pro">
                  {comparativo ? (
                    <>
                      <KPICard label="Peso" data={comparativo.peso} unit="kg" icon={<Scale size={18} />} inverseColor />
                      <KPICard label="Gordura" data={comparativo.bf} unit="%" icon={<Percent size={18} />} inverseColor />
                      <KPICard label="Braço" data={comparativo.braco} unit="cm" icon={<Activity size={18} />} />
                      <KPICard label="Cintura" data={comparativo.waist} unit="cm" icon={<Target size={18} />} inverseColor />
                      <KPICard label="Coxa" data={comparativo.thigh} unit="cm" icon={<Ruler size={18} />} />
                      <KPICard label="Quadril" data={comparativo.hip} unit="cm" icon={<TrendingUp size={18} />} />
                    </>
                  ) : (
                     <div className="empty-state-pro" style={{gridColumn: '1 / -1'}}><p style={{color: 'var(--text-muted)'}}>Ainda não tens medidas registadas. Adiciona uma avaliação para ver a evolução!</p></div>
                  )}
                </div>
              </div>
            )}
          </>
        )}
        <div className="spacer"></div>
      </div>

      {/* BOTÃO FLUTUANTE (FAB) PARA NOVA AVALIAÇÃO */}
      <button 
        className="fab-add-measurement outline-glow" 
        onClick={() => setShowMedidasModal(true)}
        style={{ position: 'fixed', bottom: '90px', right: '20px', zIndex: 9999, width: '60px', height: '60px', borderRadius: '50%', background: 'var(--evolv-green)', display: 'flex', justifyContent: 'center', alignItems: 'center', border: 'none', boxShadow: '0 4px 15px rgba(58, 181, 74, 0.4)', cursor: 'pointer' }}
      >
        <Plus size={28} color="#000" />
      </button>

      {/* MODAL DE HISTÓRICO DA NUVEM */}
      {showHistoryModal && (
        <div className="modal-overlay" onClick={() => setShowHistoryModal(false)}>
          <div className="data-input-modal history-modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header-pro" style={{justifyContent: 'space-between'}}>
              <h3 style={{display: 'flex', alignItems: 'center', gap: '8px'}}><History size={18} color="var(--evolv-green)"/> Histórico na Nuvem</h3>
              <button className="icon-btn-close" onClick={() => setShowHistoryModal(false)}><X size={22} /></button>
            </div>
            <div className="modal-body-scroll main-scroll" style={{maxHeight: '60vh'}}>
              {data?.getMyMeasurements?.length > 0 ? data.getMyMeasurements.map(m => (
                <div key={m.id} className="glass-card history-item-card" style={{marginBottom: '10px', padding: '15px'}}>
                    <span className="h-date" style={{fontWeight: 'bold', color: '#fff'}}>{new Date(m.date).toLocaleDateString('pt-BR')}</span>
                    <div className="h-main-stats" style={{marginTop: '5px', color: 'var(--text-muted)', fontSize: '0.85rem'}}>
                      <span>Peso: {m.weight}kg | Gordura: {m.bodyFatPercentage}% | Braço: {m.arm}cm</span>
                    </div>
                </div>
              )) : <p style={{textAlign: 'center', color: 'var(--text-muted)'}}>Nenhum registo no histórico.</p>}
            </div>
          </div>
        </div>
      )}

      {/* MODAL DE INSERÇÃO DE MEDIDAS */}
      {showMedidasModal && (
        <div className="modal-overlay" onClick={() => setShowMedidasModal(false)}>
          <div className="data-input-modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header-pro"><h3>Medidas Corporais</h3></div>
            <div className="modal-body-pro">
              <div className="grid-3-col">
                <div className="input-group-pro"><label>Alt (m)</label><input type="number" step="0.01" placeholder="1.75" onChange={(e) => setInputMedidas({...inputMedidas, altura: e.target.value})} /></div>
                <div className="input-group-pro"><label>Peso (kg)</label><input type="number" step="0.1" placeholder="80.5" onChange={(e) => setInputMedidas({...inputMedidas, peso: e.target.value})} /></div>
                <div className="input-group-pro"><label>BF (%)</label><input type="number" step="0.1" placeholder="15" onChange={(e) => setInputMedidas({...inputMedidas, bf: e.target.value})} /></div>
              </div>
              <div className="section-divider"></div>
              <div className="grid-2-col">
                <div className="input-group-pro"><label>Braço (cm)</label><input type="number" placeholder="-" onChange={(e) => setInputMedidas({...inputMedidas, braco: e.target.value})} /></div>
                <div className="input-group-pro"><label>Cintura (cm)</label><input type="number" placeholder="-" onChange={(e) => setInputMedidas({...inputMedidas, cintura: e.target.value})} /></div>
                <div className="input-group-pro"><label>Coxa (cm)</label><input type="number" placeholder="-" onChange={(e) => setInputMedidas({...inputMedidas, coxa: e.target.value})} /></div>
                <div className="input-group-pro"><label>Quadril (cm)</label><input type="number" placeholder="-" onChange={(e) => setInputMedidas({...inputMedidas, quadril: e.target.value})} /></div>
              </div>
            </div>
            <div className="modal-actions-pro">
              <button className="btn-cancel-modal-pro" onClick={() => setShowMedidasModal(false)}>CANCELAR</button>
              <button className="btn-save-data-pro" onClick={handleSaveMedidas} disabled={saving}>{saving ? "A GUARDAR..." : "SALVAR NA NUVEM"}</button>
            </div>
          </div>
        </div>
      )}
      <BottomNav />
    </div>
  );
}

// Sub-Componente: Cartão de Indicadores
function KPICard({ label, data, unit, icon, inverseColor = false }) {
  const { valor, diff, percent, subiu, primeiro } = data;
  const isPositiveTrend = inverseColor ? !subiu : subiu;
  return (
    <div className="glass-card metric-box kpi-card-dynamic">
      <div className="kpi-icon-header">{icon}<span className="m-label">{label}</span></div>
      <div className="kpi-main-value"><strong className="m-value">{valor || '-'} <small>{unit}</small></strong></div>
      {!primeiro && valor > 0 && (
        <div className={`kpi-trend ${isPositiveTrend ? 'trend-up' : 'trend-down'}`}>
          {subiu ? <ChevronUp size={12} /> : <ChevronDown size={12} />}<span>{Math.abs(diff)}{unit} ({percent}%)</span>
        </div>
      )}
    </div>
  );
}