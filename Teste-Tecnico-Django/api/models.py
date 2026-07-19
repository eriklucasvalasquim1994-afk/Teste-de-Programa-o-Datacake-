from django.db import models
from django.contrib.auth.models import User

class Task(models.Model):
    # Vincula a tarefa a um usuário específico. Se o usuário for deletado, as tarefas dele somem.
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='tasks')
    
    title = models.CharField(max_length=255)
    description = models.TextField(blank=True, null=True)
    
    # Status da tarefa (Pendente por padrão)
    is_completed = models.BooleanField(default=False)
    
    # Datas automáticas para os filtros exigidos
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ['-created_at']  # Traz as mais novas primeiro por padrão

    def __str__(self):
        return self.title


