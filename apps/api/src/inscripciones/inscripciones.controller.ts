import { Controller, Post, Body, Get, Param, Patch, Delete, Req } from '@nestjs/common';
import { InscripcionesService } from './inscripciones.service';
import { CreateInscripcioneDto } from './dto/create-inscripcione.dto';
import { UpdateInscripcioneDto } from './dto/update-inscripcione.dto';
import { ApiBearerAuth } from '@nestjs/swagger';
import { Roles } from 'src/auth/roles.decorator';
import type { Request as ExpressRequest } from 'express';

@ApiBearerAuth()
@Controller('inscripciones')
export class InscripcionesController {
  constructor(private readonly inscripcionesService: InscripcionesService) {}

  @Roles('PARTICIPANTE', 'ADMIN')
  @Post()
  create(@Body() dto: CreateInscripcioneDto) {
    return this.inscripcionesService.create(dto);
  }

  @Roles('PARTICIPANTE')
  @Get('me')
  async findMyInscripciones(@Req() req: ExpressRequest) {
    type AuthenticatedRequest = ExpressRequest & {
      user: { sub: string; email: string; roles: string[] };
    };
    const { sub: userId } = (req as AuthenticatedRequest).user;
    return this.inscripcionesService.findByUsuarioId(userId);
  }

  @Roles('ADMIN', 'TRAINER')
  @Get()
  findAll() {
    return this.inscripcionesService.findAll();
  }

  @Roles('ADMIN', 'TRAINER')
  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.inscripcionesService.findOne(id);
  }

  @Roles('ADMIN')
  @Patch(':id')
  update(@Param('id') id: string, @Body() dto: UpdateInscripcioneDto) {
    return this.inscripcionesService.update(id, dto);
  }

  @Roles('ADMIN')
  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.inscripcionesService.remove(id);
  }
}
