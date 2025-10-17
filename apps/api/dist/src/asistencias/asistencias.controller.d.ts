import { AsistenciasService } from './asistencias.service';
import { CreateAsistenciaDto } from './dto/create-asistencia.dto';
import { UpdateAsistenciaDto } from './dto/update-asistencia.dto';
export declare class AsistenciasController {
    private readonly asistenciasService;
    constructor(asistenciasService: AsistenciasService);
    create(createAsistenciaDto: CreateAsistenciaDto): string;
    findAll(): string;
    findOne(id: string): string;
    update(id: string, updateAsistenciaDto: UpdateAsistenciaDto): string;
    remove(id: string): string;
}
