import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { TomarAsistenciaDto } from './dto/tomar-asistencia.dto';
import { CreateAsistenciaDto } from './dto/create-asistencia.dto';
import { UpdateAsistenciaDto } from './dto/update-asistencia.dto';

@Injectable()
export class AsistenciasService {
  constructor(private readonly prisma: PrismaService) {}

  private async validarSesionYRelacion(dto: { sesionId: string; participanteId: string }) {
    const sesion = await this.prisma.sesion.findUnique({
      where: { id: dto.sesionId },
      select: { id: true, tallerId: true },
    });
    if (!sesion) throw new NotFoundException('Sesión no encontrada');

    const participante = await this.prisma.participante.findUnique({
      where: { id: dto.participanteId },
      select: { id: true },
    });
    if (!participante) throw new NotFoundException('Participante no encontrado');

    // Debe estar inscrito al taller de la sesión (y no cancelado)
    const inscrito = await this.prisma.inscripcion.findFirst({
      where: {
        participanteId: dto.participanteId,
        tallerId: sesion.tallerId,
        estado: { in: ['INSCRITO', 'FINALIZADO'] },
      },
      select: { id: true },
    });
    if (!inscrito) {
      throw new BadRequestException('El participante no está inscrito en el taller de la sesión');
    }

    return sesion;
  }

  // Crear/actualizar individual (opcional si usas el masivo)
  async create(dto: CreateAsistenciaDto) {
    await this.validarSesionYRelacion(dto);

    // upsert por la restricción única (sesionId, participanteId)
    return this.prisma.asistencia.upsert({
      where: {
        sesionId_participanteId: {
          sesionId: dto.sesionId,
          participanteId: dto.participanteId,
        },
      },
      update: {
        estado: dto.estado,
        tomadoEn: new Date(),
      },
      create: {
        sesionId: dto.sesionId,
        participanteId: dto.participanteId,
        estado: dto.estado,
        tomadoEn: new Date(),
      },
      include: {
        participante: { include: { usuario: true } },
      },
    });
  }

  /**
   * Tomar asistencia en bloque:
   * - Valida sesión y pertenencia por cada item
   * - Upsert por (sesionId, participanteId)
   */
  async tomar(dto: TomarAsistenciaDto) {
    if (!dto.items?.length) {
      throw new BadRequestException('Debe enviar al menos un item de asistencia');
    }

    // Valida sesión una vez
    const sesion = await this.prisma.sesion.findUnique({
      where: { id: dto.sesionId },
      select: { id: true, tallerId: true },
    });
    if (!sesion) throw new NotFoundException('Sesión no encontrada');

    // Pre-validaciones por cada participante (paralelo controlado)
    await Promise.all(
      dto.items.map(async (item) => {
        // participante debe existir
        const participante = await this.prisma.participante.findUnique({
          where: { id: item.participanteId },
          select: { id: true },
        });
        if (!participante) {
          throw new NotFoundException(`Participante no encontrado: ${item.participanteId}`);
        }
        // debe estar inscrito al taller de la sesión
        const inscrito = await this.prisma.inscripcion.findFirst({
          where: {
            participanteId: item.participanteId,
            tallerId: sesion.tallerId,
            estado: { in: ['INSCRITO', 'FINALIZADO'] },
          },
          select: { id: true },
        });
        if (!inscrito) {
          throw new BadRequestException(
            `Participante ${item.participanteId} no está inscrito en el taller de la sesión`,
          );
        }
      }),
    );

    // Upsert en bloque (transacción)
    const resultados = await this.prisma.$transaction(
      dto.items.map((item) =>
        this.prisma.asistencia.upsert({
          where: {
            sesionId_participanteId: {
              sesionId: dto.sesionId,
              participanteId: item.participanteId,
            },
          },
          update: {
            estado: item.estado,
            tomadoEn: new Date(),
          },
          create: {
            sesionId: dto.sesionId,
            participanteId: item.participanteId,
            estado: item.estado,
            tomadoEn: new Date(),
          },
        }),
      ),
    );

    return { sesionId: dto.sesionId, total: resultados.length, items: resultados };
  }

  async findAll(params?: { sesionId?: string }) {
    const where = params?.sesionId ? { sesionId: params.sesionId } : undefined;
    return this.prisma.asistencia.findMany({
      where,
      orderBy: [{ creadoEn: 'desc' }],
      include: {
        sesion: { include: { taller: true, responsable: true } },
        participante: { include: { usuario: true } },
      },
    });
  }

  async findOne(id: string) {
    const item = await this.prisma.asistencia.findUnique({
      where: { id },
      include: {
        sesion: { include: { taller: true, responsable: true } },
        participante: { include: { usuario: true } },
      },
    });
    if (!item) throw new NotFoundException('Asistencia no encontrada');
    return item;
  }

  async update(id: string, dto: UpdateAsistenciaDto) {
    await this.findOne(id);
    return this.prisma.asistencia.update({
      where: { id },
      data: {
        ...(dto.estado ? { estado: dto.estado, tomadoEn: new Date() } : {}),
      },
    });
  }

  async remove(id: string) {
    await this.findOne(id);
    return this.prisma.asistencia.delete({ where: { id } });
  }

  // Resumen rápido por sesión
  async resumenPorSesion(sesionId: string) {
    const sesion = await this.prisma.sesion.findUnique({ where: { id: sesionId }, select: { id: true } });
    if (!sesion) throw new NotFoundException('Sesión no encontrada');

    const [presentes, ausentes, tarde, total] = await Promise.all([
      this.prisma.asistencia.count({ where: { sesionId, estado: 'PRESENTE' } }),
      this.prisma.asistencia.count({ where: { sesionId, estado: 'AUSENTE' } }),
      this.prisma.asistencia.count({ where: { sesionId, estado: 'TARDE' } }),
      this.prisma.asistencia.count({ where: { sesionId } }),
    ]);

    return { sesionId, presentes, ausentes, tarde, total };
  }
}
