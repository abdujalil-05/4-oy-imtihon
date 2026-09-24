# Mini ERP — frontend

O'quv markazi mini ERP backendi (`../src`) uchun mijoz ilova.
Backend kodiga umuman tegilmagan: barcha ma'lumot `/api/v1` endpointlari orqali olinadi.

## Texnologiyalar

- React 19 + TypeScript + Vite
- Tailwind CSS v4 (CSS o'zgaruvchilarga qurilgan o'z dizayn tizimi)
- TanStack Query — server holati, keshlash va invalidatsiya
- Framer Motion — sahifa, ro'yxat, modal va diagramma animatsiyalari
- sonner — bildirishnomalar, lucide-react — ikonkalar

## Ishga tushirish

Backend 3000-portda ishlab turgan bo'lishi kerak:

```bash
cd ..
pnpm start:dev
```

So'ng mijoz ilovani ishga tushiring:

```bash
pnpm install
pnpm dev
```

`http://localhost:5180` da ochiladi.

### Nega proxy ishlatilgan

Backend seansni `httpOnly` cookie'da saqlaydi va CORS'da `origin: '*'` yozilgan —
brauzer bunday sozlama bilan boshqa domenga cookie yubormaydi. Shu sababli Vite
dev-server `/api` so'rovlarini backendga proxy qiladi va cookie bir xil origin
ichida qoladi. Backendni o'zgartirishga hojat yo'q.

Backend boshqa manzilda bo'lsa, `.env` fayl yarating:

```
VITE_API_TARGET=http://localhost:3000
```

Ishlab chiqarishda `pnpm build` natijasidagi `dist/` ni nginx orqali tarqating va
`/api` ni backendga proxy qiling — shunda cookie yana bir xil origin ichida bo'ladi.

## Rollar bo'yicha imkoniyatlar

| Bo'lim | Administrator | O'qituvchi | O'quvchi |
| --- | --- | --- | --- |
| Boshqaruv paneli | moliyaviy ko'rsatkichlar, oylik tushum | guruhlari | davomat, ball, to'lov |
| Foydalanuvchilar | to'liq CRUD | — | — |
| Kurslar / Xonalar | to'liq CRUD | ko'rish | kurslarni ko'rish |
| Guruhlar | CRUD, o'quvchi biriktirish | ko'rish | ko'rish |
| Darslar va davomat | to'liq | to'liq | o'z davomati |
| Uy vazifalari | to'liq | qo'shish va baholash | topshirish |
| Imtihonlar | to'liq | natija kiritish | ro'yxatni ko'rish |
| To'lov / Maosh / Xarajat | to'liq | o'z maoshi | o'z to'lovlari |

Rollarga ruxsat backendda ham, frontendda ham tekshiriladi: sahifalar
`Protected` komponenti bilan, menyu esa `components/layout/nav.tsx` orqali
filtrlanadi.

## Tuzilishi

```
src/
  auth/          seans provayderi va rolga qarab yo'nalish nazorati
  components/
    charts/      stat kartalar, oylik ustunli diagramma, davomat taqsimoti
    layout/      Shell, sidebar, topbar, sahifa sarlavhasi
    ui/          tugma, maydon, modal, jadval, tab, badge va boshqalar
  lib/           api mijozi, tiplar, formatlash, mavzu, so'rov kalitlari
  pages/         har bir bo'lim uchun sahifa (student/ — o'quvchi sahifalari)
```

## Dizayn tizimi

Ranglar `src/index.css` dagi CSS o'zgaruvchilarda. Qorong'i rejim asosiy,
yorug' rejim ham to'liq qo'llab-quvvatlanadi va topbar'dagi tugma bilan
almashtiriladi (tanlov `localStorage` da saqlanadi).

Diagramma ranglari alohida tanlangan: ustunli diagramma bitta rang shkalasida
(qorong'ida `#b2dc2b`, yorug'da `#7a9b0f` — ikkalasi ham o'z fonida 3:1 dan
yuqori kontrast beradi), davomat esa holat ranglari bilan (keldi / kechikdi /
kelmadi) va har bir segment yozuv hamda ikonka bilan belgilangan — ma'no faqat
rangga tayanmaydi.

`prefers-reduced-motion` yoqilgan bo'lsa, barcha animatsiyalar o'chadi.
