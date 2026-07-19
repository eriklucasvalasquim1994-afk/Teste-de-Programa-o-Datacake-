import React, { useState } from 'react';
import { 
  ActivityIndicator, 
  View, 
  StyleSheet 
} from 'react-native';
import { AuthProvider, useAuth } from './src/contexts/AuthContext';
import LoginScreen from './src/screens/LoginScreen';
import HomeScreen from './src/screens/HomeScreen';
import ForgotPasswordScreen from './src/screens/ForgotPasswordScreen';

function AppContent() {
  const { signed, loading } = useAuth();
  
  // Controle de navegação manual por estado para evitar dependências pesadas
  const [currentScreen, setCurrentScreen] = useState<'login' | 'forgot'>('login');

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#3f51b5" />
      </View>
    );
  }

  // Se estiver autenticado, vai para a Home do portal
  if (signed) {
    return <HomeScreen />;
  }

  // Alterna as telas de Login e Recuperação de senha injetando a função de navegação
  return currentScreen === 'login' ? (
    <LoginScreen navigation={{ navigate: () => setCurrentScreen('forgot') }} />
  ) : (
    <ForgotPasswordScreen navigation={{ navigate: () => setCurrentScreen('login') }} />
  );
}

// Componente principal que envelopa a aplicação com o contexto de autenticação
export default function App() {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  );
}

const styles = StyleSheet.create({
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#131124', // Mantendo o padrão Dark moderno do portal
  },
});