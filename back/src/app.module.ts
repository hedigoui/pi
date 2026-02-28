import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { UsersModule } from './users/users.module';
import { PracticeSessionModule } from './practice-session/practice-session.module';
import { TypeOrmModule } from '@nestjs/typeorm';
import { JwtModule } from '@nestjs/jwt';
import { Users } from './users/users.models';
import { PracticeSession } from './practice-session/practice-session.models';

@Module({
  imports: [
    TypeOrmModule.forRoot({
      type: 'mongodb',
      host: 'localhost',
      port: 27017,
      database: 'evalAI',
      entities: [Users, PracticeSession],
      synchronize: true, // À utiliser uniquement en développement
    }),
    JwtModule.register({
      secret: 'your-secret-key-change-this-in-production', // Use environment variable in production
      signOptions: { expiresIn: '1d' },
    }),
    UsersModule,
    PracticeSessionModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}