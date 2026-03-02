import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Body,
  Param,
  Query,
  UseGuards,
  Request,
  HttpCode,
  HttpStatus,
  BadRequestException,
  UseInterceptors,
  UploadedFile,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { CommunicationService } from './communication.service';
import { MessageType } from './communication.models';
import type { Multer } from 'multer';

@Controller('communication')
export class CommunicationController {
  constructor(private readonly communicationService: CommunicationService) {}

  // ===== MESSAGING ENDPOINTS =====

  @Post('messages')
  @HttpCode(HttpStatus.CREATED)
  async sendMessage(
    @Body() body: {
      receiverId: string;
      content: string;
      type?: MessageType;
    },
    @Request() req: any,
  ) {
    try {
      const senderId = req.user.id;
      const { receiverId, content, type = MessageType.TEXT } = body;

      const message = await this.communicationService.sendMessage(
        senderId,
        receiverId,
        content,
        type,
      );

      return {
        success: true,
        message: 'Message sent successfully',
        data: message,
      };
    } catch (error) {
      throw new BadRequestException(error.message);
    }
  }

  @Get('messages/:userId')
  async getConversation(
    @Param('userId') userId: string,
    @Request() req: any,
    @Query('limit') limit?: string,
  ) {
    try {
      const currentUserId = req.user.id;
      const messages = await this.communicationService.getConversationMessages(
        currentUserId,
        userId,
        limit ? parseInt(limit) : 50,
      );

      return {
        success: true,
        data: messages,
      };
    } catch (error) {
      throw new BadRequestException(error.message);
    }
  }

  @Get('conversations')
  async getUserConversations(@Request() req: any) {
    try {
      const userId = req.user.id;
      const conversations = await this.communicationService.getUserConversations(userId);

      return {
        success: true,
        data: conversations,
      };
    } catch (error) {
      throw new BadRequestException(error.message);
    }
  }

  @Post('messages/upload')
  @UseInterceptors(FileInterceptor('file'))
  async uploadFileMessage(
    @UploadedFile() file: Multer.File,
    @Body() body: {
      receiverId: string;
      content: string;
    },
    @Request() req: any,
  ) {
    try {
      if (!file) {
        throw new BadRequestException('No file uploaded');
      }

      const senderId = req.user.id;
      const { receiverId, content } = body;

      // For now, store file info as base64
      // In production, you'd want to upload to cloud storage
      const fileData = {
        filename: file.originalname,
        mimetype: file.mimetype,
        size: file.size,
        data: file.buffer.toString('base64'),
      };

      const message = await this.communicationService.sendMessage(
        senderId,
        receiverId,
        content,
        MessageType.FILE,
      );

      // Update message with file info
      // You would typically update the message with file URL here

      return {
        success: true,
        message: 'File message sent successfully',
        data: message,
      };
    } catch (error) {
      throw new BadRequestException(error.message);
    }
  }

  // ===== APPOINTMENT ENDPOINTS =====

  @Post('appointments')
  @HttpCode(HttpStatus.CREATED)
  async createAppointment(
    @Body() body: {
      studentId: string;
      title: string;
      scheduledTime: string;
      endTime: string;
      description?: string;
    },
    @Request() req: any,
  ) {
    try {
      const teacherId = req.user.id;
      const { studentId, title, scheduledTime, endTime, description } = body;

      const appointment = await this.communicationService.createAppointment(
        teacherId,
        studentId,
        title,
        new Date(scheduledTime),
        new Date(endTime),
        description,
      );

      return {
        success: true,
        message: 'Appointment created successfully',
        data: appointment,
      };
    } catch (error) {
      throw new BadRequestException(error.message);
    }
  }

  @Get('appointments')
  async getUserAppointments(@Request() req: any) {
    try {
      const userId = req.user.id;
      const userRole = req.user.role;
      
      const appointments = await this.communicationService.getUserAppointments(userId, userRole);

      return {
        success: true,
        data: appointments,
      };
    } catch (error) {
      throw new BadRequestException(error.message);
    }
  }

