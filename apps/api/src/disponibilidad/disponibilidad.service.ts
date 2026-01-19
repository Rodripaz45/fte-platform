import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { CreateDisponibilidadDto } from './dto/create-disponibilidad.dto';
import { UpdateDisponibilidadDto } from './dto/update-disponibilidad.dto';
import { VerificarDisponibilidadTrainerDto } from './dto/verificar-disponibilidad-trainer.dto';

@Injectable()
export class DisponibilidadService {
  constructor(private readonly prisma: PrismaService) {}

  async verificarDisponibilidad(dto: VerificarDisponibilidadTrainerDto) {
    const fechaInicio = new Date(dto.fechaInicio);
    const fechaFin = new Date(dto.fechaFin);

    if (fechaInicio >= fechaFin) {
      throw new BadRequestException(
        'La fecha de inicio debe ser anterior a la fecha de fin',
      );
    }

    // Verificar que el trainer existe y tiene rol TRAINER
    const trainer = await this.prisma.usuario.findUnique({
      where: { id: dto.trainerId },
      include: { roles: { include: { rol: true } } },
    });

    if (!trainer) {
      throw new NotFoundException('Trainer no encontrado');
    }

    const tieneRolTrainer = trainer.roles.some((ur) => ur.rol.nombre === 'TRAINER');
    if (!tieneRolTrainer) {
      throw new BadRequestException('El usuario especificado no tiene rol TRAINER');
    }

    // Buscar conflictos de disponibilidad (NO_DISPONIBLE u OCUPADO)
    const conflictos = await this.prisma.disponibilidadTrainer.findMany({
      where: {
        trainerId: dto.trainerId,
        tipo: { in: ['NO_DISPONIBLE', 'OCUPADO'] },
        ...(dto.disponibilidadId && { id: { not: dto.disponibilidadId } }),
        OR: [
          {
            fechaInicio: { lte: fechaInicio },
            fechaFin: { gte: fechaInicio },
          },
          {
            fechaInicio: { lte: fechaFin },
            fechaFin: { gte: fechaFin },
          },
          {
            fechaInicio: { gte: fechaInicio },
            fechaFin: { lte: fechaFin },
          },
        ],
      },
    });

    // Buscar sesiones que se solapen con el horario
    const sesionesConflictivas = await this.prisma.sesion.findMany({
      where: {
        AND: [
          {
            OR: [
              {
                responsableId: dto.trainerId,
              },
              {
                taller: {
                  trainerId: dto.trainerId,
                },
              },
            ],
          },
          {
            OR: [
              {
                AND: [
                  { horaInicio: { not: null } },
                  { horaFin: { not: null } },
                  {
                    horaInicio: { lte: fechaInicio },
                    horaFin: { gte: fechaInicio },
                  },
                ],
              },
              {
                AND: [
                  { horaInicio: { not: null } },
                  { horaFin: { not: null } },
                  {
                    horaInicio: { lte: fechaFin },
                    horaFin: { gte: fechaFin },
                  },
                ],
              },
              {
                AND: [
                  { horaInicio: { not: null } },
                  { horaFin: { not: null } },
                  {
                    horaInicio: { gte: fechaInicio },
                    horaFin: { lte: fechaFin },
                  },
                ],
              },
              // Si no tiene horas específicas, considerar conflicto si es el mismo día
              {
                AND: [
                  { horaInicio: null },
                  { horaFin: null },
                  {
                    fecha: {
                      gte: new Date(fechaInicio.getFullYear(), fechaInicio.getMonth(), fechaInicio.getDate()),
                      lt: new Date(fechaInicio.getFullYear(), fechaInicio.getMonth(), fechaInicio.getDate() + 1),
                    },
                  },
                ],
              },
            ],
          },
        ],
      },
      include: {
        taller: {
          select: {
            tema: true,
          },
        },
      },
    });

    return {
      disponible: conflictos.length === 0 && sesionesConflictivas.length === 0,
      conflictosDisponibilidad: conflictos.map((c) => ({
        id: c.id,
        fechaInicio: c.fechaInicio,
        fechaFin: c.fechaFin,
        tipo: c.tipo,
        motivo: c.motivo,
      })),
      conflictosSesiones: sesionesConflictivas.map((s) => ({
        id: s.id,
        fecha: s.fecha,
        horaInicio: s.horaInicio,
        horaFin: s.horaFin,
        taller: s.taller.tema,
      })),
    };
  }

