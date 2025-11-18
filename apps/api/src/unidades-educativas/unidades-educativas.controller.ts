import { Controller, Get, Post, Body, Patch, Param, Delete } from '@nestjs/common';
import { UnidadesEducativasService } from './unidades-educativas.service';
import { CreateUnidadEducativaDto } from './dto/create-unidad-educativa.dto';
import { UpdateUnidadEducativaDto } from './dto/update-unidad-educativa.dto';
import { Roles } from '../auth/roles.decorator';
import { ApiBearerAuth } from '@nestjs/swagger';

@ApiBearerAuth()
@Controller('unidades-educativas')
export class UnidadesEducativasController {
  constructor(private readonly unidadesEducativasService: UnidadesEducativasService) {}

  @Roles('ADMIN')
  @Post()
  create(@Body() createDto: CreateUnidadEducativaDto) {
    return this.unidadesEducativasService.create(createDto);
  }

  @Roles('ADMIN', 'TRAINER')
  @Get()
  findAll() {
    return this.unidadesEducativasService.findAll();
  }

  @Roles('ADMIN', 'TRAINER')
  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.unidadesEducativasService.findOne(id);
  }

  @Roles('ADMIN')
  @Patch(':id')
  update(@Param('id') id: string, @Body() updateDto: UpdateUnidadEducativaDto) {
    return this.unidadesEducativasService.update(id, updateDto);
  }

  @Roles('ADMIN')
  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.unidadesEducativasService.remove(id);
  }
}

