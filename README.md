# Evolv (Fase 1)

Bem-vindo ao repositório oficial do **Evolv**. Este é um ecossistema digital inteligente focado na gestão de treinos, evolução corporal e engajamento social. O projeto foi idealizado e arquitetado pela **Virtana** para o programa Centelha 2026.

Este repositório contém o motor central (Backend API) e a interface de utilizador (Frontend PWA), utilizando uma arquitetura moderna que une a simplicidade do **REST** com a flexibilidade do **GraphQL**.

---

## Guia de Instalação: Plug & Play

Este projeto foi configurado para funcionar imediatamente. **O banco de dados está na nuvem (MongoDB Atlas)**, eliminando a necessidade de configurações locais de base de dados para a avaliação.

### Pré-requisitos
* **Node.js** instalado (v18 ou superior)
* Gerenciador de pacotes (`npm` ou `yarn`)

---

### 1 Passo: Configurar o Backend (Servidor)
Abra um terminal na pasta `backend`:

1. Instale as dependências:
   ```bash
   npm install
Inicie o servidor:

Bash
npm run dev
Porta: http://localhost:8080

Confirmação: Aguarde a mensagem 🔥 MongoDB Conectado! e 🚀 API do Evolv rodando na porta 8080.

2️ Passo: Configurar o Frontend (Interface)
Abra um segundo terminal na pasta frontend:

Instale as dependências:

Bash
npm install
Inicie a aplicação:

Bash
npm run dev
Acesso: Abra o navegador em http://localhost:5173.

Nota PWA: Para testar a instalação no telemóvel, utilize o Chrome (Android) ou Safari (iOS).

🛠️ Stack Tecnológica
Backend (Node.js & GraphQL)
Runtime: Node.js (ES Modules)

Framework: Express.js

API: Apollo Server (GraphQL v5) + @as-integrations/express4

Banco de Dados: MongoDB Atlas (DBaaS na Nuvem)

Segurança: Autenticação JWT com opção "Manter Conectado" e Criptografia BcryptJS.

Frontend (React & PWA)
Framework: React.js via Vite

Cliente API: Apollo Client (GraphQL)

PWA: Vite PWA Plugin (Instalável e com suporte a offline)

UI/UX: Design Glassmorphism (Midnight Blue & Gold), Ícones via Lucide-React.

Domínios de Negócio & Funcionalidades
Autenticação Inteligente (REST): Login com checkbox "Manter conectado" que estende a validade do token para 30 dias, adaptado para a persistência do iOS.

Checklist de Treino Automatizado (GraphQL): O sistema marca o exercício como concluído automaticamente assim que deteta o envio de uma carga para o banco de dados.

AI Coach (IA Híbrida): Algoritmo que analisa medidas corporais e objetivos (Hipertrofia/Cutting) para sugerir a rotina de treino ideal (A, B, C ou D).

Evolução & Performance: Registro de séries, repetições e carga com cálculo automático de 1RM e histórico detalhado.

Social: Sistema de amizades para conexão entre usuários da plataforma.

Arquitetura do Projeto
Plaintext
backend/
├── .env                     # Variáveis de ambiente (Incluso para avaliação)
├── src/
│   ├── index.js             # Ponto de entrada (Express/Apollo)
│   ├── controllers/         # Lógica REST para auth
│   ├── graphql/             # typeDefs e resolvers
│   └── models/              # Schemas Mongoose (User, Workout, Exercise, etc.)
│
frontend/
├── public/                  # Logos e Assets do PWA
├── src/
│   ├── components/          # Componentes globais
│   ├── pages/               # Ecrãs da aplicação
│   └── lib/                 # Configuração do Apollo Client
└── vite.config.js           # Configuração de PWA e Build
