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
exports.ParticipantesService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../../prisma/prisma.service");
let ParticipantesService = class ParticipantesService {
    prisma;
    constructor(prisma) {
        this.prisma = prisma;
    }
    async create(dto) {
        const usuario = await this.prisma.usuario.findUnique({
            where: { id: dto.usuarioId },
        });
        if (!usuario)
            throw new common_1.NotFoundException('Usuario no encontrado');
        const existente = await this.prisma.participante.findUnique({
            where: { usuarioId: dto.usuarioId },
        });
        if (existente)
            throw new common_1.BadRequestException('El usuario ya tiene un perfil de participante');
        return this.prisma.participante.create({
            data: {
                usuarioId: dto.usuarioId,
                documento: dto.documento,
                telefono: dto.telefono,
                genero: dto.genero,
                fechaNac: dto.fechaNac ? new Date(dto.fechaNac) : undefined,
            },
            include: { usuario: true },
        });
    }
    findAll() {
        return this.prisma.participante.findMany({
            include: { usuario: true },
        });
    }
    async findOne(id) {
        const participante = await this.prisma.participante.findUnique({
            where: { id },
            include: { usuario: true, inscripciones: true },
        });
        if (!participante)
            throw new common_1.NotFoundException('Participante no encontrado');
        return participante;
    }
    async update(id, dto) {
        await this.findOne(id);
        return this.prisma.participante.update({
            where: { id },
            data: dto,
            include: { usuario: true },
        });
    }
    async remove(id) {
        await this.findOne(id);
        return this.prisma.participante.delete({ where: { id } });
    }
};
exports.ParticipantesService = ParticipantesService;
exports.ParticipantesService = ParticipantesService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], ParticipantesService);
//# sourceMappingURL=participantes.service.js.map