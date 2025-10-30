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
exports.InscripcionesService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../../prisma/prisma.service");
const ia_service_1 = require("../ia/ia.service");
let InscripcionesService = class InscripcionesService {
    prisma;
    ia;
    constructor(prisma, ia) {
        this.prisma = prisma;
        this.ia = ia;
    }
    async create(dto) {
        const participante = await this.prisma.participante.findUnique({
            where: { id: dto.participanteId },
            select: { id: true },
        });
        if (!participante)
            throw new common_1.NotFoundException('Participante no encontrado');
        const taller = await this.prisma.taller.findUnique({
            where: { id: dto.tallerId },
            select: { id: true, estado: true, cupos: true },
        });
        if (!taller)
            throw new common_1.NotFoundException('Taller no encontrado');
        if (taller.estado === 'FINALIZADO') {
            throw new common_1.BadRequestException('No se puede inscribir en un taller finalizado');
        }
        const inscripcionesActivas = await this.prisma.inscripcion.count({
            where: { tallerId: dto.tallerId, estado: { in: ['INSCRITO'] } },
        });
        const cupoMax = typeof taller.cupos === 'number' ? taller.cupos : 0;
        if (cupoMax > 0 && inscripcionesActivas >= cupoMax) {
            throw new common_1.BadRequestException('El taller ya alcanzó su cupo máximo');
        }
        const yaExiste = await this.prisma.inscripcion.findFirst({
            where: { participanteId: dto.participanteId, tallerId: dto.tallerId },
            select: { id: true, estado: true },
        });
        if (yaExiste && yaExiste.estado !== 'CANCELADO') {
            throw new common_1.BadRequestException('El participante ya está inscrito en este taller');
        }
        return this.prisma.inscripcion.create({
            data: {
                participanteId: dto.participanteId,
                tallerId: dto.tallerId,
                estado: 'INSCRITO',
            },
            include: { taller: true, participante: true },
        });
    }
    async findAll() {
        return this.prisma.inscripcion.findMany({
            include: {
                taller: true,
                participante: { include: { usuario: true } },
            },
            orderBy: { creadoEn: 'desc' },
        });
    }
    async findOne(id) {
        const inscripcion = await this.prisma.inscripcion.findUnique({
            where: { id },
            include: {
                taller: true,
                participante: { include: { usuario: true } },
            },
        });
        if (!inscripcion)
            throw new common_1.NotFoundException('Inscripción no encontrada');
        return inscripcion;
    }
    async update(id, dto) {
        if (!dto.estado) {
            throw new common_1.BadRequestException('Debe enviar un estado válido');
        }
        const actual = await this.prisma.inscripcion.findUnique({
            where: { id },
            select: { id: true, estado: true },
        });
        if (!actual)
            throw new common_1.NotFoundException('Inscripción no encontrada');
        const updated = await this.prisma.inscripcion.update({
            where: { id },
            data: { estado: dto.estado },
            include: { taller: true, participante: true },
        });
        if (dto.estado === 'FINALIZADO') {
            try {
                await this.ia.analyzeByParticipantId(updated.participanteId);
            }
            catch (e) {
                console.error('IA analyze error:', e?.message || e);
            }
        }
        return updated;
    }
    async remove(id) {
        await this.findOne(id);
        return this.prisma.inscripcion.delete({ where: { id } });
    }
};
exports.InscripcionesService = InscripcionesService;
exports.InscripcionesService = InscripcionesService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService, ia_service_1.IaService])
], InscripcionesService);
//# sourceMappingURL=inscripciones.service.js.map