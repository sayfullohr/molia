# 🚀 Molia Strategy — Shaxsiy Moliya + Ijtimoiy + O‘yinlar Platformasi

Zamonaviy, professional, xavfsiz va real ishlaydigan to‘liq stekli **shaxsiy moliya + ijtimoiy + multiplayer o‘yinlar platformasi**.

Ushbu platforma oddiy frontend demo emas. Barcha amallar (ro‘yxatdan o‘tish, sessiyalar, xarajat/daromad hisobi, oylik byudjet, kundalik tavsiya limiti, ijtimoiy do‘stlik tizimi, real foydalanuvchilararo chat, serverda tekshiriladigan 3 ta multiplayer o‘yin, tajriba ballari (XP), darajalar, streak faollik zanjiri, yutuqlar (achievements) va xavfsizlik auditi) **server va ma’lumotlar bazasida saqlanadi**. Boshqa qurilmadan kirganda foydalanuvchi barcha ma’lumotlarini ko‘ra oladi.

---

## 📌 Asosiy Texnologiyalar

### Frontend
- **Framework:** Next.js 14 (App Router)
- **Kutubxona:** React 18, TypeScript (Strict Mode)
- **Styling:** Tailwind CSS (Dark / Light rejim to‘liq qo‘llab-quvvatlanadi)
- **Belgilar (Icons):** Professional stroke-based SVG ikonkalar (Lucide React)
- **Arxitektura:** Clean Feature-Driven / Modular Architecture
- **Manzil:** `http://localhost:3000`

### Backend
- **Muhit:** Node.js (v20+ / v24)
- **Framework:** Express.js, TypeScript
- **ORM:** Prisma ORM
- **Xavfsizlik:** Helmet, CORS (with credentials), HttpOnly Secure Cookies, Express Rate Limiting, Zod validatsiya, Bcrypt (12 tuzli hash)
- **Manzil:** `http://localhost:5000`

### Database
- **Asosiy (Production/Target):** PostgreSQL (`localhost:5432`)
- **Lokal sinov / Fallback:** SQLite (`dev.db` 100% bir xil Prisma modellari bilan sinovdan o‘tgan)

---

## 📁 Loyiha Strukturasi

```text
molia-strategy/
│
├── frontend/                     # Next.js App Router Frontend
│   ├── app/                      # Sahifalar (Bosh sahifa, Moliya, O‘yinlar, Do‘stlar, ...)
│   ├── components/
│   │   ├── layout/               # Sidebar (Desktop 240px), MobileNav (5 ta ikonka), Header (64px)
│   │   └── ui/                   # Button, Card, Modal, Input, Badge, Skeleton
│   ├── features/
│   │   ├── auth/                 # Kirish va Ro‘yxatdan o‘tish modal interfeysi
│   │   ├── dashboard/            # Balans, tushum, xarajat, byudjet va oxirgi tranzaksiyalar
│   │   ├── finance/              # Tranzaksiyalar jadvali, filtrlar, CSV/Excel export
│   │   ├── social/               # Do‘st qidirish, so‘rovlar, online status, do‘stlar chat oynasi
│   │   ├── games/                # TicTacToe, Moliyaviy Quiz, Shashka multiplayer o‘yinlari
│   │   ├── gamification/         # Darajalar, XP progress, Streak, Yutuqlar, Leaderboard
│   │   └── security/             # Faol qurilmalar sessiyalari va login urinishlari monitoringi
│   ├── hooks/                    # useAuth va boshqa reaktiv hooklar
│   ├── services/                 # API client (HttpOnly cookie bilan integratsiya qilingan)
│   ├── lib/                      # Yordamchi funksiyalar (formatCurrency, formatDateUz)
│   └── types/                    # TypeScript interfeyslari
│
├── backend/                      # Express.js REST API Backend
│   ├── src/
│   │   ├── config/               # Prisma va Atrof-muhit o‘zgaruvchilari (.env)
│   │   ├── utils/                # Bcrypt, Device/IP parser, Uzbek Date, Test Suite, Seed
│   │   ├── middleware/           # Auth (Sessiya tekshiruvi), Error Handler, Rate Limiter, Validator
│   │   ├── validators/           # Zod validatsiya sxemalari
│   │   ├── services/
│   │   │   ├── auth.service.ts
│   │   │   ├── transaction.service.ts
│   │   │   ├── finance.service.ts (Kategoriyalar, Byudjet, Statistika)
│   │   │   ├── friend.service.ts
│   │   │   ├── chat.service.ts
│   │   │   ├── game.service.ts   # Serverda tekshiriluvchi harakatlar va turn logikasi
│   │   │   ├── gamification.service.ts (XP, Level, Streak, Yutuqlar)
│   │   │   ├── security.service.ts
│   │   │   ├── export.service.ts (CSV & XLSX generatsiyasi)
│   │   │   └── smartParser/      # Aqlli o‘zbek tili tahlil moduli (Normalizer, Matcher, Parser, AIProvider)
│   │   ├── controllers/          # HTTP kontrollerlar
│   │   ├── routes/               # API marshrutlari
│   │   └── server.ts             # Server kirish nuqtasi
│   ├── scripts/                  # Baza rejimini almashtirish (switch-db.js)
│   └── prisma/
│       └── schema.prisma         # Prisma bazaviy sxemasi
│
├── prisma/                       # Root Prisma sxemasi
│   └── schema.prisma
└── README.md
```

