import { Injectable, UnauthorizedException, BadRequestException, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from './entities/user.entity';
import { Order } from '../orders/entities/order.entity';
import { CreateUserDto } from './dto/create-user.dto';
import { LoginUserDto } from './dto/login-user.dto';
import { ResetPasswordDto } from './dto/reset-password.dto';
import { UpdateContactDataDto } from './dto/update-contact-data.dto';
import { LoyaltyProgramResponseDto } from './dto/loyalty-program-response.dto';
import { WalletResponseDto } from './dto/wallet-response.dto';
import { EmailService } from '../email/email.service';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User)
    private usersRepository: Repository<User>,
    @InjectRepository(Order)
    private ordersRepository: Repository<Order>,
    private emailService: EmailService,
  ) {}

  async create(createUserDto: CreateUserDto) {
    // Check if username already exists
    const existingUser = await this.usersRepository.findOne({
      where: { username: createUserDto.username }
    });

    if (existingUser) {
      throw new BadRequestException('Пользователь с таким именем уже существует');
    }

    // Additional validation for username format (letters and numbers only)
    if (!this.isValidUsername(createUserDto.username)) {
      throw new BadRequestException('Имя пользователя должно содержать только буквы и цифры');
    }

    // Check if passwords match
    if (createUserDto.password !== createUserDto.confirmPassword) {
      throw new BadRequestException('Пароли не совпадают');
    }

    const user = this.usersRepository.create({
      username: createUserDto.username,
      password: createUserDto.password, // Store password as plain text
      email: createUserDto.email,
      userRoleId: 3 // Id роли "User"
    });

    const savedUser = await this.usersRepository.save(user);
    const { password, ...result } = savedUser;
    return result;
  }

  async login(loginUserDto: LoginUserDto) {
    const user = await this.usersRepository.findOne({
      where: { 
        username: loginUserDto.username,
        password: loginUserDto.password // Compare plain text passwords
      },
      relations: ['userRole']
    });

    if (!user) {
      throw new UnauthorizedException('Неверное имя пользователя или пароль');
    }

    const { password, ...result } = user;
    return result;
  }

  async resetPassword(resetPasswordDto: ResetPasswordDto) {
    const user = await this.usersRepository.findOne({
      where: { email: resetPasswordDto.email }
    });

    if (!user || !user.email) {
      throw new BadRequestException('Пользователь с таким email не найден');
    }

    const newPassword = this.generateSecurePassword();
    user.password = newPassword;
    await this.usersRepository.save(user);

    // Send password reset email (don't fail if email sending fails)
    try {
      await this.emailService.sendPasswordReset(user.email, newPassword);
      return { message: 'Новый пароль отправлен на ваш email' };
    } catch (emailError) {
      console.error('Ошибка отправки email:', emailError);
      return { 
        message: 'Пароль успешно изменен, но возникла проблема с отправкой email. Ваш новый пароль: ' + newPassword 
      };
    }
  }

  async getProfile(userId: number) {
    const user = await this.usersRepository.findOne({
      where: { id: userId },
      relations: ['userRole']
    });

    if (!user) {
      throw new NotFoundException('Пользователь не найден');
    }

    const { password, ...result } = user;
    return result;
  }

  async getOrderHistory(userId: number) {
    const user = await this.usersRepository.findOne({
      where: { id: userId },
      relations: ['orders', 'orders.orderItems', 'orders.orderItems.product']
    });

    if (!user) {
      throw new NotFoundException('Пользователь не найден');
    }

    return {
      orders: user.orders,
      hasWallet: user.totalSpent ? user.totalSpent >= 30000 : false
    };
  }

  // Новый метод: обновление контактных данных (аналог UpdateContactData)
  async updateContactData(userId: number, updateContactDataDto: UpdateContactDataDto) {
    const user = await this.usersRepository.findOne({
      where: { id: userId }
    });

    if (!user) {
      throw new NotFoundException('Пользователь не найден');
    }

    // Проверяем, не занято ли имя пользователя другим пользователем
    if (updateContactDataDto.username !== user.username) {
      const existingUser = await this.usersRepository.findOne({
        where: { username: updateContactDataDto.username }
      });

      if (existingUser) {
        throw new BadRequestException('Пользователь с таким именем уже существует');
      }
    }

    // Валидация имени пользователя
    if (!this.isValidUsername(updateContactDataDto.username)) {
      throw new BadRequestException('Имя пользователя должно содержать только буквы и цифры, максимум 20 символов');
    }

    // Валидация email
    if (updateContactDataDto.email && !this.isValidEmail(updateContactDataDto.email)) {
      throw new BadRequestException('Некорректный формат email адреса');
    }

    user.username = updateContactDataDto.username;
    user.email = updateContactDataDto.email || null;

    await this.usersRepository.save(user);

    const { password, ...result } = user;
    return { 
      message: 'Контактные данные успешно обновлены',
      user: result 
    };
  }

  // Новый метод: получение деталей заказа (аналог OrderDetails)
  async getOrderDetails(userId: number, orderId: number) {
    const order = await this.ordersRepository.findOne({
      where: { id: orderId, userId },
      relations: ['orderItems', 'orderItems.product', 'user']
    });

    if (!order) {
      throw new NotFoundException('Заказ не найден');
    }

    return order;
  }

  // Новый метод: информация о программе лояльности (аналог LoyaltyProgram)
  async getLoyaltyProgram(userId: number): Promise<LoyaltyProgramResponseDto> {
    const user = await this.usersRepository.findOne({
      where: { id: userId }
    });

    if (!user) {
      throw new NotFoundException('Пользователь не найден');
    }

    const totalSpent = user.totalSpent ?? 0;
    const currentLevel = this.getLoyaltyLevel(totalSpent);
    const cashbackPercent = this.getCashbackPercent(currentLevel);

    return {
      currentLevel: currentLevel ?? 'Нет уровня',
      cashbackPercent: cashbackPercent * 100,
      totalSpent,
      progressToNext: this.calculateProgressToNext(totalSpent),
      walletBalance: user.walletBalance ?? 0
    };
  }

  // Новый метод: информация о кошельке (аналог Wallet)
  async getWallet(userId: number): Promise<WalletResponseDto> {
    const user = await this.usersRepository.findOne({
      where: { id: userId }
    });

    if (!user) {
      throw new NotFoundException('Пользователь не найден');
    }

    const totalSpent = user.totalSpent ?? 0;
    const currentLevel = this.getLoyaltyLevel(totalSpent);

    // Кошелек доступен только с базового уровня
    if (!currentLevel) {
      throw new BadRequestException('Кошелек недоступен. Для доступа к кошельку необходимо достичь базового уровня лояльности');
    }

    return {
      balance: user.walletBalance ?? 0,
      currentLevel,
      isAvailable: true
    };
  }

  // Новый метод: сброс пароля из профиля (аналог ResetPassword из ProfileController)
  async resetPasswordFromProfile(userId: number) {
    const user = await this.usersRepository.findOne({
      where: { id: userId }
    });

    if (!user) {
      throw new NotFoundException('Пользователь не найден');
    }

    if (!user.email) {
      throw new BadRequestException('Для смены пароля необходимо указать email в контактных данных');
    }

    // Генерируем новый пароль
    const newPassword = this.generateSecurePassword();
    user.password = newPassword;

    await this.usersRepository.save(user);

    // Отправляем пароль на email
    await this.emailService.sendPasswordReset(user.email, newPassword);

    return { 
      message: 'Новый пароль отправлен на ваш email. Используйте его для входа в систему' 
    };
  }

  private isValidUsername(username: string): boolean {
    return /^[a-zA-Z0-9]{1,20}$/.test(username);
  }

  private isValidEmail(email: string): boolean {
    return /^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email);
  }

  private generateSecurePassword(): string {
    const length = 12;
    const chars = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789!@#$%^&*';
    let password = '';
    for (let i = 0; i < length; i++) {
      password += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return password;
  }

  // Методы системы лояльности (аналогичные orders.service.ts)
  private readonly loyaltyLevels = {
    Basic: 'Базовый',
    Silver: 'Серебряный',
    Gold: 'Золотой'
  };

  private readonly levels: Record<string, { minSpent: number; cashbackPercent: number }> = {
    'Базовый': { minSpent: 30000, cashbackPercent: 0.05 },
    'Серебряный': { minSpent: 60000, cashbackPercent: 0.10 },
    'Золотой': { minSpent: 120000, cashbackPercent: 0.15 }
  };

  private getLoyaltyLevel(totalSpent: number): string | null {
    if (totalSpent >= this.levels[this.loyaltyLevels.Gold].minSpent) return this.loyaltyLevels.Gold;
    if (totalSpent >= this.levels[this.loyaltyLevels.Silver].minSpent) return this.loyaltyLevels.Silver;
    if (totalSpent >= this.levels[this.loyaltyLevels.Basic].minSpent) return this.loyaltyLevels.Basic;
    return null;
  }

  private getCashbackPercent(loyaltyLevel: string | null): number {
    if (loyaltyLevel && this.levels[loyaltyLevel]) {
      return this.levels[loyaltyLevel].cashbackPercent;
    }
    return 0;
  }

  private calculateProgressToNext(totalSpent: number): string {
    const currentLevel = this.getLoyaltyLevel(totalSpent);
    
    if (!currentLevel) {
      // Пользователь еще не достиг базового уровня
      const amountNeeded = this.levels[this.loyaltyLevels.Basic].minSpent - totalSpent;
      return `До ${this.loyaltyLevels.Basic} уровня: ${amountNeeded.toLocaleString('ru-RU')} ₽`;
    }
    
    if (currentLevel === this.loyaltyLevels.Basic) {
      const amountNeeded = this.levels[this.loyaltyLevels.Silver].minSpent - totalSpent;
      return `До ${this.loyaltyLevels.Silver} уровня: ${amountNeeded.toLocaleString('ru-RU')} ₽`;
    }
    
    if (currentLevel === this.loyaltyLevels.Silver) {
      const amountNeeded = this.levels[this.loyaltyLevels.Gold].minSpent - totalSpent;
      return `До ${this.loyaltyLevels.Gold} уровня: ${amountNeeded.toLocaleString('ru-RU')} ₽`;
    }
    
    // Пользователь уже на максимальном уровне
    return 'Достигнут максимальный уровень';
  }
}
