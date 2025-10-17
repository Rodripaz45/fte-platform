import { InscripcionesService } from './inscripciones.service';
import { CreateInscripcioneDto } from './dto/create-inscripcione.dto';
import { UpdateInscripcioneDto } from './dto/update-inscripcione.dto';
export declare class InscripcionesController {
    private readonly inscripcionesService;
    constructor(inscripcionesService: InscripcionesService);
    create(createInscripcioneDto: CreateInscripcioneDto): string;
    findAll(): string;
    findOne(id: string): string;
    update(id: string, updateInscripcioneDto: UpdateInscripcioneDto): string;
    remove(id: string): string;
}
