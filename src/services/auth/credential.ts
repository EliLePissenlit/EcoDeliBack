import { ApolloError } from 'apollo-server-core';
import config from 'config';
import bcrypt from 'bcrypt';
import { User, ChangePasswordInput, ResetPasswordInput, Token } from '../../types/graphql/typeDefs';
import UserService from '../users';
import errorCodes from '../../graphql/auth/errorCodes';
import AuthNotificationService from './notification';
import { createUserToken } from '../../utils/jwt';
import generateStrongPassword from '../../utils/generateStrongPassword';

class CredentialService {
  public static async changePasswordWhileLoggedIn(input: ChangePasswordInput, me: User): Promise<Token | ApolloError> {
    const { currentPassword, newPassword } = input;

    const user = await UserService.findById(me.id);

    await this.validateLoginCredentials(user, currentPassword);

    const hashedPassword = await bcrypt.hash(newPassword, config.get('security.hash.rounds'));

    const updatedUser: User = await UserService.save({
      id: me.id,
      input: {
        password: hashedPassword,
        passwordUpdatedAt: new Date().toISOString(),
      },
    });

    return {
      token: createUserToken(updatedUser),
    };
  }

  public static async resetPasswordAndSendItByEmail(input: ResetPasswordInput): Promise<boolean | ApolloError> {
    try {
      const user = await UserService.findByEmail(input.email);
      if (!user) return false;

      const password = generateStrongPassword();
      const hashedPassword = await bcrypt.hash(password, config.get('security.hash.rounds'));

      await UserService.save({
        id: user.id,
        input: {
          password: hashedPassword,
          passwordUpdatedAt: new Date().toISOString(),
        },
      });

      await AuthNotificationService.sendPasswordByEmail(input.email, password);

      return true;
    } catch (error) {
      throw new ApolloError(
        '[CREDENTIAL_SERVICE] Failed to send password recovery email',
        errorCodes.FAIL_TO_SEND_PASSWORD_RECOVERY_EMAIL
      );
    }
  }

  public static async validateLoginCredentials(user: User | null, password: string): Promise<boolean | ApolloError> {
    if (!user) throw new ApolloError('[CREDENTIAL_SERVICE] Invalid credentials.', errorCodes.INVALID_CREDENTIALS);

    if (user.isSuspended) {
      throw new ApolloError('[CREDENTIAL_SERVICE] User is suspended.', errorCodes.ACCOUNT_SUSPENDED);
    }

    const isPasswordValid = await bcrypt.compare(password, user.password!);

    if (!isPasswordValid) {
      throw new ApolloError('[CREDENTIAL_SERVICE] Invalid credentials.', errorCodes.INVALID_CREDENTIALS);
    }

    return true;
  }
}

export default CredentialService;
