"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.UpdateSesionDto = void 0;
const swagger_1 = require("@nestjs/swagger");
const create_sesion_dto_1 = require("./create-sesion.dto");
class UpdateSesionDto extends (0, swagger_1.PartialType)(create_sesion_dto_1.CreateSesionDto) {
}
exports.UpdateSesionDto = UpdateSesionDto;
//# sourceMappingURL=update-sesion.dto.js.map