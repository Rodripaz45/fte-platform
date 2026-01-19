"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var IaService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.IaService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../../prisma/prisma.service");
let IaService = IaService_1 = class IaService {
    prisma;
    logger = new common_1.Logger(IaService_1.name);
    baseUrl;
    constructor(prisma) {
        this.prisma = prisma;
        this.baseUrl = process.env.IA_URL || 'http://localhost:8000';
        this.logger.log(`IA Service initialized with base URL: ${this.baseUrl}`);
    }
    logPayload(tag, payload) {
        const clone = { ...(payload || {}) };
        if (typeof clone.cvTexto === 'string' && clone.cvTexto.length > 400) {
            clone.cvTexto = clone.cvTexto.substring(0, 400) + '... [truncated]';
        }
        try {
            console.log(`[IA] ${tag} payload ->`, JSON.stringify(clone));
        }
        catch {
            console.log(`[IA] ${tag} payload ->`, clone);
        }
    }
    async buildAnalyzeDtoFromDb(participanteId) {
        const inscripciones = await this.prisma.inscripcion.findMany({
            where: { participanteId },
            include: { taller: true },
        });
        const talleres = [];
        for (const ins of inscripciones) {
            const tallerId = ins.tallerId;
            const tema = (ins.taller?.tema || '').toLowerCase();
            if (!tema)
                continue;
            const totalSesiones = await this.prisma.sesion.count({ where: { tallerId } });
            const presentes = await this.prisma.asistencia.count({
                where: { participanteId, sesion: { tallerId }, estado: 'PRESENTE' },
            });
            const asistencia_pct = totalSesiones > 0 ? presentes / totalSesiones : 1;
            const capacidades = (ins.taller && 'capacidades' in ins.taller
                && typeof ins.taller.capacidades === 'string')
                ? ins.taller.capacidades
                : undefined;
            talleres.push({ tema, asistencia_pct, ...(capacidades ? { capacidades } : {}) });
        }
        const lastCv = await this.prisma.cv.findFirst({
            where: { participanteId },
            orderBy: { subidoEn: 'desc' },
        });
        let cvTexto = (lastCv && 'texto' in lastCv
            && typeof lastCv.texto === 'string')
            ? lastCv.texto
            : undefined;
        if (cvTexto && talleres.length > 0) {
            const descripcionesTalleres = talleres
                .filter(t => t.capacidades)
                .map(t => `Taller: ${t.tema}\nCapacidades adquiridas: ${t.capacidades}`)
                .join('\n\n');
            if (descripcionesTalleres) {
                cvTexto = `${cvTexto}\n\n--- Talleres Cursados y Capacidades Adquiridas ---\n${descripcionesTalleres}`;
            }
        }
        else if (!cvTexto && talleres.length > 0) {
            const descripcionesTalleres = talleres
                .filter(t => t.capacidades)
                .map(t => `Taller: ${t.tema}\nCapacidades adquiridas: ${t.capacidades}`)
                .join('\n\n');
            if (descripcionesTalleres) {
                cvTexto = `--- Talleres Cursados y Capacidades Adquiridas ---\n${descripcionesTalleres}`;
            }
        }
        const dto = {
            participanteId,
            talleres,
            ...(cvTexto ? { cvTexto } : {}),
        };
        this.logPayload('buildAnalyzeDtoFromDb', {
            participanteId,
            talleres,
            cvTexto: cvTexto
                ? `${(cvTexto || '').substring(0, 200)}... [truncated]`
                : undefined,
        });
        return dto;
    }
    async analyzeByParticipantId(participanteId) {
        const dto = await this.buildAnalyzeDtoFromDb(participanteId);
        this.logPayload('analyze/profile (from DB)', dto);
        return this.analyzeProfileAndSave(dto);
    }
    async healthCheck() {
        try {
            const res = await fetch(`${this.baseUrl}/health`, {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json',
                },
            });
            if (!res.ok) {
                throw new common_1.HttpException(`IA service health check failed: ${res.status}`, res.status);
            }
            return await res.json();
        }
        catch (error) {
            this.logger.error('Error checking IA service health', error);
            throw new common_1.HttpException('IA service is not available', common_1.HttpStatus.SERVICE_UNAVAILABLE);
        }
    }
    async analyzeProfile(dto) {
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
                throw new common_1.HttpException(`IA error: ${res.status} - ${text}`, res.status);
            }
            const data = await res.json();
            try {
                const competenciasLen = Array.isArray(data?.competencias)
                    ? data.competencias.length
                    : 0;
                this.logger.log(`Profile analyzed for participant: ${dto.participanteId} (competencias: ${competenciasLen})`);
                console.log('[IA] analyze/profile response ->', JSON.stringify({
                    competenciasLen,
                    sample: data?.competencias?.slice?.(0, 3) || [],
                    meta: data?.meta || undefined,
                }));
            }
            catch { }
            return data;
        }
        catch (error) {
            this.logger.error('Error analyzing profile', error);
            if (error instanceof common_1.HttpException) {
                throw error;
            }
            throw new common_1.HttpException('Error connecting to IA service', common_1.HttpStatus.SERVICE_UNAVAILABLE);
        }
    }
    async analyzeProfileAndSave(dto) {
        const analysis = await this.analyzeProfile(dto);
        const participanteId = dto.participanteId;
        const fuente = analysis?.meta?.mode || 'ia';
        if (!participanteId) {
            throw new common_1.HttpException('participanteId requerido', common_1.HttpStatus.BAD_REQUEST);
        }
        const competencias = analysis?.competencias || [];
        for (const comp of competencias) {
            const nombre = comp.competencia || comp.nombre;
            if (!nombre)
                continue;
            const competencia = await this.prisma.competencia.upsert({
                where: { nombre },
                update: {},
                create: { nombre },
            });
            const nivelFloat = comp.nivel ?? 0;
            const nivel = Math.round(nivelFloat <= 1 ? nivelFloat * 100 : nivelFloat);
            const confianza = comp.confianza;
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
        const competenciasLen = Array.isArray(analysis?.competencias)
            ? analysis.competencias.length
            : 0;
        this.logger.log(`Persisted competencias for participanteId=${participanteId} (total: ${competenciasLen})`);
        return { saved: true, participanteId, competencias: analysis.competencias, meta: analysis.meta };
    }
    async getCompetenciasByParticipanteId(participanteId) {
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
    async analyzeJob(dto) {
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
                throw new common_1.HttpException(`IA error: ${res.status} - ${text}`, res.status);
            }
            const data = await res.json();
            this.logger.log(`Job analyzed: ${dto.puestoTexto.substring(0, 50)}...`);
            return data;
        }
        catch (error) {
            this.logger.error('Error analyzing job', error);
            if (error instanceof common_1.HttpException) {
                throw error;
            }
            throw new common_1.HttpException('Error connecting to IA service', common_1.HttpStatus.SERVICE_UNAVAILABLE);
        }
    }
    normalizeCompetencia(nombre) {
        return nombre
            .toLowerCase()
            .normalize('NFD')
            .replace(/[\u0300-\u036f]/g, '')
            .trim();
    }
    async matchCandidates(dto) {
        const startTime = Date.now();
        try {
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
            const competenciasRequeridasNormalizadas = competenciasRequeridas.map(comp => ({
                original: comp.competencia,
                normalizada: this.normalizeCompetencia(comp.competencia),
                relevancia: comp.relevancia || 0,
            }));
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
            const candidatos = [];
            for (const participante of participantes) {
                const competenciasParticipante = participante.perfiles.map(perfil => ({
                    original: perfil.competencia.nombre,
                    normalizada: this.normalizeCompetencia(perfil.competencia.nombre),
                    nivel: perfil.nivel || 0,
                    confianza: perfil.confianza || 0,
                }));
                const competenciasCoincidentes = [];
                const competenciasFaltantes = [];
                for (const reqComp of competenciasRequeridasNormalizadas) {
                    const match = competenciasParticipante.find(pComp => pComp.normalizada === reqComp.normalizada);
                    if (match) {
                        competenciasCoincidentes.push({
                            competencia: reqComp.original,
                            nivel: match.nivel,
                            relevancia: reqComp.relevancia,
                            confianza: match.confianza,
                        });
                    }
                    else {
                        competenciasFaltantes.push(reqComp.original);
                    }
                }
                const porcentajeMatch = (competenciasCoincidentes.length / competenciasRequeridasNormalizadas.length) * 100;
                const promedioNivel = competenciasCoincidentes.length > 0
                    ? competenciasCoincidentes.reduce((sum, comp) => sum + comp.nivel, 0) / competenciasCoincidentes.length
                    : 0;
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
            candidatos.sort((a, b) => {
                if (b.totalCompetenciasCoincidentes !== a.totalCompetenciasCoincidentes) {
                    return b.totalCompetenciasCoincidentes - a.totalCompetenciasCoincidentes;
                }
                return b.promedioNivel - a.promedioNivel;
            });
            const limit = dto.limit || 50;
            const candidatosLimitados = candidatos.slice(0, limit);
            const tiempo = (Date.now() - startTime) / 1000;
            this.logger.log(`Match candidates completed: ${candidatosLimitados.length} candidates found in ${tiempo.toFixed(2)}s`);
            return {
                candidatos: candidatosLimitados,
                total: candidatos.length,
                competenciasRequeridas: competenciasRequeridas.map(comp => ({
                    competencia: comp.competencia,
                    relevancia: comp.relevancia || 0,
                })),
                meta: { tiempo },
            };
        }
        catch (error) {
            this.logger.error('Error matching candidates', error);
            if (error instanceof common_1.HttpException) {
                throw error;
            }
            throw new common_1.HttpException('Error matching candidates', common_1.HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }
};
exports.IaService = IaService;
exports.IaService = IaService = IaService_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], IaService);
//# sourceMappingURL=ia.service.js.map