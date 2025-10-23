import { CanActivate, ExecutionContext, Injectable, ForbiddenException } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { ROLES_KEY } from './roles.decorator';

@Injectable()
export class RolesGuard implements CanActivate {
  constructor(private readonly reflector: Reflector) {}

  canActivate(ctx: ExecutionContext): boolean {
    const requiredRaw = this.reflector.getAllAndOverride<string[]>(ROLES_KEY, [
      ctx.getHandler(),
      ctx.getClass(),
    ]);

    // Si la ruta no define @Roles, se permite (ya pasó por JwtAuthGuard global)
    if (!requiredRaw?.length) return true;

    const request = ctx.switchToHttp().getRequest();
    const user = request.user as { roles?: string[]; email?: string } | undefined;

    const required = requiredRaw.map((r) => String(r).trim().toUpperCase());
    const userRoles = (user?.roles ?? []).map((r) => String(r).trim().toUpperCase());

    // Logs de depuración (útil en consola durante desarrollo):
    // console.log('[ROLES] required:', required, 'userRoles:', userRoles, 'user:', user?.email);

    const ok = required.some((r) => userRoles.includes(r));
    if (!ok) {
      // ⚠️ En producción mejor no revelar tanto detalle
      throw new ForbiddenException({
        message: 'Forbidden resource',
        detail: {
          requiredRoles: required,
          userRoles,
          userEmail: user?.email ?? null,
          note: 'Habilitar mensajes detallados solo en desarrollo',
        },
      });
    }
    return true;
  }
}
