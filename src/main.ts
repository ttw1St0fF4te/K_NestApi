import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import * as session from 'express-session';
import * as passport from 'passport';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // Enable CORS
  app.enableCors({
    origin: 'http://localhost:3000', // Разрешаем запросы с фронтенда
    credentials: true, // Разрешаем отправку куки и заголовков аутентификации
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
