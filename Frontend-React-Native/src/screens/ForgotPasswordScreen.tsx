import React, { useState } from 'react';
import { View, Text, StyleSheet, TextInput, TouchableOpacity, ActivityIndicator, Alert } from 'react-native';
import api from '../services/api';

export default function ForgotPasswordScreen({ navigation }: any) {
  const [email, setEmail] = useState('');
  const [token, setToken] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [step, setStep] = useState(1); // 1 = Digitar E-mail, 2 = Digitar Token e Nova Senha
  const [loading, setLoading] = useState(false);

  // Passo 1: Envia o e-mail para o Django gerar o token
  async function handleRequestToken() {
    if (!email.trim()) {
      Alert.alert('Erro', 'Por favor, digite o seu e-mail.');
      return;
    }
    setLoading(true);
    try {
      await api.post('password_reset/', { email: email.trim() });
      Alert.alert('Sucesso', 'Token de recuperação enviado! Verifique o console do backend.');
      setStep(2); // Avança para o passo de redefinir
    } catch (error: any) {
      Alert.alert('Erro', 'Não foi possível solicitar a recuperação. Verifique o e-mail.');
    } finally {
      setLoading(false);
    }
  }

  // Passo 2: Envia o token e a nova senha para o Django atualizar
  async function handleResetPassword() {
    if (!token.trim() || !newPassword.trim()) {
      Alert.alert('Erro', 'Preencha o token e a nova senha.');
      return;
    }
    setLoading(true);
    try {
      await api.post('password_reset/confirm/', {
        token: token.trim(),
        password: newPassword.trim(),
      });
      Alert.alert('Sucesso', 'Sua senha foi alterada com sucesso!');
      navigation.navigate('Login'); // Volta para a tela de login
    } catch (error: any) {
      Alert.alert('Erro', 'Token inválido ou expirado.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <View style={styles.container}>
      <View style={styles.card}>
        <Text style={styles.title}>Recuperar <Text style={styles.accent}>Senha</Text></Text>
        
        {step === 1 ? (
          <>
            <Text style={styles.instructions}>
              Insira o e-mail da sua conta para receber o token de validação.
            </Text>
            <TextInput
              style={styles.input}
              placeholder="Digite seu e-mail"
              placeholderTextColor="#625f7a"
              value={email}
              onChangeText={setEmail}
              keyboardType="email-address"
              autoCapitalize="none"
            />
            <TouchableOpacity style={styles.button} onPress={handleRequestToken} disabled={loading}>
              {loading ? <ActivityIndicator color="#fff" /> : <Text style={styles.buttonText}>Enviar Token</Text>}
            </TouchableOpacity>
          </>
        ) : (
          <>
            <Text style={styles.instructions}>
              Insira o token gerado no terminal do Django e sua nova senha abaixo.
            </Text>
            <TextInput
              style={styles.input}
              placeholder="Digite o Token (Ex: 1a2b3c4d)"
              placeholderTextColor="#625f7a"
              value={token}
              onChangeText={setToken}
              autoCapitalize="none"
            />
            <TextInput
              style={styles.input}
              placeholder="Digite a nova senha"
              placeholderTextColor="#625f7a"
              secureTextEntry
              value={newPassword}
              onChangeText={setNewPassword}
            />
            <TouchableOpacity style={styles.button} onPress={handleResetPassword} disabled={loading}>
              {loading ? <ActivityIndicator color="#fff" /> : <Text style={styles.buttonText}>Alterar Senha</Text>}
            </TouchableOpacity>
          </>
        )}

        <TouchableOpacity onPress={() => navigation.navigate('Login')} style={styles.backButton}>
          <Text style={styles.backButtonText}>Voltar para o Login</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#0B0914', justifyContent: 'center', alignItems: 'center', padding: 20 },
  card: { width: '100%', maxWidth: 400, backgroundColor: '#141228', padding: 30, borderRadius: 20, borderWidth: 1, borderColor: '#201d36' },
  title: { fontSize: 24, fontWeight: '800', color: '#fff', textAlign: 'center', marginBottom: 15 },
  accent: { color: '#6D5DFD' },
  instructions: { color: '#625f7a', fontSize: 13, textAlign: 'center', marginBottom: 20, lineHeight: 18 },
  input: { height: 50, backgroundColor: '#202040', borderRadius: 12, paddingHorizontal: 15, color: '#fff', borderWidth: 1, borderColor: '#2a2a54', marginBottom: 15 },
  button: { height: 50, backgroundColor: '#6D5DFD', borderRadius: 12, justifyContent: 'center', alignItems: 'center', marginTop: 10 },
  buttonText: { color: '#fff', fontSize: 15, fontWeight: '700' },
  backButton: { marginTop: 20, alignItems: 'center' },
  backButtonText: { color: '#625f7a', fontSize: 13, fontWeight: '600' }
});