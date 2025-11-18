import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';


async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // CORS - Permitir todos los orígenes para desarrollo
  // En producción, especifica los orígenes permitidos
  app.enableCors({
    origin: true, // Permite todos los orígenes (útil para desarrollo móvil)
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
  });

  // Validación global
  app.useGlobalPipes(
    new ValidationPipe({ 
      whitelist: true, 
      forbidNonWhitelisted: true,
      transform: true, // Necesario para transformar objetos anidados
      transformOptions: {
        enableImplicitConversion: true,
      },
    }),
  );

  // Swagger
  const config = new DocumentBuilder()
    .setTitle('FTE API')
    .setDescription('API para gestión de talleres y participantes (FTE)')
    .setVersion('1.0')
    .addBearerAuth()
    .build();
  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('docs', app, document);

  const port = process.env.PORT || 4000;
  const host = process.env.HOST || '0.0.0.0'; // Escuchar en todas las interfaces
  await app.listen(port, host);
  // eslint-disable-next-line no-console
  console.log(`🚀 API running on http://${host === '0.0.0.0' ? 'localhost' : host}:${port} (Swagger: /docs)`);
  console.log(`📱 Accesible desde la red local en: http://TU_IP:${port}`);
}
bootstrap();
