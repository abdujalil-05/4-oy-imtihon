// Pipe yozish uchun kerakli Nest vositalari
import { BadRequestException, Injectable, PipeTransform } from '@nestjs/common';
// Fayl kengaytmasini olish uchun
import { extname } from 'path';
// Rasmni qayta ishlovchi paket
import sharp from 'sharp';

// Yuborilgan rasmni tekshirib kichraytiruvchi pipe
@Injectable()
export class ImageValidationPipe implements PipeTransform<
  Express.Multer.File | undefined
> {
  // Ruxsat etilgan kengaytmalar
  private readonly allowedExtensions = ['.jpg', '.jpeg', '.png', '.webp'];

  // Ruxsat etilgan fayl turlari
  private readonly allowedMimeTypes = [
    'image/jpeg',
    'image/png',
    'image/jpg',
    'image/webp',
  ];

  // Ruxsat etilgan eng katta hajm
  private readonly maxFileSize = 20 * 1024 * 1024;

  async transform(file: Express.Multer.File | undefined) {
    // Fayl yuborilmagan bo'lsa tekshirmaymiz
    if (!file) {
      return file;
    }

    // Hajm chegaradan oshsa xato qaytaramiz
    if (file.size > this.maxFileSize) {
      throw new BadRequestException('Fayl hajmi 20 MB dan oshmasin');
    }

    // Fayl kengaytmasini kichik harflarda olamiz
    const extension = extname(file.originalname).toLowerCase();
    // Kengaytma ruxsat etilganlar ichida yo'q bo'lsa xato qaytaramiz
    if (!this.allowedExtensions.includes(extension)) {
      throw new BadRequestException('Faqat rasm fayllarini yuboring');
    }
    // Fayl turi ruxsat etilganlar ichida yo'q bo'lsa xato qaytaramiz
    if (!this.allowedMimeTypes.includes(file.mimetype)) {
      throw new BadRequestException("Fayl turi noto'g'ri");
    }

    try {
      // Rasmni kichraytirib webp ko'rinishiga o'tkazamiz
      const optimizedBuffer = await sharp(file.buffer)
        .rotate()
        .resize({
          width: 1600,
          height: 1600,
          fit: 'inside',
          withoutEnlargement: true,
        })
        .webp({
          quality: 80,
        })
        .toBuffer();

      // Yangi faylni eski fayl o'rniga qo'yamiz
      file.buffer = optimizedBuffer;
      // Yangi hajmni yozamiz
      file.size = optimizedBuffer.length;
      // Yangi fayl turini yozamiz
      file.mimetype = 'image/webp';
      // Yangi fayl nomini yozamiz
      file.originalname = `${Date.now()}.webp`;
      // Tayyor faylni qaytaramiz
      return file;
    } catch (error) {
      // Rasm buzilgan bo'lsa xato qaytaramiz
      throw new BadRequestException(
        'Yuborilgan fayl haqiqiy rasm emas yoki buzilgan',
      );
    }
  }
}
