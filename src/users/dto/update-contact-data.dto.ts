import { IsString, IsEmail, IsOptional, MaxLength, Matches } from 'class-validator';

export class UpdateContactDataDto {
  @IsString({ message: 'Имя пользователя должно быть строкой' })
  @MaxLength(20, { message: 'Имя пользователя не должно превышать 20 символов' })
  @Matches(/^[a-zA-Z0-9]+$/, { message: 'Имя пользователя должно содержать только буквы и цифры' })
  username: string;

  @IsOptional()
  @IsEmail({}, { message: 'Некорректный формат email адреса' })
  email?: string;
}
