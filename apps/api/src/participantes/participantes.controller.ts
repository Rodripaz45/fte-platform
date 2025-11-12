import { Controller, Get, Post, Body, Patch, Param, Delete, Req } from '@nestjs/common';
import { ParticipantesService } from './participantes.service';
import { CreateParticipanteDto } from './dto/create-participante.dto';
import { UpdateParticipanteDto } from './dto/update-participante.dto';
import { ApiBearerAuth } from '@nestjs/swagger';
import { Roles } from 'src/auth/roles.decorator';
import type { Request as ExpressRequest } from 'express';

@ApiBearerAuth()
@Controller('participantes')
export class ParticipantesController {
  constructor(private readonly participantesService: ParticipantesService) {}

  @Roles('ADMIN')
  @Post()
  create(@Body() dto: CreateParticipanteDto) {
    return this.participantesService.create(dto);
  }

  /**
   * Endpoint para que un PARTICIPANTE cree su propio perfil
   * Solo puede crear su propio perfil (usando su usuarioId del token)
   */
  @Roles('PARTICIPANTE')
  @Post('me')
  async createMyProfile(@Req() req: ExpressRequest, @Body() dto: Omit<CreateParticipanteDto, 'usuarioId'>) {
    type AuthenticatedRequest = ExpressRequest & {
      user: { sub: string; email: string; roles: string[] };
    };
    const { sub: userId } = (req as AuthenticatedRequest).user;
    
    // Usar el usuarioId del token, no del body
    const createDto: CreateParticipanteDto = {
      ...dto,
      usuarioId: userId,
    };
    
    return this.participantesService.create(createDto);
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
