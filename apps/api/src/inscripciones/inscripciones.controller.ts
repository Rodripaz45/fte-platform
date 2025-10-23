import { Controller, Post, Body, Get, Param, Patch, Delete } from '@nestjs/common';
import { InscripcionesService } from './inscripciones.service';
import { CreateInscripcioneDto } from './dto/create-inscripcione.dto';
import { UpdateInscripcioneDto } from './dto/update-inscripcione.dto';
import { ApiBearerAuth } from '@nestjs/swagger';
import { Roles } from 'src/auth/roles.decorator';

@ApiBearerAuth()
@Controller('inscripciones')
export class InscripcionesController {
  constructor(private readonly inscripcionesService: InscripcionesService) {}

  @Roles('PARTICIPANTE', 'ADMIN')
  @Post()
  create(@Body() dto: CreateInscripcioneDto) {
    return this.inscripcionesService.create(dto);
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
