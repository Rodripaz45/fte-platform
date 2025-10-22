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
exports.SesionesService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../../prisma/prisma.service");
let SesionesService = class SesionesService {
    prisma;
    constructor(prisma) {
        this.prisma = prisma;
    }
    validarHoras(horaInicio, horaFin) {
        if (horaInicio && horaFin && new Date(horaInicio) >= new Date(horaFin)) {
            throw new common_1.BadRequestException('La hora de inicio debe ser anterior a la hora de fin');
        }
    }
    async create(dto) {
        const taller = await this.prisma.taller.findUnique({
            where: { id: dto.tallerId },
            select: { id: true, estado: true },
        });
        if (!taller)
            throw new common_1.NotFoundException('Taller no encontrado');
        if (taller.estado === 'FINALIZADO') {
            throw new common_1.BadRequestException('No se pueden crear sesiones para un taller finalizado');
        }
        this.validarHoras(dto.horaInicio, dto.horaFin);
        if (dto.responsableId) {
            const responsable = await this.prisma.usuario.findUnique({
                where: { id: dto.responsableId },
                select: { id: true },
            });
            if (!responsable)
                throw new common_1.NotFoundException('Usuario responsable no encontrado');
        }
        return this.prisma.sesion.create({
            data: {
                tallerId: dto.tallerId,
                fecha: new Date(dto.fecha),
                horaInicio: dto.horaInicio ? new Date(dto.horaInicio) : null,
                horaFin: dto.horaFin ? new Date(dto.horaFin) : null,
                responsableId: dto.responsableId ?? null,
            },
        });
    }
    async findAll(params) {
        const where = params?.tallerId ? { tallerId: params.tallerId } : undefined;
        const page = Math.max(1, Number(params?.page || 1));
        const pageSize = Math.min(100, Math.max(1, Number(params?.pageSize || 20)));
        const [items, total] = await Promise.all([
            this.prisma.sesion.findMany({
                where,
                orderBy: [{ fecha: 'asc' }, { horaInicio: 'asc' }],
                skip: (page - 1) * pageSize,
                take: pageSize,
                include: {
                    taller: true,
                    responsable: true,
                },
            }),
            this.prisma.sesion.count({ where }),
        ]);
        return {
            page,
            pageSize,
            total,
            items,
        };
    }
    async findOne(id) {
        const sesion = await this.prisma.sesion.findUnique({
            where: { id },
            include: {
                taller: true,
                responsable: true,
                asistencias: {
                    include: { participante: { include: { usuario: true } } },
                },
            },
        });
        if (!sesion)
            throw new common_1.NotFoundException('Sesión no encontrada');
        return sesion;
    }
    async update(id, dto) {
        await this.findOne(id);
        this.validarHoras(dto.horaInicio, dto.horaFin);
        if (dto.responsableId) {
            const existe = await this.prisma.usuario.findUnique({
                where: { id: dto.responsableId },
                select: { id: true },
            });
            if (!existe)
                throw new common_1.NotFoundException('Usuario responsable no encontrado');
        }
        return this.prisma.sesion.update({
            where: { id },
            data: {
                ...(dto.tallerId ? { tallerId: dto.tallerId } : {}),
                ...(dto.fecha ? { fecha: new Date(dto.fecha) } : {}),
                ...(dto.horaInicio ? { horaInicio: new Date(dto.horaInicio) } : { ...(dto.horaInicio === null ? { horaInicio: null } : {}) }),
                ...(dto.horaFin ? { horaFin: new Date(dto.horaFin) } : { ...(dto.horaFin === null ? { horaFin: null } : {}) }),
                ...(dto.responsableId !== undefined
                    ? { responsableId: dto.responsableId ?? null }
                    : {}),
            },
            include: { taller: true, responsable: true },
        });
    }
    async remove(id) {
        await this.findOne(id);
        return this.prisma.sesion.delete({ where: { id } });
    }
};
exports.SesionesService = SesionesService;
exports.SesionesService = SesionesService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], SesionesService);
//# sourceMappingURL=sesiones.service.js.map