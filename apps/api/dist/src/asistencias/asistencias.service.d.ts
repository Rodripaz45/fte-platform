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
            tomadoEn: Date | null;
            sesionId: string;
        }[];
    }>;
    findAll(params?: {
        sesionId?: string;
    }): Promise<({
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
            codigoQR: string | null;
            codigoQRExpiracion: Date | null;
        };
    } & {
        id: string;
        estado: string | null;
        creadoEn: Date;
        actualizadoEn: Date;
        participanteId: string;
        tomadoEn: Date | null;
        sesionId: string;
    })[]>;
    findOne(id: string): Promise<{
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
            codigoQR: string | null;
            codigoQRExpiracion: Date | null;
        };
    } & {
        id: string;
        estado: string | null;
        creadoEn: Date;
        actualizadoEn: Date;
        participanteId: string;
        tomadoEn: Date | null;
        sesionId: string;
    }>;
    update(id: string, dto: UpdateAsistenciaDto): Promise<{
        id: string;
        estado: string | null;
        creadoEn: Date;
        actualizadoEn: Date;
        participanteId: string;
        tomadoEn: Date | null;
        sesionId: string;
    }>;
    remove(id: string): Promise<{
        id: string;
        estado: string | null;
        creadoEn: Date;
        actualizadoEn: Date;
        participanteId: string;
        tomadoEn: Date | null;
        sesionId: string;
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
            tallerId: string;
            fecha: Date;
            horaInicio: Date | null;
            horaFin: Date | null;
            responsableId: string | null;
            codigoQR: string | null;
            codigoQRExpiracion: Date | null;
        };
    } & {
        id: string;
        estado: string | null;
        creadoEn: Date;
        actualizadoEn: Date;
        participanteId: string;
        tomadoEn: Date | null;
        sesionId: string;
    }>;
    tomarAsistenciaUE(dto: TomarAsistenciaUEDto): Promise<{
        sesionId: string;
        total: number;
        items: ({
            listaParticipante: {
                id: string;
                nombre: string;
                email: string | null;
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
            tomadoEn: Date | null;
            sesionId: string;
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
            nombre: string;
            email: string | null;
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
        tomadoEn: Date | null;
        sesionId: string;
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
            tallerId: string;
            fecha: Date;
            horaInicio: Date | null;
            horaFin: Date | null;
            responsableId: string | null;
            codigoQR: string | null;
            codigoQRExpiracion: Date | null;
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
