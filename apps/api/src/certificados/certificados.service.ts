import { Injectable, NotFoundException, BadRequestException, Logger } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { CertificadoPdfService } from './certificado-pdf.service';
import { EmailService } from './email.service';

@Injectable()
export class CertificadosService {
  private readonly logger = new Logger(CertificadosService.name);
  private readonly ASISTENCIA_MINIMA = 0.75; // 75%

  constructor(
    private readonly prisma: PrismaService,
    private readonly certificadoPdfService: CertificadoPdfService,
    private readonly emailService: EmailService,
  ) {}

  /**
   * Verifica si un participante es elegible para recibir un certificado
   * Criterio: 75% de asistencia mínima
   */
  async verificarElegibilidad(tallerId: string, participanteId: string): Promise<{
    elegible: boolean;
    tasaAsistencia: number;
    totalSesiones: number;
    sesionesAsistidas: number;
  }> {
    // Obtener el taller con sus sesiones
    const taller = await this.prisma.taller.findUnique({
      where: { id: tallerId },
      include: {
        sesiones: {
          orderBy: { fecha: 'asc' },
        },
      },
    });

    if (!taller) {
      throw new NotFoundException('Taller no encontrado');
    }

    // Verificar que el participante está inscrito
    const inscripcion = await this.prisma.inscripcion.findUnique({
      where: {
        tallerId_participanteId: {
          tallerId,
          participanteId,
        },
      },
    });

    if (!inscripcion) {
      throw new NotFoundException('El participante no está inscrito en este taller');
    }

    const totalSesiones = taller.sesiones.length;
    if (totalSesiones === 0) {
      return {
        elegible: false,
        tasaAsistencia: 0,
        totalSesiones: 0,
        sesionesAsistidas: 0,
      };
    }

    // Contar asistencias PRESENTE
    const sesionesAsistidas = await this.prisma.asistencia.count({
      where: {
        participanteId,
        sesion: {
          tallerId,
        },
        estado: 'PRESENTE',
      },
    });

    const tasaAsistencia = sesionesAsistidas / totalSesiones;
    const elegible = tasaAsistencia >= this.ASISTENCIA_MINIMA;

    return {
      elegible,
      tasaAsistencia,
      totalSesiones,
      sesionesAsistidas,
    };
  }

  /**
   * Calcula las horas totales de un taller basado en las sesiones
   */
  private calcularHorasTotales(sesiones: Array<{ horaInicio: Date | null; horaFin: Date | null }>): number {
    let horasTotales = 0;

    for (const sesion of sesiones) {
      if (sesion.horaInicio && sesion.horaFin) {
        const inicio = new Date(sesion.horaInicio);
        const fin = new Date(sesion.horaFin);
        const diferenciaMs = fin.getTime() - inicio.getTime();
        const horas = diferenciaMs / (1000 * 60 * 60);
        horasTotales += horas;
      }
    }

    return Math.round(horasTotales * 10) / 10; // Redondear a 1 decimal
  }

  /**
   * Genera un código único de verificación
   */
  private generarCodigoVerificacion(tallerId: string, participanteId: string): string {
    const timestamp = Date.now().toString(36).toUpperCase();
    const random = Math.random().toString(36).substring(2, 10).toUpperCase();
    return `CERT-${tallerId.substring(0, 4)}-${participanteId.substring(0, 4)}-${timestamp}-${random}`;
  }

