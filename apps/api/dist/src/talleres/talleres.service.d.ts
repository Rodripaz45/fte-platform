import { CreateTallereDto } from './dto/create-tallere.dto';
import { UpdateTallereDto } from './dto/update-tallere.dto';
export declare class TalleresService {
    create(createTallereDto: CreateTallereDto): string;
    findAll(): string;
    findOne(id: number): string;
    update(id: number, updateTallereDto: UpdateTallereDto): string;
    remove(id: number): string;
}
