import { NestFactory } from '@nestjs/core';
import { SeederModule } from './seeder.module';
import { DatabaseSeederService } from './seeder.service';
import { Logger } from '@nestjs/common';

async function bootstrap() {
  const logger = new Logger('DatabaseSeeder');
  
  try {
    logger.log('Starting database seeding process...');
    
    const app = await NestFactory.createApplicationContext(SeederModule);
    const seederService = app.get(DatabaseSeederService);
    
    await seederService.seed();
    
    logger.log('Database seeding completed successfully!');
    await app.close();
    process.exit(0);
  } catch (error) {
    logger.error('Database seeding failed:', error);
    process.exit(1);
  }
}

bootstrap();