  /**
   * Emite un certificado para un participante
   */
  async emitirCertificado(
    tallerId: string,
    participanteId: string,
    emitidoPor?: string,
  ): Promise<any> {
    // Verificar que no existe ya un certificado
    const certificadoExistente = await this.prisma.certificado.findUnique({
      where: {
        tallerId_participanteId: {
          tallerId,
          participanteId,
        },
      },
    });

    if (certificadoExistente) {
      throw new BadRequestException('Ya existe un certificado para este participante en este taller');
    }

    // Verificar elegibilidad
    const elegibilidad = await this.verificarElegibilidad(tallerId, participanteId);
    if (!elegibilidad.elegible) {
      throw new BadRequestException(
        `El participante no cumple con los requisitos. Asistencia: ${(elegibilidad.tasaAsistencia * 100).toFixed(1)}% (mínimo requerido: 75%)`,
      );
    }

    // Obtener datos del taller y participante
    const taller = await this.prisma.taller.findUnique({
      where: { id: tallerId },
      include: {
        sesiones: {
          orderBy: { fecha: 'asc' },
        },
      },
    });

    const participante = await this.prisma.participante.findUnique({
      where: { id: participanteId },
      include: {
        usuario: true,
      },
    });

    if (!taller || !participante) {
      throw new NotFoundException('Taller o participante no encontrado');
    }

    // Generar código de verificación
    const codigoVerificacion = this.generarCodigoVerificacion(tallerId, participanteId);

    // Calcular horas totales
    const horasTotales = this.calcularHorasTotales(taller.sesiones);

    // Generar PDF del certificado
    const pdfBuffer = await this.certificadoPdfService.generarCertificadoPDF({
      nombreParticipante: participante.usuario.nombre,
      temaTaller: taller.tema,
      modalidad: taller.modalidad,
      fechaInicio: taller.fechaInicio,
      fechaFin: taller.fechaFin,
      horasTotales,
      codigoVerificacion,
      sede: taller.sede,
    });

    // Por ahora, no subimos a Firebase Storage desde el backend
    // El PDF se envía por email y se puede descargar desde ahí
    // Si en el futuro se necesita almacenar, se puede implementar
    const urlPDF: string | null = null;

    // Crear registro en BD
    const certificado = await this.prisma.certificado.create({
      data: {
        tallerId,
        participanteId,
        codigo: codigoVerificacion,
        urlPDF,
        emitidoPor: emitidoPor || null,
        enviadoPorEmail: false,
      },
      include: {
        participante: {
          include: {
            usuario: true,
          },
        },
        taller: true,
      },
    });

    // Enviar por email
    try {
      await this.emailService.enviarCertificadoPorEmail(
        participante.usuario.email,
        participante.usuario.nombre,
        taller.tema,
        pdfBuffer,
        codigoVerificacion,
      );

      // Actualizar registro con fecha de envío
      await this.prisma.certificado.update({
        where: { id: certificado.id },
        data: {
          enviadoPorEmail: true,
          fechaEnvio: new Date(),
        },
      });
    } catch (error) {
      this.logger.error('Error enviando certificado por email:', error);
      // No lanzar error, el certificado ya está creado
    }

    return certificado;
  }

  /**
   * Emite certificados automáticamente para todos los participantes elegibles de un taller
   */
  async emitirCertificadosAutomaticos(tallerId: string): Promise<{
    total: number;
    emitidos: number;
    noElegibles: number;
    errores: number;
  }> {
    // Obtener todas las inscripciones del taller
    const inscripciones = await this.prisma.inscripcion.findMany({
      where: {
        tallerId,
        estado: { in: ['INSCRITO', 'FINALIZADO'] },
      },
      include: {
        participante: {
          include: {
            usuario: true,
          },
        },
      },
    });

    let emitidos = 0;
    let noElegibles = 0;
    let errores = 0;

    for (const inscripcion of inscripciones) {
      try {
        // Verificar si ya tiene certificado
        const certificadoExistente = await this.prisma.certificado.findUnique({
          where: {
            tallerId_participanteId: {
              tallerId,
              participanteId: inscripcion.participanteId,
            },
          },
        });

        if (certificadoExistente) {
          continue; // Ya tiene certificado
        }

        // Verificar elegibilidad
        const elegibilidad = await this.verificarElegibilidad(tallerId, inscripcion.participanteId);
        if (!elegibilidad.elegible) {
          noElegibles++;
          continue;
        }

        // Emitir certificado
        await this.emitirCertificado(tallerId, inscripcion.participanteId);
        emitidos++;
      } catch (error) {
        this.logger.error(
          `Error emitiendo certificado para participante ${inscripcion.participanteId}:`,
          error,
        );
        errores++;
      }
    }

    return {
      total: inscripciones.length,
      emitidos,
      noElegibles,
      errores,
    };
  }

  /**
   * Obtiene todos los certificados de un participante por usuarioId
   */
  async findByUsuarioId(usuarioId: string) {
    const participante = await this.prisma.participante.findUnique({
      where: { usuarioId },
      select: { id: true },
    });

    if (!participante) {
      return [];
    }

    return this.prisma.certificado.findMany({
      where: { participanteId: participante.id },
      include: {
        taller: {
          select: {
            id: true,
            tema: true,
            modalidad: true,
            fechaInicio: true,
            fechaFin: true,
          },
        },
      },
      orderBy: { emitidoEn: 'desc' },
    });
  }

  /**
   * Obtiene todos los certificados de un participante
   */
  async findByParticipante(participanteId: string) {
    return this.prisma.certificado.findMany({
      where: { participanteId },
      include: {
        taller: {
          select: {
            id: true,
            tema: true,
            modalidad: true,
            fechaInicio: true,
            fechaFin: true,
          },
        },
      },
      orderBy: { emitidoEn: 'desc' },
    });
  }

