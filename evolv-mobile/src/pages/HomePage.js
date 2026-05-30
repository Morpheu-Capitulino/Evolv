import React, { useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  SafeAreaView,
  ActivityIndicator,
} from 'react-native';

import { useNavigation } from '@react-navigation/native';
import { gql, useQuery } from '@apollo/client';

import {
  Play,
  TrendingUp,
  Activity,
  Users,
  Target,
  Dumbbell,
} from 'lucide-react-native';

import BottomNav from '../../components/BottomNav';

const GET_HOME_DATA = gql`
  query GetHomeData {
    me {
      id
      name
      exercisesCompleted
      focus
      goal
      friendIds
    }
  }
`;

export default function HomePage() {
  const navigation = useNavigation();

  const { data, loading, error } = useQuery(GET_HOME_DATA, {
    fetchPolicy: 'cache-and-network',
  });

  useEffect(() => {
    if (data?.me) {
      const { goal, focus } = data.me;

      if (
        !goal ||
        !focus ||
        goal === 'Não definido' ||
        focus === 'Não definido' ||
        focus === 'Geral'
      ) {
        navigation.navigate('Onboarding');
      }
    }
  }, [data]);

  if (loading) {
    return (
      <SafeAreaView style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#3ab54a" />
      </SafeAreaView>
    );
  }

  if (error) {
    return (
      <SafeAreaView style={styles.loadingContainer}>
        <Text style={styles.errorTitle}>
          Erro ao carregar dados
        </Text>

        <Text style={styles.errorText}>
          {error.message}
        </Text>
      </SafeAreaView>
    );
  }

  const currentUser = data?.me;

  const primeiroNome =
    currentUser?.name?.split(' ')[0] || 'Atleta';

  const totalExercicios =
    currentUser?.exercisesCompleted || 0;

  const focoAtual =
    currentUser?.focus || 'Geral';

  const totalAmigos =
    currentUser?.friendIds?.length || 0;

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <View style={styles.userGreeting}>
          <View style={styles.profilePic}>
            <Text style={styles.profileInitial}>
              {primeiroNome.charAt(0)}
            </Text>
          </View>

          <View>
            <Text style={styles.greetingText}>
              Olá, {primeiroNome}
            </Text>

            <Text style={styles.greetingSub}>
              Pronto para superar limites?
            </Text>
          </View>
        </View>

        <Text style={styles.logo}>
          Evolv
        </Text>
      </View>

      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* STATS */}
        <View style={styles.statsCard}>
          <View style={styles.statsHeader}>
            <Text style={styles.statsHeaderText}>
              Visão Geral do Perfil
            </Text>
          </View>

          <View style={styles.statsGrid}>
            <View style={styles.statBox}>
              <Dumbbell
                size={22}
                color="#3ab54a"
              />

              <Text style={styles.statNumber}>
                {totalExercicios}
              </Text>

              <Text style={styles.statLabel}>
                Exercícios
              </Text>
            </View>

            <View style={styles.statBox}>
              <Target
                size={22}
                color="#ff6b00"
              />

              <Text
                style={[
                  styles.statNumber,
                  {
                    fontSize:
                      focoAtual.length > 9
                        ? 14
                        : 18,
                  },
                ]}
              >
                {focoAtual}
              </Text>

              <Text style={styles.statLabel}>
                Foco Atual
              </Text>
            </View>

            <View style={styles.statBox}>
              <Users
                size={22}
                color="#ffd700"
              />

              <Text style={styles.statNumber}>
                {totalAmigos}
              </Text>

              <Text style={styles.statLabel}>
                Amigos
              </Text>
            </View>
          </View>
        </View>

        {/* AÇÃO */}
        <Text style={styles.sectionLabel}>
          AÇÃO PRINCIPAL
        </Text>

        <TouchableOpacity
          style={styles.ctaCard}
          activeOpacity={0.9}
          onPress={() =>
            navigation.navigate('Treino')
          }
        >
          <View>
            <View style={styles.badge}>
              <Text style={styles.badgeText}>
                Treino de Hoje
              </Text>
            </View>

            <Text style={styles.ctaTitle}>
              Bora Treinar!
            </Text>

            <Text style={styles.ctaDesc}>
              Inicie seu treino agora
            </Text>
          </View>

          <View style={styles.playButton}>
            <Play
              size={24}
              color="#000"
              fill="#000"
            />
          </View>
        </TouchableOpacity>

        {/* EXPLORAR */}
        <Text style={styles.sectionLabel}>
          EXPLORAR
        </Text>

        <View style={styles.exploreRow}>
          <TouchableOpacity
            style={styles.exploreCard}
            activeOpacity={0.85}
            onPress={() =>
              navigation.navigate('Progresso')
            }
          >
            <TrendingUp
              size={24}
              color="#3ab54a"
            />

            <Text style={styles.exploreTitle}>
              Evolução
            </Text>

            <Text style={styles.exploreSub}>
              Ver gráficos
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.exploreCard}
            activeOpacity={0.85}
            onPress={() =>
              navigation.navigate('Amigos')
            }
          >
            <Activity
              size={24}
              color="#3ab54a"
            />

            <Text style={styles.exploreTitle}>
              Comunidade
            </Text>

            <Text style={styles.exploreSub}>
              Ranking
            </Text>
          </TouchableOpacity>
        </View>

        <View style={{ height: 120 }} />
      </ScrollView>

      <BottomNav />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#090b0f',
  },

  loadingContainer: {
    flex: 1,
    backgroundColor: '#090b0f',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },

  errorTitle: {
    color: '#ff4d4d',
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 10,
  },

  errorText: {
    color: '#999',
    textAlign: 'center',
  },

  header: {
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 15,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },

  userGreeting: {
    flexDirection: 'row',
    alignItems: 'center',
  },

  profilePic: {
    width: 45,
    height: 45,
    borderRadius: 999,
    borderWidth: 2,
    borderColor: '#3ab54a',
    backgroundColor: '#1a1a1a',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },

  profileInitial: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
  },

  greetingText: {
    color: '#fff',
    fontSize: 20,
    fontWeight: '800',
  },

  greetingSub: {
    color: '#8b92a5',
    fontSize: 12,
    marginTop: 2,
  },

  logo: {
    color: '#3ab54a',
    fontSize: 28,
    fontWeight: '900',
    fontStyle: 'italic',
  },

  scroll: {
    flex: 1,
  },

  scrollContent: {
    paddingHorizontal: 20,
  },

  statsCard: {
    backgroundColor: 'rgba(255,255,255,0.03)',
    borderRadius: 20,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.08)',
    padding: 16,
    marginTop: 10,
  },

  statsHeader: {
    backgroundColor: 'rgba(0,0,0,0.3)',
    borderRadius: 12,
    paddingVertical: 10,
    alignItems: 'center',
    marginBottom: 18,
  },

  statsHeaderText: {
    color: '#fff',
    fontWeight: '700',
    fontSize: 14,
  },

  statsGrid: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },

  statBox: {
    flex: 1,
    alignItems: 'center',
  },

  statNumber: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
    marginTop: 8,
  },

  statLabel: {
    color: '#8b92a5',
    fontSize: 12,
    marginTop: 4,
  },

  sectionLabel: {
    color: '#8b92a5',
    fontSize: 12,
    fontWeight: 'bold',
    letterSpacing: 1.5,
    marginTop: 25,
    marginBottom: 12,
  },

  ctaCard: {
    backgroundColor: 'rgba(20,30,22,0.8)',
    borderWidth: 1,
    borderColor: '#3ab54a',
    borderRadius: 20,
    padding: 20,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },

  badge: {
    backgroundColor: '#3ab54a',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
    alignSelf: 'flex-start',
    marginBottom: 10,
  },

  badgeText: {
    color: '#000',
    fontWeight: 'bold',
    fontSize: 10,
    textTransform: 'uppercase',
  },

  ctaTitle: {
    color: '#fff',
    fontSize: 24,
    fontWeight: '800',
    marginBottom: 4,
  },

  ctaDesc: {
    color: '#8b92a5',
    fontSize: 13,
  },

  playButton: {
    width: 58,
    height: 58,
    borderRadius: 999,
    backgroundColor: '#3ab54a',
    justifyContent: 'center',
    alignItems: 'center',
  },

  exploreRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },

  exploreCard: {
    width: '48%',
    backgroundColor: 'rgba(255,255,255,0.03)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.08)',
    borderRadius: 18,
    padding: 18,
  },

  exploreTitle: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
    marginTop: 12,
  },

  exploreSub: {
    color: '#8b92a5',
    fontSize: 12,
    marginTop: 4,
  },
});