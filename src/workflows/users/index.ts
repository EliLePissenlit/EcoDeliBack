import UserService from '../../services/users';
import AddressService from '../../services/addresses';
import { User, UpdateUserInput, AddressInput } from '../../types/graphql/typeDefs';

class UserWorkflow {
  public static async me(id: string): Promise<User | Partial<User>> {
    return UserService.getAccountInfoById(id);
  }

  public static async saveLastPosition({ input, me }: { input: AddressInput; me: User }): Promise<User> {
    const address = await AddressService.save({ input });

    return UserService.save({ id: me.id, input: { lastAddressId: address.id } });
  }

  public static async updateUser({ input, me }: { input: UpdateUserInput; me: User }): Promise<User> {
    const user = await UserService.getAccountInfoById(me.id);

    return UserService.save({ id: me.id, input: { ...user, ...input } });
  }

  public static async listUsers(): Promise<User[]> {
    return UserService.findAll();
  }

  public static async suspendUser({ id }: { id: string }): Promise<User> {
    const user = await UserService.findById(id);

    return UserService.save({ id, input: { ...user, isSuspended: !user.isSuspended } });
  }
}

export default UserWorkflow;
