import { SetMetadata } from '@nestjs/common'; // Metama'lumot

export const IS_PUBLIC_KEY = 'isPublic'; // Kalit

// @Public() — autentifikatsiya shart emas (TZ 9.1)
export const Public = () => SetMetadata(IS_PUBLIC_KEY, true);
