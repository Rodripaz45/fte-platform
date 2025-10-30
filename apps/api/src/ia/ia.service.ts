// apps/api/src/ia/ia.service.ts
import { Injectable, HttpException, HttpStatus, Logger } from '@nestjs/common';
import { AnalyzeProfileDto, AnalyzeProfileResponse } from './dto/analyze-profile.dto';
import { AnalyzeJobDto, AnalyzeJobResponse } from './dto/analyze-job.dto';
import { PrismaService } from '../../prisma/prisma.service';

@Injectable()
export class IaService {
  private readonly logger = new Logger(IaService.name);
  private readonly baseUrl: string;

  constructor(private readonly prisma: PrismaService) {
    this.baseUrl = process.env.IA_URL || 'http://localhost:8000';
    this.logger.log(`IA Service initialized with base URL: ${this.baseUrl}`);
  }

  private logPayload(tag: string, payload: any) {
    const clone: any = { ...(payload || {}) };
    if (typeof clone.cvTexto === 'string' && clone.cvTexto.length > 400) {
      clone.cvTexto = clone.cvTexto.substring(0, 400) + '... [truncated]';
    }
    try {
      // eslint-disable-next-line no-console
      console.log(`[IA] ${tag} payload ->`, JSON.stringify(clone));
    } catch {
      // eslint-disable-next-line no-console
      console.log(`[IA] ${tag} payload ->`, clone);
    }
  }

  /**
   * Construye el DTO de análisis a partir de BD:
   * - talleres: lista de temas con asistencia_pct por taller
   * - cvTexto: (pendiente extracción de PDF) por ahora vacío
   */
  async buildAnalyzeDtoFromDb(participanteId: string): Promise<AnalyzeProfileDto> {
    // Inscripciones del participante
    const inscripciones = await this.prisma.inscripcion.findMany({
      where: { participanteId },
      include: { taller: true },
    });

    const talleres = [] as { tema: string; asistencia_pct: number }[];

    for (const ins of inscripciones) {
      const tallerId = ins.tallerId;
      const tema = (ins.taller?.tema || '').toLowerCase();
      if (!tema) continue;

      const totalSesiones = await this.prisma.sesion.count({ where: { tallerId } });
      const presentes = await this.prisma.asistencia.count({
        where: { participanteId, sesion: { tallerId }, estado: 'PRESENTE' },
      });

      const asistencia_pct = totalSesiones > 0 ? presentes / totalSesiones : 1;
      talleres.push({ tema, asistencia_pct });
    }

    // Tomar el último CV (texto pendiente de extracción de PDF)
    const lastCv = await this.prisma.cv.findFirst({
      where: { participanteId },
      orderBy: { subidoEn: 'desc' },
    });

    // Extraer cvTexto de forma segura incluso si el tipo de Prisma aún no expone el campo
    const cvTexto: string | undefined = (lastCv && 'texto' in (lastCv as any)
      && typeof (lastCv as any).texto === 'string')
      ? (lastCv as any).texto as string
      : undefined;

    const dto: AnalyzeProfileDto = {
      participanteId,
      // incluir taller(es) calculados (aunque sea array vacío para visibilidad)
      talleres,
      // cvTexto queda pendiente (no extraemos PDF aún)
      ...(cvTexto ? { cvTexto } : {}),
    } as AnalyzeProfileDto;

    // Log detallado de lo que se construye desde BD
    this.logPayload('buildAnalyzeDtoFromDb', {
      participanteId,
      talleres,
      cvTexto: cvTexto
        ? `${(cvTexto || '').substring(0, 200)}... [truncated]`
        : undefined,
    });

    return dto;
  }

  /** Analiza y guarda por participanteId tomando datos de BD */
  async analyzeByParticipantId(participanteId: string) {
    const dto = await this.buildAnalyzeDtoFromDb(participanteId);
    this.logPayload('analyze/profile (from DB)', dto);
    return this.analyzeProfileAndSave(dto);
  }

  /**
   * Health check del microservicio FTE-AI
   */
  async healthCheck() {
    try {
      const res = await fetch(`${this.baseUrl}/health`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!res.ok) {
        throw new HttpException(
          `IA service health check failed: ${res.status}`,
          res.status,
        );
      }

      return await res.json();
    } catch (error) {
      this.logger.error('Error checking IA service health', error);
      throw new HttpException(
        'IA service is not available',
        HttpStatus.SERVICE_UNAVAILABLE,
      );
    }
  }

