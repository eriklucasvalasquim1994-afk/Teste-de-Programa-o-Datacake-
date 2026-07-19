import axios from 'axios';
import { Platform } from 'react-native';
import Constants from 'expo-constants';
import AsyncStorage from '@react-native-async-storage/async-storage';

// Função para descobrir o IP correto em tempo real
const getBaseURL = () => {
  // 1. Se estiver rodando no Navegador (Web)
  if (Platform.OS === 'web') {
    return 'http://localhost:8000/api/';
  }

  // 2. Se estiver rodando no celular físico ou emulador (Android/iOS)
  // O Expo fornece o IP da sua máquina de desenvolvimento através do hostUri
  const hostUri = Constants.expoConfig?.hostUri;
  
  if (hostUri) {
    const ip = hostUri.split(':')[0]; // Extrai apenas o IP, removendo a porta do Expo
    return `http://${ip}:8000/api/`;  // Aponta para a porta 8000 do seu Django
  }

  // Fallback padrão de segurança caso o hostUri falhe
  return 'http://10.0.2.2:8000/api/';
};

const API_URL = getBaseURL();

console.log(`[API] Conectando dinamicamente em: ${API_URL}`);

const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Interceptor para injetar o token
api.interceptors.request.use(
  async (config) => {
    try {
      const token = await AsyncStorage.getItem('userToken');
      if (token && config.headers) {
        config.headers.Authorization = `Bearer ${token}`;
      }
    } catch (error) {
      console.error('Erro ao buscar o token na API:', error);
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

export default api;