// Standalone seed script
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.createApplicationContext(AppModule);
  // The SeedService runs via OnModuleInit, so just creating the context seeds it
  await app.close();
}
bootstrap().then(() => {
  console.log('Seed complete');
  process.exit(0);
}).catch(err => {
  console.error('Seed error:', err);
  process.exit(1);
});
