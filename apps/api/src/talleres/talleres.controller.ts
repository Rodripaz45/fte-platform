import { Controller, Get, Post, Body, Patch, Param, Delete } from '@nestjs/common';
import { TalleresService } from './talleres.service';
import { CreateTallereDto } from './dto/create-tallere.dto';
import { UpdateTallereDto } from './dto/update-tallere.dto';

@Controller('talleres')
export class TalleresController {
  constructor(private readonly talleresService: TalleresService) {}

  @Post()
  create(@Body() createTallereDto: CreateTallereDto) {
    return this.talleresService.create(createTallereDto);
  }

  @Get()
  findAll() {
    return this.talleresService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.talleresService.findOne(+id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateTallereDto: UpdateTallereDto) {
    return this.talleresService.update(+id, updateTallereDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.talleresService.remove(+id);
  }
}
