import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { CreateSalaDto } from './dto/create-sala.dto';
import { UpdateSalaDto } from './dto/update-sala.dto';
import { CreateReservaSalaDto } from './dto/create-reserva-sala.dto';
import { UpdateReservaSalaDto } from './dto/update-reserva-sala.dto';
import { VerificarDisponibilidadDto } from './dto/verificar-disponibilidad.dto';

@Injectable()
export class RecursosService {
  constructor(private readonly prisma: PrismaService) {}

  // ========== SALAS ==========

  async createSala(dto: CreateSalaDto) {
    return this.prisma.sala.create({
      data: {
        nombre: dto.nombre,
        sede: dto.sede,
        capacidad: dto.capacidad,
        equipamiento: dto.equipamiento,
        descripcion: dto.descripcion,
        activa: dto.activa ?? true,
      },
    });
  }

  async findAllSalas(sede?: string, activa?: boolean) {
    const where: any = {};
    if (sede) where.sede = sede;
    if (activa !== undefined) where.activa = activa;

    return this.prisma.sala.findMany({
      where,
      include: {
        _count: {
          select: {
            sesiones: true,
            reservas: true,
          },
        },
      },
      orderBy: { nombre: 'asc' },
    });
  }

  async findOneSala(id: string) {
    const sala = await this.prisma.sala.findUnique({
      where: { id },
      include: {
        sesiones: {
          include: {
            taller: {
              select: {
                id: true,
                tema: true,
                trainer: {
                  select: {
                    id: true,
                    nombre: true,
                  },
                },
              },
            },
          },
        },
        reservas: {
          where: {
            estado: { in: ['RESERVADA', 'CONFIRMADA'] },
          },
          orderBy: { fechaInicio: 'asc' },
        },
      },
    });

    if (!sala) {
      throw new NotFoundException('Sala no encontrada');
    }

    return sala;
  }

  async updateSala(id: string, dto: UpdateSalaDto) {
    await this.findOneSala(id);
    return this.prisma.sala.update({
      where: { id },
      data: dto,
    });
  }

  async removeSala(id: string) {
    await this.findOneSala(id);

    // Verificar que no tenga reservas activas
    const reservasActivas = await this.prisma.reservaSala.count({
      where: {
        salaId: id,
        estado: { in: ['RESERVADA', 'CONFIRMADA'] },
        fechaFin: { gte: new Date() },
      },
    });

    if (reservasActivas > 0) {
      throw new BadRequestException(
        'No se puede eliminar la sala porque tiene reservas activas',
      );
    }

    return this.prisma.sala.delete({ where: { id } });
  }

  // ========== RESERVAS ==========

  async verificarDisponibilidad(dto: VerificarDisponibilidadDto) {
    const fechaInicio = new Date(dto.fechaInicio);
    const fechaFin = new Date(dto.fechaFin);

    if (fechaInicio >= fechaFin) {
      throw new BadRequestException(
        'La fecha de inicio debe ser anterior a la fecha de fin',
      );
    }

    // Verificar que la sala existe y está activa
    const sala = await this.prisma.sala.findUnique({
      where: { id: dto.salaId },
    });

    if (!sala) {
      throw new NotFoundException('Sala no encontrada');
    }

    if (!sala.activa) {
      throw new BadRequestException('La sala no está activa');
    }

    // Buscar conflictos de reservas
    const conflictos = await this.prisma.reservaSala.findMany({
      where: {
        salaId: dto.salaId,
        estado: { in: ['RESERVADA', 'CONFIRMADA'] },
        ...(dto.reservaId && { id: { not: dto.reservaId } }),
        OR: [
          {
            // La nueva reserva empieza durante una reserva existente
            fechaInicio: { lte: fechaInicio },
            fechaFin: { gte: fechaInicio },
          },
          {
            // La nueva reserva termina durante una reserva existente
            fechaInicio: { lte: fechaFin },
            fechaFin: { gte: fechaFin },
          },
          {
            // La nueva reserva contiene completamente una reserva existente
            fechaInicio: { gte: fechaInicio },
            fechaFin: { lte: fechaFin },
          },
        ],
      },
      include: {
        sesion: {
          include: {
            taller: {
              select: {
                tema: true,
                trainer: {
                  select: {
                    nombre: true,
                  },
                },
              },
            },
          },
        },
      },
    });

    return {
      disponible: conflictos.length === 0,
      conflictos: conflictos.map((c) => ({
        id: c.id,
        fechaInicio: c.fechaInicio,
        fechaFin: c.fechaFin,
        sesion: c.sesion
          ? {
              id: c.sesion.id,
              taller: c.sesion.taller.tema,
              trainer: c.sesion.taller.trainer.nombre,
            }
          : null,
        motivo: c.motivo,
      })),
    };
  }

