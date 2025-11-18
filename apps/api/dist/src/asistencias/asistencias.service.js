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
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AsistenciasService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../../prisma/prisma.service");
const sesiones_service_1 = require("../sesiones/sesiones.service");
let AsistenciasService = class AsistenciasService {
    prisma;
    sesionesService;
    constructor(prisma, sesionesService) {
        this.prisma = prisma;
        this.sesionesService = sesionesService;
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
    async registrarAsistenciaPorQR(dto, participanteId) {
        const validacionQR = await this.sesionesService.validarQR({ codigoQR: dto.codigoQR });
        const sesionId = validacionQR.sesionId;
        await this.validarSesionYRelacion({ sesionId, participanteId });
        const asistenciaExistente = await this.prisma.asistencia.findUnique({
            where: {
                sesionId_participanteId: {
                    sesionId,
                    participanteId,
                },
            },
        });
        if (asistenciaExistente) {
            return this.prisma.asistencia.update({
                where: { id: asistenciaExistente.id },
                data: {
                    estado: 'PRESENTE',
                    tomadoEn: new Date(),
                },
                include: {
                    sesion: { include: { taller: true } },
                    participante: { include: { usuario: true } },
                },
            });
        }
        return this.prisma.asistencia.create({
            data: {
                sesionId,
                participanteId,
                estado: 'PRESENTE',
                tomadoEn: new Date(),
            },
            include: {
                sesion: { include: { taller: true } },
                participante: { include: { usuario: true } },
            },
        });
    }
    async tomarAsistenciaUE(dto) {
        if (!dto.items?.length) {
            throw new common_1.BadRequestException('Debe enviar al menos un item de asistencia');
        }
        const sesion = await this.prisma.sesion.findUnique({
            where: { id: dto.sesionId },
            include: {
                taller: {
                    select: {
                        id: true,
                        tipo: true,
                    },
                },
            },
        });
        if (!sesion)
            throw new common_1.NotFoundException('Sesión no encontrada');
        if (sesion.taller.tipo !== 'UNIDAD_EDUCATIVA') {
            throw new common_1.BadRequestException('Este método solo es para talleres de tipo UNIDAD_EDUCATIVA');
        }
        await Promise.all(dto.items.map(async (item) => {
            const participanteUE = await this.prisma.listaParticipantesUE.findUnique({
                where: { id: item.listaParticipanteUEId },
                select: { id: true, tallerId: true },
            });
            if (!participanteUE) {
                throw new common_1.NotFoundException(`Participante UE no encontrado: ${item.listaParticipanteUEId}`);
            }
            if (participanteUE.tallerId !== sesion.tallerId) {
                throw new common_1.BadRequestException(`El participante UE no pertenece al taller de la sesión`);
            }
        }));
        const resultados = await this.prisma.$transaction(dto.items.map((item) => this.prisma.asistenciaUE.upsert({
            where: {
                sesionId_listaParticipanteUEId: {
                    sesionId: dto.sesionId,
                    listaParticipanteUEId: item.listaParticipanteUEId,
                },
            },
            update: {
                estado: item.estado || 'PRESENTE',
                observaciones: item.observaciones,
                tomadoEn: new Date(),
            },
            create: {
                sesionId: dto.sesionId,
                listaParticipanteUEId: item.listaParticipanteUEId,
                estado: item.estado || 'PRESENTE',
                observaciones: item.observaciones,
                tomadoEn: new Date(),
            },
            include: {
                listaParticipante: true,
            },
        })));
        return { sesionId: dto.sesionId, total: resultados.length, items: resultados };
    }
    async findAsistenciasUE(sesionId) {
        return this.prisma.asistenciaUE.findMany({
            where: { sesionId },
            include: {
                listaParticipante: {
                    include: {
                        unidadEducativa: {
                            select: {
                                id: true,
                                nombre: true,
                            },
                        },
                    },
                },
            },
            orderBy: { creadoEn: 'desc' },
        });
    }
    async crearEvidencia(dto) {
        const sesion = await this.prisma.sesion.findUnique({
            where: { id: dto.sesionId },
            select: { id: true },
        });
        if (!sesion) {
            throw new common_1.NotFoundException('Sesión no encontrada');
        }
        return this.prisma.evidenciaAsistencia.create({
            data: {
                sesionId: dto.sesionId,
                tipo: dto.tipo || 'FOTO',
                url: dto.url,
            },
            include: {
                sesion: {
                    include: {
                        taller: true,
                    },
                },
            },
        });
    }
    async obtenerEvidencias(sesionId) {
        const sesion = await this.prisma.sesion.findUnique({
            where: { id: sesionId },
            select: { id: true },
        });
        if (!sesion) {
            throw new common_1.NotFoundException('Sesión no encontrada');
        }
        return this.prisma.evidenciaAsistencia.findMany({
            where: { sesionId },
            orderBy: { creadoEn: 'desc' },
        });
    }
    async eliminarEvidencia(evidenciaId) {
        const evidencia = await this.prisma.evidenciaAsistencia.findUnique({
            where: { id: evidenciaId },
        });
        if (!evidencia) {
            throw new common_1.NotFoundException('Evidencia no encontrada');
        }
        return this.prisma.evidenciaAsistencia.delete({
            where: { id: evidenciaId },
        });
    }
    async resumenAsistenciasUEPorSesion(sesionId) {
        const sesion = await this.prisma.sesion.findUnique({
            where: { id: sesionId },
            include: {
                taller: {
                    select: {
                        tipo: true,
                    },
                },
            },
        });
        if (!sesion)
            throw new common_1.NotFoundException('Sesión no encontrada');
        if (sesion.taller.tipo !== 'UNIDAD_EDUCATIVA') {
            throw new common_1.BadRequestException('Este método solo es para talleres de tipo UNIDAD_EDUCATIVA');
        }
        const [presentes, ausentes, justificados, total] = await Promise.all([
            this.prisma.asistenciaUE.count({ where: { sesionId, estado: 'PRESENTE' } }),
            this.prisma.asistenciaUE.count({ where: { sesionId, estado: 'AUSENTE' } }),
            this.prisma.asistenciaUE.count({ where: { sesionId, estado: 'JUSTIFICADO' } }),
            this.prisma.asistenciaUE.count({ where: { sesionId } }),
        ]);
        return { sesionId, presentes, ausentes, justificados, total };
    }
};
exports.AsistenciasService = AsistenciasService;
exports.AsistenciasService = AsistenciasService = __decorate([
    (0, common_1.Injectable)(),
    __param(1, (0, common_1.Inject)((0, common_1.forwardRef)(() => sesiones_service_1.SesionesService))),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService,
        sesiones_service_1.SesionesService])
], AsistenciasService);
//# sourceMappingURL=asistencias.service.js.map