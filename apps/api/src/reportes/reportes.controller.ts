import { Controller, Get, Query, Res, Req } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { ReportesService } from './reportes.service';
import { PdfService } from './pdf.service';
import { FiltrosReporteDto } from './dto/filtros-reporte.dto';
import { Roles } from '../auth/roles.decorator';
import type { Response, Request } from 'express';

@ApiTags('Reportes')
@ApiBearerAuth()
@Controller('reportes')
export class ReportesController {
  constructor(
    private readonly reportesService: ReportesService,
    private readonly pdfService: PdfService,
  ) {}

  @Roles('ADMIN', 'TRAINER')
  @Get('dashboard')
  @ApiOperation({ summary: 'Dashboard ejecutivo con todos los KPIs' })
  @ApiResponse({ status: 200, description: 'Dashboard ejecutivo' })
  async dashboardEjecutivo(@Query() filtros: FiltrosReporteDto) {
    return this.reportesService.dashboardEjecutivo(filtros);
  }

  @Roles('ADMIN', 'TRAINER')
  @Get('asistencia')
  @ApiOperation({ summary: 'KPI: Tasa de asistencia por taller' })
  @ApiResponse({ status: 200, description: 'Tasa de asistencia por taller' })
  async tasaAsistencia(@Query() filtros: FiltrosReporteDto) {
    return this.reportesService.tasaAsistenciaPorTaller(filtros);
  }

  @Roles('ADMIN', 'TRAINER')
  @Get('satisfaccion')
  @ApiOperation({ summary: 'KPI: Satisfacción promedio por taller' })
  @ApiResponse({ status: 200, description: 'Satisfacción promedio por taller' })
  async satisfaccion(@Query() filtros: FiltrosReporteDto) {
    return this.reportesService.satisfaccionPorTaller(filtros);
  }

  @Roles('ADMIN', 'TRAINER')
  @Get('recurrencia')
  @ApiOperation({ summary: 'KPI: Tasa de recurrencia de participantes' })
  @ApiResponse({ status: 200, description: 'Tasa de recurrencia' })
  async recurrencia(@Query() filtros: FiltrosReporteDto) {
    return this.reportesService.tasaRecurrencia(filtros);
  }

  @Roles('ADMIN', 'TRAINER')
  @Get('cobertura')
  @ApiOperation({ summary: 'KPI: Cobertura (participantes únicos)' })
  @ApiResponse({ status: 200, description: 'Cobertura' })
  async cobertura(@Query() filtros: FiltrosReporteDto) {
    return this.reportesService.cobertura(filtros);
  }

  @Roles('ADMIN', 'TRAINER')
  @Get('inscripciones')
  @ApiOperation({ summary: 'Reporte detallado de inscripciones' })
  @ApiResponse({ status: 200, description: 'Reporte de inscripciones' })
  async reporteInscripciones(@Query() filtros: FiltrosReporteDto) {
    return this.reportesService.reporteInscripciones(filtros);
  }

  @Roles('ADMIN', 'TRAINER')
  @Get('asistencia-detalle')
  @ApiOperation({ summary: 'Reporte detallado de asistencia' })
  @ApiResponse({ status: 200, description: 'Reporte de asistencia' })
  async reporteAsistencia(@Query() filtros: FiltrosReporteDto) {
    return this.reportesService.reporteAsistencia(filtros);
  }

  @Roles('ADMIN', 'TRAINER')
  @Get('satisfaccion-detalle')
  @ApiOperation({ summary: 'Reporte detallado de satisfacción' })
  @ApiResponse({ status: 200, description: 'Reporte de satisfacción' })
  async reporteSatisfaccion(@Query() filtros: FiltrosReporteDto) {
    return this.reportesService.reporteSatisfaccion(filtros);
  }

  @Roles('ADMIN', 'TRAINER')
  @Get('exportar/csv')
  @ApiOperation({ summary: 'Exportar reporte a CSV' })
  @ApiResponse({ status: 200, description: 'Archivo CSV' })
  async exportarCSV(@Query() filtros: FiltrosReporteDto, @Query('tipo') tipo: string, @Res() res: Response) {
    let datos: any[] = [];

    switch (tipo) {
      case 'inscripciones':
        datos = await this.reportesService.reporteInscripciones(filtros);
        break;
      case 'asistencia':
        datos = await this.reportesService.reporteAsistencia(filtros);
        break;
      case 'satisfaccion':
        datos = await this.reportesService.reporteSatisfaccion(filtros);
        break;
      default:
        return res.status(400).json({ message: 'Tipo de reporte no válido' });
    }

    // Convertir a CSV
    const csv = this.convertirACSV(datos, tipo);
    const filename = `reporte_${tipo}_${new Date().toISOString().split('T')[0]}.csv`;

    res.setHeader('Content-Type', 'text/csv; charset=utf-8');
    res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
    res.send('\ufeff' + csv); // BOM para Excel
  }

