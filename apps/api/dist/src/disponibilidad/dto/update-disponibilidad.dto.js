"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.UpdateDisponibilidadDto = void 0;
const mapped_types_1 = require("@nestjs/mapped-types");
const create_disponibilidad_dto_1 = require("./create-disponibilidad.dto");
class UpdateDisponibilidadDto extends (0, mapped_types_1.PartialType)(create_disponibilidad_dto_1.CreateDisponibilidadDto) {
}
exports.UpdateDisponibilidadDto = UpdateDisponibilidadDto;
//# sourceMappingURL=update-disponibilidad.dto.js.map