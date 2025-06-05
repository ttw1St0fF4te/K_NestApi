import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as nodemailer from 'nodemailer';

@Injectable()
export class EmailService {
  private transporter: nodemailer.Transporter;

  constructor(private configService: ConfigService) {
    this.transporter = nodemailer.createTransport({
      host: this.configService.get('email.smtpServer'),
      port: this.configService.get('email.port'),
      secure: this.configService.get('email.enableSsl'),
      auth: {
        user: this.configService.get('email.username'),
        pass: this.configService.get('email.password'),
      },
    });
  }

  async sendPasswordReset(email: string, newPassword: string): Promise<void> {
    const emailBody = this.generatePasswordResetEmailBody(newPassword);
    
    await this.transporter.sendMail({
      from: `"${this.configService.get('email.fromName')}" <${this.configService.get('email.fromEmail')}>`,
      to: email,
      subject: 'Восстановление пароля - MoeShop',
      html: emailBody,
    });
  }

  private generatePasswordResetEmailBody(newPassword: string): string {
    const sb: string[] = [];
    
    sb.push('<!DOCTYPE html>');
    sb.push('<html><head><meta charset="utf-8"></head><body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333;">');
    sb.push('<div style="max-width: 600px; margin: 0 auto; padding: 20px;">');
    
    // Header
    sb.push('<div style="background-color: #f8f9fa; padding: 20px; border-radius: 8px; text-align: center; margin-bottom: 20px;">');
    sb.push('<h1 style="color: #007bff; margin: 0;">MoeShop</h1>');
    sb.push('<h2 style="color: #dc3545; margin: 10px 0 0 0;">Восстановление пароля</h2>');
    sb.push('</div>');
    
    // Main info
    sb.push('<div style="background-color: #fff; border: 1px solid #dee2e6; border-radius: 8px; padding: 20px; margin-bottom: 20px;">');
    sb.push('<p>Вы запросили восстановление пароля для вашего аккаунта в MoeShop.</p>');
    sb.push(`<p><strong>Ваш новый пароль:</strong> <span style="background-color: #f8f9fa; padding: 5px 10px; border-radius: 4px; font-family: monospace; font-size: 16px;">${newPassword}</span></p>`);
    sb.push('<p style="color: #dc3545;"><strong>Важно:</strong> Сохраните этот пароль в безопасном месте.</p>');
    sb.push('</div>');
    
    // Footer
    sb.push('<div style="text-align: center; margin-top: 30px; padding-top: 20px; border-top: 1px solid #dee2e6; color: #6c757d;">');
    sb.push('<p style="margin: 5px 0;">С уважением, команда MoeShop</p>');
    sb.push('<p style="margin: 5px 0; font-size: 12px;">Это автоматическое сообщение, не отвечайте на него.</p>');
    sb.push('</div>');
    
    sb.push('</div>');
    sb.push('</body></html>');
    
    return sb.join('\n');
  }
}
