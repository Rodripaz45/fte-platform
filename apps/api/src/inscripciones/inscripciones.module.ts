import { Module } from '@nestjs/common';
import { InscripcionesService } from './inscripciones.service';
import { InscripcionesController } from './inscripciones.controller';
import { PrismaService } from '../../prisma/prisma.service';
import { IaModule } from '../ia/ia.module';

@Module({
  imports: [IaModule],
  controllers: [InscripcionesController],
  providers: [InscripcionesService, PrismaService],
})
export class InscripcionesModule {}
