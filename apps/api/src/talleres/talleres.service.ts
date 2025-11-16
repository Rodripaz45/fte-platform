import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { CreateTallereDto } from './dto/create-tallere.dto';
import { UpdateTallereDto } from './dto/update-tallere.dto';
import { NotificacionesService } from '../notificaciones/notificaciones.service';

@Injectable()
export class TalleresService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly notificacionesService: NotificacionesService,
  ) {}

  async create(dto: CreateTallereDto) {
    if (dto.fechaInicio && dto.fechaFin && dto.fechaInicio >= dto.fechaFin) {
      throw new BadRequestException('La fecha de inicio debe ser anterior a la fecha de fin');
    }

    // Validar que el trainer existe y tiene rol TRAINER
    const trainer = await this.prisma.usuario.findUnique({
      where: { id: dto.trainerId },
      include: { roles: { include: { rol: true } } },
    });

    if (!trainer) {
      throw new NotFoundException('Trainer no encontrado');
    }

    const tieneRolTrainer = trainer.roles.some(ur => ur.rol.nombre === 'TRAINER');
    if (!tieneRolTrainer) {
      throw new BadRequestException('El usuario especificado no tiene rol TRAINER');
    }

    if (trainer.estado !== 'ACTIVO') {
      throw new BadRequestException('El trainer debe estar activo');
    }

    const taller = await this.prisma.taller.create({
      data: {
        tema: dto.tema,
        modalidad: dto.modalidad,
        cupos: dto.cupos ?? 0,
        fechaInicio: dto.fechaInicio ? new Date(dto.fechaInicio) : null,
        fechaFin: dto.fechaFin ? new Date(dto.fechaFin) : null,
        sede: dto.sede,
        estado: dto.estado ?? 'PROGRAMADO',
        trainerId: dto.trainerId,
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

    // Notificar a todos los participantes activos sobre el nuevo taller
    try {
      const participantes = await this.prisma.participante.findMany({
        include: { usuario: true },
      });

      // Crear notificaciones en paralelo (sin esperar)
      Promise.all(
        participantes.map(participante =>
          this.notificacionesService.crearNotificacionNuevoTaller(
            participante.usuario.id,
            taller.tema,
          ).catch(err => console.error(`Error notificando a ${participante.usuario.email}:`, err))
        )
      ).catch(() => {}); // Ignorar errores en el Promise.all
    } catch (error) {
      // No fallar la creación del taller si falla la notificación
      console.error('Error creando notificaciones de nuevo taller:', error);
    }

    return taller;
  }

  async findAll() {
    const talleres = await this.prisma.taller.findMany({
      include: {
        trainer: {
          select: {
            id: true,
            nombre: true,
            email: true,
          },
        },
      },
      orderBy: { creadoEn: 'desc' },
    });

    // Enriquecer con información de cupos disponibles
    return Promise.all(
      talleres.map(async (taller) => {
        const cupoMax = typeof taller.cupos === 'number' ? taller.cupos : null;
        
        if (cupoMax === null || cupoMax === 0) {
          return {
            ...taller,
            cuposDisponibles: null,
            cuposOcupados: 0,
            tieneCuposLimitados: false,
          };
        }

        const inscripcionesActivas = await this.prisma.inscripcion.count({
          where: {
            tallerId: taller.id,
            estado: { in: ['INSCRITO', 'FINALIZADO'] },
          },
        });

        const cuposDisponibles = Math.max(0, cupoMax - inscripcionesActivas);

        return {
          ...taller,
          cuposDisponibles,
          cuposOcupados: inscripcionesActivas,
          tieneCuposLimitados: true,
        };
      }),
    );
  }

  async findAllByTrainerId(trainerId: string) {
    const talleres = await this.prisma.taller.findMany({
      where: {
        trainerId: trainerId,
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
      orderBy: { creadoEn: 'desc' },
    });

    // Enriquecer con información de cupos disponibles
    return Promise.all(
      talleres.map(async (taller) => {
        const cupoMax = typeof taller.cupos === 'number' ? taller.cupos : null;
        
        if (cupoMax === null || cupoMax === 0) {
          return {
            ...taller,
            cuposDisponibles: null,
            cuposOcupados: 0,
            tieneCuposLimitados: false,
          };
        }

        const inscripcionesActivas = await this.prisma.inscripcion.count({
          where: {
            tallerId: taller.id,
            estado: { in: ['INSCRITO', 'FINALIZADO'] },
          },
        });

        const cuposDisponibles = Math.max(0, cupoMax - inscripcionesActivas);

        return {
          ...taller,
          cuposDisponibles,
          cuposOcupados: inscripcionesActivas,
          tieneCuposLimitados: true,
        };
      }),
    );
  }

  async findOne(id: string) {
    const taller = await this.prisma.taller.findUnique({
      where: { id },
      include: {
        inscripciones: true,
        feedbacks: true,
        trainer: {
          select: {
            id: true,
            nombre: true,
            email: true,
          },
        },
      },
    });
    if (!taller) throw new NotFoundException('Taller no encontrado');

    // Enriquecer con información de cupos disponibles
    const cupoMax = typeof taller.cupos === 'number' ? taller.cupos : null;
    
    if (cupoMax === null || cupoMax === 0) {
      return {
        ...taller,
        cuposDisponibles: null,
        cuposOcupados: taller.inscripciones.filter(
          (i) => i.estado === 'INSCRITO' || i.estado === 'FINALIZADO'
        ).length,
        tieneCuposLimitados: false,
      };
    }

    const inscripcionesActivas = taller.inscripciones.filter(
      (i) => i.estado === 'INSCRITO' || i.estado === 'FINALIZADO'
    ).length;

    const cuposDisponibles = Math.max(0, cupoMax - inscripcionesActivas);

    return {
      ...taller,
      cuposDisponibles,
      cuposOcupados: inscripcionesActivas,
      tieneCuposLimitados: true,
    };
  }

  async update(id: string, dto: UpdateTallereDto) {
    const taller = await this.findOne(id);
    
    // Validar trainer si se está actualizando
    if (dto.trainerId) {
      const trainer = await this.prisma.usuario.findUnique({
        where: { id: dto.trainerId },
        include: { roles: { include: { rol: true } } },
      });

      if (!trainer) {
        throw new NotFoundException('Trainer no encontrado');
      }

      const tieneRolTrainer = trainer.roles.some(ur => ur.rol.nombre === 'TRAINER');
      if (!tieneRolTrainer) {
        throw new BadRequestException('El usuario especificado no tiene rol TRAINER');
      }

      if (trainer.estado !== 'ACTIVO') {
        throw new BadRequestException('El trainer debe estar activo');
      }
    }
    
    // Convertir fechas a Date si vienen como string
    const data: any = { ...dto };
    if (dto.fechaInicio) {
      data.fechaInicio = new Date(dto.fechaInicio);
    }
    if (dto.fechaFin) {
      data.fechaFin = new Date(dto.fechaFin);
    }
    
    return this.prisma.taller.update({
      where: { id: taller.id },
      data,
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
    return this.prisma.taller.delete({ where: { id } });
  }
}
