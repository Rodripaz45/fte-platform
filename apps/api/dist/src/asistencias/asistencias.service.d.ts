import { PrismaService } from '../../prisma/prisma.service';
import { TomarAsistenciaDto } from './dto/tomar-asistencia.dto';
import { CreateAsistenciaDto } from './dto/create-asistencia.dto';
import { UpdateAsistenciaDto } from './dto/update-asistencia.dto';
import { RegistrarAsistenciaQRDto } from './dto/registrar-asistencia-qr.dto';
import { TomarAsistenciaUEDto } from './dto/tomar-asistencia-ue.dto';
import { CreateEvidenciaDto } from './dto/create-evidencia.dto';
import { SesionesService } from '../sesiones/sesiones.service';
export declare class AsistenciasService {
    private readonly prisma;
    private readonly sesionesService;
    constructor(prisma: PrismaService, sesionesService: SesionesService);
    private validarSesionYRelacion;
    create(dto: CreateAsistenciaDto): Promise<{
        participante: {
            usuario: {
                id: string;
                email: string;
                nombre: string;
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
        sesionId: string;
        tomadoEn: Date | null;
    }>;
    tomar(dto: TomarAsistenciaDto): Promise<{
        sesionId: string;
        total: number;
        items: {
            id: string;
            estado: string | null;
            creadoEn: Date;
            actualizadoEn: Date;
            participanteId: string;
            sesionId: string;
            tomadoEn: Date | null;
        }[];
    }>;
    findAll(params?: {
        sesionId?: string;
    }): Promise<({
        participante: {
            usuario: {
                id: string;
                email: string;
                nombre: string;
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
        sesion: {
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
                trainerId: string;
                unidadEducativaId: string | null;
            };
            responsable: {
                id: string;
                email: string;
                nombre: string;
                passwordHash: string;
                estado: string | null;
                creadoEn: Date;
                actualizadoEn: Date;
            } | null;
        } & {
            id: string;
            creadoEn: Date;
            actualizadoEn: Date;
            fecha: Date;
            horaInicio: Date | null;
            horaFin: Date | null;
            codigoQR: string | null;
            codigoQRExpiracion: Date | null;
            tallerId: string;
            responsableId: string | null;
        };
    } & {
        id: string;
        estado: string | null;
        creadoEn: Date;
        actualizadoEn: Date;
        participanteId: string;
        sesionId: string;
        tomadoEn: Date | null;
    })[]>;
    findOne(id: string): Promise<{
        participante: {
            usuario: {
                id: string;
                email: string;
                nombre: string;
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
        sesion: {
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
                trainerId: string;
                unidadEducativaId: string | null;
            };
            responsable: {
                id: string;
                email: string;
                nombre: string;
                passwordHash: string;
                estado: string | null;
                creadoEn: Date;
                actualizadoEn: Date;
            } | null;
        } & {
            id: string;
            creadoEn: Date;
            actualizadoEn: Date;
            fecha: Date;
            horaInicio: Date | null;
            horaFin: Date | null;
            codigoQR: string | null;
            codigoQRExpiracion: Date | null;
            tallerId: string;
            responsableId: string | null;
        };
    } & {
        id: string;
        estado: string | null;
        creadoEn: Date;
        actualizadoEn: Date;
        participanteId: string;
        sesionId: string;
        tomadoEn: Date | null;
    }>;
    update(id: string, dto: UpdateAsistenciaDto): Promise<{
        id: string;
        estado: string | null;
        creadoEn: Date;
        actualizadoEn: Date;
        participanteId: string;
        sesionId: string;
        tomadoEn: Date | null;
    }>;
    remove(id: string): Promise<{
        id: string;
        estado: string | null;
        creadoEn: Date;
        actualizadoEn: Date;
        participanteId: string;
        sesionId: string;
        tomadoEn: Date | null;
    }>;
    resumenPorSesion(sesionId: string): Promise<{
        sesionId: string;
        presentes: number;
        ausentes: number;
        tarde: number;
        total: number;
    }>;
    registrarAsistenciaPorQR(dto: RegistrarAsistenciaQRDto, participanteId: string): Promise<{
        participante: {
            usuario: {
                id: string;
                email: string;
                nombre: string;
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
        sesion: {
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
                trainerId: string;
                unidadEducativaId: string | null;
            };
        } & {
            id: string;
            creadoEn: Date;
            actualizadoEn: Date;
            fecha: Date;
            horaInicio: Date | null;
            horaFin: Date | null;
            codigoQR: string | null;
            codigoQRExpiracion: Date | null;
            tallerId: string;
            responsableId: string | null;
        };
    } & {
        id: string;
        estado: string | null;
        creadoEn: Date;
        actualizadoEn: Date;
        participanteId: string;
        sesionId: string;
        tomadoEn: Date | null;
    }>;
    tomarAsistenciaUE(dto: TomarAsistenciaUEDto): Promise<{
        sesionId: string;
        total: number;
        items: ({
            listaParticipante: {
                id: string;
                email: string | null;
                nombre: string;
                estado: string | null;
                creadoEn: Date;
                actualizadoEn: Date;
                documento: string | null;
                telefono: string | null;
                genero: string | null;
                fechaNac: Date | null;
                unidadEducativaId: string;
                tallerId: string;
                observaciones: string | null;
            };
        } & {
            id: string;
            estado: string | null;
            creadoEn: Date;
            actualizadoEn: Date;
            sesionId: string;
            tomadoEn: Date | null;
            observaciones: string | null;
            listaParticipanteUEId: string;
        })[];
    }>;
    findAsistenciasUE(sesionId: string): Promise<({
        listaParticipante: {
            unidadEducativa: {
                id: string;
                nombre: string;
            };
        } & {
            id: string;
            email: string | null;
            nombre: string;
            estado: string | null;
            creadoEn: Date;
            actualizadoEn: Date;
            documento: string | null;
            telefono: string | null;
            genero: string | null;
            fechaNac: Date | null;
            unidadEducativaId: string;
            tallerId: string;
            observaciones: string | null;
        };
    } & {
        id: string;
        estado: string | null;
        creadoEn: Date;
        actualizadoEn: Date;
        sesionId: string;
        tomadoEn: Date | null;
        observaciones: string | null;
        listaParticipanteUEId: string;
    })[]>;
    crearEvidencia(dto: CreateEvidenciaDto): Promise<{
        sesion: {
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
                trainerId: string;
                unidadEducativaId: string | null;
            };
        } & {
            id: string;
            creadoEn: Date;
            actualizadoEn: Date;
            fecha: Date;
            horaInicio: Date | null;
            horaFin: Date | null;
            codigoQR: string | null;
            codigoQRExpiracion: Date | null;
            tallerId: string;
            responsableId: string | null;
        };
    } & {
        id: string;
        creadoEn: Date;
        tipo: string | null;
        sesionId: string;
        url: string | null;
    }>;
    obtenerEvidencias(sesionId: string): Promise<{
        id: string;
        creadoEn: Date;
        tipo: string | null;
        sesionId: string;
        url: string | null;
    }[]>;
    eliminarEvidencia(evidenciaId: string): Promise<{
        id: string;
        creadoEn: Date;
        tipo: string | null;
        sesionId: string;
        url: string | null;
    }>;
    resumenAsistenciasUEPorSesion(sesionId: string): Promise<{
        sesionId: string;
        presentes: number;
        ausentes: number;
        justificados: number;
        total: number;
    }>;
}
