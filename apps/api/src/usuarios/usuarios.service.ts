import { Injectable, NotFoundException, BadRequestException, ConflictException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { CreateTrainerDto } from './dto/create-trainer.dto';
import { UpdateTrainerDto } from './dto/update-trainer.dto';
import * as bcrypt from 'bcrypt';

@Injectable()
export class UsuariosService {
  constructor(private readonly prisma: PrismaService) {}

  async findAll() {
    return this.prisma.usuario.findMany({
      include: {
        roles: { include: { rol: true } },
      },
      orderBy: { creadoEn: 'desc' },
    });
  }

  async findOne(id: string) {
    const usuario = await this.prisma.usuario.findUnique({
      where: { id },
      include: { 
        roles: { include: { rol: true } },
        participante: true,
      },
    });

    if (!usuario) {
      throw new NotFoundException('Usuario no encontrado');
    }

    return usuario;
  }

  /**
   * Obtener todos los usuarios con rol TRAINER
   */
  async findAllTrainers() {
    const rolTrainer = await this.prisma.rol.findUnique({
      where: { nombre: 'TRAINER' },
    });

    if (!rolTrainer) {
      return [];
    }

    const usuariosTrainer = await this.prisma.usuarioRol.findMany({
      where: { rolId: rolTrainer.id },
      include: {
        usuario: {
          include: {
            roles: { include: { rol: true } },
          },
        },
      },
      orderBy: { usuario: { creadoEn: 'desc' } },
    });

    return usuariosTrainer.map(ur => ({
      ...ur.usuario,
      roles: ur.usuario.roles.map(r => r.rol),
    }));
  }

  /**
   * Crear un nuevo usuario con rol TRAINER
   */
  async createTrainer(dto: CreateTrainerDto) {
    // Verificar si el email ya existe
    const existingUser = await this.prisma.usuario.findUnique({
      where: { email: dto.email },
    });

    if (existingUser) {
      throw new ConflictException('El email ya está registrado');
    }

    // Hash de la contraseña
    const passwordHash = await bcrypt.hash(dto.password, 10);

    // Crear usuario
    const usuario = await this.prisma.usuario.create({
      data: {
        nombre: dto.nombre,
        email: dto.email,
        passwordHash,
        estado: dto.estado || 'ACTIVO',
      },
    });

    // Obtener o crear el rol TRAINER
    const rolTrainer = await this.prisma.rol.upsert({
      where: { nombre: 'TRAINER' },
      update: {},
      create: { nombre: 'TRAINER' },
    });

    // Asignar rol TRAINER al usuario
    await this.prisma.usuarioRol.create({
      data: {
        usuarioId: usuario.id,
        rolId: rolTrainer.id,
      },
    });

    // Retornar usuario con roles
    return this.findOne(usuario.id);
  }

  /**
   * Actualizar un usuario trainer
   */
  async updateTrainer(id: string, dto: UpdateTrainerDto) {
    const usuario = await this.prisma.usuario.findUnique({
      where: { id },
      include: { roles: { include: { rol: true } } },
    });

    if (!usuario) {
      throw new NotFoundException('Trainer no encontrado');
    }

    // Verificar que el usuario tenga rol TRAINER
    const tieneRolTrainer = usuario.roles.some(ur => ur.rol.nombre === 'TRAINER');
    if (!tieneRolTrainer) {
      throw new BadRequestException('El usuario no tiene rol TRAINER');
    }

    // Verificar si el email ya existe en otro usuario
    if (dto.email && dto.email !== usuario.email) {
      const existingUser = await this.prisma.usuario.findUnique({
        where: { email: dto.email },
      });

      if (existingUser) {
        throw new ConflictException('El email ya está registrado');
      }
    }

    // Preparar datos de actualización
    const updateData: any = {};
    if (dto.nombre) updateData.nombre = dto.nombre;
    if (dto.email) updateData.email = dto.email;
    if (dto.estado) updateData.estado = dto.estado;
    if (dto.password) {
      updateData.passwordHash = await bcrypt.hash(dto.password, 10);
    }

    // Actualizar usuario
    await this.prisma.usuario.update({
      where: { id },
      data: updateData,
    });

    return this.findOne(id);
  }

  /**
   * Eliminar o desactivar un trainer
   */
  async deleteTrainer(id: string) {
    const usuario = await this.prisma.usuario.findUnique({
      where: { id },
      include: { roles: { include: { rol: true } } },
    });

    if (!usuario) {
      throw new NotFoundException('Trainer no encontrado');
    }

    // Verificar que el usuario tenga rol TRAINER
    const tieneRolTrainer = usuario.roles.some(ur => ur.rol.nombre === 'TRAINER');
    if (!tieneRolTrainer) {
      throw new BadRequestException('El usuario no tiene rol TRAINER');
    }

    // En lugar de eliminar, desactivar el usuario
    await this.prisma.usuario.update({
      where: { id },
      data: { estado: 'INACTIVO' },
    });

    return { message: 'Trainer desactivado correctamente' };
  }
}
