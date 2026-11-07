import { NestFactory } from '@nestjs/core';
import { configureApplication } from './app.configuration.js';
import { AppModule } from './app.module.js';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  configureApplication(app);
  app.enableShutdownHooks();
  await app.listen(process.env.PORT ?? 3000);
}
await bootstrap();
