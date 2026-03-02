import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { UsersModule } from './users/users.module';
import { AuthModule } from './auth/auth.module';
import { CommunicationModule } from './communication/communication.module';
import { TypeOrmModule } from '@nestjs/typeorm';
import { JwtModule } from '@nestjs/jwt';
import { Users } from './users/users.models';
import { Message, Conversation, Appointment, Notification } from './communication/communication.models';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    TypeOrmModule.forRoot({
      type: 'mongodb',
      host: 'localhost',
      port: 27017,
      database: 'evalAI',
      entities: [Users, Message, Conversation, Appointment, Notification],
      synchronize: true, // À utiliser uniquement en développement
    }),
    JwtModule.register({
      secret: 'your-secret-key-change-this-in-production', // Use environment variable in production
      signOptions: { expiresIn: '1d' },
    }),
    UsersModule,
    AuthModule,
    CommunicationModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}