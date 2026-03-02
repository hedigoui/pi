import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { MongoRepository, ObjectId } from 'typeorm';
import {
  Message,
  Conversation,
  Appointment,
  Notification,
  MessageType,
  MessageStatus,
} from './communication.models';
import { Users } from '../users/users.models';

@Injectable()
export class CommunicationService {
  constructor(
    @InjectRepository(Message)
    private readonly messageRepository: MongoRepository<Message>,
    @InjectRepository(Conversation)
    private readonly conversationRepository: MongoRepository<Conversation>,
    @InjectRepository(Appointment)
    private readonly appointmentRepository: MongoRepository<Appointment>,
    @InjectRepository(Notification)
    private readonly notificationRepository: MongoRepository<Notification>,
    @InjectRepository(Users)
    private readonly userRepository: MongoRepository<Users>,
  ) {}

  // ===== MESSAGING SYSTEM =====

  async sendMessage(senderId: string, receiverId: string, content: string, type: MessageType = MessageType.TEXT): Promise<Message> {
    try {
      // Check if users exist
      const sender = await this.userRepository.findOneBy({ _id: new ObjectId(senderId) });
      const receiver = await this.userRepository.findOneBy({ _id: new ObjectId(receiverId) });
      
      if (!sender || !receiver) {
        throw new NotFoundException('User not found');
      }

      // Find or create conversation
      let conversation = await this.findConversation(senderId, receiverId);
      
      if (!conversation) {
        conversation = await this.createConversation(senderId, receiverId);
      }

      // Create message
      const message = this.messageRepository.create({
        content,
        type,
        status: MessageStatus.SENT,
        senderId,
        receiverId,
        sender,
        receiver,
      });

      const savedMessage = await this.messageRepository.save(message);

      // Update conversation
      conversation.lastMessageId = savedMessage._id.toString();
      conversation.lastMessageContent = content;
      conversation.lastMessageTime = savedMessage.createdAt;
      conversation.lastMessageSender = sender;
      await this.conversationRepository.save(conversation);

      // Create notification for receiver
      await this.createNotification(
        receiverId,
        `New message from ${sender.firstName} ${sender.lastName}`,
        content,
        savedMessage._id.toString(),
        'message'
      );

      console.log('✅ Message sent successfully');
      return savedMessage;
    } catch (error) {
      console.error('❌ Error sending message:', error);
      throw error;
    }
  }

  async getConversationMessages(userId1: string, userId2: string, limit: number = 50): Promise<Message[]> {
    try {
      const conversation = await this.findConversation(userId1, userId2);
      if (!conversation) {
        return [];
      }

      const messages = await this.messageRepository.find({
        where: {
          $or: [
            { senderId: userId1, receiverId: userId2 },
            { senderId: userId2, receiverId: userId1 }
          ]
        },
        order: { createdAt: -1 },
        take: limit,
      });

      // Mark messages as read
      await this.markMessagesAsRead(userId1, userId2);

      return messages.reverse();
    } catch (error) {
      console.error('❌ Error getting conversation messages:', error);
      throw error;
    }
  }

  async getUserConversations(userId: string): Promise<Conversation[]> {
    try {
      const conversations = await this.conversationRepository.find({
        where: {
          participantIds: { $in: [userId] },
          isActive: true
        },
        order: { lastMessageTime: -1 }
      });

      // Get other participant info for each conversation
      for (const conversation of conversations) {
        const otherParticipantId = conversation.participantIds.find(id => id !== userId);
        if (otherParticipantId) {
          const otherUser = await this.userRepository.findOneBy({ _id: new ObjectId(otherParticipantId) });
          // You can attach this info to the conversation object
          (conversation as any).otherParticipant = otherUser;
        }
      }

      return conversations;
    } catch (error) {
      console.error('❌ Error getting user conversations:', error);
      throw error;
    }
  }

  // ===== APPOINTMENT SYSTEM =====

  async createAppointment(teacherId: string, studentId: string, title: string, scheduledTime: Date, endTime: Date, description?: string): Promise<Appointment> {
    try {
      // Check if users exist and roles are correct
      const teacher = await this.userRepository.findOneBy({ _id: new ObjectId(teacherId), role: 'instructor' });
      const student = await this.userRepository.findOneBy({ _id: new ObjectId(studentId), role: 'student' });
      
      if (!teacher) {
        throw new NotFoundException('Teacher not found');
      }
      if (!student) {
        throw new NotFoundException('Student not found');
      }

      const appointment = this.appointmentRepository.create({
        title,
        description,
        scheduledTime,
        endTime,
        teacher,
        student,
        teacherId,
        studentId,
      });

      const savedAppointment = await this.appointmentRepository.save(appointment);

      // Create notifications
      await this.createNotification(
        teacherId,
        `New appointment with ${student.firstName} ${student.lastName}`,
        `Appointment: ${title} at ${scheduledTime.toLocaleString()}`,
        savedAppointment._id.toString(),
        'appointment'
      );

      await this.createNotification(
        studentId,
        `Appointment scheduled with ${teacher.firstName} ${teacher.lastName}`,
        `Your appointment "${title}" has been scheduled for ${scheduledTime.toLocaleString()}`,
        savedAppointment._id.toString(),
        'appointment'
      );

      console.log('✅ Appointment created successfully');
      return savedAppointment;
    } catch (error) {
      console.error('❌ Error creating appointment:', error);
      throw error;
    }
  }