  async create(dto: CreateDisponibilidadDto) {
    const fechaInicio = new Date(dto.fechaInicio);
    const fechaFin = new Date(dto.fechaFin);

    if (fechaInicio >= fechaFin) {
      throw new BadRequestException(
        'La fecha de inicio debe ser anterior a la fecha de fin',
      );
    }

    // Verificar que el trainer existe y tiene rol TRAINER
    const trainer = await this.prisma.usuario.findUnique({
      where: { id: dto.trainerId },
      include: { roles: { include: { rol: true } } },
    });

    if (!trainer) {
      throw new NotFoundException('Trainer no encontrado');
    }

    const tieneRolTrainer = trainer.roles.some((ur) => ur.rol.nombre === 'TRAINER');
    if (!tieneRolTrainer) {
      throw new BadRequestException('El usuario especificado no tiene rol TRAINER');
    }

    // Si es NO_DISPONIBLE u OCUPADO, verificar que no haya conflictos
    if (dto.tipo === 'NO_DISPONIBLE' || dto.tipo === 'OCUPADO') {
      const disponibilidad = await this.verificarDisponibilidad({
        trainerId: dto.trainerId,
        fechaInicio: dto.fechaInicio,
        fechaFin: dto.fechaFin,
      });

      if (!disponibilidad.disponible) {
        throw new BadRequestException({
          message: 'El trainer tiene conflictos en ese horario',
          conflictos: disponibilidad,
        });
      }
    }

    return this.prisma.disponibilidadTrainer.create({
      data: {
        trainerId: dto.trainerId,
        fechaInicio,
        fechaFin,
        tipo: dto.tipo,
        motivo: dto.motivo,
      },
      include: {
        trainer: {
          select: {
            id: true,
            nombre: true,
            email: true,
          },
        },
      },
    });
  }

  async findAll(trainerId?: string, fechaInicio?: string, fechaFin?: string) {
    const where: any = {};

    if (trainerId) where.trainerId = trainerId;

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

    return this.prisma.disponibilidadTrainer.findMany({
      where,
      include: {
        trainer: {
          select: {
            id: true,
            nombre: true,
            email: true,
          },
        },
      },
      orderBy: { fechaInicio: 'asc' },
    });
  }

  async findOne(id: string) {
    const disponibilidad = await this.prisma.disponibilidadTrainer.findUnique({
      where: { id },
      include: {
        trainer: {
          select: {
            id: true,
            nombre: true,
            email: true,
          },
        },
      },
    });

    if (!disponibilidad) {
      throw new NotFoundException('Disponibilidad no encontrada');
    }

    return disponibilidad;
  }

  async update(id: string, dto: UpdateDisponibilidadDto) {
    const disponibilidad = await this.findOne(id);

    // Si se están cambiando las fechas o el tipo, verificar disponibilidad
    if (dto.fechaInicio || dto.fechaFin || dto.tipo) {
      const fechaInicio = dto.fechaInicio
        ? new Date(dto.fechaInicio)
        : disponibilidad.fechaInicio;
      const fechaFin = dto.fechaFin ? new Date(dto.fechaFin) : disponibilidad.fechaFin;
      const tipo = dto.tipo || disponibilidad.tipo;

      if (tipo === 'NO_DISPONIBLE' || tipo === 'OCUPADO') {
        const verificacion = await this.verificarDisponibilidad({
          trainerId: disponibilidad.trainerId,
          fechaInicio: fechaInicio.toISOString(),
          fechaFin: fechaFin.toISOString(),
          disponibilidadId: id,
        });

        if (!verificacion.disponible) {
          throw new BadRequestException({
            message: 'El trainer tiene conflictos en ese horario',
            conflictos: verificacion,
          });
        }
      }
    }

    return this.prisma.disponibilidadTrainer.update({
      where: { id },
      data: {
        ...(dto.trainerId && { trainerId: dto.trainerId }),
        ...(dto.fechaInicio && { fechaInicio: new Date(dto.fechaInicio) }),
        ...(dto.fechaFin && { fechaFin: new Date(dto.fechaFin) }),
        ...(dto.tipo && { tipo: dto.tipo }),
        ...(dto.motivo !== undefined && { motivo: dto.motivo }),
      },
      include: {
        trainer: {
          select: {
            id: true,
            nombre: true,
            email: true,
          },
        },
      },
    });
  }

  async remove(id: string) {
    await this.findOne(id);
    return this.prisma.disponibilidadTrainer.delete({ where: { id } });
  }