  /**
   * Obtiene todos los certificados (solo para admin)
   */
  async findAll() {
    return this.prisma.certificado.findMany({
      include: {
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
        taller: {
          select: {
            id: true,
            tema: true,
            modalidad: true,
            fechaInicio: true,
            fechaFin: true,
          },
        },
      },
      orderBy: { emitidoEn: 'desc' },
    });
  }

  /**
   * Obtiene un certificado por ID
   */
  async findOne(id: string) {
    const certificado = await this.prisma.certificado.findUnique({
      where: { id },
      include: {
        participante: {
          include: {
            usuario: true,
          },
        },
        taller: true,
      },
    });

    if (!certificado) {
      throw new NotFoundException('Certificado no encontrado');
    }

    return certificado;
  }

  /**
   * Verifica un certificado por código
   */
  async verificarPorCodigo(codigo: string) {
    const certificado = await this.prisma.certificado.findUnique({
      where: { codigo },
      include: {
        participante: {
          include: {
            usuario: true,
          },
        },
        taller: {
          select: {
            id: true,
            tema: true,
            modalidad: true,
            fechaInicio: true,
            fechaFin: true,
            estado: true,
          },
        },
      },
    });

    if (!certificado) {
      throw new NotFoundException('Certificado no encontrado o código inválido');
    }

    return certificado;
  }

  /**
   * Reenvía un certificado por email
   */
  async reenviarPorEmail(certificadoId: string): Promise<void> {
    const certificado = await this.findOne(certificadoId);

    // Obtener el PDF desde Firebase Storage o regenerarlo
    let pdfBuffer: Buffer;
    if (certificado.urlPDF) {
      // Descargar desde Firebase (implementar si es necesario)
      // Por ahora, regeneramos el PDF
      pdfBuffer = await this.regenerarPDF(certificado);
    } else {
      pdfBuffer = await this.regenerarPDF(certificado);
    }

    // Enviar por email
    await this.emailService.enviarCertificadoPorEmail(
      certificado.participante.usuario.email,
      certificado.participante.usuario.nombre,
      certificado.taller.tema,
      pdfBuffer,
      certificado.codigo,
    );

    // Actualizar fecha de envío
    await this.prisma.certificado.update({
      where: { id: certificadoId },
      data: {
        enviadoPorEmail: true,
        fechaEnvio: new Date(),
      },
    });
  }

  /**
   * Regenera y reenvía un certificado (para admins, permite regenerar aunque ya exista)
   */
  async regenerarYReenviar(certificadoId: string, emitidoPor?: string): Promise<any> {
    const certificado = await this.findOne(certificadoId);

    // Regenerar PDF
    const pdfBuffer = await this.regenerarPDF(certificado);

    // Actualizar fecha de emisión si se especifica quien lo emite
    if (emitidoPor) {
      await this.prisma.certificado.update({
        where: { id: certificadoId },
        data: {
          emitidoPor,
          emitidoEn: new Date(),
        },
      });
    }

    // Enviar por email
    await this.emailService.enviarCertificadoPorEmail(
      certificado.participante.usuario.email,
      certificado.participante.usuario.nombre,
      certificado.taller.tema,
      pdfBuffer,
      certificado.codigo,
    );

    // Actualizar fecha de envío
    await this.prisma.certificado.update({
      where: { id: certificadoId },
      data: {
        enviadoPorEmail: true,
        fechaEnvio: new Date(),
      },
    });

    return this.findOne(certificadoId);
  }

  /**
   * Regenera el PDF de un certificado
   */
  private async regenerarPDF(certificado: any): Promise<Buffer> {
    // Obtener las sesiones del taller
    const taller = await this.prisma.taller.findUnique({
      where: { id: certificado.tallerId },
      include: {
        sesiones: {
          orderBy: { fecha: 'asc' },
        },
      },
    });

    const horasTotales = taller ? this.calcularHorasTotales(taller.sesiones) : 0;

    return this.certificadoPdfService.generarCertificadoPDF({
      nombreParticipante: certificado.participante.usuario.nombre,
      temaTaller: certificado.taller.tema,
      modalidad: certificado.taller.modalidad,
      fechaInicio: certificado.taller.fechaInicio,
      fechaFin: certificado.taller.fechaFin,
      horasTotales,
      codigoVerificacion: certificado.codigo,
      sede: certificado.taller.sede,
    });
  }
}

