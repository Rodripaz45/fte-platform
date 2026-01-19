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
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.SesionesService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../../prisma/prisma.service");
const notificaciones_service_1 = require("../notificaciones/notificaciones.service");
const qrcode_1 = __importDefault(require("qrcode"));
const crypto_1 = require("crypto");
const os_1 = require("os");
let SesionesService = class SesionesService {
    prisma;
    notificacionesService;
    constructor(prisma, notificacionesService) {
        this.prisma = prisma;
        this.notificacionesService = notificacionesService;
    }
    getLocalIP() {
        if (process.env.LOCAL_IP) {
            return process.env.LOCAL_IP;
        }
        const nets = (0, os_1.networkInterfaces)();
        const addresses = [];
        for (const name of Object.keys(nets)) {
            for (const net of nets[name] || []) {
                const family = net.family;
                const isIPv4 = family === 'IPv4' || family === 4;
                if (isIPv4 && !net.internal) {
                    addresses.push(net.address);
                }
            }
        }
        return addresses[0] || 'localhost';
    }
    getFrontendUrl() {
        if (process.env.FRONTEND_URL) {
            return process.env.FRONTEND_URL;
        }
        const localIP = this.getLocalIP();
        const frontendPort = process.env.FRONTEND_PORT || '3000';
        const protocol = process.env.FRONTEND_PROTOCOL || 'http';
        return `${protocol}://${localIP}:${frontendPort}`;
    }
    validarHoras(horaInicio, horaFin) {
        if (horaInicio && horaFin && new Date(horaInicio) >= new Date(horaFin)) {
            throw new common_1.BadRequestException('La hora de inicio debe ser anterior a la hora de fin');
        }
    }
    async create(dto) {
        const taller = await this.prisma.taller.findUnique({
            where: { id: dto.tallerId },
            include: { inscripciones: { include: { participante: { include: { usuario: true } } } } },
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
        let reservaSalaId = null;
        if (dto.salaId) {
            const sala = await this.prisma.sala.findUnique({
                where: { id: dto.salaId },
            });
            if (!sala) {
                throw new common_1.NotFoundException('Sala no encontrada');
            }
            if (!sala.activa) {
                throw new common_1.BadRequestException('La sala no está activa');
            }
            let fechaInicio;
            let fechaFin;
            if (dto.horaInicio && dto.horaFin) {
                fechaInicio = new Date(dto.horaInicio);
                fechaFin = new Date(dto.horaFin);
            }
            else if (dto.horaInicio) {
                fechaInicio = new Date(dto.horaInicio);
                fechaFin = new Date(fechaInicio.getTime() + 2 * 60 * 60 * 1000);
            }
            else {
                fechaInicio = new Date(dto.fecha);
                fechaFin = new Date(fechaInicio.getTime() + 2 * 60 * 60 * 1000);
            }
            const conflictos = await this.prisma.reservaSala.findMany({
                where: {
                    salaId: dto.salaId,
                    estado: { in: ['RESERVADA', 'CONFIRMADA'] },
                    OR: [
                        {
                            fechaInicio: { lte: fechaInicio },
                            fechaFin: { gte: fechaInicio },
                        },
                        {
                            fechaInicio: { lte: fechaFin },
                            fechaFin: { gte: fechaFin },
                        },
                        {
                            fechaInicio: { gte: fechaInicio },
                            fechaFin: { lte: fechaFin },
                        },
                    ],
                },
            });
            if (conflictos.length > 0) {
                throw new common_1.BadRequestException({
                    message: 'La sala no está disponible en ese horario',
                    conflictos: conflictos.map((c) => ({
                        fechaInicio: c.fechaInicio,
                        fechaFin: c.fechaFin,
                        motivo: c.motivo,
                    })),
                });
            }
            const reserva = await this.prisma.reservaSala.create({
                data: {
                    salaId: dto.salaId,
                    fechaInicio: fechaInicio,
                    fechaFin: fechaFin,
                    estado: 'RESERVADA',
                },
            });
            reservaSalaId = reserva.id;
        }
        const fechaSesion = new Date(dto.fecha);
        const sesion = await this.prisma.sesion.create({
            data: {
                tallerId: dto.tallerId,
                fecha: fechaSesion,
                horaInicio: dto.horaInicio ? new Date(dto.horaInicio) : null,
                horaFin: dto.horaFin ? new Date(dto.horaFin) : null,
                responsableId: dto.responsableId ?? null,
                salaId: dto.salaId ?? null,
            },
        });
        if (reservaSalaId) {
            await this.prisma.reservaSala.update({
                where: { id: reservaSalaId },
                data: { sesionId: sesion.id },
            });
        }
        try {
            const inscripcionesActivas = taller.inscripciones.filter(ins => ins.estado === 'INSCRITO' || ins.estado === 'FINALIZADO');
            console.log(`[SesionesService] Creando notificaciones para ${inscripcionesActivas.length} participantes inscritos en el taller "${taller.tema}"`);
            if (inscripcionesActivas.length > 0) {
                const notificacionesPromesas = inscripcionesActivas.map(inscripcion => this.notificacionesService.crearRecordatorioSesion(inscripcion.participante.usuario.id, sesion.id, fechaSesion, taller.tema)
                    .then(() => {
                    console.log(`[SesionesService] Notificación creada para ${inscripcion.participante.usuario.email}`);
                    return true;
                })
                    .catch(err => {
                    console.error(`[SesionesService] Error notificando a ${inscripcion.participante.usuario.email}:`, err);
                    return false;
                }));
                const resultados = await Promise.all(notificacionesPromesas);
                const exitosas = resultados.filter(r => r === true).length;
                console.log(`[SesionesService] Notificaciones creadas: ${exitosas}/${inscripcionesActivas.length} exitosas`);
            }
            else {
                console.log(`[SesionesService] No hay participantes inscritos para notificar`);
            }
        }
        catch (error) {
            console.error('[SesionesService] Error creando notificaciones de sesión:', error);
        }
        return sesion;
    }
    async createRecurrente(dto) {
        const fechaInicio = new Date(dto.fechaInicio);
        const fechaFin = new Date(dto.fechaFin);
        if (fechaFin < fechaInicio) {
            throw new common_1.BadRequestException('La fecha fin debe ser mayor o igual a la fecha inicio');
        }
        const diasMap = {
            LUNES: 1,
            MARTES: 2,
            MIERCOLES: 3,
            JUEVES: 4,
            VIERNES: 5,
            SABADO: 6,
            DOMINGO: 0,
        };
        const diasSeleccionados = dto.diasSemana
            .map((d) => d.toUpperCase())
            .filter((d) => diasMap[d] !== undefined);
        if (diasSeleccionados.length === 0) {
            throw new common_1.BadRequestException('Debes seleccionar al menos un día de la semana válido');
        }
        const combineDateAndTime = (base, time) => {
            if (!time)
                return undefined;
            const t = new Date(time);
            const result = new Date(base);
            result.setHours(t.getHours(), t.getMinutes(), t.getSeconds(), t.getMilliseconds());
            return result;
        };
        const fechasObjetivo = [];
        for (let cursor = new Date(fechaInicio.getFullYear(), fechaInicio.getMonth(), fechaInicio.getDate()); cursor <= fechaFin; cursor.setDate(cursor.getDate() + 1)) {
            const day = cursor.getDay();
            if (diasSeleccionados.some((d) => diasMap[d] === day)) {
                fechasObjetivo.push(new Date(cursor));
            }
        }
        if (fechasObjetivo.length === 0) {
            throw new common_1.BadRequestException('No hay días dentro del rango que coincidan con los seleccionados');
        }
        const creadas = [];
        for (const fecha of fechasObjetivo) {
            const createDto = {
                tallerId: dto.tallerId,
                fecha,
                horaInicio: combineDateAndTime(fecha, dto.horaInicio),
                horaFin: combineDateAndTime(fecha, dto.horaFin),
                responsableId: dto.responsableId,
                salaId: dto.salaId,
            };
            const sesion = await this.create(createDto);
            creadas.push(sesion);
        }
        return {
            total: creadas.length,
            sesiones: creadas,
        };
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
                    sala: true,
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
                sala: true,
                asistencias: {
                    include: { participante: { include: { usuario: true } } },
                },
            },
        });
        if (!sesion)
            throw new common_1.NotFoundException('Sesión no encontrada');
        return sesion;
    }
    async findByParticipante(participanteId) {
        const inscripciones = await this.prisma.inscripcion.findMany({
            where: {
                participanteId,
                estado: {
                    in: ['INSCRITO', 'FINALIZADO']
                }
            },
            select: { tallerId: true },
        });
        if (inscripciones.length === 0) {
            return [];
        }
        const tallerIds = inscripciones.map(ins => ins.tallerId);
        const sesiones = await this.prisma.sesion.findMany({
            where: {
                tallerId: {
                    in: tallerIds,
                },
            },
            include: {
                taller: true,
                responsable: true,
            },
            orderBy: [
                { fecha: 'desc' },
                { horaInicio: 'asc' },
            ],
        });
        return sesiones;
    }
    async update(id, dto) {
        const sesion = await this.findOne(id);
        this.validarHoras(dto.horaInicio, dto.horaFin);
        if (dto.responsableId) {
            const existe = await this.prisma.usuario.findUnique({
                where: { id: dto.responsableId },
                select: { id: true },
            });
            if (!existe)
                throw new common_1.NotFoundException('Usuario responsable no encontrado');
        }
        if (dto.salaId !== undefined || dto.fecha || dto.horaInicio || dto.horaFin) {
            const nuevaSalaId = dto.salaId !== undefined ? dto.salaId : sesion.salaId;
            const nuevaFecha = dto.fecha ? new Date(dto.fecha) : sesion.fecha;
            const nuevoHoraInicio = dto.horaInicio
                ? new Date(dto.horaInicio)
                : sesion.horaInicio || nuevaFecha;
            const nuevoHoraFin = dto.horaFin
                ? new Date(dto.horaFin)
                : sesion.horaFin || nuevaFecha;
            if (nuevaSalaId) {
                const conflictos = await this.prisma.reservaSala.findMany({
                    where: {
                        salaId: nuevaSalaId,
                        estado: { in: ['RESERVADA', 'CONFIRMADA'] },
                        sesionId: { not: id },
                        OR: [
                            {
                                fechaInicio: { lte: nuevoHoraInicio },
                                fechaFin: { gte: nuevoHoraInicio },
                            },
                            {
                                fechaInicio: { lte: nuevoHoraFin },
                                fechaFin: { gte: nuevoHoraFin },
                            },
                            {
                                fechaInicio: { gte: nuevoHoraInicio },
                                fechaFin: { lte: nuevoHoraFin },
                            },
                        ],
                    },
                });
                if (conflictos.length > 0) {
                    throw new common_1.BadRequestException({
                        message: 'La sala no está disponible en ese horario',
                        conflictos: conflictos.map((c) => ({
                            fechaInicio: c.fechaInicio,
                            fechaFin: c.fechaFin,
                            motivo: c.motivo,
                        })),
                    });
                }
                const reservaExistente = await this.prisma.reservaSala.findFirst({
                    where: { sesionId: id },
                });
                if (reservaExistente) {
                    await this.prisma.reservaSala.update({
                        where: { id: reservaExistente.id },
                        data: {
                            salaId: nuevaSalaId,
                            fechaInicio: nuevoHoraInicio,
                            fechaFin: nuevoHoraFin,
                        },
                    });
                }
                else if (nuevaSalaId) {
                    await this.prisma.reservaSala.create({
                        data: {
                            salaId: nuevaSalaId,
                            sesionId: id,
                            fechaInicio: nuevoHoraInicio,
                            fechaFin: nuevoHoraFin,
                            estado: 'RESERVADA',
                        },
                    });
                }
            }
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
                ...(dto.salaId !== undefined ? { salaId: dto.salaId ?? null } : {}),
            },
            include: { taller: true, responsable: true, sala: true },
        });
    }
    async remove(id) {
        await this.findOne(id);
        return this.prisma.sesion.delete({ where: { id } });
    }
    async generarQR(dto) {
        const sesion = await this.prisma.sesion.findUnique({
            where: { id: dto.sesionId },
            include: { taller: true },
        });
        if (!sesion) {
            throw new common_1.NotFoundException('Sesión no encontrada');
        }
        const codigoQR = (0, crypto_1.randomBytes)(16).toString('hex');
        const duracionMinutos = dto.duracionMinutos || 60;
        const expiracion = new Date();
        expiracion.setMinutes(expiracion.getMinutes() + duracionMinutos);
        await this.prisma.sesion.update({
            where: { id: dto.sesionId },
            data: {
                codigoQR,
                codigoQRExpiracion: expiracion,
            },
        });
        const frontendUrl = this.getFrontendUrl();
        const qrUrl = `${frontendUrl}/asistencia/qr/${codigoQR}`;
        const qrDataURL = await qrcode_1.default.toDataURL(qrUrl, {
            errorCorrectionLevel: 'M',
            type: 'image/png',
            width: 300,
            margin: 1,
        });
        return {
            sesionId: sesion.id,
            codigoQR,
            qrUrl,
            qrImage: qrDataURL,
            expiracion: expiracion.toISOString(),
            duracionMinutos,
        };
    }
    async validarQR(dto) {
        const sesion = await this.prisma.sesion.findFirst({
            where: { codigoQR: dto.codigoQR },
            include: {
                taller: {
                    select: {
                        id: true,
                        tema: true,
                        modalidad: true,
                        fechaInicio: true,
                        fechaFin: true,
                    },
                },
            },
        });
        if (!sesion) {
            throw new common_1.NotFoundException('Código QR no válido');
        }
        if (sesion.codigoQRExpiracion && new Date() > sesion.codigoQRExpiracion) {
            throw new common_1.BadRequestException('El código QR ha expirado');
        }
        return {
            sesionId: sesion.id,
            taller: sesion.taller,
            fecha: sesion.fecha,
            horaInicio: sesion.horaInicio,
            horaFin: sesion.horaFin,
            valido: true,
        };
    }
    async regenerarQR(sesionId, duracionMinutos) {
        return this.generarQR({ sesionId, duracionMinutos });
    }
    async invalidarQR(sesionId) {
        const sesion = await this.prisma.sesion.findUnique({
            where: { id: sesionId },
        });
        if (!sesion) {
            throw new common_1.NotFoundException('Sesión no encontrada');
        }
        return this.prisma.sesion.update({
            where: { id: sesionId },
            data: {
                codigoQR: null,
                codigoQRExpiracion: null,
            },
        });
    }
};
exports.SesionesService = SesionesService;
exports.SesionesService = SesionesService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService,
        notificaciones_service_1.NotificacionesService])
], SesionesService);
//# sourceMappingURL=sesiones.service.js.map