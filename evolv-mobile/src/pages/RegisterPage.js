import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, ActivityIndicator, KeyboardAvoidingView, Platform } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { User, Lock, Mail, ArrowLeft, Dumbbell } from 'lucide-react-native';
import axios from 'axios';

const API_URL = process.env.EXPO_PUBLIC_API_URL || 'http://localhost:8080';

export default function RegisterPage() {
  const navigation = useNavigation();
  const [formData, setFormData] = useState({ name: '', email: '', password: '', confirmPassword: '' });
  const [erro, setErro] = useState('');
  const [sucesso, setSucesso] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleChange = (name, value) => setFormData(prev => ({ ...prev, [name]: value }));

  const handleRegister = async () => {
    setErro('');
    if (!formData.name || !formData.email || !formData.password || !formData.confirmPassword) {
      return setErro('Preencha todos os campos.');
    }
    if (formData.password !== formData.confirmPassword) {
      return setErro('As palavras-passe não coincidem.');
    }
    
    setLoading(true);

    try {
      await axios.post(`${API_URL}/api/auth/register`, {
        name: formData.name,
        email: formData.email,
        password: formData.password
      });

      setSucesso(true);
      setTimeout(() => navigation.replace('Login', { isNewAccount: true }), 2000);
    } catch (err) {
      setErro(err.response?.data?.error || 'Erro ao criar conta. O email já existe?');
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
        <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
          <ArrowLeft color="#8b92a5" size={24} />
        </TouchableOpacity>

        <Text style={styles.logo}>Criar Conta</Text>
        
        {sucesso ? (
          <View style={styles.successMessage}>
            <Dumbbell size={48} color="#3ab54a" />
            <Text style={styles.successTitle}>Conta criada!</Text>
            <Text style={styles.successText}>Redirecionando para o login...</Text>
          </View>
        ) : (
          <View style={styles.formGlass}>
            {erro ? <Text style={styles.errorMsg}>{erro}</Text> : null}
            
            <View style={styles.inputGroup}>
              <User color="#8b92a5" size={20} style={styles.inputIcon} />
              <TextInput 
                style={styles.input}
                placeholder="Nome Completo"
                placeholderTextColor="#8b92a5"
                value={formData.name}
                onChangeText={(text) => handleChange('name', text)}
              />
            </View>

            <View style={styles.inputGroup}>
              <Mail color="#8b92a5" size={20} style={styles.inputIcon} />
              <TextInput 
                style={styles.input}
                placeholder="Email"
                placeholderTextColor="#8b92a5"
                value={formData.email}
                onChangeText={(text) => handleChange('email', text)}
                keyboardType="email-address"
                autoCapitalize="none"
              />
            </View>
            
            <View style={styles.inputGroup}>
              <Lock color="#8b92a5" size={20} style={styles.inputIcon} />
              <TextInput 
                style={styles.input}
                placeholder="Palavra-passe"
                placeholderTextColor="#8b92a5"
                value={formData.password}
                onChangeText={(text) => handleChange('password', text)}
                secureTextEntry
              />
            </View>

            <View style={styles.inputGroup}>
              <Lock color="#8b92a5" size={20} style={styles.inputIcon} />
              <TextInput 
                style={styles.input}
                placeholder="Confirmar Palavra-passe"
                placeholderTextColor="#8b92a5"
                value={formData.confirmPassword}
                onChangeText={(text) => handleChange('confirmPassword', text)}
                secureTextEntry
              />
            </View>
            
            <TouchableOpacity 
              style={[styles.actionButton, loading && styles.actionButtonDisabled]} 
              onPress={handleRegister}
              disabled={loading}
            >
              {loading ? <ActivityIndicator color="#000" /> : <Text style={styles.actionButtonText}>REGISTRAR</Text>}
            </TouchableOpacity>

            <View style={styles.linkContainer}>
              <Text style={styles.linkText}>Já tem conta? </Text>
              <TouchableOpacity onPress={() => navigation.navigate('Login')}>
                <Text style={styles.linkHighlight}>Faça Login</Text>
              </TouchableOpacity>
            </View>
          </View>
        )}
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#090b0f' },
  overlay: { ...StyleSheet.absoluteFillObject, backgroundColor: 'rgba(9, 11, 15, 0.85)' },
  content: { flex: 1, justifyContent: 'center', paddingHorizontal: 24, zIndex: 1 },
  backButton: { position: 'absolute', top: 50, left: 24, padding: 10, zIndex: 10 },
  logo: { fontSize: 32, fontWeight: '900', color: '#3ab54a', textAlign: 'center', marginBottom: 30, marginTop: 40 },
  successMessage: { alignItems: 'center', justifyContent: 'center', padding: 20 },
  successTitle: { color: '#fff', fontSize: 24, fontWeight: 'bold', marginTop: 15 },
  successText: { color: '#8b92a5', marginTop: 10 },
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
  actionButton: {
    backgroundColor: '#3ab54a', height: 55, borderRadius: 14,
    justifyContent: 'center', alignItems: 'center', marginTop: 10, marginBottom: 20,
  },
  actionButtonDisabled: { opacity: 0.7 },
  actionButtonText: { color: '#000', fontWeight: '900', fontSize: 16 },
  linkContainer: { flexDirection: 'row', justifyContent: 'center' },
  linkText: { color: '#8b92a5' },
  linkHighlight: { color: '#3ab54a', fontWeight: 'bold' },
});