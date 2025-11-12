// src/auth/jwt.strategy.ts
import { Injectable, UnauthorizedException, Logger } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { PrismaService } from '../../prisma/prisma.service';

type JwtPayload = { sub: string; email: string };

interface CachedUser {
  id: string;
  email: string;
  nombre: string;
  roles: string[];
  estado: string | null;
  cachedAt: number;
}

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  private readonly logger = new Logger(JwtStrategy.name);
  private readonly userCache = new Map<string, CachedUser>();
  private readonly CACHE_TTL = 5 * 60 * 1000; // 5 minutos en milisegundos

  constructor(private readonly prisma: PrismaService) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: process.env.JWT_SECRET!,
    });
  }

  async validate(payload: JwtPayload) {
    const userId = payload.sub;
    const now = Date.now();

    // Verificar cache
    const cached = this.userCache.get(userId);
    if (cached && (now - cached.cachedAt) < this.CACHE_TTL) {
      return {
        sub: cached.id,
        email: cached.email,
        nombre: cached.nombre,
        roles: cached.roles,
        estado: cached.estado,
      };
    }

    // Si no está en cache o expiró, consultar BD
    try {
      const user = await this.prisma.usuario.findUnique({
        where: { id: userId },
        include: { roles: { include: { rol: true } } },
      });

      if (!user) {
        throw new UnauthorizedException();
      }

      // ⇒ fuerza MAYÚSCULAS (por si en BD hubiera minúsculas)
      const roles = user.roles.map((ur) => String(ur.rol.nombre).toUpperCase());

      const userData: CachedUser = {
        id: user.id,
        email: user.email,
        nombre: user.nombre,
        roles,
        estado: user.estado,
        cachedAt: now,
      };

      // Guardar en cache
      this.userCache.set(userId, userData);

      // Limpiar cache expirado periódicamente (cada 10 minutos)
      if (this.userCache.size > 100) {
        this.cleanExpiredCache();
      }

      return {
        sub: userData.id,
        email: userData.email,
        nombre: userData.nombre,
        roles: userData.roles,
        estado: userData.estado,
      };
    } catch (error) {
      this.logger.error(`Error validating user ${userId}:`, error);
      throw new UnauthorizedException();
    }
  }

  private cleanExpiredCache() {
    const now = Date.now();
    for (const [userId, user] of this.userCache.entries()) {
      if (now - user.cachedAt > this.CACHE_TTL) {
        this.userCache.delete(userId);
      }
    }
  }
}
