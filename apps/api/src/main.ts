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

  // Global prefix — /health is excluded so it stays at root (not /api/health)
  // This is the proper NestJS way vs using httpAdapter.get() directly
  app.setGlobalPrefix('api', { exclude: ['health'] });


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
