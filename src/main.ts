import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';
import * as session from 'express-session';
import * as passport from 'passport';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // Enable global validation
  app.useGlobalPipes(new ValidationPipe({
    whitelist: true,
    forbidNonWhitelisted: true,
    transform: true,
  }));

  // Enable CORS
  app.enableCors({
    origin: true, // Разрешить все origins для разработки
    credentials: true, // Разрешаем отправку куки и заголовков аутентификации
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'Cookie'],
  });

  // Session configuration
  app.use(
    session({
      secret: process.env.SESSION_SECRET || 'my-secret-key', // Используем переменную окружения
      resave: false,
      saveUninitialized: false,
      cookie: {
        maxAge: 3600000, // 1 час
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production', // В продакшене только через HTTPS
        sameSite: 'lax'
      },
    }),
  );

  // Initialize Passport and restore authentication state from session
  app.use(passport.initialize());
  app.use(passport.session());

  await app.listen(process.env.PORT || 3000);
}
bootstrap();
