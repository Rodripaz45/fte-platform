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
Object.defineProperty(exports, "__esModule", { value: true });
exports.ReportesService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../../prisma/prisma.service");
let ReportesService = class ReportesService {
    prisma;
    constructor(prisma) {
        this.prisma = prisma;
    }
    construirFiltros(filtros) {
        const where = {};
        if (filtros.fechaInicio || filtros.fechaFin) {
            where.fechaInicio = {};
            if (filtros.fechaInicio) {
                where.fechaInicio.gte = new Date(filtros.fechaInicio);
            }
            if (filtros.fechaFin) {
                where.fechaInicio.lte = new Date(filtros.fechaFin);
            }
        }
        if (filtros.modalidad) {
            where.modalidad = filtros.modalidad;
        }
        if (filtros.tallerId) {
            where.id = filtros.tallerId;
        }
        return where;
    }
    construirFiltrosInscripciones(filtros) {
        const where = {};
        if (filtros.tallerId) {
            where.tallerId = filtros.tallerId;
        }
        if (filtros.participanteId) {
            where.participanteId = filtros.participanteId;
        }
        if (filtros.fechaInicio || filtros.fechaFin) {
            where.creadoEn = {};
            if (filtros.fechaInicio) {
                where.creadoEn.gte = new Date(filtros.fechaInicio);
            }
            if (filtros.fechaFin) {
                where.creadoEn.lte = new Date(filtros.fechaFin);
            }
        }
        if (filtros.modalidad) {
            where.taller = {
                modalidad: filtros.modalidad,
            };
        }
        return where;
    }
    async tasaAsistenciaPorTaller(filtros) {
        const whereTalleres = this.construirFiltros(filtros);
        const talleres = await this.prisma.taller.findMany({
            where: whereTalleres,
            include: {
                sesiones: {
                    include: {
                        asistencias: true,
                    },
                },
                inscripciones: {
                    where: {
                        estado: { in: ['INSCRITO', 'FINALIZADO'] },
                    },
                },
            },
        });
        return talleres.map((taller) => {
            const totalAsistencias = taller.sesiones.reduce((acc, sesion) => acc + sesion.asistencias.filter((a) => a.estado === 'PRESENTE').length, 0);
            const totalInscripciones = taller.inscripciones.length;
            const totalSesiones = taller.sesiones.length;
            const tasa = totalSesiones > 0 && totalInscripciones > 0
                ? (totalAsistencias / (totalInscripciones * totalSesiones)) * 100
                : 0;
            return {
                tallerId: taller.id,
                tema: taller.tema,
                modalidad: taller.modalidad,
                totalInscripciones,
                totalSesiones,
                totalAsistencias,
                tasaAsistencia: Math.round(tasa * 100) / 100,
            };
        });
    }
    async satisfaccionPorTaller(filtros) {
        const whereTalleres = this.construirFiltros(filtros);
        const talleres = await this.prisma.taller.findMany({
            where: whereTalleres,
            include: {
                feedbacks: {
                    where: {
                        puntaje: { not: null },
                    },
                },
            },
        });
        return talleres.map((taller) => {
            const feedbacks = taller.feedbacks;
            const totalFeedbacks = feedbacks.length;
            const sumaPuntajes = feedbacks.reduce((acc, fb) => acc + (fb.puntaje || 0), 0);
            const promedio = totalFeedbacks > 0 ? sumaPuntajes / totalFeedbacks : 0;
            return {
                tallerId: taller.id,
                tema: taller.tema,
                modalidad: taller.modalidad,
                totalFeedbacks,
                promedioSatisfaccion: Math.round(promedio * 100) / 100,
                distribucion: [1, 2, 3, 4, 5].map((p) => ({
                    puntaje: p,
                    cantidad: feedbacks.filter((fb) => fb.puntaje === p).length,
                })),
            };
        });
    }
    async tasaRecurrencia(filtros) {
        const whereInscripciones = this.construirFiltrosInscripciones(filtros);
        const inscripciones = await this.prisma.inscripcion.findMany({
            where: {
                ...whereInscripciones,
                estado: { in: ['INSCRITO', 'FINALIZADO'] },
            },
            select: {
                participanteId: true,
            },
        });
        const conteoPorParticipante = new Map();
        inscripciones.forEach((insc) => {
            const count = conteoPorParticipante.get(insc.participanteId) || 0;
            conteoPorParticipante.set(insc.participanteId, count + 1);
        });
        const totalParticipantes = conteoPorParticipante.size;
        const participantesRecurrentes = Array.from(conteoPorParticipante.values()).filter((count) => count > 1).length;
        const tasaRecurrencia = totalParticipantes > 0 ? (participantesRecurrentes / totalParticipantes) * 100 : 0;
        return {
            totalParticipantes,
            participantesRecurrentes,
            participantesUnicos: totalParticipantes - participantesRecurrentes,
            tasaRecurrencia: Math.round(tasaRecurrencia * 100) / 100,
        };
    }
    async cobertura(filtros) {
        const whereInscripciones = this.construirFiltrosInscripciones(filtros);
        const participantesUnicos = await this.prisma.inscripcion.findMany({
            where: {
                ...whereInscripciones,
                estado: { in: ['INSCRITO', 'FINALIZADO'] },
            },
            select: {
                participanteId: true,
            },
            distinct: ['participanteId'],
        });
        return {
            participantesUnicos: participantesUnicos.length,
        };
    }
    async dashboardEjecutivo(filtros) {
        const [asistencia, satisfaccion, recurrencia, cobertura] = await Promise.all([
            this.tasaAsistenciaPorTaller(filtros),
            this.satisfaccionPorTaller(filtros),
            this.tasaRecurrencia(filtros),
            this.cobertura(filtros),
        ]);
        const promedioAsistencia = asistencia.length > 0
            ? asistencia.reduce((acc, item) => acc + item.tasaAsistencia, 0) / asistencia.length
            : 0;
        const talleresConFeedback = satisfaccion.filter(item => item.totalFeedbacks > 0);
        console.log('🔍 Debug Satisfacción:');
        console.log('  Total talleres:', satisfaccion.length);
        console.log('  Talleres con feedback:', talleresConFeedback.length);
        console.log('  Datos:', talleresConFeedback.map(t => ({
            tema: t.tema,
            feedbacks: t.totalFeedbacks,
            promedio: t.promedioSatisfaccion
        })));
        const promedioSatisfaccion = talleresConFeedback.length > 0
            ? talleresConFeedback.reduce((acc, item) => acc + item.promedioSatisfaccion, 0) /
                talleresConFeedback.length
            : 0;
        console.log('  Promedio final:', promedioSatisfaccion);
        return {
            resumen: {
                promedioAsistencia: Math.round(promedioAsistencia * 100) / 100,
                promedioSatisfaccion: Math.round(promedioSatisfaccion * 100) / 100,
                tasaRecurrencia: recurrencia.tasaRecurrencia,
                cobertura: cobertura.participantesUnicos,
            },
            asistencia,
            satisfaccion,
            recurrencia,
            cobertura,
            filtros,
        };
    }
    async reporteInscripciones(filtros) {
        const where = this.construirFiltrosInscripciones(filtros);
        const inscripciones = await this.prisma.inscripcion.findMany({
            where: {
                ...where,
                estado: { in: ['INSCRITO', 'FINALIZADO'] },
            },
            include: {
                taller: {
                    select: {
                        id: true,
                        tema: true,
                        modalidad: true,
                        fechaInicio: true,
                        fechaFin: true,
                        sede: true,
                    },
                },
                participante: {
                    include: {
                        usuario: {
                            select: {
                                id: true,
                                nombre: true,
                                email: true,
                            },
                        },
                    },
                },
            },
            orderBy: {
                creadoEn: 'desc',
            },
        });
        return inscripciones;
    }
    async reporteAsistencia(filtros) {
        const whereTalleres = this.construirFiltros(filtros);
        const talleres = await this.prisma.taller.findMany({
            where: whereTalleres,
            include: {
                sesiones: {
                    include: {
                        asistencias: {
                            include: {
                                participante: {
                                    include: {
                                        usuario: {
                                            select: {
                                                nombre: true,
                                                email: true,
                                            },
                                        },
                                    },
                                },
                            },
                        },
                    },
                },
            },
        });
        return talleres.map((taller) => ({
            tallerId: taller.id,
            tema: taller.tema,
            modalidad: taller.modalidad,
            sesiones: taller.sesiones.map((sesion) => ({
                sesionId: sesion.id,
                fecha: sesion.fecha,
                asistencias: sesion.asistencias.map((asist) => ({
                    participanteId: asist.participanteId,
                    participanteNombre: asist.participante.usuario.nombre,
                    participanteEmail: asist.participante.usuario.email,
                    estado: asist.estado,
                    tomadoEn: asist.tomadoEn,
                })),
            })),
        }));
    }
    async reporteSatisfaccion(filtros) {
        const whereTalleres = this.construirFiltros(filtros);
        const talleres = await this.prisma.taller.findMany({
            where: whereTalleres,
            include: {
                feedbacks: {
                    include: {
                        participante: {
                            include: {
                                usuario: {
                                    select: {
                                        nombre: true,
                                        email: true,
                                    },
                                },
                            },
                        },
                    },
                },
            },
        });
        return talleres.map((taller) => {
            const feedbacks = taller.feedbacks;
            const totalFeedbacks = feedbacks.length;
            const sumaPuntajes = feedbacks.reduce((acc, fb) => acc + (fb.puntaje || 0), 0);
            const promedio = totalFeedbacks > 0 ? sumaPuntajes / totalFeedbacks : 0;
            return {
                tallerId: taller.id,
                tema: taller.tema,
                modalidad: taller.modalidad,
                totalFeedbacks,
                promedioSatisfaccion: Math.round(promedio * 100) / 100,
                feedbacks: feedbacks.map((fb) => ({
                    participanteId: fb.participanteId,
                    participanteNombre: fb.participante.usuario.nombre,
                    participanteEmail: fb.participante.usuario.email,
                    puntaje: fb.puntaje,
                    comentario: fb.comentario,
                    creadoEn: fb.creadoEn,
                })),
            };
        });
    }
};
exports.ReportesService = ReportesService;
exports.ReportesService = ReportesService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], ReportesService);
//# sourceMappingURL=reportes.service.js.map