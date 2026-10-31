import { NestFactory } from '@nestjs/core';
import { ValidationPipe, Logger } from '@nestjs/common';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { json, urlencoded } from 'express';
import { AppModule } from './app.module';

async function bootstrap() {
  const app    = await NestFactory.create(AppModule, { bufferLogs: true, bodyParser: false });
  const logger = new Logger('Bootstrap');
  app.use(json({ limit: '2mb' }));
  app.use(urlencoded({ extended: true, limit: '2mb' }));

  // ── CORS ────────────────────────────────────────────────────────────────
  const allowedOrigins = new Set([
    'http://localhost:3000',
    'http://localhost:3001',
    'http://localhost:3002',
    'http://localhost:3003',
    'http://127.0.0.1:3000',
    'http://127.0.0.1:3002',
    process.env.FRONTEND_URL ?? '',
  ].filter(Boolean));

  app.enableCors({
    origin: (origin, callback) => {
      if (!origin) return callback(null, true);
      if (origin.endsWith('.vercel.app')) return callback(null, true);
      // Allow any localhost port in dev
      if (/^https?:\/\/(localhost|127\.0\.0\.1)(:\d+)?$/.test(origin)) return callback(null, true);
      if (allowedOrigins.has(origin)) return callback(null, true);
      callback(new Error(`CORS: origin not allowed — ${origin}`));
    },
    credentials: false,
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'X-Api-Key'],
  });

  // ── Global validation ────────────────────────────────────────────────────
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
      transformOptions: { enableImplicitConversion: true },
    }),
  );

  // ── Swagger docs at /docs ────────────────────────────────────────────────
  const swaggerConfig = new DocumentBuilder()
    .setTitle('Playdex API')
    .setDescription(
      '## Playdex Sports Management Platform\n\n' +
      'Complete REST API for managing sports events, venues, bookings, organisations, and users.\n\n' +
      '**Base URL:** `http://localhost:5000`\n\n' +
      '**Demo login:** `POST /users/login` with `{ "email": "superadmin@playdex.io", "password": "SuperAdmin@2024" }`',
    )
    .setVersion('2.0')
    .addTag('Users',         'User accounts and authentication')
    .addTag('Organizations', 'Sports organisations and clubs')
    .addTag('Venues',        'Sports facilities and courts')
    .addTag('Event Types',   'Sport discipline categories')
    .addTag('Events',        'Scheduled sports events')
    .addTag('Bookings',      'Participant registrations')
    .build();

  const document = SwaggerModule.createDocument(app, swaggerConfig);
  SwaggerModule.setup('docs', app, document, {
    swaggerOptions: { persistAuthorization: true },
    customSiteTitle: 'Playdex API Docs',
  });

  // ── Start ────────────────────────────────────────────────────────────────
  const port = Number(process.env.PORT ?? 5000);
  await app.listen(port);
  app.enableShutdownHooks();

  logger.log(`🚀 Playdex API running on http://localhost:${port}`);
  logger.log(`📄 Swagger docs:    http://localhost:${port}/docs`);
}

bootstrap();
