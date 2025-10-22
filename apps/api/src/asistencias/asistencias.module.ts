import { Module } from '@nestjs/common';
import { AsistenciasService } from './asistencias.service';
import { AsistenciasController } from './asistencias.controller';
import { PrismaService } from '../../prisma/prisma.service';

@Module({
  controllers: [AsistenciasController],
  providers: [AsistenciasService, PrismaService],
})
export class AsistenciasModule {}
