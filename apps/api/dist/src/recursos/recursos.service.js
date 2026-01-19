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
exports.RecursosService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../../prisma/prisma.service");
let RecursosService = class RecursosService {
    prisma;
    constructor(prisma) {
        this.prisma = prisma;
    }
    async createSala(dto) {
        return this.prisma.sala.create({
            data: {
                nombre: dto.nombre,
                sede: dto.sede,
                capacidad: dto.capacidad,
                equipamiento: dto.equipamiento,
                descripcion: dto.descripcion,
                activa: dto.activa ?? true,
            },
        });
    }
    async findAllSalas(sede, activa) {
        const where = {};
        if (sede)
            where.sede = sede;
        if (activa !== undefined)
            where.activa = activa;
        return this.prisma.sala.findMany({
            where,
            include: {
                _count: {
                    select: {
                        sesiones: true,
                        reservas: true,
                    },
                },
            },
            orderBy: { nombre: 'asc' },
        });
    }
    async findOneSala(id) {
        const sala = await this.prisma.sala.findUnique({
            where: { id },
            include: {
                sesiones: {
                    include: {
                        taller: {
                            select: {
                                id: true,
                                tema: true,
                                trainer: {
                                    select: {
                                        id: true,
                                        nombre: true,
                                    },
                                },
                            },
                        },
                    },
                },
                reservas: {
                    where: {
                        estado: { in: ['RESERVADA', 'CONFIRMADA'] },
                    },
                    orderBy: { fechaInicio: 'asc' },
                },
            },
        });
        if (!sala) {
            throw new common_1.NotFoundException('Sala no encontrada');
        }
        return sala;
    }
    async updateSala(id, dto) {
        await this.findOneSala(id);
        return this.prisma.sala.update({
            where: { id },
            data: dto,
        });
    }
    async removeSala(id) {
        await this.findOneSala(id);
        const reservasActivas = await this.prisma.reservaSala.count({
            where: {
                salaId: id,
                estado: { in: ['RESERVADA', 'CONFIRMADA'] },
                fechaFin: { gte: new Date() },
            },
        });
        if (reservasActivas > 0) {
            throw new common_1.BadRequestException('No se puede eliminar la sala porque tiene reservas activas');
        }
        return this.prisma.sala.delete({ where: { id } });
    }
    async verificarDisponibilidad(dto) {
        const fechaInicio = new Date(dto.fechaInicio);
        const fechaFin = new Date(dto.fechaFin);
        if (fechaInicio >= fechaFin) {
            throw new common_1.BadRequestException('La fecha de inicio debe ser anterior a la fecha de fin');
        }
        const sala = await this.prisma.sala.findUnique({
            where: { id: dto.salaId },
        });
        if (!sala) {
            throw new common_1.NotFoundException('Sala no encontrada');
        }
        if (!sala.activa) {
            throw new common_1.BadRequestException('La sala no está activa');
        }
        const conflictos = await this.prisma.reservaSala.findMany({
            where: {
                salaId: dto.salaId,
                estado: { in: ['RESERVADA', 'CONFIRMADA'] },
                ...(dto.reservaId && { id: { not: dto.reservaId } }),
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
            include: {
                sesion: {
                    include: {
                        taller: {
                            select: {
                                tema: true,
                                trainer: {
                                    select: {
                                        nombre: true,
                                    },
                                },
                            },
                        },
                    },
                },
            },
        });
        return {
            disponible: conflictos.length === 0,
            conflictos: conflictos.map((c) => ({
                id: c.id,
                fechaInicio: c.fechaInicio,
                fechaFin: c.fechaFin,
                sesion: c.sesion
                    ? {
                        id: c.sesion.id,
                        taller: c.sesion.taller.tema,
                        trainer: c.sesion.taller.trainer.nombre,
                    }
                    : null,
                motivo: c.motivo,
            })),
        };
    }
    async createReserva(dto) {
        const disponibilidad = await this.verificarDisponibilidad({
            salaId: dto.salaId,
            fechaInicio: dto.fechaInicio,
            fechaFin: dto.fechaFin,
        });
        if (!disponibilidad.disponible) {
            throw new common_1.BadRequestException({
                message: 'La sala no está disponible en ese horario',
                conflictos: disponibilidad.conflictos,
            });
        }
        if (dto.sesionId) {
            const sesion = await this.prisma.sesion.findUnique({
                where: { id: dto.sesionId },
            });
            if (!sesion) {
                throw new common_1.NotFoundException('Sesión no encontrada');
            }
        }
        return this.prisma.reservaSala.create({
            data: {
                salaId: dto.salaId,
                sesionId: dto.sesionId,
                fechaInicio: new Date(dto.fechaInicio),
                fechaFin: new Date(dto.fechaFin),
                estado: dto.estado || 'RESERVADA',
                motivo: dto.motivo,
            },
            include: {
                sala: true,
                sesion: {
                    include: {
                        taller: {
                            select: {
                                tema: true,
                            },
                        },
                    },
                },
            },
        });
    }
    async findAllReservas(salaId, fechaInicio, fechaFin) {
        const where = {};
        if (salaId)
            where.salaId = salaId;
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
        return this.prisma.reservaSala.findMany({
            where,
            include: {
                sala: true,
                sesion: {
                    include: {
                        taller: {
                            select: {
                                tema: true,
                                trainer: {
                                    select: {
                                        nombre: true,
                                    },
                                },
                            },
                        },
                    },
                },
            },
            orderBy: { fechaInicio: 'asc' },
        });
    }
    async findOneReserva(id) {
        const reserva = await this.prisma.reservaSala.findUnique({
            where: { id },
            include: {
                sala: true,
                sesion: {
                    include: {
                        taller: true,
                    },
                },
            },
        });
        if (!reserva) {
            throw new common_1.NotFoundException('Reserva no encontrada');
        }
        return reserva;
    }
    async updateReserva(id, dto) {
        const reserva = await this.findOneReserva(id);
        if (dto.fechaInicio || dto.fechaFin) {
            const fechaInicio = dto.fechaInicio
                ? new Date(dto.fechaInicio)
                : reserva.fechaInicio;
            const fechaFin = dto.fechaFin ? new Date(dto.fechaFin) : reserva.fechaFin;
            const disponibilidad = await this.verificarDisponibilidad({
                salaId: reserva.salaId,
                fechaInicio: fechaInicio.toISOString(),
                fechaFin: fechaFin.toISOString(),
                reservaId: id,
            });
            if (!disponibilidad.disponible) {
                throw new common_1.BadRequestException({
                    message: 'La sala no está disponible en ese horario',
                    conflictos: disponibilidad.conflictos,
                });
            }
        }
        return this.prisma.reservaSala.update({
            where: { id },
            data: {
                ...(dto.salaId && { salaId: dto.salaId }),
                ...(dto.sesionId !== undefined && { sesionId: dto.sesionId }),
                ...(dto.fechaInicio && { fechaInicio: new Date(dto.fechaInicio) }),
                ...(dto.fechaFin && { fechaFin: new Date(dto.fechaFin) }),
                ...(dto.estado && { estado: dto.estado }),
                ...(dto.motivo !== undefined && { motivo: dto.motivo }),
            },
            include: {
                sala: true,
                sesion: {
                    include: {
                        taller: {
                            select: {
                                tema: true,
                            },
                        },
                    },
                },
            },
        });
    }
    async removeReserva(id) {
        await this.findOneReserva(id);
        return this.prisma.reservaSala.delete({ where: { id } });
    }
};
exports.RecursosService = RecursosService;
exports.RecursosService = RecursosService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], RecursosService);
//# sourceMappingURL=recursos.service.js.map