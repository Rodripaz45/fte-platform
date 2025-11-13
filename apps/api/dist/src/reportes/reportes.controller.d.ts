import { ReportesService } from './reportes.service';
import { FiltrosReporteDto } from './dto/filtros-reporte.dto';
import type { Response } from 'express';
export declare class ReportesController {
    private readonly reportesService;
    constructor(reportesService: ReportesService);
    dashboardEjecutivo(filtros: FiltrosReporteDto): Promise<{
        resumen: {
            promedioAsistencia: number;
            promedioSatisfaccion: number;
            tasaRecurrencia: number;
            cobertura: number;
        };
        asistencia: {
            tallerId: string;
            tema: string;
            modalidad: string;
            totalInscripciones: number;
            totalSesiones: number;
            totalAsistencias: number;
            tasaAsistencia: number;
        }[];
        satisfaccion: {
            tallerId: string;
            tema: string;
            modalidad: string;
            totalFeedbacks: number;
            promedioSatisfaccion: number;
            distribucion: {
                puntaje: number;
                cantidad: number;
            }[];
        }[];
        recurrencia: {
            totalParticipantes: number;
            participantesRecurrentes: number;
            participantesUnicos: number;
            tasaRecurrencia: number;
        };
        cobertura: {
            participantesUnicos: number;
        };
        filtros: FiltrosReporteDto;
    }>;
    tasaAsistencia(filtros: FiltrosReporteDto): Promise<{
        tallerId: string;
        tema: string;
        modalidad: string;
        totalInscripciones: number;
        totalSesiones: number;
        totalAsistencias: number;
        tasaAsistencia: number;
    }[]>;
    satisfaccion(filtros: FiltrosReporteDto): Promise<{
        tallerId: string;
        tema: string;
        modalidad: string;
        totalFeedbacks: number;
        promedioSatisfaccion: number;
        distribucion: {
            puntaje: number;
            cantidad: number;
        }[];
    }[]>;
    recurrencia(filtros: FiltrosReporteDto): Promise<{
        totalParticipantes: number;
        participantesRecurrentes: number;
        participantesUnicos: number;
        tasaRecurrencia: number;
    }>;
    cobertura(filtros: FiltrosReporteDto): Promise<{
        participantesUnicos: number;
    }>;
    reporteInscripciones(filtros: FiltrosReporteDto): Promise<({
        participante: {
            usuario: {
                id: string;
                email: string;
                nombre: string;
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
        taller: {
            id: string;
            tema: string;
            modalidad: string;
            fechaInicio: Date | null;
            fechaFin: Date | null;
            sede: string | null;
        };
    } & {
        id: string;
        estado: string | null;
        creadoEn: Date;
        actualizadoEn: Date;
        tallerId: string;
        participanteId: string;
        origen: string | null;
        dedupeHash: string | null;
    })[]>;
    reporteAsistencia(filtros: FiltrosReporteDto): Promise<{
        tallerId: string;
        tema: string;
        modalidad: string;
        sesiones: {
            sesionId: string;
            fecha: Date;
            asistencias: {
                participanteId: string;
                participanteNombre: string;
                participanteEmail: string;
                estado: string | null;
                tomadoEn: Date | null;
            }[];
        }[];
    }[]>;
    reporteSatisfaccion(filtros: FiltrosReporteDto): Promise<{
        tallerId: string;
        tema: string;
        modalidad: string;
        totalFeedbacks: number;
        promedioSatisfaccion: number;
        feedbacks: {
            participanteId: string;
            participanteNombre: string;
            participanteEmail: string;
            puntaje: number | null;
            comentario: string | null;
            creadoEn: Date;
        }[];
    }[]>;
    exportarCSV(filtros: FiltrosReporteDto, tipo: string, res: Response): Promise<Response<any, Record<string, any>> | undefined>;
    private convertirACSV;
}
