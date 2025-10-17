import { CreateAsistenciaDto } from './dto/create-asistencia.dto';
import { UpdateAsistenciaDto } from './dto/update-asistencia.dto';
export declare class AsistenciasService {
    create(createAsistenciaDto: CreateAsistenciaDto): string;
    findAll(): string;
    findOne(id: number): string;
    update(id: number, updateAsistenciaDto: UpdateAsistenciaDto): string;
    remove(id: number): string;
}
