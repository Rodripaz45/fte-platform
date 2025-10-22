import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { CreateFeedbackDto } from './dto/create-feedback.dto';
import { UpdateFeedbackDto } from './dto/update-feedback.dto';

@Injectable()
export class FeedbackService {
  constructor(private readonly prisma: PrismaService) {}

  private async validarParticipanteInscrito(tallerId: string, participanteId: string) {
    const [taller, participante] = await Promise.all([
      this.prisma.taller.findUnique({ where: { id: tallerId }, select: { id: true } }),
      this.prisma.participante.findUnique({ where: { id: participanteId }, select: { id: true } }),
    ]);
    if (!taller) throw new NotFoundException('Taller no encontrado');
    if (!participante) throw new NotFoundException('Participante no encontrado');

    const inscrito = await this.prisma.inscripcion.findFirst({
      where: {
        tallerId,
        participanteId,
        estado: { in: ['INSCRITO', 'FINALIZADO'] },
      },
      select: { id: true },
    });
    if (!inscrito) {
      throw new BadRequestException('El participante no está inscrito en el taller');
    }
  }

  /**
   * Regla: un feedback por (tallerId, participanteId).
   * Si existe, se actualiza; si no, se crea.
   */
  async create(dto: CreateFeedbackDto) {
    await this.validarParticipanteInscrito(dto.tallerId, dto.participanteId);

    // Busca existente
    const existente = await this.prisma.retroalimentacion.findFirst({
      where: { tallerId: dto.tallerId, participanteId: dto.participanteId },
      select: { id: true },
    });

    if (existente) {
      return this.prisma.retroalimentacion.update({
        where: { id: existente.id },
        data: { puntaje: dto.puntaje, comentario: dto.comentario ?? null },
        include: { participante: { include: { usuario: true } }, taller: true },
      });
    }

    return this.prisma.retroalimentacion.create({
      data: {
        tallerId: dto.tallerId,
        participanteId: dto.participanteId,
        puntaje: dto.puntaje,
        comentario: dto.comentario ?? null,
      },
      include: { participante: { include: { usuario: true } }, taller: true },
    });
  }

  async findAll(params?: { tallerId?: string; participanteId?: string; page?: number; pageSize?: number }) {
    const where = {
      ...(params?.tallerId ? { tallerId: params.tallerId } : {}),
      ...(params?.participanteId ? { participanteId: params.participanteId } : {}),
    };

    const page = Math.max(1, Number(params?.page || 1));
    const pageSize = Math.min(100, Math.max(1, Number(params?.pageSize || 20)));

    const [items, total] = await Promise.all([
      this.prisma.retroalimentacion.findMany({
        where,
        orderBy: [{ creadoEn: 'desc' }],
        skip: (page - 1) * pageSize,
        take: pageSize,
        include: {
          taller: true,
          participante: { include: { usuario: true } },
        },
      }),
      this.prisma.retroalimentacion.count({ where }),
    ]);

    return { page, pageSize, total, items };
  }

  async findOne(id: string) {
    const fb = await this.prisma.retroalimentacion.findUnique({
      where: { id },
      include: { taller: true, participante: { include: { usuario: true } } },
    });
    if (!fb) throw new NotFoundException('Feedback no encontrado');
    return fb;
  }

  async update(id: string, dto: UpdateFeedbackDto) {
    await this.findOne(id);
    return this.prisma.retroalimentacion.update({
      where: { id },
      data: {
        ...(dto.puntaje !== undefined ? { puntaje: dto.puntaje } : {}),
        ...(dto.comentario !== undefined ? { comentario: dto.comentario ?? null } : {}),
      },
      include: { taller: true, participante: { include: { usuario: true } } },
    });
  }

  async remove(id: string) {
    await this.findOne(id);
    return this.prisma.retroalimentacion.delete({ where: { id } });
  }

  /**
   * Resumen de un taller: promedio, n, distribución 1..5
   */
  async resumenPorTaller(tallerId: string) {
    const taller = await this.prisma.taller.findUnique({ where: { id: tallerId }, select: { id: true } });
    if (!taller) throw new NotFoundException('Taller no encontrado');

    const [conteo, sumas, dist] = await Promise.all([
      this.prisma.retroalimentacion.count({ where: { tallerId } }),
      this.prisma.retroalimentacion.aggregate({
        where: { tallerId, puntaje: { not: null } },
        _avg: { puntaje: true },
      }),
      Promise.all(
        [1, 2, 3, 4, 5].map(async (p) => ({
          puntaje: p,
          total: await this.prisma.retroalimentacion.count({ where: { tallerId, puntaje: p } }),
        })),
      ),
    ]);

    return {
      tallerId,
      total: conteo,
      promedio: sumas._avg.puntaje ?? 0,
      distribucion: dist, // [{puntaje:1,total:x},...]
    };
  }
}
