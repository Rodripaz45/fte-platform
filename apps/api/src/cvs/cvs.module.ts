import { Module, forwardRef } from '@nestjs/common';
import { CvsService } from './cvs.service';
import { CvsController } from './cvs.controller';
import { PrismaModule } from '../../prisma/prisma.module';
import { IaModule } from '../ia/ia.module';

@Module({
  imports: [PrismaModule, forwardRef(() => IaModule)],
  controllers: [CvsController],
  providers: [CvsService],
  exports: [CvsService],
})
export class CvsModule {}


