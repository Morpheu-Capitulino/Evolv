import React, { useState, useEffect } from 'react';
import { 
  View, 
  Text, 
  TouchableOpacity, 
  StyleSheet, 
  ScrollView, 
  SafeAreaView, 
  Modal, 
  TextInput,
  ActivityIndicator,
  Platform
} from 'react-native';
import { useQuery, useMutation, gql } from '@apollo/client';
import { 
  TrendingUp, Activity, Scale, Percent, Plus, 
  Ruler, Target, ChevronUp, ChevronDown,
  Calendar, History, X, AlertTriangle, CheckCircle2, Zap, Trophy,
  RotateCcw
} from 'lucide-react-native';
import Svg, { Path, G, Rect, Line } from 'react-native-svg';

import BottomNav from '../../components/BottomNav'; 

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
  const [activeTab, setActiveTab] = useState('mapa');
  const [modelView, setModelView] = useState('frontal'); 
  const [showMedidasModal, setShowMedidasModal] = useState(false);
  const [showHistoryModal, setShowHistoryModal] = useState(false);
  
  const [comparativo, setComparativo] = useState(null);
  const [evolucaoTotal, setEvolucaoTotal] = useState(null);
  const [melhorMetrica, setMelhorMetrica] = useState(null);
  const [resumoIA, setResumoIA] = useState("");
  

  const [inputMedidas, setInputMedidas] = useState({ 
    peso: '', bf: '', altura: '', braco: '', cintura: '', coxa: '', quadril: '' 
  });

  const { data, loading, refetch } = useQuery(GET_MY_MEASUREMENTS, { fetchPolicy: 'network-only' });
  const [addMeasurement, { loading: saving }] = useMutation(ADD_BODY_MEASUREMENT, {
    onCompleted: () => { 
      refetch(); 
      setShowMedidasModal(false);
      setInputMedidas({ peso: '', bf: '', altura: '', braco: '', cintura: '', coxa: '', quadril: '' });
    }
  });

  useEffect(() => {
    if (data?.getMyMeasurements?.length > 0) {
      const m1 = data.getMyMeasurements[0]; 
      const m2 = data.getMyMeasurements[1]; 
      const primeiraAvaliacao = data.getMyMeasurements[data.getMyMeasurements.length - 1];

      const novoComparativo = {
        peso: calcularKPI(m1.weight, m2?.weight),
        bf: calcularKPI(m1.bodyFatPercentage, m2?.bodyFatPercentage),
        braco: calcularKPI(m1.arm, m2?.arm),
        waist: calcularKPI(m1.waist, m2?.waist),
        thigh: calcularKPI(m1.thigh, m2?.thigh),
        hip: calcularKPI(m1.hip, m2?.hip),
        dataUltima: new Date(m1.date).toLocaleDateString('pt-BR')
      };

      setComparativo(novoComparativo);

      if (data.getMyMeasurements.length > 1) {
        setEvolucaoTotal({
          peso: (m1.weight - primeiraAvaliacao.weight).toFixed(1),
          bf: (m1.bodyFatPercentage - primeiraAvaliacao.bodyFatPercentage).toFixed(1)
        });

        let melhor = null;
        let maxScore = -999;
        
        const metricas = [
          { nome: 'Braço', kpi: novoComparativo.braco, inverso: false },
          { nome: 'Coxa', kpi: novoComparativo.thigh, inverso: false },
          { nome: 'Quadril', kpi: novoComparativo.hip, inverso: false },
          { nome: 'Cintura', kpi: novoComparativo.waist, inverso: true },
          { nome: 'Gordura', kpi: novoComparativo.bf, inverso: true }
        ];

        metricas.forEach(m => {
          if (!m.kpi || m.kpi.primeiro) return;
          const valDiff = parseFloat(m.kpi.diff);
          const pontuacao = m.inverso ? (valDiff * -1) : valDiff;
          if (pontuacao > maxScore && pontuacao > 0) {
            maxScore = pontuacao;
            melhor = { nome: m.nome, valor: Math.abs(valDiff) };
          }
        });
        setMelhorMetrica(melhor);

        if (parseFloat(novoComparativo.bf.diff) < 0 && parseFloat(novoComparativo.peso.diff) < 0) {
          setResumoIA("🔥 Excelente! Está a queimar gordura e baixar o peso.");
        } else if (parseFloat(novoComparativo.braco.diff) > 0 || parseFloat(novoComparativo.thigh.diff) > 0) {
          setResumoIA("💪 Ótimo progresso! O seu volume muscular está a evoluir.");
        } else if (parseFloat(novoComparativo.waist.diff) > 0) {
          setResumoIA("⚠️ Atenção: Aumento detetado na cintura. Ajuste o cardio.");
        } else {
          setResumoIA("📊 Continue consistente para melhores resultados.");
        }
      }
    }
  }, [data]);

  const getStatus = (kpiData, inverso = false) => {
    if (!kpiData || kpiData.primeiro || parseFloat(kpiData.diff) === 0) return 2; 
    if (inverso) return kpiData.subiu ? 1 : 3; 
    return kpiData.subiu ? 3 : 1;
  };

  const musculosStatus = comparativo ? {
    peitoral: getStatus(comparativo.braco),
    deltoides: getStatus(comparativo.braco),
    biceps: getStatus(comparativo.braco),
    triceps: getStatus(comparativo.braco),
    dorsais: getStatus(comparativo.braco),
    trapezio: getStatus(comparativo.braco),
    abdominais: getStatus(comparativo.waist, true),
    lombar: getStatus(comparativo.waist, true),
    quadriceps: getStatus(comparativo.thigh),
    isquiotibiais: getStatus(comparativo.thigh),
    panturrilhas: getStatus(comparativo.thigh),
    gluteos: getStatus(comparativo.hip)
  } : {
    peitoral: 2, deltoides: 2, biceps: 2, abdominais: 2, quadriceps: 2,
    trapezio: 2, dorsais: 2, triceps: 2, lombar: 2, gluteos: 2, isquiotibiais: 2, panturrilhas: 2
  };

  const getStatusColor = (nivel) => {
    if (nivel === 1) return '#ff4d4d';
    if (nivel === 2) return '#ffaa00'; 
    return '#3ab54a';                
  };

  const nomesMusculos = {
    peitoral: 'Peitoral & Core', deltoides: 'Ombros', biceps: 'Bíceps Braquial', abdominais: 'Abdómen', quadriceps: 'Quadríceps',
    trapezio: 'Trapézio', dorsais: 'Dorsais (Costas)', triceps: 'Tríceps', lombar: 'Lombar', gluteos: 'Glúteos', isquiotibiais: 'Posterior da Coxa', panturrilhas: 'Panturrilhas'
  };

  const totalMusculos = Object.keys(musculosStatus).length;
  const musculosEmEvolucao = Object.values(musculosStatus).filter(v => v === 3).length;
  const scoreBase = Math.round((musculosEmEvolucao / totalMusculos) * 100) || 0;
  const bonusScore = (comparativo && parseFloat(comparativo.bf.diff) < 0) ? 10 : 0;
  const simetriaScore = Math.min(100, scoreBase + bonusScore);

  const handleSaveMedidas = () => {
    const parse = (val) => val === '' ? null : parseFloat(val.toString().replace(',', '.'));
    addMeasurement({
      variables: {
        weight: parse(inputMedidas.peso) || 0, 
        height: parse(inputMedidas.altura) || 0, 
        bodyFatPercentage: parse(inputMedidas.bf) || 0,
        arm: parse(inputMedidas.braco), 
        waist: parse(inputMedidas.cintura), 
        thigh: parse(inputMedidas.coxa), 
        hip: parse(inputMedidas.quadril)
      }
    });
  };

  const renderKPICard = (label, kpiData, unit, IconComponent, inverseColor = false) => {
    if (!kpiData) return null;
    const { valor, diff, percent, subiu, primeiro } = kpiData;
    const isPositiveTrend = inverseColor ? !subiu : subiu;
    
    return (
      <View style={styles.kpiCard}>
        <View style={styles.kpiHeader}>
          {IconComponent}
          <Text style={styles.kpiLabel}>{label}</Text>
        </View>
        <Text style={styles.kpiValue}>{valor || '-'} <Text style={styles.kpiUnit}>{unit}</Text></Text>
        
        {!primeiro && valor > 0 && (
          <View style={[styles.kpiBadge, isPositiveTrend ? styles.badgeUp : styles.badgeDown]}>
            {subiu ? <ChevronUp size={12} color={isPositiveTrend ? '#3ab54a' : '#ff4d4d'} /> : <ChevronDown size={12} color={isPositiveTrend ? '#3ab54a' : '#ff4d4d'} />}
            <Text style={[styles.badgeText, { color: isPositiveTrend ? '#3ab54a' : '#ff4d4d' }]}>
              {Math.abs(diff)}{unit} ({percent}%)
            </Text>
          </View>
        )}
      </View>
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* HEADER */}
      <View style={styles.header}>
        <View>
          <Text style={styles.headerSub}>Análise de Desempenho</Text>
          <Text style={styles.headerTitle}>Evolução Corporal</Text>
        </View>
        <TouchableOpacity onPress={() => setShowHistoryModal(true)}>
          <History size={24} color="#3ab54a" />
        </TouchableOpacity>
      </View>

      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        
        <View style={styles.tabs}>
          <TouchableOpacity style={[styles.tabBtn, activeTab === 'mapa' && styles.tabActive]} onPress={() => setActiveTab('mapa')}>
            <Text style={[styles.tabText, activeTab === 'mapa' && styles.tabTextActive]}>Análise IA</Text>
          </TouchableOpacity>
          <TouchableOpacity style={[styles.tabBtn, activeTab === 'medidas' && styles.tabActive]} onPress={() => setActiveTab('medidas')}>
            <Text style={[styles.tabText, activeTab === 'medidas' && styles.tabTextActive]}>Dados</Text>
          </TouchableOpacity>
        </View>

        {loading ? (
          <View style={{ marginTop: 50, alignItems: 'center' }}>
            <ActivityIndicator size="large" color="#3ab54a" />
            <Text style={{ color: '#3ab54a', marginTop: 15, fontWeight: 'bold' }}>Analisando progresso...</Text>
          </View>
        ) : (
          <>
            {activeTab === 'mapa' && (
              <View>
                {comparativo && (
                  <View style={styles.dateBadge}>
                    <Calendar size={14} color="#3ab54a" />
                    <Text style={styles.dateBadgeText}>Baseado na avaliação de: {comparativo.dataUltima}</Text>
                  </View>
                )}

                {resumoIA ? (
                  <View style={styles.aiCard}>
                    <Zap size={20} color="#3ab54a" />
                    <Text style={styles.aiText}>{resumoIA}</Text>
                  </View>
                ) : null}

                <View style={styles.modelControls}>
                  <Text style={{ color: '#fff', fontSize: 14 }}>
                    Visão: <Text style={{ color: '#3ab54a', fontWeight: 'bold' }}>{modelView === 'frontal' ? 'Frontal' : 'Posterior'}</Text>
                  </Text>
                  <TouchableOpacity style={styles.rotateBtn} onPress={() => setModelView(modelView === 'frontal' ? 'posterior' : 'frontal')}>
                    <RotateCcw size={16} color="#000" />
                    <Text style={styles.rotateBtnText}>GIRAR CORPO</Text>
                  </TouchableOpacity>
                </View>

                <View style={styles.scannerContainer}>
                  <Svg viewBox="0 0 200 400" width="180" height="360">
                    <Path d="M 90 20 C 85 15, 115 15, 110 20 C 115 25, 115 45, 100 50 C 85 45, 85 25, 90 20 Z" fill="rgba(255,255,255,0.1)" stroke="#333" />
                    <Path d="M 90 50 L 110 50 L 115 65 L 85 65 Z" fill="rgba(255,255,255,0.1)" stroke="#333" />

                    {modelView === 'frontal' ? (
                      <G>
        
                        <Path d="M 68 75 L 100 75 L 100 120 L 70 115 Z" fill={getStatusColor(musculosStatus.peitoral)} strokeOpacity="0.4" />
                        <Path d="M 132 75 L 100 75 L 100 120 L 130 115 Z" fill={getStatusColor(musculosStatus.peitoral)} strokeOpacity="0.4" />
                        
                        <Path d="M 65 75 Q 45 80, 52 105 L 70 110 Z" fill={getStatusColor(musculosStatus.deltoides)} />
                        <Path d="M 135 75 Q 155 80, 148 105 L 130 110 Z" fill={getStatusColor(musculosStatus.deltoides)} />
                                         
                        <Path d="M 49 105 Q 35 125, 45 150 L 58 150 L 68 110 Z" fill={getStatusColor(musculosStatus.biceps)} />
                        <Path d="M 151 105 Q 165 125, 155 150 L 142 150 L 132 110 Z" fill={getStatusColor(musculosStatus.biceps)} />
                        
                        <Rect x="78" y="125" width="44" height="60" rx="10" fill={getStatusColor(musculosStatus.abdominais)} />
                        <Line x1="100" y1="130" x2="100" y2="180" stroke="#111" strokeWidth="2" opacity="0.3" />
                        <Line x1="82" y1="145" x2="118" y2="145" stroke="#111" strokeWidth="2" opacity="0.3" />
                        <Line x1="82" y1="160" x2="118" y2="160" stroke="#111" strokeWidth="2" opacity="0.3" />
                        
                        <Path d="M 72 218 Q 55 250, 68 310 L 98 310 Q 102 250, 95 218 Z" fill={getStatusColor(musculosStatus.quadriceps)} />
                        <Path d="M 128 218 Q 145 250, 132 310 L 102 310 Q 98 250, 105 218 Z" fill={getStatusColor(musculosStatus.quadriceps)} />
                      </G>
                    ) : (
                      <G>
                        <Path d="M 85 65 L 115 65 L 128 85 L 100 110 L 72 85 Z" fill={getStatusColor(musculosStatus.trapezio)} />

                        <Path d="M 72 85 L 100 110 L 128 85 L 125 140 L 100 160 L 75 140 Z" fill={getStatusColor(musculosStatus.dorsais)} />
         
                        <Path d="M 49 105 Q 35 125, 45 150 L 58 150 L 68 110 Z" fill={getStatusColor(musculosStatus.triceps)} />
                        <Path d="M 151 105 Q 165 125, 155 150 L 142 150 L 132 110 Z" fill={getStatusColor(musculosStatus.triceps)} />
                 
                        <Path d="M 80 160 L 120 160 L 125 185 L 75 185 Z" fill={getStatusColor(musculosStatus.lombar)} />
                   
                        <Path d="M 72 185 L 128 185 C 140 215, 110 225, 100 220 C 90 225, 60 215, 72 185 Z" fill={getStatusColor(musculosStatus.gluteos)} />
                     
                        <Path d="M 75 220 Q 65 250, 70 310 L 95 310 Q 95 250, 100 220 Z" fill={getStatusColor(musculosStatus.isquiotibiais)} />
                        <Path d="M 125 220 Q 135 250, 130 310 L 105 310 Q 105 250, 100 220 Z" fill={getStatusColor(musculosStatus.isquiotibiais)} />
                 
                        <Path d="M 68 315 C 50 340, 65 370, 72 390 L 88 390 Q 95 340, 88 315 Z" fill={getStatusColor(musculosStatus.panturrilhas)} />
                        <Path d="M 132 315 C 150 340, 135 370, 128 390 L 112 390 Q 105 340, 112 315 Z" fill={getStatusColor(musculosStatus.panturrilhas)} />
                      </G>
                    )}
                    <Path d="M 45 152 L 35 200 L 48 200 L 58 152 M 155 152 L 165 200 L 152 200 L 142 152" fill="rgba(255,255,255,0.1)" stroke="#333" />
                  </Svg>
                </View>

                <View style={styles.legendCard}>
                  <View style={styles.legendItem}><View style={[styles.legendDot, { backgroundColor: '#3ab54a' }]} /><Text style={styles.legendText}>Hipertrofia</Text></View>
                  <View style={styles.legendItem}><View style={[styles.legendDot, { backgroundColor: '#ffaa00' }]} /><Text style={styles.legendText}>Manutenção</Text></View>
                  <View style={styles.legendItem}><View style={[styles.legendDot, { backgroundColor: '#ff4d4d' }]} /><Text style={styles.legendText}>Alerta/Perda</Text></View>
                </View>

                <View style={styles.scoreCard}>
                  <Text style={styles.scoreNumber}>{simetriaScore}%</Text>
                  <View style={{ flex: 1, marginLeft: 15 }}>
                    <Text style={styles.scoreTitle}>Score de Simetria Corporal</Text>
                    <Text style={styles.scoreSub}><CheckCircle2 size={12} color="#3ab54a" /> {musculosEmEvolucao} áreas evoluindo positivamente</Text>
                  </View>
                </View>
              </View>
            )}

            {activeTab === 'medidas' && (
              <View>
                {comparativo && (
                  <View style={styles.dateBadge}>
                    <Calendar size={14} color="#3ab54a" />
                    <Text style={styles.dateBadgeText}>Última avaliação: {comparativo.dataUltima}</Text>
                  </View>
                )}

                {comparativo ? (
                  <View style={styles.metricsGrid}>
                    {renderKPICard('Peso', comparativo.peso, 'kg', <Scale size={16} color="#8b92a5"/>, true)}
                    {renderKPICard('Gordura', comparativo.bf, '%', <Percent size={16} color="#8b92a5"/>, true)}
                    {renderKPICard('Braço', comparativo.braco, 'cm', <Activity size={16} color="#8b92a5"/>)}
                    {renderKPICard('Cintura', comparativo.waist, 'cm', <Target size={16} color="#8b92a5"/>, true)}
                    {renderKPICard('Coxa', comparativo.thigh, 'cm', <Ruler size={16} color="#8b92a5"/>)}
                    {renderKPICard('Quadril', comparativo.hip, 'cm', <TrendingUp size={16} color="#8b92a5"/>)}
                  </View>
                ) : (
                  <View style={styles.emptyState}>
                    <Text style={{ color: '#777', textAlign: 'center' }}>Ainda não tens medidas registadas. Adicione uma avaliação para ver a evolução!</Text>
                  </View>
                )}

                {data?.getMyMeasurements?.length > 0 && (
                  <View style={styles.historyListCard}>
                    <Text style={styles.historyListTitle}>Registo Recente</Text>
                    {data.getMyMeasurements.slice(0, 5).map(m => (
                      <View key={m.id} style={styles.historyListItem}>
                        <Text style={{ color: '#8b92a5' }}>{new Date(m.date).toLocaleDateString('pt-BR')}</Text>
                        <Text style={{ color: '#fff', fontWeight: 'bold' }}>{m.weight} kg</Text>
                      </View>
                    ))}
                  </View>
                )}
              </View>
            )}
          </>
        )}
        <View style={{ height: 120 }} />
      </ScrollView>

      <TouchableOpacity style={styles.fab} onPress={() => setShowMedidasModal(true)}>
        <Plus size={28} color="#000" />
      </TouchableOpacity>

      <Modal visible={showHistoryModal} transparent animationType="slide">
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
                <History size={18} color="#3ab54a" />
                <Text style={styles.modalTitle}>Histórico na Nuvem</Text>
              </View>
              <TouchableOpacity onPress={() => setShowHistoryModal(false)}><X size={24} color="#fff" /></TouchableOpacity>
            </View>
            
            <ScrollView showsVerticalScrollIndicator={false}>
              {data?.getMyMeasurements?.length > 0 ? data.getMyMeasurements.map(m => (
                <View key={m.id} style={styles.historyItem}>
                  <Text style={{ color: '#fff', fontWeight: 'bold', fontSize: 16 }}>{new Date(m.date).toLocaleDateString('pt-BR')}</Text>
                  <Text style={{ color: '#3ab54a', marginTop: 4 }}>Peso: {m.weight}kg | Gordura: {m.bodyFatPercentage}%</Text>
                  <Text style={{ color: '#8b92a5', fontSize: 12, marginTop: 4 }}>Braço: {m.arm || '-'}cm | Cintura: {m.waist || '-'}cm</Text>
                </View>
              )) : (
                <Text style={{ textAlign: 'center', color: '#777', marginTop: 20 }}>Nenhum registo no histórico.</Text>
              )}
            </ScrollView>
          </View>
        </View>
      </Modal>

      <Modal visible={showMedidasModal} transparent animationType="fade">
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={[styles.modalTitle, { marginBottom: 20 }]}>Adicionar Medidas</Text>
            
            <View style={styles.inputRow}>
              <View style={styles.inputBox}><Text style={styles.inputLabel}>Peso (kg)</Text><TextInput style={styles.input} keyboardType="numeric" placeholder="80.5" placeholderTextColor="#555" onChangeText={(v) => setInputMedidas({...inputMedidas, peso: v})} /></View>
              <View style={styles.inputBox}><Text style={styles.inputLabel}>BF (%)</Text><TextInput style={styles.input} keyboardType="numeric" placeholder="15" placeholderTextColor="#555" onChangeText={(v) => setInputMedidas({...inputMedidas, bf: v})} /></View>
            </View>

            <View style={styles.inputRow}>
              <View style={styles.inputBox}><Text style={styles.inputLabel}>Alt (m)</Text><TextInput style={styles.input} keyboardType="numeric" placeholder="1.75" placeholderTextColor="#555" onChangeText={(v) => setInputMedidas({...inputMedidas, altura: v})} /></View>
              <View style={styles.inputBox}><Text style={styles.inputLabel}>Cintura (cm)</Text><TextInput style={styles.input} keyboardType="numeric" placeholder="-" placeholderTextColor="#555" onChangeText={(v) => setInputMedidas({...inputMedidas, cintura: v})} /></View>
            </View>

            <View style={styles.inputRow}>
              <View style={styles.inputBox}><Text style={styles.inputLabel}>Braço (cm)</Text><TextInput style={styles.input} keyboardType="numeric" placeholder="-" placeholderTextColor="#555" onChangeText={(v) => setInputMedidas({...inputMedidas, braco: v})} /></View>
              <View style={styles.inputBox}><Text style={styles.inputLabel}>Coxa (cm)</Text><TextInput style={styles.input} keyboardType="numeric" placeholder="-" placeholderTextColor="#555" onChangeText={(v) => setInputMedidas({...inputMedidas, coxa: v})} /></View>
            </View>

            <View style={styles.modalActions}>
              <TouchableOpacity style={styles.cancelBtn} onPress={() => setShowMedidasModal(false)}>
                <Text style={styles.cancelBtnText}>CANCELAR</Text>
              </TouchableOpacity>
              <TouchableOpacity style={[styles.saveBtn, saving && {opacity: 0.7}]} onPress={handleSaveMedidas} disabled={saving}>
                <Text style={styles.saveBtnText}>{saving ? "A GUARDAR..." : "SALVAR NA NUVEM"}</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      <BottomNav />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#090b0f' },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: 20, paddingTop: Platform.OS === 'android' ? 40 : 20 },
  headerSub: { color: '#8b92a5', fontSize: 13, textTransform: 'uppercase', fontWeight: 'bold' },
  headerTitle: { color: '#fff', fontSize: 28, fontWeight: '800' },
  content: { padding: 20 },
  
  // Tabs
  tabs: { flexDirection: 'row', backgroundColor: 'rgba(255,255,255,0.05)', borderRadius: 12, padding: 5, marginBottom: 20 },
  tabBtn: { flex: 1, padding: 12, alignItems: 'center', borderRadius: 8 },
  tabActive: { backgroundColor: 'rgba(58,181,74,0.15)' },
  tabText: { color: '#8b92a5', fontWeight: 'bold' },
  tabTextActive: { color: '#3ab54a' },

  // Alerts e Badges
  dateBadge: { flexDirection: 'row', alignItems: 'center', gap: 8, backgroundColor: 'rgba(58,181,74,0.1)', alignSelf: 'flex-start', paddingHorizontal: 15, paddingVertical: 8, borderRadius: 20, marginBottom: 20, borderWidth: 1, borderColor: 'rgba(58,181,74,0.2)' },
  dateBadgeText: { color: '#3ab54a', fontSize: 12, fontWeight: 'bold' },
  aiCard: { flexDirection: 'row', alignItems: 'center', backgroundColor: 'rgba(58,181,74,0.08)', padding: 15, borderRadius: 12, borderLeftWidth: 4, borderLeftColor: '#3ab54a', marginBottom: 15 },
  aiText: { color: '#fff', marginLeft: 10, flex: 1, fontSize: 14, fontWeight: '500', lineHeight: 20 },
  dangerCard: { flexDirection: 'row', alignItems: 'center', backgroundColor: 'rgba(255,77,77,0.1)', padding: 15, borderRadius: 12, borderLeftWidth: 4, borderLeftColor: '#ff4d4d', marginBottom: 15 },
  dangerText: { color: '#fff', marginLeft: 10, flex: 1, fontSize: 13 },
  trophyCard: { flexDirection: 'row', alignItems: 'center', backgroundColor: 'rgba(255,170,0,0.08)', padding: 15, borderRadius: 12, borderWidth: 1, borderColor: 'rgba(255,170,0,0.3)', marginBottom: 15 },
  trophyLabel: { color: '#ffaa00', fontSize: 11, fontWeight: 'bold' },
  trophyValue: { color: '#fff', fontSize: 16, fontWeight: 'bold', marginTop: 2 },

  // Evolução Total 
  totalBox: { flex: 1, backgroundColor: 'rgba(255,255,255,0.03)', padding: 15, borderRadius: 12, alignItems: 'center', borderWidth: 1, borderColor: 'rgba(255,255,255,0.05)' },
  totalLabel: { color: '#8b92a5', fontSize: 10, fontWeight: 'bold', marginBottom: 5 },
  totalValue: { fontSize: 18, fontWeight: '800' },

  // Score
  scoreCard: { flexDirection: 'row', alignItems: 'center', backgroundColor: 'rgba(25,28,32,0.5)', padding: 20, borderRadius: 16, borderWidth: 1, borderColor: 'rgba(255,255,255,0.08)', marginBottom: 20 },
  scoreNumber: { fontSize: 36, fontWeight: '900', color: '#fff' },
  scoreTitle: { color: '#fff', fontWeight: 'bold', fontSize: 15 },
  scoreSub: { color: '#8b92a5', fontSize: 12, marginTop: 4 },

  // BONECO E CONTROLES
  modelControls: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 15 },
  rotateBtn: { flexDirection: 'row', alignItems: 'center', gap: 6, backgroundColor: '#3ab54a', paddingHorizontal: 12, paddingVertical: 8, borderRadius: 8 },
  rotateBtnText: { color: '#000', fontSize: 12, fontWeight: 'bold' },
  scannerContainer: { backgroundColor: 'rgba(255,255,255,0.02)', borderRadius: 16, borderWidth: 1, borderColor: 'rgba(255,255,255,0.05)', padding: 20, alignItems: 'center', marginBottom: 15 },
  
  // LEGENDA DO BONECO
  legendCard: { flexDirection: 'row', justifyContent: 'space-around', backgroundColor: 'rgba(255,255,255,0.03)', borderRadius: 12, padding: 15, marginBottom: 20, borderWidth: 1, borderColor: 'rgba(255,255,255,0.05)' },
  legendItem: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  legendDot: { width: 10, height: 10, borderRadius: 5 },
  legendText: { color: '#fff', fontSize: 12 },

  // KPIs (Aba Medidas)
  metricsGrid: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-between' },
  kpiCard: { width: '48%', backgroundColor: 'rgba(255,255,255,0.03)', padding: 15, borderRadius: 16, borderWidth: 1, borderColor: 'rgba(255,255,255,0.08)', marginBottom: 12, alignItems: 'center' },
  kpiHeader: { flexDirection: 'row', alignItems: 'center', gap: 6, marginBottom: 10 },
  kpiLabel: { color: '#8b92a5', fontSize: 11, fontWeight: 'bold', textTransform: 'uppercase' },
  kpiValue: { color: '#fff', fontSize: 24, fontWeight: '900' },
  kpiUnit: { fontSize: 14, color: '#8b92a5', fontWeight: 'normal' },
  kpiBadge: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 6, paddingVertical: 4, borderRadius: 6, marginTop: 8 },
  badgeUp: { backgroundColor: 'rgba(58,181,74,0.1)' },
  badgeDown: { backgroundColor: 'rgba(255,77,77,0.1)' },
  badgeText: { fontSize: 10, fontWeight: 'bold', marginLeft: 2 },
  emptyState: { padding: 30, backgroundColor: 'rgba(255,255,255,0.02)', borderRadius: 16, borderWidth: 1, borderColor: 'rgba(255,255,255,0.05)' },

  // Lista de Histórico Recente (Aba Medidas)
  historyListCard: { backgroundColor: 'rgba(255,255,255,0.03)', padding: 15, borderRadius: 16, marginTop: 10 },
  historyListTitle: { color: '#fff', fontWeight: 'bold', marginBottom: 15 },
  historyListItem: { flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 10, borderBottomWidth: 1, borderBottomColor: 'rgba(255,255,255,0.05)' },

  // FAB
  fab: { position: 'absolute', bottom: 95, right: 20, width: 60, height: 60, borderRadius: 30, backgroundColor: '#3ab54a', justifyContent: 'center', alignItems: 'center', zIndex: 50, elevation: 5, shadowColor: '#3ab54a', shadowOffset: {width: 0, height: 4}, shadowOpacity: 0.4, shadowRadius: 10 },

  // Modais
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.85)', justifyContent: 'center', padding: 20 },
  modalContent: { backgroundColor: '#11151c', borderRadius: 24, padding: 25, borderWidth: 1, borderColor: 'rgba(255,255,255,0.1)', maxHeight: '80%' },
  modalHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 },
  modalTitle: { color: '#fff', fontSize: 18, fontWeight: '800' },
  historyItem: { padding: 15, backgroundColor: 'rgba(255,255,255,0.03)', borderRadius: 12, marginBottom: 10, borderLeftWidth: 3, borderLeftColor: '#3ab54a' },
  
  inputRow: { flexDirection: 'row', gap: 15, marginBottom: 15 },
  inputBox: { flex: 1 },
  inputLabel: { color: '#8b92a5', fontSize: 11, fontWeight: 'bold', marginBottom: 5, textTransform: 'uppercase' },
  input: { backgroundColor: 'rgba(0,0,0,0.3)', borderWidth: 1, borderColor: 'rgba(255,255,255,0.1)', borderRadius: 10, color: '#fff', padding: 12, fontSize: 16, fontWeight: 'bold' },
  modalActions: { flexDirection: 'row', gap: 10, marginTop: 20 },
  cancelBtn: { flex: 1, padding: 15, borderRadius: 12, borderWidth: 1, borderColor: 'rgba(255,255,255,0.1)', alignItems: 'center' },
  cancelBtnText: { color: '#fff', fontWeight: 'bold' },
  saveBtn: { flex: 1.5, padding: 15, borderRadius: 12, backgroundColor: '#3ab54a', alignItems: 'center' },
  saveBtnText: { color: '#000', fontWeight: '900' }
});