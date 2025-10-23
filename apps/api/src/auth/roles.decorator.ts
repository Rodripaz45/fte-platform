import { SetMetadata } from '@nestjs/common';

export const ROLES_KEY = 'roles';
// Aceptamos string literal para evitar problemas de import de tipos
export const Roles = (...roles: string[]) => SetMetadata(ROLES_KEY, roles);
