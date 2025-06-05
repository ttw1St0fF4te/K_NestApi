import { Injectable, UnauthorizedException, BadRequestException, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from './entities/user.entity';
import { CreateUserDto } from './dto/create-user.dto';
import { LoginUserDto } from './dto/login-user.dto';
import { ResetPasswordDto } from './dto/reset-password.dto';
import { EmailService } from '../email/email.service';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User)
    private usersRepository: Repository<User>,
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

    // Validate username
    if (!this.isValidUsername(createUserDto.username)) {
      throw new BadRequestException('Имя пользователя должно содержать только буквы и цифры, максимум 20 символов');
    }

    // Validate password
    if (createUserDto.password.length < 6 || createUserDto.password.length > 50) {
      throw new BadRequestException('Пароль должен быть от 6 до 50 символов');
    }

    if (createUserDto.password !== createUserDto.confirmPassword) {
      throw new BadRequestException('Пароли не совпадают');
    }

    // Validate email if provided
    if (createUserDto.email && !this.isValidEmail(createUserDto.email)) {
      throw new BadRequestException('Некорректный формат email адреса');
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

    // Send password reset email
    await this.emailService.sendPasswordReset(user.email, newPassword);

    return { message: 'Новый пароль отправлен на ваш email' };
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
}
