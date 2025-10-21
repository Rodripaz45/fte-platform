import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { CreateInscripcioneDto } from './dto/create-inscripcione.dto';
import { UpdateInscripcioneDto } from './dto/update-inscripcione.dto';

@Injectable()
export class InscripcionesService {
  constructor(private readonly prisma: PrismaService) {}

  /**
   * Crea una inscripción validando:
   * - Taller existente y no FINALIZADO
   * - Cupo disponible (cupos > inscripciones activas)
   * - No duplicado (único por participante/taller)
   */
  async create(dto: CreateInscripcioneDto) {
    // Verifica existencia de participante
    const participante = await this.prisma.participante.findUnique({
      where: { id: dto.participanteId },
      select: { id: true },
    });
    if (!participante) throw new NotFoundException('Participante no encontrado');

    const taller = await this.prisma.taller.findUnique({
      where: { id: dto.tallerId },
      select: { id: true, estado: true, cupos: true },
    });
    if (!taller) throw new NotFoundException('Taller no encontrado');

    if (taller.estado === 'FINALIZADO') {
      throw new BadRequestException(
        'No se puede inscribir en un taller finalizado',
      );
    }

    // Cuenta sólo inscripciones activas
    const inscripcionesActivas = await this.prisma.inscripcion.count({
      where: { tallerId: dto.tallerId, estado: { in: ['INSCRITO'] } },
    });

    const cupoMax = typeof taller.cupos === 'number' ? taller.cupos : 0;
    if (cupoMax > 0 && inscripcionesActivas >= cupoMax) {
      throw new BadRequestException('El taller ya alcanzó su cupo máximo');
    }

    // Duplicado (si existe y no está cancelado)
    const yaExiste = await this.prisma.inscripcion.findFirst({
      where: { participanteId: dto.participanteId, tallerId: dto.tallerId },
      select: { id: true, estado: true },
    });
    if (yaExiste && yaExiste.estado !== 'CANCELADO') {
      throw new BadRequestException(
        'El participante ya está inscrito en este taller',
      );
    }

    return this.prisma.inscripcion.create({
      data: {
        participanteId: dto.participanteId,
        tallerId: dto.tallerId,
        estado: 'INSCRITO',
      },
      include: { taller: true, participante: true },
    });
  }

  async findAll() {
    return this.prisma.inscripcion.findMany({
      include: {
        taller: true,
        participante: { include: { usuario: true } },
      },
      orderBy: { creadoEn: 'desc' },
    });
  }

  async findOne(id: string) {
    const inscripcion = await this.prisma.inscripcion.findUnique({
      where: { id },
      include: {
        taller: true,
        participante: { include: { usuario: true } },
      },
    });
    if (!inscripcion) throw new NotFoundException('Inscripción no encontrada');
    return inscripcion;
  }

  /**
   * Permite cambiar el estado de la inscripción
   * (INSCRITO -> CANCELADO / FINALIZADO)
   */
  async update(id: string, dto: UpdateInscripcioneDto) {
    // Validación simple de transición (opcional)
    if (!dto.estado) {
      throw new BadRequestException('Debe enviar un estado válido');
    }

    const actual = await this.prisma.inscripcion.findUnique({
      where: { id },
      select: { id: true, estado: true },
    });
    if (!actual) throw new NotFoundException('Inscripción no encontrada');

    return this.prisma.inscripcion.update({
      where: { id },
      data: { estado: dto.estado },
      include: { taller: true, participante: true },
    });
  }

  async remove(id: string) {
    // Elimina la inscripción (si prefieres, podrías marcar estado CANCELADO)
    await this.findOne(id);
    return this.prisma.inscripcion.delete({ where: { id } });
  }
}
