# Evolv - Backend API (Fase 1)

O **Evolv** é um ecossistema digital para gestão de treinos, evolução corporal e engajamento social em academias. Desenvolvido com uma arquitetura moderna e escalável, este backend atua como o motor central da aplicação.

---

## Tecnologias Utilizadas (Node.js)

* **Runtime:** Node.js
* **Framework Web:** Express.js
* **API de Dados:** Apollo Server (GraphQL)
* **Banco de Dados:** MongoDB Atlas (Nuvem) + Mongoose
* **Segurança:** Autenticação via JWT e Bcrypt

---

## Como Rodar o Projeto

Este projeto foi configurado para ser **100% Plug and Play** para facilitar a avaliação. O banco de dados já está hospedado na nuvem (MongoDB Atlas) e o arquivo `.env` com as credenciais foi mantido no repositório propositalmente.

### 1. Pré-requisitos
* Node.js instalado (v18 ou superior).
* Postman (para testar as requisições da API).

### 2. Iniciando o Servidor
1. Abra o terminal na raiz do projeto (`evolv-node`).
2. Instale as dependências rodando:
   ```bash
   npm install