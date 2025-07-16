import { Role } from '../../../types/graphql/typeDefs';
import hasProperRoles from './hasProperRoles';

const isAdmin = hasProperRoles([Role.Admin]);

export default isAdmin;
