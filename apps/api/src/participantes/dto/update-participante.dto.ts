import { PartialType } from '@nestjs/swagger';
import { CreateParticipanteDto } from './create-participante.dto';

export class UpdateParticipanteDto extends PartialType(CreateParticipanteDto) {}
