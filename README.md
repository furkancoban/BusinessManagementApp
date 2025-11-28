# İşletme Yönetim Sistemi

Küçük işletmeler için müşteri, ürün, sipariş ve stok yönetim sistemi.

## Özellikler

- 🏢 **Çoklu İşletme Desteği** - Her işletme kendi verisiyle çalışır
- 👥 **Müşteri Yönetimi** - Müşteri ekleme, düzenleme, silme
- 📦 **Ürün/Stok Yönetimi** - Ürün ve stok takibi
- 🛒 **Sipariş Yönetimi** - Sipariş oluşturma ve takip
- 🧾 **Fiş Yazdırma** - PDF ve termal yazıcı desteği
- 📊 **Raporlar** - Satış, kar ve stok raporları
- 👤 **Kullanıcı Yönetimi** - Admin ve personel rolleri
- 🔐 **Güvenlik** - E-posta doğrulama, şifre sıfırlama

## Teknolojiler

- **Frontend**: Next.js 14, React, TypeScript, Tailwind CSS
- **Backend**: Next.js API Routes
- **Database**: PostgreSQL (Production) / SQLite (Development)
- **Auth**: NextAuth.js
- **ORM**: Prisma

---

## Yerel Geliştirme (Local Development)

### Gereksinimler
- Node.js 18+
- npm veya yarn

### Kurulum

```bash
# Bağımlılıkları yükle
npm install

# SQLite için .env dosyası oluştur
echo 'DATABASE_URL="file:./dev.db"' > .env
echo 'NEXTAUTH_SECRET="development-secret-key"' >> .env
echo 'NEXTAUTH_URL="http://localhost:3000"' >> .env

# Veritabanını oluştur ve seed'le
npx prisma migrate dev
npm run db:seed

# Geliştirme sunucusunu başlat
npm run dev
```

Uygulama http://localhost:3000 adresinde çalışacaktır.

**Demo Giriş:**
- E-posta: `admin@isletme.com`
- Şifre: `admin123`

---

## Netlify'a Deploy Etme

### 1. PostgreSQL Veritabanı Oluştur

Ücretsiz PostgreSQL veritabanı için şu servisleri kullanabilirsiniz:

#### Neon (Önerilen - Ücretsiz)
1. [neon.tech](https://neon.tech) adresine gidin
2. Ücretsiz hesap oluşturun
3. Yeni proje oluşturun
4. Connection string'i kopyalayın

#### Supabase (Alternatif - Ücretsiz)
1. [supabase.com](https://supabase.com) adresine gidin
2. Yeni proje oluşturun
3. Settings > Database > Connection string (URI) kopyalayın

### 2. Netlify'da Yeni Site Oluştur

1. [Netlify](https://netlify.com)'a giriş yapın
2. "Add new site" > "Import an existing project"
3. GitHub/GitLab reponuzu bağlayın
4. Build ayarları otomatik algılanacaktır

### 3. Environment Variables Ayarla

Netlify Dashboard > Site settings > Environment variables:

```
DATABASE_URL=postgresql://user:password@host:5432/dbname?sslmode=require
NEXTAUTH_SECRET=your-super-secret-random-string-min-32-chars
NEXTAUTH_URL=https://your-site-name.netlify.app

# E-posta için (opsiyonel)
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your-email@gmail.com
SMTP_PASS=your-app-specific-password
SMTP_FROM=noreply@yourdomain.com
```

### 4. Veritabanını Hazırla

Deploy'dan sonra, terminalde:

```bash
# Prisma schema'yı veritabanına uygula
npx prisma db push

# (Opsiyonel) Demo veriler ekle
npm run db:seed
```

Veya Netlify CLI ile:

```bash
netlify env:set DATABASE_URL "your-connection-string"
netlify build
npx prisma db push
```

### 5. İlk Admin Kullanıcısı Oluştur

Veritabanı boşsa, yeni bir işletme ve admin oluşturmak için:

```bash
npx tsx scripts/create-business.ts "İşletme Adı" admin@email.com sifre123 "Admin Adı"
```

---

## E-posta Yapılandırması

E-posta doğrulama ve şifre sıfırlama için SMTP ayarları gereklidir.

### Gmail ile Kurulum

1. Google hesabınızda [2FA'yı etkinleştirin](https://myaccount.google.com/security)
2. [App Password oluşturun](https://myaccount.google.com/apppasswords)
3. Environment variables'a ekleyin:

```
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your-email@gmail.com
SMTP_PASS=your-16-char-app-password
SMTP_FROM=your-email@gmail.com
```

---

## Komutlar

```bash
npm run dev          # Geliştirme sunucusu
npm run build        # Production build
npm run start        # Production sunucusu
npm run lint         # Linting

npm run db:push      # Schema'yı veritabanına uygula
npm run db:generate  # Prisma client oluştur
npm run db:seed      # Demo veriler ekle
npm run db:studio    # Prisma Studio (veritabanı yönetimi)
npm run db:migrate   # Migration'ları uygula
```

---

## Proje Yapısı

```
├── prisma/
│   ├── schema.prisma    # Veritabanı şeması
│   └── seed.ts          # Demo veriler
├── scripts/
│   ├── create-admin.ts  # Admin oluşturma scripti
│   └── create-business.ts # İşletme oluşturma scripti
├── src/
│   ├── app/             # Next.js App Router sayfaları
│   ├── components/      # React bileşenleri
│   └── lib/             # Yardımcı fonksiyonlar
├── netlify.toml         # Netlify yapılandırması
└── package.json
```

---

## Lisans

MIT

