import { Role } from '../../../types/graphql/typeDefs';
import hasProperRoles from './hasProperRoles';

const isBasic = hasProperRoles([Role.Basic]);

export default isBasic;
