import { ApolloError } from 'apollo-server-express';
import { combineResolvers, skip } from 'graphql-resolvers';

import { checkRole } from '../../../shared/userRoles';
import isAuthenticated from './isAuthenticated';

const hasProperRoles = (roles) =>
  combineResolvers(isAuthenticated, async (parent, args, { me }) =>
    checkRole(me.role, roles) ? skip : new ApolloError('Insufficient role')
  );

export default hasProperRoles;
