# **Instruções de Inicialização (Ambiente Local)**

Este repositório contém o projeto **TaskFlow**, um ecossistema completo composto por um Backend construído com Django REST Framework e um Frontend Mobile em React Native (Expo).

## **1. Pré-requisitos e Instalação de Ferramentas**
Para rodar o projeto do zero, garanta que as seguintes ferramentas estejam instaladas no seu sistema:
- **Python (v3.10 ou superior)**
- **Node.js (v18 ou superior) e npm/yarn**
- **Expo CLI** (executado via `npx`)
- **Expo Go** instalado no seu smartphone ou um emulador configurado.

---

## **2. Passo a Passo do Backend (Django REST Framework)**
Navegue até o diretório `Teste-Tecnico-Django` através do seu terminal:

### **Passo 2.1: Instalação das Dependências**
Ative o seu ambiente virtual existente ou crie um novo, e instale os pacotes:
```bash
# Ativar o ambiente virtual existente (Windows)
.\env_django\Scripts\activate

# Instalar dependências listadas
pip install -r requirements.txt
Passo 2.2: Migrações e Banco de Dados
Execute os comandos para estruturar o banco local:

Bash
python manage.py makemigrations
python manage.py migrate
Passo 2.3: Iniciar o Servidor
Bash
python manage.py runserver
O backend estará rodando em: http://127.0.0.1:8000/

3. Passo a Passo do Frontend (React Native + Expo)
Abra um novo terminal e navegue até a pasta Frontend-React-Native:

Passo 3.1: Instalação das Dependências
Bash
npm install
Passo 3.2: Iniciar o Projeto
Bash
npx expo start
Escaneie o QR Code gerado no terminal com o aplicativo Expo Go no seu celular ou pressione w para testar no navegador.
