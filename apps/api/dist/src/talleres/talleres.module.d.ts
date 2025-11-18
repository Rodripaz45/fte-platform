import { TalleresService } from './talleres.service';
export declare class TalleresModule {
    readonly talleresService: TalleresService;
    constructor(talleresService: TalleresService);
    getTalleresService(): TalleresService;
}
