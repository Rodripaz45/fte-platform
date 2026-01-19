import { PartialType } from '@nestjs/mapped-types';
import { CreateReservaSalaDto } from './create-reserva-sala.dto';

export class UpdateReservaSalaDto extends PartialType(CreateReservaSalaDto) {}

