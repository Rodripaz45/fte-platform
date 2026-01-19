// apps/api/src/ia/ia.service.ts
import { Injectable, HttpException, HttpStatus, Logger } from '@nestjs/common';
import { AnalyzeProfileDto, AnalyzeProfileResponse } from './dto/analyze-profile.dto';
import { AnalyzeJobDto, AnalyzeJobResponse } from './dto/analyze-job.dto';
import { MatchCandidatesDto, MatchCandidatesResponse, CandidatoMatch, CompetenciaMatch } from './dto/match-candidates.dto';
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

    const talleres = [] as { tema: string; asistencia_pct: number; capacidades?: string }[];

    for (const ins of inscripciones) {
      const tallerId = ins.tallerId;
      const tema = (ins.taller?.tema || '').toLowerCase();
      if (!tema) continue;

      const totalSesiones = await this.prisma.sesion.count({ where: { tallerId } });
      const presentes = await this.prisma.asistencia.count({
        where: { participanteId, sesion: { tallerId }, estado: 'PRESENTE' },
      });

      const asistencia_pct = totalSesiones > 0 ? presentes / totalSesiones : 1;
      
      // Obtener las capacidades del taller si existen
      const capacidades = (ins.taller && 'capacidades' in (ins.taller as any) 
        && typeof (ins.taller as any).capacidades === 'string')
        ? (ins.taller as any).capacidades as string
        : undefined;
      
      talleres.push({ tema, asistencia_pct, ...(capacidades ? { capacidades } : {}) });
    }

    // Tomar el último CV (texto pendiente de extracción de PDF)
    const lastCv = await this.prisma.cv.findFirst({
      where: { participanteId },
      orderBy: { subidoEn: 'desc' },
    });

    // Extraer cvTexto de forma segura incluso si el tipo de Prisma aún no expone el campo
    let cvTexto: string | undefined = (lastCv && 'texto' in (lastCv as any)
      && typeof (lastCv as any).texto === 'string')
      ? (lastCv as any).texto as string
      : undefined;

    // Concatenar las descripciones de los talleres cursados al cvTexto
    if (cvTexto && talleres.length > 0) {
      const descripcionesTalleres = talleres
        .filter(t => t.capacidades)
        .map(t => `Taller: ${t.tema}\nCapacidades adquiridas: ${t.capacidades}`)
        .join('\n\n');
      
      if (descripcionesTalleres) {
        cvTexto = `${cvTexto}\n\n--- Talleres Cursados y Capacidades Adquiridas ---\n${descripcionesTalleres}`;
      }
    } else if (!cvTexto && talleres.length > 0) {
      // Si no hay CV pero hay talleres, crear un texto con las capacidades
      const descripcionesTalleres = talleres
        .filter(t => t.capacidades)
        .map(t => `Taller: ${t.tema}\nCapacidades adquiridas: ${t.capacidades}`)
        .join('\n\n');
      
      if (descripcionesTalleres) {
        cvTexto = `--- Talleres Cursados y Capacidades Adquiridas ---\n${descripcionesTalleres}`;
      }
    }

    const dto: AnalyzeProfileDto = {
      participanteId,
      // incluir taller(es) calculados (aunque sea array vacío para visibilidad)
      talleres,
      // cvTexto con información de talleres incluida
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
   * Obtiene las competencias de un participante desde la BD
   */
  async getCompetenciasByParticipanteId(participanteId: string) {
    const perfiles = await this.prisma.perfilCompetencia.findMany({
      where: { participanteId },
      include: {
        competencia: true,
      },
      orderBy: [
        { confianza: 'desc' },
        { nivel: 'desc' },
      ],
    });

    return perfiles.map((perfil) => ({
      competencia: perfil.competencia.nombre,
      nivel: perfil.nivel || 0,
      confianza: perfil.confianza || 0,
      fuente: perfil.fuente || 'ia',
      actualizadoEn: perfil.actualizadoEn,
    }));
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

  /**
   * Normaliza el nombre de una competencia para comparación
   */
  private normalizeCompetencia(nombre: string): string {
    return nombre
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '') // Eliminar acentos
      .trim();
  }

  /**
   * Encuentra candidatos que coincidan con las competencias requeridas de un puesto
   */
  async matchCandidates(dto: MatchCandidatesDto): Promise<MatchCandidatesResponse> {
    const startTime = Date.now();

    try {
      // 1. Analizar el puesto para obtener competencias requeridas
      const jobAnalysis = await this.analyzeJob({
        puestoTexto: dto.puestoTexto,
        topK: dto.topK || 6,
      });

      const competenciasRequeridas = jobAnalysis.competencias || [];
      
      if (competenciasRequeridas.length === 0) {
        return {
          candidatos: [],
          total: 0,
          competenciasRequeridas: [],
          meta: { tiempo: (Date.now() - startTime) / 1000 },
        };
      }

      // Normalizar nombres de competencias requeridas
      const competenciasRequeridasNormalizadas = competenciasRequeridas.map(comp => ({
        original: comp.competencia,
        normalizada: this.normalizeCompetencia(comp.competencia),
        relevancia: comp.relevancia || 0,
      }));

      // 2. Obtener todos los participantes con sus competencias
      const participantes = await this.prisma.participante.findMany({
        include: {
          usuario: true,
          perfiles: {
            include: {
              competencia: true,
            },
          },
        },
      });

      // 3. Calcular matching score para cada participante
      const candidatos: CandidatoMatch[] = [];

      for (const participante of participantes) {
        // Normalizar competencias del participante
        const competenciasParticipante = participante.perfiles.map(perfil => ({
          original: perfil.competencia.nombre,
          normalizada: this.normalizeCompetencia(perfil.competencia.nombre),
          nivel: perfil.nivel || 0,
          confianza: perfil.confianza || 0,
        }));

        // Encontrar competencias coincidentes
        const competenciasCoincidentes: CompetenciaMatch[] = [];
        const competenciasFaltantes: string[] = [];

        for (const reqComp of competenciasRequeridasNormalizadas) {
          const match = competenciasParticipante.find(
            pComp => pComp.normalizada === reqComp.normalizada
          );

          if (match) {
            competenciasCoincidentes.push({
              competencia: reqComp.original,
              nivel: match.nivel,
              relevancia: reqComp.relevancia,
              confianza: match.confianza,
            });
          } else {
            competenciasFaltantes.push(reqComp.original);
          }
        }

        // Calcular porcentaje de match: competencias coincidentes / total requeridas
        const porcentajeMatch = (competenciasCoincidentes.length / competenciasRequeridasNormalizadas.length) * 100;

        // Calcular promedio de niveles para desempate
        const promedioNivel = competenciasCoincidentes.length > 0
          ? competenciasCoincidentes.reduce((sum, comp) => sum + comp.nivel, 0) / competenciasCoincidentes.length
          : 0;

        // Solo incluir si cumple con el mínimo de competencias
        if (competenciasCoincidentes.length >= (dto.minCompetencias || 0)) {
          candidatos.push({
            participanteId: participante.id,
            nombre: participante.usuario.nombre,
            email: participante.usuario.email,
            porcentajeMatch: Math.round(porcentajeMatch * 100) / 100,
            promedioNivel: Math.round(promedioNivel * 100) / 100,
            competenciasCoincidentes,
            competenciasFaltantes,
            totalCompetenciasRequeridas: competenciasRequeridasNormalizadas.length,
            totalCompetenciasCoincidentes: competenciasCoincidentes.length,
          });
        }
      }

      // 4. Ordenar: primero por cantidad de competencias coincidentes (mayor a menor)
      // Si hay empate, ordenar por promedio de niveles (mayor a menor)
      candidatos.sort((a, b) => {
        // Primero comparar por cantidad de competencias coincidentes
        if (b.totalCompetenciasCoincidentes !== a.totalCompetenciasCoincidentes) {
          return b.totalCompetenciasCoincidentes - a.totalCompetenciasCoincidentes;
        }
        // Si hay empate, comparar por promedio de niveles
        return b.promedioNivel - a.promedioNivel;
      });

      // 5. Aplicar límite
      const limit = dto.limit || 50;
      const candidatosLimitados = candidatos.slice(0, limit);

      const tiempo = (Date.now() - startTime) / 1000;

      this.logger.log(
        `Match candidates completed: ${candidatosLimitados.length} candidates found in ${tiempo.toFixed(2)}s`
      );

      return {
        candidatos: candidatosLimitados,
        total: candidatos.length,
        competenciasRequeridas: competenciasRequeridas.map(comp => ({
          competencia: comp.competencia,
          relevancia: comp.relevancia || 0,
        })),
        meta: { tiempo },
      };
    } catch (error) {
      this.logger.error('Error matching candidates', error);
      if (error instanceof HttpException) {
        throw error;
      }
      throw new HttpException(
        'Error matching candidates',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }
}
