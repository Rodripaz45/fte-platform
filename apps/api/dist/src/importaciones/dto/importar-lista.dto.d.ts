export declare class ParticipanteImportadoDto {
    nombre: string;
    documento?: string;
    email?: string;
    telefono?: string;
    genero?: string;
    fechaNac?: string;
}
export declare class ImportarListaDto {
    tallerId: string;
    participantes: ParticipanteImportadoDto[];
}
