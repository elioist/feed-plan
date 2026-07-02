import 'reflect-metadata';
import { Logger } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { ConfigService } from '@nestjs/config';
import { type NestExpressApplication } from '@nestjs/platform-express';
import { resolve } from 'node:path';
import { AppModule } from './app.module.js';

async function bootstrap() {
  const app = await NestFactory.create<NestExpressApplication>(AppModule);
  const config = app.get(ConfigService);
  const port = config.get<number>('PORT') ?? 9527;
  const uploadDir = config.get<string>('UPLOAD_DIR') ?? 'uploads';

  app.useStaticAssets(resolve(process.cwd(), uploadDir), {
    prefix: '/uploads/',
  });

  await app.listen(port, '0.0.0.0');
  Logger.log(`Server listening on http://0.0.0.0:${port}`, 'Bootstrap');
}

void bootstrap();
