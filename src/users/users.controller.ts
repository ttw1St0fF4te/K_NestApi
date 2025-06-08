import { Controller, Get, Post, Body, HttpCode, HttpStatus, Res, Request, UseGuards, Param, Put, Query } from '@nestjs/common';
import { Response } from 'express';
import { UsersService } from './users.service';
import { CreateUserDto } from './dto/create-user.dto';
import { LoginUserDto } from './dto/login-user.dto';
import { ResetPasswordDto } from './dto/reset-password.dto';
import { UpdateContactDataDto } from './dto/update-contact-data.dto';
import { LoyaltyProgramResponseDto } from './dto/loyalty-program-response.dto';
import { WalletResponseDto } from './dto/wallet-response.dto';
import { LocalAuthGuard } from '../auth/local-auth.guard';
import { AuthenticatedGuard } from '../auth/authenticated.guard';

@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @UseGuards(AuthenticatedGuard)
  @Get('profile')
  async getProfile(@Request() req) {
    return this.usersService.getProfile(req.user.id);
  }

  @UseGuards(AuthenticatedGuard)
  @Get('order-history')
  async getOrderHistory(@Request() req, @Query('page') page?: string, @Query('limit') limit?: string) {
    const pageNumber = page ? parseInt(page, 10) : 1;
    const limitNumber = limit ? parseInt(limit, 10) : 10;
    return this.usersService.getOrderHistory(req.user.id, pageNumber, limitNumber);
  }

  @Post('register')
  @HttpCode(HttpStatus.CREATED)
  async register(@Body() createUserDto: CreateUserDto) {
    const user = await this.usersService.create(createUserDto);
    return { message: 'Регистрация успешна', user };
  }

  @UseGuards(LocalAuthGuard)
  @Post('login')
  @HttpCode(HttpStatus.OK)
  async login(@Request() req) {
    return { message: 'Вход успешен', user: req.user };
  }

  @Post('reset-password')
  @HttpCode(HttpStatus.OK)
  async resetPassword(@Body() resetPasswordDto: ResetPasswordDto) {
    return this.usersService.resetPassword(resetPasswordDto);
  }

  @UseGuards(AuthenticatedGuard)
  @Post('logout')
  @HttpCode(HttpStatus.OK)
  async logout(@Request() req, @Res() res: Response) {
    req.logout(() => {
      res.clearCookie('connect.sid');
      res.json({ message: 'Выход успешен' });
    });
  }

  @UseGuards(AuthenticatedGuard)
  @Put('update-contact-data')
  @HttpCode(HttpStatus.OK)
  async updateContactData(@Request() req, @Body() updateContactDataDto: UpdateContactDataDto) {
    return this.usersService.updateContactData(req.user.id, updateContactDataDto);
  }

  @UseGuards(AuthenticatedGuard)
  @Get('loyalty-program')
  @HttpCode(HttpStatus.OK)
  async getLoyaltyProgram(@Request() req) {
    return this.usersService.getLoyaltyProgram(req.user.id);
  }

  @UseGuards(AuthenticatedGuard)
  @Get('wallet')
  @HttpCode(HttpStatus.OK)
  async getWallet(@Request() req) {
    return this.usersService.getWallet(req.user.id);
  }

  @UseGuards(AuthenticatedGuard)
  @Post('reset-password-from-profile')
  @HttpCode(HttpStatus.OK)
  async resetPasswordFromProfile(@Request() req) {
    return this.usersService.resetPasswordFromProfile(req.user.id);
  }

  @UseGuards(AuthenticatedGuard)  
  @Get('orders/:orderId/details')
  @HttpCode(HttpStatus.OK)
  async getOrderDetails(@Request() req, @Param('orderId') orderId: number) {
    return this.usersService.getOrderDetails(req.user.id, +orderId);
  }
}
