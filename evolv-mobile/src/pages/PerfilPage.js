import React, { useState, useEffect } from 'react';
import { 
  View, Text, TouchableOpacity, StyleSheet, ScrollView, 
  SafeAreaView, Modal, TextInput, ActivityIndicator, Alert, Platform 
} from 'react-native';
import { 
  Star, LogOut, Edit3, Crown, ChevronRight, Key, TriangleAlert, Eye, EyeOff, Lock 
} from 'lucide-react-native';
import { useQuery, useMutation, gql } from '@apollo/client';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useNavigation } from '@react-navigation/native';
import axios from 'axios';

import BottomNav from '../../components/BottomNav'; 


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
    updateUser(name: $name, email: $email) { id name email }
  }
`;

export default function PerfilPage() {
  const navigation = useNavigation();

  const [userId, setUserId] = useState(null);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [showLogoutModal, setShowLogoutModal] = useState(false);
  
  // Formulários
  const [editForm, setEditForm] = useState({ nome: '', email: '' });
  const [passForm, setPassForm] = useState({ atual: '', nova: '', confirmar: '' });
  const [showPassAtual, setShowPassAtual] = useState(false);
  const [showPassNova, setShowPassNova] = useState(false);

  useEffect(() => {
    async function loadUserId() {
      const id = await AsyncStorage.getItem('evolv_userId');
      setUserId(id);
    }
    loadUserId();
  }, []);

  const { data, loading, refetch } = useQuery(GET_PROFILE_DATA, {
    fetchPolicy: 'cache-and-network',
    onCompleted: (dados) => {
      if (dados.me) {
        setEditForm({ nome: dados.me.name, email: dados.me.email });
      }
    }
  });

  const [updateUser, { loading: savingProfile }] = useMutation(UPDATE_USER, {
    onCompleted: () => {
      setShowEditModal(false);
      Alert.alert("Sucesso", "Perfil atualizado com sucesso!");
      refetch();
    },
    onError: (err) => {
      Alert.alert("Erro", "Falha ao atualizar perfil: " + err.message);
    }
  });

  const handleSaveProfile = () => {
    if (!editForm.nome || !editForm.email) {
      return Alert.alert("Aviso", "Preencha todos os campos.");
    }
    updateUser({ variables: { id: userId, name: editForm.nome, email: editForm.email } });
  };

  const handleSavePassword = async () => {
    if (!passForm.atual || !passForm.nova || !passForm.confirmar) {
      return Alert.alert("Aviso", "Preencha todas as senhas.");
    }
    if (passForm.nova !== passForm.confirmar) {
      return Alert.alert("Aviso", "A nova senha e a confirmação não coincidem.");
    }
    if (passForm.nova.length < 6) {
      return Alert.alert("Aviso", "A nova senha deve ter no mínimo 6 caracteres.");
    }

    try {
      const token = await AsyncStorage.getItem('evolv_token');
      const API_URL = process.env.EXPO_PUBLIC_API_URL || 'http://localhost:8080';
      
      await axios.post(`${API_URL}/api/auth/change-password`, {
        userId,
        senhaAtual: passForm.atual,
        novaSenha: passForm.nova
      }, {
        headers: { Authorization: `Bearer ${token}` }
      });

      setShowPasswordModal(false);
      setPassForm({ atual: '', nova: '', confirmar: '' });
      Alert.alert("Sucesso", "Senha alterada com sucesso!");
    } catch (err) {
      Alert.alert("Erro", err.response?.data?.error || "Erro ao alterar senha. Verifique a sua senha atual.");
    }
  };

  const confirmLogout = async () => {
    await AsyncStorage.removeItem('evolv_token');
    await AsyncStorage.removeItem('evolv_userId');
    
    navigation.reset({ index: 0, routes: [{ name: 'Login' }] }); 
  };

  const me = data?.me || {};
  const isPremium = me.isPremium || false;
  const userName = me.name || 'A carregar...';
  const userEmail = me.email || '...';
  const metaDisplay = me.goal && me.goal !== 'Não definido' ? me.goal : 'Geral';
  const focoDisplay = me.focus && me.focus !== 'Geral' ? me.focus.split('|')[0] : 'Corpo Todo';
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
    <SafeAreaView style={styles.container}>
      <View style={styles.headerRow}>
        <View style={styles.headerLeft}>
          <Text style={styles.headerSub}>Painel de Controlo</Text>
          <Text style={styles.headerTitle}>O Meu Perfil</Text>
        </View>
        <TouchableOpacity style={styles.iconBtn} onPress={() => setShowEditModal(true)}>
          <Edit3 size={20} color="#3ab54a" />
        </TouchableOpacity>
      </View>

      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        
        {loading ? (
          <ActivityIndicator size="large" color="#3ab54a" style={{ marginTop: 50 }} />
        ) : (
          <>
            <View style={styles.userCard}>
              <View style={[styles.avatar, isPremium && styles.avatarPremium]}>
                <Text style={[styles.avatarText, isPremium && {color: '#3ab54a'}]}>{userName.charAt(0).toUpperCase()}</Text>
              </View>
              <View style={{flex: 1}}>
                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6, marginBottom: 2 }}>
                  <Text style={styles.userName} numberOfLines={1}>{userName}</Text>
                  {isPremium && <Star size={16} color="#ffaa00" fill="#ffaa00" />}
                </View>
                <Text style={styles.userEmail}>{userEmail}</Text>
                
                <View style={{flexDirection: 'row', gap: 10, marginTop: 8}}>
                  <View style={[styles.badge, styles.badgeGreen]}><Text style={styles.badgeTextGreen}>{metaDisplay}</Text></View>
                  <View style={styles.badge}><Text style={styles.badgeText}>{focoDisplay}</Text></View>
                </View>
              </View>
            </View>

            <View style={styles.statsRow}>
              <View style={styles.statBox}>
                <Text style={styles.statLabel}>Treinos</Text>
                <Text style={styles.statValue}>{me.exercisesCompleted || 0}</Text>
              </View>
              <View style={styles.statBox}>
                <Text style={styles.statLabel}>Sequência</Text>
                <Text style={styles.statValue}>{streak} <Text style={{fontSize: 12, color: '#8b92a5', fontWeight: 'bold'}}>dias</Text></Text>
              </View>
              <View style={styles.statBox}>
                <Text style={styles.statLabel}>Volume</Text>
                <Text style={styles.statValue}>{volumeDisplay} <Text style={{fontSize: 12, color: '#8b92a5', fontWeight: 'bold'}}>{volumeUnit}</Text></Text>
              </View>
            </View>

            <Text style={styles.sectionTitle}>A Minha Conta</Text>
            <View style={styles.settingsCard}>
              <TouchableOpacity style={styles.settingItem} onPress={() => Alert.alert("Info", "Plano Pro Ativo!")}>
                <View style={[styles.iconBox, {backgroundColor: 'rgba(255,170,0,0.1)'}]}><Crown size={18} color="#ffaa00" /></View>
                <Text style={styles.settingText}>Plano Evolv Pro</Text>
                <View style={styles.statusPro}><Text style={{color: '#ffaa00', fontSize: 12, fontWeight: 'bold'}}>Ativo</Text></View>
                <ChevronRight size={18} color="#8b92a5" />
              </TouchableOpacity>
              
              <TouchableOpacity style={[styles.settingItem, { borderBottomWidth: 0 }]} onPress={() => setShowPasswordModal(true)}>
                <View style={[styles.iconBox, {backgroundColor: 'rgba(255,77,77,0.1)'}]}><Key size={18} color="#ff4d4d" /></View>
                <Text style={styles.settingText}>Segurança e Senha</Text>
                <ChevronRight size={18} color="#8b92a5" />
              </TouchableOpacity>
            </View>

            <TouchableOpacity style={styles.logoutBtn} onPress={() => setShowLogoutModal(true)}>
              <LogOut size={20} color="#ff4d4d" /><Text style={styles.logoutText}>TERMINAR SESSÃO</Text>
            </TouchableOpacity>
          </>
        )}
        <View style={{ height: 100 }} />
      </ScrollView>

      <Modal visible={showEditModal} transparent animationType="fade">
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitleBase}>Editar Perfil</Text>
            
            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Nome Completo</Text>
              <TextInput style={styles.input} value={editForm.nome} onChangeText={(v) => setEditForm({...editForm, nome: v})} placeholderTextColor="#555" />
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Email</Text>
              <TextInput style={styles.input} value={editForm.email} onChangeText={(v) => setEditForm({...editForm, email: v})} keyboardType="email-address" autoCapitalize="none" placeholderTextColor="#555" />
            </View>

            <View style={styles.modalActions}>
              <TouchableOpacity style={styles.btnCancelBase} onPress={() => setShowEditModal(false)}>
                <Text style={styles.btnCancelText}>CANCELAR</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.btnSaveBase} onPress={handleSaveProfile} disabled={savingProfile}>
                <Text style={styles.btnSaveText}>{savingProfile ? 'A GUARDAR...' : 'SALVAR'}</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      <Modal visible={showPasswordModal} transparent animationType="slide">
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10, marginBottom: 20 }}>
              <View style={[styles.iconBox, {backgroundColor: 'rgba(255,77,77,0.1)', borderWidth: 1, borderColor: 'rgba(255,77,77,0.3)', width: 40, height: 40}]}><Lock size={20} color="#ff4d4d" /></View>
              <Text style={styles.modalTitleBase}>Alterar Senha</Text>
            </View>
            
            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Senha Atual</Text>
              <View style={styles.passInputWrapper}>
                <TextInput style={styles.passInput} secureTextEntry={!showPassAtual} value={passForm.atual} onChangeText={(v) => setPassForm({...passForm, atual: v})} placeholder="Introduza a senha atual" placeholderTextColor="#555" />
                <TouchableOpacity style={styles.eyeBtn} onPress={() => setShowPassAtual(!showPassAtual)}>
                  {showPassAtual ? <EyeOff size={20} color="#8b92a5"/> : <Eye size={20} color="#8b92a5"/>}
                </TouchableOpacity>
              </View>
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Nova Senha</Text>
              <View style={styles.passInputWrapper}>
                <TextInput style={styles.passInput} secureTextEntry={!showPassNova} value={passForm.nova} onChangeText={(v) => setPassForm({...passForm, nova: v})} placeholder="Mínimo 6 caracteres" placeholderTextColor="#555" />
                <TouchableOpacity style={styles.eyeBtn} onPress={() => setShowPassNova(!showPassNova)}>
                  {showPassNova ? <EyeOff size={20} color="#8b92a5"/> : <Eye size={20} color="#8b92a5"/>}
                </TouchableOpacity>
              </View>
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Confirmar Nova Senha</Text>
              <View style={styles.passInputWrapper}>
                <TextInput style={styles.passInput} secureTextEntry={!showPassNova} value={passForm.confirmar} onChangeText={(v) => setPassForm({...passForm, confirmar: v})} placeholder="Repita a nova senha" placeholderTextColor="#555" />
              </View>
            </View>

            <View style={styles.modalActions}>
              <TouchableOpacity style={styles.btnCancelBase} onPress={() => setShowPasswordModal(false)}>
                <Text style={styles.btnCancelText}>CANCELAR</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.btnSaveBase} onPress={handleSavePassword}>
                <Text style={styles.btnSaveText}>ATUALIZAR</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      <Modal visible={showLogoutModal} transparent animationType="fade">
        <View style={styles.modalOverlay}>
          <View style={[styles.modalContent, { alignItems: 'center' }]}>
            <View style={[styles.iconBox, {backgroundColor: 'rgba(255,77,77,0.1)', width: 65, height: 65, borderRadius: 33, marginBottom: 15}]}>
              <TriangleAlert size={35} color="#ff4d4d" />
            </View>
            <Text style={[styles.modalTitleBase, {textAlign: 'center', marginBottom: 10}]}>Terminar Sessão?</Text>
            <Text style={{color: '#8b92a5', textAlign: 'center', marginBottom: 25, fontSize: 13, lineHeight: 18}}>Terá de introduzir as suas credenciais novamente para aceder ao plano de treino.</Text>
            
            <View style={styles.modalActions}>
              <TouchableOpacity style={styles.btnCancelBase} onPress={() => setShowLogoutModal(false)}>
                <Text style={styles.btnCancelText}>CANCELAR</Text>
              </TouchableOpacity>
              <TouchableOpacity style={[styles.btnSaveBase, {backgroundColor: '#d32f2f', shadowColor: 'transparent'}]} onPress={confirmLogout}>
                <Text style={[styles.btnSaveText, {color: '#fff'}]}>SAIR</Text>
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
  
  // Header Customizado
  headerRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: 20, paddingTop: Platform.OS === 'android' ? 40 : 20, paddingBottom: 15 },
  headerLeft: { flex: 1 },
  headerSub: { color: '#8b92a5', fontSize: 13, textTransform: 'uppercase', fontWeight: 'bold', marginBottom: 4 },
  headerTitle: { color: '#fff', fontSize: 28, fontWeight: '800' },
  iconBtn: { width: 45, height: 45, borderRadius: 14, backgroundColor: 'rgba(58,181,74,0.1)', borderWidth: 1, borderColor: 'rgba(58,181,74,0.2)', justifyContent: 'center', alignItems: 'center' },
  
  content: { paddingHorizontal: 20 },
  
  // User Card
  userCard: { flexDirection: 'row', alignItems: 'center', backgroundColor: 'rgba(25,28,32,0.8)', padding: 20, borderRadius: 16, marginBottom: 20, borderWidth: 1, borderColor: 'rgba(58,181,74,0.2)' },
  avatar: { width: 65, height: 65, borderRadius: 35, backgroundColor: '#222', justifyContent: 'center', alignItems: 'center', marginRight: 15, borderWidth: 2, borderColor: '#444' },
  avatarPremium: { borderColor: '#3ab54a', shadowColor: '#3ab54a', shadowOffset: { width: 0, height: 0 }, shadowOpacity: 0.5, shadowRadius: 10, elevation: 10 },
  avatarText: { color: '#fff', fontSize: 26, fontWeight: '900' },
  userName: { color: '#fff', fontSize: 20, fontWeight: '800', flexShrink: 1 },
  userEmail: { color: '#8b92a5', fontSize: 13 },
  badge: { backgroundColor: 'rgba(255,255,255,0.05)', paddingHorizontal: 8, paddingVertical: 4, borderRadius: 8, borderWidth: 1, borderColor: 'rgba(255,255,255,0.08)' },
  badgeGreen: { backgroundColor: 'rgba(58,181,74,0.08)', borderColor: 'rgba(58,181,74,0.3)' },
  badgeText: { color: '#aaa', fontSize: 10, fontWeight: 'bold' },
  badgeTextGreen: { color: '#3ab54a', fontSize: 10, fontWeight: 'bold' },
  
  // Stats
  statsRow: { flexDirection: 'row', gap: 10, marginBottom: 25 },
  statBox: { flex: 1, backgroundColor: 'rgba(25,28,32,0.5)', paddingVertical: 18, borderRadius: 16, alignItems: 'center', borderWidth: 1, borderColor: 'rgba(255,255,255,0.08)' },
  statLabel: { color: '#8b92a5', fontSize: 11, textTransform: 'uppercase', fontWeight: 'bold', marginBottom: 5 },
  statValue: { color: '#fff', fontSize: 22, fontWeight: '900' },
  
  // Settings
  sectionTitle: { color: '#8b92a5', fontSize: 12, textTransform: 'uppercase', fontWeight: 'bold', marginBottom: 10, marginLeft: 5 },
  settingsCard: { backgroundColor: 'rgba(25,28,32,0.5)', borderRadius: 16, borderWidth: 1, borderColor: 'rgba(255,255,255,0.08)', overflow: 'hidden', marginBottom: 20 },
  settingItem: { flexDirection: 'row', alignItems: 'center', padding: 16, borderBottomWidth: 1, borderBottomColor: 'rgba(255,255,255,0.03)' },
  iconBox: { width: 34, height: 34, borderRadius: 10, justifyContent: 'center', alignItems: 'center', marginRight: 15 },
  settingText: { flex: 1, color: '#fff', fontSize: 15, fontWeight: '700' },
  statusPro: { backgroundColor: 'rgba(255,170,0,0.1)', paddingHorizontal: 8, paddingVertical: 4, borderRadius: 6, marginRight: 10 },
  
  // Logout
  logoutBtn: { flexDirection: 'row', justifyContent: 'center', alignItems: 'center', gap: 10, padding: 18, borderRadius: 16, borderWidth: 1, borderColor: '#ff4d4d', backgroundColor: 'transparent' },
  logoutText: { color: '#ff4d4d', fontWeight: '900', letterSpacing: 1, fontSize: 14 },
  
  // Modals Base
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.85)', justifyContent: 'center', padding: 20 },
  modalContent: { backgroundColor: '#11151c', borderRadius: 24, padding: 25, borderWidth: 1, borderColor: 'rgba(255,255,255,0.1)' },
  modalTitleBase: { color: '#fff', fontSize: 20, fontWeight: '800', marginBottom: 20 },
  
  inputGroup: { marginBottom: 15 },
  inputLabel: { color: '#8b92a5', fontSize: 11, fontWeight: 'bold', textTransform: 'uppercase', marginBottom: 6, letterSpacing: 1 },
  input: { backgroundColor: 'rgba(0,0,0,0.3)', borderWidth: 1, borderColor: 'rgba(255,255,255,0.1)', borderRadius: 12, color: '#fff', padding: 15, fontSize: 15, fontWeight: 'bold' },
  
  passInputWrapper: { flexDirection: 'row', alignItems: 'center', backgroundColor: 'rgba(0,0,0,0.3)', borderWidth: 1, borderColor: 'rgba(255,255,255,0.1)', borderRadius: 12 },
  passInput: { flex: 1, color: '#fff', padding: 15, fontSize: 15, fontWeight: 'bold' },
  eyeBtn: { padding: 15 },

  modalActions: { flexDirection: 'row', gap: 12, marginTop: 10 },
  btnCancelBase: { flex: 1, padding: 16, backgroundColor: 'rgba(255,255,255,0.05)', borderRadius: 14, borderWidth: 1, borderColor: 'rgba(255,255,255,0.1)', alignItems: 'center', justifyContent: 'center' },
  btnCancelText: { color: '#fff', fontWeight: '700', fontSize: 13, letterSpacing: 1 },
  btnSaveBase: { flex: 1.3, padding: 16, backgroundColor: '#3ab54a', borderRadius: 14, alignItems: 'center', justifyContent: 'center', shadowColor: '#3ab54a', shadowOffset: {width: 0, height: 4}, shadowOpacity: 0.3, shadowRadius: 10, elevation: 5 },
  btnSaveText: { color: '#000', fontWeight: '900', fontSize: 13, letterSpacing: 1 }
});