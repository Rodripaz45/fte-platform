// src/auth/jwt.strategy.ts
import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { PrismaService } from '../../prisma/prisma.service';

type JwtPayload = { sub: string; email: string };

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(private readonly prisma: PrismaService) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: process.env.JWT_SECRET!,
    });
  }

  async validate(payload: JwtPayload) {
    const user = await this.prisma.usuario.findUnique({
      where: { id: payload.sub },
      include: { roles: { include: { rol: true } } },
    });
    if (!user) throw new UnauthorizedException();

    // ⇒ fuerza MAYÚSCULAS (por si en BD hubiera minúsculas)
    const roles = user.roles.map((ur) => String(ur.rol.nombre).toUpperCase());

    return {
      sub: user.id,
      email: user.email,
      nombre: user.nombre,
      roles,                 // ← array de strings en MAYÚSCULAS
      estado: user.estado,
    };
  }
}
