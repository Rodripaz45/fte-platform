declare class ItemAsistenciaDto {
    participanteId: string;
    estado: string;
}
export declare class TomarAsistenciaDto {
    sesionId: string;
    items: ItemAsistenciaDto[];
}
export {};
