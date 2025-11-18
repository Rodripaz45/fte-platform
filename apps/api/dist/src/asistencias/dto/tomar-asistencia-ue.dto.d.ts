export declare class ItemAsistenciaUEDto {
    listaParticipanteUEId: string;
    estado?: string;
    observaciones?: string;
}
export declare class TomarAsistenciaUEDto {
    sesionId: string;
    items: ItemAsistenciaUEDto[];
}
