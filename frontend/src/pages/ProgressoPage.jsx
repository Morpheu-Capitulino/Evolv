import React, { useState, useEffect } from 'react';
import { useQuery, useMutation, gql } from '@apollo/client';
import { 
  TrendingUp, Activity, Scale, Percent, Plus, 
  Ruler, Target, ChevronUp, ChevronDown,
  Calendar, History, X
} from 'lucide-react';
import BottomNav from '../components/BottomNav';
import Header from '../components/Header';
import '../styles/ProgressoPage.css';

// ==========================================
// QUERIES E MUTATIONS
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

const calcularKPI = (atual, anterior) => {
  if (!atual) return { valor: 0, diff: 0, percent: 0, subiu: false, primeiro: true };
  if (!anterior) return { valor: atual, diff: 0, percent: 0, subiu: false, primeiro: true };
  const diff = atual - anterior;
  const percent = ((Math.abs(diff) / anterior) * 100).toFixed(1);
  return { valor: atual, diff: diff.toFixed(1), percent: percent, subiu: diff > 0, primeiro: false };
};

export default function ProgressoPage() {
  const [showMedidasModal, setShowMedidasModal] = useState(false);
  const [showHistoryModal, setShowHistoryModal] = useState(false);
  const [comparativo, setComparativo] = useState(null);
  
  const [inputMedidas, setInputMedidas] = useState({ peso: '', bf: '', altura: '', braco: '', cintura: '', coxa: '', quadril: '' });

  const { data, loading, refetch } = useQuery(GET_MY_MEASUREMENTS, { fetchPolicy: 'network-only' });
  const [addMeasurement, { loading: saving }] = useMutation(ADD_BODY_MEASUREMENT, {
    onCompleted: () => { refetch(); setShowMedidasModal(false); }
  });

  useEffect(() => {
    if (data?.getMyMeasurements?.length > 0) {
      const m1 = data.getMyMeasurements[0]; 
      const m2 = data.getMyMeasurements[1]; 

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
      <Header title="Evolução" subtitle="Análise Corporal" rightIcon={<History size={22} />} onRightIconClick={() => setShowHistoryModal(true)} />

      <div className="treino-content main-scroll">
        {loading ? ( <div className="center-all"><Activity className="spin"/></div> ) : (
          <div className="fade-in">
            {comparativo && (
              <div className="last-eval-badge"><Calendar size={14} /><span>Última avaliação: <strong>{comparativo.dataUltima}</strong></span></div>
            )}

            {/* MAPEAMENTO CORPORAL (O BONECO) */}
            {comparativo && (
              <div className="glass-card body-map-card" style={{position: 'relative', display: 'flex', justifyContent: 'center', padding: '30px 10px', marginTop: '15px'}}>
                <svg width="140" height="260" viewBox="0 0 100 220" style={{filter: 'drop-shadow(0px 0px 15px rgba(58, 181, 74, 0.4))'}}>
                  <circle cx="50" cy="25" r="16" fill="var(--evolv-green)" opacity="0.9"/>
                  <path d="M 30 50 Q 50 45 70 50 L 75 100 L 25 100 Z" fill="rgba(255,255,255,0.05)" stroke="var(--evolv-green)" strokeWidth="2"/>
                  <path d="M 25 55 L 10 110 M 75 55 L 90 110" stroke="var(--evolv-green)" strokeWidth="12" strokeLinecap="round" opacity="0.6"/>
                  <path d="M 35 100 L 30 200 M 65 100 L 70 200" stroke="var(--evolv-green)" strokeWidth="14" strokeLinecap="round" opacity="0.6"/>
                </svg>
                {/* Indicadores */}
                <div style={{position: 'absolute', top: '100px', left: '10%', background: 'rgba(0,0,0,0.7)', border: '1px solid var(--evolv-green)', padding: '4px 8px', borderRadius: '8px', fontSize: '0.8rem', color: '#fff'}}>Braço: {comparativo.braco.valor || '-'}cm</div>
                <div style={{position: 'absolute', top: '150px', right: '10%', background: 'rgba(0,0,0,0.7)', border: '1px solid var(--evolv-green)', padding: '4px 8px', borderRadius: '8px', fontSize: '0.8rem', color: '#fff'}}>Coxa: {comparativo.thigh.valor || '-'}cm</div>
                <div style={{position: 'absolute', top: '90px', right: '25%', background: 'rgba(0,0,0,0.7)', border: '1px solid var(--evolv-green)', padding: '4px 8px', borderRadius: '8px', fontSize: '0.8rem', color: '#fff'}}>Cintura: {comparativo.waist.valor || '-'}cm</div>
              </div>
            )}

            <div className="metrics-grid-pro" style={{marginTop: '20px'}}>
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
                 <div className="empty-state-pro"><p style={{color: 'var(--text-muted)'}}>Ainda não tens medidas registadas.</p></div>
              )}
            </div>
          </div>
        )}
        <div className="spacer"></div>
      </div>

      <button 
        className="fab-add-measurement outline-glow" 
        onClick={() => setShowMedidasModal(true)}
        style={{
          position: 'fixed', 
          bottom: '90px', 
          right: '20px', 
          zIndex: 9999, 
          width: '60px', 
          height: '60px', 
          borderRadius: '50%', 
          background: 'var(--evolv-green)', 
          display: 'flex', 
          justifyContent: 'center', 
          alignItems: 'center', 
          border: 'none', 
          boxShadow: '0 4px 15px rgba(58, 181, 74, 0.4)',
          cursor: 'pointer'
        }}
      >
        <Plus size={28} color="#000" />
      </button>

      {/* MODAL DE HISTÓRICO */}
      {showHistoryModal && (
        <div className="modal-overlay" onClick={() => setShowHistoryModal(false)}>
          <div className="data-input-modal history-modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header-pro" style={{justifyContent: 'space-between'}}>
              <h3 style={{display: 'flex', alignItems: 'center', gap: '8px'}}><History size={18} color="var(--evolv-green)"/> Histórico</h3>
              <button className="icon-btn-close" onClick={() => setShowHistoryModal(false)}><X size={22} /></button>
            </div>
            <div className="modal-body-scroll main-scroll" style={{maxHeight: '60vh'}}>
              {data?.getMyMeasurements?.length > 0 ? data.getMyMeasurements.map(m => (
                <div key={m.id} className="glass-card history-item-card" style={{marginBottom: '10px', padding: '15px'}}>
                    <span className="h-date" style={{fontWeight: 'bold', color: '#fff'}}>{new Date(m.date).toLocaleDateString('pt-BR')}</span>
                    <div className="h-main-stats" style={{marginTop: '5px', color: 'var(--text-muted)'}}>
                      <span>Peso: {m.weight}kg | Gordura: {m.bodyFatPercentage}%</span>
                    </div>
                </div>
              )) : <p style={{textAlign: 'center', color: 'var(--text-muted)'}}>Nenhum registo no histórico.</p>}
            </div>
          </div>
        </div>
      )}

      {/* MODAL DE ADICIONAR MEDIDAS */}
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
              <button className="btn-save-data-pro" onClick={handleSaveMedidas} disabled={saving}>{saving ? "A GUARDAR..." : "SALVAR"}</button>
            </div>
          </div>
        </div>
      )}
      <BottomNav />
    </div>
  );
}

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