import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import helmet from 'helmet';
import cookieParser from 'cookie-parser';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // Security
  app.use(helmet());

  const isProduction = process.env.NODE_ENV === 'production';
  const allowedOrigin = process.env.FRONTEND_URL || '*';

  app.enableCors({
    origin: isProduction ? allowedOrigin : '*',
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE,OPTIONS',
    credentials: true,
  });
  app.use(cookieParser());

  // ── Health check endpoint (MUST be before setGlobalPrefix) ──────────────
  // Lives at GET /health — not /api/health — so it's always reachable
  // Used by: deploy.sh blue-green check, Docker HEALTHCHECK, uptime monitors
  const httpAdapter = app.getHttpAdapter();
  httpAdapter.get('/health', (_req: any, res: any) => {
    res.status(200).json({ status: 'ok', timestamp: new Date().toISOString() });
  });

  // Global prefixes
  app.setGlobalPrefix('api');

  // Swagger Documentation
  const config = new DocumentBuilder()
    .setTitle('E-Commerce API')
    .setDescription('Full-stack Modern E-Commerce Platform API')
    .setVersion('1.0')
    .addBearerAuth()
    .build();

  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api/docs', app, document);

  await app.listen(process.env.PORT || 3001);

}
bootstrap();
