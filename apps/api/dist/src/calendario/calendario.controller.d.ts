import { CalendarioService } from './calendario.service';
import { FiltrosCalendarioDto } from './dto/filtros-calendario.dto';
export declare class CalendarioController {
    private readonly calendarioService;
    constructor(calendarioService: CalendarioService);
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
}
