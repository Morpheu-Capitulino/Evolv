import React, { useState, useEffect, useRef } from 'react';
import {
  View, Text, TouchableOpacity, StyleSheet, SafeAreaView, TextInput, ScrollView, Animated, Alert
} from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
import { useMutation, gql } from '@apollo/client';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Flame, Dumbbell, ArrowRight, ArrowLeft, Target, BrainCircuit } from 'lucide-react-native';

const ADD_BODY_MEASUREMENT = gql`
  mutation AddBodyMeasurement(
    $weight: Float!
    $height: Float!
    $bodyFatPercentage: Float!
    $arm: Float
    $waist: Float
    $thigh: Float
    $hip: Float
  ) {
    addBodyMeasurement(
      weight: $weight
      height: $height
      bodyFatPercentage: $bodyFatPercentage
      arm: $arm
      waist: $waist
      thigh: $thigh
      hip: $hip
    ) {
      id
    }
  }
`;

const UPDATE_USER_ONBOARDING = gql`
  mutation UpdateUserOnboarding($goal: String, $focus: String) {
    updateUser(goal: $goal, focus: $focus) {
      goal
      focus
    }
  }
`;

export default function OnboardingPage() {
  const navigation = useNavigation();
  const route = useRoute();

  const [step, setStep] = useState(1);
  const [isProcessing, setIsProcessing] = useState(false);
  const pulseAnim = useRef(new Animated.Value(1)).current;

  const [respostas, setRespostas] = useState({
    objetivo: '', foco: '', peso: '', altura: '', bf: '', braco: '', cintura: '', coxa: '',
  });

  const [addMeasurement] = useMutation(ADD_BODY_MEASUREMENT);
  const [updateUser] = useMutation(UPDATE_USER_ONBOARDING);

  useEffect(() => {
    if (isProcessing) {
      Animated.loop(
        Animated.sequence([
          Animated.timing(pulseAnim, { toValue: 1.15, duration: 900, useNativeDriver: true }),
          Animated.timing(pulseAnim, { toValue: 1, duration: 900, useNativeDriver: true }),
        ])
      ).start();
    }
  }, [isProcessing]);

  const parseNum = (value) => {
    if (!value) return 0;
    const parsed = parseFloat(value.toString().replace(',', '.'));
    return isNaN(parsed) ? 0 : parsed;
  };

  const handleSelect = (campo, valor) => {
    setRespostas((prev) => ({ ...prev, [campo]: valor }));
    setTimeout(() => setStep((prev) => prev + 1), 250);
  };

  const handleFinish = async () => {
    try {
      const userId = route.params?.userId;

      if (!userId) {
        return Alert.alert('Erro Crítico', 'Sessão inválida. O ID do usuário não foi fornecido na rota. Faça login novamente.');
      }

      if (!respostas.peso || !respostas.altura) {
        return Alert.alert('Campos obrigatórios', 'Peso e altura são essenciais para o cálculo.');
      }

      setIsProcessing(true);

      await addMeasurement({
        variables: {
          weight: parseNum(respostas.peso),
          height: parseNum(respostas.altura),
          bodyFatPercentage: parseNum(respostas.bf) || 15,
          arm: parseNum(respostas.braco),
          waist: parseNum(respostas.cintura),
          thigh: parseNum(respostas.coxa),
          hip: 0,
        },
      });

      await updateUser({
        variables: {
          goal: respostas.objetivo,
          focus: respostas.foco,
        },
      });

      await AsyncStorage.setItem(`onboarding_done_${userId}`, 'true');

      setTimeout(() => {
        navigation.replace('Main'); 
      }, 2500);

    } catch (error) {
      setIsProcessing(false);
      Alert.alert('Erro', error.message || 'Falha ao sincronizar biometria com o servidor.');
    }
  };

  if (isProcessing) {
    return (
      <View style={[styles.container, styles.centerAll]}>
        <Animated.View style={{ transform: [{ scale: pulseAnim }] }}>
          <BrainCircuit size={80} color="#3ab54a" />
        </Animated.View>
        <Text style={styles.processingTitle}>Analisando biometria...</Text>
        <Text style={styles.processingText}>
          A Evolv AI está cruzando seu foco em <Text style={{ color: '#3ab54a', fontWeight: '700' }}>{respostas.foco}</Text> com suas medidas...
        </Text>
        <View style={styles.progressBarBg}><View style={styles.progressBarFill} /></View>
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity 
          style={styles.backBtn} 
          onPress={() => {
            if (step > 1) {
              setStep(step - 1);
            } else if (navigation.canGoBack()) {
              navigation.goBack();
            }
          }}
        >
          <ArrowLeft size={22} color="#8b92a5" />
        </TouchableOpacity>
        <View style={styles.stepIndicators}>
          {[1, 2, 3, 4].map((item) => (
            <View key={item} style={[styles.stepDot, step >= item && styles.stepDotActive]} />
          ))}
        </View>
        <View style={{ width: 24 }} />
      </View>

      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        {step === 1 && (
          <View style={styles.stepContainer}>
            <Text style={styles.title}>Qual é a sua meta principal?</Text>
            <Text style={styles.subtitle}>Isto dita a intensidade do plano.</Text>
            
            <TouchableOpacity style={[styles.optionCard, respostas.objetivo === 'Emagrecimento' && styles.optionCardSelected]} onPress={() => handleSelect('objetivo', 'Emagrecimento')}>
              <Flame size={32} color="#ff4d4d" style={styles.optIcon} />
              <View>
                <Text style={styles.optTitle}>Perder Gordura</Text>
                <Text style={styles.optDesc}>Definição e queima calórica</Text>
              </View>
            </TouchableOpacity>

            <TouchableOpacity style={[styles.optionCard, respostas.objetivo === 'Hipertrofia' && styles.optionCardSelected]} onPress={() => handleSelect('objetivo', 'Hipertrofia')}>
              <Dumbbell size={32} color="#3ab54a" style={styles.optIcon} />
              <View>
                <Text style={styles.optTitle}>Ganhar Massa</Text>
                <Text style={styles.optDesc}>Foco em hipertrofia</Text>
              </View>
            </TouchableOpacity>
          </View>
        )}

        {step === 2 && (
          <View style={styles.stepContainer}>
            <Text style={styles.title}>Onde quer dar mais ênfase?</Text>
            <Text style={styles.subtitle}>A IA usará isso como base.</Text>
            
            {['Superiores', 'Inferiores', 'Core'].map((item) => (
              <TouchableOpacity key={item} style={[styles.optionCard, respostas.foco === item && styles.optionCardSelected]} onPress={() => handleSelect('foco', item)}>
                <Target size={32} color="#8b92a5" style={styles.optIcon} />
                <View>
                  <Text style={styles.optTitle}>{item === 'Core' ? 'Core / Abdômen' : `Membros ${item}`}</Text>
                  <Text style={styles.optDesc}>Foco específico nesta região</Text>
                </View>
              </TouchableOpacity>
            ))}
          </View>
        )}

        {step === 3 && (
          <View style={styles.stepContainer}>
            <Text style={styles.title}>Sua estrutura base</Text>
            
            <View style={styles.inputBoxLarge}>
              <Text style={styles.label}>Peso (kg)</Text>
              <TextInput style={styles.hugeInput} keyboardType="numeric" placeholder="82.5" placeholderTextColor="rgba(255,255,255,0.15)" value={respostas.peso} onChangeText={(text) => setRespostas({...respostas, peso: text})} />
            </View>

            <View style={styles.inputBoxLarge}>
              <Text style={styles.label}>Altura (m)</Text>
              <TextInput style={styles.hugeInput} keyboardType="numeric" placeholder="1.78" placeholderTextColor="rgba(255,255,255,0.15)" value={respostas.altura} onChangeText={(text) => setRespostas({...respostas, altura: text})} />
            </View>

            <View style={styles.inputBoxLarge}>
              <Text style={styles.label}>BF (%)</Text>
              <TextInput style={styles.hugeInput} keyboardType="numeric" placeholder="15" placeholderTextColor="rgba(255,255,255,0.15)" value={respostas.bf} onChangeText={(text) => setRespostas({...respostas, bf: text})} />
            </View>

            <TouchableOpacity style={styles.btnLarge} onPress={() => setStep(4)}>
              <Text style={styles.btnText}>AVANÇAR</Text>
              <ArrowRight size={20} color="#000" />
            </TouchableOpacity>
          </View>
        )}

        {step === 4 && (
          <View style={styles.stepContainer}>
            <Text style={styles.title}>Diagnóstico Muscular</Text>
            <Text style={styles.subtitle}>Medidas para calibrar a IA.</Text>

            <View style={styles.inputBoxLarge}>
              <Text style={styles.label}>Braço (cm)</Text>
              <TextInput style={styles.hugeInput} keyboardType="numeric" placeholder="40" placeholderTextColor="rgba(255,255,255,0.15)" value={respostas.braco} onChangeText={(text) => setRespostas({...respostas, braco: text})} />
            </View>

            <View style={styles.inputBoxLarge}>
              <Text style={styles.label}>Coxa (cm)</Text>
              <TextInput style={styles.hugeInput} keyboardType="numeric" placeholder="60" placeholderTextColor="rgba(255,255,255,0.15)" value={respostas.coxa} onChangeText={(text) => setRespostas({...respostas, coxa: text})} />
            </View>

            <View style={styles.inputBoxLarge}>
              <Text style={styles.label}>Cintura (cm)</Text>
              <TextInput style={styles.hugeInput} keyboardType="numeric" placeholder="80" placeholderTextColor="rgba(255,255,255,0.15)" value={respostas.cintura} onChangeText={(text) => setRespostas({...respostas, cintura: text})} />
            </View>

            <TouchableOpacity 
              style={[styles.btnLarge, isProcessing && { opacity: 0.6 }]} 
              onPress={handleFinish}
              disabled={isProcessing}
            >
              <BrainCircuit size={20} color="#000" />
              <Text style={styles.btnText}>{isProcessing ? 'PROCESSANDO...' : 'GERAR TREINO HÍBRIDO'}</Text>
            </TouchableOpacity>
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#090b0f' },
  centerAll: { justifyContent: 'center', alignItems: 'center', padding: 40 },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: 20, paddingVertical: 20 },
  backBtn: { width: 24 },
  stepIndicators: { flexDirection: 'row' },
  stepDot: { width: 10, height: 10, borderRadius: 10, backgroundColor: 'rgba(255,255,255,0.1)', marginHorizontal: 4 },
  stepDotActive: { backgroundColor: '#3ab54a' },
  content: { paddingHorizontal: 20, paddingBottom: 40 },
  stepContainer: { marginTop: 20 },
  title: { color: '#fff', fontSize: 30, fontWeight: '800', marginBottom: 10 },
  subtitle: { color: '#8b92a5', fontSize: 15, marginBottom: 30, lineHeight: 22 },
  optionCard: { backgroundColor: 'rgba(255,255,255,0.03)', borderWidth: 1, borderColor: 'rgba(255,255,255,0.08)', borderRadius: 20, padding: 20, flexDirection: 'row', alignItems: 'center', marginBottom: 15 },
  optionCardSelected: { borderColor: '#3ab54a', backgroundColor: 'rgba(58,181,74,0.08)' },
  optIcon: { marginRight: 18 },
  optTitle: { color: '#fff', fontSize: 18, fontWeight: '700' },
  optDesc: { color: '#8b92a5', marginTop: 4 },
  inputBoxLarge: { marginBottom: 28 },
  label: { color: '#3ab54a', fontWeight: '800', fontSize: 12, letterSpacing: 1, marginBottom: 8 },
  hugeInput: { color: '#fff', fontSize: 42, fontWeight: '800', borderBottomWidth: 2, borderBottomColor: 'rgba(255,255,255,0.1)', paddingBottom: 10 },
  btnLarge: { backgroundColor: '#3ab54a', height: 65, borderRadius: 20, flexDirection: 'row', justifyContent: 'center', alignItems: 'center', marginTop: 20 },
  btnText: { color: '#000', fontWeight: '900', fontSize: 16, marginHorizontal: 10 },
  processingTitle: { color: '#fff', fontSize: 24, fontWeight: '800', marginTop: 30 },
  processingText: { color: '#8b92a5', textAlign: 'center', marginTop: 10, lineHeight: 22 },
  progressBarBg: { width: '100%', height: 5, backgroundColor: 'rgba(255,255,255,0.1)', borderRadius: 10, marginTop: 40, overflow: 'hidden' },
  progressBarFill: { width: '70%', height: '100%', backgroundColor: '#3ab54a' },
});