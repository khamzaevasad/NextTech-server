import { NestFactory } from '@nestjs/core';
import { NextTechBatchModule } from './next-tech-batch.module';

async function bootstrap() {
  const app = await NestFactory.create(NextTechBatchModule);
  await app.listen(process.env.port ?? 3000);
}
bootstrap();
