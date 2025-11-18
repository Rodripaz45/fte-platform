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
exports.ImportacionesService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../../prisma/prisma.service");
const crypto_1 = require("crypto");
let ImportacionesService = class ImportacionesService {
    prisma;
    constructor(prisma) {
        this.prisma = prisma;
    }
    async importarLista(dto) {
        const taller = await this.prisma.taller.findUnique({
            where: { id: dto.tallerId },
            include: { unidadEducativa: true },
        });
        if (!taller) {
            throw new common_1.NotFoundException('Taller no encontrado');
        }
        if (taller.tipo !== 'UNIDAD_EDUCATIVA') {
            throw new common_1.BadRequestException('Solo se pueden importar listas a talleres de tipo UNIDAD_EDUCATIVA');
        }
        if (!taller.unidadEducativa) {
            throw new common_1.BadRequestException('El taller no tiene una unidad educativa asociada');
        }
        const unidadEducativaId = taller.unidadEducativaId;
        const resultados = {
            total: dto.participantes.length,
            creados: 0,
            duplicados: 0,
            errores: [],
        };
        for (let i = 0; i < dto.participantes.length; i++) {
            const participante = dto.participantes[i];
            try {
                if (!participante.nombre || participante.nombre.trim() === '') {
                    resultados.errores.push({
                        fila: i + 1,
                        error: 'El nombre es requerido',
                    });
                    continue;
                }
                const dedupeHash = this.generarDedupeHash(participante);
                let existe = false;
                if (participante.documento) {
                    const porDocumento = await this.prisma.listaParticipantesUE.findFirst({
                        where: {
                            tallerId: dto.tallerId,
                            documento: participante.documento,
                        },
                    });
                    if (porDocumento) {
                        existe = true;
                    }
                }
                if (!existe) {
                    const porHash = await this.prisma.listaParticipantesUE.findFirst({
                        where: {
                            tallerId: dto.tallerId,
                        },
                    });
                }
                if (existe) {
                    resultados.duplicados++;
                    continue;
                }
                await this.prisma.listaParticipantesUE.create({
                    data: {
                        unidadEducativaId,
                        tallerId: dto.tallerId,
                        nombre: participante.nombre.trim(),
                        documento: participante.documento?.trim() || null,
                        email: participante.email?.trim() || null,
                        telefono: participante.telefono?.trim() || null,
                        genero: participante.genero?.trim() || null,
                        fechaNac: participante.fechaNac ? new Date(participante.fechaNac) : null,
                        estado: 'PENDIENTE',
                    },
                });
                resultados.creados++;
            }
            catch (error) {
                resultados.errores.push({
                    fila: i + 1,
                    error: error instanceof Error ? error.message : 'Error desconocido',
                });
            }
        }
        return resultados;
    }
    generarDedupeHash(participante) {
        const datos = [
            participante.nombre?.toLowerCase().trim(),
            participante.documento?.trim(),
            participante.email?.toLowerCase().trim(),
        ]
            .filter(Boolean)
            .join('|');
        return (0, crypto_1.createHash)('sha256').update(datos).digest('hex');
    }
    async obtenerListaParticipantes(tallerId) {
        const taller = await this.prisma.taller.findUnique({
            where: { id: tallerId },
        });
        if (!taller) {
            throw new common_1.NotFoundException('Taller no encontrado');
        }
        if (taller.tipo !== 'UNIDAD_EDUCATIVA') {
            throw new common_1.BadRequestException('Este taller no es de tipo UNIDAD_EDUCATIVA');
        }
        return this.prisma.listaParticipantesUE.findMany({
            where: { tallerId },
            orderBy: { nombre: 'asc' },
        });
    }
    async eliminarParticipante(id) {
        const participante = await this.prisma.listaParticipantesUE.findUnique({
            where: { id },
        });
        if (!participante) {
            throw new common_1.NotFoundException('Participante no encontrado');
        }
        return this.prisma.listaParticipantesUE.delete({
            where: { id },
        });
    }
};
exports.ImportacionesService = ImportacionesService;
exports.ImportacionesService = ImportacionesService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], ImportacionesService);
//# sourceMappingURL=importaciones.service.js.map