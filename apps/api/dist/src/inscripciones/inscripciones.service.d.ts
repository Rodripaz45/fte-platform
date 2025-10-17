import { CreateInscripcioneDto } from './dto/create-inscripcione.dto';
import { UpdateInscripcioneDto } from './dto/update-inscripcione.dto';
export declare class InscripcionesService {
    create(createInscripcioneDto: CreateInscripcioneDto): string;
    findAll(): string;
    findOne(id: number): string;
    update(id: number, updateInscripcioneDto: UpdateInscripcioneDto): string;
    remove(id: number): string;
}
