import { Body, Controller, Delete, Get, Param, Patch, Post, Query } from '@nestjs/common';
import { FeedbackService } from './feedback.service';
import { CreateFeedbackDto } from './dto/create-feedback.dto';
import { UpdateFeedbackDto } from './dto/update-feedback.dto';
import { ApiBearerAuth } from '@nestjs/swagger';
import { Roles } from 'src/auth/roles.decorator';

@ApiBearerAuth()
@Controller('feedback')
export class FeedbackController {
  constructor(private readonly feedbackService: FeedbackService) {}

  @Roles('PARTICIPANTE', 'ADMIN')
  @Post()
  create(@Body() dto: CreateFeedbackDto) {
    return this.feedbackService.create(dto);
  }

  @Roles('ADMIN', 'TRAINER')
  @Get()
  findAll(
    @Query('tallerId') tallerId?: string,
    @Query('participanteId') participanteId?: string,
    @Query('page') page?: string,
    @Query('pageSize') pageSize?: string,
  ) {
    return this.feedbackService.findAll({
      tallerId,
      participanteId,
      page: page ? Number(page) : undefined,
      pageSize: pageSize ? Number(pageSize) : undefined,
    });
  }

  @Roles('ADMIN', 'TRAINER')
  @Get('resumen/:tallerId')
  resumen(@Param('tallerId') tallerId: string) {
    return this.feedbackService.resumenPorTaller(tallerId);
  }

  @Roles('ADMIN', 'TRAINER')
  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.feedbackService.findOne(id);
  }

  @Roles('ADMIN')
  @Patch(':id')
  update(@Param('id') id: string, @Body() dto: UpdateFeedbackDto) {
    return this.feedbackService.update(id, dto);
  }

  @Roles('ADMINS')
  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.feedbackService.remove(id);
  }
}