  async getUserAppointments(userId: string, role: string): Promise<Appointment[]> {
    try {
      const field = role === 'instructor' ? 'teacherId' : 'studentId';
      
      const appointments = await this.appointmentRepository.find({
        where: { [field]: userId },
        order: { scheduledTime: 1 }
      });

      // Attach user info
      for (const appointment of appointments) {
        if (role === 'instructor') {
          const student = await this.userRepository.findOneBy({ _id: new ObjectId(appointment.studentId) });
          (appointment as any).otherUser = student;
        } else {
          const teacher = await this.userRepository.findOneBy({ _id: new ObjectId(appointment.teacherId) });
          (appointment as any).otherUser = teacher;
        }
      }

      return appointments;
    } catch (error) {
      console.error('❌ Error getting user appointments:', error);
      throw error;
    }
  }

  async updateAppointmentStatus(appointmentId: string, status: 'confirmed' | 'completed' | 'cancelled', userId: string): Promise<Appointment> {
    try {
      const appointment = await this.appointmentRepository.findOneBy({ _id: new ObjectId(appointmentId) });
      if (!appointment) {
        throw new NotFoundException('Appointment not found');
      }

      // Check if user has permission to update
      if (appointment.teacherId !== userId && appointment.studentId !== userId) {
        throw new BadRequestException('Unauthorized to update this appointment');
      }

      appointment.status = status;
      appointment.updatedAt = new Date();
      
      const updatedAppointment = await this.appointmentRepository.save(appointment);

      // Notify the other party
      const otherUserId = appointment.teacherId === userId ? appointment.studentId : appointment.teacherId;
      const actionText = status === 'confirmed' ? 'confirmed' : status === 'completed' ? 'completed' : 'cancelled';
      
      await this.createNotification(
        otherUserId,
        `Appointment ${actionText}`,
        `Your appointment "${appointment.title}" has been ${actionText}`,
        appointment._id.toString(),
        'appointment'
      );

      console.log(`✅ Appointment ${actionText} successfully`);
      return updatedAppointment;
    } catch (error) {
      console.error('❌ Error updating appointment:', error);
      throw error;
    }
  }

  // ===== NOTIFICATION SYSTEM =====

  async getNotifications(userId: string, unreadOnly: boolean = false): Promise<Notification[]> {
    try {
      const whereClause: any = { userId };
      if (unreadOnly) {
        whereClause.status = 'unread';
      }

      const notifications = await this.notificationRepository.find({
        where: whereClause,
        order: { createdAt: -1 },
        take: 50
      });

      return notifications;
    } catch (error) {
      console.error('❌ Error getting notifications:', error);
      throw error;
    }
  }

  async markNotificationAsRead(notificationId: string, userId: string): Promise<Notification> {
    try {
      const notification = await this.notificationRepository.findOneBy({ 
        _id: new ObjectId(notificationId), 
        userId 
      });
      
      if (!notification) {
        throw new NotFoundException('Notification not found');
      }

      notification.status = 'read';
      notification.updatedAt = new Date();
      
      return await this.notificationRepository.save(notification);
    } catch (error) {
      console.error('❌ Error marking notification as read:', error);
      throw error;
    }
  }

  async markAllNotificationsAsRead(userId: string): Promise<void> {
    try {
      await this.notificationRepository.updateMany(
        { userId, status: 'unread' },
        { status: 'read', updatedAt: new Date() }
      );
    } catch (error) {
      console.error('❌ Error marking all notifications as read:', error);
      throw error;
    }
  }

  // ===== HELPER METHODS =====

  private async findConversation(userId1: string, userId2: string): Promise<Conversation | null> {
    return await this.conversationRepository.findOne({
      where: {
        participantIds: { $all: [userId1, userId2], $size: 2 },
        isActive: true
      }
    });
  }

  private async createConversation(userId1: string, userId2: string): Promise<Conversation> {
    const conversation = this.conversationRepository.create({
      participantIds: [userId1, userId2],
      isActive: true
    });
    
    return await this.conversationRepository.save(conversation);
  }

  private async markMessagesAsRead(receiverId: string, senderId: string): Promise<void> {
    await this.messageRepository.updateMany(
      { receiverId, senderId, status: MessageStatus.SENT },
      { status: MessageStatus.READ, updatedAt: new Date() }
    );
  }

  private async createNotification(userId: string, title: string, message: string, relatedEntityId?: string, relatedEntityType?: string): Promise<Notification | null> {
    const user = await this.userRepository.findOneBy({ _id: new ObjectId(userId) });
    if (!user) return null;

    const notification = this.notificationRepository.create({
      title,
      message,
      userId,
      user,
      relatedEntityId,
      relatedEntityType: relatedEntityType as 'message' | 'appointment' | 'feedback' | 'announcement' | undefined,
    });

    return await this.notificationRepository.save(notification);
  }
}
