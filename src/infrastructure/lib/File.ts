// Noto'g'ri so'rov haqidagi xato
import { BadRequestException } from '@nestjs/common';
// Fayl tizimi bilan ishlovchi funksiyalar
import { existsSync, mkdirSync, unlink, writeFile } from 'fs';
// Yo'llarni birlashtiruvchi funksiya
import { join } from 'path';
// Sozlamalar
import { env } from '../../config';

// Fayllar bilan ishlovchi yordamchi klass
export class File {
  // Fayllar saqlanadigan to'liq yo'l
  static filePath = join(process.cwd(), env.FILE_PATH);

  // Yuborilgan faylni papkaga saqlaydi
  static async create(file: Express.Multer.File): Promise<string> {
    try {
      // Fayl nomini vaqt bilan birga yasaymiz
      const fileName = `${Date.now()}_${file.originalname}`;
      // Papka yo'q bo'lsa yaratamiz
      if (!existsSync(File.filePath)) {
        mkdirSync(File.filePath, { recursive: true });
      }
      // Faylni diskka yozamiz
      await new Promise<void>((res, rej) => {
        writeFile(join(File.filePath, fileName), file.buffer, (err: any) => {
          if (err) rej(err);
          res();
        });
      });
      // Faylning tashqi manzilini qaytaramiz
      return `${env.BASE_URL}/${fileName}`;
    } catch (error) {
      // Saqlashda muammo bo'lsa xato qaytaramiz
      throw new BadRequestException('Fayl yuklashda muammo');
    }
  }

  // Faylni papkadan o'chiradi
  static async delete(fileName: string): Promise<void> {
    try {
      // Manzildan faqat fayl nomini ajratib olamiz
      const file = fileName.split(`${env.BASE_URL}/`)[1];
      // Faylning to'liq yo'lini yasaymiz
      const fileUrl = join(File.filePath, file);
      // Fayl yo'q bo'lsa xato qaytaramiz
      if (!existsSync(fileUrl)) {
        throw new BadRequestException('Fayl topilmadi');
      }
      // Faylni diskdan o'chiramiz
      await new Promise<void>((res, rej) => {
        unlink(fileUrl, (err: any) => {
          if (err) rej(err);
          res();
        });
      });
    } catch (error) {
      // O'chirishda muammo bo'lsa xato qaytaramiz
      throw new BadRequestException("Faylni o'chirishda muammo");
    }
  }

  // Fayl papkada bor yoki yo'qligini tekshiradi
  static async exist(fileName: string): Promise<boolean> {
    try {
      // Manzildan faqat fayl nomini ajratib olamiz
      const file = fileName.split(`${env.BASE_URL}/`)[1];
      // Faylning to'liq yo'lini yasaymiz
      const fileUrl = join(File.filePath, file);
      // Mavjudligini tekshirib javob qaytaramiz
      return existsSync(fileUrl) ? true : false;
    } catch (error) {
      // Tekshirishda muammo bo'lsa xato qaytaramiz
      throw new BadRequestException('Fayl topilmadi');
    }
  }
}
