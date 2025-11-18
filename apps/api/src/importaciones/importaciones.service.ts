import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { ImportarListaDto } from './dto/importar-lista.dto';
import { createHash } from 'crypto';

@Injectable()
export class ImportacionesService {
  constructor(private readonly prisma: PrismaService) {}

  /**
   * Importa una lista de participantes desde CSV/Excel a un taller de Unidad Educativa
   */
  async importarLista(dto: ImportarListaDto) {
    // Validar que el taller existe y es de tipo UNIDAD_EDUCATIVA
    const taller = await this.prisma.taller.findUnique({
      where: { id: dto.tallerId },
      include: { unidadEducativa: true },
    });

    if (!taller) {
      throw new NotFoundException('Taller no encontrado');
    }

    if (taller.tipo !== 'UNIDAD_EDUCATIVA') {
      throw new BadRequestException('Solo se pueden importar listas a talleres de tipo UNIDAD_EDUCATIVA');
    }

    if (!taller.unidadEducativa) {
      throw new BadRequestException('El taller no tiene una unidad educativa asociada');
    }

    const unidadEducativaId = taller.unidadEducativaId!;
    const resultados = {
      total: dto.participantes.length,
      creados: 0,
      duplicados: 0,
      errores: [] as Array<{ fila: number; error: string }>,
    };

    // Procesar cada participante
    for (let i = 0; i < dto.participantes.length; i++) {
      const participante = dto.participantes[i];
      
      try {
        // Validar datos mínimos
        if (!participante.nombre || participante.nombre.trim() === '') {
          resultados.errores.push({
            fila: i + 1,
            error: 'El nombre es requerido',
          });
          continue;
        }

        // Generar hash para detección de duplicados
        const dedupeHash = this.generarDedupeHash(participante);

        // Verificar si ya existe (por documento o hash)
        let existe = false;
        if (participante.documento) {
          const porDocumento = await this.prisma.listaParticipantesUE.findFirst({
            where: {
              tallerId: dto.tallerId,
              documento: participante.documento,
            },
          });
          if (porDocumento) {
            existe = true;
          }
        }

        if (!existe) {
          const porHash = await this.prisma.listaParticipantesUE.findFirst({
            where: {
              tallerId: dto.tallerId,
            },
          });
          // Verificar hash manualmente (Prisma no tiene búsqueda por hash calculado)
          // Por ahora, solo verificamos por documento
        }

        if (existe) {
          resultados.duplicados++;
          continue;
        }

        // Crear participante en la lista
        await this.prisma.listaParticipantesUE.create({
          data: {
            unidadEducativaId,
            tallerId: dto.tallerId,
            nombre: participante.nombre.trim(),
            documento: participante.documento?.trim() || null,
            email: participante.email?.trim() || null,
            telefono: participante.telefono?.trim() || null,
            genero: participante.genero?.trim() || null,
            fechaNac: participante.fechaNac ? new Date(participante.fechaNac) : null,
            estado: 'PENDIENTE',
          },
        });

        resultados.creados++;
      } catch (error) {
        resultados.errores.push({
          fila: i + 1,
          error: error instanceof Error ? error.message : 'Error desconocido',
        });
      }
    }

    return resultados;
  }

  /**
   * Genera un hash único para detectar duplicados
   */
  private generarDedupeHash(participante: {
    nombre: string;
    documento?: string;
    email?: string;
  }): string {
    const datos = [
      participante.nombre?.toLowerCase().trim(),
      participante.documento?.trim(),
      participante.email?.toLowerCase().trim(),
    ]
      .filter(Boolean)
      .join('|');

    return createHash('sha256').update(datos).digest('hex');
  }

  /**
   * Obtiene la lista de participantes de un taller UE
   */
  async obtenerListaParticipantes(tallerId: string) {
    const taller = await this.prisma.taller.findUnique({
      where: { id: tallerId },
    });

    if (!taller) {
      throw new NotFoundException('Taller no encontrado');
    }

    if (taller.tipo !== 'UNIDAD_EDUCATIVA') {
      throw new BadRequestException('Este taller no es de tipo UNIDAD_EDUCATIVA');
    }

    return this.prisma.listaParticipantesUE.findMany({
      where: { tallerId },
      orderBy: { nombre: 'asc' },
    });
  }

  /**
   * Elimina un participante de la lista
   */
  async eliminarParticipante(id: string) {
    const participante = await this.prisma.listaParticipantesUE.findUnique({
      where: { id },
    });

    if (!participante) {
      throw new NotFoundException('Participante no encontrado');
    }

    return this.prisma.listaParticipantesUE.delete({
      where: { id },
    });
  }
}

