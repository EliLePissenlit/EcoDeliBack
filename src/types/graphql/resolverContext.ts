import { User } from './typeDefs';

export interface ResolverContext {
  logger: any;
  me: User;
  tokenType: string;
  ipAddress?: string;
}
