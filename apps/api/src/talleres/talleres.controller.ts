import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards } from '@nestjs/common';
import { TalleresService } from './talleres.service';
import { CreateTallereDto } from './dto/create-tallere.dto';
import { UpdateTallereDto } from './dto/update-tallere.dto';
import { Roles } from '../auth/roles.decorator'; // ← usa ruta relativa si no tienes path alias
import { ApiBearerAuth } from '@nestjs/swagger';
// import type { Role } from '../../auth/role.enum'; // (opcional, no lo necesitas aquí)

@ApiBearerAuth()
@Controller('talleres')
export class TalleresController {
  constructor(private readonly talleresService: TalleresService) {}

  @Roles('ADMIN', 'TRAINER')
  @Post()
  create(@Body() createTallereDto: CreateTallereDto) {
    return this.talleresService.create(createTallereDto);
  }

  // Listar puede quedar abierto a cualquier autenticado (si tienes JwtGuard global)
  @Get()
  findAll() {
    return this.talleresService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.talleresService.findOne(id);
  }

  @Roles('ADMIN', 'TRAINER')
  @Patch(':id')
  update(@Param('id') id: string, @Body() updateTallereDto: UpdateTallereDto) {
    return this.talleresService.update(id, updateTallereDto);
  }

  @Roles('ADMIN', 'TRAINER')
  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.talleresService.remove(id);
  }
}
