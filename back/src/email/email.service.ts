import { Injectable } from '@nestjs/common';
import * as nodemailer from 'nodemailer';

@Injectable()
export class EmailService {
  private transporter: nodemailer.Transporter;

  constructor() {
    console.log('Initializing EmailService...');
    console.log('EMAIL_USER:', process.env.EMAIL_USER ? 'Set' : 'Not set');
    console.log('EMAIL_PASSWORD:', process.env.EMAIL_PASSWORD ? 'Set' : 'Not set');
    
    // Configure your email transporter
    this.transporter = nodemailer.createTransport({
      host: 'smtp.gmail.com',
      port: 587,
      secure: false,
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASSWORD,
      },
      tls: {
        rejectUnauthorized: false
      }
    });

    // Verify connection configuration
    this.transporter.verify((error, success) => {
      if (error) {
        console.error('Email transporter verification failed:', error);
      } else {
        console.log('Email server is ready to send messages');
      }
    });
  }

  async sendWelcomeEmail(email: string, name: string): Promise<void> {
    console.log(`Attempting to send welcome email to ${email} for ${name}`);
    
    const mailOptions = {
      from: `"EVALUA Platform" <${process.env.EMAIL_USER}>`,
      to: email,
      subject: 'Welcome to EVALUA Platform!',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; background: #f9f9f9; padding: 30px; border-radius: 10px;">
          <div style="text-align: center; margin-bottom: 30px;">
            <div style="background: #E31837; width: 60px; height: 60px; border-radius: 50%; display: inline-flex; align-items: center; justify-content: center; margin-bottom: 20px;">
              <span style="color: white; font-size: 24px; font-weight: bold;">E</span>
            </div>
            <h1 style="color: #E31837; margin: 0;">Welcome to EVALUA!</h1>
          </div>
          
          <p style="font-size: 16px; color: #333; line-height: 1.6;">Hello <strong>${name}</strong>,</p>
          
          <p style="font-size: 16px; color: #333; line-height: 1.6;">We're excited to have you on board. EVALUA is an AI-Powered Oral Performance Assessment platform that will help you improve your communication skills.</p>
          
          <div style="background: white; padding: 20px; border-radius: 8px; margin: 25px 0;">
            <h2 style="color: #E31837; font-size: 18px; margin-top: 0;">Getting Started:</h2>
            <ul style="color: #555; line-height: 1.8; padding-left: 20px;">
              <li>Complete your profile</li>
              <li>Explore the dashboard</li>
              <li>Start your first practice session</li>
            </ul>
          </div>
          
          <p style="font-size: 16px; color: #333; line-height: 1.6;">If you have any questions, feel free to contact our support team.</p>
          
          <div style="margin-top: 30px; padding: 20px; background-color: #f0f0f0; border-radius: 5px; text-align: center;">
            <p style="margin: 0; color: #666;">Best regards,<br><strong>The EVALUA Team</strong></p>
          </div>
        </div>
      `,
    };

    try {
      const info = await this.transporter.sendMail(mailOptions);
      console.log(`✅ Welcome email sent successfully to ${email}`);
      console.log('Message ID:', info.messageId);
    } catch (error) {
      console.error(`❌ Failed to send welcome email to ${email}:`, {
        message: error.message,
        code: error.code,
        command: error.command
      });
    }
  }

  async sendStatusChangeEmail(email: string, name: string, isActive: boolean): Promise<void> {
    const status = isActive ? 'activated' : 'deactivated';
    const statusColor = isActive ? '#22c55e' : '#ef4444';
    const backgroundColor = isActive ? '#e8f5e9' : '#ffebee';
    const borderColor = isActive ? '#22c55e' : '#ef4444';
    
    console.log(`Attempting to send status change email to ${email} for ${name} - Status: ${status}`);
    
    const mailOptions = {
      from: `"EVALUA Platform" <${process.env.EMAIL_USER}>`,
      to: email,
      subject: `Account ${status} - EVALUA Platform`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; background: #f9f9f9; padding: 30px; border-radius: 10px;">
          <div style="text-align: center; margin-bottom: 30px;">
            <div style="background: #E31837; width: 60px; height: 60px; border-radius: 50%; display: inline-flex; align-items: center; justify-content: center; margin-bottom: 20px;">
              <span style="color: white; font-size: 24px; font-weight: bold;">E</span>
            </div>
            <h1 style="color: #333; margin: 0;"><span style="color: ${statusColor};">Account ${status}</span></h1>
          </div>
          
          <p style="font-size: 16px; color: #333; line-height: 1.6;">Hello <strong>${name}</strong>,</p>
          
          <p style="font-size: 16px; color: #333; line-height: 1.6;">
            Your EVALUA account has been <strong style="color: ${statusColor}; font-size: 18px;">${status}</strong>.
          </p>
          
          <div style="background: ${backgroundColor}; padding: 20px; border-radius: 8px; margin: 25px 0; border-left: 4px solid ${borderColor};">
            <p style="margin: 0; color: #333; font-size: 16px; line-height: 1.6;">
              ${isActive 
                ? '✨ <strong style="color: #22c55e;">Good news!</strong> Your account is now active. You can log in and start using all the features of our platform.' 
                : '⚠️ <strong style="color: #ef4444;">Important:</strong> Your account has been deactivated. If you believe this is a mistake, please contact our support team.'
              }
            </p>
          </div>
          
          <div style="margin-top: 30px; padding: 20px; background-color: #f0f0f0; border-radius: 5px; text-align: center;">
            <p style="margin: 0; color: #666;">Best regards,<br><strong>The EVALUA Team</strong></p>
          </div>
        </div>
      `,
    };

    try {
      const info = await this.transporter.sendMail(mailOptions);
      console.log(`✅ Status change email sent successfully to ${email}`);
      console.log('Message ID:', info.messageId);
    } catch (error) {
      console.error(`❌ Failed to send status change email to ${email}:`, {
        message: error.message,
        code: error.code,
        command: error.command
      });
    }
  }
}