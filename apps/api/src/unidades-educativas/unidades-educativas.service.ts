import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { CreateUnidadEducativaDto } from './dto/create-unidad-educativa.dto';
import { UpdateUnidadEducativaDto } from './dto/update-unidad-educativa.dto';

@Injectable()
export class UnidadesEducativasService {
  constructor(private readonly prisma: PrismaService) {}

  async create(dto: CreateUnidadEducativaDto) {
    // Validar código único si se proporciona
    if (dto.codigo) {
      const existente = await this.prisma.unidadEducativa.findUnique({
        where: { codigo: dto.codigo },
      });
      if (existente) {
        throw new BadRequestException('Ya existe una unidad educativa con ese código');
      }
    }

    return this.prisma.unidadEducativa.create({
      data: {
        nombre: dto.nombre,
        codigo: dto.codigo,
        direccion: dto.direccion,
        contacto: dto.contacto,
        email: dto.email,
        telefono: dto.telefono,
      },
    });
  }

  async findAll() {
    return this.prisma.unidadEducativa.findMany({
      include: {
        _count: {
          select: {
            talleres: true,
            listasParticipantes: true,
          },
        },
      },
      orderBy: { nombre: 'asc' },
    });
  }

  async findOne(id: string) {
    const unidad = await this.prisma.unidadEducativa.findUnique({
      where: { id },
      include: {
        talleres: {
          include: {
            trainer: {
              select: {
                id: true,
                nombre: true,
                email: true,
              },
            },
          },
        },
        _count: {
          select: {
            listasParticipantes: true,
          },
        },
      },
    });
    if (!unidad) throw new NotFoundException('Unidad educativa no encontrada');
    return unidad;
  }

  async update(id: string, dto: UpdateUnidadEducativaDto) {
    await this.findOne(id);

    // Validar código único si se está actualizando
    if (dto.codigo) {
      const existente = await this.prisma.unidadEducativa.findFirst({
        where: {
          codigo: dto.codigo,
          id: { not: id },
        },
      });
      if (existente) {
        throw new BadRequestException('Ya existe otra unidad educativa con ese código');
      }
    }

    return this.prisma.unidadEducativa.update({
      where: { id },
      data: dto,
    });
  }

  async remove(id: string) {
    await this.findOne(id);
    
    // Verificar que no tenga talleres asociados
    const talleres = await this.prisma.taller.count({
      where: { unidadEducativaId: id },
    });
    
    if (talleres > 0) {
      throw new BadRequestException(
        `No se puede eliminar la unidad educativa porque tiene ${talleres} taller(es) asociado(s)`,
      );
    }

    return this.prisma.unidadEducativa.delete({ where: { id } });
  }
}

