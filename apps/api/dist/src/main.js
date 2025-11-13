"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const core_1 = require("@nestjs/core");
const app_module_1 = require("./app.module");
const common_1 = require("@nestjs/common");
const swagger_1 = require("@nestjs/swagger");
async function bootstrap() {
    const app = await core_1.NestFactory.create(app_module_1.AppModule);
    app.enableCors({
        origin: true,
        credentials: true,
        methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
        allowedHeaders: ['Content-Type', 'Authorization'],
    });
    app.useGlobalPipes(new common_1.ValidationPipe({ whitelist: true, forbidNonWhitelisted: true }));
    const config = new swagger_1.DocumentBuilder()
        .setTitle('FTE API')
        .setDescription('API para gestión de talleres y participantes (FTE)')
        .setVersion('1.0')
        .addBearerAuth()
        .build();
    const document = swagger_1.SwaggerModule.createDocument(app, config);
    swagger_1.SwaggerModule.setup('docs', app, document);
    const port = process.env.PORT || 4000;
    const host = process.env.HOST || '0.0.0.0';
    await app.listen(port, host);
    console.log(`🚀 API running on http://${host === '0.0.0.0' ? 'localhost' : host}:${port} (Swagger: /docs)`);
    console.log(`📱 Accesible desde la red local en: http://TU_IP:${port}`);
}
bootstrap();
//# sourceMappingURL=main.js.map