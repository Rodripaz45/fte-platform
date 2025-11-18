import { FiltrosReporteDto } from './dto/filtros-reporte.dto';
export declare class PdfService {
    private chartJSNodeCanvas;
    constructor();
    private generarGraficoBarras;
    private generarGraficoLineas;
    private generarGraficoPastel;
    private dibujarRectangulo;
    private dibujarLineaSeparadora;
    private agregarEncabezadoSeccion;
    private agregarTarjetaKPI;
    generarDashboardPDF(dashboardData: any, filtros: FiltrosReporteDto): Promise<Buffer>;
    generarReporteInscripcionesPDF(datos: any[], filtros: FiltrosReporteDto): Promise<Buffer>;
    generarReporteAsistenciaPDF(datos: any[], filtros: FiltrosReporteDto): Promise<Buffer>;
    generarReporteSatisfaccionPDF(datos: any[], filtros: FiltrosReporteDto): Promise<Buffer>;
}
