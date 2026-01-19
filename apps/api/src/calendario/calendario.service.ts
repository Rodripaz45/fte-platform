import { BadRequestException, Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { FiltrosCalendarioDto } from './dto/filtros-calendario.dto';

@Injectable()
export class CalendarioService {
  constructor(private readonly prisma: PrismaService) {}

  /**
   * Obtiene eventos del calendario con filtros
   */
  async obtenerEventos(filtros: FiltrosCalendarioDto) {
    const fechaInicio = filtros.fechaInicio ? new Date(filtros.fechaInicio) : undefined;
    const fechaFin = filtros.fechaFin ? new Date(filtros.fechaFin) : undefined;

    if (fechaInicio && fechaFin && fechaInicio > fechaFin) {
      throw new BadRequestException(
        'La fecha de inicio debe ser anterior a la fecha de fin',
      );
    }

    const eventos: any[] = [];

    // Obtener talleres
    const whereTalleres: any = {};
    if (filtros.trainerId) whereTalleres.trainerId = filtros.trainerId;
    if (filtros.sede) whereTalleres.sede = filtros.sede;
    if (filtros.modalidad) whereTalleres.modalidad = filtros.modalidad;
    if (filtros.estado) whereTalleres.estado = filtros.estado;
    if (fechaInicio || fechaFin) {
      whereTalleres.OR = [];
      if (fechaInicio && fechaFin) {
        whereTalleres.OR.push({
          fechaInicio: { gte: fechaInicio, lte: fechaFin },
        });
        whereTalleres.OR.push({
          fechaFin: { gte: fechaInicio, lte: fechaFin },
        });
        whereTalleres.OR.push({
          fechaInicio: { lte: fechaInicio },
          fechaFin: { gte: fechaFin },
        });
      } else if (fechaInicio) {
        whereTalleres.fechaFin = { gte: fechaInicio };
      } else if (fechaFin) {
        whereTalleres.fechaInicio = { lte: fechaFin };
      }
    }

    if (!filtros.tiposEvento || filtros.tiposEvento.includes('TALLER')) {
      const talleres = await this.prisma.taller.findMany({
        where: whereTalleres,
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
            },
          },
          _count: {
            select: {
              sesiones: true,
              inscripciones: true,
            },
          },
        },
      });

      eventos.push(
        ...talleres.map((taller) => ({
          id: taller.id,
          tipo: 'TALLER',
          titulo: taller.tema,
          descripcion: `Modalidad: ${taller.modalidad}${taller.sede ? ` | Sede: ${taller.sede}` : ''}`,
          fechaInicio: taller.fechaInicio,
          fechaFin: taller.fechaFin,
          todoElDia: !taller.fechaInicio || !taller.fechaFin,
          color: this.getColorPorEstado(taller.estado || undefined),
          estado: taller.estado,
          trainer: taller.trainer,
          sede: taller.sede,
          modalidad: taller.modalidad,
          cupos: taller.cupos,
          inscripciones: taller._count.inscripciones,
          sesiones: taller._count.sesiones,
          unidadEducativa: taller.unidadEducativa,
        })),
      );
    }

    // Obtener sesiones
    if (!filtros.tiposEvento || filtros.tiposEvento.includes('SESION')) {
      const whereSesiones: any = {};
      if (filtros.trainerId) {
        whereSesiones.OR = [
          { responsableId: filtros.trainerId },
          { taller: { trainerId: filtros.trainerId } },
        ];
      }
      if (fechaInicio || fechaFin) {
        if (fechaInicio && fechaFin) {
          whereSesiones.fecha = {
            gte: fechaInicio,
            lte: fechaFin,
          };
        } else if (fechaInicio) {
          whereSesiones.fecha = { gte: fechaInicio };
        } else if (fechaFin) {
          whereSesiones.fecha = { lte: fechaFin };
        }
      }

      const sesiones = await this.prisma.sesion.findMany({
        where: whereSesiones,
        include: {
          taller: {
            select: {
              id: true,
              tema: true,
              modalidad: true,
              sede: true,
              trainer: {
                select: {
                  id: true,
                  nombre: true,
                  email: true,
                },
              },
            },
          },
          responsable: {
            select: {
              id: true,
              nombre: true,
              email: true,
            },
          },
          sala: {
            select: {
              id: true,
              nombre: true,
              sede: true,
            },
          },
        },
      });

      eventos.push(
        ...sesiones.map((sesion) => ({
          id: sesion.id,
          tipo: 'SESION',
          titulo: sesion.taller.tema,
          descripcion: `Sesión del taller: ${sesion.taller.tema}`,
          fechaInicio: sesion.horaInicio || sesion.fecha,
          fechaFin: sesion.horaFin || sesion.fecha,
          todoElDia: !sesion.horaInicio && !sesion.horaFin,
          color: '#2196F3', // Azul para sesiones
          taller: sesion.taller,
          responsable: sesion.responsable,
          sala: sesion.sala,
          fecha: sesion.fecha,
        })),
      );
    }

    // Obtener reservas de salas (bloqueos)
    if (!filtros.tiposEvento || filtros.tiposEvento.includes('BLOQUEO')) {
      const whereReservas: any = {};
      if (filtros.sede) {
        whereReservas.sala = { sede: filtros.sede };
      }
      if (fechaInicio || fechaFin) {
        whereReservas.OR = [];
        if (fechaInicio && fechaFin) {
          whereReservas.OR.push({
            fechaInicio: { gte: fechaInicio, lte: fechaFin },
          });
          whereReservas.OR.push({
            fechaFin: { gte: fechaInicio, lte: fechaFin },
          });
          whereReservas.OR.push({
            fechaInicio: { lte: fechaInicio },
            fechaFin: { gte: fechaFin },
          });
        } else if (fechaInicio) {
          whereReservas.fechaFin = { gte: fechaInicio };
        } else if (fechaFin) {
          whereReservas.fechaInicio = { lte: fechaFin };
        }
      }

      const reservas = await this.prisma.reservaSala.findMany({
        where: {
          ...whereReservas,
          estado: { in: ['RESERVADA', 'CONFIRMADA'] },
          sesionId: null, // Solo bloqueos sin sesión asociada
        },
        include: {
          sala: true,
        },
      });

      eventos.push(
        ...reservas.map((reserva) => ({
          id: reserva.id,
          tipo: 'BLOQUEO',
          titulo: `Bloqueo: ${reserva.sala.nombre}`,
          descripcion: reserva.motivo || `Sala ${reserva.sala.nombre} bloqueada`,
          fechaInicio: reserva.fechaInicio,
          fechaFin: reserva.fechaFin,
          todoElDia: false,
          color: '#FF9800', // Naranja para bloqueos
          sala: reserva.sala,
          motivo: reserva.motivo,
        })),
      );
    }

    // Ordenar eventos por fecha
    eventos.sort((a, b) => {
      const fechaA = a.fechaInicio || a.fecha || new Date(0);
      const fechaB = b.fechaInicio || b.fecha || new Date(0);
      return fechaA.getTime() - fechaB.getTime();
    });

    return {
      eventos,
      total: eventos.length,
      filtros,
    };
  }

  /**
   * Detecta conflictos en el calendario
   */
  async detectarConflictos(fechaInicio?: string, fechaFin?: string) {
    const inicio = fechaInicio ? new Date(fechaInicio) : new Date();
    const fin = fechaFin ? new Date(fechaFin) : new Date();
    fin.setMonth(fin.getMonth() + 1); // Por defecto, próximo mes

    const conflictos: any[] = [];

    // 1. Conflictos de trainers (mismo trainer, sesiones simultáneas)
    const sesiones = await this.prisma.sesion.findMany({
      where: {
        fecha: {
          gte: inicio,
          lte: fin,
        },
      },
      include: {
        taller: {
          select: {
            trainerId: true,
            trainer: {
              select: {
                nombre: true,
              },
            },
          },
        },
        responsable: {
          select: {
            nombre: true,
          },
        },
      },
    });

    // Agrupar por trainer y detectar solapamientos
    const sesionesPorTrainer = new Map<string, any[]>();

    for (const sesion of sesiones) {
      const trainerId = sesion.responsableId || sesion.taller.trainerId;
      if (trainerId) {
        if (!sesionesPorTrainer.has(trainerId)) {
          sesionesPorTrainer.set(trainerId, []);
        }
        sesionesPorTrainer.get(trainerId)!.push(sesion);
      }
    }

    for (const [trainerId, sesionesTrainer] of sesionesPorTrainer.entries()) {
      for (let i = 0; i < sesionesTrainer.length; i++) {
        for (let j = i + 1; j < sesionesTrainer.length; j++) {
          const s1 = sesionesTrainer[i];
          const s2 = sesionesTrainer[j];

          if (this.haySolapamiento(s1, s2)) {
            conflictos.push({
              tipo: 'TRAINER_CONFLICTO',
              severidad: 'ALTA',
              descripcion: `El trainer tiene dos sesiones simultáneas`,
              trainer: {
                id: trainerId,
                nombre: s1.responsable?.nombre || s1.taller.trainer.nombre,
              },
              sesiones: [
                {
                  id: s1.id,
                  fecha: s1.fecha,
                  horaInicio: s1.horaInicio,
                  horaFin: s1.horaFin,
                  taller: s1.taller.tema,
                },
                {
                  id: s2.id,
                  fecha: s2.fecha,
                  horaInicio: s2.horaInicio,
                  horaFin: s2.horaFin,
                  taller: s2.taller.tema,
                },
              ],
            });
          }
        }
      }
    }

    // 2. Conflictos de salas (misma sala, reservas simultáneas)
    const reservas = await this.prisma.reservaSala.findMany({
      where: {
        estado: { in: ['RESERVADA', 'CONFIRMADA'] },
        fechaInicio: { lte: fin },
        fechaFin: { gte: inicio },
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

    const reservasPorSala = new Map<string, any[]>();

    for (const reserva of reservas) {
      if (!reservasPorSala.has(reserva.salaId)) {
        reservasPorSala.set(reserva.salaId, []);
      }
      reservasPorSala.get(reserva.salaId)!.push(reserva);
    }

    for (const [salaId, reservasSala] of reservasPorSala.entries()) {
      for (let i = 0; i < reservasSala.length; i++) {
        for (let j = i + 1; j < reservasSala.length; j++) {
          const r1 = reservasSala[i];
          const r2 = reservasSala[j];

          if (this.haySolapamientoReserva(r1, r2)) {
            conflictos.push({
              tipo: 'SALA_CONFLICTO',
              severidad: 'ALTA',
              descripcion: `La sala tiene dos reservas simultáneas`,
              sala: {
                id: r1.sala.id,
                nombre: r1.sala.nombre,
                sede: r1.sala.sede,
              },
              reservas: [
                {
                  id: r1.id,
                  fechaInicio: r1.fechaInicio,
                  fechaFin: r1.fechaFin,
                  sesion: r1.sesion
                    ? {
                        id: r1.sesion.id,
                        taller: r1.sesion.taller.tema,
                      }
                    : null,
                  motivo: r1.motivo,
                },
                {
                  id: r2.id,
                  fechaInicio: r2.fechaInicio,
                  fechaFin: r2.fechaFin,
                  sesion: r2.sesion
                    ? {
                        id: r2.sesion.id,
                        taller: r2.sesion.taller.tema,
                      }
                    : null,
                  motivo: r2.motivo,
                },
              ],
            });
          }
        }
      }
    }

    return {
      conflictos,
      total: conflictos.length,
      periodo: {
        fechaInicio: inicio,
        fechaFin: fin,
      },
    };
  }

  /**
   * Verifica si dos sesiones se solapan
   */
  private haySolapamiento(sesion1: any, sesion2: any): boolean {
    // Si son el mismo día
    if (
      sesion1.fecha.toDateString() !== sesion2.fecha.toDateString()
    ) {
      return false;
    }

    // Si ambas tienen horas
    if (sesion1.horaInicio && sesion1.horaFin && sesion2.horaInicio && sesion2.horaFin) {
      const inicio1 = new Date(sesion1.horaInicio);
      const fin1 = new Date(sesion1.horaFin);
      const inicio2 = new Date(sesion2.horaInicio);
      const fin2 = new Date(sesion2.horaFin);

      return inicio1 < fin2 && inicio2 < fin1;
    }

    // Si una o ambas no tienen horas específicas, se consideran todo el día
    return true;
  }

  /**
   * Verifica si dos reservas se solapan
   */
  private haySolapamientoReserva(reserva1: any, reserva2: any): boolean {
    return reserva1.fechaInicio < reserva2.fechaFin && reserva2.fechaInicio < reserva1.fechaFin;
  }

  /**
   * Obtiene color según estado del taller
   */
  private getColorPorEstado(estado?: string): string {
    switch (estado) {
      case 'PUBLICADO':
        return '#4CAF50'; // Verde
      case 'EN_CURSO':
        return '#2196F3'; // Azul
      case 'FINALIZADO':
        return '#9E9E9E'; // Gris
      case 'CERRADO':
        return '#FF9800'; // Naranja
      case 'CANCELADO':
        return '#F44336'; // Rojo
      case 'BORRADOR':
        return '#9E9E9E'; // Gris
      default:
        return '#757575'; // Gris oscuro
    }
  }
}

