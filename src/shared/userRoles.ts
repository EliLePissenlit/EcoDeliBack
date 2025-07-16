import { Role } from '../types/graphql/typeDefs';

const roleHierarchy: Record<Role, Role[]> = {
  ADMIN: [Role.Admin, Role.Partner, Role.Tester, Role.Basic],
  BASIC: [Role.Basic],
  PARTNER: [Role.Partner, Role.Basic],
  SUPER_ADMIN: [Role.SuperAdmin, Role.Admin, Role.Partner, Role.Tester, Role.Basic],
  TESTER: [Role.Tester, Role.Basic],
};

const checkRole = (currentRole: Role, requiredRoles: Role[]): boolean => {
  const safeRequiredRoles = Array.isArray(requiredRoles) ? requiredRoles : [requiredRoles];
  return safeRequiredRoles.some((requiredRole) => roleHierarchy[requiredRole].includes(currentRole));
};

export { checkRole };
