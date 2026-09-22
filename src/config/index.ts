import { config } from 'dotenv'; // .env o'qish
config(); // .env ni process.env ga yuklash

// Majburiy qiymat yo'q bo'lsa — server ishga tushmaydi (TZ 13)
function required(name: string): string {
  const value = process.env[name];
  if (!value) throw new Error(`.env da ${name} yo'q`);
  return value;
}

// Butun loyiha bo'ylab ishlatiladigan sozlamalar
export const env = {
  PORT: Number(process.env.PORT) || 3000, // Port
  DB_URI: required('DB_URI'), // Baza manzili
  SUPERADMIN: {
    LOGIN: required('SUPERADMIN_LOGIN'), // Birinchi admin logini
    PASSWORD: required('SUPERADMIN_PASSWORD'), // Birinchi admin paroli
  },
  TOKEN: {
    ACCESS_KEY: required('ACCESS_TOKEN_KEY'), // Access token imzo kaliti
    ACCESS_TIME: required('ACCESS_TOKEN_TIME'), // Access token muddati ("15m")
    REFRESH_DAYS: Number(required('REFRESH_TOKEN_DAYS')), // Refresh token muddati (kun)
  },
  AUTH: {
    MAX_DEVICES: Number(required('MAX_DEVICES')), // Maks faol qurilmalar
    MAX_ATTEMPTS: Number(required('LOGIN_MAX_ATTEMPTS')), // Blokgacha xatolar
    LOCK_MINUTES: Number(required('LOGIN_LOCK_MINUTES')), // Blok davomiyligi
    BCRYPT_ROUNDS: Number(required('BCRYPT_ROUNDS')), // bcrypt narxi
  },
};

// Access token kaliti kamida 32 belgi bo'lishi shart (TZ 11.3)
if (env.TOKEN.ACCESS_KEY.length < 32) {
  throw new Error("ACCESS_TOKEN_KEY kamida 32 belgi bo'lishi kerak");
}
