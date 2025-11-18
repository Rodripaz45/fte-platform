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
var TalleresService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.TalleresService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../../prisma/prisma.service");
const notificaciones_service_1 = require("../notificaciones/notificaciones.service");
let TalleresService = TalleresService_1 = class TalleresService {
    prisma;
    notificacionesService;
    logger = new common_1.Logger(TalleresService_1.name);
    certificadosService;
    constructor(prisma, notificacionesService) {
        this.prisma = prisma;
        this.notificacionesService = notificacionesService;
    }
    async create(dto) {
        if (dto.fechaInicio && dto.fechaFin && dto.fechaInicio >= dto.fechaFin) {
            throw new common_1.BadRequestException('La fecha de inicio debe ser anterior a la fecha de fin');
        }
        const trainer = await this.prisma.usuario.findUnique({
            where: { id: dto.trainerId },
            include: { roles: { include: { rol: true } } },
        });
        if (!trainer) {
            throw new common_1.NotFoundException('Trainer no encontrado');
        }
        const tieneRolTrainer = trainer.roles.some(ur => ur.rol.nombre === 'TRAINER');
        if (!tieneRolTrainer) {
            throw new common_1.BadRequestException('El usuario especificado no tiene rol TRAINER');
        }
        if (trainer.estado !== 'ACTIVO') {
            throw new common_1.BadRequestException('El trainer debe estar activo');
        }
        let unidadEducativaId = null;
        if (dto.tipo === 'UNIDAD_EDUCATIVA') {
            if (dto.unidadEducativaNombre) {
                let unidad = await this.prisma.unidadEducativa.findFirst({
                    where: { nombre: dto.unidadEducativaNombre.trim() },
                });
                if (!unidad) {
                    unidad = await this.prisma.unidadEducativa.create({
                        data: {
                            nombre: dto.unidadEducativaNombre.trim(),
                        },
                    });
                }
                unidadEducativaId = unidad.id;
            }
            else if (dto.unidadEducativaId) {
                const unidad = await this.prisma.unidadEducativa.findUnique({
                    where: { id: dto.unidadEducativaId },
                });
                if (!unidad) {
                    throw new common_1.NotFoundException('Unidad educativa no encontrada');
                }
                unidadEducativaId = dto.unidadEducativaId;
            }
            else {
                throw new common_1.BadRequestException('Debe proporcionar el nombre o ID de la unidad educativa para talleres de tipo UNIDAD_EDUCATIVA');
            }
        }
        const taller = await this.prisma.taller.create({
            data: {
                tema: dto.tema,
                modalidad: dto.modalidad,
                cupos: dto.cupos ?? 0,
                fechaInicio: dto.fechaInicio ? new Date(dto.fechaInicio) : null,
                fechaFin: dto.fechaFin ? new Date(dto.fechaFin) : null,
                sede: dto.sede,
                estado: dto.estado ?? 'BORRADOR',
                tipo: dto.tipo ?? 'NORMAL',
                trainerId: dto.trainerId,
                unidadEducativaId: unidadEducativaId,
            },
            include: {
                trainer: {
                    select: {
                        id: true,
                        nombre: true,
                        email: true,
                    },
                },
                unidadEducativa: dto.tipo === 'UNIDAD_EDUCATIVA' ? {
                    select: {
                        id: true,
                        nombre: true,
                        codigo: true,
                    },
                } : false,
            },
        });
        if (taller.tipo !== 'UNIDAD_EDUCATIVA') {
            try {
                const participantes = await this.prisma.participante.findMany({
                    include: { usuario: true },
                });
                Promise.all(participantes.map(participante => this.notificacionesService.crearNotificacionNuevoTaller(participante.usuario.id, taller.tema).catch(err => console.error(`Error notificando a ${participante.usuario.email}:`, err)))).catch(() => { });
            }
            catch (error) {
                console.error('Error creando notificaciones de nuevo taller:', error);
            }
        }
        return taller;
    }
    async findAll() {
        const talleres = await this.prisma.taller.findMany({
            include: {
                trainer: {
                    select: {
                        id: true,
                        nombre: true,
                        email: true,
                    },
                },
                unidadEducativa: {
                    select: {
                        id: true,
                        nombre: true,
                        codigo: true,
                    },
                },
            },
            orderBy: { creadoEn: 'desc' },
        });
        return Promise.all(talleres.map(async (taller) => {
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
        }));
    }
    async findAllByTrainerId(trainerId) {
        const talleres = await this.prisma.taller.findMany({
            where: {
                trainerId: trainerId,
            },
            include: {
                trainer: {
                    select: {
                        id: true,
                        nombre: true,
                        email: true,
                    },
                },
                unidadEducativa: {
                    select: {
                        id: true,
                        nombre: true,
                        codigo: true,
                    },
                },
            },
            orderBy: { creadoEn: 'desc' },
        });
        return Promise.all(talleres.map(async (taller) => {
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
        }));
    }
    async findOne(id) {
        const taller = await this.prisma.taller.findUnique({
            where: { id },
            include: {
                inscripciones: true,
                feedbacks: true,
                trainer: {
                    select: {
                        id: true,
                        nombre: true,
                        email: true,
                    },
                },
                unidadEducativa: {
                    select: {
                        id: true,
                        nombre: true,
                        codigo: true,
                        direccion: true,
                        contacto: true,
                        email: true,
                        telefono: true,
                    },
                },
                listaParticipantes: {
                    include: {
                        asistenciasUE: true,
                    },
                },
            },
        });
        if (!taller)
            throw new common_1.NotFoundException('Taller no encontrado');
        const cupoMax = typeof taller.cupos === 'number' ? taller.cupos : null;
        if (cupoMax === null || cupoMax === 0) {
            return {
                ...taller,
                cuposDisponibles: null,
                cuposOcupados: taller.inscripciones.filter((i) => i.estado === 'INSCRITO' || i.estado === 'FINALIZADO').length,
                tieneCuposLimitados: false,
            };
        }
        const inscripcionesActivas = taller.inscripciones.filter((i) => i.estado === 'INSCRITO' || i.estado === 'FINALIZADO').length;
        const cuposDisponibles = Math.max(0, cupoMax - inscripcionesActivas);
        return {
            ...taller,
            cuposDisponibles,
            cuposOcupados: inscripcionesActivas,
            tieneCuposLimitados: true,
        };
    }
    async update(id, dto) {
        const taller = await this.findOne(id);
        let unidadEducativaId = undefined;
        if (dto.tipo === 'UNIDAD_EDUCATIVA' || taller.tipo === 'UNIDAD_EDUCATIVA') {
            if (dto.unidadEducativaNombre) {
                let unidad = await this.prisma.unidadEducativa.findFirst({
                    where: { nombre: dto.unidadEducativaNombre.trim() },
                });
                if (!unidad) {
                    unidad = await this.prisma.unidadEducativa.create({
                        data: {
                            nombre: dto.unidadEducativaNombre.trim(),
                        },
                    });
                }
                unidadEducativaId = unidad.id;
            }
            else if (dto.unidadEducativaId) {
                const unidad = await this.prisma.unidadEducativa.findUnique({
                    where: { id: dto.unidadEducativaId },
                });
                if (!unidad) {
                    throw new common_1.NotFoundException('Unidad educativa no encontrada');
                }
                unidadEducativaId = dto.unidadEducativaId;
            }
            else if (taller.tipo === 'UNIDAD_EDUCATIVA' && dto.tipo !== 'NORMAL') {
                unidadEducativaId = taller.unidadEducativaId;
            }
        }
        else if (dto.tipo === 'NORMAL') {
            unidadEducativaId = null;
        }
        if (dto.trainerId) {
            const trainer = await this.prisma.usuario.findUnique({
                where: { id: dto.trainerId },
                include: { roles: { include: { rol: true } } },
            });
            if (!trainer) {
                throw new common_1.NotFoundException('Trainer no encontrado');
            }
            const tieneRolTrainer = trainer.roles.some(ur => ur.rol.nombre === 'TRAINER');
            if (!tieneRolTrainer) {
                throw new common_1.BadRequestException('El usuario especificado no tiene rol TRAINER');
            }
            if (trainer.estado !== 'ACTIVO') {
                throw new common_1.BadRequestException('El trainer debe estar activo');
            }
        }
        const data = { ...dto };
        if (dto.fechaInicio) {
            data.fechaInicio = new Date(dto.fechaInicio);
        }
        if (dto.fechaFin) {
            data.fechaFin = new Date(dto.fechaFin);
        }
        if (unidadEducativaId !== undefined) {
            data.unidadEducativaId = unidadEducativaId;
        }
        delete data.unidadEducativaNombre;
        return this.prisma.taller.update({
            where: { id: taller.id },
            data,
            include: {
                trainer: {
                    select: {
                        id: true,
                        nombre: true,
                        email: true,
                    },
                },
            },
        });
    }
    async remove(id) {
        await this.findOne(id);
        return this.prisma.taller.delete({ where: { id } });
    }
    async publicar(id) {
        const taller = await this.findOne(id);
        if (taller.estado === 'PUBLICADO') {
            throw new common_1.BadRequestException('El taller ya está publicado');
        }
        if (taller.estado === 'CERRADO' || taller.estado === 'FINALIZADO' || taller.estado === 'CANCELADO') {
            throw new common_1.BadRequestException(`No se puede publicar un taller con estado ${taller.estado}`);
        }
        return this.prisma.taller.update({
            where: { id },
            data: { estado: 'PUBLICADO' },
            include: {
                trainer: {
                    select: {
                        id: true,
                        nombre: true,
                        email: true,
                    },
                },
            },
        });
    }
    async cerrar(id) {
        const taller = await this.findOne(id);
        if (taller.estado === 'CERRADO') {
            throw new common_1.BadRequestException('El taller ya está cerrado');
        }
        if (taller.estado === 'FINALIZADO' || taller.estado === 'CANCELADO') {
            throw new common_1.BadRequestException(`No se puede cerrar un taller con estado ${taller.estado}`);
        }
        return this.prisma.taller.update({
            where: { id },
            data: { estado: 'CERRADO' },
            include: {
                trainer: {
                    select: {
                        id: true,
                        nombre: true,
                        email: true,
                    },
                },
            },
        });
    }
    setCertificadosService(service) {
        this.certificadosService = service;
    }
    async finalizar(id) {
        const taller = await this.findOne(id);
        if (taller.estado === 'FINALIZADO') {
            throw new common_1.BadRequestException('El taller ya está finalizado');
        }
        if (taller.estado === 'CANCELADO') {
            throw new common_1.BadRequestException('No se puede finalizar un taller cancelado');
        }
        const tallerActualizado = await this.prisma.taller.update({
            where: { id },
            data: { estado: 'FINALIZADO' },
            include: {
                trainer: {
                    select: {
                        id: true,
                        nombre: true,
                        email: true,
                    },
                },
            },
        });
        const certificadosService = this.certificadosService;
        if (certificadosService) {
            try {
                this.logger.log(`Generando certificados automáticamente para taller ${id}`);
                const resultado = await certificadosService.emitirCertificadosAutomaticos(id);
                this.logger.log(`Certificados generados: ${resultado.emitidos} emitidos, ${resultado.noElegibles} no elegibles, ${resultado.errores} errores`);
            }
            catch (error) {
                this.logger.error(`Error generando certificados automáticamente para taller ${id}:`, error);
            }
        }
        else {
            this.logger.warn('CertificadosService no está disponible, no se generarán certificados automáticamente');
        }
        return tallerActualizado;
    }
};
exports.TalleresService = TalleresService;
exports.TalleresService = TalleresService = TalleresService_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService,
        notificaciones_service_1.NotificacionesService])
], TalleresService);
//# sourceMappingURL=talleres.service.js.map