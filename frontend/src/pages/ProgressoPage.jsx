import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useQuery, useMutation, gql } from '@apollo/client';
import { 
  TrendingUp, Activity, Scale, Percent, Plus, 
  CheckCircle2, Ruler, Target, ChevronUp, ChevronDown,
  Calendar, History, BarChart2, Info, X
} from 'lucide-react';
import { 
  LineChart, Line, XAxis, YAxis, CartesianGrid, 
  Tooltip, ResponsiveContainer, AreaChart, Area 
} from 'recharts';
import BottomNav from '../components/BottomNav';
import Header from '../components/Header';
import '../styles/ProgressoPage.css';

// ==========================================
// QUERIES E MUTATIONS
// ==========================================
const GET_MY_MEASUREMENTS = gql`
  query GetMyMeasurements {
    getMyMeasurements { id weight height bodyFatPercentage arm waist thigh hip date }
  }
`;

const ADD_BODY_MEASUREMENT = gql`
  mutation AddBodyMeasurement(
    $weight: Float!, $height: Float!, $bodyFatPercentage: Float!,
    $arm: Float, $waist: Float, $thigh: Float, $hip: Float
  ) {
    addBodyMeasurement(
      weight: $weight, height: $height, bodyFatPercentage: $bodyFatPercentage,
      arm: $arm, waist: $waist, thigh: $thigh, hip: $hip
    ) { id weight }
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
  const [expandedHistoryId, setExpandedHistoryId] = useState(null);
  const [comparativo, setComparativo] = useState(null);
  const [chartData, setChartData] = useState([]);
  
  const [inputMedidas, setInputMedidas] = useState({ peso: '', bf: '', altura: '', braco: '', cintura: '', coxa: '', quadril: '' });

  const { data, loading, refetch } = useQuery(GET_MY_MEASUREMENTS, { fetchPolicy: 'network-only' });
  
  const [addMeasurement, { loading: saving }] = useMutation(ADD_BODY_MEASUREMENT, {
    onCompleted: () => {
      refetch();
      setShowMedidasModal(false);
      setInputMedidas({ peso: '', bf: '', altura: '', braco: '', cintura: '', coxa: '', quadril: '' });
    },
    onError: (err) => alert("Erro ao salvar: " + err.message)
  });

  useEffect(() => {
    if (data?.getMyMeasurements?.length >= 1) {
      const all = [...data.getMyMeasurements].reverse(); 
      const m1 = data.getMyMeasurements[0]; 
      const m2 = data.getMyMeasurements[1]; 

      setComparativo({
        peso: calcularKPI(m1.weight, m2?.weight),
        bf: calcularKPI(m1.bodyFatPercentage, m2?.bodyFatPercentage),
        braco: calcularKPI(m1.arm, m2?.arm),
        waist: calcularKPI(m1.waist, m2?.waist),
        thigh: calcularKPI(m1.thigh, m2?.thigh),
        hip: calcularKPI(m1.hip, m2?.hip),
        dataUltima: new Date(m1.date).toLocaleDateString('pt-BR', { day: '2-digit', month: 'short' })
      });

      const chartFormatted = all.map(m => ({
        data: new Date(m.date).toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' }),
        peso: m.weight,
        bf: m.bodyFatPercentage
      }));
      setChartData(chartFormatted);
    }
  }, [data]);

  const handleSaveMedidas = () => {
    const parse = (val) => val === '' ? null : parseFloat(val.toString().replace(',', '.'));
    if (!inputMedidas.peso || !inputMedidas.altura) return alert("Peso e Altura são obrigatórios.");

    addMeasurement({
      variables: {
        weight: parse(inputMedidas.peso), height: parse(inputMedidas.altura), bodyFatPercentage: parse(inputMedidas.bf) || 0,
        arm: parse(inputMedidas.braco), waist: parse(inputMedidas.cintura), thigh: parse(inputMedidas.coxa), hip: parse(inputMedidas.quadril)
      }
    });
  };

  return (
    <div className="progresso-page fade-in">
      <Header 
        title="Evolução" 
        subtitle="Análise de Composição" 
        rightIcon={<History size={22} color="var(--evolv-green)" />}
        onRightIconClick={() => setShowHistoryModal(true)}
      />

      <div className="treino-content main-scroll">
        {loading ? (
          <div className="loading-container"><Activity className="spin" style={{marginRight: '10px'}}/><span>A carregar dados...</span></div>
        ) : (
          <div className="fade-in">
            
            {comparativo && (
              <div className="last-eval-badge">
                <Calendar size={14} />
                <span>Última avaliação: <strong>{comparativo.dataUltima}</strong></span>
              </div>
            )}

            {chartData.length > 1 && (
              <div className="glass-card chart-card-pro">
                <div className="chart-header">
                  <BarChart2 size={16} color="var(--evolv-green)" />
                  <h3>Tendência de Peso</h3>
                </div>
                <div style={{ width: '100%', height: 150 }}>
                  <ResponsiveContainer>
                    <AreaChart data={chartData}>
                      <defs>
                        <linearGradient id="colorPeso" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="var(--evolv-green)" stopOpacity={0.4}/>
                          <stop offset="95%" stopColor="var(--evolv-green)" stopOpacity={0}/>
                        </linearGradient>
                      </defs>
                      <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" vertical={false} />
                      <XAxis dataKey="data" stroke="var(--text-muted)" fontSize={10} tickLine={false} axisLine={false} />
                      <Tooltip contentStyle={{ background: '#1a1a1a', border: '1px solid var(--border-glass)', borderRadius: '8px' }} itemStyle={{ color: '#fff' }} />
                      <Area type="monotone" dataKey="peso" stroke="var(--evolv-green)" fillOpacity={1} fill="url(#colorPeso)" strokeWidth={3} />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>
              </div>
            )}
            
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
                 <div className="empty-state-pro">
                   <Info size={32} color="var(--text-muted)" style={{marginBottom: '10px'}}/>
                   <p style={{color: 'var(--text-muted)'}}>Ainda não tens medidas registadas.</p>
                 </div>
              )}
            </div>
          </div>
        )}
        <div className="spacer"></div>
      </div>

      <button className="fab-add-measurement outline-glow" onClick={() => setShowMedidasModal(true)}>
        <Plus size={28} color="#000" />
      </button>

      {showHistoryModal && (
        <div className="modal-overlay" onClick={() => setShowHistoryModal(false)}>
          <div className="data-input-modal history-modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header-pro" style={{justifyContent: 'space-between'}}>
              <h3 style={{display: 'flex', alignItems: 'center', gap: '8px'}}><History size={18} color="var(--evolv-green)"/> Histórico</h3>
              <button className="icon-btn-close" onClick={() => setShowHistoryModal(false)}><X size={22} /></button>
            </div>
            
            <div className="modal-body-scroll main-scroll" style={{maxHeight: '60vh'}}>
              {data?.getMyMeasurements?.length > 0 ? data.getMyMeasurements.map(m => (
                <div key={m.id} className="glass-card history-item-card" onClick={() => setExpandedHistoryId(expandedHistoryId === m.id ? null : m.id)}>
                  
                  <div className="history-item-header">
                    {/* CORREÇÃO AQUI: Removido o parseInt e formatado para pt-BR */}
                    <span className="h-date">{new Date(m.date).toLocaleDateString('pt-BR')}</span>
                    <div className="h-main-stats">
                      <span>{m.weight}kg</span>
                      <span style={{color: 'var(--text-muted)'}}>|</span>
                      <span>{m.bodyFatPercentage}%</span>
                      <ChevronDown size={18} style={{transform: expandedHistoryId === m.id ? 'rotate(180deg)' : 'none', transition: '0.3s', color: 'var(--text-muted)'}}/>
                    </div>
                  </div>

                  {expandedHistoryId === m.id && (
                    <div className="history-item-details fade-in">
                      <div className="h-detail"><label>Braço</label><span>{m.arm ? `${m.arm} cm` : '-'}</span></div>
                      <div className="h-detail"><label>Cintura</label><span>{m.waist ? `${m.waist} cm` : '-'}</span></div>
                      <div className="h-detail"><label>Coxa</label><span>{m.thigh ? `${m.thigh} cm` : '-'}</span></div>
                      <div className="h-detail"><label>Quadril</label><span>{m.hip ? `${m.hip} cm` : '-'}</span></div>
                    </div>
                  )}

                </div>
              )) : <p style={{textAlign: 'center', color: 'var(--text-muted)'}}>Nenhum registo no histórico.</p>}
            </div>
          </div>
        </div>
      )}

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
  const trendClass = isPositiveTrend ? 'trend-up' : 'trend-down';

  return (
    <div className="glass-card metric-box kpi-card-dynamic">
      <div className="kpi-icon-header">{icon}<span className="m-label">{label}</span></div>
      <div className="kpi-main-value">
        <strong className="m-value">
          {valor || '-'} <small style={{ opacity: 0.5, fontSize: '0.7rem' }}>{unit}</small>
        </strong>
      </div>
      {!primeiro && valor > 0 && (
        <div className={`kpi-trend ${trendClass}`}>
          {subiu ? <ChevronUp size={12} /> : <ChevronDown size={12} />}
          <span>{Math.abs(diff)}{unit} ({percent}%)</span>
        </div>
      )}
    </div>
  );
}