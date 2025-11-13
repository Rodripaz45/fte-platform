import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { FiltrosReporteDto } from './dto/filtros-reporte.dto';

@Injectable()
export class ReportesService {
  constructor(private readonly prisma: PrismaService) {}

  /**
   * Construye los filtros WHERE para Prisma basado en FiltrosReporteDto
   */
  private construirFiltros(filtros: FiltrosReporteDto) {
    const where: any = {};

    // Filtro por periodo (fecha inicio y fin)
    if (filtros.fechaInicio || filtros.fechaFin) {
      where.fechaInicio = {};
      if (filtros.fechaInicio) {
        where.fechaInicio.gte = new Date(filtros.fechaInicio);
      }
      if (filtros.fechaFin) {
        where.fechaInicio.lte = new Date(filtros.fechaFin);
      }
    }

    // Filtro por modalidad
    if (filtros.modalidad) {
      where.modalidad = filtros.modalidad;
    }

    // Filtro por taller
    if (filtros.tallerId) {
      where.id = filtros.tallerId;
    }

    return where;
  }

  /**
   * Construye filtros para inscripciones
   */
  private construirFiltrosInscripciones(filtros: FiltrosReporteDto) {
    const where: any = {};

    if (filtros.tallerId) {
      where.tallerId = filtros.tallerId;
    }

    if (filtros.participanteId) {
      where.participanteId = filtros.participanteId;
    }

    if (filtros.fechaInicio || filtros.fechaFin) {
      where.creadoEn = {};
      if (filtros.fechaInicio) {
        where.creadoEn.gte = new Date(filtros.fechaInicio);
      }
      if (filtros.fechaFin) {
        where.creadoEn.lte = new Date(filtros.fechaFin);
      }
    }

    // Incluir filtro por modalidad del taller
    if (filtros.modalidad) {
      where.taller = {
        modalidad: filtros.modalidad,
      };
    }

    return where;
  }

  /**
   * KPI: Tasa de asistencia por taller
   * Calcula: (asistencias PRESENTE / total inscripciones) * 100
   */
  async tasaAsistenciaPorTaller(filtros: FiltrosReporteDto) {
    const whereTalleres = this.construirFiltros(filtros);

    const talleres = await this.prisma.taller.findMany({
      where: whereTalleres,
      include: {
        sesiones: {
          include: {
            asistencias: true,
          },
        },
        inscripciones: {
          where: {
            estado: { in: ['INSCRITO', 'FINALIZADO'] },
          },
        },
      },
    });

    return talleres.map((taller) => {
      // Contar total de asistencias PRESENTE en todas las sesiones del taller
      const totalAsistencias = taller.sesiones.reduce(
        (acc, sesion) =>
          acc + sesion.asistencias.filter((a) => a.estado === 'PRESENTE').length,
        0,
      );

      // Total de inscripciones activas
      const totalInscripciones = taller.inscripciones.length;

      // Total de sesiones
      const totalSesiones = taller.sesiones.length;

      // Calcular tasa de asistencia
      // Si hay sesiones, calculamos: (asistencias / (inscripciones * sesiones)) * 100
      const tasa =
        totalSesiones > 0 && totalInscripciones > 0
          ? (totalAsistencias / (totalInscripciones * totalSesiones)) * 100
          : 0;

      return {
        tallerId: taller.id,
        tema: taller.tema,
        modalidad: taller.modalidad,
        totalInscripciones,
        totalSesiones,
        totalAsistencias,
        tasaAsistencia: Math.round(tasa * 100) / 100, // Redondear a 2 decimales
      };
    });
  }

  /**
   * KPI: Satisfacción promedio por taller
   * Calcula: promedio de puntajes de retroalimentación
   */
  async satisfaccionPorTaller(filtros: FiltrosReporteDto) {
    const whereTalleres = this.construirFiltros(filtros);

    const talleres = await this.prisma.taller.findMany({
      where: whereTalleres,
      include: {
        feedbacks: {
          where: {
            puntaje: { not: null },
          },
        },
      },
    });

    return talleres.map((taller) => {
      const feedbacks = taller.feedbacks;
      const totalFeedbacks = feedbacks.length;
      const sumaPuntajes = feedbacks.reduce((acc, fb) => acc + (fb.puntaje || 0), 0);
      const promedio = totalFeedbacks > 0 ? sumaPuntajes / totalFeedbacks : 0;

      return {
        tallerId: taller.id,
        tema: taller.tema,
        modalidad: taller.modalidad,
        totalFeedbacks,
        promedioSatisfaccion: Math.round(promedio * 100) / 100,
        distribucion: [1, 2, 3, 4, 5].map((p) => ({
          puntaje: p,
          cantidad: feedbacks.filter((fb) => fb.puntaje === p).length,
        })),
      };
    });
  }

  /**
   * KPI: Tasa de recurrencia de participantes
   * Calcula: porcentaje de participantes que se inscribieron a más de un taller
   */
  async tasaRecurrencia(filtros: FiltrosReporteDto) {
    const whereInscripciones = this.construirFiltrosInscripciones(filtros);

    // Obtener todos los participantes únicos con sus conteos de inscripciones
    const inscripciones = await this.prisma.inscripcion.findMany({
      where: {
        ...whereInscripciones,
        estado: { in: ['INSCRITO', 'FINALIZADO'] },
      },
      select: {
        participanteId: true,
      },
    });

    // Contar inscripciones por participante
    const conteoPorParticipante = new Map<string, number>();
    inscripciones.forEach((insc) => {
      const count = conteoPorParticipante.get(insc.participanteId) || 0;
      conteoPorParticipante.set(insc.participanteId, count + 1);
    });

    const totalParticipantes = conteoPorParticipante.size;
    const participantesRecurrentes = Array.from(conteoPorParticipante.values()).filter(
      (count) => count > 1,
    ).length;

    const tasaRecurrencia =
      totalParticipantes > 0 ? (participantesRecurrentes / totalParticipantes) * 100 : 0;

    return {
      totalParticipantes,
      participantesRecurrentes,
      participantesUnicos: totalParticipantes - participantesRecurrentes,
      tasaRecurrencia: Math.round(tasaRecurrencia * 100) / 100,
    };
  }

