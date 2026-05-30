import React, { useState } from 'react';
import { 
  View, 
  Text, 
  TextInput, 
  TouchableOpacity, 
  StyleSheet, 
  ActivityIndicator, 
  KeyboardAvoidingView, 
  Platform 
} from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
import { User, Lock, CircleCheck } from 'lucide-react-native'; 
import AsyncStorage from '@react-native-async-storage/async-storage';
import axios from 'axios';

const API_URL = process.env.EXPO_PUBLIC_API_URL || 'http://localhost:8080';

export default function LoginPage() {
  const navigation = useNavigation();
  const route = useRoute();
  
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [erro, setErro] = useState('');
  const [loading, setLoading] = useState(false);
  const [keepConnected, setKeepConnected] = useState(false);

  const handleLogin = async () => {
    setErro('');
    if (!email || !password) {
      return setErro('Preencha todos os campos.');
    }
    
    setLoading(true);

    try {
      const response = await axios.post(
        `${API_URL}/api/auth/login`, 
        { email: email.trim(), password, keepConnected },
        { timeout: 5000 }
      );

      if (response.data?.token && response.data?.userId) {
        const { token, userId } = response.data;
        
        await AsyncStorage.setItem('evolv_token', token);
        await AsyncStorage.setItem('evolv_userId', userId);

        const isNewAccount = route.params?.isNewAccount;
        const onboardingStatus = await AsyncStorage.getItem(`onboarding_done_${userId}`);

        if (isNewAccount || !onboardingStatus) {
          // Passa o ID via rota, nada de variáveis globais
          navigation.replace('Onboarding', { userId: userId });
        } else {
          navigation.replace('Main');
        }
      } else {
        setErro('Resposta inválida do servidor.');
      }
    } catch (err) {
      if (err.code === 'ECONNABORTED') {
        setErro('Tempo limite esgotado. Servidor inacessível.');
      } else {
        setErro(err.response?.data?.error || 'Erro de rede. Verifique a conexão.');
      }
    } finally {
      setLoading(false); 
    }
  };

  return (
    <KeyboardAvoidingView 
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      style={styles.container}
    >
      <View style={styles.content}>
        <View style={styles.header}>
          <Text style={styles.logo}>Evolv</Text>
          <Text style={styles.tagline}>Treino Híbrido & Competição</Text>
        </View>

        <View style={styles.formGlass}>
          {erro ? <Text style={styles.errorMsg}>{erro}</Text> : null}
          
          <View style={styles.inputGroup}>
            <User color="#8b92a5" size={20} style={styles.inputIcon} />
            <TextInput 
              style={styles.input}
              placeholder="Email"
              placeholderTextColor="#8b92a5"
              value={email}
              onChangeText={setEmail}
              keyboardType="email-address"
              autoCapitalize="none"
            />
          </View>
          
          <View style={styles.inputGroup}>
            <Lock color="#8b92a5" size={20} style={styles.inputIcon} />
            <TextInput 
              style={styles.input}
              placeholder="Senha"
              placeholderTextColor="#8b92a5"
              value={password}
              onChangeText={setPassword}
              secureTextEntry
            />
          </View>

          <TouchableOpacity 
            style={styles.keepConnected} 
            activeOpacity={0.8}
            onPress={() => setKeepConnected(!keepConnected)}
          >
            <View style={[styles.checkbox, keepConnected && styles.checkboxChecked]}>
              {keepConnected && <CircleCheck color="#000" size={14} />}
            </View>
            <Text style={styles.keepConnectedText}>Manter-me conectado</Text>
          </TouchableOpacity>

          <TouchableOpacity 
            style={[styles.actionButton, loading && styles.actionButtonDisabled]} 
            onPress={handleLogin}
            disabled={loading}
          >
            {loading ? <ActivityIndicator color="#000" /> : <Text style={styles.actionButtonText}>ENTRAR</Text>}
          </TouchableOpacity>

          <View style={styles.linkContainer}>
            <Text style={styles.linkText}>Não tem conta? </Text>
            <TouchableOpacity onPress={() => navigation.navigate('Register')}>
              <Text style={styles.linkHighlight}>Registre-se</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#090b0f' },
  content: { flex: 1, justifyContent: 'center', paddingHorizontal: 24 },
  header: { marginBottom: 40, alignItems: 'center' },
  logo: { fontSize: 48, fontWeight: '900', color: '#3ab54a', letterSpacing: -1 },
  tagline: { color: '#8b92a5', fontSize: 14, marginTop: 5 },
  formGlass: {
    backgroundColor: 'rgba(255, 255, 255, 0.03)',
    borderRadius: 24,
    padding: 24,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.08)',
  },
  errorMsg: { color: '#ff4d4d', textAlign: 'center', marginBottom: 15, fontWeight: 'bold' },
  inputGroup: {
    flexDirection: 'row', alignItems: 'center', backgroundColor: 'rgba(0,0,0,0.5)',
    borderWidth: 1, borderColor: 'rgba(255,255,255,0.1)', borderRadius: 12,
    marginBottom: 16, paddingHorizontal: 15, height: 55,
  },
  inputIcon: { marginRight: 10 },
  input: { flex: 1, color: '#fff', fontSize: 16 },
  keepConnected: { flexDirection: 'row', alignItems: 'center', marginBottom: 24, justifyContent: 'center' },
  checkbox: {
    width: 20, height: 20, borderWidth: 2, borderColor: '#555',
    borderRadius: 6, marginRight: 10, justifyContent: 'center', alignItems: 'center',
  },
  checkboxChecked: { backgroundColor: '#3ab54a', borderColor: '#3ab54a' },
  keepConnectedText: { color: '#8b92a5', fontSize: 14 },
  actionButton: {
    backgroundColor: '#3ab54a', height: 55, borderRadius: 14,
    justifyContent: 'center', alignItems: 'center', marginBottom: 20,
  },
  actionButtonDisabled: { opacity: 0.7 },
  actionButtonText: { color: '#000', fontWeight: '900', fontSize: 16 },
  linkContainer: { flexDirection: 'row', justifyContent: 'center' },
  linkText: { color: '#8b92a5' },
  linkHighlight: { color: '#3ab54a', fontWeight: 'bold' },
});