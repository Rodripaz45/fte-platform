import { Controller, Get, Post, Body, Patch, Param, Delete, Query } from '@nestjs/common';
import { SesionesService } from './sesiones.service';
import { CreateSesionDto } from './dto/create-sesion.dto';
import { UpdateSesionDto } from './dto/update-sesion.dto';
import { ApiBearerAuth } from '@nestjs/swagger';
import { Roles } from 'src/auth/roles.decorator';

@ApiBearerAuth()
@Controller('sesiones')
export class SesionesController {
  constructor(private readonly sesionesService: SesionesService) {}

  @Roles('ADMIN', 'TRAINER')
  @Post()
  create(@Body() dto: CreateSesionDto) {
    return this.sesionesService.create(dto);
  }

  @Get()
  findAll(
    @Query('tallerId') tallerId?: string,
    @Query('page') page?: string,
    @Query('pageSize') pageSize?: string,
  ) {
    return this.sesionesService.findAll({
      tallerId,
      page: page ? Number(page) : undefined,
      pageSize: pageSize ? Number(pageSize) : undefined,
    });
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.sesionesService.findOne(id);
  }

  @Roles('ADMIN', 'TRAINER')
  @Patch(':id')
  update(@Param('id') id: string, @Body() dto: UpdateSesionDto) {
    return this.sesionesService.update(id, dto);
  }

  @Roles('ADMIN', 'TRAINER')
  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.sesionesService.remove(id);
  }
}