  /**
   * KPI: Cobertura (participantes únicos)
   * Calcula: número de participantes únicos que han participado en talleres
   */
  async cobertura(filtros: FiltrosReporteDto) {
    const whereInscripciones = this.construirFiltrosInscripciones(filtros);

    const participantesUnicos = await this.prisma.inscripcion.findMany({
      where: {
        ...whereInscripciones,
        estado: { in: ['INSCRITO', 'FINALIZADO'] },
      },
      select: {
        participanteId: true,
      },
      distinct: ['participanteId'],
    });

    return {
      participantesUnicos: participantesUnicos.length,
    };
  }

  /**
   * Dashboard ejecutivo: combina todos los KPIs
   */
  async dashboardEjecutivo(filtros: FiltrosReporteDto) {
    const [asistencia, satisfaccion, recurrencia, cobertura] = await Promise.all([
      this.tasaAsistenciaPorTaller(filtros),
      this.satisfaccionPorTaller(filtros),
      this.tasaRecurrencia(filtros),
      this.cobertura(filtros),
    ]);

    // Calcular promedios generales
    const promedioAsistencia =
      asistencia.length > 0
        ? asistencia.reduce((acc, item) => acc + item.tasaAsistencia, 0) / asistencia.length
        : 0;

    const promedioSatisfaccion =
      satisfaccion.length > 0
        ? satisfaccion.reduce((acc, item) => acc + item.promedioSatisfaccion, 0) /
          satisfaccion.length
        : 0;

    return {
      resumen: {
        promedioAsistencia: Math.round(promedioAsistencia * 100) / 100,
        promedioSatisfaccion: Math.round(promedioSatisfaccion * 100) / 100,
        tasaRecurrencia: recurrencia.tasaRecurrencia,
        cobertura: cobertura.participantesUnicos,
      },
      asistencia,
      satisfaccion,
      recurrencia,
      cobertura,
      filtros,
    };
  }

  /**
   * Reporte de inscripciones con detalles
   */
  async reporteInscripciones(filtros: FiltrosReporteDto) {
    const where = this.construirFiltrosInscripciones(filtros);

    const inscripciones = await this.prisma.inscripcion.findMany({
      where: {
        ...where,
        estado: { in: ['INSCRITO', 'FINALIZADO'] },
      },
      include: {
        taller: {
          select: {
            id: true,
            tema: true,
            modalidad: true,
            fechaInicio: true,
            fechaFin: true,
            sede: true,
          },
        },
        participante: {
          include: {
            usuario: {
              select: {
                id: true,
                nombre: true,
                email: true,
              },
            },
          },
        },
      },
      orderBy: {
        creadoEn: 'desc',
      },
    });

    return inscripciones;
  }

  /**
   * Reporte de asistencia con detalles
   */
  async reporteAsistencia(filtros: FiltrosReporteDto) {
    const whereTalleres = this.construirFiltros(filtros);

    const talleres = await this.prisma.taller.findMany({
      where: whereTalleres,
      include: {
        sesiones: {
          include: {
            asistencias: {
              include: {
                participante: {
                  include: {
                    usuario: {
                      select: {
                        nombre: true,
                        email: true,
                      },
                    },
                  },
                },
              },
            },
          },
        },
      },
    });

    return talleres.map((taller) => ({
      tallerId: taller.id,
      tema: taller.tema,
      modalidad: taller.modalidad,
      sesiones: taller.sesiones.map((sesion) => ({
        sesionId: sesion.id,
        fecha: sesion.fecha,
        asistencias: sesion.asistencias.map((asist) => ({
          participanteId: asist.participanteId,
          participanteNombre: asist.participante.usuario.nombre,
          participanteEmail: asist.participante.usuario.email,
          estado: asist.estado,
          tomadoEn: asist.tomadoEn,
        })),
      })),
    }));
  }

  /**
   * Reporte de satisfacción con detalles
   */
  async reporteSatisfaccion(filtros: FiltrosReporteDto) {
    const whereTalleres = this.construirFiltros(filtros);

    const talleres = await this.prisma.taller.findMany({
      where: whereTalleres,
      include: {
        feedbacks: {
          include: {
            participante: {
              include: {
                usuario: {
                  select: {
                    nombre: true,
                    email: true,
                  },
                },
              },
            },
          },
        },
      },
    });

    return talleres.map((taller) => {
      const feedbacks = taller.feedbacks;
      const totalFeedbacks = feedbacks.length;
      const sumaPuntajes = feedbacks.reduce((acc, fb) => acc + (fb.puntaje || 0), 0);
      const promedio = totalFeedbacks > 0 ? sumaPuntajes / totalFeedbacks : 0;

      return {
        tallerId: taller.id,
        tema: taller.tema,
        modalidad: taller.modalidad,
        totalFeedbacks,
        promedioSatisfaccion: Math.round(promedio * 100) / 100,
        feedbacks: feedbacks.map((fb) => ({
          participanteId: fb.participanteId,
          participanteNombre: fb.participante.usuario.nombre,
          participanteEmail: fb.participante.usuario.email,
          puntaje: fb.puntaje,
          comentario: fb.comentario,
          creadoEn: fb.creadoEn,
        })),
      };
    });
  }
}
