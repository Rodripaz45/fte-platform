import { BadRequestException, Injectable, NotFoundException, Logger } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { CreateTallereDto } from './dto/create-tallere.dto';
import { UpdateTallereDto } from './dto/update-tallere.dto';
import { NotificacionesService } from '../notificaciones/notificaciones.service';

@Injectable()
export class TalleresService {
  private readonly logger = new Logger(TalleresService.name);
  private certificadosService: any; // Se inyectará dinámicamente para evitar dependencia circular

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

    // Validar y crear/buscar unidad educativa si el tipo es UNIDAD_EDUCATIVA
    let unidadEducativaId: string | null = null;
    if (dto.tipo === 'UNIDAD_EDUCATIVA') {
      if (dto.unidadEducativaNombre) {
        // Buscar o crear unidad educativa por nombre
        let unidad = await this.prisma.unidadEducativa.findFirst({
          where: { nombre: dto.unidadEducativaNombre.trim() },
        });
        if (!unidad) {
          // Crear nueva unidad educativa
          unidad = await this.prisma.unidadEducativa.create({
            data: {
              nombre: dto.unidadEducativaNombre.trim(),
            },
          });
        }
        unidadEducativaId = unidad.id;
      } else if (dto.unidadEducativaId) {
        // Validar que existe si se proporciona ID
        const unidad = await this.prisma.unidadEducativa.findUnique({
          where: { id: dto.unidadEducativaId },
        });
        if (!unidad) {
          throw new NotFoundException('Unidad educativa no encontrada');
        }
        unidadEducativaId = dto.unidadEducativaId;
      } else {
        throw new BadRequestException('Debe proporcionar el nombre o ID de la unidad educativa para talleres de tipo UNIDAD_EDUCATIVA');
      }
    }

    const taller = await this.prisma.taller.create({
      data: {
        tema: dto.tema,
        modalidad: dto.modalidad,
        cupos: dto.cupos ?? 0,
        fechaInicio: dto.fechaInicio ? new Date(dto.fechaInicio) : null,
        fechaFin: dto.fechaFin ? new Date(dto.fechaFin) : null,
        sede: dto.sede,
        estado: dto.estado ?? 'BORRADOR',
        tipo: dto.tipo ?? 'NORMAL',
        trainerId: dto.trainerId,
        unidadEducativaId: unidadEducativaId,
      },
      include: {
        trainer: {
          select: {
            id: true,
            nombre: true,
            email: true,
          },
        },
        unidadEducativa: dto.tipo === 'UNIDAD_EDUCATIVA' ? {
          select: {
            id: true,
            nombre: true,
            codigo: true,
          },
        } : false,
      },
    });

