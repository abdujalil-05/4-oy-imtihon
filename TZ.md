# O'quv markazi mini ERP — Autentifikatsiya, Guard va Qurilmalar moduli

## Texnik topshiriq (TZ)

| | |
|---|---|
| Loyiha | O'quv markazi (repetitor) uchun mini ERP |
| Modul | Auth: JWT + Guardlar + Qurilmalar (sessiyalar) |
| Stack | NestJS 11 + TypeScript + Prisma 7 (`@prisma/adapter-pg`) + PostgreSQL |
| Versiya | 2.0 |
| Sana | 2026-09-22 |
| Repo | https://github.com/abdujalil-05/4-oy-imtihon |

---

## Mundarija

1. Maqsad va qamrov
2. Asosiy tushunchalar
3. Rollar va huquqlar matritsasi
4. Arxitektura va papka tuzilmasi
5. Tokenlar
6. Qurilmalar (sessiyalar) modeli
7. Ma'lumotlar bazasi
8. Auth oqimlari
9. Guardlar va decoratorlar
10. API endpointlar va javob formati
11. Xavfsizlik talablari
12. Xato javoblari
13. Konfiguratsiya (.env)
14. Kerakli paketlar
15. Ishga tushirish
16. Qabul mezonlari (tekshiruv ro'yxati)
17. Keyinroq qo'shiladigan narsalar

---

## 1. Maqsad va qamrov

### 1.1. Hozirgi holat

- Interfeys faqat backend/API (Postman/Swagger orqali ishlatiladi)
- Rollar: **ADMIN**, **TEACHER**, **STUDENT**
- Kirish: **login + parol**. Hisobni faqat Admin yaratadi (ro'yxatdan o'tish yo'q)
- Birinchi Admin server ishga tushganda `.env` dan **avtomatik** yaratiladi

### 1.2. Maqsad

Login qilgan foydalanuvchi:

- har so'rovda parol yubormasdan, access token orqali tanilsin;
- faqat o'z roliga ruxsat etilgan endpointlarga kira olsin;
- o'zi kirgan qurilmalar ro'yxatini ko'ra olsin va istalganini uza olsin;
- qurilma uzilgan zahoti o'sha qurilmadan kira olmay qolsin.

### 1.3. Qamrovga KIRADI

| № | Funksiya |
|---|---|
| 1 | Login → access token + refresh token |
| 2 | Refresh (rotatsiya bilan) |
| 3 | Logout (joriy qurilma) va logout-all (hammasi) |
| 4 | `me` — joriy foydalanuvchi |
| 5 | Qurilmalar ro'yxati va bittasini uzish |
| 6 | Bir foydalanuvchiga maksimal 5 ta faol qurilma |
| 7 | Parolni o'zgartirish (boshqa qurilmalar uziladi) |
| 8 | Global `AuthGuard` + `@Public` istisno |
| 9 | Global `RolesGuard` + `@AccessRoles` |
| 10 | `@CurrentUser` / `@UserId` decoratorlari |
| 11 | 5 marta noto'g'ri parol → 15 daqiqa blok |
| 12 | Login/refresh uchun rate limit (throttle) |
| 13 | Admin: foydalanuvchi yaratish, bloklash/ochish, parol tiklash, qurilmalarini uzish |
| 14 | Refresh token reuse detection |
| 15 | Birinchi Admin avtomatik yaratilishi |

### 1.4. Qamrovga KIRMAYDI

| Funksiya | Nega |
|---|---|
| Ro'yxatdan o'tish, SMS/OTP, Telegram login, 2FA, email | MVP talabida yo'q |
| Redis, token keshi | Mini hajmda PostgreSQL yetarli |
| httpOnly cookie | Frontend yo'q; keyinroq |
| Xatolarni Telegram/AI ga yuborish | Kerak emas — oddiy log yetarli |
| Unit/e2e testlar (`*.spec.ts`) | Loyihada ishlatilmaydi; tekshiruv Postman/Swagger orqali |
| Muddati o'tgan sessiyalarni tozalovchi cron | Keyinroq (17-bo'lim) |

---

## 2. Asosiy tushunchalar

- **Access token** — 15 daqiqalik JWT (HS256). `Authorization: Bearer <token>` sarlavhasida yuboriladi.
- **Refresh token** — 7 kunlik **tasodifiy satr** (JWT emas). Faqat `POST /auth/refresh` da yuboriladi. Bazada faqat SHA-256 xeshi.
- **Qurilma (device) = sessiya** — bitta muvaffaqiyatli login natijasida `Devices` jadvalida paydo bo'ladigan yozuv.
- **Rotatsiya** — har refresh'da eski refresh token bekor bo'lib, yangisi beriladi. Qurilma ID o'zgarmaydi.
- **Reuse detection** — allaqachon almashtirilgan (eski) refresh token qayta kelsa → o'g'irlik belgisi → qurilma yopiladi.
- **Guard** — controller'gacha ishlaydigan qorovul. `true` qaytarsa so'rov o'tadi, aks holda 401/403.

---

## 3. Rollar va huquqlar matritsasi

### 3.1. Rollar

| Rol | Kim | Huquq |
|---|---|---|
| ADMIN | Administrator | Hamma narsa |
| TEACHER | O'qituvchi | Faqat o'z guruhlari |
| STUDENT | O'quvchi | Faqat o'z profili |

### 3.2. Auth va qurilma endpointlari

| Endpoint | Mehmon | STUDENT | TEACHER | ADMIN |
|---|---|---|---|---|
| POST /auth/login | ✅ | ✅ | ✅ | ✅ |
| POST /auth/refresh | ✅ | ✅ | ✅ | ✅ |
| POST /auth/logout | 401 | ✅ | ✅ | ✅ |
| POST /auth/logout-all | 401 | ✅ | ✅ | ✅ |
| GET /auth/me | 401 | ✅ | ✅ | ✅ |
| PATCH /auth/password | 401 | ✅ | ✅ | ✅ |
| GET /auth/sessions | 401 | faqat o'ziniki | faqat o'ziniki | faqat o'ziniki |
| DELETE /auth/sessions/:id | 401 | faqat o'ziniki | faqat o'ziniki | faqat o'ziniki |

### 3.3. Admin endpointlari

| Endpoint | STUDENT | TEACHER | ADMIN |
|---|---|---|---|
| POST /users | 403 | 403 | ✅ |
| GET /users | 403 | 403 | ✅ |
| PATCH /users/:id/status | 403 | 403 | ✅ (o'zini emas) |
| PATCH /users/:id/password | 403 | 403 | ✅ |
| GET /users/:id/sessions | 403 | 403 | ✅ |
| DELETE /users/:id/sessions | 403 | 403 | ✅ |

### 3.4. Uch qatlamli tekshiruv

```
1-qatlam: Authentication → AuthGuard  → "Kimsan?"          → 401
2-qatlam: Rol            → RolesGuard → "Qaysi roldasan?"  → 403
3-qatlam: Resurs egaligi → Service    → "Bu seniki-mi?"    → 404
```

---

## 4. Arxitektura va papka tuzilmasi

### 4.1. So'rov yo'li

```
KLIENT ── Authorization: Bearer <access> ──►
   ThrottlerGuard (global; login 10/min, refresh 20/min)
        ▼
   AuthGuard (global) ── @Public bo'lsa ──► o'tkazadi
        │  token imzo/muddat → Devices + User bitta so'rovda → faolmi?
        ▼
   req.user = { sub, role (bazadan), deviceId }
        ▼
   RolesGuard (global) ── @AccessRoles yo'q bo'lsa ──► o'tkazadi
        ▼
   Controller → Service → PrismaService → PostgreSQL
```

### 4.2. Papka tuzilmasi

```
prisma.config.ts                 ← Prisma 7 konfiguratsiyasi (DB_URI env dan)
prisma/schema.prisma             ← User, Devices, enumlar
src/
├── main.ts                      ← App.main()
├── app.service.ts               ← class App: pipe, filter, helmet, cors, swagger, listen
├── app.module.ts                ← modullar + APP_GUARD (Throttler → Auth → Roles)
├── config/
│   ├── index.ts                 ← env obyekti (dotenv), majburiy qiymat yo'q bo'lsa xato
│   └── database/
│       ├── prisma.module.ts     ← @Global
│       └── prisma.service.ts    ← PrismaClient + adapter-pg; onModuleInit da Admin yaratiladi
├── infrastructure/lib/
│   ├── Crypt.ts                 ← bcrypt hash / compare (statik)
│   └── Token.ts                 ← access JWT sign/verify, refresh generate/hash, muddatlar (statik)
├── common/
│   ├── decorator/
│   │   ├── public.decorator.ts        ← @Public()
│   │   ├── roles.decorator.ts         ← @AccessRoles(...roles)
│   │   ├── current-user.decorator.ts  ← @UserId(), @CurrentUser()
│   │   └── is-password.decorator.ts   ← @IsPassword() — parol qoidalari bitta joyda
│   ├── enum/index.ts            ← Roles, RevokeReason
│   ├── filter/all-exception.filter.ts ← barcha xatolar bir xil formatda
│   ├── guard/
│   │   ├── jwt-auth.guard.ts    ← AuthGuard (Passport'siz, o'z tekshiruvi)
│   │   └── roles.guard.ts       ← RolesGuard
│   ├── helper/
│   │   ├── success-response.ts  ← successRes(data, statusCode)
│   │   └── device-info.ts       ← User-Agent → qurilma nomi (device-detector-js)
│   └── interface/               ← IPayload, IUser, IToken, ISuccess
└── modules/
    ├── auth/
    │   ├── auth.module.ts
    │   ├── auth.controller.ts   ← login, refresh, logout, logout-all, me, password
    │   ├── auth.service.ts
    │   ├── device.controller.ts ← GET/DELETE /auth/sessions
    │   ├── device.service.ts    ← yaratish, rotatsiya, revoke, ro'yxat, limit
    │   └── dto/                 ← sign-in, refresh, change-password
    └── user/
        ├── user.module.ts
        ├── user.controller.ts   ← admin endpointlari (@AccessRoles(ADMIN) class darajasida)
        ├── user.service.ts
        └── dto/                 ← create-user, update-status, reset-password, query-user
```

### 4.3. Modullar va bog'liqlik

| Modul | Mas'uliyati | Eksport |
|---|---|---|
| PrismaModule (global) | Baza ulanishi, birinchi Admin | PrismaService |
| AuthModule | Login/refresh/logout, qurilmalar | DeviceService |
| UserModule | Admin amallari | — |

```
UserModule ──► AuthModule (DeviceService uchun)
AuthModule ──► hech kimga (faqat PrismaService)
```

### 4.4. Qatlamlar mas'uliyati

| Qatlam | Qiladi | Qilmaydi |
|---|---|---|
| Controller | HTTP so'rov, DTO, `req.user` dan qiymat olib Service'ga uzatadi | Bazaga murojaat, biznes qaror |
| Service | Biznes qoidalar; javobni `successRes()` bilan qaytaradi | Response obyekti bilan ishlash |
| Guard | Ruxsat berish/bermaslik | Ma'lumot o'zgartirish |
| `infrastructure/lib` | Sof yordamchi funksiyalar (xesh, token) | Bazaga murojaat |

---

## 5. Tokenlar

### 5.1. Access token

| Parametr | Qiymat |
|---|---|
| Turi | JWT, HS256 (faqat shu algoritm qabul qilinadi) |
| Muddati | `ACCESS_TOKEN_TIME` (15m) |
| Kalit | `ACCESS_TOKEN_KEY` (≥ 32 belgi) |
| Payload | `sub` (user id), `role`, `deviceId` (uuid), `iat`, `exp` |
| Yuboriladi | `Authorization: Bearer <token>` |

Token ichida parol, xesh, ism yo'q. Rol haqiqiy qiymati har so'rovda **bazadan** olinadi (Admin rolni o'zgartirsa darhol kuchga kiradi).

### 5.2. Refresh token

| Parametr | Qiymat |
|---|---|
| Turi | 64 bayt kriptografik tasodif, hex (128 belgi). JWT emas |
| Muddati | `REFRESH_TOKEN_DAYS` (7) — `Devices.expiresAt` da |
| Bazada | Faqat SHA-256 xeshi (`hashedRefreshToken`, UNIQUE) |
| Qayerga yuboriladi | Faqat `POST /auth/refresh` tanasida |

**Nega SHA-256, bcrypt emas?** Token 64 bayt tasodif — tanlab topib bo'lmaydi, sekinlashtirish shart emas. SHA-256 deterministik — xesh bo'yicha unique index bilan qidirish mumkin.

### 5.3. Rotatsiya va reuse detection

```
refresh(R1) → R1 xeshi "oldingi"ga o'tadi, R2 beriladi, deviceId o'zgarmaydi
refresh(R1) yana → R1 joriy xeshlarda yo'q, "oldingi"da BOR → REUSE → qurilma yopiladi (REUSE_DETECTED) → 401
refresh(R2)      → qurilma yopiq → 401 (egasi ham qayta login qiladi)
```

Yangilash **shartli UPDATE** bilan: `hashedRefreshToken` hali eski xeshga teng bo'lsagina. Ikki parallel refresh — ikkinchisi 0 qator yangilaydi → 401.

---

## 6. Qurilmalar (sessiyalar) modeli

- Bitta login = bitta `Devices` yozuvi.
- Qurilma nomi: klient `deviceName` bergan bo'lsa (≤ 50 belgi) → u; aks holda User-Agent dan (`device-detector-js`): "Chrome 128 · Windows 10"; UA ham yo'q → "Noma'lum qurilma".
- IP: `req.ip` (`trust proxy` yoqilgan).
- **Faol** = `revokedAt` bo'sh **VA** `expiresAt > hozir`. Alohida `status` ustuni yo'q.
- `lastUsedAt` login va refresh paytida yangilanadi (har so'rovda emas).
- `expiresAt` har refresh'da +7 kun (sirpanuvchi muddat).

### 6.1. Yopilish sabablari (`RevokeReason`)

| Sabab | Qachon |
|---|---|
| LOGOUT | Shu qurilmadan chiqdi |
| LOGOUT_ALL | Hammasidan chiqdi |
| REVOKED_BY_USER | Ro'yxatdan boshqa qurilmasini uzdi |
| PASSWORD_CHANGED | Parol o'zgardi (joriydan boshqalari) |
| LIMIT_EXCEEDED | 6-qurilma kirdi — eng uzoq ishlatilmagani uzildi |
| REUSE_DETECTED | Eski refresh token qayta ishlatildi |
| ADMIN_REVOKED | Admin bloklagan / parol tiklagan / chiqargan |

### 6.2. Limit — `MAX_DEVICES` (5)

Login paytida **bitta tranzaksiyada**: faol sonini sanash → ≥ limit bo'lsa `lastUsedAt` eng eskisini `LIMIT_EXCEEDED` bilan yopish → yangisini yaratish.

### 6.3. Ro'yxatda ko'rsatiladi

`deviceId`, `device`, `ipAddress`, `createdAt`, `lastUsedAt`, `isCurrent` (`deviceId === req.user.deviceId`). Faqat faollari. Xesh hech qachon chiqmaydi.

---

## 7. Ma'lumotlar bazasi

### 7.1. Prisma sozlamasi

- `generator client`: provider `prisma-client`, output `../generated/prisma`, `moduleFormat = "cjs"`.
- `datasource db`: provider `postgresql`, URL `prisma.config.ts` orqali `env.DB_URI` dan.
- `generated/` papkasi `.gitignore` da — `npx prisma generate` bilan yaratiladi.

### 7.2. `User`

| Maydon | Tip | Standart | Izoh |
|---|---|---|---|
| id | Int, PK, autoincrement | | |
| login | String, UNIQUE | | Kichik harfda saqlanadi |
| hashedPassword | String | | bcrypt. API javobida hech qachon yo'q |
| fullName | String | | |
| role | enum Roles | | ADMIN / TEACHER / STUDENT |
| isActive | Boolean | true | Admin bloklasa false |
| failedLoginCount | Int | 0 | Ketma-ket xato parollar |
| lockedUntil | DateTime? | null | Shu vaqtgacha login taqiq |
| lastLoginAt | DateTime? | null | |
| createdAt / updatedAt | DateTime | | |

### 7.3. `Devices`

| Maydon | Tip | Izoh |
|---|---|---|
| deviceId | String uuid, PK | Taxmin qilib bo'lmaydi |
| device | String | "Chrome 128 · Windows 10" |
| userAgent | String? | Xom UA (≤ 500) |
| ipAddress | String? | |
| hashedRefreshToken | String, UNIQUE | Joriy token SHA-256 |
| previousTokenHash | String?, INDEX | Reuse detection |
| lastUsedAt | DateTime | Login/refresh da |
| expiresAt | DateTime | Refresh muddati |
| revokedAt | DateTime? | Bo'sh = faol |
| revokedReason | enum RevokeReason? | |
| userId | Int, FK → User | |
| createdAt / updatedAt | DateTime | |

Indexlar: `UNIQUE(hashedRefreshToken)`, `INDEX(previousTokenHash)`, `INDEX(userId, revokedAt)`.

### 7.4. Birinchi Admin

`PrismaService.onModuleInit` da: `SUPERADMIN_LOGIN` bo'yicha qidiradi, yo'q bo'lsa `SUPERADMIN_PASSWORD` ni bcrypt bilan xeshlab `ADMIN` rolida yaratadi. Idempotent — bor bo'lsa hech narsa qilmaydi. Alohida seed skripti yo'q.

---

## 8. Auth oqimlari

### 8.1. Login — `POST /auth/login` (`login`, `password`, `deviceName?`)

```
 1. Throttle: IP dan 1 daqiqada 10 tadan ko'p → 429
 2. DTO: login, password bo'sh emas; ortiqcha maydon → 400
 3. login → kichik harf, User topish
 4. bcrypt compare HAR DOIM bajariladi (topilmasa — soxta xesh bilan; vaqt tengligi)
 5. Topilmadi → 401 "Login yoki parol noto'g'ri"
 6. lockedUntil > hozir → 429 "Juda ko'p urinish. N daqiqadan keyin..."   (parol tekshiruvidan OLDIN)
 7. Parol xato → failedLoginCount+1; ≥ LOGIN_MAX_ATTEMPTS → lockedUntil = hozir+15 daqiqa, hisoblagich 0 → 401 (xuddi shu xabar)
 8. isActive = false → 403 "Hisob bloklangan..."                             (parol tekshiruvidan KEYIN)
 9. failedLoginCount = 0, lockedUntil = null, lastLoginAt = hozir
10. DeviceService.create — tranzaksiyada limit + yangi qurilma (xesh bilan)
11. Token.getAccessToken({ sub, role, deviceId })
12. successRes({ accessToken, refreshToken, accessTokenExpiresIn, user{id, login, fullName, role} })
```

### 8.2. Har himoyalangan so'rov — `AuthGuard`

```
@Public bormi (handler yoki class)? → o'tkazish
Authorization: Bearer <token> yo'q → 401 "Avtorizatsiya talab qilinadi"
Imzo/muddat xato (Token.verifyAccessToken) → 401 "Token yaroqsiz yoki muddati o'tgan"
Devices (deviceId bo'yicha) + User bitta so'rovda
Topilmadi / revokedAt bor / expiresAt o'tgan / userId ≠ sub / user.isActive = false → 401 "Sessiya tugagan. Qayta kiring"
req.user = { sub, role (bazadan), deviceId }
```

### 8.3. Refresh — `POST /auth/refresh` (`refreshToken`, @Public)

```
DTO: aynan 128 belgi → aks holda 400
xesh = SHA-256(token) → Devices.hashedRefreshToken bo'yicha
TOPILDI: faol va user faol → yangi token; shartli UPDATE (previousTokenHash=eski, hashedRefreshToken=yangi, lastUsedAt, expiresAt+7, ip)
         0 qator yangilandi → 401
         → successRes({ accessToken, refreshToken, accessTokenExpiresIn })
TOPILMADI: previousTokenHash bo'yicha → topilsa va faol → REUSE_DETECTED bilan yopish → 401
           topilmasa → 401
```

### 8.4. Logout / logout-all

- `POST /auth/logout` — `req.user.deviceId` (klientdan emas!) → LOGOUT → `successRes({})`
- `POST /auth/logout-all` — barcha faol qurilmalar → LOGOUT_ALL → `successRes({})`

### 8.5. Me — `GET /auth/me`

`successRes({ id, login, fullName, role, lastLoginAt })`. Xesh, hisoblagich, blok — qaytmaydi.

### 8.6. Qurilmalar — `GET /auth/sessions`, `DELETE /auth/sessions/:id`

- Ro'yxat: faol, `lastUsedAt desc`, `isCurrent` bilan.
- Uzish: `:id` UUID emas → 400 (`ParseUUIDPipe`). `updateMany({ deviceId, userId, faol })` — 0 qator → 404 "Qurilma topilmadi" (boshqa odamniki bo'lsa ham 404, 403 emas). Sabab REVOKED_BY_USER.

### 8.7. Parolni o'zgartirish — `PATCH /auth/password` (`currentPassword`, `newPassword`)

```
newPassword = currentPassword → 400
Joriy parol noto'g'ri → 400 "Joriy parol noto'g'ri" (401 emas — foydalanuvchi tanilgan)
Tranzaksiya: yangi xesh + joriydan boshqa barcha qurilmalar PASSWORD_CHANGED
successRes({})
```

### 8.8. Admin amallari (`UserModule`)

| Amal | Mantiq |
|---|---|
| POST /users | login kichik harf, band → 409 "Bu login band"; parol xeshlanadi; javob 201, xeshsiz |
| GET /users?role=&isActive= | Filtr; xeshsiz |
| PATCH /users/:id/status | O'zini → 400. `false`: tranzaksiya — isActive=false + barcha qurilmalar ADMIN_REVOKED. `true`: isActive=true, hisoblagich 0, lockedUntil null |
| PATCH /users/:id/password | Tranzaksiya — yangi xesh + barcha qurilmalar ADMIN_REVOKED |
| GET /users/:id/sessions | Faol qurilmalari |
| DELETE /users/:id/sessions | Barcha qurilmalar ADMIN_REVOKED |

Mavjud bo'lmagan `:id` → 404 "Foydalanuvchi topilmadi".

---

## 9. Guardlar va decoratorlar

| Nom | Fayl | Vazifasi |
|---|---|---|
| `@Public()` | `common/decorator/public.decorator.ts` | `isPublic = true` metama'lumoti. Guardlar handler + class darajasida o'qiydi |
| `@AccessRoles(...roles)` | `common/decorator/roles.decorator.ts` | Ruxsat etilgan rollar. Handler class'dan ustun (`getAllAndOverride`) |
| `@UserId()` | `common/decorator/current-user.decorator.ts` | `req.user.sub` (number) |
| `@CurrentUser()` | o'sha fayl | butun `req.user` (`IUser`: sub, role, deviceId) |
| `@IsPassword()` | `common/decorator/is-password.decorator.ts` | Swagger + validatsiya: 8–72 belgi, kamida bitta harf va raqam |
| `AuthGuard` | `common/guard/jwt-auth.guard.ts` | 8.2-band. Passport ishlatilmaydi — `Token.verifyAccessToken` + Prisma |
| `RolesGuard` | `common/guard/roles.guard.ts` | `@Public` → o'tkazish; `@AccessRoles` yo'q → o'tkazish; rol ro'yxatda emas → 403 |
| `ThrottlerGuard` | `@nestjs/throttler` | Global (100/min), login `@Throttle 10/min`, refresh `20/min` |

Global ro'yxat `app.module.ts` da `APP_GUARD` orqali, tartib: **Throttler → AuthGuard → RolesGuard**. Controllerlarda `@UseGuards` yozilmaydi — hamma narsa sukut bo'yicha yopiq, ochiq bo'lishi kerak bo'lgani `@Public` bilan belgilanadi.

---

## 10. API endpointlar va javob formati

Global prefiks: `/api`. Swagger: `/api/docs` (Bearer "Authorize" bilan).

### 10.1. Muvaffaqiyatli javob

Hamma Service `successRes(data, statusCode = 200)` qaytaradi:

```
{ "statusCode": 200, "data": { ... } }
```

HTTP status Nest standarti: POST → 201, qolganlari → 200. Tanasi bo'sh amallar (logout, uzish, parol tiklash) `data: {}` qaytaradi.

### 10.2. Auth

| Metod | Yo'l | Kirish | Tana | data | Xatolar |
|---|---|---|---|---|---|
| POST | /auth/login | @Public, throttle | login, password, deviceName? | accessToken, refreshToken, accessTokenExpiresIn, user | 400, 401, 403, 429 |
| POST | /auth/refresh | @Public, throttle | refreshToken | accessToken, refreshToken, accessTokenExpiresIn | 400, 401, 429 |
| POST | /auth/logout | Bearer | — | {} | 401 |
| POST | /auth/logout-all | Bearer | — | {} | 401 |
| GET | /auth/me | Bearer | — | id, login, fullName, role, lastLoginAt | 401 |
| PATCH | /auth/password | Bearer | currentPassword, newPassword | {} | 400, 401 |
| GET | /auth/sessions | Bearer | — | [deviceId, device, ipAddress, createdAt, lastUsedAt, isCurrent] | 401 |
| DELETE | /auth/sessions/:id | Bearer | — | {} | 400, 401, 404 |

### 10.3. Admin — `/users` (`@AccessRoles(ADMIN)`)

| Metod | Yo'l | Tana / query | data | Xatolar |
|---|---|---|---|---|
| POST | /users | login, password, fullName, role | id, login, fullName, role, isActive, lastLoginAt, createdAt | 400, 401, 403, 409 |
| GET | /users | ?role=&isActive= | ro'yxat | 401, 403 |
| PATCH | /users/:id/status | isActive | yangilangan foydalanuvchi | 400, 401, 403, 404 |
| PATCH | /users/:id/password | newPassword | {} | 400, 401, 403, 404 |
| GET | /users/:id/sessions | — | qurilmalar | 401, 403, 404 |
| DELETE | /users/:id/sessions | — | {} | 401, 403, 404 |

---

## 11. Xavfsizlik talablari

| Talab | Qiymat |
|---|---|
| Parol xeshi | bcrypt, rounds `BCRYPT_ROUNDS` (12), `Crypt.hash` |
| Parol qoidalari | 8–72 belgi, kamida bitta harf va raqam — `@IsPassword()` (yaratish, o'zgartirish, tiklash — bitta qoida) |
| Access token | HS256, kalit ≥ 32 belgi, faqat `.env` da |
| Refresh token | `crypto.randomBytes(64)`, bazada faqat SHA-256 |
| Login himoyasi | Bir xil 401 xabar; soxta bcrypt; 5 xato → 15 daqiqa; IP throttle |
| Validatsiya | Global `ValidationPipe`: `whitelist`, `forbidNonWhitelisted`, `transform` |
| HTTP sarlavhalar | `helmet()` |
| CORS | Hozir `origin: '*'`; frontend qo'shilganda domen |
| Log | Token va parol hech qachon logga yozilmaydi; stack faqat 500 da |
| Vaqt | Barcha vaqtlar UTC, server vaqti bo'yicha |

---

## 12. Xato javoblari

`AllExceptionsFilter` — barcha xatolar bir xil formatda:

```
{ "statusCode": 401, "code": "Unauthorized", "message": "...", "path": "/api/...", "timestamp": "ISO" }
```

Validatsiya xabarlari ro'yxati vergul bilan bitta satrga qo'shiladi.

| Holat | Kod | Xabar |
|---|---|---|
| DTO xatosi | 400 | Validatsiya xabarlari |
| Login yoki parol noto'g'ri | 401 | "Login yoki parol noto'g'ri" |
| Token yo'q | 401 | "Avtorizatsiya talab qilinadi" |
| Token noto'g'ri / muddati o'tgan | 401 | "Token yaroqsiz yoki muddati o'tgan" |
| Sessiya yopilgan / refresh noto'g'ri / reuse | 401 | "Sessiya tugagan. Qayta kiring" |
| Hisob bloklangan | 403 | "Hisob bloklangan. Administratorga murojaat qiling" |
| Rol mos emas | 403 | "Bu amal uchun ruxsatingiz yo'q" |
| Qurilma topilmadi / boshqa odamniki | 404 | "Qurilma topilmadi" |
| Foydalanuvchi topilmadi | 404 | "Foydalanuvchi topilmadi" |
| Login band | 409 | "Bu login band" |
| Hisob bloki | 429 | "Juda ko'p urinish. N daqiqadan keyin qayta urinib ko'ring" |
| Throttle | 429 | "Juda ko'p so'rov. Birozdan keyin urinib ko'ring" |

---

## 13. Konfiguratsiya (.env)

`src/config/index.ts` — `env` obyekti. Majburiy qiymat yo'q bo'lsa server ishga tushmaydi. `.env.example` da nomlar qiymatsiz.

| O'zgaruvchi | Misol | Izoh |
|---|---|---|
| PORT | 3000 | |
| DB_URI | postgresql://... | Baza |
| SUPERADMIN_LOGIN | admin | Birinchi Admin |
| SUPERADMIN_PASSWORD | (kuchli parol) | Birinchi Admin |
| ACCESS_TOKEN_KEY | (≥ 32 belgi) | JWT kaliti |
| ACCESS_TOKEN_TIME | 15m | Access muddati |
| REFRESH_TOKEN_DAYS | 7 | Refresh muddati (kun) |
| MAX_DEVICES | 5 | Qurilmalar limiti |
| LOGIN_MAX_ATTEMPTS | 5 | Blokgacha xatolar |
| LOGIN_LOCK_MINUTES | 15 | Blok davomiyligi |
| BCRYPT_ROUNDS | 12 | Xesh narxi |

`env` ichida guruhlangan: `env.SUPERADMIN.*`, `env.TOKEN.*`, `env.AUTH.*`.

---

## 14. Kerakli paketlar

| Paket | Nima uchun |
|---|---|
| @nestjs/jwt | Access token |
| bcrypt | Parol xeshi |
| prisma, @prisma/client, @prisma/adapter-pg (v7) | ORM |
| dotenv | `.env` o'qish |
| device-detector-js | User-Agent → qurilma nomi |
| @nestjs/throttler | Rate limit |
| @nestjs/swagger | Hujjat |
| helmet | HTTP sarlavhalar |
| class-validator, class-transformer | DTO |

Passport, ConfigModule, Joi, Redis, OpenAI, Telegram — **ishlatilmaydi**.

---

## 15. Ishga tushirish

```bash
cp .env.example .env      # qiymatlarni to'ldiring
npm install
npx prisma migrate dev    # baza + Prisma Client (generated/prisma)
npm run start:dev         # http://localhost:3000/api  |  Swagger: /api/docs
```

Birinchi ishga tushganda logda `Admin created` chiqadi. Testlar (`*.spec.ts`) loyihada yo'q — tekshiruv 16-bo'lim bo'yicha Postman/Swagger orqali.

---

## 16. Qabul mezonlari

### 16.1. Login

| № | Ssenariy | Kutilgan |
|---|---|---|
| 1 | To'g'ri login/parol | 200, access + refresh, bazada yangi qurilma |
| 2 | Login katta harfda ("ADMIN") | 200 |
| 3 | Noto'g'ri parol | 401, umumiy xabar |
| 4 | Mavjud bo'lmagan login | 401, xuddi shu xabar |
| 5 | Ortiqcha maydon (role) | 400 |
| 6 | 5 ketma-ket xato | 5-sidan keyin to'g'ri parol ham 429 |
| 7 | Bloklangan hisob, to'g'ri parol | 403 |
| 8 | 1 daqiqada 11 login | 11-si 429 |

### 16.2. Token va qurilma

| № | Ssenariy | Kutilgan |
|---|---|---|
| 9 | Tokensiz himoyalangan endpoint | 401 |
| 10 | Buzilgan / muddati o'tgan token | 401 |
| 11 | Refresh | 200, yangi juftlik, deviceId o'zgarmagan |
| 12 | Eski refresh tokenni qayta ishlatish | 401, qurilma REUSE_DETECTED |
| 13 | Logout'dan keyin eski access/refresh | 401 (darhol) |
| 14 | Logout-all | barcha qurilmalar 401 |
| 15 | 6-qurilmadan login | eng uzoq ishlatilmagani LIMIT_EXCEEDED, faol 5 ta |
| 16 | Bazada refresh token ochiq holda yo'q | faqat 64 belgili xesh |
| 17 | Qurilmalar ro'yxati | faqat o'ziniki, faollari, `isCurrent` |
| 18 | Boshqa odamning qurilmasini uzish | 404 |
| 19 | UUID bo'lmagan id | 400 |

### 16.3. Rollar va Admin

| № | Ssenariy | Kutilgan |
|---|---|---|
| 20 | STUDENT/TEACHER → /users | 403 |
| 21 | Admin foydalanuvchi yaratadi | 201, javobda xesh yo'q |
| 22 | Band login | 409 |
| 23 | Admin bloklaydi | foydalanuvchi tokenlari darhol 401, login 403 |
| 24 | Admin o'zini bloklaydi | 400 |
| 25 | Admin parolni tiklaydi | barcha qurilmalar yopiladi |
| 26 | Foydalanuvchi parolni o'zgartiradi | joriy qurilma ishlaydi, boshqalari 401 |
| 27 | Kuchsiz yangi parol ("12345678") | 400 |
| 28 | `ACCESS_TOKEN_KEY` yo'q yoki < 32 belgi | server ishga tushmaydi |
| 29 | Server birinchi ishga tushganda | Admin avtomatik yaratiladi; ikkinchi marta — takrorlanmaydi |
| 30 | Swagger Authorize orqali /auth/me | ishlaydi |

---

## 17. Keyinroq qo'shiladigan narsalar

| Narsa | Qachon | Qayerga |
|---|---|---|
| Yopilgan/eskirgan qurilmalarni tozalash (cron) | `Devices` katta bo'lganda | DeviceService + `@nestjs/schedule` |
| Redis'da sessiya keshi | Har so'rovdagi DB tekshiruvi sezilganda | AuthGuard |
| httpOnly cookie | Brauzer frontend qo'shilganda | AuthController |
| Parallel refresh uchun grace window | Ko'p tabli frontend | DeviceService.rotate |
| Login tarixi (audit) | Tahlil kerak bo'lganda | Alohida jadval |
| Birinchi kirishda parolni majburiy almashtirish | Admin vaqtinchalik parol bersa | `User.mustChangePassword` |

---

*Hujjat oxiri.*
