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
exports.CreateSesionesRecurrentesDto = void 0;
const swagger_1 = require("@nestjs/swagger");
const class_transformer_1 = require("class-transformer");
const class_validator_1 = require("class-validator");
const DIAS_VALIDOS = [
    'LUNES',
    'MARTES',
    'MIERCOLES',
    'JUEVES',
    'VIERNES',
    'SABADO',
    'DOMINGO',
];
class CreateSesionesRecurrentesDto {
    tallerId;
    fechaInicio;
    fechaFin;
    diasSemana;
    horaInicio;
    horaFin;
    responsableId;
    salaId;
}
exports.CreateSesionesRecurrentesDto = CreateSesionesRecurrentesDto;
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'ID del taller' }),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsNotEmpty)(),
    __metadata("design:type", String)
], CreateSesionesRecurrentesDto.prototype, "tallerId", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Fecha inicial del rango (inclusive)' }),
    (0, class_transformer_1.Type)(() => Date),
    (0, class_validator_1.IsDate)(),
    __metadata("design:type", Date)
], CreateSesionesRecurrentesDto.prototype, "fechaInicio", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Fecha final del rango (inclusive)' }),
    (0, class_transformer_1.Type)(() => Date),
    (0, class_validator_1.IsDate)(),
    __metadata("design:type", Date)
], CreateSesionesRecurrentesDto.prototype, "fechaFin", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'Días de la semana en los que se crearán sesiones',
        example: ['LUNES', 'MARTES', 'MIERCOLES', 'JUEVES', 'VIERNES'],
    }),
    (0, class_validator_1.IsArray)(),
    (0, class_validator_1.ArrayNotEmpty)(),
    (0, class_validator_1.IsString)({ each: true }),
    __metadata("design:type", Array)
], CreateSesionesRecurrentesDto.prototype, "diasSemana", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: 'Hora de inicio (ISO) aplicable a todas las sesiones' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_transformer_1.Type)(() => Date),
    (0, class_validator_1.IsDate)(),
    __metadata("design:type", Date)
], CreateSesionesRecurrentesDto.prototype, "horaInicio", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: 'Hora de fin (ISO) aplicable a todas las sesiones' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.ValidateIf)((obj) => !!obj.horaInicio),
    (0, class_transformer_1.Type)(() => Date),
    (0, class_validator_1.IsDate)(),
    __metadata("design:type", Date)
], CreateSesionesRecurrentesDto.prototype, "horaFin", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: 'Usuario responsable (opcional)' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], CreateSesionesRecurrentesDto.prototype, "responsableId", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: 'ID de la sala (opcional, para sesiones presenciales)' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], CreateSesionesRecurrentesDto.prototype, "salaId", void 0);
//# sourceMappingURL=create-sesiones-recurrentes.dto.js.map