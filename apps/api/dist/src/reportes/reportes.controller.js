"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ReportesController = void 0;
const common_1 = require("@nestjs/common");
const swagger_1 = require("@nestjs/swagger");
const reportes_service_1 = require("./reportes.service");
const filtros_reporte_dto_1 = require("./dto/filtros-reporte.dto");
const roles_decorator_1 = require("../auth/roles.decorator");
let ReportesController = class ReportesController {
    reportesService;
    constructor(reportesService) {
        this.reportesService = reportesService;
    }
    async dashboardEjecutivo(filtros) {
        return this.reportesService.dashboardEjecutivo(filtros);
    }
    async tasaAsistencia(filtros) {
        return this.reportesService.tasaAsistenciaPorTaller(filtros);
    }
    async satisfaccion(filtros) {
        return this.reportesService.satisfaccionPorTaller(filtros);
    }
    async recurrencia(filtros) {
        return this.reportesService.tasaRecurrencia(filtros);
    }
    async cobertura(filtros) {
        return this.reportesService.cobertura(filtros);
    }
    async reporteInscripciones(filtros) {
        return this.reportesService.reporteInscripciones(filtros);
    }
    async reporteAsistencia(filtros) {
        return this.reportesService.reporteAsistencia(filtros);
    }
    async reporteSatisfaccion(filtros) {
        return this.reportesService.reporteSatisfaccion(filtros);
    }
    async exportarCSV(filtros, tipo, res) {
        let datos = [];
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
        const csv = this.convertirACSV(datos, tipo);
        const filename = `reporte_${tipo}_${new Date().toISOString().split('T')[0]}.csv`;
        res.setHeader('Content-Type', 'text/csv; charset=utf-8');
        res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
        res.send('\ufeff' + csv);
    }
    convertirACSV(datos, tipo) {
        if (datos.length === 0)
            return '';
        const filas = [];
        if (tipo === 'inscripciones') {
            filas.push('Taller,Modalidad,Fecha Inicio,Fecha Fin,Participante,Email,Estado,Fecha Inscripción');
            datos.forEach((insc) => {
                filas.push([
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
                    .join(','));
            });
        }
        else if (tipo === 'asistencia') {
            filas.push('Taller,Modalidad,Sesión,Fecha,Participante,Email,Estado');
            datos.forEach((taller) => {
                taller.sesiones.forEach((sesion) => {
                    sesion.asistencias.forEach((asist) => {
                        filas.push([
                            taller.tema || '',
                            taller.modalidad || '',
                            sesion.fecha ? new Date(sesion.fecha).toLocaleDateString('es-ES') : '',
                            sesion.fecha ? new Date(sesion.fecha).toLocaleDateString('es-ES') : '',
                            asist.participanteNombre || '',
                            asist.participanteEmail || '',
                            asist.estado || '',
                        ]
                            .map((v) => `"${String(v).replace(/"/g, '""')}"`)
                            .join(','));
                    });
                });
            });
        }
        else if (tipo === 'satisfaccion') {
            filas.push('Taller,Modalidad,Participante,Email,Puntaje,Comentario,Fecha');
            datos.forEach((taller) => {
                taller.feedbacks.forEach((fb) => {
                    filas.push([
                        taller.tema || '',
                        taller.modalidad || '',
                        fb.participanteNombre || '',
                        fb.participanteEmail || '',
                        fb.puntaje || '',
                        (fb.comentario || '').replace(/"/g, '""'),
                        fb.creadoEn ? new Date(fb.creadoEn).toLocaleDateString('es-ES') : '',
                    ]
                        .map((v) => `"${String(v).replace(/"/g, '""')}"`)
                        .join(','));
                });
            });
        }
        return filas.join('\n');
    }
};
exports.ReportesController = ReportesController;
__decorate([
    (0, roles_decorator_1.Roles)('ADMIN', 'TRAINER'),
    (0, common_1.Get)('dashboard'),
    (0, swagger_1.ApiOperation)({ summary: 'Dashboard ejecutivo con todos los KPIs' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Dashboard ejecutivo' }),
    __param(0, (0, common_1.Query)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [filtros_reporte_dto_1.FiltrosReporteDto]),
    __metadata("design:returntype", Promise)
], ReportesController.prototype, "dashboardEjecutivo", null);
__decorate([
    (0, roles_decorator_1.Roles)('ADMIN', 'TRAINER'),
    (0, common_1.Get)('asistencia'),
    (0, swagger_1.ApiOperation)({ summary: 'KPI: Tasa de asistencia por taller' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Tasa de asistencia por taller' }),
    __param(0, (0, common_1.Query)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [filtros_reporte_dto_1.FiltrosReporteDto]),
    __metadata("design:returntype", Promise)
], ReportesController.prototype, "tasaAsistencia", null);
__decorate([
    (0, roles_decorator_1.Roles)('ADMIN', 'TRAINER'),
    (0, common_1.Get)('satisfaccion'),
    (0, swagger_1.ApiOperation)({ summary: 'KPI: Satisfacción promedio por taller' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Satisfacción promedio por taller' }),
    __param(0, (0, common_1.Query)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [filtros_reporte_dto_1.FiltrosReporteDto]),
    __metadata("design:returntype", Promise)
], ReportesController.prototype, "satisfaccion", null);
__decorate([
    (0, roles_decorator_1.Roles)('ADMIN', 'TRAINER'),
    (0, common_1.Get)('recurrencia'),
    (0, swagger_1.ApiOperation)({ summary: 'KPI: Tasa de recurrencia de participantes' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Tasa de recurrencia' }),
    __param(0, (0, common_1.Query)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [filtros_reporte_dto_1.FiltrosReporteDto]),
    __metadata("design:returntype", Promise)
], ReportesController.prototype, "recurrencia", null);
__decorate([
    (0, roles_decorator_1.Roles)('ADMIN', 'TRAINER'),
    (0, common_1.Get)('cobertura'),
    (0, swagger_1.ApiOperation)({ summary: 'KPI: Cobertura (participantes únicos)' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Cobertura' }),
    __param(0, (0, common_1.Query)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [filtros_reporte_dto_1.FiltrosReporteDto]),
    __metadata("design:returntype", Promise)
], ReportesController.prototype, "cobertura", null);
__decorate([
    (0, roles_decorator_1.Roles)('ADMIN', 'TRAINER'),
    (0, common_1.Get)('inscripciones'),
    (0, swagger_1.ApiOperation)({ summary: 'Reporte detallado de inscripciones' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Reporte de inscripciones' }),
    __param(0, (0, common_1.Query)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [filtros_reporte_dto_1.FiltrosReporteDto]),
    __metadata("design:returntype", Promise)
], ReportesController.prototype, "reporteInscripciones", null);
__decorate([
    (0, roles_decorator_1.Roles)('ADMIN', 'TRAINER'),
    (0, common_1.Get)('asistencia-detalle'),
    (0, swagger_1.ApiOperation)({ summary: 'Reporte detallado de asistencia' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Reporte de asistencia' }),
    __param(0, (0, common_1.Query)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [filtros_reporte_dto_1.FiltrosReporteDto]),
    __metadata("design:returntype", Promise)
], ReportesController.prototype, "reporteAsistencia", null);
__decorate([
    (0, roles_decorator_1.Roles)('ADMIN', 'TRAINER'),
    (0, common_1.Get)('satisfaccion-detalle'),
    (0, swagger_1.ApiOperation)({ summary: 'Reporte detallado de satisfacción' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Reporte de satisfacción' }),
    __param(0, (0, common_1.Query)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [filtros_reporte_dto_1.FiltrosReporteDto]),
    __metadata("design:returntype", Promise)
], ReportesController.prototype, "reporteSatisfaccion", null);
__decorate([
    (0, roles_decorator_1.Roles)('ADMIN', 'TRAINER'),
    (0, common_1.Get)('exportar/csv'),
    (0, swagger_1.ApiOperation)({ summary: 'Exportar reporte a CSV' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Archivo CSV' }),
    __param(0, (0, common_1.Query)()),
    __param(1, (0, common_1.Query)('tipo')),
    __param(2, (0, common_1.Res)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [filtros_reporte_dto_1.FiltrosReporteDto, String, Object]),
    __metadata("design:returntype", Promise)
], ReportesController.prototype, "exportarCSV", null);
exports.ReportesController = ReportesController = __decorate([
    (0, swagger_1.ApiTags)('Reportes'),
    (0, swagger_1.ApiBearerAuth)(),
    (0, common_1.Controller)('reportes'),
    __metadata("design:paramtypes", [reportes_service_1.ReportesService])
], ReportesController);
//# sourceMappingURL=reportes.controller.js.map