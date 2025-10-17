import { TalleresService } from './talleres.service';
import { CreateTallereDto } from './dto/create-tallere.dto';
import { UpdateTallereDto } from './dto/update-tallere.dto';
export declare class TalleresController {
    private readonly talleresService;
    constructor(talleresService: TalleresService);
    create(createTallereDto: CreateTallereDto): string;
    findAll(): string;
    findOne(id: string): string;
    update(id: string, updateTallereDto: UpdateTallereDto): string;
    remove(id: string): string;
}
