import { config } from 'dotenv';

config();

export const env = {
  PORT: Number(process.env.PORT),
  DB_URI: String(process.env.DB_URI),
  BASE_URL: String(process.env.BASE_URL),
  FILE_PATH: String(process.env.FILE_PATH),
  SUPERADMIN: {
    LOGIN: String(process.env.SUPERADMIN_LOGIN),
    PASSWORD: String(process.env.SUPERADMIN_PASSWORD),
  },
  TOKEN: {
    ACCESS_KEY: String(process.env.ACCESS_TOKEN_KEY),
    ACCESS_TIME: String(process.env.ACCESS_TOKEN_TIME),
    REFRESH_KEY: String(process.env.REFRESH_TOKEN_KEY),
    REFRESH_TIME: String(process.env.REFRESH_TOKEN_TIME),
  },
};
