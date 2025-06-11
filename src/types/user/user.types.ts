import { UserRole } from '../../constants/roles';

export type UserRoleType = keyof typeof UserRole;

export interface UpdateUserInput {
  id: number;
  email?: string;
  firstName?: string;
  lastName?: string;
  phone?: string;
  placeId?: string;
  role?: UserRoleType;
  isEmailVerified?: boolean;
  isSuspended?: boolean;
}

export interface AdminUpdateUserResponse {
  success: boolean;
  user: {
    id: number;
    email: string;
    firstName: string;
    lastName: string;
    role: UserRoleType;
    isEmailVerified: boolean;
    phone?: string;
    placeId?: string;
    isSuspended: boolean;
  };
}
