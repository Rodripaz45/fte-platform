import { PrismaService } from '../../prisma/prisma.service';
type JwtPayload = {
    sub: string;
    email: string;
};
declare const JwtStrategy_base: new (...args: any) => any;
export declare class JwtStrategy extends JwtStrategy_base {
    private readonly prisma;
    private readonly logger;
    private readonly userCache;
    private readonly CACHE_TTL;
    constructor(prisma: PrismaService);
    validate(payload: JwtPayload): Promise<{
        sub: string;
        email: string;
        nombre: string;
        roles: string[];
        estado: string | null;
    }>;
    private cleanExpiredCache;
}
export {};
