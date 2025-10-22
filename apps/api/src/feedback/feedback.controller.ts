import { Body, Controller, Delete, Get, Param, Patch, Post, Query } from '@nestjs/common';
import { FeedbackService } from './feedback.service';
import { CreateFeedbackDto } from './dto/create-feedback.dto';
import { UpdateFeedbackDto } from './dto/update-feedback.dto';

@Controller('feedback')
export class FeedbackController {
  constructor(private readonly feedbackService: FeedbackService) {}

  @Post()
  create(@Body() dto: CreateFeedbackDto) {
    return this.feedbackService.create(dto);
  }

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

  @Get('resumen/:tallerId')
  resumen(@Param('tallerId') tallerId: string) {
    return this.feedbackService.resumenPorTaller(tallerId);
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.feedbackService.findOne(id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() dto: UpdateFeedbackDto) {
    return this.feedbackService.update(id, dto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.feedbackService.remove(id);
  }
}
