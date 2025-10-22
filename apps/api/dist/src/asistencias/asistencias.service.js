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
exports.AsistenciasService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../../prisma/prisma.service");
let AsistenciasService = class AsistenciasService {
    prisma;
    constructor(prisma) {
        this.prisma = prisma;
    }
    async validarSesionYRelacion(dto) {
        const sesion = await this.prisma.sesion.findUnique({
            where: { id: dto.sesionId },
            select: { id: true, tallerId: true },
        });
        if (!sesion)
            throw new common_1.NotFoundException('Sesión no encontrada');
        const participante = await this.prisma.participante.findUnique({
            where: { id: dto.participanteId },
            select: { id: true },
        });
        if (!participante)
            throw new common_1.NotFoundException('Participante no encontrado');
        const inscrito = await this.prisma.inscripcion.findFirst({
            where: {
                participanteId: dto.participanteId,
                tallerId: sesion.tallerId,
                estado: { in: ['INSCRITO', 'FINALIZADO'] },
            },
            select: { id: true },
        });
        if (!inscrito) {
            throw new common_1.BadRequestException('El participante no está inscrito en el taller de la sesión');
        }
        return sesion;
    }
    async create(dto) {
        await this.validarSesionYRelacion(dto);
        return this.prisma.asistencia.upsert({
            where: {
                sesionId_participanteId: {
                    sesionId: dto.sesionId,
                    participanteId: dto.participanteId,
                },
            },
            update: {
                estado: dto.estado,
                tomadoEn: new Date(),
            },
            create: {
                sesionId: dto.sesionId,
                participanteId: dto.participanteId,
                estado: dto.estado,
                tomadoEn: new Date(),
            },
            include: {
                participante: { include: { usuario: true } },
            },
        });
    }
    async tomar(dto) {
        if (!dto.items?.length) {
            throw new common_1.BadRequestException('Debe enviar al menos un item de asistencia');
        }
        const sesion = await this.prisma.sesion.findUnique({
            where: { id: dto.sesionId },
            select: { id: true, tallerId: true },
        });
        if (!sesion)
            throw new common_1.NotFoundException('Sesión no encontrada');
        await Promise.all(dto.items.map(async (item) => {
            const participante = await this.prisma.participante.findUnique({
                where: { id: item.participanteId },
                select: { id: true },
            });
            if (!participante) {
                throw new common_1.NotFoundException(`Participante no encontrado: ${item.participanteId}`);
            }
            const inscrito = await this.prisma.inscripcion.findFirst({
                where: {
                    participanteId: item.participanteId,
                    tallerId: sesion.tallerId,
                    estado: { in: ['INSCRITO', 'FINALIZADO'] },
                },
                select: { id: true },
            });
            if (!inscrito) {
                throw new common_1.BadRequestException(`Participante ${item.participanteId} no está inscrito en el taller de la sesión`);
            }
        }));
        const resultados = await this.prisma.$transaction(dto.items.map((item) => this.prisma.asistencia.upsert({
            where: {
                sesionId_participanteId: {
                    sesionId: dto.sesionId,
                    participanteId: item.participanteId,
                },
            },
            update: {
                estado: item.estado,
                tomadoEn: new Date(),
            },
            create: {
                sesionId: dto.sesionId,
                participanteId: item.participanteId,
                estado: item.estado,
                tomadoEn: new Date(),
            },
        })));
        return { sesionId: dto.sesionId, total: resultados.length, items: resultados };
    }
    async findAll(params) {
        const where = params?.sesionId ? { sesionId: params.sesionId } : undefined;
        return this.prisma.asistencia.findMany({
            where,
            orderBy: [{ creadoEn: 'desc' }],
            include: {
                sesion: { include: { taller: true, responsable: true } },
                participante: { include: { usuario: true } },
            },
        });
    }
    async findOne(id) {
        const item = await this.prisma.asistencia.findUnique({
            where: { id },
            include: {
                sesion: { include: { taller: true, responsable: true } },
                participante: { include: { usuario: true } },
            },
        });
        if (!item)
            throw new common_1.NotFoundException('Asistencia no encontrada');
        return item;
    }
    async update(id, dto) {
        await this.findOne(id);
        return this.prisma.asistencia.update({
            where: { id },
            data: {
                ...(dto.estado ? { estado: dto.estado, tomadoEn: new Date() } : {}),
            },
        });
    }
    async remove(id) {
        await this.findOne(id);
        return this.prisma.asistencia.delete({ where: { id } });
    }
    async resumenPorSesion(sesionId) {
        const sesion = await this.prisma.sesion.findUnique({ where: { id: sesionId }, select: { id: true } });
        if (!sesion)
            throw new common_1.NotFoundException('Sesión no encontrada');
        const [presentes, ausentes, tarde, total] = await Promise.all([
            this.prisma.asistencia.count({ where: { sesionId, estado: 'PRESENTE' } }),
            this.prisma.asistencia.count({ where: { sesionId, estado: 'AUSENTE' } }),
            this.prisma.asistencia.count({ where: { sesionId, estado: 'TARDE' } }),
            this.prisma.asistencia.count({ where: { sesionId } }),
        ]);
        return { sesionId, presentes, ausentes, tarde, total };
    }
};
exports.AsistenciasService = AsistenciasService;
exports.AsistenciasService = AsistenciasService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], AsistenciasService);
//# sourceMappingURL=asistencias.service.js.map