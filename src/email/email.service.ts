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
      secure: this.configService.get('email.enableSsl'), // true for SSL
      auth: {
        user: this.configService.get('email.username'),
        pass: this.configService.get('email.password'),
      },
      tls: {
        rejectUnauthorized: false // Accept self-signed certificates
      },
      debug: true, // Enable debug output
      logger: true // Log to console
    });

    // Test connection on startup
    this.verifyConnection();
  }

  private async verifyConnection(): Promise<void> {
    try {
      await this.transporter.verify();
      console.log('✅ SMTP соединение успешно установлено');
    } catch (error) {
      console.error('❌ Ошибка подключения к SMTP серверу:', error);
    }
  }

  async sendPasswordReset(email: string, newPassword: string): Promise<void> {
    try {
      const emailBody = this.generatePasswordResetEmailBody(newPassword);
      console.log(`📧 Отправка email сброса пароля на ${email}`);
      
      const info = await this.transporter.sendMail({
        from: `"${this.configService.get('email.fromName')}" <${this.configService.get('email.fromEmail')}>`,
        to: email,
        subject: 'Восстановление пароля - MoeShop',
        html: emailBody,
      });

      console.log(`✅ Email сброса пароля успешно отправлен на ${email}`);
      console.log('Message ID:', info.messageId);
    } catch (error) {
      console.error(`❌ Ошибка отправки email сброса пароля на ${email}:`, error);
      throw error;
    }
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

  async sendOrderConfirmation(email: string, order: any): Promise<void> {
    try {
      const emailBody = this.generateOrderConfirmationEmailBody(order);
      console.log(`📧 Отправка email на ${email} для заказа #${order.id}`);

      const info = await this.transporter.sendMail({
        from: `"${this.configService.get('email.fromName')}" <${this.configService.get('email.fromEmail')}>`,
        to: email,
        subject: `Подтверждение заказа #${order.id} - MoeShop`,
        html: emailBody,
      });

      console.log(`✅ Email успешно отправлен на ${email} для заказа #${order.id}`);
      console.log('Message ID:', info.messageId);
    } catch (error) {
      console.error(`❌ Ошибка отправки email на ${email} для заказа #${order.id}:`, error);
      throw error;
    }
  }

  private generateOrderConfirmationEmailBody(order: any): string {
    const sb: string[] = [];
    sb.push('<!DOCTYPE html>');
    sb.push('<html><head><meta charset="utf-8"></head><body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333;">');
    sb.push('<div style="max-width: 600px; margin: 0 auto; padding: 20px;">');

    // Заголовок
    sb.push('<div style="background-color: #f8f9fa; padding: 20px; border-radius: 8px; text-align: center; margin-bottom: 20px;">');
    sb.push('<h1 style="color: #007bff; margin: 0;">MoeShop</h1>');
    sb.push('<h2 style="color: #28a745; margin: 10px 0 0 0;">Спасибо за покупку!</h2>');
    sb.push('</div>');

    // Информация о заказе
    sb.push('<div style="background-color: #fff; border: 1px solid #dee2e6; border-radius: 8px; padding: 20px; margin-bottom: 20px;">');
    sb.push(`<p><strong>Заказ:</strong> #${order.id}</p>`);
    sb.push(`<p><strong>Дата заказа:</strong> ${new Date(order.orderDate).toLocaleString('ru-RU')}</p>`);
    sb.push('<p style="color: #28a745;"><strong>Ваш заказ успешно оформлен и принят в обработку!</strong></p>');
    sb.push('</div>');

    // Товары в заказе
    sb.push('<div style="background-color: #fff; border: 1px solid #dee2e6; border-radius: 8px; padding: 20px; margin-bottom: 20px;">');
    sb.push('<h3 style="color: #007bff; margin-top: 0;">Товары в заказе:</h3>');
    sb.push('<table style="width: 100%; border-collapse: collapse;">');
    sb.push('<thead>');
    sb.push('<tr style="background-color: #f8f9fa;">');
    sb.push('<th style="text-align: left; padding: 10px; border-bottom: 1px solid #dee2e6;">Товар</th>');
    sb.push('<th style="text-align: center; padding: 10px; border-bottom: 1px solid #dee2e6;">Кол-во</th>');
    sb.push('<th style="text-align: right; padding: 10px; border-bottom: 1px solid #dee2e6;">Цена</th>');
    sb.push('<th style="text-align: right; padding: 10px; border-bottom: 1px solid #dee2e6;">Сумма</th>');
    sb.push('</tr>');
    sb.push('</thead>');
    sb.push('<tbody>');

    // Проверяем, что orderItems существует и является массивом
    if (order.orderItems && Array.isArray(order.orderItems)) {
      for (const item of order.orderItems) {
        const itemPrice = parseFloat(item.priceAtOrder);
        const itemTotal = item.quantity * itemPrice;
        sb.push('<tr>');
        sb.push(`<td style="padding: 10px; border-bottom: 1px solid #f1f3f4;">${item.product?.name || 'Товар'}</td>`);
        sb.push(`<td style="text-align: center; padding: 10px; border-bottom: 1px solid #f1f3f4;">${item.quantity} шт.</td>`);
        sb.push(`<td style="text-align: right; padding: 10px; border-bottom: 1px solid #f1f3f4;">${itemPrice.toFixed(2)} ₽</td>`);
        sb.push(`<td style="text-align: right; padding: 10px; border-bottom: 1px solid #f1f3f4;"><strong>${itemTotal.toFixed(2)} ₽</strong></td>`);
        sb.push('</tr>');
      }
    } else {
      // Если orderItems недоступен, показываем заглушку
      sb.push('<tr>');
      sb.push('<td colspan="4" style="text-align: center; padding: 20px; color: #6c757d;">Информация о товарах временно недоступна</td>');
      sb.push('</tr>');
    }

    sb.push('</tbody>');
    sb.push('</table>');
    sb.push('</div>');

    // Итоговая информация
    sb.push('<div style="background-color: #f8f9fa; border-radius: 8px; padding: 20px;">');
    sb.push(`<p style="font-size: 18px; margin: 5px 0;"><strong>Общая сумма: ${parseFloat(order.totalAmount).toFixed(2)} ₽</strong></p>`);

    if (order.walletUsed) {
      sb.push(`<p style="color: #dc3545; margin: 5px 0;">Списано с кошельк: ${parseFloat(order.walletUsed).toFixed(2)} ₽</p>`);
    }

    if (order.walletEarned) {
      sb.push(`<p style="color: #28a745; margin: 5px 0;">Начислено на кошелек: +${parseFloat(order.walletEarned).toFixed(2)} ₽</p>`);
    }

    sb.push(`<p style="font-size: 20px; color: #007bff; margin: 10px 0 0 0;"><strong>К оплате: ${parseFloat(order.finalAmount).toFixed(2)} ₽</strong></p>`);
    sb.push('</div>');

    // Футер
    sb.push('<div style="text-align: center; margin-top: 30px; padding-top: 20px; border-top: 1px solid #dee2e6; color: #6c757d;">');
    sb.push('<p style="margin: 5px 0;">С уважением, команда MoeShop</p>');
    sb.push('<p style="margin: 5px 0; font-size: 12px;">Это автоматическое сообщение, не отвечайте на него.</p>');
    sb.push('</div>');

    sb.push('</div>');
    sb.push('</body></html>');

    return sb.join('\n');
  }
}