  async createReserva(dto: CreateReservaSalaDto) {
    // Verificar disponibilidad
    const disponibilidad = await this.verificarDisponibilidad({
      salaId: dto.salaId,
      fechaInicio: dto.fechaInicio,
      fechaFin: dto.fechaFin,
    });

    if (!disponibilidad.disponible) {
      throw new BadRequestException({
        message: 'La sala no está disponible en ese horario',
        conflictos: disponibilidad.conflictos,
      });
    }

    // Verificar que la sesión existe si se proporciona
    if (dto.sesionId) {
      const sesion = await this.prisma.sesion.findUnique({
        where: { id: dto.sesionId },
      });
      if (!sesion) {
        throw new NotFoundException('Sesión no encontrada');
      }
    }

    return this.prisma.reservaSala.create({
      data: {
        salaId: dto.salaId,
        sesionId: dto.sesionId,
        fechaInicio: new Date(dto.fechaInicio),
        fechaFin: new Date(dto.fechaFin),
        estado: dto.estado || 'RESERVADA',
        motivo: dto.motivo,
      },
      include: {
        sala: true,
        sesion: {
          include: {
            taller: {
              select: {
                tema: true,
              },
            },
          },
        },
      },
    });
  }

  async findAllReservas(salaId?: string, fechaInicio?: string, fechaFin?: string) {
    const where: any = {};

    if (salaId) where.salaId = salaId;

    if (fechaInicio || fechaFin) {
      where.OR = [];
      if (fechaInicio && fechaFin) {
        where.OR.push({
          fechaInicio: { gte: new Date(fechaInicio), lte: new Date(fechaFin) },
        });
        where.OR.push({
          fechaFin: { gte: new Date(fechaInicio), lte: new Date(fechaFin) },
        });
        where.OR.push({
          fechaInicio: { lte: new Date(fechaInicio) },
          fechaFin: { gte: new Date(fechaFin) },
        });
      } else if (fechaInicio) {
        where.fechaFin = { gte: new Date(fechaInicio) };
      } else if (fechaFin) {
        where.fechaInicio = { lte: new Date(fechaFin) };
      }
    }

    return this.prisma.reservaSala.findMany({
      where,
      include: {
        sala: true,
        sesion: {
          include: {
            taller: {
              select: {
                tema: true,
                trainer: {
                  select: {
                    nombre: true,
                  },
                },
              },
            },
          },
        },
      },
      orderBy: { fechaInicio: 'asc' },
    });
  }

  async findOneReserva(id: string) {
    const reserva = await this.prisma.reservaSala.findUnique({
      where: { id },
      include: {
        sala: true,
        sesion: {
          include: {
            taller: true,
          },
        },
      },
    });

    if (!reserva) {
      throw new NotFoundException('Reserva no encontrada');
    }

    return reserva;
  }

  async updateReserva(id: string, dto: UpdateReservaSalaDto) {
    const reserva = await this.findOneReserva(id);

    // Si se están cambiando las fechas, verificar disponibilidad
    if (dto.fechaInicio || dto.fechaFin) {
      const fechaInicio = dto.fechaInicio
        ? new Date(dto.fechaInicio)
        : reserva.fechaInicio;
      const fechaFin = dto.fechaFin ? new Date(dto.fechaFin) : reserva.fechaFin;

      const disponibilidad = await this.verificarDisponibilidad({
        salaId: reserva.salaId,
        fechaInicio: fechaInicio.toISOString(),
        fechaFin: fechaFin.toISOString(),
        reservaId: id,
      });

      if (!disponibilidad.disponible) {
        throw new BadRequestException({
          message: 'La sala no está disponible en ese horario',
          conflictos: disponibilidad.conflictos,
        });
      }
    }

    return this.prisma.reservaSala.update({
      where: { id },
      data: {
        ...(dto.salaId && { salaId: dto.salaId }),
        ...(dto.sesionId !== undefined && { sesionId: dto.sesionId }),
        ...(dto.fechaInicio && { fechaInicio: new Date(dto.fechaInicio) }),
        ...(dto.fechaFin && { fechaFin: new Date(dto.fechaFin) }),
        ...(dto.estado && { estado: dto.estado }),
        ...(dto.motivo !== undefined && { motivo: dto.motivo }),
      },
      include: {
        sala: true,
        sesion: {
          include: {
            taller: {
              select: {
                tema: true,
              },
            },
          },
        },
      },
    });
  }

  async removeReserva(id: string) {
    await this.findOneReserva(id);
    return this.prisma.reservaSala.delete({ where: { id } });
  }
}

