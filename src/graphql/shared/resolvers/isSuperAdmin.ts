import { Role } from '../../../types/graphql/typeDefs';
import hasProperRoles from './hasProperRoles';

const isSuperAdmin = hasProperRoles([Role.SuperAdmin]);

export default isSuperAdmin;
