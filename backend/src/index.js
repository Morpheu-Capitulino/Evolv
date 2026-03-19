import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import mongoose from 'mongoose';
import jwt from 'jsonwebtoken';
import { ApolloServer } from '@apollo/server';
import { expressMiddleware } from '@as-integrations/express4';

// Importa os Controladores REST
import { register, login } from './controllers/authController.js';

// Importa o GraphQL
import { typeDefs } from './graphql/typeDefs.js';
import { resolvers } from './graphql/resolvers.js';

dotenv.config();
const app = express();
app.use(cors());
app.use(express.json());

// Conexão com o MongoDB
mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log('🔥 MongoDB Conectado!'))
  .catch(err => console.error(err));

// Rotas REST (AuthController)
app.post('/api/auth/register', register);
app.post('/api/auth/login', login);

// Configuração do Apollo Server
const server = new ApolloServer({ typeDefs, resolvers });
await server.start();

// Middleware do GraphQL
app.use('/graphql', expressMiddleware(server, {
  context: async ({ req }) => {
    const authHeader = req.headers.authorization || '';
    if (authHeader.startsWith('Bearer ')) {
      const token = authHeader.substring(7);
      try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        return { userId: decoded.userId }; 
      } catch (err) {
      }
    }
    return { userId: null };
  },
}));

const PORT = process.env.PORT || 8080;
app.listen(PORT, () => {
  console.log(`API rodando na porta ${PORT}`);
});