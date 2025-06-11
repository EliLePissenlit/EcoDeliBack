export enum UserRole {
  USER = 'USER',
  ADMIN = 'ADMIN',
}

export const roleLevels = {
  [UserRole.USER]: 1,
  [UserRole.ADMIN]: 2,
} as const;

export const MIN_ROLE_LEVEL = 1;
export const MAX_ROLE_LEVEL = 3;
