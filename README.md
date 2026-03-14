# Evolv - Core API (Node.js & GraphQL) | Fase 1

Bem-vindo ao repositório oficial do Evolv Backend API. 
O Evolv é um ecossistema digital inteligente focado na gestão de treinos, evolução corporal e engajamento social em academias. 

Este projeto atua como o motor central da plataforma, utilizando uma arquitetura moderna que mescla a simplicidade do REST (para autenticação) com o poder e a flexibilidade do GraphQL

---

## Stack Tecnológica

* Runtime: Node.js (ES Modules)
* Framework Web: Express.js
* API de Dados: Apollo Server (GraphQL v5) + @as-integrations/express4
* Banco de Dados: MongoDB Atlas (DBaaS na Nuvem)
* ODM (Object Data Modeling): Mongoose
* Segurança & Criptografia: Autenticação via JWT (JSON Web Tokens) e BcryptJS

---

## Domínios de Negócio & Funcionalidades

A API está dividida em 6 módulos principais:

1. Autenticação (REST): Registro seguro com hash de senha e Login com geração de Token JWT válido por 2 horas.
2. Usuários (GraphQL): Gestão de perfis, listagem, atualização e deleção (CRUD).
3. Catálogo de Exercícios (GraphQL): Base de dados de exercícios com divisão por grupo muscular e links em vídeo.
4. Treinos / Workouts (GraphQL): Registro diário de treinos vinculados a um usuário, contendo histórico detalhado de séries, repetições e carga (com validação relacional).
5. Evolução Corporal (GraphQL): Registro de medidas e Inteligência do Sistema: um motor que compara avaliações físicas (Antes e Depois) e retorna cálculos matemáticos e mensagens motivacionais de progresso.
6. Social (GraphQL): Sistema de amizades conectando diferentes contas da plataforma.

---
## Segurança e Integridade de Dados (Blindagem)

Diferente de bancos SQL tradicionais, o MongoDB é um banco NoSQL. Para garantir a integridade dos dados, o Evolv implementa validações de chaves estrangeiras via software diretamente nos Resolvers do GraphQL:

* Prevenção de Fantasmas: É impossível registrar um treino ou uma medida corporal para um usuário que não existe no banco.
* Catálogo Estrito: Um treino só é salvo se 100% dos exercícios enviados pelo Front-end existirem previamente na coleção de Exercícios do Evolv.
* GraphQL Status Code: Requisições inválidas ou dados inexistentes retornam uma estrutura de "errors" clara no JSON para fácil tratamento no Front-end, seguindo o padrão ouro de APIs GraphQL.

---

## Como Rodar o Projeto

AVISO PARA AVALIAÇÃO: Este projeto foi configurado para ser 100% Plug and Play visando facilitar a correção. O banco de dados já está hospedado em produção (MongoDB Atlas) e o arquivo .env com as credenciais não foi incluído no .gitignore propositalmente. Não é necessária nenhuma instalação local de banco de dados.

### 1. Pré-requisitos
* Node.js instalado na máquina (Recomendado v18+).
* Postman (para testar as requisições).

### 2. Subindo o Servidor Local
1. Abra o terminal na raiz da pasta evolv-node.
2. Instale todas as dependências rodando o comando:
   npm install
3. Inicie o servidor em modo de desenvolvimento (com hot-reload):
   npm run dev
4. Se a configuração estiver correta, o terminal exibirá a confirmação de conexão com o MongoDB e a porta em que a API está rodando.

---

## Guia de Testes da API (Postman)

O repositório inclui um arquivo chamado Evolv.json. Trata-se de uma Collection completa com todas as requisições prontas. Importe este arquivo no seu Postman.

Nota: Por se tratar de um banco de dados real na nuvem, rotas de listagem podem retornar [] (vazio) caso nenhum dado tenha sido cadastrado ainda.

1. A Chave de Acesso: Vá em "1. Autenticação", abra "1.1 Register" e envie para criar uma conta. Depois, vá em "1.2 Login" e envie. Copie o token que aparecerá na resposta.
2. Configuração Global: No Postman, clique na pasta raiz da Collection ("Evolv - Sistema Completo"), acesse a aba Variables, cole o seu token na variável correspondente e salve. Isso autenticará todas as chamadas seguintes.
3. Identificação: Vá em "2. Gerenciamento de Usuários", rode a listagem e copie o seu ID.
4. Alimentando o Sistema: Vá na pasta "3. Catálogo" e crie um exercício (Ex: Supino). Copie o ID gerado para ele.
5. O Coração do App: Vá na pasta "4. Treinos", abra a requisição de "Registrar Novo Treino" e cole o seu ID de Usuário e o ID do Exercício nos locais indicados. Envie para salvar o treino no banco.
6. Inteligência Artificial (Evolução): Vá na pasta "5. Medidas", crie uma medida com data antiga (peso e gordura altos), copie o ID. Crie outra medida com a data de hoje (peso e gordura mais baixos), copie o ID. Por fim, rode a rota "5.3 Comparar Evolução" inserindo os dois IDs para ver o sistema calcular o progresso e retornar o feedback.

## Arquitetura do Projeto 

O código foi desenhado visando manutenibilidade e separação clara de responsabilidades:

```text
evolv-node/
├── index.js                 # Ponto de entrada, Configurações do Express e Apollo Server
├── package.json             # Dependências e scripts de execução
├── .env                     # Variáveis de ambiente (Mantido para avaliação Plug & Play)
├── controllers/
│   └── authController.js    # Lógica REST para Login e Registro
├── graphql/
│   ├── typeDefs.js          # O "Contrato" (Schema) da API. Define Queries e Mutations.
│   └── resolvers.js         # O "Cérebro". Lógica de negócios e chamadas ao banco.
└── models/                  # Schemas do Mongoose (Mapeamento do Banco de Dados)
    ├── BodyMeasurement.js
    ├── Exercise.js
    ├── User.js
    └── Workout.js