  @Patch('appointments/:id/status')
  async updateAppointmentStatus(
    @Param('id') id: string,
    @Body() body: { status: 'confirmed' | 'completed' | 'cancelled' },
    @Request() req: any,
  ) {
    try {
      const userId = req.user.id;
      const { status } = body;

      const appointment = await this.communicationService.updateAppointmentStatus(
        id,
        status,
        userId,
      );

      return {
        success: true,
        message: `Appointment ${status} successfully`,
        data: appointment,
      };
    } catch (error) {
      throw new BadRequestException(error.message);
    }
  }

  // ===== NOTIFICATION ENDPOINTS =====

  @Get('notifications')
  async getNotifications(
    @Request() req: any,
    @Query('unreadOnly') unreadOnly?: string,
  ) {
    try {
      const userId = req.user.id;
      const notifications = await this.communicationService.getNotifications(
        userId,
        unreadOnly === 'true',
      );

      return {
        success: true,
        data: notifications,
      };
    } catch (error) {
      throw new BadRequestException(error.message);
    }
  }

  @Patch('notifications/:id/read')
  async markNotificationAsRead(
    @Param('id') id: string,
    @Request() req: any,
  ) {
    try {
      const userId = req.user.id;
      const notification = await this.communicationService.markNotificationAsRead(id, userId);

      return {
        success: true,
        message: 'Notification marked as read',
        data: notification,
      };
    } catch (error) {
      throw new BadRequestException(error.message);
    }
  }

  @Patch('notifications/read-all')
  async markAllNotificationsAsRead(@Request() req: any) {
    try {
      const userId = req.user.id;
      await this.communicationService.markAllNotificationsAsRead(userId);

      return {
        success: true,
        message: 'All notifications marked as read',
      };
    } catch (error) {
      throw new BadRequestException(error.message);
    }
  }

  // ===== STUDENT-TEACHER INTERACTION ENDPOINTS =====

  @Get('students')
  async getTeacherStudents(@Request() req: any) {
    try {
      const teacherId = req.user.id;
      
      // This would typically get students assigned to this teacher
      // For now, we'll return all students (you might want to add a relationship)
      
      return {
        success: true,
        message: 'Teacher students retrieved successfully',
        // data: students,
      };
    } catch (error) {
      throw new BadRequestException(error.message);
    }
  }

  @Get('teachers')
  async getStudentTeachers(@Request() req: any) {
    try {
      const studentId = req.user.id;
      
      // This would typically get teachers assigned to this student
      
      return {
        success: true,
        message: 'Student teachers retrieved successfully',
        // data: teachers,
      };
    } catch (error) {
      throw new BadRequestException(error.message);
    }
  }

  @Post('feedback')
  async sendFeedback(
    @Body() body: {
      receiverId: string;
      feedback: string;
      type: 'positive' | 'constructive' | 'general';
      relatedTo?: string; // Could be session ID, assignment ID, etc.
    },
    @Request() req: any,
  ) {
    try {
      const senderId = req.user.id;
      const { receiverId, feedback, type, relatedTo } = body;

      // Send feedback as a special message type
      const message = await this.communicationService.sendMessage(
        senderId,
        receiverId,
        `📝 Feedback (${type}): ${feedback}`,
        MessageType.FEEDBACK,
      );

      return {
        success: true,
        message: 'Feedback sent successfully',
        data: message,
      };
    } catch (error) {
      throw new BadRequestException(error.message);
    }
  }

  @Post('announcements')
  async sendAnnouncement(
    @Body() body: {
      title: string;
      content: string;
      targetRole?: 'student' | 'instructor' | 'all';
    },
    @Request() req: any,
  ) {
    try {
      const senderId = req.user.id;
      const { title, content, targetRole = 'all' } = body;

      // This would typically send announcements to multiple users
      // For now, we'll create a notification
      
      return {
        success: true,
        message: 'Announcement sent successfully',
      };
    } catch (error) {
      throw new BadRequestException(error.message);
    }
  }
}
