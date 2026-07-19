import React, { createContext, useState, useEffect, useContext } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import api from '../services/api';

// Interface para estruturar os dados do usuário (ajuste conforme o retorno do seu Django)
interface User {
  id: number;
  username: string;
  email?: string;
}

interface AuthContextData {
  signed: boolean;
  user: User | null;
  loading: boolean; // Adicionado para evitar flashes de tela de login ao atualizar a página
  login(username: string, password: string): Promise<void>;
  logout(): Promise<void>;
}

const AuthContext = createContext<AuthContextData>({} as AuthContextData);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadStorageData() {
      try {
        // Alinhado 100% com as chaves que o api.ts consome
        const storagedToken = await AsyncStorage.getItem('userToken');
        const storagedUser = await AsyncStorage.getItem('user');

        if (storagedToken && storagedUser) {
          // Mantém o padrão Bearer que o api.ts e o Django esperam
          api.defaults.headers.Authorization = `Bearer ${storagedToken}`;
          setUser(JSON.parse(storagedUser));
        }
      } catch (e) {
        console.error("Erro ao carregar dados locais de autenticação:", e);
      } finally {
        setLoading(false);
      }
    }

    loadStorageData();
  }, []);

  async function login(username: string, password: string) {
    try {
      console.log('[Auth] Enviando dados de login para:', api.defaults.baseURL);
      
      // 1. Faz a requisição de login para o back-end Django
      const response = await api.post('login/', { username, password });
      
      console.log('[Auth] Resposta crua do Django:', response.data);

      // 2. Tratamento flexível: aceita 'token', 'key' (DRF) ou 'access' (JWT)
      const token = response.data.token || response.data.key || response.data.access;
      
      // 3. Tratamento flexível de usuário: se o Django não mandar o objeto 'user',
      // criamos um objeto padrão para o React não travar a navegação
      const userData = response.data.user || { id: 1, username: username };

      if (!token) {
        throw new Error("O servidor não retornou um token de autenticação válido.");
      }

      // 4. Salva no estado do React para atualizar a navegação imediatamente
      setUser(userData);
      
      // 5. Injeta o cabeçalho Bearer nas próximas requisições da instância do Axios
      api.defaults.headers.Authorization = `Bearer ${token}`;

      // 6. Persiste as informações localmente (compatível com Web e Mobile)
      await AsyncStorage.setItem('userToken', token);
      await AsyncStorage.setItem('user', JSON.stringify(userData));
      
      console.log('[Auth] Login realizado com sucesso! Redirecionando...');

    } catch (error: any) {
      console.error('[Auth] Erro capturado no processo de login:', error);
      
      let mensagemErro = "Erro inesperado ao tentar logar.";
      
      if (error.response) {
        // O servidor respondeu com um status de erro (ex: 400, 401, 403, 500)
        mensagemErro = `Erro do servidor (${error.response.status}): ${JSON.stringify(error.response.data)}`;
      } else if (error.request) {
        // A requisição foi feita mas o back-end não respondeu (erro de rede / offline)
        mensagemErro = "Não foi possível conectar ao servidor. Verifique se o Django está ativo e na porta correta.";
      } else {
        mensagemErro = error.message;
      }

      alert(mensagemErro); // Exibe o erro real diretamente em um pop-up na tela!
    }
  }

  async function logout() {
    setLoading(true);
    try {
      // Limpa os cabeçalhos do Axios e remove os dados persistidos
      delete api.defaults.headers.Authorization;
      await AsyncStorage.removeItem('userToken');
      await AsyncStorage.removeItem('user');
      setUser(null);
    } catch (e) {
      console.error("Erro ao efetuar logout:", e);
    } finally {
      setLoading(false);
    }
  }

  return (
    <AuthContext.Provider value={{ signed: !!user, user, loading, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export function useAuth() {
  const context = useContext(AuthContext);
  return context;
}