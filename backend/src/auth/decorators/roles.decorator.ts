import { SetMetadata } from '@nestjs/common';

export const ROLES_KEY = 'roles';
export const Roles = (...roles: ('CREW' | 'OFFICER')[]) => SetMetadata(ROLES_KEY, roles);
