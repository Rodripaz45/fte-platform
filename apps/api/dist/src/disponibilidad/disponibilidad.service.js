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
exports.DisponibilidadService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../../prisma/prisma.service");
let DisponibilidadService = class DisponibilidadService {
    prisma;
    constructor(prisma) {
        this.prisma = prisma;
    }
    async verificarDisponibilidad(dto) {
        const fechaInicio = new Date(dto.fechaInicio);
        const fechaFin = new Date(dto.fechaFin);
        if (fechaInicio >= fechaFin) {
            throw new common_1.BadRequestException('La fecha de inicio debe ser anterior a la fecha de fin');
        }
        const trainer = await this.prisma.usuario.findUnique({
            where: { id: dto.trainerId },
            include: { roles: { include: { rol: true } } },
        });
        if (!trainer) {
            throw new common_1.NotFoundException('Trainer no encontrado');
        }
        const tieneRolTrainer = trainer.roles.some((ur) => ur.rol.nombre === 'TRAINER');
        if (!tieneRolTrainer) {
            throw new common_1.BadRequestException('El usuario especificado no tiene rol TRAINER');
        }
        const conflictos = await this.prisma.disponibilidadTrainer.findMany({
            where: {
                trainerId: dto.trainerId,
                tipo: { in: ['NO_DISPONIBLE', 'OCUPADO'] },
                ...(dto.disponibilidadId && { id: { not: dto.disponibilidadId } }),
                OR: [
                    {
                        fechaInicio: { lte: fechaInicio },
                        fechaFin: { gte: fechaInicio },
                    },
                    {
                        fechaInicio: { lte: fechaFin },
                        fechaFin: { gte: fechaFin },
                    },
                    {
                        fechaInicio: { gte: fechaInicio },
                        fechaFin: { lte: fechaFin },
                    },
                ],
            },
        });
        const sesionesConflictivas = await this.prisma.sesion.findMany({
            where: {
                AND: [
                    {
                        OR: [
                            {
                                responsableId: dto.trainerId,
                            },
                            {
                                taller: {
                                    trainerId: dto.trainerId,
                                },
                            },
                        ],
                    },
                    {
                        OR: [
                            {
                                AND: [
                                    { horaInicio: { not: null } },
                                    { horaFin: { not: null } },
                                    {
                                        horaInicio: { lte: fechaInicio },
                                        horaFin: { gte: fechaInicio },
                                    },
                                ],
                            },
                            {
                                AND: [
                                    { horaInicio: { not: null } },
                                    { horaFin: { not: null } },
                                    {
                                        horaInicio: { lte: fechaFin },
                                        horaFin: { gte: fechaFin },
                                    },
                                ],
                            },
                            {
                                AND: [
                                    { horaInicio: { not: null } },
                                    { horaFin: { not: null } },
                                    {
                                        horaInicio: { gte: fechaInicio },
                                        horaFin: { lte: fechaFin },
                                    },
                                ],
                            },
                            {
                                AND: [
                                    { horaInicio: null },
                                    { horaFin: null },
                                    {
                                        fecha: {
                                            gte: new Date(fechaInicio.getFullYear(), fechaInicio.getMonth(), fechaInicio.getDate()),
                                            lt: new Date(fechaInicio.getFullYear(), fechaInicio.getMonth(), fechaInicio.getDate() + 1),
                                        },
                                    },
                                ],
                            },
                        ],
                    },
                ],
            },
            include: {
                taller: {
                    select: {
                        tema: true,
                    },
                },
            },
        });
        return {
            disponible: conflictos.length === 0 && sesionesConflictivas.length === 0,
            conflictosDisponibilidad: conflictos.map((c) => ({
                id: c.id,
                fechaInicio: c.fechaInicio,
                fechaFin: c.fechaFin,
                tipo: c.tipo,
                motivo: c.motivo,
            })),
            conflictosSesiones: sesionesConflictivas.map((s) => ({
                id: s.id,
                fecha: s.fecha,
                horaInicio: s.horaInicio,
                horaFin: s.horaFin,
                taller: s.taller.tema,
            })),
        };
    }
    async create(dto) {
        const fechaInicio = new Date(dto.fechaInicio);
        const fechaFin = new Date(dto.fechaFin);
        if (fechaInicio >= fechaFin) {
            throw new common_1.BadRequestException('La fecha de inicio debe ser anterior a la fecha de fin');
        }
        const trainer = await this.prisma.usuario.findUnique({
            where: { id: dto.trainerId },
            include: { roles: { include: { rol: true } } },
        });
        if (!trainer) {
            throw new common_1.NotFoundException('Trainer no encontrado');
        }
        const tieneRolTrainer = trainer.roles.some((ur) => ur.rol.nombre === 'TRAINER');
        if (!tieneRolTrainer) {
            throw new common_1.BadRequestException('El usuario especificado no tiene rol TRAINER');
        }
        if (dto.tipo === 'NO_DISPONIBLE' || dto.tipo === 'OCUPADO') {
            const disponibilidad = await this.verificarDisponibilidad({
                trainerId: dto.trainerId,
                fechaInicio: dto.fechaInicio,
                fechaFin: dto.fechaFin,
            });
            if (!disponibilidad.disponible) {
                throw new common_1.BadRequestException({
                    message: 'El trainer tiene conflictos en ese horario',
                    conflictos: disponibilidad,
                });
            }
        }
        return this.prisma.disponibilidadTrainer.create({
            data: {
                trainerId: dto.trainerId,
                fechaInicio,
                fechaFin,
                tipo: dto.tipo,
                motivo: dto.motivo,
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
    }
    async findAll(trainerId, fechaInicio, fechaFin) {
        const where = {};
        if (trainerId)
            where.trainerId = trainerId;
        if (fechaInicio || fechaFin) {
            where.OR = [];
            if (fechaInicio && fechaFin) {
                where.OR.push({
                    fechaInicio: { gte: new Date(fechaInicio), lte: new Date(fechaFin) },
                });
                where.OR.push({
                    fechaFin: { gte: new Date(fechaInicio), lte: new Date(fechaFin) },
                });
                where.OR.push({
                    fechaInicio: { lte: new Date(fechaInicio) },
                    fechaFin: { gte: new Date(fechaFin) },
                });
            }
            else if (fechaInicio) {
                where.fechaFin = { gte: new Date(fechaInicio) };
            }
            else if (fechaFin) {
                where.fechaInicio = { lte: new Date(fechaFin) };
            }
        }
        return this.prisma.disponibilidadTrainer.findMany({
            where,
            include: {
                trainer: {
                    select: {
                        id: true,
                        nombre: true,
                        email: true,
                    },
                },
            },
            orderBy: { fechaInicio: 'asc' },
        });
    }
    async findOne(id) {
        const disponibilidad = await this.prisma.disponibilidadTrainer.findUnique({
            where: { id },
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
        if (!disponibilidad) {
            throw new common_1.NotFoundException('Disponibilidad no encontrada');
        }
        return disponibilidad;
    }
    async update(id, dto) {
        const disponibilidad = await this.findOne(id);
        if (dto.fechaInicio || dto.fechaFin || dto.tipo) {
            const fechaInicio = dto.fechaInicio
                ? new Date(dto.fechaInicio)
                : disponibilidad.fechaInicio;
            const fechaFin = dto.fechaFin ? new Date(dto.fechaFin) : disponibilidad.fechaFin;
            const tipo = dto.tipo || disponibilidad.tipo;
            if (tipo === 'NO_DISPONIBLE' || tipo === 'OCUPADO') {
                const verificacion = await this.verificarDisponibilidad({
                    trainerId: disponibilidad.trainerId,
                    fechaInicio: fechaInicio.toISOString(),
                    fechaFin: fechaFin.toISOString(),
                    disponibilidadId: id,
                });
                if (!verificacion.disponible) {
                    throw new common_1.BadRequestException({
                        message: 'El trainer tiene conflictos en ese horario',
                        conflictos: verificacion,
                    });
                }
            }
        }
        return this.prisma.disponibilidadTrainer.update({
            where: { id },
            data: {
                ...(dto.trainerId && { trainerId: dto.trainerId }),
                ...(dto.fechaInicio && { fechaInicio: new Date(dto.fechaInicio) }),
                ...(dto.fechaFin && { fechaFin: new Date(dto.fechaFin) }),
                ...(dto.tipo && { tipo: dto.tipo }),
                ...(dto.motivo !== undefined && { motivo: dto.motivo }),
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
    }
    async remove(id) {
        await this.findOne(id);
        return this.prisma.disponibilidadTrainer.delete({ where: { id } });
    }
    async obtenerCargaTrabajo(trainerId, fechaInicio, fechaFin) {
        const trainer = await this.prisma.usuario.findUnique({
            where: { id: trainerId },
            include: { roles: { include: { rol: true } } },
        });
        if (!trainer) {
            throw new common_1.NotFoundException('Trainer no encontrado');
        }
        const tieneRolTrainer = trainer.roles.some((ur) => ur.rol.nombre === 'TRAINER');
        if (!tieneRolTrainer) {
            throw new common_1.BadRequestException('El usuario especificado no tiene rol TRAINER');
        }
        const whereSesiones = {
            OR: [
                { responsableId: trainerId },
                { taller: { trainerId } },
            ],
        };
        const whereTalleres = {
            trainerId,
        };
        if (fechaInicio || fechaFin) {
            if (fechaInicio && fechaFin) {
                whereSesiones.fecha = {
                    gte: new Date(fechaInicio),
                    lte: new Date(fechaFin),
                };
                whereTalleres.fechaInicio = {
                    lte: new Date(fechaFin),
                };
                whereTalleres.fechaFin = {
                    gte: new Date(fechaInicio),
                };
            }
            else if (fechaInicio) {
                whereSesiones.fecha = { gte: new Date(fechaInicio) };
                whereTalleres.fechaFin = { gte: new Date(fechaInicio) };
            }
            else if (fechaFin) {
                whereSesiones.fecha = { lte: new Date(fechaFin) };
                whereTalleres.fechaInicio = { lte: new Date(fechaFin) };
            }
        }
        const [sesiones, talleres, disponibilidades] = await Promise.all([
            this.prisma.sesion.count({ where: whereSesiones }),
            this.prisma.taller.count({ where: whereTalleres }),
            this.prisma.disponibilidadTrainer.findMany({
                where: {
                    trainerId,
                    tipo: 'NO_DISPONIBLE',
                    ...(fechaInicio || fechaFin
                        ? {
                            OR: [
                                {
                                    fechaInicio: { gte: fechaInicio ? new Date(fechaInicio) : undefined },
                                    fechaFin: { lte: fechaFin ? new Date(fechaFin) : undefined },
                                },
                            ],
                        }
                        : {}),
                },
            }),
        ]);
        return {
            trainer: {
                id: trainer.id,
                nombre: trainer.nombre,
                email: trainer.email,
            },
            periodo: {
                fechaInicio: fechaInicio || null,
                fechaFin: fechaFin || null,
            },
            estadisticas: {
                totalSesiones: sesiones,
                totalTalleres: talleres,
                diasNoDisponibles: disponibilidades.length,
            },
        };
    }
    async sugerirTrainersDisponibles(fechaInicio, fechaFin) {
        const inicio = new Date(fechaInicio);
        const fin = new Date(fechaFin);
        if (inicio >= fin) {
            throw new common_1.BadRequestException('La fecha de inicio debe ser anterior a la fecha de fin');
        }
        const trainers = await this.prisma.usuario.findMany({
            where: {
                roles: {
                    some: {
                        rol: {
                            nombre: 'TRAINER',
                        },
                    },
                },
                estado: 'ACTIVO',
            },
            include: {
                roles: {
                    include: {
                        rol: true,
                    },
                },
            },
        });
        const trainersDisponibles = [];
        for (const trainer of trainers) {
            const verificacion = await this.verificarDisponibilidad({
                trainerId: trainer.id,
                fechaInicio,
                fechaFin,
            });
            if (verificacion.disponible) {
                const cargaTrabajo = await this.obtenerCargaTrabajo(trainer.id);
                trainersDisponibles.push({
                    trainer: {
                        id: trainer.id,
                        nombre: trainer.nombre,
                        email: trainer.email,
                    },
                    disponible: true,
                    cargaTrabajo: cargaTrabajo.estadisticas,
                });
            }
            else {
                trainersDisponibles.push({
                    trainer: {
                        id: trainer.id,
                        nombre: trainer.nombre,
                        email: trainer.email,
                    },
                    disponible: false,
                    conflictos: verificacion,
                });
            }
        }
        return {
            fechaInicio,
            fechaFin,
            trainers: trainersDisponibles,
            disponibles: trainersDisponibles.filter((t) => t.disponible).length,
            noDisponibles: trainersDisponibles.filter((t) => !t.disponible).length,
        };
    }
};
exports.DisponibilidadService = DisponibilidadService;
exports.DisponibilidadService = DisponibilidadService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], DisponibilidadService);
//# sourceMappingURL=disponibilidad.service.js.map