import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { CreateSesionDto } from './dto/create-sesion.dto';
import { UpdateSesionDto } from './dto/update-sesion.dto';
import { GenerarQRDto } from './dto/generar-qr.dto';
import { ValidarQRDto } from './dto/validar-qr.dto';
import QRCode from 'qrcode';
import { randomBytes } from 'crypto';
import { networkInterfaces } from 'os';

@Injectable()
export class SesionesService {
  constructor(private readonly prisma: PrismaService) {}

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
      select: { id: true, estado: true },
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

    return this.prisma.sesion.create({
      data: {
        tallerId: dto.tallerId,
        fecha: new Date(dto.fecha),
        horaInicio: dto.horaInicio ? new Date(dto.horaInicio) : null,
        horaFin: dto.horaFin ? new Date(dto.horaFin) : null,
        responsableId: dto.responsableId ?? null,
      },
    });
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
        asistencias: {
          include: { participante: { include: { usuario: true } } },
        },
      },
    });
    if (!sesion) throw new NotFoundException('Sesión no encontrada');
    return sesion;
  }

  async update(id: string, dto: UpdateSesionDto) {
    // Asegura que existe
    await this.findOne(id);

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
      },
      include: { taller: true, responsable: true },
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
