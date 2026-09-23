// Nest ilovasini yasovchi vosita
import { NestFactory } from '@nestjs/core';
// Asosiy modul
import { AppModule } from './app.module';
// Sozlamalar
import { env } from './config';
// Statik fayllarni ulash uchun express
import express from 'express';
// Yo'llarni birlashtiruvchi funksiya
import { join } from 'path';
// Kiruvchi ma'lumotlarni tekshiruvchi pipe
import { ValidationPipe } from '@nestjs/common';
// Xavfsizlik sarlavhalarini qo'yuvchi paket
import helmet from 'helmet';
// Swagger hujjatini yasovchi vositalar
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
// Barcha xatolarni ushlovchi filtr
import { AllExceptionsFilter } from './common/filter/all-exception.filter';
// Cookie larni o'qiydigan paket
import cookieParser from 'cookie-parser';

// Serverni sozlab ishga tushiruvchi klass
export class App {
  static async main() {
    // Nest ilovasini yasaymiz
    const app = await NestFactory.create(AppModule);
    // Port raqamini sozlamalardan olamiz
    const PORT = env.PORT;
    // Barcha endpointlar uchun umumiy yo'l
    const url = '/api/v1';

    // Yuklangan fayllarni tashqaridan ochib beramiz
    app.use(`${url}/uploads`, express.static(join(process.cwd(), 'uploads')));

    // Kiruvchi ma'lumotlarni tekshiruvchi pipe ni ulaymiz
    app.useGlobalPipes(
      new ValidationPipe({
        transform: true,
        whitelist: true,
        forbidNonWhitelisted: true,
      }),
    );

    // Xatolarni ushlovchi filtrni ulaymiz
    app.useGlobalFilters(new AllExceptionsFilter());

    // Xavfsizlik sarlavhalarini ulaymiz
    app.use(helmet());

    // Cookie o'qiydigan vositani ulaymiz
    app.use(cookieParser());

    // Barcha manzillarga so'rov yuborishga ruxsat beramiz
    app.enableCors({ origin: '*' });

    // Umumiy yo'lni o'rnatamiz
    app.setGlobalPrefix(url);
    // Swagger hujjati sozlamalarini yasaymiz
    const config = new DocumentBuilder()
      .setTitle("O'quv markazi mini ERP")
      .setVersion('1.0')
      .build();
    // Hujjatni yasovchi funksiya
    const documentFactory = () => SwaggerModule.createDocument(app, config);
    // Swagger sahifasini ochamiz va pastdagi schemas bo'limini yashiramiz
    SwaggerModule.setup(`${url}/docs`, app, documentFactory, {
      swaggerOptions: {
        defaultModelsExpandDepth: -1,
      },
    });

    // Serverni tinglashga qo'yamiz
    app.listen(PORT, () => console.log('Server running on port', PORT));
  }
}
