from rest_framework import generics, permissions
from rest_framework_simplejwt.views import TokenObtainPairView
from django.contrib.auth.models import User
from .models import Task
from .serializers import UserSerializer, TaskSerializer

# 1. Rota de Cadastro de Usuário (Aberto para qualquer um se registrar)
class RegisterView(generics.CreateAPIView):
    queryset = User.objects.all()
    permission_classes = [permissions.AllowAny]  # Rota pública
    serializer_class = UserSerializer

# 2. Rota de Listagem e Criação de Tarefas (Protegida)
class TaskListCreateView(generics.ListCreateAPIView):
    serializer_class = TaskSerializer
    permission_classes = [permissions.IsAuthenticated]  # Só entra com Token JWT

    # Regra 1: O usuário só lista as PRÓPRIAS tarefas
    def get_queryset(self):
        user = self.request.user
        queryset = Task.objects.filter(user=user)

        # Regra 2: Filtro por Status (Lê 'completed' da URL e aplica no campo 'is_completed' do Model)
        status_param = self.request.query_params.get('completed')
        if status_param is not None:
            is_completed_bool = status_param.lower() == 'true'
            queryset = queryset.filter(is_completed=is_completed_bool)

        # Regra 3: Ordenação por Data de Criação exigida no teste (?ordering=-created_at)
        ordering_param = self.request.query_params.get('ordering', '-created_at')
        if ordering_param in ['created_at', '-created_at']:
            queryset = queryset.order_by(ordering_param)

        return queryset

    # Vincula automaticamente a tarefa ao usuário que está logado na sessão
    def perform_create(self, serializer):
        serializer.save(user=self.request.user)

# 3. Rota de Edição, Detalhes e Exclusão de uma Tarefa específica (Protegida)
class TaskDetailView(generics.RetrieveUpdateDestroyAPIView):
    serializer_class = TaskSerializer
    permission_classes = [permissions.IsAuthenticated]

    # Garante que o usuário não consiga editar ou deletar a tarefa de outro usuário pelo ID
    def get_queryset(self):
        return Task.objects.filter(user=self.request.user)