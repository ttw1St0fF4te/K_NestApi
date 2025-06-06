import { IsString, IsNotEmpty, IsEmail, IsOptional, Length } from 'class-validator';

export class CreateUserDto {
  @IsString({ message: 'Имя пользователя должно быть строкой' })
  @IsNotEmpty({ message: 'Имя пользователя не может быть пустым' })
  @Length(1, 20, { message: 'Имя пользователя должно содержать от 1 до 20 символов' })
  username: string;

  @IsString({ message: 'Пароль должен быть строкой' })
  @IsNotEmpty({ message: 'Пароль не может быть пустым' })
  @Length(6, 50, { message: 'Пароль должен содержать от 6 до 50 символов' })
  password: string;

  @IsString({ message: 'Подтверждение пароля должно быть строкой' })
  @IsNotEmpty({ message: 'Подтверждение пароля не может быть пустым' })
  @Length(6, 50, { message: 'Подтверждение пароля должно содержать от 6 до 50 символов' })
  confirmPassword: string;

  @IsOptional()
  @IsEmail({}, { message: 'Некорректный формат email адреса' })
  email?: string;
}
