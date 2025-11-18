import { Module } from '@nestjs/common';
import { ReportesService } from './reportes.service';
import { ReportesController } from './reportes.controller';
import { PdfService } from './pdf.service';
import { PrismaModule } from '../../prisma/prisma.module';

@Module({
  imports: [PrismaModule],
  controllers: [ReportesController],
  providers: [ReportesService, PdfService],
  exports: [ReportesService],
})
export class ReportesModule {}