---

## ⚙️ O‘rnatish va Ishga Tushirish

### 1. Repozitoriy va Bog‘liqliklarni O‘rnatish

Backend uchun:
```bash
cd backend
npm install
```

Frontend uchun:
```bash
cd ../frontend
npm install
```

---

### 2. Atrof-muhit Sozlamalari (`.env`)

`backend/.env` faylini tekshiring yoki yarating:

```env
PORT=5000
NODE_ENV=development
FRONTEND_URL=http://localhost:3000
SESSION_SECRET=super_secure_molia_session_secret_key_2026_finance_platform!
DATABASE_URL=postgresql://postgres:postgres@localhost:5432/molia_db?schema=public
```

---

### 3. PostgreSQL va Prisma Sozlash

#### Variant A: PostgreSQL bilan ishga tushirish (Tavsiya etiladi)
PostgreSQL serveringiz `localhost:5432` da ishlab turgan bo‘lsa va `molia_db` bazasi mavjud bo‘lsa:

```bash
cd backend
npx prisma generate
npx prisma migrate dev --name init
npx tsx src/utils/seed.ts
```

#### Variant B: Lokal Tezkor Rejim (SQLite bilan)
Agar PostgreSQL o‘rnatilmagan bo‘lsa yoki tezkor mahalliy tekshirish kerak bo‘lsa, quyidagi bitta buyruq bilan bazani ishga tushirishingiz mumkin:

