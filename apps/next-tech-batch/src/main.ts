import { NestFactory } from '@nestjs/core';
import { NextTechBatchModule } from './next-tech-batch.module';

async function bootstrap() {
  const app = await NestFactory.create(NextTechBatchModule);
  await app.listen(process.env.PORT_BATCH ?? 3000);
}
bootstrap();
