# İşletme Yönetim Sistemi

Küçük işletmeler için Türkçe arayüzlü, mobil uyumlu müşteri, ürün ve sipariş yönetim sistemi.

![Next.js](https://img.shields.io/badge/Next.js-14-black)
![TypeScript](https://img.shields.io/badge/TypeScript-5-blue)
![Tailwind CSS](https://img.shields.io/badge/Tailwind-3-38bdf8)
![Prisma](https://img.shields.io/badge/Prisma-5-2D3748)

## 🚀 Özellikler

- ✅ **Müşteri Yönetimi** - Müşteri ekleme, düzenleme, silme, arama
- ✅ **Ürün Yönetimi** - Ürün ekleme, alış/satış fiyatı, stok takibi
- ✅ **Sipariş Sistemi** - Sipariş oluşturma, müşteriye özel fiyatlandırma
- ✅ **Fiş Yazdırma** - Tarayıcıdan fiş yazdırma desteği
- ✅ **Raporlar** - Satış, kar, en çok satan ürünler
- ✅ **Responsive Tasarım** - Mobil, tablet ve masaüstü uyumlu
- ✅ **Erişilebilir UI** - Yaşlı kullanıcılar için büyük fontlar ve butonlar

## 📦 Kurulum

### Gereksinimler

- Node.js 18+
- npm veya yarn

### Adımlar

1. **Projeyi klonlayın ve klasöre girin:**

```bash
cd project
```

2. **Bağımlılıkları yükleyin:**

```bash
npm install
```

3. **Environment değişkenlerini ayarlayın:**

`.env` dosyası oluşturun:

```env
DATABASE_URL="file:./dev.db"
NEXTAUTH_SECRET="your-secret-key-change-in-production"
NEXTAUTH_URL="http://localhost:3000"
NEXT_PUBLIC_APP_NAME="İşletme Yönetim Sistemi"
```

4. **Veritabanını oluşturun:**

```bash
npx prisma db push
npx prisma generate
```

5. **Örnek verileri yükleyin:**

```bash
npm run db:seed
```

6. **Geliştirme sunucusunu başlatın:**

```bash
npm run dev
```

7. **Tarayıcıda açın:**

```
http://localhost:3000
```

## 🔐 Giriş Bilgileri

Demo hesabı:

- **E-posta:** admin@isletme.com
- **Şifre:** admin123

## 📁 Proje Yapısı

```
src/
├── app/                    # Next.js App Router
│   ├── (dashboard)/        # Ana uygulama sayfaları
│   │   ├── customers/      # Müşteri sayfaları
│   │   ├── products/       # Ürün sayfaları
│   │   ├── orders/         # Sipariş sayfaları
│   │   ├── reports/        # Rapor sayfası
│   │   └── settings/       # Ayarlar sayfası
│   ├── api/                # API Route'ları
│   └── login/              # Giriş sayfası
├── components/
│   ├── layout/             # Layout bileşenleri
│   ├── shared/             # Paylaşılan bileşenler
│   └── ui/                 # UI bileşenleri (shadcn/ui)
└── lib/                    # Yardımcı fonksiyonlar
```

## 🛠 Kullanılan Teknolojiler

| Teknoloji | Amaç |
|-----------|------|
| Next.js 14 | React framework |
| TypeScript | Tip güvenliği |
| Tailwind CSS | Styling |
| Prisma | ORM |
| SQLite | Veritabanı |
| NextAuth.js | Kimlik doğrulama |
| React Hook Form | Form yönetimi |
| TanStack Query | Veri yönetimi |
| Zod | Validasyon |

## 📱 Ekran Görüntüleri

### Desktop
- Geniş sidebar navigasyonu
- Tablo görünümü

### Mobil
- Alt navigasyon çubuğu
- Kart görünümü
- Touch-friendly butonlar

## 🔧 Geliştirme

```bash
# Geliştirme sunucusu
npm run dev

# Veritabanı GUI
npm run db:studio

# Type check
npm run lint

# Production build
npm run build
```

## 📄 Lisans

MIT

---

**Geliştirici:** Full-Stack Developer  
**Versiyon:** 1.0.0  
**Son Güncelleme:** Kasım 2024

