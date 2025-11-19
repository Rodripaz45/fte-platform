import { ImportacionesService } from './importaciones.service';
import { ImportarListaDto } from './dto/importar-lista.dto';
export declare class ImportacionesController {
    private readonly importacionesService;
    constructor(importacionesService: ImportacionesService);
    importarLista(dto: ImportarListaDto): Promise<{
        total: number;
        creados: number;
        duplicados: number;
        errores: {
            fila: number;
            error: string;
        }[];
    }>;
    obtenerLista(tallerId: string): Promise<{
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
    }[]>;
    eliminarParticipante(id: string): Promise<{
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
    }>;
}
