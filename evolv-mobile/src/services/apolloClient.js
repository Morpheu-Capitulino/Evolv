import {
  ApolloClient,
  InMemoryCache,
  HttpLink,
  ApolloLink
} from '@apollo/client';

import AsyncStorage from '@react-native-async-storage/async-storage';

const httpLink = new HttpLink({
  uri: `${process.env.EXPO_PUBLIC_API_URL}/graphql`,
});

const authLink = new ApolloLink((operation, forward) => {
  return new Promise(async (resolve) => {

    const token = await AsyncStorage.getItem('evolv_token');

    operation.setContext({
      headers: {
        authorization: token ? `Bearer ${token}` : '',
      },
    });

    resolve(forward(operation));
  });
});

const client = new ApolloClient({
  link: authLink.concat(httpLink),
  cache: new InMemoryCache(),
});

export default client;