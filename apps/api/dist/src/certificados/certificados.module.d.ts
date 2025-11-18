import { OnModuleInit } from '@nestjs/common';
import { ModuleRef } from '@nestjs/core';
import { CertificadosService } from './certificados.service';
export declare class CertificadosModule implements OnModuleInit {
    private readonly certificadosService;
    private readonly moduleRef;
    constructor(certificadosService: CertificadosService, moduleRef: ModuleRef);
    onModuleInit(): void;
}
