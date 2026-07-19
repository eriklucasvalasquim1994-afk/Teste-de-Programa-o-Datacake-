from rest_framework import serializers
from django.contrib.auth.models import User
from .models import Task

# Serializer para gerenciar os dados dos Usuários (Cadastro)
class UserSerializer(serializers.ModelSerializer):
    # Garante que a senha só será enviada na criação, nunca retornada no JSON
    password = serializers.CharField(write_only=True)

    class Meta:
        model = User
        fields = ['id', 'username', 'email', 'password']

    def create(self, validated_data):
        # Usa o método criar_user do Django para criptografar a senha automaticamente
        user = User.objects.create_user(
            username=validated_data['username'],
            email=validated_data.get('email', ''),
            password=validated_data['password']
        )
        return user


# Serializer para gerenciar as Tarefas (CRUD)
class TaskSerializer(serializers.ModelSerializer):
    # O campo user será de apenas leitura, pois vamos preenchê-lo direto via código com o usuário logado
    user = serializers.ReadOnlyField(source='user.username')

    class Meta:
        model = Task
        fields = ['id', 'user', 'title', 'description', 'is_completed', 'created_at', 'updated_at']