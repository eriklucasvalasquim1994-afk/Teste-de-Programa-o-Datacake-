import React, { useState, useEffect, useRef } from 'react';
import { View, Text, StyleSheet, FlatList, TextInput, TouchableOpacity, ActivityIndicator, Alert, Animated, Platform } from 'react-native';
import { useAuth } from '../contexts/AuthContext';
import api from '../services/api';

interface Task {
  id: number;
  title: string;
  completed: boolean;
  created_at?: string; // Campo de data vindo do Django
}

type FilterStatus = 'all' | 'pending' | 'completed';
type OrderDirection = '-created_at' | 'created_at'; // Padrão Django para ordenação

export default function HomeScreen() {
  const { logout, user } = useAuth();
  const [tasks, setTasks] = useState<Task[]>([]);
  const [newTitle, setNewTitle] = useState('');
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  // Estados para Filtro e Ordenação
  const [statusFilter, setStatusFilter] = useState<FilterStatus>('all');
  const [orderBy, setOrderBy] = useState<OrderDirection>('-created_at');

  // Estados para edição inline e sutil
  const [editingTaskId, setEditingTaskId] = useState<number | null>(null);
  const [editingTitle, setEditingTitle] = useState('');

  const fadeAnim = useRef(new Animated.Value(0)).current;

  // Busca as tarefas aplicando os filtros direto na API (Query Params)
  async function fetchTasks(status = statusFilter, order = orderBy) {
    setLoading(true);
    try {
      let url = `tasks/?ordering=${order}`;
      if (status === 'pending') url += '&completed=false';
      if (status === 'completed') url += '&completed=true';

      const response = await api.get(url);
      setTasks(response.data);
      
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 400,
        useNativeDriver: true,
      }).start();
    } catch (error) {
      Alert.alert('Erro', 'Não foi possível carregar as tarefas.');
    } finally {
      setLoading(false);
    }
  }

  // Recarrega sempre que o filtro ou a ordenação mudarem
  useEffect(() => {
    fetchTasks(statusFilter, orderBy);
  }, [statusFilter, orderBy]);

  async function handleAddTask() {
    if (!newTitle.trim()) {
      Alert.alert('Aviso', 'Digite um título para a tarefa.');
      return;
    }

    setSubmitting(true);
    try {
      const response = await api.post('tasks/', { title: newTitle, completed: false });
      // Para manter a UI consistente, recarregamos com os filtros ativos
      fetchTasks();
      setNewTitle('');
    } catch (error) {
      Alert.alert('Erro', 'Falha ao criar tarefa.');
    } finally {
      setSubmitting(false);
    }
  }

  async function handleToggleTask(id: number, currentStatus: boolean) {
    const nextStatus = !currentStatus;
    try {
      await api.patch(`tasks/${id}/`, { completed: nextStatus });
      
      // Se estiver filtrando por pendente/concluída, removemos do state visual
      if (statusFilter !== 'all') {
        setTasks(prev => prev.filter(t => t.id !== id));
      } else {
        setTasks(prevTasks =>
          prevTasks.map(t => (t.id === id ? { ...t, completed: nextStatus } : t))
        );
      }
    } catch (error) {
      Alert.alert('Erro', 'Não foi possível atualizar a tarefa.');
    }
  }

  function handleEditTask(id: number, currentTitle: string) {
    setEditingTaskId(id);
    setEditingTitle(currentTitle);
  }

  async function handleSaveEdit(id: number) {
    if (!editingTitle.trim()) {
      if (Platform.OS === 'web') alert('O título não pode ser vazio.');
      else Alert.alert('Erro', 'O título não pode ser vazio.');
      return;
    }

    try {
      await api.patch(`tasks/${id}/`, { title: editingTitle.trim() });
      setTasks(prevTasks =>
        prevTasks.map(t => (t.id === id ? { ...t, title: editingTitle.trim() } : t))
      );
      setEditingTaskId(null);
    } catch (error) {
      if (Platform.OS === 'web') alert('Não foi possível salvar as alterações.');
      else Alert.alert('Erro', 'Não foi possível salvar as alterações.');
    }
  }

  async function handleDeleteTask(id: number) {
    try {
      await api.delete(`tasks/${id}/`);
      setTasks(tasks.filter(t => t.id !== id));
    } catch (error) {
      Alert.alert('Erro', 'Não foi possível deletar a tarefa.');
    }
  }

  // Cálculos globais para os contadores do Header
  const total = tasks.length;
  const pending = tasks.filter(t => !t.completed).length;
  const completedCount = tasks.filter(t => t.completed).length;
  const progressPercentage = total > 0 ? Math.round((completedCount / total) * 100) : 0;

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Bom dia';
    if (hour < 18) return 'Boa tarde';
    return 'Boa noite';
  };

  const getProgressMessage = () => {
    if (progressPercentage === 100 && total > 0) return 'Tudo pronto! 🚀';
    if (progressPercentage >= 75) return 'Quase lá! 🔥';
    if (progressPercentage >= 50) return 'Metade já foi! ⚡';
    if (progressPercentage > 0) return 'Muito bom 🚀';
    return '🌱 Comece o dia focado!';
  };

  return (
    <View style={styles.mainContainer}>
      
      {/* CÍRCULOS GLOW */}
      <View style={[styles.glowCircle, styles.circlePurple]} />
      <View style={[styles.glowCircle, styles.circleBlue]} />
      
      {/* SIDEBAR */}
      <View style={styles.sidebar}>
        <View>
          <View style={styles.brandContainer}>
            <Text style={styles.brandText}>Task<Text style={styles.brandAccent}>Flow</Text></Text>
            <Text style={styles.subtitle}>Gerenciador Pessoal</Text>
          </View>
        </View>

        <View style={styles.sidebarFooter}>
          <View style={styles.userProfileBox}>
            <Text style={styles.userIconTxt}>👤</Text>
            <View>
              <Text style={styles.profileName}>{user?.username || 'Erik'}</Text>
              <Text style={styles.profileEmail}>{user?.email || 'erik@email.com'}</Text>
            </View>
          </View>
          <TouchableOpacity style={styles.logoutButton} onPress={logout}>
            <Text style={{ marginRight: 8 }}>↩</Text>
            <Text style={styles.logoutText}>Sair</Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* CONTEÚDO PRINCIPAL */}
      <View style={styles.contentArea}>
        
        {/* HEADER */}
        <View style={styles.headerContainer}>
          <View style={styles.headerLeft}>
            <Text style={styles.headerTitle}>{getGreeting()}, {user?.username || 'erik'} 👋</Text>
            <Text style={styles.headerSubtitle}>Você possui {pending} tarefas pendentes</Text>
          </View>
          
          <View style={styles.progressContainer}>
            <View style={styles.progressHeader}>
              <Text style={styles.progressText}>{progressPercentage}%</Text>
              <Text style={styles.progressMessage}>{getProgressMessage()}</Text>
            </View>
            <View style={styles.progressBarTrack}>
              <View style={[styles.progressBarFill, { width: `${progressPercentage}%` }]} />
            </View>
          </View>
        </View>

        {/* FORMULÁRIO */}
        <View style={styles.form}>
          <TextInput
            style={styles.input}
            placeholder="No que você vai focar agora? Digite a nova tarefa..."
            placeholderTextColor="#625f7a"
            value={newTitle}
            onChangeText={setNewTitle}
          />
          <TouchableOpacity style={styles.addButtonGradient} onPress={handleAddTask} disabled={submitting}>
            {submitting ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <View style={styles.innerButtonContent}>
                <Text style={styles.addButtonText}>Criar Tarefa</Text>
              </View>
            )}
          </TouchableOpacity>
        </View>

        {/* --- BARRA DE FILTROS E ORDENAÇÃO (REQUISITO EXIGIDO) --- */}
        <View style={styles.filterBarContainer}>
          <View style={styles.statusTabContainer}>
            <TouchableOpacity 
              style={[styles.tabButton, statusFilter === 'all' && styles.tabButtonActive]}
              onPress={() => setStatusFilter('all')}
            >
              <Text style={[styles.tabButtonText, statusFilter === 'all' && styles.tabButtonTextActive]}>Todas</Text>
            </TouchableOpacity>

            <TouchableOpacity 
              style={[styles.tabButton, statusFilter === 'pending' && styles.tabButtonActive]}
              onPress={() => setStatusFilter('pending')}
            >
              <Text style={[styles.tabButtonText, statusFilter === 'pending' && styles.tabButtonTextActive]}>Pendentes</Text>
            </TouchableOpacity>

            <TouchableOpacity 
              style={[styles.tabButton, statusFilter === 'completed' && styles.tabButtonActive]}
              onPress={() => setStatusFilter('completed')}
            >
              <Text style={[styles.tabButtonText, statusFilter === 'completed' && styles.tabButtonTextActive]}>Concluídas</Text>
            </TouchableOpacity>
          </View>

          {/* Botão de Ordenação por Data */}
          <TouchableOpacity 
            style={styles.orderToggleButton}
            onPress={() => setOrderBy(prev => prev === '-created_at' ? 'created_at' : '-created_at')}
          >
            <Text style={styles.orderToggleText}>
              📅 {orderBy === '-created_at' ? 'Mais Recentes primeiro' : 'Mais Antigas primeiro'}
            </Text>
          </TouchableOpacity>
        </View>

        {/* LISTAGEM DE TAREFAS */}
        {loading ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color="#6D5DFD" />
          </View>
        ) : (
          <Animated.FlatList
            data={tasks}
            keyExtractor={item => item.id.toString()}
            contentContainerStyle={{ paddingBottom: 20 }}
            style={{ opacity: fadeAnim }}
            ListEmptyComponent={
              <View style={styles.emptyContainer}>
                <Text style={styles.emptyText}>Nenhuma tarefa encontrada para este filtro. 🌱</Text>
              </View>
            }
            renderItem={({ item }) => {
              const isEditing = editingTaskId === item.id;

              return (
                <View style={[styles.taskCard, item.completed && styles.taskCardCompleted]}>
                  
                  <View style={styles.taskTextContainer}>
                    <TouchableOpacity 
                      style={[styles.customCheck, item.completed && styles.customCheckActive]}
                      onPress={() => !isEditing && handleToggleTask(item.id, item.completed)}
                      disabled={isEditing}
                      activeOpacity={0.7}
                    >
                      {item.completed && <Text style={styles.checkMark}>✓</Text>}
                    </TouchableOpacity>

                    <View style={{ flex: 1 }}>
                      {isEditing ? (
                        <TextInput
                          style={styles.inlineInput}
                          value={editingTitle}
                          onChangeText={setEditingTitle}
                          autoFocus
                          onSubmitEditing={() => handleSaveEdit(item.id)}
                          onBlur={() => handleSaveEdit(item.id)}
                          returnKeyType="done"
                        />
                      ) : (
                        <>
                          <Text style={[styles.taskTitle, item.completed && styles.taskCompleted]}>
                            {item.title}
                          </Text>
                          {item.created_at && (
                            <Text style={styles.taskTimeMeta}>
                              Criado em: {new Date(item.created_at).toLocaleDateString('pt-BR')} às {new Date(item.created_at).toLocaleTimeString('pt-BR', {hour: '2-digit', minute:'2-digit'})}
                            </Text>
                          )}
                        </>
                      )}
                    </View>
                  </View>
                  
                  <View style={styles.actionButtonsContainer}>
                    {isEditing ? (
                      <TouchableOpacity style={styles.saveIconButton} onPress={() => handleSaveEdit(item.id)}>
                        <Text style={{ fontSize: 13, color: '#6D5DFD', fontWeight: 'bold' }}>💾</Text>
                      </TouchableOpacity>
                    ) : (
                      <TouchableOpacity style={styles.iconActionButton} activeOpacity={0.6} onPress={() => handleEditTask(item.id, item.title)}>
                        <Text style={{ fontSize: 14 }}>✏️</Text>
                      </TouchableOpacity>
                    )}
                    
                    <TouchableOpacity 
                      style={styles.deleteIconButton} 
                      onPress={() => isEditing ? setEditingTaskId(null) : handleDeleteTask(item.id)}
                    >
                      <Text style={{ fontSize: 13, color: '#ff4d6d', fontWeight: 'bold' }}>
                        {isEditing ? '✕' : '🗑'}
                      </Text>
                    </TouchableOpacity>
                  </View>

                </View>
              );
            }}
          />
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  mainContainer: {
    flex: 1,
    flexDirection: 'row',
    backgroundColor: '#0B0914', 
    position: 'relative',
  },
  glowCircle: {
    position: 'absolute',
    width: 400,
    height: 400,
    borderRadius: 200,
    opacity: 0.12,
  },
  circlePurple: {
    backgroundColor: '#6D5DFD',
    top: -150,
    right: -100,
  },
  circleBlue: {
    backgroundColor: '#8D5CFF',
    bottom: -150,
    left: 200,
  },
  sidebar: {
    width: 280,
    backgroundColor: '#141228',
    borderRightWidth: 1,
    borderColor: '#201d36',
    padding: 24,
    justifyContent: 'space-between',
  },
  brandContainer: {
    marginBottom: 35,
  },
  brandText: {
    fontSize: 26,
    fontWeight: '800',
    color: '#fff',
    letterSpacing: 0.5,
  },
  brandAccent: {
    color: '#6D5DFD',
  },
  subtitle: {
    color: '#625f7a',
    fontSize: 12,
    marginTop: 4,
  },
  sidebarFooter: {
    marginTop: 20,
  },
  userProfileBox: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#1B1931',
    padding: 12,
    borderRadius: 18,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#2a2647',
  },
  userIconTxt: {
    marginRight: 12,
    backgroundColor: '#202040',
    padding: 8,
    borderRadius: 12,
    fontSize: 16,
  },
  profileName: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
  },
  profileEmail: {
    color: '#625f7a',
    fontSize: 11,
    marginTop: 2,
  },
  logoutButton: {
    flexDirection: 'row',
    backgroundColor: '#241219',
    borderWidth: 1,
    borderColor: '#421926',
    paddingVertical: 12,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
  },
  logoutText: {
    color: '#ff4d6d',
    fontWeight: '600',
    fontSize: 14,
  },
  contentArea: {
    flex: 1,
    padding: 40,
  },
  headerContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 35,
  },
  headerLeft: {
    flex: 1,
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: '800',
    color: '#fff',
    letterSpacing: -0.5,
  },
  headerSubtitle: {
    fontSize: 14,
    color: '#625f7a',
    marginTop: 6,
  },
  progressContainer: {
    width: 240,
    backgroundColor: '#141228',
    padding: 14,
    borderRadius: 18,
    borderWidth: 1,
    borderColor: '#201d36',
  },
  progressHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'baseline',
    marginBottom: 8,
  },
  progressText: {
    color: '#8D5CFF',
    fontSize: 20,
    fontWeight: '800',
  },
  progressMessage: {
    color: '#a385ff',
    fontSize: 12,
    fontWeight: '600',
  },
  progressBarTrack: {
    height: 8,
    backgroundColor: '#202040',
    borderRadius: 4,
    overflow: 'hidden',
  },
  progressBarFill: {
    height: '100%',
    backgroundColor: '#6D5DFD',
    borderRadius: 4,
  },
  form: {
    flexDirection: 'row',
    marginBottom: 25,
  },
  input: {
    flex: 1,
    height: 56,
    backgroundColor: '#202040', 
    borderRadius: 18, 
    paddingHorizontal: 20,
    color: '#fff',
    borderWidth: 1,
    borderColor: '#2a2a54',
    marginRight: 14,
    fontSize: 15,
  },
  addButtonGradient: {
    paddingHorizontal: 24,
    height: 56,
    backgroundColor: '#6D5DFD', 
    borderRadius: 18, 
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#8D5CFF',
  },
  innerButtonContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  addButtonText: {
    color: '#fff',
    fontSize: 15,
    fontWeight: '700',
  },
  filterBarContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  statusTabContainer: {
    flexDirection: 'row',
    backgroundColor: '#141228',
    padding: 4,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#201d36',
  },
  tabButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
  },
  tabButtonActive: {
    backgroundColor: '#6D5DFD',
  },
  tabButtonText: {
    color: '#625f7a',
    fontSize: 13,
    fontWeight: '600',
  },
  tabButtonTextActive: {
    color: '#fff',
  },
  orderToggleButton: {
    backgroundColor: '#1B1931',
    borderWidth: 1,
    borderColor: '#262345',
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 10,
  },
  orderToggleText: {
    color: '#a385ff',
    fontSize: 12,
    fontWeight: '600',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptyContainer: {
    padding: 40,
    alignItems: 'center',
  },
  emptyText: {
    color: '#625f7a',
    fontSize: 14,
  },
  taskCard: {
    flexDirection: 'row',
    backgroundColor: '#1B1931', 
    paddingVertical: 18,
    paddingHorizontal: 22,
    borderRadius: 18, 
    marginBottom: 14,
    alignItems: 'center',
    justifyContent: 'space-between',
    borderWidth: 1,
    borderColor: '#262345',
  },
  taskCardCompleted: {
    backgroundColor: '#121024',
    borderColor: '#1d1a33',
    opacity: 0.6,
  },
  taskTextContainer: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: 16,
  },
  inlineInput: {
    flex: 1,
    backgroundColor: '#0B0914',
    color: '#fff',
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#6D5DFD',
    fontSize: 16,
  },
  customCheck: {
    width: 24,
    height: 24,
    borderRadius: 8,
    borderWidth: 2,
    borderColor: '#3a3566',
    marginRight: 16,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#0B0914',
  },
  customCheckActive: {
    backgroundColor: '#6D5DFD',
    borderColor: '#6D5DFD',
  },
  checkMark: {
    color: '#fff',
    fontSize: 13,
    fontWeight: 'bold',
  },
  taskTitle: {
    color: '#e2e1e6',
    fontSize: 16,
    fontWeight: '600',
  },
  taskCompleted: {
    textDecorationLine: 'line-through',
    color: '#555273',
  },
  taskTimeMeta: {
    fontSize: 11,
    color: '#555273',
    marginTop: 4,
  },
  actionButtonsContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  iconActionButton: {
    padding: 8,
    marginRight: 6,
  },
  saveIconButton: {
    backgroundColor: '#1F1A3A',
    borderWidth: 1,
    borderColor: '#3D317C',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 12,
    marginRight: 6,
  },
  deleteIconButton: {
    backgroundColor: '#241219',
    borderWidth: 1,
    borderColor: '#421926',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 12,
  },
});