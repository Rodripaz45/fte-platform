import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { CreateNotificacionDto, EstadoNotificacion, TipoNotificacion, CanalNotificacion } from './dto/create-notificacion.dto';
import { UpdateNotificacionDto } from './dto/update-notificacion.dto';

@Injectable()
export class NotificacionesService {
  constructor(private readonly prisma: PrismaService) {}

  /**
   * Crear una nueva notificación
   */
  async create(dto: CreateNotificacionDto) {
    return this.prisma.notificacion.create({
      data: {
        usuarioId: dto.usuarioId,
        canal: dto.canal || CanalNotificacion.WEB,
        tipo: dto.tipo || TipoNotificacion.OTRO,
        estado: dto.estado || EstadoNotificacion.PENDIENTE,
        titulo: dto.titulo,
        mensaje: dto.mensaje,
      },
      include: {
        usuario: {
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
   * Obtener todas las notificaciones de un usuario
   */
  async findByUsuario(usuarioId: string, options?: { soloNoLeidas?: boolean; limit?: number }) {
    const where: any = { usuarioId };
    
    if (options?.soloNoLeidas) {
      where.estado = { not: EstadoNotificacion.LEIDA };
    }

    return this.prisma.notificacion.findMany({
      where,
      include: {
        usuario: {
          select: {
            id: true,
            nombre: true,
            email: true,
          },
        },
      },
      orderBy: { creadoEn: 'desc' },
      take: options?.limit || 50,
    });
  }

  /**
   * Obtener una notificación por ID
   */
  async findOne(id: string) {
    const notificacion = await this.prisma.notificacion.findUnique({
      where: { id },
      include: {
        usuario: {
          select: {
            id: true,
            nombre: true,
            email: true,
          },
        },
      },
    });

    if (!notificacion) {
      throw new NotFoundException('Notificación no encontrada');
    }

    return notificacion;
  }

  /**
   * Actualizar una notificación
   */
  async update(id: string, dto: UpdateNotificacionDto) {
    await this.findOne(id); // Verificar que existe

    return this.prisma.notificacion.update({
      where: { id },
      data: dto,
      include: {
        usuario: {
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
   * Marcar notificación como leída
   */
  async marcarComoLeida(id: string) {
    return this.update(id, { estado: EstadoNotificacion.LEIDA });
  }

  /**
   * Marcar todas las notificaciones de un usuario como leídas
   */
  async marcarTodasComoLeidas(usuarioId: string) {
    return this.prisma.notificacion.updateMany({
      where: {
        usuarioId,
        estado: { not: EstadoNotificacion.LEIDA },
      },
      data: {
        estado: EstadoNotificacion.LEIDA,
      },
    });
  }

  /**
   * Contar notificaciones no leídas de un usuario
   */
  async countNoLeidas(usuarioId: string): Promise<number> {
    return this.prisma.notificacion.count({
      where: {
        usuarioId,
        estado: { not: EstadoNotificacion.LEIDA },
      },
    });
  }

  /**
   * Eliminar una notificación
   */
  async remove(id: string) {
    await this.findOne(id);
    return this.prisma.notificacion.delete({ where: { id } });
  }

  /**
   * Crear notificación de recordatorio de sesión
   */
  async crearRecordatorioSesion(
    usuarioId: string,
    sesionId: string,
    fechaSesion: Date,
    temaTaller: string
  ) {
    const horasAntes = 24;
    const fechaRecordatorio = new Date(fechaSesion);
    fechaRecordatorio.setHours(fechaRecordatorio.getHours() - horasAntes);

    return this.create({
      usuarioId,
      canal: CanalNotificacion.WEB,
      tipo: TipoNotificacion.RECORDATORIO_SESION,
      estado: EstadoNotificacion.PENDIENTE,
      titulo: 'Recordatorio de Sesión',
      mensaje: `Tienes una sesión del taller "${temaTaller}" en ${horasAntes} horas (${fechaSesion.toLocaleString('es-ES')})`,
    });
  }

  /**
   * Crear notificación de confirmación de inscripción
   */
  async crearConfirmacionInscripcion(
    usuarioId: string,
    temaTaller: string,
    fechaInicio?: Date
  ) {
    return this.create({
      usuarioId,
      canal: CanalNotificacion.WEB,
      tipo: TipoNotificacion.CONFIRMACION_INSCRIPCION,
      estado: EstadoNotificacion.PENDIENTE,
      titulo: 'Inscripción Confirmada',
      mensaje: `Te has inscrito exitosamente al taller "${temaTaller}"${fechaInicio ? ` que inicia el ${fechaInicio.toLocaleDateString('es-ES')}` : ''}`,
    });
  }

  /**
   * Crear notificación de nuevo taller disponible
   */
  async crearNotificacionNuevoTaller(
    usuarioId: string,
    temaTaller: string
  ) {
    return this.create({
      usuarioId,
      canal: CanalNotificacion.WEB,
      tipo: TipoNotificacion.NUEVO_TALLER,
      estado: EstadoNotificacion.PENDIENTE,
      titulo: 'Nuevo Taller Disponible',
      mensaje: `Hay un nuevo taller disponible: "${temaTaller}". ¡Inscríbete ahora!`,
    });
  }
}

