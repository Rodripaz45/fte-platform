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
exports.TalleresService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../../prisma/prisma.service");
const notificaciones_service_1 = require("../notificaciones/notificaciones.service");
let TalleresService = class TalleresService {
    prisma;
    notificacionesService;
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
        const taller = await this.prisma.taller.create({
            data: {
                tema: dto.tema,
                modalidad: dto.modalidad,
                cupos: dto.cupos ?? 0,
                fechaInicio: dto.fechaInicio ? new Date(dto.fechaInicio) : null,
                fechaFin: dto.fechaFin ? new Date(dto.fechaFin) : null,
                sede: dto.sede,
                estado: dto.estado ?? 'PROGRAMADO',
                trainerId: dto.trainerId,
            },
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
        try {
            const participantes = await this.prisma.participante.findMany({
                include: { usuario: true },
            });
            Promise.all(participantes.map(participante => this.notificacionesService.crearNotificacionNuevoTaller(participante.usuario.id, taller.tema).catch(err => console.error(`Error notificando a ${participante.usuario.email}:`, err)))).catch(() => { });
        }
        catch (error) {
            console.error('Error creando notificaciones de nuevo taller:', error);
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
};
exports.TalleresService = TalleresService;
exports.TalleresService = TalleresService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService,
        notificaciones_service_1.NotificacionesService])
], TalleresService);
//# sourceMappingURL=talleres.service.js.map