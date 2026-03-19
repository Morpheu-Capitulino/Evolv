# Evolv — Backend API (Node.js & GraphQL) | Fase 1

Bem-vindo ao repositório oficial do Evolv Backend API.
O Evolv é um ecossistema digital inteligente focado na gestão de treinos, evolução corporal e engajamento social em academias.

Este projeto atua como o motor central da plataforma, utilizando uma arquitetura moderna que mescla:

a simplicidade do REST (para autenticação)

com o poder e a flexibilidade do GraphQL (para gestão e tráfego de dados complexos)

Projeto idealizado, arquitetado e mantido pela Virtana.

## Stack Tecnológica

O sistema foi inteiramente refatorado de Java/Spring Boot para o ecossistema JavaScript, visando alta performance de I/O e alinhamento total com o front-end.

Tecnologias utilizadas:

Runtime: Node.js (ES Modules)

Framework Web: Express.js

API de Dados: Apollo Server (GraphQL v5) + @as-integrations/express4

Banco de Dados: MongoDB Atlas (DBaaS na Nuvem)

ODM (Object Data Modeling): Mongoose

Segurança & Criptografia:

Autenticação via JWT (JSON Web Tokens)

BcryptJS para hash de senha

## Domínios de Negócio & Funcionalidades

A API está dividida em 6 módulos principais:

### 1. Autenticação (REST)

Registro seguro com hash de senha e Login com geração de Token JWT válido por 2 horas.

### 2. Usuários (GraphQL)

Gestão completa de perfis:

listagem

atualização

deleção

Operações CRUD completas.

### 3. Catálogo de Exercícios (GraphQL)

Base de dados de exercícios contendo:

divisão por grupo muscular

links em vídeo para execução correta

### 4. Treinos / Workouts (GraphQL)

Registro diário de treinos vinculados a um usuário, contendo:

histórico detalhado de séries

repetições

carga

Com validação relacional entre entidades.

### 5. Evolução Corporal (GraphQL)

Registro de medidas corporais e um módulo de Inteligência do Sistema que:

compara avaliações físicas (Antes vs Depois)

retorna cálculos matemáticos de evolução

gera mensagens motivacionais de progresso

### 6. Social (GraphQL)

Sistema de amizades, permitindo conexão entre diferentes contas da plataforma.

## Arquitetura do Projeto

O projeto foi reestruturado seguindo o padrão de mercado, isolando o código-fonte na pasta `src` para garantir:
* manutenibilidade
* escalabilidade
* separação clara de responsabilidades

```text
backend/
├── .env                     # Variáveis de ambiente (incluído para avaliação Plug & Play)
├── .gitignore               # Arquivos ignorados pelo Git
├── Evolv.json               # Collection do Postman com todas as rotas
├── package.json             # Dependências e scripts do projeto
├── README.md                # Documentação principal
│
└── src/                     # Código-fonte principal da aplicação
    ├── index.js             # Ponto de entrada, configuração do Express e Apollo Server
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