import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { AllExceptionsFilter } from './common/filters/all-exceptions.filter';
import { Logger } from 'nestjs-pino';

async function bootstrap() {
  const app = await NestFactory.create(AppModule, { bufferLogs: true });

  // Use Pino for structured logging
  app.useLogger(app.get(Logger));

  app.setGlobalPrefix('api/v1');

  // Enforce strict validation
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
    }),
  );

  // Use standard error format
  app.useGlobalFilters(new AllExceptionsFilter());

  // Configure Swagger
  const config = new DocumentBuilder()
    .setTitle('Commerce Order Management Platform API')
    .setDescription('Production-oriented E-commerce Backend API')
    .setVersion('1.0')
    .addBearerAuth()
    .build();
  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api/docs', app, document);

  await app.listen(3000);
}
bootstrap().catch((err) => console.error('Application failed to start', err));
