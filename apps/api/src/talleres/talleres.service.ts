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

  async findAll() {
    const talleres = await this.prisma.taller.findMany({
      orderBy: { creadoEn: 'desc' },
    });

    // Enriquecer con información de cupos disponibles
    return Promise.all(
      talleres.map(async (taller) => {
        const cupoMax = typeof taller.cupos === 'number' ? taller.cupos : null;
        
        if (cupoMax === null || cupoMax === 0) {
          return {
            ...taller,
            cuposDisponibles: null,
            cuposOcupados: 0,
            tieneCuposLimitados: false,
          };
        }

        const inscripcionesActivas = await this.prisma.inscripcion.count({
          where: {
            tallerId: taller.id,
            estado: { in: ['INSCRITO', 'FINALIZADO'] },
          },
        });

        const cuposDisponibles = Math.max(0, cupoMax - inscripcionesActivas);

        return {
          ...taller,
          cuposDisponibles,
          cuposOcupados: inscripcionesActivas,
          tieneCuposLimitados: true,
        };
      }),
    );
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

    // Enriquecer con información de cupos disponibles
    const cupoMax = typeof taller.cupos === 'number' ? taller.cupos : null;
    
    if (cupoMax === null || cupoMax === 0) {
      return {
        ...taller,
        cuposDisponibles: null,
        cuposOcupados: taller.inscripciones.filter(
          (i) => i.estado === 'INSCRITO' || i.estado === 'FINALIZADO'
        ).length,
        tieneCuposLimitados: false,
      };
    }

    const inscripcionesActivas = taller.inscripciones.filter(
      (i) => i.estado === 'INSCRITO' || i.estado === 'FINALIZADO'
    ).length;

    const cuposDisponibles = Math.max(0, cupoMax - inscripcionesActivas);

    return {
      ...taller,
      cuposDisponibles,
      cuposOcupados: inscripcionesActivas,
      tieneCuposLimitados: true,
    };
  }

  async update(id: string, dto: UpdateTallereDto) {
    const taller = await this.findOne(id);
    
    // Convertir fechas a Date si vienen como string
    const data: any = { ...dto };
    if (dto.fechaInicio) {
      data.fechaInicio = new Date(dto.fechaInicio);
    }
    if (dto.fechaFin) {
      data.fechaFin = new Date(dto.fechaFin);
    }
    
    return this.prisma.taller.update({
      where: { id: taller.id },
      data,
    });
  }

  async remove(id: string) {
    await this.findOne(id);
    return this.prisma.taller.delete({ where: { id } });
  }
}
