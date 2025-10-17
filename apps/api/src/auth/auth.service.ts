/* eslint-disable @typescript-eslint/no-unsafe-assignment */
import {
  Injectable,
  UnauthorizedException,
  BadRequestException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { Prisma } from '@prisma/client';
import { PrismaService } from '../../prisma/prisma.service';
import { hash as bcryptHash, compare as bcryptCompare } from 'bcrypt';

@Injectable()
export class AuthService {
  constructor(
    private prisma: PrismaService,
    private jwt: JwtService,
  ) {}

  async register(
    nombre: string,
    email: string,
    password: string,
    rol?: string,
  ): Promise<{ access_token: string }> {
    const exists = await this.prisma.usuario.findUnique({ where: { email } });
    if (exists) throw new BadRequestException('El email ya está registrado');

    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-call
    const passwordHash = await bcryptHash(password, 10);

    // Crea usuario
    const usuario = await this.prisma.usuario.create({
      data: { nombre, email, passwordHash, estado: 'ACTIVO' },
    });

    // Asigna rol (por defecto ASSISTANT)
    const rolNombre = rol ?? 'ASSISTANT';
    const role = await this.prisma.rol.upsert({
      where: { nombre: rolNombre },
      update: {},
      create: { nombre: rolNombre },
    });

    await this.prisma.usuarioRol.upsert({
      where: { usuarioId_rolId: { usuarioId: usuario.id, rolId: role.id } },
      update: {},
      create: { usuarioId: usuario.id, rolId: role.id },
    });

    const token = await this.signToken(usuario.id, usuario.email, [rolNombre]);
    return { access_token: token };
  }

  async login(
    email: string,
    password: string,
  ): Promise<{ access_token: string }> {
    type UserWithRoles = Prisma.UsuarioGetPayload<{
      include: { roles: { include: { rol: true } } };
    }>;

    const user = await this.prisma.usuario.findUnique({
      where: { email },
      include: { roles: { include: { rol: true } } },
    });
    if (!user) throw new UnauthorizedException('Credenciales inválidas');

    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-call
    const ok = await bcryptCompare(password, user.passwordHash);
    if (!ok) throw new UnauthorizedException('Credenciales inválidas');

    const roles = (user as UserWithRoles).roles.map((r) => r.rol.nombre);
    const token = await this.signToken(user.id, user.email, roles);
    return { access_token: token };
  }

  private async signToken(
    sub: string,
    email: string,
    roles: string[],
  ): Promise<string> {
    const payload = { sub, email, roles };
    return this.jwt.signAsync(payload, { expiresIn: '8h' });
  }
}
