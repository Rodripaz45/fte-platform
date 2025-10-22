import { Module } from '@nestjs/common';
import { SesionesService } from './sesiones.service';
import { SesionesController } from './sesiones.controller';
import { PrismaService } from '../../prisma/prisma.service';

@Module({
  controllers: [SesionesController],
  providers: [SesionesService, PrismaService],
})
export class SesionesModule {}
