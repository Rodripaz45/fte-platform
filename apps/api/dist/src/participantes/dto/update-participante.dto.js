"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.UpdateParticipanteDto = void 0;
const swagger_1 = require("@nestjs/swagger");
const create_participante_dto_1 = require("./create-participante.dto");
class UpdateParticipanteDto extends (0, swagger_1.PartialType)(create_participante_dto_1.CreateParticipanteDto) {
}
exports.UpdateParticipanteDto = UpdateParticipanteDto;
//# sourceMappingURL=update-participante.dto.js.map