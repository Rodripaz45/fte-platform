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
exports.NotificacionesService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../../prisma/prisma.service");
const create_notificacion_dto_1 = require("./dto/create-notificacion.dto");
let NotificacionesService = class NotificacionesService {
    prisma;
    constructor(prisma) {
        this.prisma = prisma;
    }
    async create(dto) {
        return this.prisma.notificacion.create({
            data: {
                usuarioId: dto.usuarioId,
                canal: dto.canal || create_notificacion_dto_1.CanalNotificacion.WEB,
                tipo: dto.tipo || create_notificacion_dto_1.TipoNotificacion.OTRO,
                estado: dto.estado || create_notificacion_dto_1.EstadoNotificacion.PENDIENTE,
                titulo: dto.titulo,
                mensaje: dto.mensaje,
            },
            include: {
                usuario: {
                    select: {
                        id: true,
                        nombre: true,
                        email: true,
                    },
                },
            },
        });
    }
    async findByUsuario(usuarioId, options) {
        const where = { usuarioId };
        if (options?.soloNoLeidas) {
            where.estado = { not: create_notificacion_dto_1.EstadoNotificacion.LEIDA };
        }
        return this.prisma.notificacion.findMany({
            where,
            include: {
                usuario: {
                    select: {
                        id: true,
                        nombre: true,
                        email: true,
                    },
                },
            },
            orderBy: { creadoEn: 'desc' },
            take: options?.limit || 50,
        });
    }
    async findOne(id) {
        const notificacion = await this.prisma.notificacion.findUnique({
            where: { id },
            include: {
                usuario: {
                    select: {
                        id: true,
                        nombre: true,
                        email: true,
                    },
                },
            },
        });
        if (!notificacion) {
            throw new common_1.NotFoundException('Notificación no encontrada');
        }
        return notificacion;
    }
    async update(id, dto) {
        await this.findOne(id);
        return this.prisma.notificacion.update({
            where: { id },
            data: dto,
            include: {
                usuario: {
                    select: {
                        id: true,
                        nombre: true,
                        email: true,
                    },
                },
            },
        });
    }
    async marcarComoLeida(id) {
        return this.update(id, { estado: create_notificacion_dto_1.EstadoNotificacion.LEIDA });
    }
    async marcarTodasComoLeidas(usuarioId) {
        return this.prisma.notificacion.updateMany({
            where: {
                usuarioId,
                estado: { not: create_notificacion_dto_1.EstadoNotificacion.LEIDA },
            },
            data: {
                estado: create_notificacion_dto_1.EstadoNotificacion.LEIDA,
            },
        });
    }
    async countNoLeidas(usuarioId) {
        return this.prisma.notificacion.count({
            where: {
                usuarioId,
                estado: { not: create_notificacion_dto_1.EstadoNotificacion.LEIDA },
            },
        });
    }
    async remove(id) {
        await this.findOne(id);
        return this.prisma.notificacion.delete({ where: { id } });
    }
    async crearRecordatorioSesion(usuarioId, sesionId, fechaSesion, temaTaller) {
        const horasAntes = 24;
        const fechaRecordatorio = new Date(fechaSesion);
        fechaRecordatorio.setHours(fechaRecordatorio.getHours() - horasAntes);
        return this.create({
            usuarioId,
            canal: create_notificacion_dto_1.CanalNotificacion.WEB,
            tipo: create_notificacion_dto_1.TipoNotificacion.RECORDATORIO_SESION,
            estado: create_notificacion_dto_1.EstadoNotificacion.PENDIENTE,
            titulo: 'Recordatorio de Sesión',
            mensaje: `Tienes una sesión del taller "${temaTaller}" en ${horasAntes} horas (${fechaSesion.toLocaleString('es-ES')})`,
        });
    }
    async crearConfirmacionInscripcion(usuarioId, temaTaller, fechaInicio) {
        return this.create({
            usuarioId,
            canal: create_notificacion_dto_1.CanalNotificacion.WEB,
            tipo: create_notificacion_dto_1.TipoNotificacion.CONFIRMACION_INSCRIPCION,
            estado: create_notificacion_dto_1.EstadoNotificacion.PENDIENTE,
            titulo: 'Inscripción Confirmada',
            mensaje: `Te has inscrito exitosamente al taller "${temaTaller}"${fechaInicio ? ` que inicia el ${fechaInicio.toLocaleDateString('es-ES')}` : ''}`,
        });
    }
    async crearNotificacionNuevoTaller(usuarioId, temaTaller) {
        return this.create({
            usuarioId,
            canal: create_notificacion_dto_1.CanalNotificacion.WEB,
            tipo: create_notificacion_dto_1.TipoNotificacion.NUEVO_TALLER,
            estado: create_notificacion_dto_1.EstadoNotificacion.PENDIENTE,
            titulo: 'Nuevo Taller Disponible',
            mensaje: `Hay un nuevo taller disponible: "${temaTaller}". ¡Inscríbete ahora!`,
        });
    }
};
exports.NotificacionesService = NotificacionesService;
exports.NotificacionesService = NotificacionesService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], NotificacionesService);
//# sourceMappingURL=notificaciones.service.js.map