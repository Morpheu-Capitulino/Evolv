# Evolv - Training System 

## Integrantes da Equipe
* Morpheu Capitulino
* Miguel Maranão de Vasconcelos
* Luiz Carlos Montenegro de Sousa
* Kathelen Vitória brito Sales
* José Vitor Silva Barbosa

---

## Descrição do Aplicativo
O **Evolv** é um aplicativo mobile focado em musculação e periodização de treinos. Ele utiliza uma interface moderna para oferecer rotinas de exercícios adaptativas, análise de progressão corporal (KPIs de saúde) e uma vertente de gamificação social, permitindo adicionar amigos e comparar rankings semanais de treinos concluídos.

---

## Tecnologias Utilizadas
* **Frontend Mobile:** React Native, Expo
* **Navegação:** React Navigation (Native Stack & Bottom Tabs)
* **Integração de Dados:** Apollo Client (GraphQL)
* **Armazenamento Local:** AsyncStorage
* **UI/Ícones:** Lucide React Native, React Native SVG
* **Backend :** Node.js, Express, Apollo Server, MongoDB (Mongoose)

---

## Funcionalidades Implementadas
O aplicativo superou o requisito mínimo de 3 telas e já conta com um ecossistema completo:

1. **Onboarding Inteligente:** Coleta de dados biométricos e objetivos do utilizador.
2. **Dashboard de Treino (Home):** Calendário semanal, listagem de rotinas e alertas.
3. **Detalhes e Execução:** Visualização de carga máxima (1RM) e checklist do exercício.
4. **Registo de Séries:** Temporizador de descanso ativo e registo de cargas.
5. **Evolução Corporal (Progresso):** Análise de simetria muscular com modelo humano em SVG e histórico de medidas.
6. **Clube Privado (Amigos):** Ranking gamificado, pesquisa de atletas e envio de solicitações de amizade.
7. **Perfil de Utilizador:** Gestão da conta, alteração de senha e visualização do *Streak* de treinos.

---

## Instruções para Execução do App

## Passo 1: Configurar e Rodar o Backend
Abra o seu terminal, navegue até a pasta do servidor e instale as dependências:

```bash
cd backend
npm install
npm start
````

O servidor GraphQL e a conexão com o MongoDB serão iniciados na porta http://localhost:8080/graphql.

## Passo 2: Configurar as Variáveis de Ambiente do Mobile
Navegue até a pasta do projeto mobile:

```bash
cd evolv-mobile
```
Crie ou edite o arquivo .env na raiz da pasta evolv-mobile/ e configure o IP da API de acordo com o seu ambiente de testes:

Plaintext
# Para testar em emuladores no computador (Android Studio / Xcode):
EXPO_PUBLIC_API_URL=http://localhost:8080

# Para testar no celular real via Expo Go (Insira o IPv4 da sua máquina):
EXPO_PUBLIC_API_URL=[http://192.168.1.](http://192.168.1.)X:8080

## Passo 3: Iniciar o Aplicativo Mobile
Instale os pacotes necessários e inicie o gerenciador de pacotes do Expo:

```bash
npm install
npx expo start
```
Celular Físico: Baixe o aplicativo Expo Go na Google Play Store ou App Store e escaneie o código QR exibido no terminal. (Certifique-se de que o computador e o celular estão conectados na mesma rede Wi-Fi).

Emulador: Pressione a tecla a para abrir no emulador Android ou i para o simulador iOS.

## Estrutura do Projeto

O repositório está estruturado num formato monorepo, separando a API do aplicativo mobile:

```text
evolv-node/
│
├── backend/                  # Servidor Node.js + GraphQL (Bônus)
│   ├── src/
│   │   ├── models/           # Schemas do MongoDB (User, Workout, Exercise)
│   │   ├── resolvers.js      # Lógica das requisições GraphQL
│   │   └── typeDefs.js       # Definição dos tipos de dados
│   └── index.js
│
├── evolv-mobile/             # Aplicativo React Native (Foco da Fase 1)
│   ├── App.js                # Ponto de entrada e provedor do Apollo
│   ├── src/
│   │   ├── components/       # Componentes reutilizáveis (Header, BottomNav)
│   │   └── pages/            # Telas do aplicativo (Home, Treino, Progresso, etc.)
│   └── package.json
│
└── .gitignore
