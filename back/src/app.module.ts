import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { UsersModule } from './users/users.module';
import { TypeOrmModule } from '@nestjs/typeorm';
import { JwtModule } from '@nestjs/jwt';
import { Users } from './users/users.models';

@Module({
  imports: [
    TypeOrmModule.forRoot({
      type: 'mongodb',
      host: 'localhost',
      port: 27017,
      database: 'evalAI',
      entities: [Users],
      synchronize: true, // À utiliser uniquement en développement
    }),
    JwtModule.register({
      secret: 'your-secret-key-change-this-in-production', // Use environment variable in production
      signOptions: { expiresIn: '1d' },
    }),
    UsersModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}