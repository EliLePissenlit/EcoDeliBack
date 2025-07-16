import _ from 'lodash';
import { Transaction } from 'objection';

import { ApolloError } from 'apollo-server-core';
import { UserModel } from '../../db/model/UserModel';
import logger from '../../infrastructure/logger';
import { User, UnsubscribeInput } from '../../types/graphql/typeDefs';
import GenericService from '../@generic';

class UserService extends GenericService<UserModel> {
  constructor() {
    super(UserModel);
  }

  public async getAccountInfoById(id: string, trx?: Transaction): Promise<User> {
    const user: User = await this.findById(id, trx);

    delete user.password;
    return user;
  }

  public async findByEmail(email: string): Promise<User> {
    return UserModel.query().findOne({ email: _.toLower(email) });
  }

  public async placeUnderSurveillance(userId: string): Promise<boolean> {
    try {
      await this.save({
        id: userId,
        input: {
          isUnderSurveillance: true,
        },
      });

      return true;
    } catch (error) {
      logger.error('[USER_SERVICE] Error placing user under surveillance', error);
      return false;
    }
  }

  public async removeFromSurveillance(userId: string): Promise<boolean> {
    try {
      await this.save({
        id: userId,
        input: {
          isUnderSurveillance: false,
        },
      });

      return true;
    } catch (error) {
      logger.error('[USER_SERVICE] Error removing user from surveillance', error);
      return false;
    }
  }

  // TODO: Implement this
  public async unsubscribe(input: UnsubscribeInput, me: User): Promise<boolean | ApolloError> {
    await this.save({
      id: me.id,
      input: {
        isSuspended: true,
      },
    });

    return true;
  }
}

export default new UserService();
