import { ApolloError } from 'apollo-server-core';
import {
  LoginInput,
  RegisterInput,
  Token,
  User,
  UnsubscribeInput,
  ChangePasswordInput,
  ResetPasswordInput,
} from '../../types/graphql/typeDefs';
import LoginService from './login';
import RegisterService from './register';
import CredentialService from './credential';
import UserService from '../users';

class AuthService {
  public static async login(input: LoginInput): Promise<Token | ApolloError> {
    return LoginService.login(input);
  }

  public static async register(input: RegisterInput): Promise<boolean | ApolloError> {
    return RegisterService.register(input);
  }

  public static async changePasswordWhileLoggedIn(input: ChangePasswordInput, me: User): Promise<Token | ApolloError> {
    return CredentialService.changePasswordWhileLoggedIn(input, me);
  }

  public static async resetPasswordAndSendItByEmail(input: ResetPasswordInput): Promise<boolean | ApolloError> {
    return CredentialService.resetPasswordAndSendItByEmail(input);
  }

  public static async unsubscribe(input: UnsubscribeInput, me: User): Promise<boolean | ApolloError> {
    return UserService.unsubscribe(input, me);
  }
}

export default AuthService;