    // Solo notificar a participantes si es un taller NORMAL (no UE)
    if (taller.tipo !== 'UNIDAD_EDUCATIVA') {
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
        unidadEducativa: {
          select: {
            id: true,
            nombre: true,
            codigo: true,
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
        unidadEducativa: {
          select: {
            id: true,
            nombre: true,
            codigo: true,
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
        unidadEducativa: {
          select: {
            id: true,
            nombre: true,
            codigo: true,
            direccion: true,
            contacto: true,
            email: true,
            telefono: true,
          },
        },
        listaParticipantes: {
          include: {
            asistenciasUE: true,
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

    // Manejar unidad educativa si se está actualizando
    let unidadEducativaId: string | null | undefined = undefined;
    if (dto.tipo === 'UNIDAD_EDUCATIVA' || taller.tipo === 'UNIDAD_EDUCATIVA') {
      if (dto.unidadEducativaNombre) {
        // Buscar o crear unidad educativa por nombre
        let unidad = await this.prisma.unidadEducativa.findFirst({
          where: { nombre: dto.unidadEducativaNombre.trim() },
        });
        if (!unidad) {
          // Crear nueva unidad educativa
          unidad = await this.prisma.unidadEducativa.create({
            data: {
              nombre: dto.unidadEducativaNombre.trim(),
            },
          });
        }
        unidadEducativaId = unidad.id;
      } else if (dto.unidadEducativaId) {
        // Validar que existe si se proporciona ID
        const unidad = await this.prisma.unidadEducativa.findUnique({
          where: { id: dto.unidadEducativaId },
        });
        if (!unidad) {
          throw new NotFoundException('Unidad educativa no encontrada');
        }
        unidadEducativaId = dto.unidadEducativaId;
      } else if (taller.tipo === 'UNIDAD_EDUCATIVA' && dto.tipo !== 'NORMAL') {
        // Mantener la unidad educativa existente si no se especifica otra
        unidadEducativaId = taller.unidadEducativaId;
      }
    } else if (dto.tipo === 'NORMAL') {
      // Si se cambia a NORMAL, eliminar la relación
      unidadEducativaId = null;
    }
    
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
    // Usar unidadEducativaId calculado
    if (unidadEducativaId !== undefined) {
      data.unidadEducativaId = unidadEducativaId;
    }
    delete data.unidadEducativaNombre; // No enviar este campo a Prisma
    
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

  /**
   * Publica un taller (cambia estado de BORRADOR a PUBLICADO)
   * Solo talleres PUBLICADOS pueden recibir inscripciones
   */
  async publicar(id: string) {
    const taller = await this.findOne(id);
    
    if (taller.estado === 'PUBLICADO') {
      throw new BadRequestException('El taller ya está publicado');
    }
    
    if (taller.estado === 'CERRADO' || taller.estado === 'FINALIZADO' || taller.estado === 'CANCELADO') {
      throw new BadRequestException(`No se puede publicar un taller con estado ${taller.estado}`);
    }

    return this.prisma.taller.update({
      where: { id },
      data: { estado: 'PUBLICADO' },
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

  /**
   * Cierra un taller (cambia estado a CERRADO)
   * Los talleres CERRADOS no pueden recibir nuevas inscripciones
   */
  async cerrar(id: string) {
    const taller = await this.findOne(id);
    
    if (taller.estado === 'CERRADO') {
      throw new BadRequestException('El taller ya está cerrado');
    }
    
    if (taller.estado === 'FINALIZADO' || taller.estado === 'CANCELADO') {
      throw new BadRequestException(`No se puede cerrar un taller con estado ${taller.estado}`);
    }

    return this.prisma.taller.update({
      where: { id },
      data: { estado: 'CERRADO' },
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

  /**
   * Método para inyectar el servicio de certificados (evita dependencia circular)
   */
  setCertificadosService(service: any) {
    (this as any).certificadosService = service;
  }

  /**
   * Finaliza un taller (cambia estado a FINALIZADO)
   * Al finalizar, se generan y envían certificados automáticamente a los participantes elegibles
   */
  async finalizar(id: string) {
    const taller = await this.findOne(id);
    
    if (taller.estado === 'FINALIZADO') {
      throw new BadRequestException('El taller ya está finalizado');
    }
    
    if (taller.estado === 'CANCELADO') {
      throw new BadRequestException('No se puede finalizar un taller cancelado');
    }

    // Actualizar estado a FINALIZADO
    const tallerActualizado = await this.prisma.taller.update({
      where: { id },
      data: { estado: 'FINALIZADO' },
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

    // Generar y enviar certificados automáticamente
    const certificadosService = (this as any).certificadosService;
    if (certificadosService) {
      try {
        this.logger.log(`Generando certificados automáticamente para taller ${id}`);
        const resultado = await certificadosService.emitirCertificadosAutomaticos(id);
        this.logger.log(
          `Certificados generados: ${resultado.emitidos} emitidos, ${resultado.noElegibles} no elegibles, ${resultado.errores} errores`,
        );
      } catch (error) {
        this.logger.error(`Error generando certificados automáticamente para taller ${id}:`, error);
        // No lanzar error, el taller ya está finalizado
      }
    } else {
      this.logger.warn('CertificadosService no está disponible, no se generarán certificados automáticamente');
    }

    return tallerActualizado;
  }
}
