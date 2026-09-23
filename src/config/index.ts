// dotenv paketidan config funksiyasini olamiz
import { config } from 'dotenv';

// .env faylidagi qiymatlarni process.env ichiga yuklaymiz
config();

// Loyiha bo'ylab ishlatiladigan sozlamalarni bitta obyektga yig'amiz
export const env = {
  // Server ishlaydigan port raqami
  PORT: Number(process.env.PORT),
  // Postgres bazasiga ulanish manzili
  DB_URI: String(process.env.DB_URI),
  // Yuklangan fayllarga tashqaridan murojaat qilinadigan manzil
  BASE_URL: String(process.env.BASE_URL),
  // Fayllar saqlanadigan papka nomi
  FILE_PATH: String(process.env.FILE_PATH),
  // Birinchi superadmin uchun login va parol
  SUPERADMIN: {
    // Superadmin logini
    LOGIN: String(process.env.SUPERADMIN_LOGIN),
    // Superadmin paroli
    PASSWORD: String(process.env.SUPERADMIN_PASSWORD),
  },
  // Tokenlar uchun maxfiy kalitlar va muddatlar
  TOKEN: {
    // Access token uchun maxfiy kalit
    ACCESS_KEY: String(process.env.ACCESS_TOKEN_KEY),
    // Access token amal qilish muddati
    ACCESS_TIME: String(process.env.ACCESS_TOKEN_TIME),
    // Refresh token uchun maxfiy kalit
    REFRESH_KEY: String(process.env.REFRESH_TOKEN_KEY),
    // Refresh token amal qilish muddati
    REFRESH_TIME: String(process.env.REFRESH_TOKEN_TIME),
  },
};
