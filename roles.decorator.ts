import { SetMetadata } from '@nestjs/common';
import { Role } from '@prisma/client';

export const ROLES_KEY = 'roles';

// استخدام: @Roles(Role.ADMIN, Role.TRAINER)
export const Roles = (...roles: Role[]) => SetMetadata(ROLES_KEY, roles);
