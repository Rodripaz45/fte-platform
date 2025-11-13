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
Object.defineProperty(exports, "__esModule", { value: true });
exports.FiltrosReporteDto = void 0;
const swagger_1 = require("@nestjs/swagger");
const class_validator_1 = require("class-validator");
class FiltrosReporteDto {
    fechaInicio;
    fechaFin;
    modalidad;
    tallerId;
    participanteId;
}
exports.FiltrosReporteDto = FiltrosReporteDto;
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: 'Fecha de inicio del periodo (ISO 8601)' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsDateString)(),
    __metadata("design:type", String)
], FiltrosReporteDto.prototype, "fechaInicio", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: 'Fecha de fin del periodo (ISO 8601)' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsDateString)(),
    __metadata("design:type", String)
], FiltrosReporteDto.prototype, "fechaFin", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: 'Modalidad del taller (PRESENCIAL, VIRTUAL, MIXTA)' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], FiltrosReporteDto.prototype, "modalidad", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: 'ID del taller específico' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], FiltrosReporteDto.prototype, "tallerId", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: 'ID del participante específico' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], FiltrosReporteDto.prototype, "participanteId", void 0);
//# sourceMappingURL=filtros-reporte.dto.js.map