import { NestFactory } from '@nestjs/core';
import { ValidationPipe, Logger } from '@nestjs/common';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import { AppModule } from './app.module';
import { HttpExceptionFilter } from './common/filters/http-exception.filter';
import { ResponseInterceptor } from './common/interceptors/response.interceptor';
import * as helmet from 'helmet';

async function bootstrap() {
  const logger = new Logger('Bootstrap');
  const app = await NestFactory.create(AppModule);

  app.use(helmet());

  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      transform: true,
      forbidNonWhitelisted: false,
      transformOptions: {
        enableImplicitConversion: true,
      },
    }),
  );

  app.useGlobalFilters(new HttpExceptionFilter());
  app.useGlobalInterceptors(new ResponseInterceptor());

  const allowedOrigins = getAllowedOrigins();
  app.enableCors({
    origin: (origin: string, callback: (err: Error | null, allow?: boolean) => void) => {
      if (!origin) {
        return callback(null, true);
      }

      if (allowedOrigins.includes(origin)) {
        return callback(null, true);
      }

      logger.warn(`CORS: Blocked request from unauthorized origin: ${origin}`);
      return callback(new Error('Not allowed by CORS'), false);
    },
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE,OPTIONS',
    credentials: true,
  });

  const config = new DocumentBuilder()
    .setTitle('INSA Intern Management API')
    .setDescription('API for managing internship applications and interns')
    .setVersion('1.0')
    .addBearerAuth()
    .build();

  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api/docs', app, document);

  const port = process.env.PORT || 5005;
  await app.listen(port);

  logger.log(`Application is running on: http://localhost:${port}`);
  logger.log(`Swagger docs available at: http://localhost:${port}/api/docs`);
  logger.log(`CORS enabled for origins: ${allowedOrigins.join(', ')}`);
}

function getAllowedOrigins(): string[] {
  const envOrigins = process.env.ALLOWED_ORIGINS;
  
  if (envOrigins) {
    return envOrigins.split(',').map(origin => origin.trim());
  }

  const defaultOrigins = [
    'http://localhost:3000',
    'http://127.0.0.1:3000',
  ];

  console.warn('⚠️  SECURITY WARNING: Using default CORS origins for development.');
  console.warn('   Set ALLOWED_ORIGINS environment variable for production!');
  
  return defaultOrigins;
}

bootstrap();