  Evolv — Backend API (Node.js & GraphQL) | Fase 1

Bem-vindo ao repositório oficial do Evolv Backend API.
O Evolv é um ecossistema digital inteligente focado na gestão de treinos, evolução corporal e engajamento social em academias.

Este projeto atua como o motor central da plataforma, utilizando uma arquitetura moderna que mescla:

a simplicidade do REST (para autenticação)

com o poder e a flexibilidade do GraphQL (para gestão e tráfego de dados complexos)

Projeto idealizado, arquitetado e mantido pela Virtana.

  Stack Tecnológica

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

  Domínios de Negócio & Funcionalidades

A API está dividida em 6 módulos principais:

1. Autenticação (REST)

Registro seguro com hash de senha e Login com geração de Token JWT válido por 2 horas.

2. Usuários (GraphQL)

Gestão completa de perfis:

listagem

atualização

deleção

Operações CRUD completas.

3. Catálogo de Exercícios (GraphQL)

Base de dados de exercícios contendo:

divisão por grupo muscular

links em vídeo para execução correta

4. Treinos / Workouts (GraphQL)

Registro diário de treinos vinculados a um usuário, contendo:

histórico detalhado de séries

repetições

carga

Com validação relacional entre entidades.

5. Evolução Corporal (GraphQL)

Registro de medidas corporais e um módulo de Inteligência do Sistema que:

compara avaliações físicas (Antes vs Depois)

retorna cálculos matemáticos de evolução

gera mensagens motivacionais de progresso

6. Social (GraphQL)

Sistema de amizades, permitindo conexão entre diferentes contas da plataforma.

Arquitetura do Projeto

O código foi desenhado visando:

manutenibilidade

escalabilidade

separação clara de responsabilidades

evolv-node/
├── index.js                 # Ponto de entrada, Configurações do Express e Apollo Server
├── package.json             # Dependências e scripts de execução
├── .env                     # Variáveis de ambiente (Mantido para avaliação Plug & Play)
│
├── controllers/
│   └── authController.js    # Lógica REST para Login e Registro
│
├── graphql/
│   ├── typeDefs.js          # O "Contrato" (Schema) da API. Define Queries e Mutations.
│   └── resolvers.js         # O "Cérebro". Lógica de negócios e chamadas ao banco.
│
└── models/                  # Schemas do Mongoose (Mapeamento do Banco de Dados)
    ├── BodyMeasurement.js
    ├── Exercise.js
    ├── User.js
    └── Workout.js
 Segurança e Integridade de Dados

Diferente de bancos SQL tradicionais, o MongoDB é um banco NoSQL.

Para garantir a integridade dos dados, o Evolv implementa validações de chaves estrangeiras via software diretamente nos Resolvers do GraphQL.

 Prevenção de Fantasmas

É impossível registrar um treino ou uma medida corporal para um usuário que não existe no banco.

 Catálogo Estrito

Um treino só é salvo se 100% dos exercícios enviados pelo Front-end existirem previamente na coleção de Exercícios do Evolv.

 GraphQL Status Code

Requisições inválidas ou dados inexistentes retornam uma estrutura de errors clara no JSON, permitindo fácil tratamento no Front-end e seguindo o padrão ouro de APIs GraphQL.

 Como Rodar o Projeto

 AVISO PARA AVALIAÇÃO

Este projeto foi configurado para ser 100% Plug and Play, visando facilitar a correção.

O banco de dados já está hospedado em produção (MongoDB Atlas).

O arquivo .env com as credenciais não foi incluído no .gitignore propositalmente.

Não é necessária nenhuma instalação local de banco de dados.

1. Pré-requisitos

Node.js instalado na máquina (Recomendado v18+)

Postman (para testar as requisições)

2. Subindo o Servidor Local

---

1. Abra o terminal na raiz da pasta evolv-node

2. Instale todas as dependências:

npm install

 Inicie o servidor em modo de desenvolvimento (com hot-reload):

npm run dev

4. Se a configuração estiver correta, o terminal exibirá:

confirmação de conexão com o MongoDB

a porta em que a API está rodando

 Guia de Testes da API

O repositório inclui um arquivo chamado Evolv.json.

Trata-se de uma Collection completa com todas as requisições prontas.
Importe este arquivo no Postman.

Nota:
Por se tratar de um banco de dados real na nuvem, rotas de listagem podem retornar [] (vazio) caso nenhum dado tenha sido cadastrado ainda.

 1. A Chave de Acesso

Vá em "1. Autenticação"

Abra "1.1 Register" e envie para criar uma conta

Depois vá em "1.2 Login" e envie

Copie o token que aparecerá na resposta

 2. Configuração Global

No Postman:

Clique na pasta raiz da Collection
"Evolv - Sistema Completo"

Acesse a aba Variables

Cole o seu token na variável correspondente e salve.

Isso autenticará todas as chamadas seguintes automaticamente.

 3. Identificação

Vá em "2. Gerenciamento de Usuários"

Rode a listagem

Copie o seu ID

 4. Alimentando o Sistema

Vá na pasta "3. Catálogo"

Crie um exercício (Ex: Supino)

Copie o ID gerado

 5. O Coração do App

Vá na pasta "4. Treinos"

Abra a requisição "Registrar Novo Treino"

Cole:

ID do Usuário

ID do Exercício

Envie para salvar o treino no banco

 6. Inteligência Artificial (Evolução)

Vá na pasta "5. Medidas"

Crie uma medida com data antiga
(peso e gordura mais altos)

Copie o ID

Crie outra medida com data atual
(peso e gordura mais baixos)

Copie o ID

Rode a rota "5.3 Comparar Evolução" inserindo os dois IDs.

O sistema irá:

calcular o progresso corporal

retornar o feedback inteligente de evolução
