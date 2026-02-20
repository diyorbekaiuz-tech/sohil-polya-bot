# ⚽ Chim Bron Tizimi

Futbol maydonlarini onlayn bron qilish tizimi. 3 ta maydon uchun vaqtni tekshirish va bron qilish imkoniyati.

## 🚀 O'rnatish

### 1. Loyihani yuklab olish va kerakli paketlarni o'rnatish

```bash
npm install
```

### 2. Ma'lumotlar bazasini yaratish

```bash
npx prisma db push
```

### 3. Namuna ma'lumotlarini yuklash

```bash
npm run db:seed
```

### 4. Loyihani ishga tushirish

```bash
npm run dev
```

Brauzerda oching: [http://localhost:3000](http://localhost:3000)

## 📱 Sahifalar

| Sahifa      | URL               | Tavsif                             |
| ----------- | ----------------- | ---------------------------------- |
| Bosh sahifa | `/`               | Maydonlar ro'yxati, narxlar, aloqa |
| Bron qilish | `/booking`        | Sana, maydon va vaqt tanlash       |
| Qoidalar    | `/rules`          | Bron qoidalari va narxlar          |
| Aloqa       | `/contact`        | Telefon, Telegram, manzil          |
| Admin login | `/admin/login`    | Admin paneliga kirish              |
| Dashboard   | `/admin`          | Statistika va bugungi bronlar      |
| Bronlar     | `/admin/bookings` | Bronlar ro'yxati va boshqarish     |
| Kalendar    | `/admin/calendar` | Kunlik jadval va vaqt bloklash     |
| Sozlamalar  | `/admin/settings` | Narxlar, ish vaqti sozlash         |

## 🔑 Admin kirish

- **Login**: `admin`
- **Parol**: `admin123`

`.env` faylida o'zgartirish mumkin.

## 🎨 Ranglar izohi

- 🟢 **Yashil** — Bo'sh (bron qilish mumkin)
- 🔴 **Qizil** — Band (tasdiqlangan)
- 🟡 **Sariq** — Kutilmoqda (admin tasdig'i)
- ⬜ **Kulrang** — Bloklangan (ta'mir/turnir)

## 🛠 Texnologiyalar

- **Next.js 14** (App Router)
- **TypeScript**
- **Tailwind CSS**
- **Prisma** + SQLite
- **JWT** autentifikatsiya

## 📁 Loyiha tuzilishi

```
src/
├── app/
│   ├── page.tsx           # Bosh sahifa
│   ├── booking/           # Bron sahifasi
│   ├── rules/             # Qoidalar
│   ├── contact/           # Aloqa
│   ├── admin/             # Admin panel
│   │   ├── login/
│   │   ├── bookings/
│   │   ├── calendar/
│   │   └── settings/
│   └── api/
│       ├── fields/        # Maydonlar API
│       ├── availability/  # Mavjudlik API
│       ├── bookings/      # Bron API
│       ├── settings/      # Sozlamalar API
│       ├── auth/          # Login API
│       └── admin/         # Admin API
├── components/
│   ├── FieldMap.tsx       # 3 ta maydon vizual xaritasi
│   ├── TimeGrid.tsx       # Vaqt jadvali
│   ├── DatePicker.tsx     # Sana tanlash
│   ├── BookingModal.tsx   # Bron formasi
│   └── Navbar.tsx         # Navigatsiya paneli
└── lib/
    ├── prisma.ts          # Ma'lumotlar bazasi
    ├── auth.ts            # JWT autentifikatsiya
    ├── telegram.ts        # Telegram WebApp
    └── utils.ts           # Yordamchi funksiyalar
```
