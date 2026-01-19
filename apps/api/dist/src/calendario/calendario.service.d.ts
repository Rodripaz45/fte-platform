import { PrismaService } from '../../prisma/prisma.service';
import { FiltrosCalendarioDto } from './dto/filtros-calendario.dto';
export declare class CalendarioService {
    private readonly prisma;
    constructor(prisma: PrismaService);
    obtenerEventos(filtros: FiltrosCalendarioDto): Promise<{
        eventos: any[];
        total: number;
        filtros: FiltrosCalendarioDto;
    }>;
    detectarConflictos(fechaInicio?: string, fechaFin?: string): Promise<{
        conflictos: any[];
        total: number;
        periodo: {
            fechaInicio: Date;
            fechaFin: Date;
        };
    }>;
    private haySolapamiento;
    private haySolapamientoReserva;
    private getColorPorEstado;
}
