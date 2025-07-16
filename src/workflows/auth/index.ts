import { ApolloError } from 'apollo-server-express';

import AuthService from '../../services/auth';
import {
  LoginInput,
  RegisterInput,
  Token,
  User,
  UnsubscribeInput,
  ChangePasswordInput,
  ResetPasswordInput,
} from '../../types/graphql/typeDefs';

class AuthWorkflow {
  public static async login(input: LoginInput): Promise<Token | ApolloError> {
    return AuthService.login(input);
  }

  public static async register(input: RegisterInput): Promise<boolean | ApolloError> {
    return AuthService.register(input);
  }

  public static async resetPasswordAndSendItByEmail(input: ResetPasswordInput): Promise<boolean | ApolloError> {
    return AuthService.resetPasswordAndSendItByEmail(input);
  }

  public static async unsubscribe(input: UnsubscribeInput, me: User): Promise<boolean | ApolloError> {
    return AuthService.unsubscribe(input, me);
  }

  public static async changePasswordWhileLoggedIn(input: ChangePasswordInput, me: User): Promise<Token | ApolloError> {
    return AuthService.changePasswordWhileLoggedIn(input, me);
  }
}

export default AuthWorkflow;
