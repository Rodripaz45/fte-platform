import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { CreateParticipanteDto } from './dto/create-participante.dto';
import { UpdateParticipanteDto } from './dto/update-participante.dto';

@Injectable()
export class ParticipantesService {
  constructor(private readonly prisma: PrismaService) {}

  async create(dto: CreateParticipanteDto) {
    // Verificar si el usuario existe
    const usuario = await this.prisma.usuario.findUnique({
      where: { id: dto.usuarioId },
    });
    if (!usuario) throw new NotFoundException('Usuario no encontrado');

    // Verificar si ya tiene participante asociado
    const existente = await this.prisma.participante.findUnique({
      where: { usuarioId: dto.usuarioId },
    });
    if (existente)
      throw new BadRequestException('El usuario ya tiene un perfil de participante');

    return this.prisma.participante.create({
      data: {
        usuarioId: dto.usuarioId,
        documento: dto.documento,
        telefono: dto.telefono,
        genero: dto.genero,
        fechaNac: dto.fechaNac ? new Date(dto.fechaNac) : undefined,
      },
      include: { usuario: true },
    });
  }

  findAll() {
    return this.prisma.participante.findMany({
      include: { usuario: true },
    });
  }

  async findOne(id: string) {
    const participante = await this.prisma.participante.findUnique({
      where: { id },
      include: { usuario: true, inscripciones: true },
    });
    if (!participante) throw new NotFoundException('Participante no encontrado');
    return participante;
  }

  async update(id: string, dto: UpdateParticipanteDto) {
    await this.findOne(id);
    return this.prisma.participante.update({
      where: { id },
      data: dto,
      include: { usuario: true },
    });
  }

  async remove(id: string) {
    await this.findOne(id);
    return this.prisma.participante.delete({ where: { id } });
  }
}
