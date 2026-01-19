import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { CreateSesionDto } from './dto/create-sesion.dto';
import { CreateSesionesRecurrentesDto } from './dto/create-sesiones-recurrentes.dto';
import { UpdateSesionDto } from './dto/update-sesion.dto';
import { GenerarQRDto } from './dto/generar-qr.dto';
import { ValidarQRDto } from './dto/validar-qr.dto';
import { NotificacionesService } from '../notificaciones/notificaciones.service';
import QRCode from 'qrcode';
import { randomBytes } from 'crypto';
import { networkInterfaces } from 'os';

@Injectable()
export class SesionesService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly notificacionesService: NotificacionesService,
  ) {}

  /**
   * Obtiene la IP local de la máquina (no localhost)
   * Busca la primera IP IPv4 que no sea localhost ni loopback
   */
  private getLocalIP(): string {
    // Primero intentar desde variable de entorno
    if (process.env.LOCAL_IP) {
      return process.env.LOCAL_IP;
    }

    const nets = networkInterfaces();
    const addresses: string[] = [];

    for (const name of Object.keys(nets)) {
      for (const net of nets[name] || []) {
        // Saltar direcciones internas (no IPv4 o loopback)
        // net.family puede ser 'IPv4' (string) o 4 (number) dependiendo de la versión de Node.js
        const family = net.family as string | number;
        const isIPv4 = family === 'IPv4' || family === 4;
        if (isIPv4 && !net.internal) {
          addresses.push(net.address);
        }
      }
    }

    // Retornar la primera IP encontrada, o localhost como fallback
    return addresses[0] || 'localhost';
  }

  /**
   * Obtiene la URL base del frontend
   * Prioridad: FRONTEND_URL > IP local detectada > localhost
   */
  private getFrontendUrl(): string {
    // Si hay una URL explícita configurada, usarla
    if (process.env.FRONTEND_URL) {
      return process.env.FRONTEND_URL;
    }

    // Obtener IP local
    const localIP = this.getLocalIP();
    const frontendPort = process.env.FRONTEND_PORT || '3000';
    
    // Usar http o https según configuración
    const protocol = process.env.FRONTEND_PROTOCOL || 'http';
    
    return `${protocol}://${localIP}:${frontendPort}`;
  }

  private validarHoras(horaInicio?: Date, horaFin?: Date) {
    if (horaInicio && horaFin && new Date(horaInicio) >= new Date(horaFin)) {
      throw new BadRequestException('La hora de inicio debe ser anterior a la hora de fin');
    }
  }

  async create(dto: CreateSesionDto) {
    // Taller debe existir y no estar finalizado (opcional)
    const taller = await this.prisma.taller.findUnique({
      where: { id: dto.tallerId },
      include: { inscripciones: { include: { participante: { include: { usuario: true } } } } },
    });
    if (!taller) throw new NotFoundException('Taller no encontrado');
    if (taller.estado === 'FINALIZADO') {
      throw new BadRequestException('No se pueden crear sesiones para un taller finalizado');
    }

    // Validación de horas
    this.validarHoras(dto.horaInicio, dto.horaFin);

    // Opcional: validar que responsable exista si viene
    if (dto.responsableId) {
      const responsable = await this.prisma.usuario.findUnique({
        where: { id: dto.responsableId },
        select: { id: true },
      });
      if (!responsable) throw new NotFoundException('Usuario responsable no encontrado');
    }

    // Validar y reservar sala si se proporciona
    let reservaSalaId: string | null = null;
    if (dto.salaId) {
      const sala = await this.prisma.sala.findUnique({
        where: { id: dto.salaId },
      });
      if (!sala) {
        throw new NotFoundException('Sala no encontrada');
      }
      if (!sala.activa) {
        throw new BadRequestException('La sala no está activa');
      }

      // Verificar disponibilidad de la sala
      let fechaInicio: Date;
      let fechaFin: Date;

      if (dto.horaInicio && dto.horaFin) {
        fechaInicio = new Date(dto.horaInicio);
        fechaFin = new Date(dto.horaFin);
      } else if (dto.horaInicio) {
        fechaInicio = new Date(dto.horaInicio);
        fechaFin = new Date(fechaInicio.getTime() + 2 * 60 * 60 * 1000); // 2 horas por defecto
      } else {
        fechaInicio = new Date(dto.fecha);
        fechaFin = new Date(fechaInicio.getTime() + 2 * 60 * 60 * 1000); // 2 horas por defecto
      }

      const conflictos = await this.prisma.reservaSala.findMany({
        where: {
          salaId: dto.salaId,
          estado: { in: ['RESERVADA', 'CONFIRMADA'] },
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

      if (conflictos.length > 0) {
        throw new BadRequestException({
          message: 'La sala no está disponible en ese horario',
          conflictos: conflictos.map((c) => ({
            fechaInicio: c.fechaInicio,
            fechaFin: c.fechaFin,
            motivo: c.motivo,
          })),
        });
      }

      // Crear reserva de sala
      const reserva = await this.prisma.reservaSala.create({
        data: {
          salaId: dto.salaId,
          fechaInicio: fechaInicio,
          fechaFin: fechaFin,
          estado: 'RESERVADA',
        },
      });
      reservaSalaId = reserva.id;
    }

    const fechaSesion = new Date(dto.fecha);
    const sesion = await this.prisma.sesion.create({
      data: {
        tallerId: dto.tallerId,
        fecha: fechaSesion,
        horaInicio: dto.horaInicio ? new Date(dto.horaInicio) : null,
        horaFin: dto.horaFin ? new Date(dto.horaFin) : null,
        responsableId: dto.responsableId ?? null,
        salaId: dto.salaId ?? null,
      },
    });

    // Actualizar reserva de sala con el ID de la sesión si existe
    if (reservaSalaId) {
      await this.prisma.reservaSala.update({
        where: { id: reservaSalaId },
        data: { sesionId: sesion.id },
      });
    }

    // Crear notificaciones de recordatorio para participantes inscritos
    try {
      const inscripcionesActivas = taller.inscripciones.filter(
        ins => ins.estado === 'INSCRITO' || ins.estado === 'FINALIZADO'
      );

      console.log(`[SesionesService] Creando notificaciones para ${inscripcionesActivas.length} participantes inscritos en el taller "${taller.tema}"`);

      if (inscripcionesActivas.length > 0) {
        // Crear notificaciones en paralelo
        const notificacionesPromesas = inscripcionesActivas.map(inscripcion =>
          this.notificacionesService.crearRecordatorioSesion(
            inscripcion.participante.usuario.id,
            sesion.id,
            fechaSesion,
            taller.tema,
          )
            .then(() => {
              console.log(`[SesionesService] Notificación creada para ${inscripcion.participante.usuario.email}`);
              return true;
            })
            .catch(err => {
              console.error(`[SesionesService] Error notificando a ${inscripcion.participante.usuario.email}:`, err);
              return false;
            })
        );

        // Esperar a que todas las notificaciones se completen (pero no fallar si alguna falla)
        const resultados = await Promise.all(notificacionesPromesas);
        const exitosas = resultados.filter(r => r === true).length;
        console.log(`[SesionesService] Notificaciones creadas: ${exitosas}/${inscripcionesActivas.length} exitosas`);
      } else {
        console.log(`[SesionesService] No hay participantes inscritos para notificar`);
      }
    } catch (error) {
      // No fallar la creación de la sesión si falla la notificación
      console.error('[SesionesService] Error creando notificaciones de sesión:', error);
    }

    return sesion;
  }

  /**
   * Crear múltiples sesiones recurrentes dentro de un rango de fechas,
   * para los días de la semana indicados. Reutiliza la lógica de create()
   * para respetar validaciones (estado del taller, salas, notificaciones, etc.).
   */
  async createRecurrente(dto: CreateSesionesRecurrentesDto) {
    const fechaInicio = new Date(dto.fechaInicio);
    const fechaFin = new Date(dto.fechaFin);

    if (fechaFin < fechaInicio) {
      throw new BadRequestException('La fecha fin debe ser mayor o igual a la fecha inicio');
    }

    const diasMap: Record<string, number> = {
      LUNES: 1,
      MARTES: 2,
      MIERCOLES: 3,
      JUEVES: 4,
      VIERNES: 5,
      SABADO: 6,
      DOMINGO: 0,
    };

    const diasSeleccionados = dto.diasSemana
      .map((d) => d.toUpperCase())
      .filter((d) => diasMap[d] !== undefined);

    if (diasSeleccionados.length === 0) {
      throw new BadRequestException('Debes seleccionar al menos un día de la semana válido');
    }

    // Helper para combinar fecha base con hora (solo hora/min de la hora proporcionada)
    const combineDateAndTime = (base: Date, time?: Date) => {
      if (!time) return undefined;
      const t = new Date(time);
      const result = new Date(base);
      result.setHours(t.getHours(), t.getMinutes(), t.getSeconds(), t.getMilliseconds());
      return result;
    };

    // Generar las fechas que cumplen con los días seleccionados
    const fechasObjetivo: Date[] = [];
    for (
      let cursor = new Date(fechaInicio.getFullYear(), fechaInicio.getMonth(), fechaInicio.getDate());
      cursor <= fechaFin;
      cursor.setDate(cursor.getDate() + 1)
    ) {
      const day = cursor.getDay(); // 0 domingo ... 6 sábado
      if (diasSeleccionados.some((d) => diasMap[d] === day)) {
        fechasObjetivo.push(new Date(cursor));
      }
    }

    if (fechasObjetivo.length === 0) {
      throw new BadRequestException('No hay días dentro del rango que coincidan con los seleccionados');
    }

    const creadas: any[] = [];
    for (const fecha of fechasObjetivo) {
      const createDto: CreateSesionDto = {
        tallerId: dto.tallerId,
        fecha,
        horaInicio: combineDateAndTime(fecha, dto.horaInicio),
        horaFin: combineDateAndTime(fecha, dto.horaFin),
        responsableId: dto.responsableId,
        salaId: dto.salaId,
      };
      const sesion = await this.create(createDto);
      creadas.push(sesion);
    }

    return {
      total: creadas.length,
      sesiones: creadas,
    };
  }

  /**
   * Listado con filtros básicos:
   * - ?tallerId=...  (filtra por taller)
   * - ?page=1&pageSize=20  (paginación simple)
   */
  async findAll(params?: { tallerId?: string; page?: number; pageSize?: number }) {
    const where = params?.tallerId ? { tallerId: params.tallerId } : undefined;

    const page = Math.max(1, Number(params?.page || 1));
    const pageSize = Math.min(100, Math.max(1, Number(params?.pageSize || 20)));

    const [items, total] = await Promise.all([
      this.prisma.sesion.findMany({
        where,
        orderBy: [{ fecha: 'asc' }, { horaInicio: 'asc' }],
        skip: (page - 1) * pageSize,
        take: pageSize,
        include: {
          taller: true,
          responsable: true,
          sala: true,
        },
      }),
      this.prisma.sesion.count({ where }),
    ]);

    return {
      page,
      pageSize,
      total,
      items,
    };
  }

  async findOne(id: string) {
    const sesion = await this.prisma.sesion.findUnique({
      where: { id },
      include: {
        taller: true,
        responsable: true,
        sala: true,
        asistencias: {
          include: { participante: { include: { usuario: true } } },
        },
      },
    });
    if (!sesion) throw new NotFoundException('Sesión no encontrada');
    return sesion;
  }

  /**
   * Obtiene las sesiones de los talleres en los que el participante está inscrito
   */
  async findByParticipante(participanteId: string) {
    // Obtener las inscripciones activas del participante
    const inscripciones = await this.prisma.inscripcion.findMany({
      where: { 
        participanteId,
        estado: {
          in: ['INSCRITO', 'FINALIZADO']
        }
      },
      select: { tallerId: true },
    });

    // Si no tiene inscripciones, retornar array vacío
    if (inscripciones.length === 0) {
      return [];
    }

    // Obtener IDs de talleres
    const tallerIds = inscripciones.map(ins => ins.tallerId);

    // Obtener todas las sesiones de esos talleres
    const sesiones = await this.prisma.sesion.findMany({
      where: {
        tallerId: {
          in: tallerIds,
        },
      },
      include: {
        taller: true,
        responsable: true,
      },
      orderBy: [
        { fecha: 'desc' },
        { horaInicio: 'asc' },
      ],
    });

    return sesiones;
  }

  async update(id: string, dto: UpdateSesionDto) {
    // Asegura que existe
    const sesion = await this.findOne(id);

    // Validación de horas si vienen en el update
    this.validarHoras(dto.horaInicio, dto.horaFin);

    // Validar responsable si cambia
    if (dto.responsableId) {
      const existe = await this.prisma.usuario.findUnique({
        where: { id: dto.responsableId },
        select: { id: true },
      });
      if (!existe) throw new NotFoundException('Usuario responsable no encontrado');
    }

    // Si se cambia la sala o las fechas/horas, validar disponibilidad
    if (dto.salaId !== undefined || dto.fecha || dto.horaInicio || dto.horaFin) {
      const nuevaSalaId = dto.salaId !== undefined ? dto.salaId : sesion.salaId;
      const nuevaFecha = dto.fecha ? new Date(dto.fecha) : sesion.fecha;
      const nuevoHoraInicio = dto.horaInicio
        ? new Date(dto.horaInicio)
        : sesion.horaInicio || nuevaFecha;
      const nuevoHoraFin = dto.horaFin
        ? new Date(dto.horaFin)
        : sesion.horaFin || nuevaFecha;

      if (nuevaSalaId) {
        const conflictos = await this.prisma.reservaSala.findMany({
          where: {
            salaId: nuevaSalaId,
            estado: { in: ['RESERVADA', 'CONFIRMADA'] },
            sesionId: { not: id }, // Excluir la reserva actual de esta sesión
            OR: [
              {
                fechaInicio: { lte: nuevoHoraInicio },
                fechaFin: { gte: nuevoHoraInicio },
              },
              {
                fechaInicio: { lte: nuevoHoraFin },
                fechaFin: { gte: nuevoHoraFin },
              },
              {
                fechaInicio: { gte: nuevoHoraInicio },
                fechaFin: { lte: nuevoHoraFin },
              },
            ],
          },
        });

        if (conflictos.length > 0) {
          throw new BadRequestException({
            message: 'La sala no está disponible en ese horario',
            conflictos: conflictos.map((c) => ({
              fechaInicio: c.fechaInicio,
              fechaFin: c.fechaFin,
              motivo: c.motivo,
            })),
          });
        }

        // Actualizar o crear reserva de sala
        const reservaExistente = await this.prisma.reservaSala.findFirst({
          where: { sesionId: id },
        });

        if (reservaExistente) {
          await this.prisma.reservaSala.update({
            where: { id: reservaExistente.id },
            data: {
              salaId: nuevaSalaId,
              fechaInicio: nuevoHoraInicio,
              fechaFin: nuevoHoraFin,
            },
          });
        } else if (nuevaSalaId) {
          await this.prisma.reservaSala.create({
            data: {
              salaId: nuevaSalaId,
              sesionId: id,
              fechaInicio: nuevoHoraInicio,
              fechaFin: nuevoHoraFin,
              estado: 'RESERVADA',
            },
          });
        }
      }
    }

    return this.prisma.sesion.update({
      where: { id },
      data: {
        ...(dto.tallerId ? { tallerId: dto.tallerId } : {}),
        ...(dto.fecha ? { fecha: new Date(dto.fecha) } : {}),
        ...(dto.horaInicio ? { horaInicio: new Date(dto.horaInicio) } : { ...(dto.horaInicio === null ? { horaInicio: null } : {}) }),
        ...(dto.horaFin ? { horaFin: new Date(dto.horaFin) } : { ...(dto.horaFin === null ? { horaFin: null } : {}) }),
        ...(dto.responsableId !== undefined
          ? { responsableId: dto.responsableId ?? null }
          : {}),
        ...(dto.salaId !== undefined ? { salaId: dto.salaId ?? null } : {}),
      },
      include: { taller: true, responsable: true, sala: true },
    });
  }

  async remove(id: string) {
    await this.findOne(id);
    return this.prisma.sesion.delete({ where: { id } });
  }

  /**
   * Genera un código QR único para una sesión
   * El código expira después del tiempo especificado (por defecto 60 minutos)
   * El QR contiene una URL única que registra la asistencia al ser escaneada
   */
  async generarQR(dto: GenerarQRDto) {
    const sesion = await this.prisma.sesion.findUnique({
      where: { id: dto.sesionId },
      include: { taller: true },
    });

    if (!sesion) {
      throw new NotFoundException('Sesión no encontrada');
    }

    // Generar código único (32 caracteres hexadecimales)
    const codigoQR = randomBytes(16).toString('hex');

    // Calcular expiración (por defecto 60 minutos)
    const duracionMinutos = dto.duracionMinutos || 60;
    const expiracion = new Date();
    expiracion.setMinutes(expiracion.getMinutes() + duracionMinutos);

    // Guardar código en la sesión
    await this.prisma.sesion.update({
      where: { id: dto.sesionId },
      data: {
        codigoQR,
        codigoQRExpiracion: expiracion,
      },
    });

    // Generar URL única para el QR usando la IP local de la máquina
    const frontendUrl = this.getFrontendUrl();
    const qrUrl = `${frontendUrl}/asistencia/qr/${codigoQR}`;

    // Generar imagen QR como base64 con la URL
    const qrDataURL = await QRCode.toDataURL(qrUrl, {
      errorCorrectionLevel: 'M',
      type: 'image/png',
      width: 300,
      margin: 1,
    });

    return {
      sesionId: sesion.id,
      codigoQR,
      qrUrl, // URL única para escanear
      qrImage: qrDataURL, // Data URL de la imagen QR
      expiracion: expiracion.toISOString(),
      duracionMinutos,
    };
  }

  /**
   * Valida un código QR y retorna información de la sesión
   * No registra asistencia automáticamente, solo valida
   */
  async validarQR(dto: ValidarQRDto) {
    const sesion = await this.prisma.sesion.findFirst({
      where: { codigoQR: dto.codigoQR },
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
    });

    if (!sesion) {
      throw new NotFoundException('Código QR no válido');
    }

    // Verificar expiración
    if (sesion.codigoQRExpiracion && new Date() > sesion.codigoQRExpiracion) {
      throw new BadRequestException('El código QR ha expirado');
    }

    return {
      sesionId: sesion.id,
      taller: sesion.taller,
      fecha: sesion.fecha,
      horaInicio: sesion.horaInicio,
      horaFin: sesion.horaFin,
      valido: true,
    };
  }

  /**
   * Regenera el código QR de una sesión (invalida el anterior)
   */
  async regenerarQR(sesionId: string, duracionMinutos?: number) {
    return this.generarQR({ sesionId, duracionMinutos });
  }

  /**
   * Invalida el código QR de una sesión
   */
  async invalidarQR(sesionId: string) {
    const sesion = await this.prisma.sesion.findUnique({
      where: { id: sesionId },
    });

    if (!sesion) {
      throw new NotFoundException('Sesión no encontrada');
    }

    return this.prisma.sesion.update({
      where: { id: sesionId },
      data: {
        codigoQR: null,
        codigoQRExpiracion: null,
      },
    });
  }
}
