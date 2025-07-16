import { LoginInput, Token, User } from '../../types/graphql/typeDefs';
import UserService from '../users';
import CredentialService from './credential';
import { createUserToken } from '../../utils/jwt';

class LoginService {
  public static async login(input: LoginInput): Promise<Token> {
    const { email, password } = input;
    const user: User = await UserService.findByEmail(email);

    await CredentialService.validateLoginCredentials(user, password);

    const updatedUser: User = await UserService.save({
      id: user.id,
      input: {
        isUserEmailVerified: true,
        lastLoginAt: new Date().toISOString(),
      },
    });

    return {
      token: createUserToken(updatedUser),
    };
  }
}

export default LoginService;