  /**
   * Analiza el perfil de un participante
   */
  async analyzeProfile(dto: AnalyzeProfileDto): Promise<AnalyzeProfileResponse> {
    try {
      this.logPayload('analyze/profile', dto);
      const res = await fetch(`${this.baseUrl}/analyze/profile`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(dto),
      });

      if (!res.ok) {
        const text = await res.text();
        this.logger.error(`IA analyze profile error: ${res.status} ${text}`);
        throw new HttpException(
          `IA error: ${res.status} - ${text}`,
          res.status,
        );
      }

      const data = await res.json();
      // Log respuesta resumida del microservicio
      try {
        const competenciasLen = Array.isArray((data as any)?.competencias)
          ? (data as any).competencias.length
          : 0;
        this.logger.log(
          `Profile analyzed for participant: ${dto.participanteId} (competencias: ${competenciasLen})`,
        );
        // eslint-disable-next-line no-console
        console.log('[IA] analyze/profile response ->', JSON.stringify({
          competenciasLen,
          sample: (data as any)?.competencias?.slice?.(0, 3) || [],
          meta: (data as any)?.meta || undefined,
        }));
      } catch {}
      return data;
    } catch (error) {
      this.logger.error('Error analyzing profile', error);
      if (error instanceof HttpException) {
        throw error;
      }
      throw new HttpException(
        'Error connecting to IA service',
        HttpStatus.SERVICE_UNAVAILABLE,
      );
    }
  }

  /**
   * Analiza y guarda el perfil del participante en la BD.
   * - Crea competencias si no existen
   * - Upsert de PerfilCompetencia por (participanteId, competenciaId)
   */
  async analyzeProfileAndSave(dto: AnalyzeProfileDto) {
    const analysis = await this.analyzeProfile(dto);
    const participanteId = (dto as any).participanteId;
    const fuente = (analysis as any)?.meta?.mode || 'ia';

    if (!participanteId) {
      throw new HttpException('participanteId requerido', HttpStatus.BAD_REQUEST);
    }

    const competencias = (analysis as any)?.competencias || [];

    // Persistencia sin transacción interactiva para evitar timeouts (P2028)
    for (const comp of competencias) {
      const nombre = comp.competencia || comp.nombre; // soportar ambos formatos
      if (!nombre) continue;

      const competencia = await this.prisma.competencia.upsert({
        where: { nombre },
        update: {},
        create: { nombre },
      });

      const nivelFloat: number = comp.nivel ?? 0;
      const nivel = Math.round(
        nivelFloat <= 1 ? nivelFloat * 100 : nivelFloat
      );
      const confianza: number | undefined = comp.confianza;

      await this.prisma.perfilCompetencia.upsert({
        where: {
          participanteId_competenciaId: {
            participanteId,
            competenciaId: competencia.id,
          },
        },
        update: {
          nivel,
          confianza,
          fuente,
        },
        create: {
          participanteId,
          competenciaId: competencia.id,
          nivel,
          confianza,
          fuente,
        },
      });
    }

    const competenciasLen = Array.isArray((analysis as any)?.competencias)
      ? (analysis as any).competencias.length
      : 0;
    this.logger.log(
      `Persisted competencias for participanteId=${participanteId} (total: ${competenciasLen})`,
    );
    return { saved: true, participanteId, competencias: analysis.competencias, meta: (analysis as any).meta };
  }

  /**
   * Analiza los requisitos de un puesto de trabajo
   */
  async analyzeJob(dto: AnalyzeJobDto): Promise<AnalyzeJobResponse> {
    try {
      const res = await fetch(`${this.baseUrl}/analyze/job`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          puestoTexto: dto.puestoTexto,
          topK: dto.topK || 6,
        }),
      });

      if (!res.ok) {
        const text = await res.text();
        this.logger.error(`IA analyze job error: ${res.status} ${text}`);
        throw new HttpException(
          `IA error: ${res.status} - ${text}`,
          res.status,
        );
      }

      const data = await res.json();
      this.logger.log(`Job analyzed: ${dto.puestoTexto.substring(0, 50)}...`);
      return data;
    } catch (error) {
      this.logger.error('Error analyzing job', error);
      if (error instanceof HttpException) {
        throw error;
      }
      throw new HttpException(
        'Error connecting to IA service',
        HttpStatus.SERVICE_UNAVAILABLE,
      );
    }
  }
}