  private convertirACSV(datos: any[], tipo: string): string {
    if (datos.length === 0) return '';

    // Simplificar datos para CSV
    const filas: string[] = [];

    if (tipo === 'inscripciones') {
      // Headers
      filas.push('Taller,Modalidad,Fecha Inicio,Fecha Fin,Participante,Email,Estado,Fecha Inscripción');
      // Data
      datos.forEach((insc) => {
        filas.push(
          [
            insc.taller?.tema || '',
            insc.taller?.modalidad || '',
            insc.taller?.fechaInicio ? new Date(insc.taller.fechaInicio).toLocaleDateString('es-ES') : '',
            insc.taller?.fechaFin ? new Date(insc.taller.fechaFin).toLocaleDateString('es-ES') : '',
            insc.participante?.usuario?.nombre || '',
            insc.participante?.usuario?.email || '',
            insc.estado || '',
            insc.creadoEn ? new Date(insc.creadoEn).toLocaleDateString('es-ES') : '',
          ]
            .map((v) => `"${String(v).replace(/"/g, '""')}"`)
            .join(','),
        );
      });
    } else if (tipo === 'asistencia') {
      // Headers
      filas.push('Taller,Modalidad,Sesión,Fecha,Participante,Email,Estado');
      // Data
      datos.forEach((taller) => {
        taller.sesiones.forEach((sesion: any) => {
          sesion.asistencias.forEach((asist: any) => {
            filas.push(
              [
                taller.tema || '',
                taller.modalidad || '',
                sesion.fecha ? new Date(sesion.fecha).toLocaleDateString('es-ES') : '',
                sesion.fecha ? new Date(sesion.fecha).toLocaleDateString('es-ES') : '',
                asist.participanteNombre || '',
                asist.participanteEmail || '',
                asist.estado || '',
              ]
                .map((v) => `"${String(v).replace(/"/g, '""')}"`)
                .join(','),
            );
          });
        });
      });
    } else if (tipo === 'satisfaccion') {
      // Headers
      filas.push('Taller,Modalidad,Participante,Email,Puntaje,Comentario,Fecha');
      // Data
      datos.forEach((taller) => {
        taller.feedbacks.forEach((fb: any) => {
          filas.push(
            [
              taller.tema || '',
              taller.modalidad || '',
              fb.participanteNombre || '',
              fb.participanteEmail || '',
              fb.puntaje || '',
              (fb.comentario || '').replace(/"/g, '""'),
              fb.creadoEn ? new Date(fb.creadoEn).toLocaleDateString('es-ES') : '',
            ]
              .map((v) => `"${String(v).replace(/"/g, '""')}"`)
              .join(','),
          );
        });
      });
    }

    return filas.join('\n');
  }

  @Roles('ADMIN', 'TRAINER')
  @Get('exportar/pdf')
  @ApiOperation({ summary: 'Exportar reporte a PDF' })
  @ApiResponse({ status: 200, description: 'Archivo PDF' })
  async exportarPDF(
    @Req() req: Request,
    @Res() res: Response,
  ) {
    // Obtener parámetros directamente de la query string para evitar validación
    const query = req.query;
    const tipo = query.tipo as string;
    
    if (!tipo) {
      return res.status(400).json({ message: 'El parámetro "tipo" es requerido' });
    }

    const filtros: FiltrosReporteDto = {
      fechaInicio: query.fechaInicio as string | undefined,
      fechaFin: query.fechaFin as string | undefined,
      modalidad: query.modalidad as string | undefined,
      tallerId: query.tallerId as string | undefined,
      participanteId: query.participanteId as string | undefined,
    };
    
    try {
      let pdfBuffer: Buffer;

      switch (tipo) {
        case 'dashboard': {
          const dashboardData = await this.reportesService.dashboardEjecutivo(filtros);
          pdfBuffer = await this.pdfService.generarDashboardPDF(dashboardData, filtros);
          break;
        }
        case 'inscripciones': {
          const datos = await this.reportesService.reporteInscripciones(filtros);
          pdfBuffer = await this.pdfService.generarReporteInscripcionesPDF(datos, filtros);
          break;
        }
        case 'asistencia': {
          const datos = await this.reportesService.reporteAsistencia(filtros);
          pdfBuffer = await this.pdfService.generarReporteAsistenciaPDF(datos, filtros);
          break;
        }
        case 'satisfaccion': {
          const datos = await this.reportesService.reporteSatisfaccion(filtros);
          pdfBuffer = await this.pdfService.generarReporteSatisfaccionPDF(datos, filtros);
          break;
        }
        default:
          return res.status(400).json({ message: 'Tipo de reporte no válido' });
      }

      const filename = `reporte_${tipo}_${new Date().toISOString().split('T')[0]}.pdf`;

      res.setHeader('Content-Type', 'application/pdf');
      res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
      res.send(pdfBuffer);
    } catch (error) {
      console.error('Error generando PDF:', error);
      const errorMessage = error instanceof Error ? error.message : 'Error desconocido';
      return res.status(500).json({ message: 'Error al generar el PDF', error: errorMessage });
    }
  }
}
