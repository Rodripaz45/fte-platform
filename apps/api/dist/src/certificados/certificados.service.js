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
var CertificadosService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.CertificadosService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../../prisma/prisma.service");
const certificado_pdf_service_1 = require("./certificado-pdf.service");
const email_service_1 = require("./email.service");
let CertificadosService = CertificadosService_1 = class CertificadosService {
    prisma;
    certificadoPdfService;
    emailService;
    logger = new common_1.Logger(CertificadosService_1.name);
    ASISTENCIA_MINIMA = 0.75;
    constructor(prisma, certificadoPdfService, emailService) {
        this.prisma = prisma;
        this.certificadoPdfService = certificadoPdfService;
        this.emailService = emailService;
    }
    async verificarElegibilidad(tallerId, participanteId) {
        const taller = await this.prisma.taller.findUnique({
            where: { id: tallerId },
            include: {
                sesiones: {
                    orderBy: { fecha: 'asc' },
                },
            },
        });
        if (!taller) {
            throw new common_1.NotFoundException('Taller no encontrado');
        }
        const inscripcion = await this.prisma.inscripcion.findUnique({
            where: {
                tallerId_participanteId: {
                    tallerId,
                    participanteId,
                },
            },
        });
        if (!inscripcion) {
            throw new common_1.NotFoundException('El participante no está inscrito en este taller');
        }
        const totalSesiones = taller.sesiones.length;
        if (totalSesiones === 0) {
            return {
                elegible: false,
                tasaAsistencia: 0,
                totalSesiones: 0,
                sesionesAsistidas: 0,
            };
        }
        const sesionesAsistidas = await this.prisma.asistencia.count({
            where: {
                participanteId,
                sesion: {
                    tallerId,
                },
                estado: 'PRESENTE',
            },
        });
        const tasaAsistencia = sesionesAsistidas / totalSesiones;
        const elegible = tasaAsistencia >= this.ASISTENCIA_MINIMA;
        return {
            elegible,
            tasaAsistencia,
            totalSesiones,
            sesionesAsistidas,
        };
    }
    calcularHorasTotales(sesiones) {
        let horasTotales = 0;
        for (const sesion of sesiones) {
            if (sesion.horaInicio && sesion.horaFin) {
                const inicio = new Date(sesion.horaInicio);
                const fin = new Date(sesion.horaFin);
                const diferenciaMs = fin.getTime() - inicio.getTime();
                const horas = diferenciaMs / (1000 * 60 * 60);
                horasTotales += horas;
            }
        }
        return Math.round(horasTotales * 10) / 10;
    }
    generarCodigoVerificacion(tallerId, participanteId) {
        const timestamp = Date.now().toString(36).toUpperCase();
        const random = Math.random().toString(36).substring(2, 10).toUpperCase();
        return `CERT-${tallerId.substring(0, 4)}-${participanteId.substring(0, 4)}-${timestamp}-${random}`;
    }
    async emitirCertificado(tallerId, participanteId, emitidoPor) {
        const certificadoExistente = await this.prisma.certificado.findUnique({
            where: {
                tallerId_participanteId: {
                    tallerId,
                    participanteId,
                },
            },
        });
        if (certificadoExistente) {
            throw new common_1.BadRequestException('Ya existe un certificado para este participante en este taller');
        }
        const elegibilidad = await this.verificarElegibilidad(tallerId, participanteId);
        if (!elegibilidad.elegible) {
            throw new common_1.BadRequestException(`El participante no cumple con los requisitos. Asistencia: ${(elegibilidad.tasaAsistencia * 100).toFixed(1)}% (mínimo requerido: 75%)`);
        }
        const taller = await this.prisma.taller.findUnique({
            where: { id: tallerId },
            include: {
                sesiones: {
                    orderBy: { fecha: 'asc' },
                },
            },
        });
        const participante = await this.prisma.participante.findUnique({
            where: { id: participanteId },
            include: {
                usuario: true,
            },
        });
        if (!taller || !participante) {
            throw new common_1.NotFoundException('Taller o participante no encontrado');
        }
        const codigoVerificacion = this.generarCodigoVerificacion(tallerId, participanteId);
        const horasTotales = this.calcularHorasTotales(taller.sesiones);
        const pdfBuffer = await this.certificadoPdfService.generarCertificadoPDF({
            nombreParticipante: participante.usuario.nombre,
            temaTaller: taller.tema,
            modalidad: taller.modalidad,
            fechaInicio: taller.fechaInicio,
            fechaFin: taller.fechaFin,
            horasTotales,
            codigoVerificacion,
            sede: taller.sede,
        });
        const urlPDF = null;
        const certificado = await this.prisma.certificado.create({
            data: {
                tallerId,
                participanteId,
                codigo: codigoVerificacion,
                urlPDF,
                emitidoPor: emitidoPor || null,
                enviadoPorEmail: false,
            },
            include: {
                participante: {
                    include: {
                        usuario: true,
                    },
                },
                taller: true,
            },
        });
        try {
            await this.emailService.enviarCertificadoPorEmail(participante.usuario.email, participante.usuario.nombre, taller.tema, pdfBuffer, codigoVerificacion);
            await this.prisma.certificado.update({
                where: { id: certificado.id },
                data: {
                    enviadoPorEmail: true,
                    fechaEnvio: new Date(),
                },
            });
        }
        catch (error) {
            this.logger.error('Error enviando certificado por email:', error);
        }
        return certificado;
    }
    async emitirCertificadosAutomaticos(tallerId) {
        const inscripciones = await this.prisma.inscripcion.findMany({
            where: {
                tallerId,
                estado: { in: ['INSCRITO', 'FINALIZADO'] },
            },
            include: {
                participante: {
                    include: {
                        usuario: true,
                    },
                },
            },
        });
        let emitidos = 0;
        let noElegibles = 0;
        let errores = 0;
        for (const inscripcion of inscripciones) {
            try {
                const certificadoExistente = await this.prisma.certificado.findUnique({
                    where: {
                        tallerId_participanteId: {
                            tallerId,
                            participanteId: inscripcion.participanteId,
                        },
                    },
                });
                if (certificadoExistente) {
                    continue;
                }
                const elegibilidad = await this.verificarElegibilidad(tallerId, inscripcion.participanteId);
                if (!elegibilidad.elegible) {
                    noElegibles++;
                    continue;
                }
                await this.emitirCertificado(tallerId, inscripcion.participanteId);
                emitidos++;
            }
            catch (error) {
                this.logger.error(`Error emitiendo certificado para participante ${inscripcion.participanteId}:`, error);
                errores++;
            }
        }
        return {
            total: inscripciones.length,
            emitidos,
            noElegibles,
            errores,
        };
    }
    async findByUsuarioId(usuarioId) {
        const participante = await this.prisma.participante.findUnique({
            where: { usuarioId },
            select: { id: true },
        });
        if (!participante) {
            return [];
        }
        return this.prisma.certificado.findMany({
            where: { participanteId: participante.id },
            include: {
                taller: {
                    select: {
                        id: true,
                        tema: true,
                        modalidad: true,
                        fechaInicio: true,
                        fechaFin: true,
                    },
                },
            },
            orderBy: { emitidoEn: 'desc' },
        });
    }
    async findByParticipante(participanteId) {
        return this.prisma.certificado.findMany({
            where: { participanteId },
            include: {
                taller: {
                    select: {
                        id: true,
                        tema: true,
                        modalidad: true,
                        fechaInicio: true,
                        fechaFin: true,
                    },
                },
            },
            orderBy: { emitidoEn: 'desc' },
        });
    }
    async findAll() {
        return this.prisma.certificado.findMany({
            include: {
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
                taller: {
                    select: {
                        id: true,
                        tema: true,
                        modalidad: true,
                        fechaInicio: true,
                        fechaFin: true,
                    },
                },
            },
            orderBy: { emitidoEn: 'desc' },
        });
    }
    async findOne(id) {
        const certificado = await this.prisma.certificado.findUnique({
            where: { id },
            include: {
                participante: {
                    include: {
                        usuario: true,
                    },
                },
                taller: true,
            },
        });
        if (!certificado) {
            throw new common_1.NotFoundException('Certificado no encontrado');
        }
        return certificado;
    }
    async verificarPorCodigo(codigo) {
        const certificado = await this.prisma.certificado.findUnique({
            where: { codigo },
            include: {
                participante: {
                    include: {
                        usuario: true,
                    },
                },
                taller: {
                    select: {
                        id: true,
                        tema: true,
                        modalidad: true,
                        fechaInicio: true,
                        fechaFin: true,
                        estado: true,
                    },
                },
            },
        });
        if (!certificado) {
            throw new common_1.NotFoundException('Certificado no encontrado o código inválido');
        }
        return certificado;
    }
    async reenviarPorEmail(certificadoId) {
        const certificado = await this.findOne(certificadoId);
        let pdfBuffer;
        if (certificado.urlPDF) {
            pdfBuffer = await this.regenerarPDF(certificado);
        }
        else {
            pdfBuffer = await this.regenerarPDF(certificado);
        }
        await this.emailService.enviarCertificadoPorEmail(certificado.participante.usuario.email, certificado.participante.usuario.nombre, certificado.taller.tema, pdfBuffer, certificado.codigo);
        await this.prisma.certificado.update({
            where: { id: certificadoId },
            data: {
                enviadoPorEmail: true,
                fechaEnvio: new Date(),
            },
        });
    }
    async regenerarYReenviar(certificadoId, emitidoPor) {
        const certificado = await this.findOne(certificadoId);
        const pdfBuffer = await this.regenerarPDF(certificado);
        if (emitidoPor) {
            await this.prisma.certificado.update({
                where: { id: certificadoId },
                data: {
                    emitidoPor,
                    emitidoEn: new Date(),
                },
            });
        }
        await this.emailService.enviarCertificadoPorEmail(certificado.participante.usuario.email, certificado.participante.usuario.nombre, certificado.taller.tema, pdfBuffer, certificado.codigo);
        await this.prisma.certificado.update({
            where: { id: certificadoId },
            data: {
                enviadoPorEmail: true,
                fechaEnvio: new Date(),
            },
        });
        return this.findOne(certificadoId);
    }
    async regenerarPDF(certificado) {
        const taller = await this.prisma.taller.findUnique({
            where: { id: certificado.tallerId },
            include: {
                sesiones: {
                    orderBy: { fecha: 'asc' },
                },
            },
        });
        const horasTotales = taller ? this.calcularHorasTotales(taller.sesiones) : 0;
        return this.certificadoPdfService.generarCertificadoPDF({
            nombreParticipante: certificado.participante.usuario.nombre,
            temaTaller: certificado.taller.tema,
            modalidad: certificado.taller.modalidad,
            fechaInicio: certificado.taller.fechaInicio,
            fechaFin: certificado.taller.fechaFin,
            horasTotales,
            codigoVerificacion: certificado.codigo,
            sede: certificado.taller.sede,
        });
    }
};
exports.CertificadosService = CertificadosService;
exports.CertificadosService = CertificadosService = CertificadosService_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService,
        certificado_pdf_service_1.CertificadoPdfService,
        email_service_1.EmailService])
], CertificadosService);
//# sourceMappingURL=certificados.service.js.map