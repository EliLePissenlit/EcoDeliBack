import { AuthenticationError } from 'apollo-server-express';
import config from 'config';
import jwt from 'jsonwebtoken';

import UserService from '../services/users';
import { User } from '../types/graphql/typeDefs';
import { TOKEN_TYPES } from '../utils/jwt';

interface TokenInformations {
  tokenData: TokenData;
  user: User | Partial<User>;
}

interface TokenData {
  id: string;
  type: string;
  email: string;
}

const getUserIdFromToken = (tokenData: any): string => {
  switch (tokenData.type) {
    case TOKEN_TYPES.USER:
      return tokenData.id;
    // it suggest that other token types must provide a userId
    default:
      return tokenData.userId;
  }
};

const isTokenRevoked = ({ tokenData, user }: { tokenData: any; user: Partial<User> }): boolean => {
  switch (tokenData.type) {
    case TOKEN_TYPES.USER:
      return !user || tokenData.email !== user.email;
    default:
      // it suggest that other token types must provide a userEmail
      return !user || tokenData.userEmail !== user.email;
  }
};

const getApprovedUser = async (tokenData: any): Promise<User> => {
  const userId = getUserIdFromToken(tokenData);

  const user = await UserService.getAccountInfoById(userId);

  const tokenType = tokenData.type;

  if (tokenType === TOKEN_TYPES.USER && isTokenRevoked({ tokenData, user })) {
    throw new AuthenticationError('Invalid JWT');
  }

  return user;
};

const getDataFromToken = async (token: string): Promise<TokenInformations | Record<string, never>> => {
  if (!token) return {};

  let tokenData;
  try {
    tokenData = jwt.verify(token, config.get('security.jwt.secret'));
  } catch (e) {
    throw new AuthenticationError('Invalid JWT');
  }
  const user = await getApprovedUser(tokenData);
  return { tokenData, user };
};

export { getDataFromToken, getApprovedUser };
