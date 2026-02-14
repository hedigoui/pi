import {
  Injectable,
  NotFoundException,
  BadRequestException,
  UnauthorizedException,
  Inject,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { MongoRepository } from 'typeorm';
import { ObjectId } from 'mongodb';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { Users, UserRole } from './users.models';
import { EmailService } from '../email/email.service';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(Users)
    private readonly userRepository: MongoRepository<Users>,
    private readonly jwtService: JwtService,
    private readonly emailService: EmailService,
  ) {}

  async create(data: {
    email: string;
    password: string;
    firstName: string;
    lastName: string;
    role: UserRole;
    isActive: boolean;
  }): Promise<Users> {
    try {
      console.log('📝 Creating user with email:', data.email);
      
      const existingUser = await this.userRepository.findOneBy({
        email: data.email,
      });

      if (existingUser) {
        throw new BadRequestException('Email already exists');
      }

      const hashedPassword = await bcrypt.hash(data.password, 10);
      console.log('✅ Password hashed successfully');

      const user = this.userRepository.create({
        email: data.email,
        password: hashedPassword,
        firstName: data.firstName,
        lastName: data.lastName,
        role: data.role,
        isActive: data.isActive ?? true,
        createdAt: new Date(),
        updatedAt: new Date()
      });

      const savedUser = await this.userRepository.save(user);
      console.log('✅ User saved successfully with ID:', savedUser._id);
      
      // Send welcome email (don't await - let it run in background)
      this.emailService.sendWelcomeEmail(
        savedUser.email,
        `${savedUser.firstName} ${savedUser.lastName}`
      ).catch(error => {
        console.error('Background email sending failed:', error.message);
      });
      
      // Return user without password
      const { password, ...result } = savedUser;
      return result as Users;
    } catch (error) {
      console.error('❌ Error in create method:', error);
      throw error;
    }
  }

  async findAll(): Promise<Users[]> {
    return this.userRepository.find();
  }

  async findOne(id: string): Promise<Users> {
    if (!ObjectId.isValid(id)) {
      throw new BadRequestException('Invalid user ID format');
    }

    const user = await this.userRepository.findOneBy({
      _id: new ObjectId(id)
    });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    return user;
  }

  async findByEmail(email: string): Promise<Users | null> {
    return this.userRepository.findOneBy({ email });
  }

  async update(
    id: string,
    data: Partial<{
      email: string;
      password: string;
      firstName: string;
      lastName: string;
      role: UserRole;
      isActive: boolean;
    }>,
  ): Promise<Users> {
    if (!ObjectId.isValid(id)) {
      throw new BadRequestException('Invalid user ID format');
    }

    const user = await this.findOne(id);
    
    const statusChanged = data.isActive !== undefined && data.isActive !== user.isActive;
    const oldStatus = user.isActive;

    if (data.password) {
      data.password = await bcrypt.hash(data.password, 10);
    }

    Object.assign(user, data);
    user.updatedAt = new Date();

    const updatedUser = await this.userRepository.save(user);
    
    if (statusChanged) {
      console.log(`📧 Status changed for user ${updatedUser.email}: ${oldStatus} -> ${updatedUser.isActive}`);
      
      // Send status change email (don't await)
      this.emailService.sendStatusChangeEmail(
        updatedUser.email,
        `${updatedUser.firstName} ${updatedUser.lastName}`,
        updatedUser.isActive
      ).catch(error => {
        console.error('Background status email sending failed:', error.message);
      });
    }

    return updatedUser;
  }

  async remove(id: string): Promise<{ message: string }> {
    if (!ObjectId.isValid(id)) {
      throw new BadRequestException('Invalid user ID format');
    }

    const user = await this.findOne(id);
    await this.userRepository.remove(user);
    console.log(`✅ User deleted: ${user.email}`);
    return { message: 'User deleted successfully' };
  }

  async signin(email: string, password: string): Promise<{
    access_token: string;
    user: {
      id: string;
      email: string;
      firstName: string;
      lastName: string;
      role: UserRole;
      isActive: boolean;
    }
  }> {
    try {
      console.log('🔐 Signin attempt for email:', email);
      
      const user = await this.userRepository.findOneBy({ email });
      
      if (!user) {
        throw new UnauthorizedException('Invalid credentials');
      }

      if (!user.isActive) {
        throw new UnauthorizedException('Account is deactivated');
      }

      const isPasswordValid = await bcrypt.compare(password, user.password);
      
      if (!isPasswordValid) {
        throw new UnauthorizedException('Invalid credentials');
      }

      const payload = { 
        sub: user._id.toString(),
        email: user.email,
        role: user.role,
        firstName: user.firstName,
        lastName: user.lastName
      };

      const access_token = this.jwtService.sign(payload);
      console.log('✅ JWT token created for user:', user.email);

      return {
        access_token,
        user: {
          id: user._id.toString(),
          email: user.email,
          firstName: user.firstName,
          lastName: user.lastName,
          role: user.role,
          isActive: user.isActive
        }
      };
    } catch (error) {
      console.error('❌ Error in signin method:', error);
      throw error;
    }
  }
}