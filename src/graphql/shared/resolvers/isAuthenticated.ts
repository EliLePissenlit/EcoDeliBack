import { ApolloError } from 'apollo-server-express';
import { skip } from 'graphql-resolvers';

import { TOKEN_TYPES } from '../../../utils/jwt';

const isAuthenticated = async (parent, args, { me, tokenType }) =>
  me && tokenType === TOKEN_TYPES.USER ? skip : new ApolloError('Not authorized');

export default isAuthenticated;
