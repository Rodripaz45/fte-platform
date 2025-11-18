import { PartialType } from '@nestjs/swagger';
import { CreateUnidadEducativaDto } from './create-unidad-educativa.dto';

export class UpdateUnidadEducativaDto extends PartialType(CreateUnidadEducativaDto) {}

