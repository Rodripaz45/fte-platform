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
exports.UnidadesEducativasService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../../prisma/prisma.service");
let UnidadesEducativasService = class UnidadesEducativasService {
    prisma;
    constructor(prisma) {
        this.prisma = prisma;
    }
    async create(dto) {
        if (dto.codigo) {
            const existente = await this.prisma.unidadEducativa.findUnique({
                where: { codigo: dto.codigo },
            });
            if (existente) {
                throw new common_1.BadRequestException('Ya existe una unidad educativa con ese código');
            }
        }
        return this.prisma.unidadEducativa.create({
            data: {
                nombre: dto.nombre,
                codigo: dto.codigo,
                direccion: dto.direccion,
                contacto: dto.contacto,
                email: dto.email,
                telefono: dto.telefono,
            },
        });
    }
    async findAll() {
        return this.prisma.unidadEducativa.findMany({
            include: {
                _count: {
                    select: {
                        talleres: true,
                        listasParticipantes: true,
                    },
                },
            },
            orderBy: { nombre: 'asc' },
        });
    }
    async findOne(id) {
        const unidad = await this.prisma.unidadEducativa.findUnique({
            where: { id },
            include: {
                talleres: {
                    include: {
                        trainer: {
                            select: {
                                id: true,
                                nombre: true,
                                email: true,
                            },
                        },
                    },
                },
                _count: {
                    select: {
                        listasParticipantes: true,
                    },
                },
            },
        });
        if (!unidad)
            throw new common_1.NotFoundException('Unidad educativa no encontrada');
        return unidad;
    }
    async update(id, dto) {
        await this.findOne(id);
        if (dto.codigo) {
            const existente = await this.prisma.unidadEducativa.findFirst({
                where: {
                    codigo: dto.codigo,
                    id: { not: id },
                },
            });
            if (existente) {
                throw new common_1.BadRequestException('Ya existe otra unidad educativa con ese código');
            }
        }
        return this.prisma.unidadEducativa.update({
            where: { id },
            data: dto,
        });
    }
    async remove(id) {
        await this.findOne(id);
        const talleres = await this.prisma.taller.count({
            where: { unidadEducativaId: id },
        });
        if (talleres > 0) {
            throw new common_1.BadRequestException(`No se puede eliminar la unidad educativa porque tiene ${talleres} taller(es) asociado(s)`);
        }
        return this.prisma.unidadEducativa.delete({ where: { id } });
    }
};
exports.UnidadesEducativasService = UnidadesEducativasService;
exports.UnidadesEducativasService = UnidadesEducativasService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], UnidadesEducativasService);
//# sourceMappingURL=unidades-educativas.service.js.map