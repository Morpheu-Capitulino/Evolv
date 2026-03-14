# Evolv — Backend API (Node.js & GraphQL) | Fase 1

Bem-vindo ao repositório oficial do Evolv Backend API.

O Evolv é um ecossistema digital inteligente focado na gestão de treinos, evolução corporal e engajamento social em academias.

Este projeto funciona como o motor central da plataforma, utilizando uma arquitetura moderna que combina:
* a simplicidade do REST para autenticação
* com o poder e a flexibilidade do GraphQL para gerenciamento e tráfego de dados complexos

Projeto idealizado, arquitetado e mantido pela Virtana.

## Stack Tecnológica

Tecnologias utilizadas no desenvolvimento da API:

* **Runtime:** Node.js (ES Modules)
* **Framework Web:** Express.js
* **API de Dados:** Apollo Server (GraphQL v5), @as-integrations/express4
* **Banco de Dados:** MongoDB Atlas (DBaaS na nuvem)
* **ODM (Object Data Modeling):** Mongoose
* **Segurança & Criptografia:** Autenticação via JWT (JSON Web Tokens), BcryptJS para hash de senha

## Domínios de Negócio & Funcionalidades

A API está organizada em 6 módulos principais:

### 1. Autenticação (REST)
Sistema responsável pelo acesso seguro à plataforma.
Funcionalidades:
* Registro de usuários com hash seguro de senha
* Login com geração de Token JWT válido por 2 horas

### 2. Usuários (GraphQL)
Gerenciamento completo de perfis de usuários.
Operações disponíveis:
* Listagem
* Atualização
* Exclusão
* Implementação de CRUD completo.

### 3. Catálogo de Exercícios (GraphQL)
Base de dados de exercícios contendo:
* organização por grupo muscular
* links de vídeo demonstrando a execução correta

### 4. Treinos / Workouts (GraphQL)
Sistema de registro de treinos vinculados a usuários.
Cada treino pode conter:
* histórico de séries
* repetições
* carga utilizada
* Com validação relacional entre entidades.

### 5. Evolução Corporal (GraphQL)
Registro de medidas corporais e análise de progresso físico.
O sistema permite:
* comparar avaliações físicas (antes vs depois)
* gerar cálculos de evolução corporal
* retornar mensagens de feedback motivacional

### 6. Social (GraphQL)
Sistema de relacionamento entre usuários.
Funcionalidade principal:
* conexão de amizades entre contas da plataforma

## Arquitetura do Projeto

O projeto foi estruturado priorizando:
* manutenibilidade
* escalabilidade
* separação clara de responsabilidades

```text
evolv-node/
├── index.js                 # Ponto de entrada, configuração do Express e Apollo Server
├── package.json             # Dependências e scripts do projeto
├── .env                     # Variáveis de ambiente (incluído para avaliação Plug & Play)
│
├── controllers/
│   └── authController.js    # Lógica REST para login e registro
│
├── graphql/
│   ├── typeDefs.js          # Schema GraphQL (Queries e Mutations)
│   └── resolvers.js         # Lógica de negócio e integração com banco
│
└── models/                  # Schemas Mongoose
    ├── BodyMeasurement.js
    ├── Exercise.js
    ├── User.js
    └── Workout.js
```

## Segurança e Integridade de Dados

Embora o MongoDB seja um banco NoSQL, o Evolv implementa mecanismos de validação diretamente nos Resolvers do GraphQL para garantir integridade dos dados.

### Prevenção de registros inválidos
Não é possível registrar:
* treinos
* medidas corporais
para usuários inexistentes no banco.

### Catálogo de exercícios validado
Um treino só pode ser salvo se todos os exercícios enviados pelo Front-end existirem previamente no catálogo de exercícios.

### Tratamento de erros GraphQL
Requisições inválidas retornam uma estrutura clara no JSON utilizando o campo: `errors`. Isso permite tratamento adequado no front-end, seguindo as boas práticas de APIs GraphQL.

## Como Rodar o Projeto

### AVISO PARA AVALIAÇÃO
Este projeto foi configurado para ser 100% Plug and Play, facilitando testes e correção.
* O banco de dados está hospedado em MongoDB Atlas
* O arquivo .env já está incluído no projeto
* Não é necessário instalar banco de dados local

### 1. Pré-requisitos
Antes de iniciar, é necessário possuir:
* Node.js instalado (recomendado v18+)
* Postman para testes das requisições

### 2. Subindo o Servidor Local
Abra o terminal na pasta do projeto e instale as dependências:
```bash
npm install
```
Depois inicie o servidor:
```bash
npm run dev
```
Se tudo estiver correto, o terminal exibirá:
* confirmação de conexão com o MongoDB
* a porta em que a API está rodando

## Testando a API

O repositório inclui um arquivo chamado `Evolv.json`. Este arquivo contém uma collection completa de requisições para o Postman, com todas as rotas da API já configuradas.

### Importação no Postman
Para começar os testes:
1. Abra o Postman
2. Clique em Import
3. Selecione o arquivo Evolv.json localizado no projeto
4. Importe a collection

Após importar, todas as requisições da API estarão prontas para uso.

### Fluxo recomendado de testes

#### 1. Criar conta e obter Token
Vá na pasta **1. Autenticação**.
Execute **1.1 Register** e depois **1.2 Login**. 
Copie o token JWT retornado na resposta.

#### 2. Configurar autenticação global
Na collection do Postman "Evolv - Sistema Completo", abra a aba **Variables**.
Cole o token na variável correspondente e salve.
Isso autenticará automaticamente todas as requisições seguintes.

#### 3. Obter ID do usuário
Vá em **2. Gerenciamento de Usuários**.
Execute a listagem e copie o ID do usuário criado.

**Importante:** Sempre que for executar operações como registrar treinos, registrar medidas, adicionar amigos ou realizar consultas, é necessário atualizar manualmente o `userId` no body da requisição com o ID correto do usuário.

#### 4. Criar exercício
Vá na pasta **3. Catálogo**.
Crie um exercício (exemplo: Supino) e copie o ID gerado.

#### 5. Registrar treino
Vá em **4. Treinos** e abra a requisição Registrar Novo Treino.
No body da requisição, insira o ID do usuário e o ID do exercício. 
Envie a requisição para salvar o treino no banco.

#### 6. Comparar evolução corporal
Vá em **5. Medidas**.
Fluxo:
1. Crie uma medida com data antiga (peso e gordura maiores)
2. Copie o ID da medida
3. Crie outra medida com data atual (peso e gordura menores)
4. Copie o ID
5. Execute **5.3 Comparar Evolução** inserindo os dois IDs das medidas.

O sistema irá calcular a evolução corporal e retornar um feedback inteligente de progresso.
