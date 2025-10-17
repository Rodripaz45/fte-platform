"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.UpdateAsistenciaDto = void 0;
const swagger_1 = require("@nestjs/swagger");
const create_asistencia_dto_1 = require("./create-asistencia.dto");
class UpdateAsistenciaDto extends (0, swagger_1.PartialType)(create_asistencia_dto_1.CreateAsistenciaDto) {
}
exports.UpdateAsistenciaDto = UpdateAsistenciaDto;
//# sourceMappingURL=update-asistencia.dto.js.map