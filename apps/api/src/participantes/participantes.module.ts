import { Module } from '@nestjs/common';
import { ParticipantesService } from './participantes.service';
import { ParticipantesController } from './participantes.controller';
import { PrismaService } from '../../prisma/prisma.service';

@Module({
  controllers: [ParticipantesController],
  providers: [ParticipantesService, PrismaService],
})
export class ParticipantesModule {}
