import { Injectable } from '@nestjs/common';
import PDFDocument from 'pdfkit';
import { ChartJSNodeCanvas } from 'chartjs-node-canvas';
import { FiltrosReporteDto } from './dto/filtros-reporte.dto';

@Injectable()
export class PdfService {
  private chartJSNodeCanvas: ChartJSNodeCanvas;

  constructor() {
    this.chartJSNodeCanvas = new ChartJSNodeCanvas({
      width: 800,
      height: 400,
      backgroundColour: 'white',
    });
  }

  /**
   * Genera un gráfico de barras
   */
  private async generarGraficoBarras(
    datos: Array<{ nombre: string; tasa: number }>,
    titulo: string,
  ): Promise<Buffer> {
    const configuration = {
      type: 'bar' as const,
      data: {
        labels: datos.map((d) => d.nombre),
        datasets: [
          {
            label: 'Tasa de Asistencia (%)',
            data: datos.map((d) => d.tasa),
            backgroundColor: '#2563eb',
            borderColor: '#1e40af',
            borderWidth: 1,
          },
        ],
      },
      options: {
        responsive: true,
        plugins: {
          title: {
            display: true,
            text: titulo,
            font: { size: 16 },
          },
          legend: {
            display: true,
          },
        },
        scales: {
          y: {
            beginAtZero: true,
            max: 100,
          },
        },
      },
    };

    return await this.chartJSNodeCanvas.renderToBuffer(configuration);
  }

  /**
   * Genera un gráfico de líneas
   */
  private async generarGraficoLineas(
    datos: Array<{ nombre: string; promedio: number }>,
    titulo: string,
  ): Promise<Buffer> {
    const configuration = {
      type: 'line' as const,
      data: {
        labels: datos.map((d) => d.nombre),
        datasets: [
          {
            label: 'Promedio Satisfacción',
            data: datos.map((d) => d.promedio),
            borderColor: '#10b981',
            backgroundColor: 'rgba(16, 185, 129, 0.1)',
            borderWidth: 2,
            fill: true,
          },
        ],
      },
      options: {
        responsive: true,
        plugins: {
          title: {
            display: true,
            text: titulo,
            font: { size: 16 },
          },
          legend: {
            display: true,
          },
        },
        scales: {
          y: {
            beginAtZero: true,
            max: 5,
          },
        },
      },
    };

    return await this.chartJSNodeCanvas.renderToBuffer(configuration);
  }

