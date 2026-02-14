import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import * as dotenv from 'dotenv';

// Load environment variables immediately
dotenv.config();

console.log('🚀 Starting application...');
console.log('📧 Email Configuration:');
console.log('  - USER:', process.env.EMAIL_USER ? '✅ Set' : '❌ Not set');
console.log('  - PASSWORD:', process.env.EMAIL_PASSWORD ? '✅ Set' : '❌ Not set');
console.log('  - JWT_SECRET:', process.env.JWT_SECRET ? '✅ Set' : '❌ Not set');

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  
  const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:3001';
  
  app.enableCors({
    origin: [frontendUrl, 'http://localhost:3001', 'http://localhost:5173'],
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE',
    credentials: true,
  });
  
  await app.listen(3000);
  console.log(`✅ Application is running on: http://localhost:3000`);
  console.log(`🌐 CORS enabled for: ${frontendUrl}`);
}
bootstrap();