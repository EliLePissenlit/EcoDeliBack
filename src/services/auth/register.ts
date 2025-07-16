import { ApolloError } from 'apollo-server-core';
import bcrypt from 'bcrypt';
import _ from 'lodash';
import config from 'config';
import { RegisterInput } from '../../types/graphql/typeDefs';
import errorCodes from '../../graphql/auth/errorCodes';
import UserService from '../users';
import AuthNotificationService from './notification';
import logger from '../../infrastructure/logger';
import generateStrongPassword from '../../utils/generateStrongPassword';

class RegisterService {
  private static async validateUserDoesNotExist(email: string): Promise<void> {
    const userByEmail = await UserService.findByEmail(email);
    const existingUser = Boolean(userByEmail);

    if (existingUser) {
      throw new ApolloError('[REGISTER_SERVICE] User already exists.', errorCodes.USER_ALREADY_EXISTS);
    }
  }

  private static async createNewUser(input: RegisterInput): Promise<{ password: string; email: string }> {
    const { email } = input;

    const password = generateStrongPassword();
    const hashedPassword = await bcrypt.hash(password, config.get('security.hash.rounds'));

    await UserService.save({
      input: {
        email: _.toLower(email),
        password: hashedPassword,
      },
    });

    return { email, password };
  }

  public static async register(input: RegisterInput): Promise<boolean | ApolloError> {
    try {
      await this.validateUserDoesNotExist(input.email);

      const { email, password } = await this.createNewUser(input);

      await AuthNotificationService.register(email, password);

      return true;
    } catch (error) {
      logger.error('[REGISTER_SERVICE] Registration failed', { error });
      throw error;
    }
  }
}

export default RegisterService;
