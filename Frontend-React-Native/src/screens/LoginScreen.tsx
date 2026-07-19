import React, { useState } from 'react';
import { 
  View, 
  Text, 
  TextInput, 
  TouchableOpacity, 
  StyleSheet, 
  ActivityIndicator
} from 'react-native';
import { useAuth } from '../contexts/AuthContext';
import api from '../services/api';
// Ícones nativos do Expo
import { Feather } from '@expo/vector-icons';

export default function LoginScreen({ navigation }: any) {
  const { login } = useAuth();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  
  // CORRIGIDO: Agora com o setIsRegister certinho para não dar erro nas funções abaixo!
  const [isRegister, setIsRegister] = useState(false);
  
  // Estados para exibir mensagens de erro/sucesso direto na tela
  const [errorMessage, setErrorMessage] = useState('');
  const [successMessage, setSuccessMessage] = useState('');

  async function handleSubmit() {
    setErrorMessage('');
    setSuccessMessage('');

    if (!username.trim() || !password.trim()) {
      setErrorMessage('Por favor, preencha todos os campos.');
      return;
    }

    setLoading(true);

    try {
      if (isRegister) {
        // Fluxo de Cadastro
        await api.post('register/', { username, password });
        setSuccessMessage('Conta criada com sucesso! Faça seu login.');
        setIsRegister(false);
        setPassword('');
      } else {
        // Fluxo de Login
        await login(username, password);
      }
    } catch (error: any) {
      const msg = error.response?.data?.username?.[0] || error.message || 'Erro de conexão com o servidor.';
      setErrorMessage(msg);
    } finally {
      setLoading(false);
    }
  }

  return (
    <View style={styles.container}>
      {/* Luzes de fundo para dar o efeito de gradiente desfocado da imagem */}
      <View style={[styles.glowBall, styles.glowRed]} />
      <View style={[styles.glowBall, styles.glowBlue]} />

      {/* Card de Vidro (Glassmorphism) */}
      <View style={styles.card}>
        
        {/* Ícone de Avatar do Topo */}
        <View style={styles.avatarContainer}>
          <Feather name="user" size={40} color="rgba(255, 255, 255, 0.6)" />
        </View>

        <Text style={styles.title}>
          {isRegister ? 'Criar Conta' : 'LOGIN'}
        </Text>

        {/* Feedbacks Visuais na Tela */}
        {errorMessage ? <Text style={styles.errorText}>{errorMessage}</Text> : null}
        {successMessage ? <Text style={styles.successText}>{successMessage}</Text> : null}

        {/* Input de Usuário */}
        <View style={styles.inputContainer}>
          <Feather name="user" size={18} color="#fff" style={styles.inputIcon} />
          <TextInput
            style={styles.input}
            placeholder="Nome de Usuário"
            placeholderTextColor="rgba(255, 255, 255, 0.5)"
            value={username}
            onChangeText={setUsername}
            autoCapitalize="none"
          />
        </View>

        {/* Input de Senha */}
        <View style={styles.inputContainer}>
          <Feather name="lock" size={18} color="#fff" style={styles.inputIcon} />
          <TextInput
            style={styles.input}
            placeholder="Senha"
            placeholderTextColor="rgba(255, 255, 255, 0.5)"
            secureTextEntry
            value={password}
            onChangeText={setPassword}
            autoCapitalize="none"
          />
        </View>

        {/* Botão de Entrar / Cadastrar */}
        <TouchableOpacity style={styles.button} onPress={handleSubmit} disabled={loading}>
          {loading ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <Text style={styles.buttonText}>{isRegister ? 'CADASTRAR' : 'ENTRAR'}</Text>
          )}
        </TouchableOpacity>

        {/* Link para recuperar senha usando a propriedade navigation recebida por parâmetro */}
        <TouchableOpacity onPress={() => navigation.navigate('ForgotPassword')} style={{ marginTop: 20, alignItems: 'center' }}>
          <Text style={{ color: '#8D5CFF', fontSize: 13, fontWeight: '600', textDecorationLine: 'underline' }}>
            Esqueceu sua senha?
          </Text>
        </TouchableOpacity>

        {/* Botão para alternar entre Login e Cadastro */}
        <TouchableOpacity style={styles.switchButton} onPress={() => {
          setIsRegister(!isRegister);
          setErrorMessage('');
          setSuccessMessage('');
        }}>
          <Text style={styles.switchText}>
            {isRegister ? 'Já tem uma conta? Faça Login' : 'Não tem conta? Cadastre-se aqui'}
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#131124', 
    position: 'relative',
    overflow: 'hidden',
  },
  glowBall: {
    position: 'absolute',
    width: 350,
    height: 350,
    borderRadius: 175,
    opacity: 0.2,
  },
  glowRed: {
    backgroundColor: '#ff3366',
    top: '15%',
    left: '15%',
  },
  glowBlue: {
    backgroundColor: '#3366ff',
    bottom: '15%',
    right: '15%',
  },
  card: {
    width: '90%',
    maxWidth: 400,
    padding: 30,
    borderRadius: 28,
    backgroundColor: 'rgba(255, 255, 255, 0.06)', 
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.12)', 
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.3,
    shadowRadius: 20,
  },
  avatarContainer: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: 'rgba(255, 255, 255, 0.08)',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 20,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.15)',
  },
  title: {
    fontSize: 22,
    fontWeight: '600',
    color: '#fff',
    marginBottom: 30,
    letterSpacing: 1.5,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    width: '100%',
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255, 255, 255, 0.3)',
    marginBottom: 25,
    paddingBottom: 5,
  },
  inputIcon: {
    marginRight: 12,
    opacity: 0.7,
  },
  input: {
    flex: 1,
    height: 40,
    color: '#fff',
    fontSize: 16,
  },
  button: {
    width: '100%',
    height: 48,
    backgroundColor: '#3f51b5',
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 15,
    shadowColor: '#3f51b5',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.4,
    shadowRadius: 10,
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
    letterSpacing: 1,
  },
  switchButton: {
    marginTop: 20,
  },
  switchText: {
    color: 'rgba(255, 255, 255, 0.6)',
    fontSize: 13,
    textDecorationLine: 'underline',
  },
  errorText: {
    color: '#ff4d4d',
    fontSize: 14,
    marginBottom: 15,
    textAlign: 'center',
    fontWeight: '500',
  },
  successText: {
    color: '#4db8ff',
    fontSize: 14,
    marginBottom: 15,
    textAlign: 'center',
    fontWeight: '500',
  },
});