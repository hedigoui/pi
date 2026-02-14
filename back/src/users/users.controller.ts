import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  HttpCode,
  HttpStatus,
  BadRequestException,
} from '@nestjs/common';
import { UsersService } from './users.service';
import { UserRole } from './users.models';

@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Post()
  async create(
    @Body()
    body: {
      email: string;
      password: string;
      firstName: string;
      lastName: string;
      role: UserRole;
      isActive: boolean;
    },
  ) {
    try {
      // Validate required fields
      if (!body.email || !body.password || !body.firstName || !body.lastName || !body.role) {
        throw new BadRequestException('Missing required fields');
      }
      
      return await this.usersService.create(body);
    } catch (error) {
      console.error('Controller error:', error);
      throw error; // NestJS will handle the error response
    }
  }

  @Get()
  findAll() {
    return this.usersService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.usersService.findOne(id);
  }

  @Patch(':id')
  update(
    @Param('id') id: string,
    @Body() body: any,
  ) {
    return this.usersService.update(id, body);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.usersService.remove(id);
  }

  @Post('signin')
  @HttpCode(HttpStatus.OK)
  async signin(
    @Body()
    body: {
      email: string;
      password: string;
    },
  ) {
    try {
      if (!body.email || !body.password) {
        throw new BadRequestException('Email and password are required');
      }
      
      return await this.usersService.signin(body.email, body.password);
    } catch (error) {
      console.error('Signin error:', error);
      throw error;
    }
  }
}