  /**
   * Genera un gráfico de pastel
   */
  private async generarGraficoPastel(
    datos: Array<{ name: string; value: number }>,
    titulo: string,
  ): Promise<Buffer> {
    const colors = ['#2563eb', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6'];
    const configuration = {
      type: 'pie' as const,
      data: {
        labels: datos.map((d) => d.name),
        datasets: [
          {
            data: datos.map((d) => d.value),
            backgroundColor: datos.map((_, i) => colors[i % colors.length]),
            borderColor: '#ffffff',
            borderWidth: 2,
          },
        ],
      },
      options: {
        responsive: true,
        plugins: {
          title: {
            display: true,
            text: titulo,
            font: { size: 16 },
          },
          legend: {
            display: true,
            position: 'right' as const,
          },
        },
      },
    };

    return await this.chartJSNodeCanvas.renderToBuffer(configuration);
  }

  /**
   * Dibuja un rectángulo con fondo de color
   */
  private dibujarRectangulo(
    doc: any,
    x: number,
    y: number,
    width: number,
    height: number,
    color: string,
  ) {
    doc.rect(x, y, width, height).fill(color);
  }

  /**
   * Dibuja una línea separadora
   */
  private dibujarLineaSeparadora(doc: any, y: number, width: number = 500) {
    const x = (doc.page.width - width) / 2;
    doc.moveTo(x, y).lineTo(x + width, y).stroke('#e5e7eb');
  }

  /**
   * Agrega un encabezado de sección
   */
  private agregarEncabezadoSeccion(
    doc: any,
    titulo: string,
    color: string = '#2563eb',
  ) {
    const y = doc.y;
    doc.rect(50, y, 5, 20).fill(color);
    doc.fontSize(16).font('Helvetica-Bold').fillColor(color);
    doc.text(titulo, 65, y + 5);
    doc.fillColor('black').font('Helvetica');
    doc.moveDown(1.5);
  }

  /**
   * Agrega una tarjeta de KPI
   */
  private agregarTarjetaKPI(
    doc: any,
    titulo: string,
    valor: string,
    descripcion: string,
    color: string = '#2563eb',
    x: number,
    y: number,
    width: number = 120,
    height: number = 80,
  ) {
    // Fondo de la tarjeta
    doc.rect(x, y, width, height).fillAndStroke('#f9fafb', '#e5e7eb');
    
    // Borde superior de color
    doc.rect(x, y, width, 4).fill(color);
    
    // Título
    doc.fontSize(9).font('Helvetica-Bold').fillColor('#374151');
    doc.text(titulo, x + 10, y + 10, { width: width - 20 });
    
    // Valor
    doc.fontSize(18).fillColor(color);
    doc.text(valor, x + 10, y + 25, { width: width - 20 });
    
    // Descripción
    doc.fontSize(7).fillColor('#6b7280').font('Helvetica');
    doc.text(descripcion, x + 10, y + 50, { width: width - 20 });
    
    doc.fillColor('black');
  }

  /**
   * Genera un PDF del dashboard ejecutivo
   */
  async generarDashboardPDF(dashboardData: any, filtros: FiltrosReporteDto): Promise<Buffer> {
    return new Promise(async (resolve, reject) => {
      try {
        const doc = new PDFDocument({ margin: 50, size: 'A4' });
        const buffers: Buffer[] = [];

        doc.on('data', buffers.push.bind(buffers));
        doc.on('end', () => {
          const pdfBuffer = Buffer.concat(buffers);
          resolve(pdfBuffer);
        });
        doc.on('error', reject);

        // Encabezado principal con fondo
        const headerY = 30;
        doc.rect(0, 0, doc.page.width, 100).fill('#1e40af');
        doc.fontSize(28).font('Helvetica-Bold').fillColor('white');
        doc.text('Dashboard Ejecutivo', 50, headerY + 20, { align: 'center', width: doc.page.width - 100 });
        doc.fontSize(12).font('Helvetica').fillColor('#e0e7ff');
        doc.text('Reporte de Indicadores y Métricas', 50, headerY + 50, { align: 'center', width: doc.page.width - 100 });
        doc.fillColor('black');
        doc.y = 120;

        // Filtros aplicados (si existen)
        if (filtros.fechaInicio || filtros.fechaFin || filtros.modalidad || filtros.tallerId) {
          doc.rect(50, doc.y, doc.page.width - 100, 60).fillAndStroke('#f3f4f6', '#d1d5db');
          doc.fontSize(10).font('Helvetica-Bold').fillColor('#374151');
          doc.text('Filtros Aplicados', 60, doc.y + 10);
          doc.font('Helvetica').fontSize(9).fillColor('#6b7280');
          let filterY = doc.y + 25;
          if (filtros.fechaInicio) {
            doc.text(`📅 Fecha inicio: ${new Date(filtros.fechaInicio).toLocaleDateString('es-ES')}`, 60, filterY);
            filterY += 12;
          }
          if (filtros.fechaFin) {
            doc.text(`📅 Fecha fin: ${new Date(filtros.fechaFin).toLocaleDateString('es-ES')}`, 60, filterY);
            filterY += 12;
          }
          if (filtros.modalidad) {
            doc.text(`📋 Modalidad: ${filtros.modalidad}`, 60, filterY);
          }
          doc.fillColor('black');
          doc.y = doc.y + 70;
          doc.moveDown(0.5);
        }

        // Resumen de KPIs - Tarjetas visuales
        if (dashboardData.resumen) {
          this.agregarEncabezadoSeccion(doc, 'Resumen de Indicadores Clave', '#2563eb');
          
          const promedioAsistencia = dashboardData.resumen.promedioAsistencia ?? 0;
          const promedioSatisfaccion = dashboardData.resumen.promedioSatisfaccion ?? 0;
          const tasaRecurrencia = dashboardData.resumen.tasaRecurrencia ?? 0;
          const cobertura = dashboardData.resumen.cobertura ?? 0;
          
          const startY = doc.y;
          const cardWidth = 120;
          const cardHeight = 90;
          const spacing = 20;
          const startX = 50;
          
          // Tarjeta 1: Asistencia
          this.agregarTarjetaKPI(
            doc,
            'Asistencia Promedio',
            `${promedioAsistencia.toFixed(1)}%`,
            'Tasa promedio de asistencia',
            '#2563eb',
            startX,
            startY,
            cardWidth,
            cardHeight,
          );
          
          // Tarjeta 2: Satisfacción
          this.agregarTarjetaKPI(
            doc,
            'Satisfacción',
            `${promedioSatisfaccion.toFixed(1)}/5`,
            'Puntaje promedio',
            '#10b981',
            startX + cardWidth + spacing,
            startY,
            cardWidth,
            cardHeight,
          );
          
          // Tarjeta 3: Recurrencia
          this.agregarTarjetaKPI(
            doc,
            'Recurrencia',
            `${tasaRecurrencia.toFixed(1)}%`,
            'Participantes recurrentes',
            '#f59e0b',
            startX + (cardWidth + spacing) * 2,
            startY,
            cardWidth,
            cardHeight,
          );
          
          // Tarjeta 4: Cobertura
          this.agregarTarjetaKPI(
            doc,
            'Cobertura',
            `${cobertura}`,
            'Participantes únicos',
            '#8b5cf6',
            startX + (cardWidth + spacing) * 3,
            startY,
            cardWidth,
            cardHeight,
          );
          
          doc.y = startY + cardHeight + 30;
          this.dibujarLineaSeparadora(doc, doc.y);
          doc.moveDown(1);
        }

        // Tasa de Asistencia por Taller - Gráfico
        if (dashboardData.asistencia && dashboardData.asistencia.length > 0) {
          if (doc.y > doc.page.height - 400) {
            doc.addPage();
          }
          
          this.agregarEncabezadoSeccion(doc, 'Tasa de Asistencia por Taller', '#2563eb');
          
          // Descripción del gráfico
          doc.fontSize(9).fillColor('#6b7280').font('Helvetica');
          doc.text(
            'Este gráfico muestra el porcentaje de asistencia de cada taller. Un mayor porcentaje indica mejor participación de los inscritos.',
            50,
            doc.y,
            { width: doc.page.width - 100 },
          );
          doc.fillColor('black');
          doc.moveDown(1);

          // Preparar datos para el gráfico
          const datosAsistencia = dashboardData.asistencia.map((item: any) => ({
            nombre: (item.tema || 'Sin tema').substring(0, 20),
            tasa: item.tasaAsistencia ?? 0,
          }));

          try {
            const graficoBuffer = await this.generarGraficoBarras(
              datosAsistencia,
              'Tasa de Asistencia por Taller (%)',
            );
            doc.image(graficoBuffer, {
              fit: [500, 280],
              align: 'center',
            });
            doc.moveDown(1);
          } catch (error) {
            console.error('Error generando gráfico de asistencia:', error);
            doc.fontSize(10).fillColor('#ef4444').text('Error al generar gráfico de asistencia', { indent: 20 });
            doc.fillColor('black');
          }

          // Tabla de datos detallados
          this.dibujarLineaSeparadora(doc, doc.y);
          doc.moveDown(0.5);
          doc.fontSize(11).font('Helvetica-Bold').fillColor('#374151');
          doc.text('Detalle por Taller', 50, doc.y);
          doc.font('Helvetica').fontSize(9).fillColor('black');
          doc.moveDown(0.5);
          
          // Encabezados de tabla
          const tableY = doc.y;
          doc.rect(50, tableY, doc.page.width - 100, 25).fill('#f3f4f6');
          doc.fontSize(9).font('Helvetica-Bold').fillColor('#374151');
          doc.text('Taller', 55, tableY + 8);
          doc.text('Modalidad', 200, tableY + 8);
          doc.text('Asistencia', 320, tableY + 8);
          doc.text('Inscripciones', 420, tableY + 8);
          doc.text('Sesiones', 510, tableY + 8);
          
          let currentY = tableY + 30;
          dashboardData.asistencia.forEach((item: any, index: number) => {
            if (currentY > doc.page.height - 80) {
              doc.addPage();
              currentY = 50;
              // Redibujar encabezados
              doc.rect(50, currentY, doc.page.width - 100, 25).fill('#f3f4f6');
              doc.fontSize(9).font('Helvetica-Bold').fillColor('#374151');
              doc.text('Taller', 55, currentY + 8);
              doc.text('Modalidad', 200, currentY + 8);
              doc.text('Asistencia', 320, currentY + 8);
              doc.text('Inscripciones', 420, currentY + 8);
              doc.text('Sesiones', 510, currentY + 8);
              currentY += 30;
            }
            
            const tema = (item.tema || 'Sin tema').substring(0, 30);
            const modalidad = item.modalidad || 'Sin modalidad';
            const tasaAsistencia = item.tasaAsistencia ?? 0;
            const totalInscripciones = item.totalInscripciones ?? 0;
            const totalSesiones = item.totalSesiones ?? 0;
            
            // Fila alternada
            if (index % 2 === 0) {
              doc.rect(50, currentY - 5, doc.page.width - 100, 20).fill('#fafafa');
            }
            
            doc.font('Helvetica').fontSize(8).fillColor('black');
            doc.text(tema, 55, currentY);
            doc.text(modalidad, 200, currentY);
            doc.text(`${tasaAsistencia.toFixed(1)}%`, 320, currentY);
            doc.text(`${totalInscripciones}`, 420, currentY);
            doc.text(`${totalSesiones}`, 510, currentY);
            
            currentY += 20;
          });
          
          doc.y = currentY + 20;
          this.dibujarLineaSeparadora(doc, doc.y);
          doc.moveDown(1);
        }

        // Satisfacción por Taller - Gráfico
        if (dashboardData.satisfaccion && dashboardData.satisfaccion.length > 0) {
          if (doc.y > doc.page.height - 400) {
            doc.addPage();
          }
          
          this.agregarEncabezadoSeccion(doc, 'Satisfacción por Taller', '#10b981');
          
          // Descripción del gráfico
          doc.fontSize(9).fillColor('#6b7280').font('Helvetica');
          doc.text(
            'Este gráfico muestra el nivel de satisfacción promedio de los participantes por taller (escala 1-5). Un valor más alto indica mayor satisfacción.',
            50,
            doc.y,
            { width: doc.page.width - 100 },
          );
          doc.fillColor('black');
          doc.moveDown(1);

          // Preparar datos para el gráfico
          const datosSatisfaccion = dashboardData.satisfaccion.map((item: any) => ({
            nombre: (item.tema || 'Sin tema').substring(0, 20),
            promedio: item.promedioSatisfaccion ?? 0,
          }));

          try {
            const graficoBuffer = await this.generarGraficoLineas(
              datosSatisfaccion,
              'Satisfacción Promedio por Taller',
            );
            doc.image(graficoBuffer, {
              fit: [500, 280],
              align: 'center',
            });
            doc.moveDown(1);
          } catch (error) {
            console.error('Error generando gráfico de satisfacción:', error);
            doc.fontSize(10).fillColor('#ef4444').text('Error al generar gráfico de satisfacción', { indent: 20 });
            doc.fillColor('black');
          }

          // Tabla de datos detallados
          this.dibujarLineaSeparadora(doc, doc.y);
          doc.moveDown(0.5);
          doc.fontSize(11).font('Helvetica-Bold').fillColor('#374151');
          doc.text('Detalle por Taller', 50, doc.y);
          doc.font('Helvetica').fontSize(9).fillColor('black');
          doc.moveDown(0.5);
          
          // Encabezados de tabla
          const tableY = doc.y;
          doc.rect(50, tableY, doc.page.width - 100, 25).fill('#f3f4f6');
          doc.fontSize(9).font('Helvetica-Bold').fillColor('#374151');
          doc.text('Taller', 55, tableY + 8);
          doc.text('Modalidad', 200, tableY + 8);
          doc.text('Satisfacción', 320, tableY + 8);
          doc.text('Feedbacks', 450, tableY + 8);
          
          let currentY = tableY + 30;
          dashboardData.satisfaccion.forEach((item: any, index: number) => {
            if (currentY > doc.page.height - 80) {
              doc.addPage();
              currentY = 50;
              // Redibujar encabezados
              doc.rect(50, currentY, doc.page.width - 100, 25).fill('#f3f4f6');
              doc.fontSize(9).font('Helvetica-Bold').fillColor('#374151');
              doc.text('Taller', 55, currentY + 8);
              doc.text('Modalidad', 200, currentY + 8);
              doc.text('Satisfacción', 320, currentY + 8);
              doc.text('Feedbacks', 450, currentY + 8);
              currentY += 30;
            }
            
            const tema = (item.tema || 'Sin tema').substring(0, 30);
            const modalidad = item.modalidad || 'Sin modalidad';
            const promedioSatisfaccion = item.promedioSatisfaccion ?? 0;
            const totalFeedbacks = item.totalFeedbacks ?? 0;
            
            // Fila alternada
            if (index % 2 === 0) {
              doc.rect(50, currentY - 5, doc.page.width - 100, 20).fill('#fafafa');
            }
            
            doc.font('Helvetica').fontSize(8).fillColor('black');
            doc.text(tema, 55, currentY);
            doc.text(modalidad, 200, currentY);
            doc.text(`${promedioSatisfaccion.toFixed(2)}/5`, 320, currentY);
            doc.text(`${totalFeedbacks}`, 450, currentY);
            
            currentY += 20;
          });
          
          doc.y = currentY + 20;
          this.dibujarLineaSeparadora(doc, doc.y);
          doc.moveDown(1);
        }

        // Distribución por Modalidad - Gráfico de Pastel
        if (dashboardData.asistencia && dashboardData.asistencia.length > 0) {
          const distribucionModalidad = dashboardData.asistencia.reduce((acc: any, item: any) => {
            const key = item.modalidad || 'Sin modalidad';
            acc[key] = (acc[key] || 0) + 1;
            return acc;
          }, {} as Record<string, number>);

          const datosPieModalidad = Object.entries(distribucionModalidad).map(([name, value]) => ({
            name,
            value: Number(value) || 0,
          }));

          if (datosPieModalidad.length > 0) {
            if (doc.y > doc.page.height - 400) {
              doc.addPage();
            }
            
            this.agregarEncabezadoSeccion(doc, 'Distribución por Modalidad', '#8b5cf6');
            
            // Descripción del gráfico
            doc.fontSize(9).fillColor('#6b7280').font('Helvetica');
            doc.text(
              'Este gráfico muestra la distribución de talleres según su modalidad (Presencial, Virtual, Mixta).',
              50,
              doc.y,
              { width: doc.page.width - 100 },
            );
            doc.fillColor('black');
            doc.moveDown(1);

            try {
              const graficoBuffer = await this.generarGraficoPastel(
                datosPieModalidad,
                'Distribución de Talleres por Modalidad',
              );
              doc.image(graficoBuffer, {
                fit: [500, 280],
                align: 'center',
              });
              doc.moveDown(1);
            } catch (error) {
              console.error('Error generando gráfico de modalidad:', error);
              doc.fontSize(10).fillColor('#ef4444').text('Error al generar gráfico de modalidad', { indent: 20 });
              doc.fillColor('black');
            }
            
            this.dibujarLineaSeparadora(doc, doc.y);
            doc.moveDown(1);
          }
        }

        // Recurrencia
        if (dashboardData.recurrencia) {
          if (doc.y > doc.page.height - 300) {
            doc.addPage();
          }
          
          this.agregarEncabezadoSeccion(doc, 'Análisis de Recurrencia', '#f59e0b');
          
          // Descripción
          doc.fontSize(9).fillColor('#6b7280').font('Helvetica');
          doc.text(
            'La recurrencia mide cuántos participantes asisten a múltiples talleres, indicando el nivel de compromiso y satisfacción con el programa.',
            50,
            doc.y,
            { width: doc.page.width - 100 },
          );
          doc.fillColor('black');
          doc.moveDown(1);
          
          const totalParticipantes = dashboardData.recurrencia.totalParticipantes ?? 0;
          const participantesRecurrentes = dashboardData.recurrencia.participantesRecurrentes ?? 0;
          const participantesUnicos = dashboardData.recurrencia.participantesUnicos ?? 0;
          const tasaRecurrencia = dashboardData.recurrencia.tasaRecurrencia ?? 0;
          
          // Caja de información
          const infoY = doc.y;
          doc.rect(50, infoY, doc.page.width - 100, 100).fillAndStroke('#fef3c7', '#fbbf24');
          doc.fontSize(10).font('Helvetica-Bold').fillColor('#92400e');
          doc.text('Métricas de Recurrencia', 60, infoY + 10);
          doc.font('Helvetica').fontSize(9).fillColor('#78350f');
          doc.text(`Total de Participantes: ${totalParticipantes}`, 60, infoY + 30);
          doc.text(`Participantes Recurrentes: ${participantesRecurrentes}`, 60, infoY + 45);
          doc.text(`Participantes Únicos: ${participantesUnicos}`, 60, infoY + 60);
          doc.fontSize(11).font('Helvetica-Bold');
          doc.text(`Tasa de Recurrencia: ${tasaRecurrencia.toFixed(2)}%`, 60, infoY + 80);
          doc.fillColor('black');
          doc.y = infoY + 110;
          doc.moveDown(1);
        }

        // Preparar información del pie de página
        const fechaGeneracion = new Date().toLocaleDateString('es-ES', {
          year: 'numeric',
          month: 'long',
          day: 'numeric',
        });
        const horaGeneracion = new Date().toLocaleTimeString('es-ES', {
          hour: '2-digit',
          minute: '2-digit',
        });
        
        // Función para agregar pie de página a la página actual
        const agregarPieDePagina = () => {
          const pageHeight = doc.page.height;
          
          // Guardar posición actual
          const currentY = doc.y;
          
          // Línea separadora
          doc.moveTo(50, pageHeight - 50).lineTo(doc.page.width - 50, pageHeight - 50).stroke('#e5e7eb');
          
          // Texto del pie de página
          doc.fontSize(8).fillColor('#6b7280').font('Helvetica');
          doc.text(
            `Generado el ${fechaGeneracion} a las ${horaGeneracion}`,
            50,
            pageHeight - 40,
            { align: 'center', width: doc.page.width - 100 },
          );
          
          // Restaurar posición
          doc.y = currentY;
        };
        
        // Agregar pie de página a la primera página antes de finalizar
        agregarPieDePagina();
        
        // Interceptar addPage para agregar pie de página antes de crear nueva página
        const originalAddPage = doc.addPage.bind(doc);
        let pageCount = 1;
        doc.addPage = function(options?: any) {
          // Agregar pie de página a la página actual antes de crear nueva
          agregarPieDePagina();
          pageCount++;
          return originalAddPage(options);
        };

        // Finalizar el documento
        doc.end();
      } catch (error) {
        reject(error);
      }
    });
  }

  /**
   * Genera un PDF de reporte de inscripciones
   */
  generarReporteInscripcionesPDF(datos: any[], filtros: FiltrosReporteDto): Promise<Buffer> {
    return new Promise((resolve, reject) => {
      try {
        const doc = new PDFDocument({ margin: 50, size: 'A4' });
        const buffers: Buffer[] = [];

        doc.on('data', buffers.push.bind(buffers));
        doc.on('end', () => {
          const pdfBuffer = Buffer.concat(buffers);
          resolve(pdfBuffer);
        });
        doc.on('error', reject);

        // Título
        doc.fontSize(20).text('Reporte de Inscripciones', { align: 'center' });
        doc.moveDown();

        // Filtros
        if (filtros.fechaInicio || filtros.fechaFin || filtros.modalidad) {
          doc.fontSize(12).text('Filtros aplicados:', { underline: true });
          doc.fontSize(10);
          if (filtros.fechaInicio) {
            doc.text(`Fecha inicio: ${new Date(filtros.fechaInicio).toLocaleDateString('es-ES')}`);
          }
          if (filtros.fechaFin) {
            doc.text(`Fecha fin: ${new Date(filtros.fechaFin).toLocaleDateString('es-ES')}`);
          }
          if (filtros.modalidad) {
            doc.text(`Modalidad: ${filtros.modalidad}`);
          }
          doc.moveDown();
        }

        // Tabla de inscripciones
        doc.fontSize(10);
        let y = doc.y;
        const pageHeight = doc.page.height;
        const rowHeight = 20;
        const startX = 50;
        const colWidths = [120, 80, 80, 80, 100, 120, 60, 80];

        // Headers
        doc.fontSize(9).font('Helvetica-Bold');
        doc.text('Taller', startX, y);
        doc.text('Modalidad', startX + colWidths[0], y);
        doc.text('Fecha Inicio', startX + colWidths[0] + colWidths[1], y);
        doc.text('Fecha Fin', startX + colWidths[0] + colWidths[1] + colWidths[2], y);
        doc.text('Participante', startX + colWidths[0] + colWidths[1] + colWidths[2] + colWidths[3], y);
        doc.text('Email', startX + colWidths[0] + colWidths[1] + colWidths[2] + colWidths[3] + colWidths[4], y);
        doc.text('Estado', startX + colWidths[0] + colWidths[1] + colWidths[2] + colWidths[3] + colWidths[4] + colWidths[5], y);
        doc.text('Fecha', startX + colWidths[0] + colWidths[1] + colWidths[2] + colWidths[3] + colWidths[4] + colWidths[5] + colWidths[6], y);
        
        y += rowHeight;
        doc.moveTo(50, y).lineTo(550, y).stroke();
        y += 5;

        doc.fontSize(8).font('Helvetica');
        datos.forEach((insc, index) => {
          if (y > pageHeight - 50) {
            doc.addPage();
            y = 50;
          }

          const taller = insc.taller?.tema || '';
          const modalidad = insc.taller?.modalidad || '';
          const fechaInicio = insc.taller?.fechaInicio
            ? new Date(insc.taller.fechaInicio).toLocaleDateString('es-ES')
            : '';
          const fechaFin = insc.taller?.fechaFin
            ? new Date(insc.taller.fechaFin).toLocaleDateString('es-ES')
            : '';
          const participante = insc.participante?.usuario?.nombre || '';
          const email = insc.participante?.usuario?.email || '';
          const estado = insc.estado || '';
          const fecha = insc.creadoEn
            ? new Date(insc.creadoEn).toLocaleDateString('es-ES')
            : '';

          doc.text(taller.substring(0, 25), startX, y, { width: colWidths[0], ellipsis: true });
          doc.text(modalidad, startX + colWidths[0], y, { width: colWidths[1] });
          doc.text(fechaInicio, startX + colWidths[0] + colWidths[1], y, { width: colWidths[2] });
          doc.text(fechaFin, startX + colWidths[0] + colWidths[1] + colWidths[2], y, { width: colWidths[3] });
          doc.text(participante.substring(0, 20), startX + colWidths[0] + colWidths[1] + colWidths[2] + colWidths[3], y, {
            width: colWidths[4],
            ellipsis: true,
          });
          doc.text(email.substring(0, 25), startX + colWidths[0] + colWidths[1] + colWidths[2] + colWidths[3] + colWidths[4], y, {
            width: colWidths[5],
            ellipsis: true,
          });
          doc.text(estado, startX + colWidths[0] + colWidths[1] + colWidths[2] + colWidths[3] + colWidths[4] + colWidths[5], y, {
            width: colWidths[6],
          });
          doc.text(fecha, startX + colWidths[0] + colWidths[1] + colWidths[2] + colWidths[3] + colWidths[4] + colWidths[5] + colWidths[6], y, {
            width: colWidths[7],
          });

          y += rowHeight;
        });

        // Pie de página
        const totalPages = doc.bufferedPageRange().count;
        for (let i = 0; i < totalPages; i++) {
          doc.switchToPage(i);
          doc.fontSize(8).text(
            `Página ${i + 1} de ${totalPages} | Total: ${datos.length} inscripciones | Generado el ${new Date().toLocaleDateString('es-ES')}`,
            50,
            doc.page.height - 30,
            { align: 'center', width: doc.page.width - 100 },
          );
        }

        doc.end();
      } catch (error) {
        reject(error);
      }
    });
  }

  /**
   * Genera un PDF de reporte de asistencia
   */
  generarReporteAsistenciaPDF(datos: any[], filtros: FiltrosReporteDto): Promise<Buffer> {
    return new Promise((resolve, reject) => {
      try {
        const doc = new PDFDocument({ margin: 50, size: 'A4' });
        const buffers: Buffer[] = [];

        doc.on('data', buffers.push.bind(buffers));
        doc.on('end', () => {
          const pdfBuffer = Buffer.concat(buffers);
          resolve(pdfBuffer);
        });
        doc.on('error', reject);

        // Título
        doc.fontSize(20).text('Reporte de Asistencia', { align: 'center' });
        doc.moveDown();

        // Filtros
        if (filtros.fechaInicio || filtros.fechaFin || filtros.modalidad) {
          doc.fontSize(12).text('Filtros aplicados:', { underline: true });
          doc.fontSize(10);
          if (filtros.fechaInicio) {
            doc.text(`Fecha inicio: ${new Date(filtros.fechaInicio).toLocaleDateString('es-ES')}`);
          }
          if (filtros.fechaFin) {
            doc.text(`Fecha fin: ${new Date(filtros.fechaFin).toLocaleDateString('es-ES')}`);
          }
          if (filtros.modalidad) {
            doc.text(`Modalidad: ${filtros.modalidad}`);
          }
          doc.moveDown();
        }

        // Datos por taller
        doc.fontSize(10);
        datos.forEach((taller) => {
          if (doc.y > doc.page.height - 100) {
            doc.addPage();
          }

          doc.fontSize(12).font('Helvetica-Bold').text(`${taller.tema} (${taller.modalidad})`, { underline: true });
          doc.moveDown(0.5);
          doc.fontSize(9).font('Helvetica');

          taller.sesiones.forEach((sesion: any) => {
            if (doc.y > doc.page.height - 80) {
              doc.addPage();
            }

            const fechaSesion = sesion.fecha
              ? new Date(sesion.fecha).toLocaleDateString('es-ES')
              : '';
            doc.font('Helvetica-Bold').text(`Sesión: ${fechaSesion}`, { indent: 20 });
            doc.font('Helvetica');

            if (sesion.asistencias && sesion.asistencias.length > 0) {
              sesion.asistencias.forEach((asist: any) => {
                if (doc.y > doc.page.height - 50) {
                  doc.addPage();
                }
                doc.text(
                  `  • ${asist.participanteNombre} (${asist.participanteEmail}) - ${asist.estado}`,
                  { indent: 40 },
                );
              });
            } else {
              doc.text('  Sin asistencias registradas', { indent: 40 });
            }
            doc.moveDown(0.3);
          });
          doc.moveDown();
        });

        // Pie de página
        const totalPages = doc.bufferedPageRange().count;
        for (let i = 0; i < totalPages; i++) {
          doc.switchToPage(i);
          doc.fontSize(8).text(
            `Página ${i + 1} de ${totalPages} | Generado el ${new Date().toLocaleDateString('es-ES')}`,
            50,
            doc.page.height - 30,
            { align: 'center', width: doc.page.width - 100 },
          );
        }

        doc.end();
      } catch (error) {
        reject(error);
      }
    });
  }

  /**
   * Genera un PDF de reporte de satisfacción
   */
  generarReporteSatisfaccionPDF(datos: any[], filtros: FiltrosReporteDto): Promise<Buffer> {
    return new Promise((resolve, reject) => {
      try {
        const doc = new PDFDocument({ margin: 50, size: 'A4' });
        const buffers: Buffer[] = [];

        doc.on('data', buffers.push.bind(buffers));
        doc.on('end', () => {
          const pdfBuffer = Buffer.concat(buffers);
          resolve(pdfBuffer);
        });
        doc.on('error', reject);

        // Título
        doc.fontSize(20).text('Reporte de Satisfacción', { align: 'center' });
        doc.moveDown();

        // Filtros
        if (filtros.fechaInicio || filtros.fechaFin || filtros.modalidad) {
          doc.fontSize(12).text('Filtros aplicados:', { underline: true });
          doc.fontSize(10);
          if (filtros.fechaInicio) {
            doc.text(`Fecha inicio: ${new Date(filtros.fechaInicio).toLocaleDateString('es-ES')}`);
          }
          if (filtros.fechaFin) {
            doc.text(`Fecha fin: ${new Date(filtros.fechaFin).toLocaleDateString('es-ES')}`);
          }
          if (filtros.modalidad) {
            doc.text(`Modalidad: ${filtros.modalidad}`);
          }
          doc.moveDown();
        }

        // Datos por taller
        doc.fontSize(10);
        datos.forEach((taller) => {
          if (doc.y > doc.page.height - 100) {
            doc.addPage();
          }

          doc.fontSize(12)
            .font('Helvetica-Bold')
            .text(`${taller.tema} (${taller.modalidad})`, { underline: true });
          doc.text(`Satisfacción promedio: ${taller.promedioSatisfaccion.toFixed(2)} | Total feedbacks: ${taller.totalFeedbacks}`);
          doc.moveDown(0.5);
          doc.fontSize(9).font('Helvetica');

          if (taller.feedbacks && taller.feedbacks.length > 0) {
            taller.feedbacks.forEach((fb: any) => {
              if (doc.y > doc.page.height - 80) {
                doc.addPage();
              }

              doc.font('Helvetica-Bold').text(`${fb.participanteNombre} (${fb.participanteEmail})`, {
                indent: 20,
              });
              doc.font('Helvetica').text(`Puntaje: ${fb.puntaje}/5`, { indent: 40 });
              if (fb.comentario) {
                doc.text(`Comentario: ${fb.comentario}`, { indent: 40, width: 450 });
              }
              doc.moveDown(0.3);
            });
          } else {
            doc.text('Sin feedbacks registrados', { indent: 20 });
          }
          doc.moveDown();
        });

        // Pie de página
        const totalPages = doc.bufferedPageRange().count;
        for (let i = 0; i < totalPages; i++) {
          doc.switchToPage(i);
          doc.fontSize(8).text(
            `Página ${i + 1} de ${totalPages} | Generado el ${new Date().toLocaleDateString('es-ES')}`,
            50,
            doc.page.height - 30,
            { align: 'center', width: doc.page.width - 100 },
          );
        }

        doc.end();
      } catch (error) {
        reject(error);
      }
    });
  }
}

