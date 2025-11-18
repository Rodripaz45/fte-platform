import { Module, forwardRef } from '@nestjs/common';
import { TalleresService } from './talleres.service';
import { TalleresController } from './talleres.controller';
import { NotificacionesModule } from '../notificaciones/notificaciones.module';
import { CertificadosModule } from '../certificados/certificados.module';

@Module({
  imports: [NotificacionesModule, forwardRef(() => CertificadosModule)],
  controllers: [TalleresController],
  providers: [TalleresService],
  exports: [TalleresService],
})
export class TalleresModule {
  constructor(public readonly talleresService: TalleresService) {}
  
  // Método público para que CertificadosModule pueda acceder al servicio
  getTalleresService(): TalleresService {
    return this.talleresService;
  }
}
