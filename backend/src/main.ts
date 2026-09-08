import * as dotenv from 'dotenv';
dotenv.config();

// Strict Security Check: Fail-fast if JWT_SECRET is missing
if (!process.env.JWT_SECRET || process.env.JWT_SECRET.trim() === '') {
  console.error('❌ FATAL SECURITY CONFIGURATION ERROR: JWT_SECRET environment variable is missing or empty in .env!');
  process.exit(1);
}

import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { AllExceptionsFilter } from './common/filters/all-exceptions.filter';
import { Request, Response, NextFunction, json, urlencoded } from 'express';
import BrandConfig from './config/brand.config';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // Request Body Size Limits (DoS Protection)
  app.use(json({ limit: '10mb' }));
  app.use(urlencoded({ extended: true, limit: '10mb' }));

  // Security Headers Middleware
  app.use((req: Request, res: Response, next: NextFunction) => {
    res.setHeader('X-Content-Type-Options', 'nosniff');
    res.setHeader('X-Frame-Options', 'SAMEORIGIN');
    res.setHeader('X-XSS-Protection', '1; mode=block');
    res.setHeader('Referrer-Policy', 'strict-origin-when-cross-origin');
    res.setHeader('X-Permitted-Cross-Domain-Policies', 'none');
    if (process.env.NODE_ENV === 'production') {
      res.setHeader('Strict-Transport-Security', 'max-age=31536000; includeSubDomains; preload');
    }
    next();
  });

  // Hardened CORS Configuration
  const corsOrigins = process.env.CORS_ORIGIN
    ? process.env.CORS_ORIGIN.split(',').map((o) => o.trim())
    : ['http://localhost:8080', 'http://localhost:8081', 'http://localhost:3000', 'http://localhost:5173'];

  app.enableCors({
    origin: (origin, callback) => {
      // Allow requests with no origin (e.g. mobile apps, curl, server-to-server) or matched origins
      if (!origin || corsOrigins.includes(origin) || process.env.NODE_ENV !== 'production') {
        callback(null, true);
      } else {
        callback(new Error(`CORS policy blocked access from origin: ${origin}`));
      }
    },
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE,OPTIONS',
    credentials: true,
  });

  // Global Validation Pipe
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
      transformOptions: {
        enableImplicitConversion: true,
      },
    }),
  );

  // Global Exception Filter
  app.useGlobalFilters(new AllExceptionsFilter());

  app.setGlobalPrefix('api');

  // Swagger OpenAPI Documentation
  const isSwaggerEnabled = process.env.NODE_ENV !== 'production' || process.env.SWAGGER_ENABLED === 'true';
  if (isSwaggerEnabled) {
    const config = new DocumentBuilder()
      .setTitle(BrandConfig.apiTitle)
      .setDescription(BrandConfig.apiDescription)
      .setVersion(BrandConfig.apiVersion)
      .addBearerAuth()
      .build();

    const document = SwaggerModule.createDocument(app, config);
    SwaggerModule.setup('api/docs', app, document);
  }

  const port = process.env.PORT || 3000;
  await app.listen(port);
  console.log(`🚀 ${BrandConfig.name} Server ishga tushdi: http://localhost:${port}/api`);
  if (isSwaggerEnabled) {
    console.log(`📚 Swagger API Hujjatlari: http://localhost:${port}/api/docs`);
  }
}
bootstrap();
