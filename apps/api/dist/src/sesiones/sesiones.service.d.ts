import { PrismaService } from '../../prisma/prisma.service';
import { CreateSesionDto } from './dto/create-sesion.dto';
import { CreateSesionesRecurrentesDto } from './dto/create-sesiones-recurrentes.dto';
import { UpdateSesionDto } from './dto/update-sesion.dto';
import { GenerarQRDto } from './dto/generar-qr.dto';
import { ValidarQRDto } from './dto/validar-qr.dto';
import { NotificacionesService } from '../notificaciones/notificaciones.service';
export declare class SesionesService {
    private readonly prisma;
    private readonly notificacionesService;
    constructor(prisma: PrismaService, notificacionesService: NotificacionesService);
    private getLocalIP;
    private getFrontendUrl;
    private validarHoras;
    create(dto: CreateSesionDto): Promise<{
        id: string;
        creadoEn: Date;
        actualizadoEn: Date;
        tallerId: string;
        fecha: Date;
        horaInicio: Date | null;
        horaFin: Date | null;
        responsableId: string | null;
        salaId: string | null;
        codigoQR: string | null;
        codigoQRExpiracion: Date | null;
        recurrente: boolean;
        patronRecurrencia: string | null;
    }>;
    createRecurrente(dto: CreateSesionesRecurrentesDto): Promise<{
        total: number;
        sesiones: any[];
    }>;
    findAll(params?: {
        tallerId?: string;
        page?: number;
        pageSize?: number;
    }): Promise<{
        page: number;
        pageSize: number;
        total: number;
        items: ({
            taller: {
                id: string;
                estado: string | null;
                creadoEn: Date;
                actualizadoEn: Date;
                tema: string;
                modalidad: string;
                cupos: number | null;
                fechaInicio: Date | null;
                fechaFin: Date | null;
                sede: string | null;
                tipo: string | null;
                capacidades: string | null;
                trainerId: string;
                directorId: string | null;
                unidadEducativaId: string | null;
                estadoAprobacion: string | null;
            };
            sala: {
                id: string;
                nombre: string;
                creadoEn: Date;
                actualizadoEn: Date;
                sede: string;
                capacidad: number;
                equipamiento: string | null;
                descripcion: string | null;
                activa: boolean;
            } | null;
            responsable: {
                id: string;
                nombre: string;
                email: string;
                passwordHash: string;
                estado: string | null;
                creadoEn: Date;
                actualizadoEn: Date;
            } | null;
        } & {
            id: string;
            creadoEn: Date;
            actualizadoEn: Date;
            tallerId: string;
            fecha: Date;
            horaInicio: Date | null;
            horaFin: Date | null;
            responsableId: string | null;
            salaId: string | null;
            codigoQR: string | null;
            codigoQRExpiracion: Date | null;
            recurrente: boolean;
            patronRecurrencia: string | null;
        })[];
    }>;
    findOne(id: string): Promise<{
        taller: {
            id: string;
            estado: string | null;
            creadoEn: Date;
            actualizadoEn: Date;
            tema: string;
            modalidad: string;
            cupos: number | null;
            fechaInicio: Date | null;
            fechaFin: Date | null;
            sede: string | null;
            tipo: string | null;
            capacidades: string | null;
            trainerId: string;
            directorId: string | null;
            unidadEducativaId: string | null;
            estadoAprobacion: string | null;
        };
        sala: {
            id: string;
            nombre: string;
            creadoEn: Date;
            actualizadoEn: Date;
            sede: string;
            capacidad: number;
            equipamiento: string | null;
            descripcion: string | null;
            activa: boolean;
        } | null;
        asistencias: ({
            participante: {
                usuario: {
                    id: string;
                    nombre: string;
                    email: string;
                    passwordHash: string;
                    estado: string | null;
                    creadoEn: Date;
                    actualizadoEn: Date;
                };
            } & {
                id: string;
                creadoEn: Date;
                actualizadoEn: Date;
                usuarioId: string;
                documento: string | null;
                telefono: string | null;
                genero: string | null;
                fechaNac: Date | null;
            };
        } & {
            id: string;
            estado: string | null;
            creadoEn: Date;
            actualizadoEn: Date;
            participanteId: string;
            tomadoEn: Date | null;
            sesionId: string;
        })[];
        responsable: {
            id: string;
            nombre: string;
            email: string;
            passwordHash: string;
            estado: string | null;
            creadoEn: Date;
            actualizadoEn: Date;
        } | null;
    } & {
        id: string;
        creadoEn: Date;
        actualizadoEn: Date;
        tallerId: string;
        fecha: Date;
        horaInicio: Date | null;
        horaFin: Date | null;
        responsableId: string | null;
        salaId: string | null;
        codigoQR: string | null;
        codigoQRExpiracion: Date | null;
        recurrente: boolean;
        patronRecurrencia: string | null;
    }>;
    findByParticipante(participanteId: string): Promise<({
        taller: {
            id: string;
            estado: string | null;
            creadoEn: Date;
            actualizadoEn: Date;
            tema: string;
            modalidad: string;
            cupos: number | null;
            fechaInicio: Date | null;
            fechaFin: Date | null;
            sede: string | null;
            tipo: string | null;
            capacidades: string | null;
            trainerId: string;
            directorId: string | null;
            unidadEducativaId: string | null;
            estadoAprobacion: string | null;
        };
        responsable: {
            id: string;
            nombre: string;
            email: string;
            passwordHash: string;
            estado: string | null;
            creadoEn: Date;
            actualizadoEn: Date;
        } | null;
    } & {
        id: string;
        creadoEn: Date;
        actualizadoEn: Date;
        tallerId: string;
        fecha: Date;
        horaInicio: Date | null;
        horaFin: Date | null;
        responsableId: string | null;
        salaId: string | null;
        codigoQR: string | null;
        codigoQRExpiracion: Date | null;
        recurrente: boolean;
        patronRecurrencia: string | null;
    })[]>;
    update(id: string, dto: UpdateSesionDto): Promise<{
        taller: {
            id: string;
            estado: string | null;
            creadoEn: Date;
            actualizadoEn: Date;
            tema: string;
            modalidad: string;
            cupos: number | null;
            fechaInicio: Date | null;
            fechaFin: Date | null;
            sede: string | null;
            tipo: string | null;
            capacidades: string | null;
            trainerId: string;
            directorId: string | null;
            unidadEducativaId: string | null;
            estadoAprobacion: string | null;
        };
        sala: {
            id: string;
            nombre: string;
            creadoEn: Date;
            actualizadoEn: Date;
            sede: string;
            capacidad: number;
            equipamiento: string | null;
            descripcion: string | null;
            activa: boolean;
        } | null;
        responsable: {
            id: string;
            nombre: string;
            email: string;
            passwordHash: string;
            estado: string | null;
            creadoEn: Date;
            actualizadoEn: Date;
        } | null;
    } & {
        id: string;
        creadoEn: Date;
        actualizadoEn: Date;
        tallerId: string;
        fecha: Date;
        horaInicio: Date | null;
        horaFin: Date | null;
        responsableId: string | null;
        salaId: string | null;
        codigoQR: string | null;
        codigoQRExpiracion: Date | null;
        recurrente: boolean;
        patronRecurrencia: string | null;
    }>;
    remove(id: string): Promise<{
        id: string;
        creadoEn: Date;
        actualizadoEn: Date;
        tallerId: string;
        fecha: Date;
        horaInicio: Date | null;
        horaFin: Date | null;
        responsableId: string | null;
        salaId: string | null;
        codigoQR: string | null;
        codigoQRExpiracion: Date | null;
        recurrente: boolean;
        patronRecurrencia: string | null;
    }>;
    generarQR(dto: GenerarQRDto): Promise<{
        sesionId: string;
        codigoQR: string;
        qrUrl: string;
        qrImage: string;
        expiracion: string;
        duracionMinutos: number;
    }>;
    validarQR(dto: ValidarQRDto): Promise<{
        sesionId: string;
        taller: {
            id: string;
            tema: string;
            modalidad: string;
            fechaInicio: Date | null;
            fechaFin: Date | null;
        };
        fecha: Date;
        horaInicio: Date | null;
        horaFin: Date | null;
        valido: boolean;
    }>;
    regenerarQR(sesionId: string, duracionMinutos?: number): Promise<{
        sesionId: string;
        codigoQR: string;
        qrUrl: string;
        qrImage: string;
        expiracion: string;
        duracionMinutos: number;
    }>;
    invalidarQR(sesionId: string): Promise<{
        id: string;
        creadoEn: Date;
        actualizadoEn: Date;
        tallerId: string;
        fecha: Date;
        horaInicio: Date | null;
        horaFin: Date | null;
        responsableId: string | null;
        salaId: string | null;
        codigoQR: string | null;
        codigoQRExpiracion: Date | null;
        recurrente: boolean;
        patronRecurrencia: string | null;
    }>;
}
