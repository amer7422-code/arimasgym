import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // ValidationPipe عام - يفعّل كل الـ @Is...() decorators في الـ DTOs تلقائياً
  // whitelist: يحذف أي حقل غير معرّف في الـ DTO (حماية إضافية ضد Mass Assignment)
  // forbidNonWhitelisted: يرفض الطلب إن احتوى حقولاً غير متوقعة بدل تجاهلها بصمت
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
    })
  );

  app.enableCors();

  const port = process.env.PORT ?? 3000;
  await app.listen(port);
}

bootstrap();
