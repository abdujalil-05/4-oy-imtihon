# O'quv markazi mini ERP — Texnik topshiriq (TZ)

## Mundarija

1. [Maqsad va qamrov](#1-maqsad-va-qamrov)
2. [Rollar](#2-rollar)
3. [Papka tuzilmasi](#3-papka-tuzilmasi)
4. [Ma'lumotlar bazasi](#4-malumotlar-bazasi)
5. [Tokenlar va qurilmalar](#5-tokenlar-va-qurilmalar)
6. [Guardlar va dekoratorlar](#6-guardlar-va-dekoratorlar)
7. [Endpointlar](#7-endpointlar)
8. [Javob formati](#8-javob-formati)
9. [Konfiguratsiya](#9-konfiguratsiya)
10. [Kerakli paketlar](#10-kerakli-paketlar)
11. [Ishga tushirish](#11-ishga-tushirish)
12. [Qabul mezonlari](#12-qabul-mezonlari)

---

## 1. Maqsad va qamrov

O'quv markazining kundalik ishini bitta backendda boshqarish: kurslar, xonalar,
guruhlar, darslar, davomat, imtihonlar, uy vazifalari, to'lovlar, maoshlar,
xarajatlar va xabarlar.

**Qamrovga kiradi:**

- Login va parol orqali tizimga kirish (JWT, cookie)
- Uch xil rol va rollar bo'yicha ruxsatlar
- 15 ta jadvaldan iborat ERP ma'lumotlar bazasi
- Har bir bo'lim uchun CRUD endpointlar
- Swagger hujjati

**Qamrovga kirmaydi:**

- Telegram bot va sun'iy intellekt
- OTP orqali kirish va SMS yuborish
- To'lov tizimlari bilan integratsiya
- Ro'yxatdan o'tish (registratsiya) — hisobni faqat superadmin ochadi

---

## 2. Rollar

| Rol | Vazifasi |
| --- | --- |
| `SUPERADMIN` | Barcha bo'limlarni boshqaradi, login-parol yaratadi |
| `TEACHER` | Dars, davomat, imtihon, uy vazifasi bilan ishlaydi |
| `STUDENT` | O'z davomati, to'lovi, bahosi va vazifasini ko'radi |

Superadmin `.env` dagi ma'lumotlar asosida server birinchi marta ishga
tushganda avtomatik yaratiladi (`PrismaService.onModuleInit`).

`RolesGuard` ishlash tartibi:

1. Endpointga `@AccessRoles(...)` qo'yilmagan bo'lsa — hammaga ruxsat
2. Foydalanuvchi `SUPERADMIN` bo'lsa — hamma joyga ruxsat
3. `@AccessRoles('ID')` va `:id` foydalanuvchining o'z raqami bo'lsa — ruxsat
4. Roli ro'yxatda bo'lsa — ruxsat, aks holda `403`

---

## 3. Papka tuzilmasi

```
src/
├── app.module.ts                 # barcha modullar yig'iladi
├── app.service.ts                # serverni sozlab ishga tushiradi
├── main.ts
├── common/
│   ├── decorator/                # UserId, RefreshToken, AccessRoles
│   ├── enum/                     # Roles, Status, GroupStatus, ...
│   ├── filter/                   # AllExceptionsFilter
│   ├── guard/                    # AuthGuard, RolesGuard
│   ├── helper/                   # successRes, getDeviceInfo
│   ├── interface/                # IPayload, ISuccess, IToken
│   └── pipe/                     # ImageValidationPipe
├── config/
│   ├── index.ts                  # .env dan o'qiladigan sozlamalar
│   └── database/                 # PrismaModule, PrismaService
├── infrastructure/lib/           # Crypt, Token, File
└── modules/
    ├── auth/                     # auth + device
    ├── user/
    ├── course/                   ├── room/
    ├── group/                    ├── group-student/
    ├── lesson/                   ├── attendance/
    ├── payment/                  ├── salary/
    ├── expense/                  ├── exam/
    ├── exam-result/              ├── homework/
    └── homework-submission/
```

Har bir modul `x.module.ts`, `x.controller.ts`, `x.service.ts` va `dto/` dan
iborat. Controller faqat so'rovni qabul qiladi, barcha mantiq service da.

---

## 4. Ma'lumotlar bazasi

Prisma + PostgreSQL, adapter `@prisma/adapter-pg`, klient `generated/prisma` ga
generatsiya qilinadi.

### Enumlar

| Enum | Qiymatlari |
| --- | --- |
| `Roles` | SUPERADMIN, TEACHER, STUDENT |
| `Status` | ACTIVE, INACTIVE |
| `GroupStatus` | NEW, ACTIVE, FINISHED |
| `AttendanceStatus` | PRESENT, ABSENT, LATE |
| `PaymentMethod` | CASH, CARD, TRANSFER |

### Jadvallar (15 ta)

| Jadval | Vazifasi | Asosiy bog'lanishlari |
| --- | --- | --- |
| `User` | Barcha foydalanuvchilar | devices, groups, payments, ... |
| `Devices` | Kirilgan qurilmalar | userId |
| `Course` | Kurslar | groups |
| `Room` | O'quv xonalari | groups |
| `Group` | Guruhlar | courseId, teacherId, roomId |
| `GroupStudent` | Guruh va o'quvchi bog'lanishi | groupId + studentId |
| `Lesson` | Darslar | groupId |
| `Attendance` | Davomat | lessonId + studentId |
| `Payment` | O'quvchi to'lovlari | studentId, groupId |
| `Salary` | O'qituvchi maoshlari | teacherId + month |
| `Expense` | Markaz xarajatlari | — |
| `Exam` | Imtihonlar | groupId |
| `ExamResult` | Imtihon natijalari | examId + studentId |
| `Homework` | Uy vazifalari | lessonId |
| `HomeworkSubmission` | Topshirilgan vazifalar | homeworkId + studentId |

Takrorlanmas juftliklar `@@unique` bilan himoyalangan: bitta o'quvchi bitta
guruhga bir marta qo'shiladi, bitta darsda bitta davomat belgisi bo'ladi,
bitta imtihonda bitta natija, bitta vazifaga bitta javob, bitta oyga bitta maosh.

---

## 5. Tokenlar va qurilmalar

- `Token.getToken(payload)` — access va refresh tokenlarni yasaydi
- Payload: `{ sub, role, status, deviceId }`
- Tokenlar `httpOnly` cookie da yuboriladi (`accessToken`, `refreshToken`)
- Refresh token bazada shifrlangan holda `Devices.hashedRefreshToken` da saqlanadi
- Bitta foydalanuvchi uchun qurilmalar soni **2 tadan** oshmaydi
- Eski qurilmani o'chirish uchun sessiya kamida **24 soat** bo'lishi kerak
- Joriy qurilmani o'chirib bo'lmaydi

---

## 6. Guardlar va dekoratorlar

| Nomi | Vazifasi |
| --- | --- |
| `AuthGuard` | Cookie dagi access tokenni tekshiradi, `req.user` ni to'ldiradi |
| `RolesGuard` | `@AccessRoles` bilan berilgan rollarni tekshiradi |
| `@AccessRoles(...)` | Endpointga ruxsat etilgan rollarni belgilaydi |
| `@UserId()` | Tokendan foydalanuvchi raqamini oladi |
| `@RefreshToken()` | Cookie dan refresh tokenni oladi |
| `ImageValidationPipe` | Rasmni tekshirib `webp` ga o'giradi |
| `AllExceptionsFilter` | Barcha xatolarni bir xil ko'rinishda qaytaradi |

---

## 7. Endpointlar

Umumiy yo'l: `/api/v1`

### Auth va qurilmalar

| Metod | Yo'l | Kim |
| --- | --- | --- |
| POST | `/auth/signin` | hamma |
| POST | `/auth/refresh` | hamma |
| POST | `/auth/signout` | hamma |
| GET | `/auth/me` | tizimga kirgan |
| GET | `/device` | tizimga kirgan |
| DELETE | `/device/:id` | tizimga kirgan |

### Foydalanuvchilar

| Metod | Yo'l | Kim |
| --- | --- | --- |
| POST | `/user` | SUPERADMIN |
| GET | `/user` | SUPERADMIN |
| GET | `/user/:id` | SUPERADMIN yoki o'zi |
| PATCH | `/user/:id` | SUPERADMIN yoki o'zi (rasm bilan) |
| DELETE | `/user/:id` | SUPERADMIN |

### O'quv qismi

| Metod | Yo'l | Kim |
| --- | --- | --- |
| POST/PATCH/DELETE | `/course`, `/room`, `/group`, `/group-student` | SUPERADMIN |
| GET | `/course`, `/group` | hamma |
| GET | `/group-student/:groupId` | TEACHER |
| POST/PATCH/DELETE | `/lesson`, `/attendance`, `/exam`, `/exam-result`, `/homework` | TEACHER |
| GET | `/lesson/group/:groupId`, `/exam/group/:groupId` | TEACHER, STUDENT |
| GET | `/attendance/my`, `/exam-result/my` | STUDENT |
| POST | `/homework-submission` | STUDENT |
| PATCH | `/homework-submission/:id` | TEACHER (baho qo'yadi) |

### Moliya

| Metod | Yo'l | Kim |
| --- | --- | --- |
| POST/GET/PATCH/DELETE | `/payment`, `/salary`, `/expense` | SUPERADMIN |
| GET | `/payment/my` | STUDENT |
| GET | `/salary/my` | TEACHER |

---

## 8. Javob formati

Muvaffaqiyatli javob `successRes` orqali qaytadi:

```json
{
  "statusCode": 200,
  "data": {}
}
```

Xato javobi `AllExceptionsFilter` orqali qaytadi:

```json
{
  "statusCode": 403,
  "code": "Forbidden",
  "message": "Ruxsat etilmagan foydalanuvchi",
  "path": "/api/v1/course",
  "timestamp": "2026-09-23T10:05:51.396Z"
}
```

| Status | Qachon |
| --- | --- |
| 400 | Login yoki parol xato, ball maksimaldan oshgan, muddat o'tgan |
| 401 | Token yo'q yoki yaroqsiz |
| 403 | Rol mos emas, foydalanuvchi bloklangan, qurilma limiti |
| 404 | Yozuv topilmadi |
| 409 | Takrorlanish (login, nom, davomat, natija) |

---

## 9. Konfiguratsiya

```env
PORT=
DB_URI=

BASE_URL=
FILE_PATH=

SUPERADMIN_LOGIN=
SUPERADMIN_PASSWORD=

ACCESS_TOKEN_KEY=
ACCESS_TOKEN_TIME=
REFRESH_TOKEN_KEY=
REFRESH_TOKEN_TIME=
```

---

## 10. Kerakli paketlar

`@nestjs/common`, `@nestjs/core`, `@nestjs/jwt`, `@nestjs/platform-express`,
`@nestjs/swagger`, `@prisma/client`, `@prisma/adapter-pg`, `prisma`, `bcrypt`,
`class-validator`, `class-transformer`, `cookie-parser`, `device-detector-js`,
`dotenv`, `helmet`, `multer`, `sharp`, `reflect-metadata`, `rxjs`.

---

## 11. Ishga tushirish

```bash
cp .env.example .env
pnpm install
pnpm exec prisma migrate dev
pnpm start:dev
```

Swagger: `http://localhost:3000/api/v1/docs`

---

## 12. Qabul mezonlari

1. Server ishga tushganda superadmin avtomatik yaratiladi
2. To'g'ri login-parol bilan `201` va ikkita cookie qaytadi
3. Xato parolda `400`, bloklangan foydalanuvchida `403` qaytadi
4. Uchinchi qurilmadan kirishga urinilganda `403` qaytadi
5. Tokensiz himoyalangan endpointga murojaatda `401` qaytadi
6. Roli mos kelmagan endpointda `403` qaytadi
7. Superadmin `POST /user` orqali o'qituvchi va o'quvchi yarata oladi
8. O'quvchi faqat o'z davomati, to'lovi, bahosi va vazifalarini ko'radi
9. O'qituvchi dars, davomat, imtihon va uy vazifasi bilan ishlay oladi
10. Barcha javoblar `{ statusCode, data }` ko'rinishida qaytadi
