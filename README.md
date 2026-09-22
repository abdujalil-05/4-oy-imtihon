# Mini ERP — Auth moduli (JWT + Guardlar + Qurilmalar)

## Ishga tushirish

```bash
cp .env.example .env        # qiymatlarni to'ldiring
npm install
npx prisma migrate dev      # baza + Prisma Client
npm run start:dev           # http://localhost:3000/api  |  Swagger: /api/docs
```

Birinchi Admin `.env` dagi `SUPERADMIN_LOGIN` / `SUPERADMIN_PASSWORD` bilan server ishga tushganda **avtomatik** yaratiladi.
