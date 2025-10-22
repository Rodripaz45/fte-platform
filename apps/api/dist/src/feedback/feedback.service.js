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
exports.FeedbackService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../../prisma/prisma.service");
let FeedbackService = class FeedbackService {
    prisma;
    constructor(prisma) {
        this.prisma = prisma;
    }
    async validarParticipanteInscrito(tallerId, participanteId) {
        const [taller, participante] = await Promise.all([
            this.prisma.taller.findUnique({ where: { id: tallerId }, select: { id: true } }),
            this.prisma.participante.findUnique({ where: { id: participanteId }, select: { id: true } }),
        ]);
        if (!taller)
            throw new common_1.NotFoundException('Taller no encontrado');
        if (!participante)
            throw new common_1.NotFoundException('Participante no encontrado');
        const inscrito = await this.prisma.inscripcion.findFirst({
            where: {
                tallerId,
                participanteId,
                estado: { in: ['INSCRITO', 'FINALIZADO'] },
            },
            select: { id: true },
        });
        if (!inscrito) {
            throw new common_1.BadRequestException('El participante no está inscrito en el taller');
        }
    }
    async create(dto) {
        await this.validarParticipanteInscrito(dto.tallerId, dto.participanteId);
        const existente = await this.prisma.retroalimentacion.findFirst({
            where: { tallerId: dto.tallerId, participanteId: dto.participanteId },
            select: { id: true },
        });
        if (existente) {
            return this.prisma.retroalimentacion.update({
                where: { id: existente.id },
                data: { puntaje: dto.puntaje, comentario: dto.comentario ?? null },
                include: { participante: { include: { usuario: true } }, taller: true },
            });
        }
        return this.prisma.retroalimentacion.create({
            data: {
                tallerId: dto.tallerId,
                participanteId: dto.participanteId,
                puntaje: dto.puntaje,
                comentario: dto.comentario ?? null,
            },
            include: { participante: { include: { usuario: true } }, taller: true },
        });
    }
    async findAll(params) {
        const where = {
            ...(params?.tallerId ? { tallerId: params.tallerId } : {}),
            ...(params?.participanteId ? { participanteId: params.participanteId } : {}),
        };
        const page = Math.max(1, Number(params?.page || 1));
        const pageSize = Math.min(100, Math.max(1, Number(params?.pageSize || 20)));
        const [items, total] = await Promise.all([
            this.prisma.retroalimentacion.findMany({
                where,
                orderBy: [{ creadoEn: 'desc' }],
                skip: (page - 1) * pageSize,
                take: pageSize,
                include: {
                    taller: true,
                    participante: { include: { usuario: true } },
                },
            }),
            this.prisma.retroalimentacion.count({ where }),
        ]);
        return { page, pageSize, total, items };
    }
    async findOne(id) {
        const fb = await this.prisma.retroalimentacion.findUnique({
            where: { id },
            include: { taller: true, participante: { include: { usuario: true } } },
        });
        if (!fb)
            throw new common_1.NotFoundException('Feedback no encontrado');
        return fb;
    }
    async update(id, dto) {
        await this.findOne(id);
        return this.prisma.retroalimentacion.update({
            where: { id },
            data: {
                ...(dto.puntaje !== undefined ? { puntaje: dto.puntaje } : {}),
                ...(dto.comentario !== undefined ? { comentario: dto.comentario ?? null } : {}),
            },
            include: { taller: true, participante: { include: { usuario: true } } },
        });
    }
    async remove(id) {
        await this.findOne(id);
        return this.prisma.retroalimentacion.delete({ where: { id } });
    }
    async resumenPorTaller(tallerId) {
        const taller = await this.prisma.taller.findUnique({ where: { id: tallerId }, select: { id: true } });
        if (!taller)
            throw new common_1.NotFoundException('Taller no encontrado');
        const [conteo, sumas, dist] = await Promise.all([
            this.prisma.retroalimentacion.count({ where: { tallerId } }),
            this.prisma.retroalimentacion.aggregate({
                where: { tallerId, puntaje: { not: null } },
                _avg: { puntaje: true },
            }),
            Promise.all([1, 2, 3, 4, 5].map(async (p) => ({
                puntaje: p,
                total: await this.prisma.retroalimentacion.count({ where: { tallerId, puntaje: p } }),
            }))),
        ]);
        return {
            tallerId,
            total: conteo,
            promedio: sumas._avg.puntaje ?? 0,
            distribucion: dist,
        };
    }
};
exports.FeedbackService = FeedbackService;
exports.FeedbackService = FeedbackService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], FeedbackService);
//# sourceMappingURL=feedback.service.js.map