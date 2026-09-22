# O'quv markazi mini ERP — Autentifikatsiya, Guard va Qurilmalar moduli

## Texnik topshiriq (TZ)

| | |
|---|---|
| Loyiha | O'quv markazi (repetitor) uchun mini ERP |
| Modul | Auth: JWT + Guardlar + Qurilmalar (sessiyalar) |
| Stack | NestJS + TypeScript + Prisma + PostgreSQL |
| Versiya | 1.0 |
| Sana | 2026-09-21 |
| Hujjat turi | Faqat tavsif, arxitektura va jadvallar. **Kod yo'q** — kodni dasturchi o'zi yozadi |

---

## Mundarija

0. Hujjat haqida
1. Maqsad va qamrov
2. Asosiy tushunchalar (lug'at)
3. Rollar va huquqlar matritsasi
4. Arxitektura
5. JWT tuzilmasi
6. Qurilmalar (sessiyalar) modeli
7. Ma'lumotlar bazasi: jadvallar
8. Auth oqimlari (qadamma-qadam)
9. Guardlar va decoratorlar
10. API endpointlar
11. Xavfsizlik talablari
12. Xato javoblari
13. Konfiguratsiya (.env)
14. Kerakli paketlar
15. **Amalga oshirish ketma-ketligi — boshidan oxirigacha**
16. Test ssenariylari va qabul mezonlari
17. Hozir kirmaydigan, keyinroq qo'shiladigan narsalar

---

## 0. Hujjat haqida

Bu hujjat mini ERP'ga uchta narsani qo'shish uchun yozilgan:

1. **JWT** — foydalanuvchi bir marta login qilgach, keyingi so'rovlarda o'zini parolsiz tanitishi uchun.
2. **Guardlar** — har bir endpointga kim kira olishini tizim darajasida tekshirish uchun.
3. **Qurilmalar (devices)** — bitta foydalanuvchi qaysi qurilmalardan kirganini ko'rish va istalgan qurilmani uzish uchun.

Hujjatda kod yo'q. Buning o'rniga har bir qism uchun:

- **nima** qilinadi,
- **nega** aynan shunday qilinadi,
- **qanday** tartibda qilinadi,
- **qanday tekshiriladi**

yozilgan. Kodni shu hujjatga qarab o'zingiz yozasiz.

**Asosiy qoida — kattalashtirmaslik.** Bu "mini" modul. Bank darajasidagi murakkablik (2FA, OTP, Redis, qurilma barmoq izi) bu yerda yo'q. Faqat to'g'ri ishlaydigan, xavfsiz va tushunarli minimal yechim.

---

## 1. Maqsad va qamrov

### 1.1. Hozirgi holat

Mini ERP MVP'sida:

- Interfeys faqat backend/API (frontend yo'q, Postman/Swagger orqali ishlatiladi)
- Bitta filial
- Rollar: **Admin**, **O'qituvchi (Teacher)**, **O'quvchi (Student)**
- Kirish: **login + parol**. Hisobni **Admin yaratadi** (o'z-o'zidan ro'yxatdan o'tish yo'q)
- Guruh yaratish huquqi faqat Admin'da
- Bitta o'quvchi bir nechta guruhga a'zo bo'la oladi

### 1.2. Maqsad

Login qilgan foydalanuvchi:

- har so'rovda parol yubormasdan, token orqali tanilsin;
- faqat o'z roliga ruxsat etilgan endpointlarga kira olsin;
- o'zi kirgan qurilmalar ro'yxatini ko'ra olsin va istalganini uza olsin;
- qurilma uzilgan zahoti o'sha qurilmadan kira olmay qolsin.

### 1.3. Qamrovga KIRADI

| № | Funksiya |
|---|---|
| 1 | Login (login + parol) → access token + refresh token |
| 2 | Access tokenni refresh token orqali yangilash (rotatsiya bilan) |
| 3 | Logout (joriy qurilmadan chiqish) |
| 4 | Logout-all (barcha qurilmalardan chiqish) |
| 5 | `me` — joriy foydalanuvchi ma'lumoti |
| 6 | Qurilmalar ro'yxati va bitta qurilmani uzish |
| 7 | Bir foydalanuvchiga maksimal 5 ta faol qurilma |
| 8 | Parolni o'zgartirish (boshqa qurilmalar avtomatik uziladi) |
| 9 | Global JWT guard + `@Public` istisno |
| 10 | Rol guard + `@Roles` decorator |
| 11 | `@CurrentUser` decorator |
| 12 | 5 marta noto'g'ri parol → 15 daqiqa blok |
| 13 | Login endpointiga so'rovlar chastotasi cheklovi (rate limit) |
| 14 | Admin: foydalanuvchini bloklash/ochish va uning barcha qurilmalarini uzish |
| 15 | Refresh token o'g'irlanganini aniqlash (reuse detection) |

### 1.4. Qamrovga KIRMAYDI

| Funksiya | Nega kirmaydi |
|---|---|
| O'z-o'zidan ro'yxatdan o'tish | Hisobni Admin yaratadi |
| SMS/OTP, telefon orqali kirish | MVP talabida yo'q |
| Telegram orqali kirish | MVP talabida yo'q |
| 2FA (ikki bosqichli tasdiq) | Mini modul uchun ortiqcha |
| Email tasdiqlash, parolni email orqali tiklash | Email yo'q; parolni Admin tiklaydi |
| Redis, token keshi | Mini hajmda PostgreSQL yetarli |
| httpOnly cookie | Frontend yo'q; keyinroq frontend qo'shilganda |
| Qurilma "barmoq izi" (fingerprint) | Ortiqcha murakkablik |
| Muddati o'tgan sessiyalarni avtomatik tozalovchi cron | Keyinroq (17-bo'lim) |

---

## 2. Asosiy tushunchalar (lug'at)

**Authentication (autentifikatsiya)** — "Sen kimsan?" savoli. Token to'g'rimi, foydalanuvchi mavjudmi.

**Authorization (avtorizatsiya)** — "Bunga ruxsating bormi?" savoli. Rol va resursga egalik tekshiruvi.

**Access token** — qisqa muddatli (15 daqiqa) JWT. Har bir so'rovda `Authorization: Bearer ...` sarlavhasida yuboriladi. Server uni imzosi orqali tekshiradi.

**Refresh token** — uzoq muddatli (7 kun) tasodifiy satr. Faqat bitta ishga — yangi access token olishga xizmat qiladi. Oddiy so'rovlarda yuborilmaydi.

**Sessiya = Qurilma (device)** — bitta muvaffaqiyatli login natijasida bazada paydo bo'ladigan yozuv. "Ali, Chrome/Windows, 12-sentabr kirgan". Hujjatda "sessiya" va "qurilma" bir xil ma'noda ishlatiladi: foydalanuvchiga "qurilmalar" deb ko'rsatiladi, bazada `sessions` jadvali.

**Rotatsiya (rotation)** — har safar refresh token ishlatilganda eski refresh token bekor bo'lib, yangisi beriladi.

**Reuse detection** — allaqachon almashtirilgan (eski) refresh token qayta kelsa, tizim buni o'g'irlik belgisi deb biladi va sessiyani yopadi.

**Hash (xesh)** — bir tomonlama o'zgartirish. Xeshdan asl qiymatni tiklab bo'lmaydi. Parol va refresh token bazada faqat xesh ko'rinishida saqlanadi.

**Guard** — NestJS'da controller'gacha ishlaydigan "qorovul". `true` qaytarsa so'rov o'tadi, aks holda 401/403.

**Decorator** — endpointga metama'lumot yopishtiruvchi belgi (`@Public`, `@Roles`). Guard shu belgini o'qib qaror qiladi.

**Strategy (Passport)** — tokenni qanday tekshirishni biladigan klass. Guard uni chaqiradi.

---

## 3. Rollar va huquqlar matritsasi

### 3.1. Rollar

| Rol | Kim | Qisqacha huquq |
|---|---|---|
| ADMIN | O'quv markazi rahbari/administratori | Hamma narsa: foydalanuvchilar, guruhlar, o'quvchilar |
| TEACHER | O'qituvchi | Faqat o'z guruhlari va ulardagi o'quvchilar |
| STUDENT | O'quvchi | Faqat o'z profili va o'zi a'zo bo'lgan guruhlar |

Rol **tizim darajasida** saqlanadi (`users.role`). Bitta foydalanuvchida bitta rol.

### 3.2. Auth va qurilma endpointlari

| Endpoint | Mehmon | STUDENT | TEACHER | ADMIN |
|---|---|---|---|---|
| POST /auth/login | ✅ | ✅ | ✅ | ✅ |
| POST /auth/refresh | ✅ (refresh token bilan) | ✅ | ✅ | ✅ |
| POST /auth/logout | ❌ 401 | ✅ | ✅ | ✅ |
| POST /auth/logout-all | ❌ 401 | ✅ | ✅ | ✅ |
| GET /auth/me | ❌ 401 | ✅ | ✅ | ✅ |
| PATCH /auth/password | ❌ 401 | ✅ | ✅ | ✅ |
| GET /auth/sessions | ❌ 401 | ✅ faqat o'ziniki | ✅ faqat o'ziniki | ✅ faqat o'ziniki |
| DELETE /auth/sessions/:id | ❌ 401 | ✅ faqat o'ziniki | ✅ faqat o'ziniki | ✅ faqat o'ziniki |

### 3.3. Admin boshqaruv endpointlari

| Endpoint | STUDENT | TEACHER | ADMIN |
|---|---|---|---|
| POST /users (foydalanuvchi yaratish) | ❌ 403 | ❌ 403 | ✅ |
| GET /users (ro'yxat) | ❌ 403 | ❌ 403 | ✅ |
| PATCH /users/:id/status (bloklash/ochish) | ❌ 403 | ❌ 403 | ✅ (o'zini emas) |
| PATCH /users/:id/password (parolni tiklash) | ❌ 403 | ❌ 403 | ✅ |
| GET /users/:id/sessions | ❌ 403 | ❌ 403 | ✅ |
| DELETE /users/:id/sessions (hammasidan chiqarish) | ❌ 403 | ❌ 403 | ✅ |

### 3.4. Mavjud biznes endpointlari uchun umumiy qoida

| Resurs | STUDENT | TEACHER | ADMIN |
|---|---|---|---|
| Guruh yaratish/o'chirish | ❌ | ❌ | ✅ |
| Guruhlar ro'yxati | faqat a'zo bo'lganlari | faqat o'ziniki | hammasi |
| Guruh tafsiloti | a'zo bo'lsa | o'ziniki bo'lsa | hammasi |
| O'quvchilar ro'yxati | ❌ | o'z guruhlaridagilar | hammasi |
| O'quvchini guruhga qo'shish | ❌ | ❌ | ✅ |

**Muhim:** `@Roles` faqat rolni tekshiradi (2-qatlam). "Bu guruh aynan shu o'qituvchinikimi?" degan tekshiruv (3-qatlam, resource ownership) **Service ichida** bo'ladi va bu TZ'da faqat eslatiladi — u mavjud modullarning vazifasi.

### 3.5. Uch qatlamli tekshiruv

```
1-qatlam: Authentication   → JwtAuthGuard     → "Kimsan?"            → xato: 401
2-qatlam: Rol              → RolesGuard       → "Qaysi roldasan?"    → xato: 403
3-qatlam: Resurs egaligi   → Service          → "Bu seniki-mi?"      → xato: 403 yoki 404
```

---

## 4. Arxitektura

### 4.1. Umumiy ko'rinish

```
                           KLIENT (Postman / Swagger / kelajakda frontend)
                                          │
                        Authorization: Bearer <access_token>
                                          │
                                          ▼
┌───────────────────────────────── NestJS API ─────────────────────────────────┐
│                                                                               │
│   ThrottlerGuard (faqat login uchun chastota cheklovi)                        │
│          │                                                                    │
│          ▼                                                                    │
│   JwtAuthGuard (GLOBAL) ──── @Public bo'lsa ──► o'tkazib yuboradi             │
│          │                                                                    │
│          ▼                                                                    │
│   JwtStrategy: imzo + muddat → sessiya faolmi? → foydalanuvchi faolmi?        │
│          │                                                                    │
│          ▼                                                                    │
│   req.user = { userId, role, sessionId }                                      │
│          │                                                                    │
│          ▼                                                                    │
│   RolesGuard (GLOBAL) ──── @Roles yo'q bo'lsa ──► o'tkazib yuboradi           │
│          │                                                                    │
│          ▼                                                                    │
│   Controller  →  Service (resurs egaligi)  →  PrismaService                   │
│                                                                               │
└───────────────────────────────────────┬───────────────────────────────────────┘
                                        │
                                        ▼
                                  PostgreSQL
                          users  ──1:N──  sessions
```

### 4.2. Modullar

| Modul | Mas'uliyati | Nimani eksport qiladi |
|---|---|---|
| ConfigModule (global) | `.env` o'qish va validatsiya | ConfigService |
| PrismaModule (global) | Baza ulanishi | PrismaService |
| UsersModule | Foydalanuvchini topish, yaratish, bloklash, parol xeshlash | UsersService |
| SessionsModule | Sessiya yaratish, rotatsiya, bekor qilish, ro'yxat, limit | SessionsService |
| AuthModule | Login/refresh/logout oqimlari, JWT berish, strategy, guardlar | AuthService, guardlar |

**Nega Sessions alohida modul?** Chunki sessiya bilan uch xil joy ishlaydi: AuthService (login/refresh), JwtStrategy (har so'rovda tekshiruv), UsersService/Admin (bloklaganda hammasini uzish). Mantiq bitta joyda bo'lsa, "sessiyani bekor qilish" qoidasi uch joyda uch xil yozilib qolmaydi.

**Bog'liqlik yo'nalishi (aylana bo'lmasligi kerak):**

```
AuthModule ──► UsersModule
     │
     └──────► SessionsModule

UsersModule (admin amallari) ──► SessionsModule
SessionsModule ──► hech kimga (faqat PrismaService)
```

SessionsModule hech qaysi boshqa modulga bog'liq emas — shuning uchun circular dependency xavfi yo'q.

### 4.3. Papka tuzilmasi

```
src/
├── auth/
│   ├── auth.module
│   ├── auth.controller          ← login, refresh, logout, logout-all, me, password, sessions
│   ├── auth.service             ← oqimlar mantiqi
│   ├── strategies/
│   │   └── jwt.strategy         ← access tokenni tekshirish + sessiya/foydalanuvchi holati
│   ├── guards/
│   │   ├── jwt-auth.guard       ← global, @Public'ni hurmat qiladi
│   │   └── roles.guard          ← global, @Roles'ni tekshiradi
│   ├── decorators/
│   │   ├── public.decorator
│   │   ├── roles.decorator
│   │   └── current-user.decorator
│   ├── dto/
│   │   ├── login.dto
│   │   ├── refresh.dto
│   │   └── change-password.dto
│   └── types/
│       └── jwt-payload / auth-user tiplari
│
├── sessions/
│   ├── sessions.module
│   ├── sessions.service         ← yaratish, rotatsiya, revoke, ro'yxat, limit
│   └── utils/
│       └── device-info          ← User-Agent'dan qurilma nomini chiqarish
│
├── users/
│   ├── users.module
│   ├── users.controller         ← admin endpointlari
│   ├── users.service
│   └── dto/
│       ├── create-user.dto
│       ├── update-status.dto
│       └── reset-password.dto
│
├── common/
│   └── enums/                   ← UserRole, SessionRevokeReason (Prisma'dan olinadi)
│
├── prisma/
├── config/
│   └── env.validation
├── app.module                   ← APP_GUARD orqali global guardlar shu yerda ro'yxatdan o'tadi
└── main
```

### 4.4. Qatlamlar mas'uliyati

| Qatlam | Nima qiladi | Nima QILMAYDI |
|---|---|---|
| Controller | HTTP so'rovni qabul qiladi, DTO validatsiyasi, `req.user`dan kerakli qiymatni olib Service'ga uzatadi | Bazaga murojaat qilmaydi, biznes qaror qabul qilmaydi |
| Service | Biznes qoidalar: parolni tekshirish, sessiya limiti, rotatsiya, reuse | HTTP haqida bilmaydi (request/response obyektlari bilan ishlamaydi) |
| Strategy | Access tokenni tekshiradi va `req.user`ni shakllantiradi | Rol tekshirmaydi |
| Guard | Ruxsat berish/bermaslik (true/false) | Biznes ma'lumot o'zgartirmaydi |
| Decorator | Endpointga belgi qo'yadi yoki `req.user`ni qulay olib beradi | Hech narsa tekshirmaydi |

### 4.5. Global guardlar tartibi

Guardlar `app.module`da **APP_GUARD** provayderi orqali global ro'yxatdan o'tkaziladi. Tartib muhim:

```
1. ThrottlerGuard   (ixtiyoriy global, yoki faqat login endpointida lokal)
2. JwtAuthGuard     → req.user ni yaratadi
3. RolesGuard       → req.user.role ni o'qiydi
```

**Nega aynan shu tartib?** RolesGuard `req.user`ga tayanadi. `req.user`ni JwtAuthGuard yaratadi. Agar tartib teskari bo'lsa, RolesGuard `undefined.role`ga murojaat qilib yiqiladi (500) yoki noto'g'ri qaror qabul qiladi.

**Nega global?** Lokal (`@UseGuards` har controllerda) bo'lsa, yangi controller yozganda guardni qo'yish esdan chiqadi — va endpoint hammaga ochiq bo'lib qoladi. Global bo'lsa, teskarisi: hamma narsa **yopiq**, ochiq bo'lishi kerak bo'lganini ongli ravishda `@Public` bilan belgilaysiz. Bu "default deny" (sukut bo'yicha taqiq) tamoyili.

---

## 5. JWT tuzilmasi

### 5.1. Access token

| Parametr | Qiymat | Izoh |
|---|---|---|
| Turi | JWT | Imzolangan, shifrlanmagan (ichini har kim o'qiy oladi!) |
| Algoritm | HS256 | Bitta maxfiy kalit bilan imzolash — mini loyiha uchun yetarli |
| Muddati | 15 daqiqa | `JWT_ACCESS_TTL` |
| Kalit | `JWT_ACCESS_SECRET` | Kamida 32 belgi, tasodifiy |
| Qayerda yuboriladi | `Authorization: Bearer <token>` sarlavhasi | |

**Payload (token ichidagi ma'lumot):**

| Maydon | Ma'nosi | Misol qiymat | Nega kerak |
|---|---|---|---|
| sub | Foydalanuvchi ID | 12 | JWT standarti: "subject" — token kimga tegishli |
| role | Rol | TEACHER | RolesGuard bazaga murojaat qilmasdan rolni bilishi uchun |
| sid | Sessiya (qurilma) ID | uuid | Sessiya faolmi — shu orqali tekshiriladi; logout qaysi qurilmadan ekanini bilish |
| iat | Berilgan vaqt | avtomatik | JWT kutubxonasi qo'yadi |
| exp | Tugash vaqti | avtomatik | JWT kutubxonasi qo'yadi |

**Token ichida BO'LMAYDI:**

| Ma'lumot | Nega |
|---|---|
| Parol, parol xeshi | Token base64 — har kim ochib o'qiy oladi |
| Ism, familiya | Keraksiz hajm; o'zgarsa token eskirib qoladi |
| Guruhlar ro'yxati | O'zgaruvchan ma'lumot — 15 daqiqa davomida noto'g'ri bo'lib qolishi mumkin |

**Rol o'zgarsa-chi?** Admin foydalanuvchi rolini o'zgartirsa, eski token 15 daqiqagacha eski rol bilan yuradi. Mini modul uchun qabul qilinadi. Agar darhol kuchga kirishi kerak bo'lsa — Admin rolni o'zgartirganda o'sha foydalanuvchining barcha sessiyalarini bekor qiladi (6.5-bandga qarang).

### 5.2. Refresh token

| Parametr | Qiymat | Izoh |
|---|---|---|
| Turi | **JWT emas** — tasodifiy satr (opaque token) | 64 bayt kriptografik tasodif, hex/base64url ko'rinishida |
| Muddati | 7 kun | `REFRESH_TOKEN_TTL_DAYS`; muddat bazada (`sessions.expires_at`) saqlanadi |
| Bazada saqlanishi | **Faqat SHA-256 xeshi** | Tokenning o'zi hech qachon bazaga yozilmaydi |
| Klientga berilishi | Login va refresh javobi tanasida (body) | Frontend yo'q; cookie keyinroq |
| Qayerga yuboriladi | Faqat `POST /auth/refresh` va `POST /auth/logout` tanasida | Oddiy so'rovlarda yuborilmaydi |

**Nega refresh token JWT emas?**

- Refresh tokenni har safar baribir bazadan tekshiramiz (sessiya faolmi, rotatsiya). JWT'ning afzalligi — bazasiz tekshirish — bu yerda foydasiz.
- Tasodifiy satr ichida hech qanday ma'lumot yo'q — o'g'irlansa ham, undan hech narsa "o'qib" bo'lmaydi.
- Bekor qilish oddiy: bazadagi yozuvni `revoked` qilish yetarli.

**Nega bcrypt emas, SHA-256?**

- Parol — inson o'ylab topgan, kuchsiz satr. Uni tanlab topishni sekinlashtirish uchun bcrypt (ataylab sekin) kerak.
- Refresh token — 64 bayt kriptografik tasodif. Uni tanlab topish imkonsiz, sekinlashtirish shart emas.
- SHA-256 deterministik: bir xil token → bir xil xesh. Shuning uchun bazadan **xesh bo'yicha qidirish** mumkin (unique index bilan tez). bcrypt har safar boshqa natija beradi — u bilan qidirib bo'lmaydi.

**Nega bazada xesh, tokenning o'zi emas?** Agar baza nusxasi (backup) o'g'irlansa, o'g'ri undagi xeshlardan ishlaydigan token yasay olmaydi.

### 5.3. Rotatsiya

Har safar `POST /auth/refresh` muvaffaqiyatli bo'lganda:

```
Eski refresh token (R1)  ──►  bekor (endi "oldingi" xesh sifatida saqlanadi)
Yangi refresh token (R2) ──►  beriladi, xeshi "joriy" xesh bo'ladi
Yangi access token       ──►  beriladi
Sessiya ID               ──►  O'ZGARMAYDI (qurilma o'sha qurilma)
```

**Nega rotatsiya?** Refresh token o'g'irlangan bo'lsa, u faqat bir marta ishlaydi. Egasi ham, o'g'ri ham ishlatmoqchi bo'lsa — ikkinchisi "eski" token bilan keladi va tizim buni sezadi (5.4).

### 5.4. Reuse detection (o'g'irlikni aniqlash)

```
Ali: login → R1
Hujumchi R1 ni o'g'irladi

Hujumchi: refresh(R1) → R2 oldi   (R1 endi "oldingi")
Ali:      refresh(R1) → ???

Tizim: R1 joriy xeshlarda yo'q, lekin "oldingi" xeshlarda BOR
       → bu token allaqachon ishlatilgan → kimdir nusxa olgan!
       → sessiyani darhol bekor qilish (sabab: REUSE_DETECTED)
       → Ali ham, hujumchi ham qayta login qilishi kerak
```

Ali parolni biladi — qayta kiradi. Hujumchi parolni bilmaydi — tashqarida qoladi.

**Mini modul cheklovi (bilib qo'yish kerak):** Agar bitta klient bir vaqtda ikkita refresh so'rovini yuborsa (masalan, ikki tab), ikkinchisi "eski" token bilan keladi va reuse deb qabul qilinadi — sessiya yopiladi. Bu xatolik emas, qasddan qabul qilingan cheklov. Klient (kelajakdagi frontend) refresh so'rovlarini ketma-ket yuborishi kerak. Grace window (bir necha soniyalik ruxsat) mini modulga kiritilmaydi.

---

## 6. Qurilmalar (sessiyalar) modeli

### 6.1. Qoida

**Bitta muvaffaqiyatli login = bitta sessiya (qurilma) yozuvi.**

Bir odam telefondan va noutbukdan kirsa — 2 ta sessiya. Noutbukdan logout qilib, qayta kirsa — eski sessiya yopiladi, yangisi ochiladi.

### 6.2. Qurilma nomi qanday aniqlanadi

1. Klient login so'rovida ixtiyoriy `deviceName` maydonini yuborishi mumkin (masalan "Ish noutbuki"). Maksimal 50 belgi.
2. Yuborilmasa — `User-Agent` sarlavhasidan avtomatik: brauzer + versiya · OS. Masalan: "Chrome 128 · Windows 10", "Safari · iOS 17", "PostmanRuntime".
3. User-Agent ham bo'lmasa — "Noma'lum qurilma".

User-Agent'ni tahlil qilish uchun tayyor kutubxona ishlatiladi (14-bo'lim) — o'zingiz regex yozmaysiz.

### 6.3. IP manzil

- So'rovdagi klient IP manzili yoziladi.
- Server keyinchalik Nginx ortida ishlasa, NestJS'da "trust proxy" sozlamasi yoqilishi kerak — aks holda hamma sessiyada Nginx'ning IP'si (127.0.0.1) yozilib qoladi. Hozir lokal ishlaganda bu muammo emas, lekin deploy vaqtida esdan chiqmasin.

### 6.4. Sessiyaning hayoti

```
                 login
                   │
                   ▼
              ┌─────────┐   refresh (rotatsiya)
              │  FAOL   │◄──────────────┐
              │         │───────────────┘
              └────┬────┘
                   │
   ┌───────────────┼──────────────────────────┐
   │               │                          │
   ▼               ▼                          ▼
 logout     muddati o'tdi (7 kun)      bekor qilindi (revoke)
   │               │                          │
   ▼               ▼                          ▼
 YOPIQ          YOPIQ                       YOPIQ
(LOGOUT)      (expires_at < hozir)      (sabab bilan)
```

**Sessiya faol degani:** `revoked_at` bo'sh **VA** `expires_at` hozirgi vaqtdan keyin.

Alohida `status` ustuni yo'q — holat shu ikki maydondan kelib chiqadi. Nega? Ikki joyda saqlangan holat bir kun bir-biriga zid bo'lib qoladi ("status = ACTIVE, lekin revoked_at to'ldirilgan").

### 6.5. Bekor qilish sabablari (revoke reason)

| Sabab | Qachon | Kim tashabbuskori |
|---|---|---|
| LOGOUT | Foydalanuvchi shu qurilmadan chiqdi | Foydalanuvchi |
| LOGOUT_ALL | Foydalanuvchi "hammasidan chiqish" bosdi | Foydalanuvchi |
| REVOKED_BY_USER | Foydalanuvchi qurilmalar ro'yxatidan boshqa qurilmani uzdi | Foydalanuvchi |
| PASSWORD_CHANGED | Foydalanuvchi parolini o'zgartirdi (joriy qurilmadan boshqa hammasi) | Tizim |
| LIMIT_EXCEEDED | 6-qurilmadan kirildi, eng eskisi uzildi | Tizim |
| REUSE_DETECTED | Eski refresh token qayta ishlatildi | Tizim |
| ADMIN_REVOKED | Admin bloklagan, parolni tiklagan, rolni o'zgartirgan yoki "hammasidan chiqargan" | Admin |

**Nega sabab saqlanadi?** "Nega meni tizimdan chiqarib yubordi?" degan savolga javob beriladi. Va Admin shubhali holatlarni (REUSE_DETECTED) ko'ra oladi.

### 6.6. Qurilmalar limiti — 5 ta

Login paytida, **bitta DB tranzaksiyasi ichida**:

```
1. Foydalanuvchining FAOL sessiyalarini sanash
2. Soni ≥ 5 bo'lsa:
      eng uzoq vaqt ishlatilmagan (last_used_at eng eski) sessiyani
      bekor qilish, sabab: LIMIT_EXCEEDED
3. Yangi sessiyani yaratish
```

**Nega tranzaksiyada?** Ikki login bir vaqtda kelsa, ikkalasi ham "4 ta bor, joy bor" deb sanab, 6 ta faol sessiya paydo bo'lishi mumkin. Tranzaksiya bu xavfni kamaytiradi. (Mini modul uchun 6 ta bo'lib qolish halokat emas, lekin to'g'ri odatni boshidan shakllantiramiz.)

**Nega "eng eski yaratilgan" emas, "eng uzoq ishlatilmagan"?** Birinchi kirilgan telefon hali ham har kuni ishlatilayotgan bo'lishi mumkin. Unutilgan eski brauzerni uzish mantiqan to'g'riroq.

### 6.7. `last_used_at` qachon yangilanadi

- Login paytida
- Har bir **refresh** paytida

**Har so'rovda emas.** Nega? Har bir API so'rovida bazaga yozish = har so'rovda qo'shimcha UPDATE. Access token 15 daqiqa yashaydi, demak refresh har 15 daqiqada bo'ladi — "oxirgi faollik" aniqligi 15 daqiqa. Qurilmalar ro'yxati uchun bu yetarli.

### 6.8. Qurilmalar ro'yxatida nima ko'rsatiladi

| Maydon | Izoh |
|---|---|
| id | Sessiya ID (uzish uchun kerak) |
| deviceName | "Chrome 128 · Windows 10" |
| ipAddress | Oxirgi ma'lum IP |
| createdAt | Birinchi kirgan vaqti |
| lastUsedAt | Oxirgi faollik |
| isCurrent | `true` — agar shu so'rov aynan shu qurilmadan kelgan bo'lsa (`sessionId === req.user.sessionId`) |

Ro'yxatda **faqat faol** sessiyalar ko'rsatiladi. `refresh_token_hash` hech qachon tashqariga chiqmaydi.

---

## 7. Ma'lumotlar bazasi: jadvallar

### 7.1. Umumiy ER-diagramma

```
┌─────────────────────────────┐          ┌──────────────────────────────────┐
│           users             │          │             sessions             │
├─────────────────────────────┤          ├──────────────────────────────────┤
│ id              PK          │ 1      N │ id                    PK (uuid)  │
│ login           UNIQUE      │──────────│ user_id               FK → users │
│ password_hash               │          │ refresh_token_hash    UNIQUE     │
│ full_name                   │          │ previous_token_hash   (index)    │
│ role            enum        │          │ device_name                      │
│ is_active                   │          │ user_agent                       │
│ failed_login_count          │          │ ip_address                       │
│ locked_until                │          │ created_at                       │
│ last_login_at               │          │ last_used_at                     │
│ created_at                  │          │ expires_at                       │
│ updated_at                  │          │ revoked_at                       │
└─────────────────────────────┘          │ revoked_reason        enum       │
                                         └──────────────────────────────────┘
```

Mavjud biznes jadvallari (guruhlar, o'quvchilar va h.k.) bu modul doirasida o'zgarmaydi. Agar mavjud `teachers`/`students` jadvallari `users`ga `user_id` orqali bog'langan bo'lsa — shunday qoladi.

### 7.2. `users` jadvali

Agar jadval allaqachon bor bo'lsa — quyidagi **yangi** maydonlar qo'shiladi (✚ belgisi bilan). Yo'q bo'lsa — to'liq yaratiladi.

| Maydon | Tip (PostgreSQL) | Majburiy | Standart qiymat | Cheklov | Izoh — nega kerak |
|---|---|---|---|---|---|
| id | integer (autoincrement) | ha | avtomatik | PK | |
| login | varchar(50) | ha | — | UNIQUE | Kirish uchun. Kichik harfga o'tkazib saqlanadi ("Ali" va "ali" bitta login) |
| password_hash | varchar(255) | ha | — | — | bcrypt xeshi. Hech qachon API javobida qaytmaydi |
| full_name | varchar(100) | ha | — | — | Ko'rsatish uchun |
| role | enum UserRole | ha | — | — | ADMIN / TEACHER / STUDENT |
| ✚ is_active | boolean | ha | true | — | Admin bloklasa `false`. O'chirish o'rniga bloklash — tarix saqlanadi |
| ✚ failed_login_count | integer | ha | 0 | ≥ 0 | Ketma-ket noto'g'ri parollar soni |
| ✚ locked_until | timestamptz | yo'q | null | — | Shu vaqtgacha login taqiqlangan |
| ✚ last_login_at | timestamptz | yo'q | null | — | Oxirgi muvaffaqiyatli kirish |
| created_at | timestamptz | ha | hozir | — | |
| updated_at | timestamptz | ha | avtomatik | — | |

**Nega foydalanuvchi o'chirilmaydi, bloklanadi?** O'qituvchi ketdi — lekin uning guruhlari, yozuvlari tarixda qolishi kerak. O'chirsangiz, bog'langan yozuvlar yo yetim qoladi, yo birga o'chib ketadi.

**Nega `login` kichik harfda saqlanadi?** "Ali", "ALI", "ali" — foydalanuvchi uchun bitta odam. Aks holda bir xil ko'rinadigan uchta hisob ochilishi mumkin. Kichik harfga o'tkazish DTO/Service darajasida, saqlashdan oldin.

### 7.3. `sessions` jadvali (yangi)

| Maydon | Tip | Majburiy | Standart | Cheklov | Izoh — nega kerak |
|---|---|---|---|---|---|
| id | uuid | ha | avtomatik | PK | UUID — ketma-ket raqam bo'lsa, boshqa sessiya ID'larini taxmin qilish oson |
| user_id | integer | ha | — | FK → users.id | Kimning qurilmasi |
| refresh_token_hash | varchar(64) | ha | — | UNIQUE | Joriy refresh tokenning SHA-256 xeshi. Unique — qidirish tez va takror bo'lmaydi |
| previous_token_hash | varchar(64) | yo'q | null | INDEX | Oxirgi almashtirilgan token xeshi — reuse detection uchun |
| device_name | varchar(100) | ha | — | — | "Chrome 128 · Windows 10" |
| user_agent | varchar(500) | yo'q | null | — | Xom User-Agent (nizo/tahlil uchun) |
| ip_address | varchar(45) | yo'q | null | — | 45 belgi — IPv6 ham sig'adi |
| created_at | timestamptz | ha | hozir | — | Qurilma birinchi kirgan vaqt |
| last_used_at | timestamptz | ha | hozir | — | Login/refresh paytida yangilanadi |
| expires_at | timestamptz | ha | — | — | Refresh token tugash vaqti. Har rotatsiyada yangilanadi (sirpanuvchi muddat) |
| revoked_at | timestamptz | yo'q | null | — | Bo'sh = bekor qilinmagan |
| revoked_reason | enum SessionRevokeReason | yo'q | null | — | 6.5-bandga qarang |

**`expires_at` har rotatsiyada yangilanadi — bu nimani anglatadi?** Foydalanuvchi har kuni ishlasa, uni hech qachon chiqarib yubormaydi (har refresh +7 kun). 7 kun umuman kirmasa — qayta login qilishi kerak. Bu "sirpanuvchi muddat" (sliding expiration).

### 7.4. Enumlar

**UserRole**

| Qiymat | Ma'nosi |
|---|---|
| ADMIN | Administrator |
| TEACHER | O'qituvchi |
| STUDENT | O'quvchi |

**SessionRevokeReason**

| Qiymat |
|---|
| LOGOUT |
| LOGOUT_ALL |
| REVOKED_BY_USER |
| PASSWORD_CHANGED |
| LIMIT_EXCEEDED |
| REUSE_DETECTED |
| ADMIN_REVOKED |

Enumlar bazada (PostgreSQL enum / Prisma enum) — kodda qo'lda yozilgan satrlar emas. Shunda noto'g'ri qiymat ("LOGGOUT") bazaga tusha olmaydi.

### 7.5. Indexlar va cheklovlar

| Jadval | Index/cheklov | Nega |
|---|---|---|
| users | UNIQUE(login) | Bir xil login ikki marta bo'lmasin; login bo'yicha qidirish tez |
| sessions | UNIQUE(refresh_token_hash) | Refresh so'rovida xesh bo'yicha tez topish |
| sessions | INDEX(previous_token_hash) | Reuse tekshiruvi tez bo'lishi uchun |
| sessions | INDEX(user_id, revoked_at) | "Foydalanuvchining faol sessiyalari" so'rovi (ro'yxat, limit, logout-all) |
| sessions | FK user_id → users.id, ON DELETE RESTRICT | Foydalanuvchi o'chirilmaydi (bloklanadi), sessiyalar yetim qolmasin |

### 7.6. Relation

- `User` 1 — N `Session`: bitta foydalanuvchida ko'p qurilma.
- `Session` har doim aynan bitta foydalanuvchiga tegishli.
- Prisma'da ikki tomonlama relation: User modelida sessiyalar ro'yxati, Session modelida user.

### 7.7. Migratsiya

- Bitta migratsiya: `auth_sessions` (yoki shunga o'xshash tushunarli nom).
- Agar `users` jadvalida allaqachon ma'lumot bo'lsa: yangi maydonlarning hammasi yo standart qiymatli (`is_active = true`, `failed_login_count = 0`), yo bo'sh bo'lishi mumkin (`locked_until`, `last_login_at`) — shuning uchun migratsiya mavjud yozuvlarni buzmaydi.
- `login` maydoni avval kichik-katta harfli bo'lgan bo'lsa: migratsiyadan oldin mavjud loginlarni kichik harfga o'tkazish va takrorlar yo'qligini tekshirish kerak.

### 7.8. Seed — birinchi Admin

Hisobni faqat Admin yaratadi. Unda birinchi Admin'ni kim yaratadi? **Seed skripti.**

- Login va parol `.env`dan olinadi (`SEED_ADMIN_LOGIN`, `SEED_ADMIN_PASSWORD`) — kodga yozilmaydi.
- Seed idempotent bo'lishi kerak: Admin allaqachon bor bo'lsa — qayta yaratmaydi, xato ham bermaydi.
- Parol seed ichida ham bcrypt bilan xeshlanadi.

---

## 8. Auth oqimlari (qadamma-qadam)

### 8.1. Login

**So'rov:** `POST /auth/login` — `login`, `password`, ixtiyoriy `deviceName`

```
 1. ThrottlerGuard: bu IP'dan 1 daqiqada 10 tadan ko'p login bo'ldimi? → ha: 429
 2. DTO validatsiya: login va password bor, bo'sh emas, uzunligi me'yorda → yo'q: 400
 3. login → kichik harfga
 4. Foydalanuvchini login bo'yicha topish
 5. Topilmadi?
       → "soxta" bcrypt taqqoslashni baribir bajarish (vaqt bo'yicha farq bo'lmasin)
       → 401 "Login yoki parol noto'g'ri"
 6. locked_until > hozir? → 429 "Juda ko'p urinish. N daqiqadan keyin urinib ko'ring"
 7. bcrypt: parol mos keladimi?
       YO'Q → failed_login_count + 1
              → agar ≥ 5 bo'lsa: locked_until = hozir + 15 daqiqa, hisoblagich 0 ga
              → 401 "Login yoki parol noto'g'ri"
       HA   → davom
 8. is_active = false? → 403 "Hisob bloklangan. Administratorga murojaat qiling"
 9. failed_login_count = 0, locked_until = null, last_login_at = hozir
10. TRANZAKSIYA boshlanadi:
       a) faol sessiyalar soni ≥ 5 → eng uzoq ishlatilmaganini revoke (LIMIT_EXCEEDED)
       b) refresh token yaratish (64 bayt tasodif)
       c) sessiya yaratish: xesh, qurilma nomi, user-agent, IP, expires_at = hozir + 7 kun
    TRANZAKSIYA tugaydi
11. Access token yaratish: sub = user.id, role, sid = session.id
12. Javob: accessToken, refreshToken, accessTokenExpiresIn, user (id, login, fullName, role)
```

**5-qadam — nega "soxta" taqqoslash?** Agar login mavjud bo'lmasa server darhol javob bersa (1 ms), mavjud bo'lsa bcrypt ishlagani uchun sekinroq (100 ms). Hujumchi javob vaqtiga qarab qaysi loginlar mavjudligini aniqlay oladi. Soxta taqqoslash ikkala holatda vaqtni tenglashtiradi.

**5 va 7-qadam — nega bir xil xabar?** "Bunday login yo'q" va "Parol noto'g'ri" deb alohida yozsak, hujumchiga qaysi loginlar mavjudligini aytgan bo'lamiz (user enumeration).

**8-qadam — nega Admin bloki parol tekshiruvidan KEYIN?** Agar oldin tursa, hujumchi istalgan login bilan so'rov yuborib, "Hisob bloklangan" javobidan bu login mavjud va bloklanganini bilib oladi. Keyin tursa — "bloklangan" xabarini faqat to'g'ri parolni bilgan odam, ya'ni hisob egasining o'zi ko'radi.

**6-qadam (vaqtinchalik blok) — nega parol tekshiruvidan OLDIN?** Blok muddatida parol umuman tekshirilmasligi kerak — aks holda hujumchi blok paytida ham parollarni sinashda davom etadi va to'g'ri parolni topsa, blok tugashini kutib kiradi.

### 8.2. Himoyalangan endpointga har bir so'rov

```
Klient: GET /groups   Authorization: Bearer <access>
   │
   ▼
JwtAuthGuard
   ├── endpoint @Public'mi? → ha: o'tkazib yuborish
   └── yo'q → JwtStrategy'ni ishga tushirish
          │
          ▼
JwtStrategy
   1. Sarlavhada token bormi?                  yo'q  → 401
   2. Imzo to'g'rimi?                           yo'q  → 401
   3. Muddati o'tmaganmi?                       o'tgan → 401
   4. Bazadan sessiyani sid bo'yicha olish
      (foydalanuvchi bilan birga, bitta so'rovda)
   5. Sessiya topildimi, revoked_at bo'shmi,
      expires_at > hozir?                       yo'q  → 401
   6. Sessiyaning user_id === token sub?        yo'q  → 401
   7. Foydalanuvchi is_active?                  yo'q  → 401
   8. req.user = { userId, role, sessionId }
   │
   ▼
RolesGuard
   ├── @Roles yo'q → o'tkazish
   └── @Roles bor → req.user.role ro'yxatdami? yo'q → 403
   │
   ▼
Controller → Service
```

**4–7-qadamlar — nega har so'rovda bazaga murojaat?** Toza JWT (bazasiz) tez, lekin logout qilingan yoki uzilgan qurilmaning access tokeni 15 daqiqagacha ishlashda davom etadi. TZ talabi: "qurilma uzilgan zahoti kira olmasin". Shuning uchun har so'rovda sessiya tekshiriladi. Bu **primary key bo'yicha bitta so'rov** — mini hajmda sezilmaydigan yuk. Katta hajmda bu joy Redis bilan tezlashtiriladi (17-bo'lim).

**Rol qayerdan olinadi — tokendanmi yoki bazadanmi?** 4-qadamda foydalanuvchi baribir bazadan olinyapti. **Tavsiya: rolni bazadagi qiymatdan olish.** Shunda Admin rolni o'zgartirsa, darhol kuchga kiradi, 5.1-banddagi "15 daqiqa eski rol" muammosi yo'qoladi. Tokendagi `role` maydoni shunda faqat ma'lumot uchun qoladi.

### 8.3. Refresh

**So'rov:** `POST /auth/refresh` (@Public) — `refreshToken`

```
1. DTO: refreshToken bor, formati to'g'ri → yo'q: 400
2. xesh = SHA-256(refreshToken)
3. Sessiyani refresh_token_hash = xesh bo'yicha qidirish
   │
   ├── TOPILDI:
   │     a) revoked_at bo'sh va expires_at > hozir?   yo'q → 401
   │     b) foydalanuvchi is_active?                    yo'q → 401
   │     c) yangi refresh token yaratish
   │     d) sessiyani yangilash (bitta atomik UPDATE):
   │          previous_token_hash = eski xesh
   │          refresh_token_hash  = yangi xesh
   │          last_used_at        = hozir
   │          expires_at          = hozir + 7 kun
   │          ip_address          = joriy IP
   │     e) yangi access token (o'sha sid bilan)
   │     f) javob: accessToken, refreshToken, accessTokenExpiresIn
   │
   └── TOPILMADI:
         previous_token_hash = xesh bo'yicha qidirish
         ├── topildi → REUSE! sessiyani revoke (REUSE_DETECTED) → 401
         └── topilmadi → 401 (umuman noma'lum token)
```

**3d — nega atomik va shartli UPDATE?** Ikki refresh so'rovi bir vaqtda kelsa, ikkalasi ham 3-qadamda sessiyani topadi. UPDATE sharti "refresh_token_hash hali ham eski xeshga teng bo'lsa" qilib yoziladi. Birinchisi yangilaydi, ikkinchisining sharti bajarilmaydi (0 qator yangilandi) → ikkinchisiga 401. Shunda bitta refresh tokendan ikkita yangi token chiqmaydi.

### 8.4. Logout

**So'rov:** `POST /auth/logout` (himoyalangan)

```
1. req.user.sessionId olinadi (tokendan, klient yubormaydi)
2. Shu sessiya revoke: revoked_at = hozir, sabab = LOGOUT
3. Javob: 204 No Content
```

**Nega sessionId klientdan olinmaydi?** Klient boshqa odamning sessiya ID'sini yuborishi mumkin. Server kimligini faqat tokendan biladi — ERP kursidagi "client yuborgan ID'ga ishonmaymiz" qoidasi.

Logout'dan keyin: shu qurilmaning access tokeni keyingi so'rovdayoq 401 oladi (8.2, 5-qadam), refresh tokeni ham ishlamaydi.

### 8.5. Logout-all

**So'rov:** `POST /auth/logout-all` (himoyalangan)

```
1. Foydalanuvchining BARCHA faol sessiyalari (joriysi ham) revoke, sabab = LOGOUT_ALL
2. Javob: 204
```

"Telefonim yo'qoldi" holati uchun.

### 8.6. Me

**So'rov:** `GET /auth/me` (himoyalangan)

```
1. req.user.userId bo'yicha foydalanuvchi
2. Javob: id, login, fullName, role, lastLoginAt
   (password_hash, failed_login_count, locked_until — QAYTMAYDI)
```

### 8.7. Qurilmalar ro'yxati

**So'rov:** `GET /auth/sessions` (himoyalangan)

```
1. WHERE user_id = req.user.userId AND revoked_at IS NULL AND expires_at > hozir
2. Tartib: last_used_at kamayish bo'yicha
3. Har biriga isCurrent = (id === req.user.sessionId)
4. Javob: 6.8-banddagi maydonlar
```

### 8.8. Bitta qurilmani uzish

**So'rov:** `DELETE /auth/sessions/:id` (himoyalangan)

```
1. :id UUID formatidami? → yo'q: 400
2. Sessiyani qidirish: id = :id VA user_id = req.user.userId VA faol
3. Topilmadi → 404
   (boshqa odamning sessiyasi bo'lsa ham 404 — 403 emas!)
4. Revoke: sabab = REVOKED_BY_USER
   (agar id === joriy sessiya bo'lsa — bu logout bilan bir xil; ruxsat etiladi)
5. Javob: 204
```

**3-qadam — nega boshqa odamning sessiyasiga 403 emas, 404?** 403 "bu mavjud, lekin sizniki emas" degani — ya'ni bu ID mavjudligini oshkor qiladi. 404 esa "siz uchun bunday narsa yo'q". Egalik tekshiruvi so'rovning o'zida (`user_id` sharti bilan) — ERP kursidagi 16-dars patterni.

### 8.9. Parolni o'zgartirish (foydalanuvchining o'zi)

**So'rov:** `PATCH /auth/password` (himoyalangan) — `currentPassword`, `newPassword`

```
1. DTO: yangi parol qoidalari (11.2-band)
2. newPassword ≠ currentPassword → aks holda 400
3. Joriy parol to'g'rimi (bcrypt)? → yo'q: 400 "Joriy parol noto'g'ri"
      (401 emas — foydalanuvchi autentifikatsiyadan o'tgan, xato kiritmada)
4. TRANZAKSIYA:
      a) yangi password_hash saqlash
      b) JORIY sessiyadan tashqari barcha faol sessiyalar revoke (PASSWORD_CHANGED)
5. Javob: 204
```

**Nega joriy sessiya qoladi?** Foydalanuvchi parolni o'zgartirgan qurilmada ishlashda davom etadi. Boshqa (ehtimol begona) qurilmalar esa chiqariladi.

### 8.10. Admin amallari

**Foydalanuvchi yaratish** — `POST /users`: login (unique, kichik harf), vaqtinchalik parol, fullName, role. Parol bcrypt bilan xeshlanadi. Login band bo'lsa → 409.

**Bloklash / ochish** — `PATCH /users/:id/status` — `isActive`:

```
1. Admin o'zini bloklay olmaydi → 400
2. is_active = false bo'lsa:
      TRANZAKSIYA: is_active = false + barcha faol sessiyalar revoke (ADMIN_REVOKED)
3. is_active = true bo'lsa: faqat is_active = true, failed_login_count = 0, locked_until = null
```

**Parolni tiklash** — `PATCH /users/:id/password` — `newPassword`: yangi xesh + barcha sessiyalar revoke (ADMIN_REVOKED). Foydalanuvchi yangi parol bilan qayta kiradi.

**Sessiyalarini ko'rish** — `GET /users/:id/sessions`: shu foydalanuvchining faol sessiyalari (isCurrent'siz).

**Hammasidan chiqarish** — `DELETE /users/:id/sessions`: barcha faol sessiyalar revoke (ADMIN_REVOKED).

**Rolni o'zgartirish** (agar mavjud users endpointida bor bo'lsa): rol yangilanadi + barcha sessiyalar revoke (ADMIN_REVOKED) — yangi rol bilan qayta kirsin.

---

## 9. Guardlar va decoratorlar

### 9.1. `@Public()` decorator

- **Vazifasi:** endpoint yoki butun controller'ga "autentifikatsiya shart emas" belgisini qo'yadi.
- **Qayerda ishlatiladi:** `login`, `refresh`, `health`, Swagger.
- **Qanday ishlaydi:** metama'lumot (metadata) kalitiga `true` yozadi. JwtAuthGuard `Reflector` orqali shu kalitni **handler va class** darajasida tekshiradi.

### 9.2. JwtAuthGuard (global)

- Passport'ning JWT guard'idan meros oladi.
- Ishga tushganda avval `@Public` belgisini tekshiradi: bor bo'lsa — darhol `true`.
- Yo'q bo'lsa — JwtStrategy'ni chaqiradi.
- Strategiya xato bersa — 12-bo'limdagi formatda 401 qaytadi.

### 9.3. JwtStrategy

- Tokenni `Authorization: Bearer` sarlavhasidan oladi.
- Imzo va muddatni kutubxona o'zi tekshiradi (`JWT_ACCESS_SECRET` bilan, muddati o'tganini e'tiborsiz qoldirish **o'chirilgan**).
- `validate` bosqichida 8.2-banddagi 4–7-qadamlar bajariladi (sessiya va foydalanuvchi holati).
- Qaytargan qiymati → `req.user`. Tuzilmasi:

| Maydon | Qayerdan | Tip |
|---|---|---|
| userId | token `sub` | number |
| role | **bazadagi** foydalanuvchi | UserRole |
| sessionId | token `sid` | string (uuid) |

`req.user` ichiga butun foydalanuvchi obyekti (ayniqsa `password_hash`) qo'yilmaydi.

### 9.4. `@Roles(...roles)` decorator

- Endpointga ruxsat etilgan rollar ro'yxatini yozadi: masalan `@Roles(ADMIN)`, `@Roles(ADMIN, TEACHER)`.
- Controller darajasida qo'yilsa — ichidagi hamma endpointga tegishli; handler darajasida qo'yilsa — ustun turadi (`getAllAndOverride`).

### 9.5. RolesGuard (global)

```
@Roles yo'q?                  → true  (faqat autentifikatsiya yetarli)
@Public bor?                  → true  (req.user yo'q, tekshirish ma'nosiz)
req.user.role ro'yxatdami?    → true
aks holda                     → 403 "Bu amal uchun ruxsatingiz yo'q"
```

### 9.6. `@CurrentUser()` decorator (parametr decorator)

- Controller metodida `req.user`ni qulay olish uchun: butun obyektni yoki bitta maydonini (masalan faqat `userId`).
- ERP darslaridagi `@Req() req: any` + `req.user.id` o'rniga — tip xavfsiz va toza.

### 9.7. Global ro'yxatdan o'tkazish

- `app.module` provayderlariga APP_GUARD sifatida: avval JwtAuthGuard, keyin RolesGuard.
- Endi mavjud controllerlardagi `@UseGuards(JwtAuthGuard, RolesGuard)` qatorlarini **olib tashlash** kerak (ikki marta ishlamasin).
- Ochiq bo'lishi kerak bo'lgan endpointlarga `@Public` qo'yish kerak — aks holda ular endi 401 qaytaradi. Bu o'tishning eng ko'p xato beradigan joyi (15-bo'lim, 9-qadam).

### 9.8. ThrottlerGuard

- `@nestjs/throttler` moduli.
- Global emas — faqat `POST /auth/login` va `POST /auth/refresh`ga lokal qo'llanadi (yoki global qilib, qolgan endpointlar uchun yuqori limit).
- Limit: login — IP boshiga 1 daqiqada 10 ta; refresh — 1 daqiqada 20 ta.
- Oshsa → 429.

**Throttler va 5 xato blokining farqi:**

| | Throttler | Hisob bloki |
|---|---|---|
| Nima bo'yicha | IP manzil | Foydalanuvchi (login) |
| Nimani to'xtatadi | Bitta IP'dan ko'p loginlarni sinash | Bitta hisobga ko'p parollarni sinash |
| Saqlanishi | Xotira (mini) | Baza (`users.locked_until`) |

Ikkalasi bir-birini to'ldiradi.

---

## 10. API endpointlar

Barcha yo'llar global prefiks bilan: `/api/...`

### 10.1. Auth

| № | Metod | Yo'l | Kirish | So'rov maydonlari | Muvaffaqiyatli javob | Xatolar |
|---|---|---|---|---|---|---|
| 1 | POST | /auth/login | @Public, throttle | login, password, deviceName? | 200: accessToken, refreshToken, accessTokenExpiresIn, user{id, login, fullName, role} | 400, 401, 403, 429 |
| 2 | POST | /auth/refresh | @Public, throttle | refreshToken | 200: accessToken, refreshToken, accessTokenExpiresIn | 400, 401, 429 |
| 3 | POST | /auth/logout | Autentifikatsiya | — | 204 | 401 |
| 4 | POST | /auth/logout-all | Autentifikatsiya | — | 204 | 401 |
| 5 | GET | /auth/me | Autentifikatsiya | — | 200: id, login, fullName, role, lastLoginAt | 401 |
| 6 | PATCH | /auth/password | Autentifikatsiya | currentPassword, newPassword | 204 | 400, 401 |
| 7 | GET | /auth/sessions | Autentifikatsiya | — | 200: ro'yxat [id, deviceName, ipAddress, createdAt, lastUsedAt, isCurrent] | 401 |
| 8 | DELETE | /auth/sessions/:id | Autentifikatsiya | — | 204 | 400, 401, 404 |

### 10.2. Admin — foydalanuvchilar

| № | Metod | Yo'l | Rol | So'rov maydonlari | Javob | Xatolar |
|---|---|---|---|---|---|---|
| 9 | POST | /users | ADMIN | login, password, fullName, role | 201: id, login, fullName, role, isActive | 400, 401, 403, 409 |
| 10 | GET | /users | ADMIN | query: role?, isActive? | 200: ro'yxat | 401, 403 |
| 11 | PATCH | /users/:id/status | ADMIN | isActive | 200: yangilangan foydalanuvchi | 400, 401, 403, 404 |
| 12 | PATCH | /users/:id/password | ADMIN | newPassword | 204 | 400, 401, 403, 404 |
| 13 | GET | /users/:id/sessions | ADMIN | — | 200: sessiyalar ro'yxati | 401, 403, 404 |
| 14 | DELETE | /users/:id/sessions | ADMIN | — | 204 | 401, 403, 404 |

### 10.3. Swagger

- Barcha auth va users endpointlari Swagger'da ko'rinadi.
- Himoyalangan endpointlarga Bearer auth belgisi — Swagger'da "Authorize" tugmasi orqali token kiritib sinash mumkin.
- DTO maydonlariga tavsif va misol qiymat yoziladi.

---

## 11. Xavfsizlik talablari

### 11.1. Parollar

| Talab | Qiymat |
|---|---|
| Xeshlash algoritmi | bcrypt |
| Cost (rounds) | 12 (`BCRYPT_ROUNDS`) |
| Bazada | Faqat xesh |
| API javoblarida | Hech qachon (xesh ham) |
| Log'larda | Hech qachon |

**Nega cost 12?** 10 — tez, lekin zamonaviy kompyuterlarda tanlab topishga zaifroq. 14 — xavfsizroq, lekin har login ~1 soniya. 12 — muvozanat (~150–300 ms).

### 11.2. Parol qoidalari (DTO validatsiyasi)

- Kamida 8 belgi, ko'pi bilan 72 belgi (bcrypt 72 baytdan keyingisini e'tiborsiz qoldiradi — shuning uchun yuqori chegara)
- Kamida bitta harf va bitta raqam
- Mini modulda murakkabroq qoidalar (maxsus belgi, katta harf) talab qilinmaydi

### 11.3. Tokenlar

| Talab | |
|---|---|
| `JWT_ACCESS_SECRET` | ≥ 32 belgi, tasodifiy, faqat `.env`da |
| Refresh token | 64 bayt kriptografik tasodif (Node'ning crypto moduli), `Math.random` EMAS |
| Refresh token bazada | Faqat SHA-256 xeshi |
| Tokenlar log'da | Hech qachon yozilmaydi (na access, na refresh) |
| Algoritm | Faqat HS256 qabul qilinadi (tekshiruvda algoritm aniq ko'rsatiladi — "none" algoritmi bilan kelgan token rad etiladi) |

### 11.4. Login himoyasi

- Bir xil xato xabari: "Login yoki parol noto'g'ri"
- Mavjud bo'lmagan login uchun ham bcrypt taqqoslash (vaqt tengligi)
- 5 ketma-ket xato → 15 daqiqa blok (`LOGIN_MAX_ATTEMPTS`, `LOGIN_LOCK_MINUTES`)
- IP bo'yicha throttle (9.8)
- Muvaffaqiyatli login hisoblagichni nolga tushiradi

### 11.5. Vaqt

- Barcha vaqtlar bazada UTC (`timestamptz`)
- Muddatlar (expires_at, locked_until) server vaqti bo'yicha hisoblanadi, klient yuborgan vaqtga ishonilmaydi

### 11.6. Umumiy

- Global ValidationPipe: `whitelist` + `forbidNonWhitelisted` (masalan login so'rovida `role: ADMIN` yuborilsa — 400)
- CORS: hozir frontend yo'q; frontend qo'shilganda faqat uning domeni
- Helmet — HTTP xavfsizlik sarlavhalari (ixtiyoriy, lekin tavsiya)

---

## 12. Xato javoblari

### 12.1. Format

Barcha xatolar bir xil tuzilmada (mavjud global exception filter bo'lsa — o'sha):

| Maydon | Ma'nosi |
|---|---|
| statusCode | HTTP kod |
| error | Qisqa nom (Unauthorized, Forbidden...) |
| message | Foydalanuvchiga tushunarli xabar (o'zbekcha) |
| path | So'rov yo'li |
| timestamp | Vaqt (ISO) |

### 12.2. Holatlar jadvali

| Holat | Kod | Xabar |
|---|---|---|
| DTO xatosi (maydon yo'q, format noto'g'ri, ortiqcha maydon) | 400 | Validatsiya xabarlari ro'yxati |
| Login yoki parol noto'g'ri | 401 | "Login yoki parol noto'g'ri" |
| Token yo'q | 401 | "Avtorizatsiya talab qilinadi" |
| Token noto'g'ri / muddati o'tgan | 401 | "Token yaroqsiz yoki muddati o'tgan" |
| Sessiya bekor qilingan / muddati o'tgan | 401 | "Sessiya tugagan. Qayta kiring" |
| Refresh token noto'g'ri / reuse | 401 | "Sessiya tugagan. Qayta kiring" |
| Hisob bloklangan (Admin tomonidan) | 403 | "Hisob bloklangan. Administratorga murojaat qiling" |
| Rol mos emas | 403 | "Bu amal uchun ruxsatingiz yo'q" |
| Boshqa odamning sessiyasi / mavjud bo'lmagan sessiya | 404 | "Qurilma topilmadi" |
| Login band (yaratishda) | 409 | "Bu login band" |
| Ko'p noto'g'ri urinish (hisob bloki) | 429 | "Juda ko'p urinish. N daqiqadan keyin qayta urinib ko'ring" |
| Throttle limiti | 429 | "Juda ko'p so'rov. Birozdan keyin urinib ko'ring" |

**401 va 403 farqi (eslatma):**

- **401** — "Sizni tanimadim" (token yo'q, noto'g'ri, sessiya yopilgan). Yechim: qayta login.
- **403** — "Sizni tanidim, lekin ruxsat yo'q". Qayta login yordam bermaydi.

**Reuse holatida nega maxsus xabar yo'q?** "Tokeningiz o'g'irlangan" deb yozish hujumchiga ham signal beradi. Umumiy "Sessiya tugagan" yetarli; sabab bazada (`REUSE_DETECTED`) Admin uchun saqlanadi.

---

## 13. Konfiguratsiya (.env)

| O'zgaruvchi | Misol qiymat | Majburiy | Validatsiya | Izoh |
|---|---|---|---|---|
| JWT_ACCESS_SECRET | (64 belgili tasodif) | ha | ≥ 32 belgi | Access token imzosi |
| JWT_ACCESS_TTL | 15m | ha | satr, format: raqam + m/h | Access token muddati |
| REFRESH_TOKEN_TTL_DAYS | 7 | ha | butun son, 1–90 | Refresh token muddati |
| MAX_SESSIONS_PER_USER | 5 | ha | butun son, 1–20 | Qurilmalar limiti |
| LOGIN_MAX_ATTEMPTS | 5 | ha | butun son, 3–20 | Blokgacha xatolar soni |
| LOGIN_LOCK_MINUTES | 15 | ha | butun son, 1–1440 | Blok davomiyligi |
| BCRYPT_ROUNDS | 12 | ha | butun son, 10–14 | Parol xeshi narxi |
| SEED_ADMIN_LOGIN | admin | seed uchun | satr | Birinchi Admin logini |
| SEED_ADMIN_PASSWORD | (kuchli parol) | seed uchun | 11.2 qoidalari | Birinchi Admin paroli |

- Barcha qiymatlar `.env.example`da nomi bilan (qiymatsiz) ko'rsatiladi.
- Mavjud env validatsiyasiga qo'shiladi: biror majburiy qiymat yo'q bo'lsa — server ishga tushmaydi.
- Bu qiymatlar kodga "qattiq" yozilmaydi: ConfigService orqali olinadi.

---

## 14. Kerakli paketlar

| Paket | Nima uchun |
|---|---|
| @nestjs/jwt | Access token yaratish va tekshirish |
| @nestjs/passport | Passport'ni NestJS'ga ulash |
| passport | Autentifikatsiya asosi |
| passport-jwt | JWT strategiyasi (Bearer tokenni sarlavhadan olish) |
| bcrypt (+ uning tiplari) | Parol xeshi |
| ua-parser-js | User-Agent'dan qurilma nomi |
| @nestjs/throttler | Login/refresh chastota cheklovi |

Refresh token va SHA-256 uchun Node.js'ning o'rnatilgan `crypto` moduli yetarli — alohida paket kerak emas.

---

## 15. Amalga oshirish ketma-ketligi — boshidan oxirigacha

Bu bo'lim — hujjatning eng muhim qismi. Har bir qadam:

- **Maqsad** — nima qilinadi
- **Fayllar** — qayerda ishlanadi
- **Tekshirish** — qanday bilasiz ishlayotganini
- **Tayyor mezoni** — keyingi qadamga o'tish sharti
- **Tipik xato** — ko'p uchraydigan muammo

**Umumiy qoida:** har qadam oxirida tekshiring va commit qiling. Bir nechta qadamni birga yozib, keyin tekshirmang — xato chiqsa, qaysi qadamda ekanini topish qiyin bo'ladi.

**Nega aynan shu tartib?** Har qadam oldingisiga tayanadi va har qadamdan keyin **ishlaydigan** holat bo'ladi:

```
Baza → Foydalanuvchi → Parol → Login (faqat access) → Token tekshiruvi → me
     → Sessiya → Refresh → Logout → Sessiya tekshiruvi har so'rovda
     → Qurilmalar → Limit → Reuse → Blok → Rollar global → Admin
     → Parol o'zgartirish → Throttle → Swagger → Yakuniy test
```

Eng oddiy ishlaydigan narsadan boshlab, har qadamda bitta murakkablik qo'shiladi.

---

### Qadam 0. Tayyorgarlik

**Maqsad:** ishni boshlash uchun toza muhit.

1. Git'da yangi branch oching (masalan `feature/auth-sessions`) — asosiy kod buzilmasin.
2. Mavjud holatni yozib oling: hozir qaysi endpointlar bor, ularda `@UseGuards` bormi, `users` jadvali qanday.
3. Mavjud testlar (bo'lsa) o'tishini tekshiring — keyin "bu xato menikimi yoki oldin bor edimi?" degan savol tug'ilmasin.
4. 14-bo'limdagi paketlarni o'rnating.
5. 13-bo'limdagi `.env` qiymatlarini qo'shing (`.env` va `.env.example`), env validatsiyasiga kiriting.

**Tekshirish:** server avvalgidek ishga tushadi. `.env`dan `JWT_ACCESS_SECRET`ni olib tashlasangiz — ishga tushmaydi.

**Tayyor mezoni:** server ishlaydi, yangi env qiymatlari validatsiyadan o'tadi.

**Tipik xato:** bcrypt paketi o'rnatilishda native kompilyatsiya talab qiladi (Windows'da xato berishi mumkin). Muammo bo'lsa — `bcryptjs` (sof JavaScript, biroz sekinroq) muqobili.

**Commit:** `chore(auth): add dependencies and env config`

---

### Qadam 1. Baza sxemasi

**Maqsad:** 7-bo'limdagi jadvallar bazada paydo bo'lsin.

1. Prisma sxemasiga enumlarni qo'shing: `UserRole` (agar hali yo'q bo'lsa), `SessionRevokeReason`.
2. `User` modeliga yangi maydonlarni qo'shing (7.2 — ✚ belgili).
3. `Session` modelini yarating (7.3), relation va indexlarni yozing (7.5).
4. Agar mavjud loginlar katta-kichik harfli bo'lsa — migratsiyadan oldin tozalang (7.7).
5. Migratsiya qiling.
6. Prisma Client qayta generatsiya bo'lganini tekshiring.

**Tekshirish:** Prisma Studio'ni oching (yoki psql):

- `users`da yangi ustunlar bor, mavjud yozuvlarda `is_active = true`, `failed_login_count = 0`
- `sessions` jadvali bor, bo'sh
- `refresh_token_hash`da unique cheklov bor (psql'da jadval tuzilmasini ko'rib)

**Tayyor mezoni:** migratsiya muvaffaqiyatli, mavjud ma'lumot buzilmagan, server ishga tushadi.

**Tipik xato:** mavjud `users` jadvalida ma'lumot bor, yangi majburiy maydon standart qiymatsiz qo'shildi → migratsiya "mavjud qatorlar uchun qiymat yo'q" deb to'xtaydi. Yechim: har majburiy yangi maydonga standart qiymat.

**Commit:** `feat(db): add sessions table and auth fields to users`

---

### Qadam 2. Seed — birinchi Admin

**Maqsad:** tizimga kirish mumkin bo'lgan birinchi hisob.

1. Seed skriptiga Admin yaratishni qo'shing (7.8): login va parol `.env`dan, parol bcrypt bilan xeshlanadi, login kichik harfda.
2. Idempotentlik: shu login bor bo'lsa — hech narsa qilmaydi.
3. Seed'ni ishga tushiring.

**Tekshirish:**

- Bazada Admin paydo bo'ldi, `password_hash` `$2b$` bilan boshlanadi (bcrypt belgisi), ochiq parol yo'q
- Seed'ni ikkinchi marta ishga tushirish — xato yo'q, ikkinchi Admin yaratilmaydi

**Tayyor mezoni:** bitta Admin, xeshlangan parol bilan.

**Commit:** `feat(seed): create initial admin`

---

### Qadam 3. UsersService asoslari

**Maqsad:** foydalanuvchi bilan ishlaydigan umumiy metodlar.

UsersService'da quyidagi metodlar bo'lsin (nomlari sizning ixtiyoringizda):

| Metod | Vazifasi |
|---|---|
| login bo'yicha topish | Kichik harfga o'tkazib qidiradi; **password_hash bilan** qaytaradi (faqat AuthService uchun) |
| id bo'yicha topish | **password_hash'siz** qaytaradi |
| yaratish | Login kichik harfda, parol xeshlanadi, band login → 409 |
| parolni xeshlash | bcrypt, rounds ConfigService'dan |
| parolni taqqoslash | bcrypt compare |

**Muhim qaror:** password_hash qaytaradigan metod bitta, va u faqat login oqimida ishlatiladi. Qolgan hamma joyda "xavfsiz" (xeshsiz) ko'rinish. Prisma `select` yoki `omit` bilan.

**Tekshirish:** hozircha endpoint yo'q — keyingi qadamda login orqali tekshiriladi. Istasangiz, vaqtinchalik unit test.

**Tayyor mezoni:** metodlar yozilgan, UsersModule UsersService'ni eksport qiladi.

**Commit:** `feat(users): add user lookup, creation and password helpers`

---

### Qadam 4. Login — faqat access token (sessiyasiz)

**Maqsad:** eng oddiy ishlaydigan login. Hali sessiya, refresh, blok yo'q.

1. AuthModule'da JwtModule'ni ro'yxatdan o'tkazing (secret va muddat ConfigService'dan — asinxron registratsiya).
2. LoginDto: login, password (+ `deviceName` ixtiyoriy — hozircha e'tiborsiz).
3. AuthService login: foydalanuvchini topish → parolni taqqoslash → access token (hozircha `sub` va `role`; `sid` keyin) → javob.
4. AuthController: `POST /auth/login`.
5. Hozircha global guard yo'q — shuning uchun `@Public` ham kerak emas.

**Tekshirish (Postman):**

| So'rov | Kutilgan |
|---|---|
| To'g'ri login/parol | 200, accessToken bor |
| Noto'g'ri parol | 401 "Login yoki parol noto'g'ri" |
| Mavjud bo'lmagan login | 401, **xuddi shu** xabar |
| Parol maydonisiz | 400 |
| Ortiqcha maydon (masalan role) | 400 |

Olingan tokenni **jwt.io** saytiga qo'yib ichini ko'ring: `sub`, `role`, `iat`, `exp` bor, parol yo'q. `exp - iat = 900` (15 daqiqa).

**Tayyor mezoni:** login ishlaydi, token ichida faqat ruxsat etilgan maydonlar.

**Tipik xato:** JwtModule secret'ni `process.env`dan to'g'ridan-to'g'ri o'qiydi va modul yuklanganda `.env` hali o'qilmagan bo'ladi → secret `undefined`. Yechim: asinxron registratsiya + ConfigService.

**Commit:** `feat(auth): basic login returning access token`

---

### Qadam 5. JwtStrategy, JwtAuthGuard va `me`

**Maqsad:** token bilan himoyalangan birinchi endpoint.

1. JwtStrategy: tokenni Bearer sarlavhadan oladi, secret ConfigService'dan, muddati o'tganini qabul qilmaydi. `validate` hozircha oddiy: payloaddan `userId` va `role` qaytaradi.
2. JwtAuthGuard — Passport JWT guard asosida.
3. `@CurrentUser` decorator.
4. `GET /auth/me` — **hozircha lokal** guard bilan (global keyin, 9-qadamda). UsersService orqali xeshsiz ma'lumot.

**Tekshirish:**

| So'rov | Kutilgan |
|---|---|
| Token bilan /auth/me | 200, foydalanuvchi ma'lumoti, password_hash **yo'q** |
| Tokensiz | 401 |
| Tokenning bitta belgisini o'zgartirib | 401 |
| Boshqa secret bilan yasalgan token (jwt.io'da) | 401 |

**Tayyor mezoni:** token tekshiruvi ishlaydi.

**Commit:** `feat(auth): jwt strategy, guard and me endpoint`

---

### Qadam 6. Sessiyalar — login sessiya yaratadi

**Maqsad:** har login bazada qurilma yozuvi qoldirsin, refresh token berilsin.

1. SessionsModule va SessionsService yarating.
2. Qurilma nomini aniqlovchi yordamchi (6.2): deviceName → User-Agent → "Noma'lum qurilma".
3. SessionsService'da:
   - refresh token yaratish (crypto, 64 bayt)
   - xeshlash (SHA-256)
   - sessiya yaratish (user_id, xesh, qurilma ma'lumoti, IP, expires_at = hozir + TTL)
4. Login oqimini yangilang: parol to'g'ri bo'lsa → sessiya yaratish → access tokenga `sid` qo'shish → javobga `refreshToken`.
5. Controller'da so'rovdan User-Agent va IP'ni oling va Service'ga uzating (Service HTTP'ni bilmasligi kerak — 4.4).

**Tekshirish:**

- Login → javobda `refreshToken` bor
- Bazada `sessions`da yangi qator: `refresh_token_hash` 64 belgili hex, tokenning **o'zi emas** (javobdagi token bilan solishtiring — farq qiladi)
- `device_name` to'g'ri (Postman'dan kirsangiz "PostmanRuntime...")
- jwt.io'da access token ichida `sid` bor va u bazadagi sessiya `id`siga teng
- Ikki marta login → ikkita sessiya

**Tayyor mezoni:** har login = bitta sessiya, token faqat xesh ko'rinishida saqlangan.

**Tipik xato:** refresh tokenni bazaga xesh o'rniga o'zini yozib qo'yish — "ishlayapti" ko'rinadi, lekin 5.2 talabi buzilgan. Bazani ko'z bilan tekshiring.

**Commit:** `feat(sessions): create session on login with hashed refresh token`

---

### Qadam 7. Refresh (rotatsiya bilan)

**Maqsad:** access token tugaganda qayta login qilmasdan yangisini olish.

1. RefreshDto: refreshToken.
2. SessionsService'da rotatsiya: 8.3-banddagi "TOPILDI" shoxi (a–f). Hozircha reuse (TOPILMADI shoxi) — faqat 401.
3. UPDATE shartli bo'lsin: eski xesh hali ham joriy bo'lsagina yangilash (8.3, 3d izohi).
4. `POST /auth/refresh` (hozircha global guard yo'q, shuning uchun ochiq).

**Tekshirish:**

| So'rov | Kutilgan |
|---|---|
| Login → R1 bilan refresh | 200, yangi access + **yangi** R2 (R1'dan farqli) |
| Bazada | O'sha sessiya qatori: xesh o'zgardi, `previous_token_hash` = R1 xeshi, `last_used_at` va `expires_at` yangilandi, sessiya `id` **o'zgarmadi** |
| R2 bilan refresh | 200, R3 |
| Yangi access token bilan /auth/me | 200 |
| Umuman soxta satr bilan refresh | 401 |

Muddat o'tishini tekshirish uchun: `.env`da vaqtincha `JWT_ACCESS_TTL=30s` qiling, 30 soniya kuting → /auth/me 401 → refresh → yangi token bilan 200. Keyin qiymatni qaytaring.

**Tayyor mezoni:** rotatsiya ishlaydi, sessiya ID doimiy.

**Commit:** `feat(auth): refresh token rotation`

---

### Qadam 8. Logout va sessiya tekshiruvi har so'rovda

**Maqsad:** chiqilgan qurilmaning tokenlari darhol ishlamay qolsin.

1. SessionsService: bitta sessiyani revoke qilish (revoked_at + sabab).
2. `POST /auth/logout` — `req.user.sessionId` bo'yicha, sabab LOGOUT, 204.
3. JwtStrategy `validate`ni kengaytiring (8.2, 4–7-qadamlar): sessiyani `sid` bo'yicha foydalanuvchi bilan birga bitta so'rovda olish; faol emas / user_id mos emas / foydalanuvchi bloklangan → 401. `req.user`ga `sessionId` qo'shing, rolni bazadan oling.
4. Refresh'da ham revoke qilingan sessiya → 401 (7-qadamda a-band allaqachon shunday bo'lishi kerak — tekshiring).

**Tekshirish:**

| Harakat | Kutilgan |
|---|---|
| Login → /auth/me | 200 |
| Logout | 204 |
| **Xuddi shu** access token bilan /auth/me | **401** (15 daqiqa kutmasdan!) |
| Xuddi shu refresh token bilan refresh | 401 |
| Bazada | sessiyada `revoked_at` to'ldirilgan, sabab LOGOUT |

Bu qadam 1.2-banddagi asosiy talabni ("qurilma uzilgan zahoti kira olmasin") bajaradi.

**Tayyor mezoni:** logout'dan keyin eski tokenlarning ikkalasi ham ishlamaydi.

**Tipik xato:** strategiyada sessiyani tekshirishda `expires_at`ni unutish — muddati o'tgan, lekin revoke qilinmagan sessiya access token bilan ishlashda davom etadi.

**Commit:** `feat(auth): logout and per-request session validation`

---

### Qadam 9. Global guardlar va `@Public`

**Maqsad:** "sukut bo'yicha yopiq" tizim (4.5).

1. `@Public` decorator.
2. JwtAuthGuard'ni `@Public`ni tekshiradigan qilib kengaytiring (Reflector, handler + class).
3. JwtAuthGuard'ni APP_GUARD sifatida global ro'yxatdan o'tkazing.
4. `@Public` qo'ying: login, refresh, health (bor bo'lsa).
5. Mavjud controllerlardagi lokal `@UseGuards(JwtAuthGuard...)` qatorlarini olib tashlang.

**Tekshirish — butun loyiha bo'ylab:**

| Endpoint | Tokensiz | Token bilan |
|---|---|---|
| POST /auth/login | ishlaydi | — |
| POST /auth/refresh | ishlaydi | — |
| GET /health | 200 | — |
| GET /auth/me | 401 | 200 |
| **Mavjud har bir biznes endpoint** (guruhlar, o'quvchilar...) | **401** | ishlaydi |

Mavjud endpointlarni bittalab tekshiring. Ilgari guard qo'yilmagan (esdan chiqqan) endpoint bo'lsa — endi u avtomatik himoyalangan. Buni topish ham shu qadamning foydasi.

**Tayyor mezoni:** `@Public`siz hech bir endpoint tokensiz ishlamaydi.

**Tipik xato:** login'ga `@Public` qo'yish esdan chiqdi → login ham 401 → hech kim kira olmaydi. Birinchi tekshiradigan narsa — login.

**Commit:** `feat(auth): global jwt guard with public decorator`

---

### Qadam 10. RolesGuard global va `@Roles`

**Maqsad:** 3-bo'limdagi rollar matritsasi ishlasin.

1. `@Roles` decorator.
2. RolesGuard (9.5): `@Roles` yo'q yoki `@Public` bo'lsa → o'tkazish; aks holda rolni tekshirish.
3. APP_GUARD sifatida JwtAuthGuard'dan **keyin** ro'yxatdan o'tkazing.
4. Mavjud controllerlarga `@Roles` qo'ying (3.4 jadvaliga qarab); eski lokal RolesGuard'larni olib tashlang.

**Tekshirish:** har rol uchun bittadan foydalanuvchi kerak — 11-qadamgacha ularni vaqtincha Prisma Studio/seed orqali yarating (parol xeshlangan bo'lsin!).

| Endpoint (misol) | ADMIN | TEACHER | STUDENT |
|---|---|---|---|
| Guruh yaratish | 201 | 403 | 403 |
| /auth/me | 200 | 200 | 200 |

**Tayyor mezoni:** 3-bo'limdagi matritsa biznes endpointlarida ishlaydi.

**Tipik xato:** RolesGuard'ni JwtAuthGuard'dan oldin ro'yxatdan o'tkazish → `req.user` yo'q → 500 yoki hamma narsa 403.

**Commit:** `feat(auth): global roles guard`

---

### Qadam 11. Admin — foydalanuvchilarni boshqarish

**Maqsad:** 10.2-banddagi endpointlar.

1. UsersController, hamma endpoint `@Roles(ADMIN)` (controller darajasida).
2. SessionsService'ga: foydalanuvchining barcha faol sessiyalarini revoke qilish (sabab parametr bilan) va ro'yxatini olish.
3. Endpointlar 9–14 (8.10-banddagi mantiq). Bloklash va parol tiklash — tranzaksiyada, sessiyalar revoke bilan.
4. Admin o'zini bloklay olmasligi.

**Tekshirish:**

| Harakat | Kutilgan |
|---|---|
| Admin: TEACHER yaratadi | 201, javobda xesh yo'q |
| Xuddi shu login bilan yana | 409 |
| TEACHER login qiladi, token oladi | 200 |
| Admin TEACHER'ni bloklaydi | 200 |
| TEACHER'ning **eski** tokeni bilan /auth/me | **401** |
| TEACHER qayta login | 403 "Hisob bloklangan" |
| Admin ochadi → TEACHER login | 200 |
| Admin o'zini bloklamoqchi | 400 |
| TEACHER /users ga | 403 |

**Tayyor mezoni:** bloklash darhol kuchga kiradi.

**Commit:** `feat(users): admin user management with session revocation`

---

### Qadam 12. Qurilmalar ro'yxati, uzish, logout-all

**Maqsad:** foydalanuvchi o'z qurilmalarini boshqarsin.

1. `GET /auth/sessions` (8.7) — `isCurrent` bilan.
2. `DELETE /auth/sessions/:id` (8.8) — UUID validatsiyasi (ParseUUIDPipe), egalik so'rov ichida, topilmasa 404.
3. `POST /auth/logout-all` (8.5).

**Tekshirish — ikkita "qurilma" bilan** (Postman'da ikki xil User-Agent yoki ikki xil `deviceName` bilan ikki marta login; A va B tokenlar):

| Harakat | Kutilgan |
|---|---|
| A bilan /auth/sessions | 2 ta yozuv, A'niki `isCurrent: true` |
| A bilan B'ning sessiyasini DELETE | 204 |
| B'ning access tokeni bilan /auth/me | 401 |
| A bilan ro'yxat | 1 ta yozuv |
| Boshqa foydalanuvchining sessiya ID'si bilan DELETE | **404** |
| "abc" (UUID emas) bilan DELETE | 400 |
| Ikki qurilmadan kirib, biridan logout-all | ikkala tokenlar ham 401 |

**Tayyor mezoni:** qurilmalar boshqaruvi to'liq.

**Commit:** `feat(auth): device list, revoke and logout-all`

---

### Qadam 13. Qurilmalar limiti — 5 ta

**Maqsad:** 6.6-band.

1. Login'dagi sessiya yaratishni tranzaksiyaga oling: faol sonini sanash → ≥ limit bo'lsa eng uzoq ishlatilmaganini revoke (LIMIT_EXCEEDED) → yangisini yaratish.
2. Limit ConfigService'dan (`MAX_SESSIONS_PER_USER`).

**Tekshirish:**

- 5 marta login → 5 ta faol
- 6-login → hali ham 5 ta faol; eng uzoq ishlatilmagani `LIMIT_EXCEEDED` bilan yopilgan
- O'sha yopilgan qurilmaning tokeni → 401
- Qulay sinash uchun vaqtincha limitni 2 qiling

**Tayyor mezoni:** faol sessiyalar hech qachon limitdan oshmaydi.

**Commit:** `feat(sessions): enforce max active devices per user`

---

### Qadam 14. Reuse detection

**Maqsad:** 5.4-band.

1. Refresh oqimining "TOPILMADI" shoxi (8.3): `previous_token_hash` bo'yicha qidirish → topilsa sessiyani revoke (REUSE_DETECTED) → 401.
2. Shartli UPDATE 0 qator yangilagan holat (parallel refresh) ham 401.

**Tekshirish:**

| Harakat | Kutilgan |
|---|---|
| Login → R1 | |
| refresh(R1) → R2 | 200 |
| **yana** refresh(R1) | 401 |
| Bazada | sessiya `REUSE_DETECTED` bilan yopilgan |
| refresh(R2) | 401 (sessiya endi yopiq — "egasi" ham chiqarildi) |
| Access token bilan /auth/me | 401 |

**Tayyor mezoni:** eski refresh tokenning qayta ishlatilishi butun sessiyani yopadi.

**Commit:** `feat(auth): refresh token reuse detection`

---

### Qadam 15. Noto'g'ri parol bloki

**Maqsad:** 11.4-band — 5 xato → 15 daqiqa.

1. Login oqimini 8.1 (5–9-qadamlar) bo'yicha to'liq qiling: mavjud bo'lmagan login uchun soxta taqqoslash, hisoblagich, `locked_until`, muvaffaqiyatda nolga tushirish.
2. Tartibga e'tibor bering: vaqtinchalik blok (`locked_until`) — parol tekshiruvidan **oldin**, Admin bloki (`is_active`) — parol tekshiruvidan **keyin** (8.1 izohlari).
3. Qiymatlar ConfigService'dan.

**Tekshirish:**

| Harakat | Kutilgan |
|---|---|
| 4 marta noto'g'ri parol | har biri 401 |
| 5-noto'g'ri | 401, bazada `locked_until` ≈ hozir + 15 daqiqa |
| **To'g'ri** parol bilan | 429 (blok muddatida to'g'ri parol ham o'tmaydi) |
| Bazada `locked_until`ni o'tmishga o'zgartirib, to'g'ri parol | 200, hisoblagich 0 |
| 3 xato → 1 to'g'ri → 3 xato | blok **yo'q** (hisoblagich muvaffaqiyatda nolga tushadi) |

Qulay sinash uchun vaqtincha `LOGIN_LOCK_MINUTES=1`.

**Tayyor mezoni:** parolni tanlab topish sekinlashtirilgan.

**Commit:** `feat(auth): account lockout after failed attempts`

---

### Qadam 16. Parolni o'zgartirish

**Maqsad:** 8.9-band.

1. ChangePasswordDto: currentPassword, newPassword (11.2 qoidalari).
2. Tranzaksiya: yangi xesh + joriydan boshqa sessiyalar revoke (PASSWORD_CHANGED).
3. Parol qoidalarini (11.2) yaratish va Admin tiklash DTO'lariga ham qo'llang — bitta umumiy qoida.

**Tekshirish:**

| Harakat | Kutilgan |
|---|---|
| A va B qurilmadan kirish; A'dan parol o'zgartirish | 204 |
| A'ning tokeni bilan /auth/me | 200 (joriy qoladi) |
| B'ning tokeni bilan | 401 |
| Eski parol bilan login | 401 |
| Yangi parol bilan login | 200 |
| Noto'g'ri joriy parol | 400 |
| Yangi = eski | 400 |
| "12345678" (harfsiz) | 400 |

**Tayyor mezoni:** parol o'zgarishi boshqa qurilmalarni chiqaradi.

**Commit:** `feat(auth): change password with session revocation`

---

### Qadam 17. Throttle

**Maqsad:** 9.8-band.

1. ThrottlerModule'ni ulang.
2. Login va refresh endpointlariga limitlar.

**Tekshirish:** 1 daqiqada 11 marta login (to'g'ri yoki noto'g'ri) → 11-si 429. Bir daqiqadan keyin yana ishlaydi.

**Tayyor mezoni:** chastota cheklovi ishlaydi.

**Tipik xato:** throttle 429 va hisob bloki 429 bir xil kod — xabarlar farq qilishi kerak (12.2), aks holda debug qilish qiyin.

**Commit:** `feat(auth): rate limit login and refresh`

---

### Qadam 18. Swagger va xato xabarlari

**Maqsad:** hujjatlashtirish va yakuniy sayqal.

1. Swagger'ga Bearer auth; himoyalangan controllerlarda belgi.
2. DTO'larga tavsif va misol qiymatlar.
3. Barcha xato xabarlarini 12.2 jadvali bilan solishtiring — matnlar bir xil va o'zbekcha.
4. Log'larni ko'zdan kechiring: hech qayerda token yoki parol yozilmayotganiga ishonch hosil qiling.

**Tekshirish:** Swagger'da "Authorize" → token → /auth/me Swagger ichidan ishlaydi.

**Commit:** `docs(auth): swagger and error messages`

---

### Qadam 19. Yakuniy tekshiruv va birlashtirish

1. 16-bo'limdagi **barcha** test ssenariylarini boshidan oxirigacha qayta bajaring (oldingi qadamlarda o'tganlarini ham — keyingi qadamlar ularni buzgan bo'lishi mumkin).
2. Vaqtincha o'zgartirilgan `.env` qiymatlarini (TTL, limit, lock) asl holiga qaytaring.
3. Vaqtincha yaratilgan test foydalanuvchilarini tozalang yoki seed'ga rasmiy qo'shing.
4. `.env.example` to'liqligini tekshiring.
5. Branch'ni asosiy branch'ga birlashtiring.

**Tayyor mezoni:** 16-bo'lim jadvalidagi hamma qator ✅.

---

### Ketma-ketlik xulosasi

| Qadam | Nima | Natija |
|---|---|---|
| 0 | Tayyorgarlik | Paketlar, env |
| 1 | Sxema | users + sessions jadvallari |
| 2 | Seed | Birinchi Admin |
| 3 | UsersService | Foydalanuvchi metodlari |
| 4 | Login | Access token |
| 5 | Strategy + me | Himoyalangan endpoint |
| 6 | Sessiyalar | Login = qurilma + refresh token |
| 7 | Refresh | Rotatsiya |
| 8 | Logout + tekshiruv | Darhol bekor qilish |
| 9 | Global JWT guard | Sukut bo'yicha yopiq |
| 10 | Global Roles guard | Rollar matritsasi |
| 11 | Admin | Bloklash, tiklash |
| 12 | Qurilmalar | Ro'yxat, uzish, logout-all |
| 13 | Limit | Maks 5 qurilma |
| 14 | Reuse | O'g'irlikni aniqlash |
| 15 | Blok | 5 xato → 15 daqiqa |
| 16 | Parol o'zgartirish | Boshqa qurilmalar chiqadi |
| 17 | Throttle | IP bo'yicha cheklov |
| 18 | Swagger | Hujjat |
| 19 | Yakuniy | Hamma test ✅ |

---

## 16. Test ssenariylari va qabul mezonlari

Modul qabul qilinadi, agar quyidagi **hamma** ssenariy kutilgan natijani bersa.

### 16.1. Login

| № | Ssenariy | Kutilgan |
|---|---|---|
| 1 | To'g'ri login va parol | 200, accessToken + refreshToken, bazada yangi sessiya |
| 2 | Login katta harfda ("ADMIN") | 200 (kichik harfga o'tkaziladi) |
| 3 | Noto'g'ri parol | 401, umumiy xabar |
| 4 | Mavjud bo'lmagan login | 401, **xuddi shu** xabar |
| 5 | Ortiqcha maydon (role) | 400 |
| 6 | 5 ketma-ket xato | 5-sidan keyin to'g'ri parol ham 429 |
| 7 | Blok muddati tugagach | 200 |
| 8 | Bloklangan hisob, to'g'ri parol | 403 |
| 9 | 1 daqiqada 11 login | 11-si 429 |

### 16.2. Token va sessiya

| № | Ssenariy | Kutilgan |
|---|---|---|
| 10 | Tokensiz himoyalangan endpoint | 401 |
| 11 | Buzilgan token | 401 |
| 12 | Muddati o'tgan access token | 401 |
| 13 | Refresh | 200, yangi juftlik, sessiya ID o'zgarmagan |
| 14 | Eski refresh tokenni qayta ishlatish | 401, sessiya REUSE_DETECTED bilan yopiladi |
| 15 | Logout'dan keyin eski access token | 401 (darhol) |
| 16 | Logout'dan keyin eski refresh token | 401 |
| 17 | Logout-all | barcha qurilmalar tokenlari 401 |
| 18 | 6-qurilmadan login | eng uzoq ishlatilmagani yopiladi, faol soni 5 |
| 19 | Token ichida parol/xesh yo'q (jwt.io) | ✅ |
| 20 | Bazada refresh token ochiq holda yo'q | ✅ faqat xesh |

### 16.3. Qurilmalar

| № | Ssenariy | Kutilgan |
|---|---|---|
| 21 | Qurilmalar ro'yxati | faqat o'ziniki, faqat faollari, joriysi `isCurrent` |
| 22 | O'z boshqa qurilmasini uzish | 204, o'sha qurilma tokenlari 401 |
| 23 | Boshqa odamning qurilmasini uzish | 404 |
| 24 | Noto'g'ri formatdagi ID | 400 |
| 25 | Ro'yxatda refresh_token_hash yo'q | ✅ |

### 16.4. Rollar

| № | Ssenariy | Kutilgan |
|---|---|---|
| 26 | STUDENT → Admin endpoint | 403 |
| 27 | TEACHER → guruh yaratish | 403 |
| 28 | ADMIN → guruh yaratish | 201 |
| 29 | Har rol → /auth/me | 200 |
| 30 | Admin rolni o'zgartirdi | foydalanuvchi tokenlari 401, yangi login yangi rol bilan |
| 31 | `@Public`siz yangi endpoint (sinov uchun yaratib) | tokensiz 401 |

### 16.5. Admin va parol

| № | Ssenariy | Kutilgan |
|---|---|---|
| 32 | Admin foydalanuvchi yaratadi | 201, javobda xesh yo'q |
| 33 | Band login | 409 |
| 34 | Admin bloklaydi | foydalanuvchi tokenlari darhol 401 |
| 35 | Admin o'zini bloklaydi | 400 |
| 36 | Admin parolni tiklaydi | barcha sessiyalar yopiladi, yangi parol bilan kirish mumkin |
| 37 | Foydalanuvchi parolni o'zgartiradi | joriy qurilma ishlaydi, boshqalari 401 |
| 38 | Kuchsiz yangi parol | 400 |

### 16.6. Umumiy

| № | Ssenariy | Kutilgan |
|---|---|---|
| 39 | Barcha xatolar 12.1 formatida | ✅ |
| 40 | Log'larda token/parol yo'q | ✅ |
| 41 | `JWT_ACCESS_SECRET` yo'q yoki qisqa | server ishga tushmaydi |
| 42 | Swagger'da Authorize orqali sinash | ishlaydi |

---

## 17. Hozir kirmaydigan, keyinroq qo'shiladigan narsalar

Bular **ataylab** qoldirildi. Loyiha o'sganda qaysi joyga qo'shilishi oldindan ma'lum bo'lsin:

| Narsa | Qachon kerak bo'ladi | Qayerga qo'shiladi |
|---|---|---|
| Muddati o'tgan/yopilgan sessiyalarni tozalash (cron) | `sessions` jadvali katta bo'lganda | SessionsService + `@nestjs/schedule` |
| Redis'da sessiya keshi | So'rovlar ko'payib, har so'rovdagi DB tekshiruvi sezilganda | JwtStrategy (8.2, 4-qadam) |
| httpOnly cookie'da refresh token | Brauzer frontend qo'shilganda | AuthController (login/refresh javobi) |
| Parallel refresh uchun grace window | Frontend bir nechta tab bilan ishlaganda | Refresh oqimi (5.4 cheklovi) |
| Login tarixi (audit) | Kim, qachon, qayerdan kirganini tahlil qilish kerak bo'lganda | Alohida jadval |
| Parolni tiklash (email/telegram) | Foydalanuvchilar ko'payib, Admin'ga yuk tushganda | Yangi oqim |
| Birinchi kirishda parolni majburiy almashtirish | Admin vaqtinchalik parol beradigan bo'lsa | `users.must_change_password` maydoni |
| Yangi qurilmadan kirish haqida bildirishnoma | Bildirishnoma moduli paydo bo'lganda | Login oqimi |

---

*Hujjat oxiri.*
