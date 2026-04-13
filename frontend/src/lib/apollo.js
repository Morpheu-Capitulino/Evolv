// src/lib/apollo.js
import { ApolloClient, InMemoryCache, createHttpLink } from '@apollo/client';
import { setContext } from '@apollo/client/link/context';

// URL do seu backend GraphQL
const httpLink = createHttpLink({
  uri: `${import.meta.env.VITE_API_URL || 'http://localhost:8080'}/graphql`
});

// Middleware para injetar o Token JWT em todas as requisições
const authLink = setContext((_, { headers }) => {
  // Pega o token que vamos salvar no login
  const token = localStorage.getItem('evolv_token');
  
  return {
    headers: {
      ...headers,
      authorization: token ? `Bearer ${token}` : "",
    }
  };
});

export const client = new ApolloClient({
  link: authLink.concat(httpLink),
  cache: new InMemoryCache()
});