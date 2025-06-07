import { IsBoolean, IsEmail, IsNotEmpty, IsOptional, IsPhoneNumber, IsString, MinLength, MaxLength, Matches } from 'class-validator';

export class CreateOrderDto {
  @IsString({ message: 'Имя должно быть строкой' })
  @IsNotEmpty({ message: 'Имя обязательно для заполнения' })
  @MinLength(2, { message: 'Имя должно содержать минимум 2 символа' })
  @MaxLength(50, { message: 'Имя не должно превышать 50 символов' })
  customerName: string;

  @IsString({ message: 'Телефон должен быть строкой' })
  @IsNotEmpty({ message: 'Телефон обязателен для заполнения' })
  @Matches(/^\+7 \([0-9]{3}\) [0-9]{3}-[0-9]{2}-[0-9]{2}$/, { 
    message: 'Телефон должен быть в формате +7 (999) 999-99-99' 
  })
  customerPhone: string;

  @IsString({ message: 'Страна должна быть строкой' })
  @IsNotEmpty({ message: 'Страна обязательна для заполнения' })
  @MaxLength(50, { message: 'Название страны не должно превышать 50 символов' })
  country: string;

  @IsString({ message: 'Город должен быть строкой' })
  @IsNotEmpty({ message: 'Город обязателен для заполнения' })
  @MaxLength(50, { message: 'Название города не должно превышать 50 символов' })
  city: string;

  @IsString({ message: 'Индекс должен быть строкой' })
  @IsNotEmpty({ message: 'Индекс обязателен для заполнения' })
  @Matches(/^[0-9]{6}$/, { message: 'Индекс должен состоять из 6 цифр' })
  postalCode: string;

  @IsString({ message: 'Улица должна быть строкой' })
  @IsNotEmpty({ message: 'Улица обязательна для заполнения' })
  @MaxLength(100, { message: 'Название улицы не должно превышать 100 символов' })
  street: string;

  @IsString({ message: 'Номер дома должен быть строкой' })
  @IsNotEmpty({ message: 'Номер дома обязателен для заполнения' })
  @MaxLength(20, { message: 'Номер дома не должен превышать 20 символов' })
  houseNumber: string;

  @IsEmail({}, { message: 'Некорректный формат email' })
  @IsOptional()
  email?: string;

  @IsBoolean({ message: 'Поле использования кошелька должно быть булевым значением' })
  useWallet: boolean = false;
}