```bash
cd backend
node scripts/switch-db.js sqlite
npx tsx src/utils/seed.ts
```
*(PostgreSQL'ga qaytish uchun: `node scripts/switch-db.js postgres`)*

---

### 4. Backendni Ishga Tushirish

```bash
cd backend
npm run dev
```
Backend `http://localhost:5000` manzilida ishga tushadi.

Salomatlik tekshiruvi:
```bash
curl http://localhost:5000/api/health
```

---

### 5. Frontendni Ishga Tushirish

```bash
cd frontend
npm run dev
```
yoki ishlab chiqarish rejimida:
```bash
npm run build
npm start
```
Frontend `http://localhost:3000` manzilida ochiladi.

---

## 🧪 Avtomatlashtirilgan Testlar

Loyiha uchun barcha 16 ta asosiy yo‘nalishni tekshiruvchi maxsus test ssenariysi mavjud:

```bash
cd backend
npx tsx src/utils/test-api.ts
```

Ushbu test quyidagilarni tekshiradi:
1. Server holati (Health Check)
2. Rezerv qilingan nomlarni bloklash (`admin`, `root`, `system`)
3. Kuchli parol talabi (kamida 8 belgi, katta harf, raqam, maxsus belgi)
4. Case-insensitive unique username (`JasurDev` va `jasurdev` bir xil)
5. Noto‘g‘ri parol bilan kirishni to‘xtatish va audit qilish
6. Foydalanuvchi profili va sessiyasini olish
7. Tranzaksiya qo‘shish va avtomatik +5 XP berish
8. **Aqlli o‘zbek tili matn tahlili** (`taksi 25 ming` -> 25 000 so‘m, Transport)
9. Oylik byudjet belgilash va kundalik limitni hisoblash
10. Dashboard balansi va sarf-xarajatlar hisoboti
11. Do‘stlik so‘rovini yuborish va qabul qilish
12. Foydalanuvchilararo real chat muloqoti
13. Serverda tekshiriluvchi multiplayer TicTacToe o‘yini
14. Yurishlarning qat’iy validatsiyasi
15. Xavfsizlik monitoringi (parollar mutlaqo yashirilgan)

---

## 🔒 Xavfsizlik va Ma’lumotlar Izolyatsiyasi (Data Isolation)

1. **HttpOnly Cookie Sessiyalari:** Foydalanuvchi sessiya identifikatori brauzerdagi JavaScript (`localStorage` yoki `document.cookie`) orqali o‘g‘irlanishi mumkin emas.
2. **Qat’iy Foydalanuvchi Izolyatsiyasi:** Har bir so‘rov `req.userId` orqali filtrlanadi. Foydalanuvchi A hech qachon foydalanuvchi B ning tranzaksiyalari, byudjeti yoki chat xabarlarini ko‘ra olmaydi.
3. **Parol Shifrlash:** Bcrypt (12-round salt) orqali saqlanadi. Hash ma’lumoti hatto audit loglarida ham ko‘rinmaydi.
4. **Rate Limiting:** Har bir IP uchun so‘rovlar soni cheklangan, brute-force hujumlaridan himoyalangan.
5. **Helmet & Secure Headers:** XSS, Clickjacking, MIME-sniffing kabi xurujlarning oldi olingan.

---

## 🎮 Multiplayer O‘yinlar Qoidalari

1. **Tic Tac Toe (3x3):** 2 kishilik onlayn navbat tizimi. Katakka qayta bosish yoki o‘z navbatidan oldin yurish server tomonidan taqiqlanadi. G‘olibga +20 XP.
2. **Moliyaviy Quiz:** 5 ta o‘zbek tilidagi intellektual moliyaviy savollar. Ballar real hisoblanadi.
3. **Shashka (8x8):** Haqiqiy doska harakatlari, burchak bo‘ylab yurishlar, raqib toshini urish va damka (King) ga aylanish serverda tekshiriladi.

---

## 📄 API Marshrutlari Hujjati

| Method | Marshrut | Tavsif |
|---|---|---|
| `POST` | `/api/auth/register` | Ro‘yxatdan o‘tish |
| `POST` | `/api/auth/login` | Tizimga kirish (Cookie o‘rnatadi) |
| `POST` | `/api/auth/logout` | Sessiyani bekor qilish |
| `GET`  | `/api/auth/me` | Joriy profil va daraja ma’lumotlari |
| `GET`  | `/api/transactions` | Tranzaksiyalar (filtrlar va qidiruv bilan) |
| `GET`  | `/api/transactions/dashboard` | Dashboard yig‘ma balansi va kundalik limit |
| `POST` | `/api/transactions` | Yangi tranzaksiya saqlash |
| `POST` | `/api/transactions/smart-parse` | O‘zbekcha matndan xarajat aniqlash |
| `PATCH`| `/api/transactions/:id` | Tranzaksiyani tahrirlash |
| `DELETE`| `/api/transactions/:id` | Tranzaksiyani o‘chirish |
| `GET`  | `/api/budget` | Oylik byudjet va qolgan limit |
| `POST` | `/api/budget` | Oylik byudjet belgilash |
| `GET`  | `/api/statistics` | Davriy tahlil va grafik ma’lumotlari |
| `GET`  | `/api/friends` | Do‘stlar ro‘yxati va online status |
| `POST` | `/api/friends/request` | Do‘stlik so‘rovini yuborish |
| `PATCH`| `/api/friends/request/:id` | So‘rovni qabul / rad qilish |
| `GET`  | `/api/messages/:userId` | Do‘st bilan xabarlar tarixi |
| `POST` | `/api/messages` | Xabar yuborish |
| `POST` | `/api/games` | Yangi o‘yin yaratish |
| `POST` | `/api/games/:id/move` | Serverda tekshiriluvchi harakat qilish |
| `GET`  | `/api/gamification/stats` | XP, daraja, streak va yutuqlar |
| `GET`  | `/api/gamification/leaderboard` | Global va Do‘stlar reytingi |
| `GET`  | `/api/security/login-history` | Kirishlar tarixi monitoringi |
| `GET`  | `/api/security/sessions` | Faol qurilmalar ro‘yxati |
| `GET`  | `/api/export/csv` | Tranzaksiyalarni CSV formatida yuklash |
| `GET`  | `/api/export/excel` | Tranzaksiyalarni Excel (.xlsx) yuklash |

---

## 💡 Kelajakdagi AI va Ovozli Kiritish Arxitekturasi

Tizimda `backend/src/services/smartParser/` moduli ajratilgan:
- `parser.ts` — qoidalar asosidagi parser
- `normalizer.ts` — imlo xatolarini tuzatish va Levenshtein masofasi
- `categoryMatcher.ts` — oziq-ovqat, transport, uy, aloqa va boshqa toifalarni aniqlash
- `responses.ts` — qisqa, tabiiy, insoniy xabar beruvchi javoblar
- `aiProvider.ts` — keyinchalik Gemini / AI API kaliti qo‘shilganda bevosita ulash uchun interfeys.

Ovozli kiritish kelajakda qo‘shilganda audio matnga aylantirilib, bevosita ushbu `smartParser`ga uzatiladi.

---

Loyihadan unumli foydalaning! 🎉
