/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-unsafe-call */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
import { Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';

interface JwtPayload {
  sub: string;
  email: string;
  roles?: string[];
}

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor() {
    // Separar la llamada y tiparla explícitamente evita los “unsafe call/assignment”
    const extractor: (req: any) => string | null =
      ExtractJwt.fromAuthHeaderAsBearerToken();

    super({
      jwtFromRequest: extractor,
      secretOrKey: process.env.JWT_SECRET ?? 'dev_secret',
    });
  }

  // Tipado fuerte y sin async innecesario
  validate(payload: JwtPayload) {
    return {
      userId: payload.sub,
      email: payload.email,
      roles: payload.roles ?? [],
    };
  }
}
