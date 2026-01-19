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
exports.CalendarioController = void 0;
const common_1 = require("@nestjs/common");
const swagger_1 = require("@nestjs/swagger");
const calendario_service_1 = require("./calendario.service");
const filtros_calendario_dto_1 = require("./dto/filtros-calendario.dto");
let CalendarioController = class CalendarioController {
    calendarioService;
    constructor(calendarioService) {
        this.calendarioService = calendarioService;
    }
    obtenerEventos(filtros) {
        return this.calendarioService.obtenerEventos(filtros);
    }
    detectarConflictos(fechaInicio, fechaFin) {
        return this.calendarioService.detectarConflictos(fechaInicio, fechaFin);
    }
};
exports.CalendarioController = CalendarioController;
__decorate([
    (0, common_1.Get)('eventos'),
    (0, swagger_1.ApiOperation)({ summary: 'Obtener eventos del calendario con filtros' }),
    __param(0, (0, common_1.Query)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [filtros_calendario_dto_1.FiltrosCalendarioDto]),
    __metadata("design:returntype", void 0)
], CalendarioController.prototype, "obtenerEventos", null);
__decorate([
    (0, common_1.Get)('conflictos'),
    (0, swagger_1.ApiOperation)({ summary: 'Detectar conflictos en el calendario' }),
    __param(0, (0, common_1.Query)('fechaInicio')),
    __param(1, (0, common_1.Query)('fechaFin')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String]),
    __metadata("design:returntype", void 0)
], CalendarioController.prototype, "detectarConflictos", null);
exports.CalendarioController = CalendarioController = __decorate([
    (0, swagger_1.ApiTags)('Calendario'),
    (0, swagger_1.ApiBearerAuth)(),
    (0, common_1.Controller)('calendario'),
    __metadata("design:paramtypes", [calendario_service_1.CalendarioService])
], CalendarioController);
//# sourceMappingURL=calendario.controller.js.map