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
import { useNavigation } from '@react-navigation/native';
import { User, Lock, Check } from 'lucide-react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import axios from 'axios';

export default function LoginPage() {
  const navigation = useNavigation();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [erro, setErro] = useState('');
  const [loading, setLoading] = useState(false);
  const [keepConnected, setKeepConnected] = useState(false);

  const handleLogin = async () => {
    setErro('');
    if (!email || !password) {
      setErro('Preencha todos os campos.');
      return;
    }
    setLoading(true);

    try {
      // Substitua pelo IP da sua máquina se estiver a testar num celular físico (ex: http://192.168.1.X:8080)
      const API_URL = process.env.EXPO_PUBLIC_API_URL || 'http://10.0.2.2:8080'; 
      
      const response = await axios.post(`${API_URL}/api/auth/login`, {
        email,
        password,
        keepConnected
      });

      // Em React Native, usamos AsyncStorage em vez de localStorage
      await AsyncStorage.setItem('evolv_token', response.data.token);
      await AsyncStorage.setItem('evolv_userId', response.data.userId);
      
      navigation.navigate('Home'); // Nome da rota que você definir no seu App.js
    } catch (err) {
      setErro(err.response?.data?.error || 'Erro nas credenciais.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView 
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      style={styles.container}
    >
      <View style={styles.overlay} />
      
      <View style={styles.content}>
        <View style={styles.header}>
          <Text style={styles.logo}>Evolv</Text>
          <Text style={styles.tagline}>Treino Híbrido & Competição</Text>
        </View>

        <View style={styles.form}>
          {erro ? <Text style={styles.errorMsg}>{erro}</Text> : null}
          
          <View style={styles.inputGroup}>
            <User color="#A1A1A1" size={20} style={styles.inputIcon} />
            <TextInput 
              style={styles.input}
              placeholder="Email"
              placeholderTextColor="#888"
              value={email}
              onChangeText={setEmail}
              keyboardType="email-address"
              autoCapitalize="none"
            />
          </View>
          
          <View style={styles.inputGroup}>
            <Lock color="#A1A1A1" size={20} style={styles.inputIcon} />
            <TextInput 
              style={styles.input}
              placeholder="Palavra-passe"
              placeholderTextColor="#888"
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
              {keepConnected && <Check color="#000" size={14} strokeWidth={3} />}
            </View>
            <Text style={styles.keepConnectedText}>Manter-me conectado por 30 dias</Text>
          </TouchableOpacity>

          <TouchableOpacity 
            style={[styles.loginButton, loading && styles.loginButtonDisabled]} 
            onPress={handleLogin}
            disabled={loading}
          >
            {loading ? (
              <ActivityIndicator color="#000" />
            ) : (
              <Text style={styles.loginButtonText}>ENTRAR</Text>
            )}
          </TouchableOpacity>

          <View style={styles.registerLinkContainer}>
            <Text style={styles.registerText}>Não tem conta? </Text>
            <TouchableOpacity onPress={() => navigation.navigate('Register')}>
              <Text style={styles.registerLink}>Registre-se</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000', // Fundo preto base
  },
  overlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(20, 20, 20, 0.8)',
  },
  content: {
    flex: 1,
    justifyContent: 'center',
    paddingHorizontal: 24,
    zIndex: 1,
  },
  header: {
    alignItems: 'center',
    marginBottom: 40,
  },
  logo: {
    fontSize: 48,
    fontWeight: '900',
    color: '#C5A059', // Dourado do seu app
    letterSpacing: -1,
  },
  tagline: {
    color: '#A1A1A1',
    fontSize: 14,
    marginTop: 5,
  },
  form: {
    width: '100%',
  },
  errorMsg: {
    color: '#ff4d4d',
    textAlign: 'center',
    marginBottom: 15,
    fontWeight: 'bold',
  },
  inputGroup: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#1A1A1A',
    borderWidth: 1,
    borderColor: '#333',
    borderRadius: 12,
    marginBottom: 16,
    paddingHorizontal: 15,
    height: 55,
  },
  inputIcon: {
    marginRight: 10,
  },
  input: {
    flex: 1,
    color: '#fff',
    fontSize: 16,
  },
  keepConnected: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 24,
  },
  checkbox: {
    width: 20,
    height: 20,
    borderWidth: 2,
    borderColor: '#555',
    borderRadius: 6,
    marginRight: 10,
    justifyContent: 'center',
    alignItems: 'center',
  },
  checkboxChecked: {
    backgroundColor: '#C5A059',
    borderColor: '#C5A059',
  },
  keepConnectedText: {
    color: '#A1A1A1',
    fontSize: 14,
  },
  loginButton: {
    backgroundColor: '#C5A059',
    height: 55,
    borderRadius: 14,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 20,
  },
  loginButtonDisabled: {
    opacity: 0.7,
  },
  loginButtonText: {
    color: '#000',
    fontWeight: '900',
    fontSize: 16,
  },
  registerLinkContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
  },
  registerText: {
    color: '#A1A1A1',
  },
  registerLink: {
    color: '#C5A059',
    fontWeight: 'bold',
  },
});