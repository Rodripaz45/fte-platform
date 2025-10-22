import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { CreateSesionDto } from './dto/create-sesion.dto';
import { UpdateSesionDto } from './dto/update-sesion.dto';

@Injectable()
export class SesionesService {
  constructor(private readonly prisma: PrismaService) {}

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
}
