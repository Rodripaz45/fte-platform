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
let TalleresService = class TalleresService {
    prisma;
    constructor(prisma) {
        this.prisma = prisma;
    }
    async create(dto) {
        if (dto.fechaInicio && dto.fechaFin && dto.fechaInicio >= dto.fechaFin) {
            throw new common_1.BadRequestException('La fecha de inicio debe ser anterior a la fecha de fin');
        }
        return this.prisma.taller.create({
            data: {
                tema: dto.tema,
                modalidad: dto.modalidad,
                cupos: dto.cupos ?? 0,
                fechaInicio: dto.fechaInicio ? new Date(dto.fechaInicio) : null,
                fechaFin: dto.fechaFin ? new Date(dto.fechaFin) : null,
                sede: dto.sede,
                estado: dto.estado ?? 'PROGRAMADO',
            },
        });
    }
    findAll() {
        return this.prisma.taller.findMany({
            orderBy: { creadoEn: 'desc' },
        });
    }
    async findOne(id) {
        const taller = await this.prisma.taller.findUnique({
            where: { id },
            include: {
                inscripciones: true,
                feedbacks: true,
            },
        });
        if (!taller)
            throw new common_1.NotFoundException('Taller no encontrado');
        return taller;
    }
    async update(id, dto) {
        const taller = await this.findOne(id);
        return this.prisma.taller.update({
            where: { id: taller.id },
            data: dto,
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
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], TalleresService);
//# sourceMappingURL=talleres.service.js.map