import React, { useState } from 'react';
import { 
  View, Text, TextInput, TouchableOpacity, StyleSheet, 
  ScrollView, SafeAreaView, Modal, ActivityIndicator, Alert, Platform
} from 'react-native';
import { 
  Trophy, UserPlus, Check, X, User as UserIcon, 
  Search, Eye, ArrowLeft, Dumbbell, Target 
} from 'lucide-react-native';
import { useQuery, useMutation, gql } from '@apollo/client';
import BottomNav from '../../components/BottomNav';

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

const SEND_REQUEST = gql` 
  mutation SendRequest($userId: ID!, $targetId: ID!) { 
    sendFriendRequest(userId: $userId, targetId: $targetId) { id } 
  } 
`;

const RESPOND_REQUEST = gql` 
  mutation Respond($userId: ID!, $requesterId: ID!, $accept: Boolean!) { 
    respondToRequest(userId: $userId, requesterId: $requesterId, accept: $accept) { id } 
  } 
`;

export default function AmigosPage() {
  const [activeTab, setActiveTab] = useState('ranking');
  const [searchTerm, setSearchTerm] = useState('');
  
  const [showSearchModal, setShowSearchModal] = useState(false);
  const [viewingProfile, setViewingProfile] = useState(null);

  // Fetch Dados Principais
  const { data, loading, refetch } = useQuery(GET_COMMUNITY_DATA, { fetchPolicy: 'network-only' });

  // Mutações
  const [sendRequest] = useMutation(SEND_REQUEST);
  const [respond] = useMutation(RESPOND_REQUEST, { onCompleted: () => refetch() });

  if (loading) {
    return (
      <View style={[styles.container, { justifyContent: 'center', alignItems: 'center' }]}>
        <ActivityIndicator size="large" color="#3ab54a" />
      </View>
    );
  }

  // --- TRATAMENTO DE DADOS ---
  const currentUser = data?.me;
  const currentUserId = currentUser?.id;
  const meusAmigos = currentUser?.friendIds || [];
  const convitesPendentes = currentUser?.pendingRequestIds || [];

  const ranking = data?.getAllUsers 
    ? data.getAllUsers
        .filter(u => u.id === currentUserId || meusAmigos.includes(u.id))
        .sort((a, b) => (b.exercisesCompleted || 0) - (a.exercisesCompleted || 0)) 
    : [];

  // Solicitações Recebidas
  const solicitacoes = data?.getAllUsers?.filter(u => convitesPendentes.includes(u.id)) || [];

  // Pesquisa de Novos Amigos
  const resultadosPesquisa = data?.getAllUsers
    ? data.getAllUsers.filter(u => 
        u.id !== currentUserId && 
        !meusAmigos.includes(u.id) && 
        u.name.toLowerCase().includes(searchTerm.toLowerCase())
      )
    : [];

  // --- FUNÇÕES DE AÇÃO ---
  const handleConvidar = (targetId) => {
    sendRequest({ variables: { userId: currentUserId, targetId } });
    Alert.alert('Sucesso', 'Convite enviado com sucesso!');
    setViewingProfile(null);
    setShowSearchModal(false);
    setSearchTerm('');
  };

  const handleResponder = (requesterId, accept) => {
    respond({ variables: { userId: currentUserId, requesterId, accept } });
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <View style={styles.headerLeft}>
          <Text style={styles.greeting}>Evolv Social</Text>
          <Text style={styles.pageTitle}>Clube Privado</Text>
        </View>
      </View>

      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        
        <View style={styles.tabs}>
          <TouchableOpacity style={[styles.tabBtn, activeTab === 'ranking' && styles.tabActive]} onPress={() => setActiveTab('ranking')}>
            <Text style={[styles.tabText, activeTab === 'ranking' && styles.tabTextActive]}>Ranking Semanal</Text>
          </TouchableOpacity>
          <TouchableOpacity style={[styles.tabBtn, activeTab === 'requests' && styles.tabActive]} onPress={() => setActiveTab('requests')}>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
              <Text style={[styles.tabText, activeTab === 'requests' && styles.tabTextActive]}>Solicitações</Text>
              {solicitacoes.length > 0 && (
                <View style={styles.badge}><Text style={styles.badgeText}>{solicitacoes.length}</Text></View>
              )}
            </View>
          </TouchableOpacity>
        </View>

        {activeTab === 'ranking' ? (
          <View>
            {ranking.map((atleta, index) => {
              const isMe = atleta.id === currentUserId;
              return (
                <View key={atleta.id} style={[styles.rankCard, isMe && styles.rankCardMe]}>
                  <Text style={styles.rankPos}>{index + 1}º</Text>
                  
                  <View style={[styles.avatarSm, isMe && { borderColor: '#3ab54a', borderWidth: 1 }]}>
                    <Text style={[styles.avatarText, isMe && { color: '#3ab54a' }]}>{atleta.name.charAt(0).toUpperCase()}</Text>
                  </View>
                  
                  <View style={{ flex: 1 }}>
                    <Text style={[styles.rankName, isMe && { color: '#3ab54a' }]} numberOfLines={1}>{atleta.name}</Text>
                    <Text style={styles.rankStats}>{atleta.exercisesCompleted || 0} exercícios feitos</Text>
                  </View>
                  
                  {index === 0 && <Trophy size={22} color="#ffaa00" />}
                </View>
              );
            })}
          </View>
        ) : (
          <View>
            {solicitacoes.length === 0 ? (
              <View style={styles.emptyState}>
                <Text style={{ color: '#8b92a5' }}>Nenhuma solicitação pendente.</Text>
              </View>
            ) : (
              solicitacoes.map(req => (
                <View key={req.id} style={styles.requestCard}>
                  <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12, flex: 1 }}>
                    <UserIcon size={22} color="#3ab54a" />
                    <Text style={styles.rankName} numberOfLines={1}>{req.name}</Text>
                  </View>
                  <View style={{ flexDirection: 'row', gap: 10 }}>
                    <TouchableOpacity style={styles.btnAccept} onPress={() => handleResponder(req.id, true)}>
                      <Check size={18} color="#000"/>
                    </TouchableOpacity>
                    <TouchableOpacity style={styles.btnDecline} onPress={() => handleResponder(req.id, false)}>
                      <X size={18} color="#ff4d4d"/>
                    </TouchableOpacity>
                  </View>
                </View>
              ))
            )}
          </View>
        )}
        <View style={{ height: 100 }} />
      </ScrollView>

      <TouchableOpacity style={styles.fab} onPress={() => setShowSearchModal(true)}>
        <UserPlus size={24} color="#000" />
      </TouchableOpacity>

      <Modal visible={showSearchModal} transparent animationType="fade">
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            
            {viewingProfile ? (
              <View>
                <TouchableOpacity style={styles.backBtnModal} onPress={() => setViewingProfile(null)}>
                  <ArrowLeft size={20} color="#8b92a5" />
                  <Text style={{ color: '#8b92a5', fontWeight: 'bold', marginLeft: 8 }}>Voltar à pesquisa</Text>
                </TouchableOpacity>

                <View style={styles.profileHeaderCenter}>
                  <View style={styles.avatarXl}>
                    <Text style={styles.avatarXlText}>{viewingProfile.name.charAt(0).toUpperCase()}</Text>
                  </View>
                  <Text style={styles.profileNameModal}>{viewingProfile.name}</Text>
                  
                  <View style={styles.badgesRow}>
                    <View style={styles.badgeGoal}><Text style={styles.badgeGoalText}>{viewingProfile.goal && viewingProfile.goal !== 'Não definido' ? viewingProfile.goal : 'Geral'}</Text></View>
                    <View style={styles.badgeFocus}><Text style={styles.badgeFocusText}>{viewingProfile.focus && viewingProfile.focus !== 'Geral' ? viewingProfile.focus : 'Corpo Todo'}</Text></View>
                  </View>
                </View>

                <View style={{ flexDirection: 'row', gap: 10, marginBottom: 25 }}>
                  <View style={styles.statsCard}>
                    <Dumbbell size={26} color="#3ab54a" />
                    <Text style={styles.statsLabel}>EXERCÍCIOS</Text>
                    <Text style={styles.statsValue}>{viewingProfile.exercisesCompleted || 0}</Text>
                  </View>
                  <View style={styles.statsCard}>
                    <Target size={26} color="#00d2ff" />
                    <Text style={styles.statsLabel}>NÍVEL</Text>
                    <Text style={[styles.statsValue, { fontSize: 18, marginTop: 4 }]}>
                      {(viewingProfile.exercisesCompleted || 0) > 50 ? 'Avançado' : 'Iniciante'}
                    </Text>
                  </View>
                </View>

                <TouchableOpacity style={styles.greenBtnFull} onPress={() => handleConvidar(viewingProfile.id)}>
                  <UserPlus size={20} color="#000" />
                  <Text style={styles.greenBtnText}>ENVIAR CONVITE</Text>
                </TouchableOpacity>
              </View>
            ) : (
              <View>
                <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
                  <Text style={styles.modalTitle}>Pesquisar Atletas</Text>
                  <TouchableOpacity onPress={() => { setShowSearchModal(false); setSearchTerm(''); }}>
                    <X size={24} color="#8b92a5" />
                  </TouchableOpacity>
                </View>

                <View style={styles.searchBoxPro}>
                  <Search size={20} color="#8b92a5" />
                  <TextInput 
                    style={styles.searchInputPro} 
                    placeholder="Escreva o nome do amigo..." 
                    placeholderTextColor="#777"
                    value={searchTerm}
                    onChangeText={setSearchTerm}
                    autoFocus
                  />
                </View>

                <ScrollView style={{ maxHeight: 300 }} showsVerticalScrollIndicator={false}>
                  {resultadosPesquisa.map(u => (
                    <View key={u.id} style={styles.searchResultItem}>
                      <Text style={styles.searchResultName} numberOfLines={1}>{u.name}</Text>
                      <View style={{ flexDirection: 'row', gap: 8 }}>
                        <TouchableOpacity style={styles.iconBtnSecondary} onPress={() => setViewingProfile(u)}>
                          <Eye size={18} color="#8b92a5" />
                        </TouchableOpacity>
                        <TouchableOpacity style={styles.btnInviteOutline} onPress={() => handleConvidar(u.id)}>
                          <UserPlus size={16} color="#3ab54a" />
                          <Text style={styles.btnInviteText}>Convidar</Text>
                        </TouchableOpacity>
                      </View>
                    </View>
                  ))}
                  {searchTerm.length > 0 && resultadosPesquisa.length === 0 && (
                    <Text style={{ color: '#8b92a5', textAlign: 'center', marginTop: 20 }}>Nenhum atleta encontrado.</Text>
                  )}
                </ScrollView>
              </View>
            )}

          </View>
        </View>
      </Modal>

      <BottomNav />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#090b0f' },
  
  // Header
  header: { padding: 20, paddingTop: Platform.OS === 'android' ? 40 : 20, paddingBottom: 15 },
  greeting: { fontSize: 13, color: '#8b92a5', fontWeight: 'bold', textTransform: 'uppercase', letterSpacing: 1, marginBottom: 4 },
  pageTitle: { fontSize: 28, fontWeight: '800', color: '#fff' },
  content: { paddingHorizontal: 20 },
  
  // Tabs
  tabs: { flexDirection: 'row', backgroundColor: 'rgba(0,0,0,0.3)', borderRadius: 12, padding: 5, marginBottom: 20, borderWidth: 1, borderColor: 'rgba(255,255,255,0.08)' },
  tabBtn: { flex: 1, padding: 12, alignItems: 'center', borderRadius: 8 },
  tabActive: { backgroundColor: 'rgba(255,255,255,0.1)' },
  tabText: { color: '#8b92a5', fontWeight: 'bold' },
  tabTextActive: { color: '#fff' },
  badge: { backgroundColor: '#ff4d4d', paddingHorizontal: 6, paddingVertical: 2, borderRadius: 10, marginLeft: 4 },
  badgeText: { color: '#fff', fontSize: 10, fontWeight: 'bold' },

  // Ranking Cards
  rankCard: { flexDirection: 'row', alignItems: 'center', padding: 15, borderRadius: 16, backgroundColor: 'rgba(25,28,32,0.5)', borderWidth: 1, borderColor: 'rgba(255,255,255,0.08)', marginBottom: 12 },
  rankCardMe: { borderColor: '#3ab54a', backgroundColor: 'rgba(58,181,74,0.08)' },
  rankPos: { width: 40, fontSize: 18, fontWeight: '800', color: '#fff' },
  avatarSm: { width: 42, height: 42, borderRadius: 21, backgroundColor: 'rgba(255,255,255,0.1)', justifyContent: 'center', alignItems: 'center', marginRight: 15 },
  avatarText: { color: '#fff', fontWeight: '800', fontSize: 16 },
  rankName: { color: '#fff', fontWeight: 'bold', fontSize: 16, marginBottom: 2 },
  rankStats: { color: '#8b92a5', fontSize: 12 },

  // Requests
  requestCard: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: 15, borderRadius: 16, backgroundColor: 'rgba(25,28,32,0.5)', borderWidth: 1, borderColor: 'rgba(255,255,255,0.08)', marginBottom: 12 },
  btnAccept: { backgroundColor: '#3ab54a', width: 38, height: 38, borderRadius: 19, justifyContent: 'center', alignItems: 'center' },
  btnDecline: { backgroundColor: 'rgba(255,77,77,0.1)', width: 38, height: 38, borderRadius: 19, justifyContent: 'center', alignItems: 'center' },
  emptyState: { padding: 20, alignItems: 'center', backgroundColor: 'rgba(0,0,0,0.2)', borderRadius: 16, borderWidth: 1, borderColor: 'rgba(255,255,255,0.05)', borderStyle: 'dashed', marginTop: 20 },

  // FAB
  fab: { position: 'absolute', bottom: 95, right: 20, width: 60, height: 60, borderRadius: 30, backgroundColor: '#3ab54a', justifyContent: 'center', alignItems: 'center', zIndex: 50, elevation: 5, shadowColor: '#3ab54a', shadowOffset: {width: 0, height: 4}, shadowOpacity: 0.4, shadowRadius: 10 },

  // Modal Base
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.85)', justifyContent: 'center', padding: 20 },
  modalContent: { backgroundColor: '#11151c', borderRadius: 24, padding: 25, borderWidth: 1, borderColor: 'rgba(255,255,255,0.1)' },
  modalTitle: { color: '#fff', fontSize: 18, fontWeight: '800' },

  // Pesquisa
  searchBoxPro: { flexDirection: 'row', alignItems: 'center', backgroundColor: 'rgba(0,0,0,0.3)', borderWidth: 1, borderColor: 'rgba(255,255,255,0.1)', borderRadius: 12, paddingHorizontal: 15, marginBottom: 20 },
  searchInputPro: { flex: 1, color: '#fff', padding: 15, fontSize: 15 },
  searchResultItem: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: 12, backgroundColor: 'rgba(255,255,255,0.05)', borderRadius: 12, marginBottom: 10 },
  searchResultName: { color: '#fff', fontWeight: 'bold', flex: 1, marginRight: 10 },
  iconBtnSecondary: { backgroundColor: 'rgba(255,255,255,0.05)', borderWidth: 1, borderColor: 'rgba(255,255,255,0.1)', borderRadius: 8, width: 36, height: 36, justifyContent: 'center', alignItems: 'center' },
  btnInviteOutline: { flexDirection: 'row', alignItems: 'center', gap: 6, borderWidth: 1, borderColor: '#3ab54a', paddingHorizontal: 12, borderRadius: 8, height: 36 },
  btnInviteText: { color: '#3ab54a', fontWeight: 'bold', fontSize: 12 },

  // Mini Perfil
  backBtnModal: { flexDirection: 'row', alignItems: 'center', marginBottom: 20 },
  profileHeaderCenter: { alignItems: 'center', marginBottom: 25 },
  avatarXl: { width: 80, height: 80, borderRadius: 40, backgroundColor: 'rgba(58,181,74,0.1)', borderWidth: 2, borderColor: '#3ab54a', justifyContent: 'center', alignItems: 'center', marginBottom: 10 },
  avatarXlText: { color: '#3ab54a', fontSize: 36, fontWeight: '800' },
  profileNameModal: { color: '#fff', fontSize: 22, fontWeight: '800', marginBottom: 10, textAlign: 'center' },
  badgesRow: { flexDirection: 'row', gap: 10 },
  badgeGoal: { backgroundColor: '#ffaa00', paddingHorizontal: 10, paddingVertical: 4, borderRadius: 8 },
  badgeGoalText: { color: '#000', fontSize: 11, fontWeight: 'bold', textTransform: 'uppercase' },
  badgeFocus: { backgroundColor: 'rgba(255,255,255,0.1)', paddingHorizontal: 10, paddingVertical: 4, borderRadius: 8 },
  badgeFocusText: { color: '#fff', fontSize: 11, fontWeight: 'bold', textTransform: 'uppercase' },
  
  statsCard: { flex: 1, backgroundColor: 'rgba(0,0,0,0.3)', borderWidth: 1, borderColor: 'rgba(255,255,255,0.08)', borderRadius: 16, padding: 20, alignItems: 'center' },
  statsLabel: { color: '#8b92a5', fontSize: 10, fontWeight: 'bold', marginTop: 10, marginBottom: 4 },
  statsValue: { color: '#fff', fontSize: 24, fontWeight: '800' },
  
  greenBtnFull: { flexDirection: 'row', backgroundColor: '#3ab54a', padding: 18, borderRadius: 16, justifyContent: 'center', alignItems: 'center', gap: 8 },
  greenBtnText: { color: '#000', fontWeight: '900', fontSize: 14, letterSpacing: 1 }
});