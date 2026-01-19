"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.UpdateSalaDto = void 0;
const mapped_types_1 = require("@nestjs/mapped-types");
const create_sala_dto_1 = require("./create-sala.dto");
class UpdateSalaDto extends (0, mapped_types_1.PartialType)(create_sala_dto_1.CreateSalaDto) {
}
exports.UpdateSalaDto = UpdateSalaDto;
//# sourceMappingURL=update-sala.dto.js.map