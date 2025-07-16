import { ApolloError } from 'apollo-server-express';
import { skip } from 'graphql-resolvers';

const isTokenType =
  (type) =>
  (parent, args, { me, tokenType }) =>
    me && tokenType === type ? skip : new ApolloError('Wrong provided token type');

export default isTokenType;
