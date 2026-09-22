import 'dotenv/config'; // .env ni yuklash
import { defineConfig } from 'prisma/config'; // Prisma 7 konfiguratsiyasi
import { env } from './src/config'; // env obyekti

// Prisma CLI (migrate, generate) shu faylni o'qiydi
export default defineConfig({
  schema: 'prisma/schema.prisma', // Sxema fayli
  migrations: {
    path: 'prisma/migrations', // Migratsiyalar papkasi
  },
  datasource: {
    url: env.DB_URI, // Baza manzili .env dan
  },
});
