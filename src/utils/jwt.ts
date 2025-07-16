import config from 'config';
import jwt from 'jsonwebtoken';

import { User } from '../types/graphql/typeDefs';

const jwtSecret: string = config.get('security.jwt.secret');
const expiresInDefault: string = config.get('security.jwt.expiresIn');

const TOKEN_TYPES = {
  USER: 'USER',
};

const createToken = (payload: any, expiresIn = expiresInDefault): string => jwt.sign(payload, jwtSecret, { expiresIn });

const createUserToken = (user: User): string =>
  createToken({
    email: user.email,
    id: user.id,
    role: user.role,
    type: TOKEN_TYPES.USER,
  });

export { createUserToken, TOKEN_TYPES };
