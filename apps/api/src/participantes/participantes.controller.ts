import { Controller, Get, Post, Body, Patch, Param, Delete } from '@nestjs/common';
import { ParticipantesService } from './participantes.service';
import { CreateParticipanteDto } from './dto/create-participante.dto';
import { UpdateParticipanteDto } from './dto/update-participante.dto';
import { ApiBearerAuth } from '@nestjs/swagger';
import { Roles } from 'src/auth/roles.decorator';

@ApiBearerAuth()
@Controller('participantes')
export class ParticipantesController {
  constructor(private readonly participantesService: ParticipantesService) {}

  @Roles('ADMIN')
  @Post()
  create(@Body() dto: CreateParticipanteDto) {
    return this.participantesService.create(dto);
  }

  @Roles('ADMIN', 'TRAINER')
  @Get()
  findAll() {
    return this.participantesService.findAll();
  }

  @Roles('ADMIN', 'TRAINER')
  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.participantesService.findOne(id);
  }

  @Roles('ADMIN')
  @Patch(':id')
  update(@Param('id') id: string, @Body() dto: UpdateParticipanteDto) {
    return this.participantesService.update(id, dto);
  }

  @Roles('ADMIN')
  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.participantesService.remove(id);
  }
}
