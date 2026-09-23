# O'quv markazi mini ERP

NestJS + Prisma + PostgreSQL asosidagi o'quv markazi uchun mini ERP.

## Rollar

- **SUPERADMIN** — barcha bo'limlarni boshqaradi, o'qituvchi va o'quvchilarga login-parol yaratadi
- **TEACHER** — dars, davomat, imtihon, uy vazifasi bilan ishlaydi
- **STUDENT** — o'z davomati, to'lovi, bahosi va uy vazifasini ko'radi

## Ishga tushirish

```bash
cp .env.example .env        # qiymatlarni to'ldiring
pnpm install
pnpm exec prisma migrate dev      # baza + Prisma Client
pnpm start:dev                    # http://localhost:3000/api/v1
```

Swagger: `http://localhost:3000/api/v1/docs`

Birinchi superadmin `.env` dagi `SUPERADMIN_LOGIN` va `SUPERADMIN_PASSWORD` bilan
server ishga tushganda avtomatik yaratiladi. Qolgan foydalanuvchilarni faqat
superadmin `POST /user` orqali qo'shadi.

## Modullar

| Modul | Vazifasi |
| --- | --- |
| auth | Login, refresh, signout, me |
| device | Foydalanuvchi qurilmalari |
| user | O'qituvchi va o'quvchilarni yaratish |
| course | Kurslar |
| room | O'quv xonalari |
| group | Guruhlar |
| group-student | Guruhga o'quvchi biriktirish |
| lesson | Darslar |
| attendance | Davomat |
| payment | O'quvchilarning to'lovlari |
| salary | O'qituvchilar maoshi |
| expense | Markaz xarajatlari |
| exam | Imtihonlar |
| exam-result | Imtihon natijalari |
| homework | Uy vazifalari |
| homework-submission | Topshirilgan uy vazifalari |

Batafsil ma'lumot: [TZ.md](./TZ.md)
