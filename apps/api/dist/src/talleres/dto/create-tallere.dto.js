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
exports.CreateTallereDto = void 0;
const swagger_1 = require("@nestjs/swagger");
const class_validator_1 = require("class-validator");
const class_transformer_1 = require("class-transformer");
class CreateTallereDto {
    tema;
    modalidad;
    cupos;
    fechaInicio;
    fechaFin;
    sede;
    estado;
    trainerId;
    tipo;
    unidadEducativaId;
    unidadEducativaNombre;
}
exports.CreateTallereDto = CreateTallereDto;
__decorate([
    (0, swagger_1.ApiProperty)(),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsNotEmpty)(),
    __metadata("design:type", String)
], CreateTallereDto.prototype, "tema", void 0);
__decorate([
    (0, swagger_1.ApiProperty)(),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsNotEmpty)(),
    __metadata("design:type", String)
], CreateTallereDto.prototype, "modalidad", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ required: false }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsInt)(),
    (0, class_validator_1.Min)(1),
    __metadata("design:type", Number)
], CreateTallereDto.prototype, "cupos", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ required: false }),
    (0, class_validator_1.IsOptional)(),
    (0, class_transformer_1.Type)(() => Date),
    (0, class_validator_1.IsDate)(),
    __metadata("design:type", Date)
], CreateTallereDto.prototype, "fechaInicio", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ required: false }),
    (0, class_validator_1.IsOptional)(),
    (0, class_transformer_1.Type)(() => Date),
    (0, class_validator_1.IsDate)(),
    __metadata("design:type", Date)
], CreateTallereDto.prototype, "fechaFin", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ required: false }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], CreateTallereDto.prototype, "sede", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ default: 'PROGRAMADO' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], CreateTallereDto.prototype, "estado", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'ID del trainer asignado al taller' }),
    (0, class_validator_1.IsUUID)(),
    (0, class_validator_1.IsNotEmpty)(),
    __metadata("design:type", String)
], CreateTallereDto.prototype, "trainerId", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ required: false, description: 'Tipo de taller: NORMAL o UNIDAD_EDUCATIVA' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], CreateTallereDto.prototype, "tipo", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ required: false, description: 'ID de la unidad educativa (requerido si tipo es UNIDAD_EDUCATIVA)' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsUUID)(),
    __metadata("design:type", String)
], CreateTallereDto.prototype, "unidadEducativaId", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ required: false, description: 'Nombre de la unidad educativa (se creará si no existe)' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], CreateTallereDto.prototype, "unidadEducativaNombre", void 0);
//# sourceMappingURL=create-tallere.dto.js.map