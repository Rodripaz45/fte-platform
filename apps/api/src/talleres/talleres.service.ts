import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { CreateTallereDto } from './dto/create-tallere.dto';
import { UpdateTallereDto } from './dto/update-tallere.dto';

@Injectable()
export class TalleresService {
  constructor(private readonly prisma: PrismaService) {}

  async create(dto: CreateTallereDto) {
    if (dto.fechaInicio && dto.fechaFin && dto.fechaInicio >= dto.fechaFin) {
      throw new BadRequestException('La fecha de inicio debe ser anterior a la fecha de fin');
    }

    return this.prisma.taller.create({
      data: {
        tema: dto.tema,
        modalidad: dto.modalidad,
        cupos: dto.cupos ?? 0,
        fechaInicio: dto.fechaInicio ? new Date(dto.fechaInicio) : null,
        fechaFin: dto.fechaFin ? new Date(dto.fechaFin) : null,
        sede: dto.sede,
        estado: dto.estado ?? 'PROGRAMADO',
      },
    });
  }

  findAll() {
    return this.prisma.taller.findMany({
      orderBy: { creadoEn: 'desc' },
    });
  }

  async findOne(id: string) {
    const taller = await this.prisma.taller.findUnique({
      where: { id },
      include: {
        inscripciones: true,
        feedbacks: true,
      },
    });
    if (!taller) throw new NotFoundException('Taller no encontrado');
    return taller;
  }

  async update(id: string, dto: UpdateTallereDto) {
    const taller = await this.findOne(id);
    return this.prisma.taller.update({
      where: { id: taller.id },
      data: dto,
    });
  }

  async remove(id: string) {
    await this.findOne(id);
    return this.prisma.taller.delete({ where: { id } });
  }
}