  /**
   * Obtiene la carga de trabajo de un trainer (número de sesiones y talleres)
   */
  async obtenerCargaTrabajo(trainerId: string, fechaInicio?: string, fechaFin?: string) {
    const trainer = await this.prisma.usuario.findUnique({
      where: { id: trainerId },
      include: { roles: { include: { rol: true } } },
    });

    if (!trainer) {
      throw new NotFoundException('Trainer no encontrado');
    }

    const tieneRolTrainer = trainer.roles.some((ur) => ur.rol.nombre === 'TRAINER');
    if (!tieneRolTrainer) {
      throw new BadRequestException('El usuario especificado no tiene rol TRAINER');
    }

    const whereSesiones: any = {
      OR: [
        { responsableId: trainerId },
        { taller: { trainerId } },
      ],
    };

    const whereTalleres: any = {
      trainerId,
    };

    if (fechaInicio || fechaFin) {
      if (fechaInicio && fechaFin) {
        whereSesiones.fecha = {
          gte: new Date(fechaInicio),
          lte: new Date(fechaFin),
        };
        whereTalleres.fechaInicio = {
          lte: new Date(fechaFin),
        };
        whereTalleres.fechaFin = {
          gte: new Date(fechaInicio),
        };
      } else if (fechaInicio) {
        whereSesiones.fecha = { gte: new Date(fechaInicio) };
        whereTalleres.fechaFin = { gte: new Date(fechaInicio) };
      } else if (fechaFin) {
        whereSesiones.fecha = { lte: new Date(fechaFin) };
        whereTalleres.fechaInicio = { lte: new Date(fechaFin) };
      }
    }

    const [sesiones, talleres, disponibilidades] = await Promise.all([
      this.prisma.sesion.count({ where: whereSesiones }),
      this.prisma.taller.count({ where: whereTalleres }),
      this.prisma.disponibilidadTrainer.findMany({
        where: {
          trainerId,
          tipo: 'NO_DISPONIBLE',
          ...(fechaInicio || fechaFin
            ? {
                OR: [
                  {
                    fechaInicio: { gte: fechaInicio ? new Date(fechaInicio) : undefined },
                    fechaFin: { lte: fechaFin ? new Date(fechaFin) : undefined },
                  },
                ],
              }
            : {}),
        },
      }),
    ]);

    return {
      trainer: {
        id: trainer.id,
        nombre: trainer.nombre,
        email: trainer.email,
      },
      periodo: {
        fechaInicio: fechaInicio || null,
        fechaFin: fechaFin || null,
      },
      estadisticas: {
        totalSesiones: sesiones,
        totalTalleres: talleres,
        diasNoDisponibles: disponibilidades.length,
      },
    };
  }

  /**
   * Sugiere trainers disponibles para un horario específico
   */
  async sugerirTrainersDisponibles(fechaInicio: string, fechaFin: string) {
    const inicio = new Date(fechaInicio);
    const fin = new Date(fechaFin);

    if (inicio >= fin) {
      throw new BadRequestException(
        'La fecha de inicio debe ser anterior a la fecha de fin',
      );
    }

    // Obtener todos los trainers
    const trainers = await this.prisma.usuario.findMany({
      where: {
        roles: {
          some: {
            rol: {
              nombre: 'TRAINER',
            },
          },
        },
        estado: 'ACTIVO',
      },
      include: {
        roles: {
          include: {
            rol: true,
          },
        },
      },
    });

    const trainersDisponibles: Array<{
      trainer: { id: string; nombre: string; email: string };
      disponible: boolean;
      cargaTrabajo?: { totalSesiones: number; totalTalleres: number; diasNoDisponibles: number };
      conflictos?: { disponible: boolean; conflictosDisponibilidad: any[]; conflictosSesiones: any[] };
    }> = [];

    for (const trainer of trainers) {
      const verificacion = await this.verificarDisponibilidad({
        trainerId: trainer.id,
        fechaInicio,
        fechaFin,
      });

      if (verificacion.disponible) {
        const cargaTrabajo = await this.obtenerCargaTrabajo(trainer.id);
        trainersDisponibles.push({
          trainer: {
            id: trainer.id,
            nombre: trainer.nombre,
            email: trainer.email,
          },
          disponible: true,
          cargaTrabajo: cargaTrabajo.estadisticas,
        });
      } else {
        trainersDisponibles.push({
          trainer: {
            id: trainer.id,
            nombre: trainer.nombre,
            email: trainer.email,
          },
          disponible: false,
          conflictos: verificacion,
        });
      }
    }

    return {
      fechaInicio,
      fechaFin,
      trainers: trainersDisponibles,
      disponibles: trainersDisponibles.filter((t) => t.disponible).length,
      noDisponibles: trainersDisponibles.filter((t) => !t.disponible).length,
    };
  }
}

