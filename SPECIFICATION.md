# İşletme Satış ve Sipariş Yönetim Sistemi
## Küçük İşletmeler İçin Web Uygulaması - Teknik Şartname

---

## 📋 İçindekiler

1. [Proje Özeti](#proje-özeti)
2. [Teknoloji Yığını](#teknoloji-yığını)
3. [Veri Modeli](#veri-modeli)
4. [API Uç Noktaları](#api-uç-noktaları)
5. [Ön Yüz Ekranları ve Bileşenler](#ön-yüz-ekranları-ve-bileşenler)
6. [Kullanıcı Akışları](#kullanıcı-akışları)
7. [MVP Planı](#mvp-planı)
8. [Gelecek Geliştirmeler](#gelecek-geliştirmeler)

---

## Proje Özeti

### Amaç
Küçük işletmelerin müşteri ilişkilerini, ürün envanterini ve satış geçmişini kolayca yönetebileceği, Türkçe arayüzlü, mobil uyumlu bir web uygulaması.

### Ana Özellikler
- 🔐 Güvenli kullanıcı girişi (Admin/Personel rolleri)
- 👥 Müşteri yönetimi (CRUD işlemleri)
- 📦 Ürün/Envanter yönetimi (alış/satış fiyatları)
- 🧾 Sipariş oluşturma ve geçmiş takibi
- 🖨️ Fiş/Fatura yazdırma ve PDF dışa aktarma
- 📱 Responsive tasarım (masaüstü, tablet, mobil)
- 👴 Yaşlı kullanıcılar için erişilebilir arayüz

### Hedef Kullanıcılar
- İşletme sahipleri / Yöneticiler (Admin)
- Satış personeli (gelecekte eklenecek)

---

## Teknoloji Yığını

### Frontend
| Teknoloji | Amaç | Gerekçe |
|-----------|------|---------|
| **Next.js 14** | React framework | SSR, routing, API routes desteği |
| **TypeScript** | Tip güvenliği | Hata önleme, IDE desteği |
| **Tailwind CSS** | Styling | Hızlı geliştirme, responsive utilities |
| **shadcn/ui** | UI bileşenleri | Erişilebilir, özelleştirilebilir |
| **React Hook Form** | Form yönetimi | Performanslı, kolay validasyon |
| **Zod** | Şema validasyonu | TypeScript entegrasyonu |
| **TanStack Query** | Sunucu state yönetimi | Caching, refetching |
| **Lucide Icons** | İkonlar | Hafif, kapsamlı |

### Backend
| Teknoloji | Amaç | Gerekçe |
|-----------|------|---------|
| **Next.js API Routes** | REST API | Monorepo yapısı, kolay deployment |
| **Prisma** | ORM | Type-safe queries, migrations |
| **PostgreSQL** | Veritabanı | Güvenilir, ilişkisel veri |
| **NextAuth.js** | Kimlik doğrulama | Oturum yönetimi, güvenlik |
| **bcrypt** | Şifre hashleme | Güvenli parola saklama |

### Yazdırma & PDF
| Teknoloji | Amaç |
|-----------|------|
| **@react-pdf/renderer** | PDF oluşturma |
| **react-to-print** | Tarayıcı üzerinden yazdırma |

### Deployment & DevOps
| Teknoloji | Amaç |
|-----------|------|
| **Vercel** | Hosting (önerilen) |
| **Railway / Supabase** | PostgreSQL hosting |
| **Docker** | Opsiyonel containerization |

---

## Veri Modeli

### Entity Relationship Diagram (Mantıksal)

```
┌─────────────┐       ┌─────────────┐       ┌─────────────┐
│    User     │       │  Customer   │       │   Product   │
├─────────────┤       ├─────────────┤       ├─────────────┤
│ id (PK)     │       │ id (PK)     │       │ id (PK)     │
│ email       │       │ name        │       │ name        │
│ password    │       │ phone       │       │ sku         │
│ name        │       │ email       │       │ description │
│ role        │       │ address     │       │ category    │
│ createdAt   │       │ notes       │       │ purchasePrice│
│ updatedAt   │       │ createdAt   │       │ sellPrice   │
└─────────────┘       │ updatedAt   │       │ isActive    │
                      │ createdById │───────│ createdAt   │
                      └─────────────┘       │ updatedAt   │
                             │              └─────────────┘
                             │                     │
                             ▼                     │
                      ┌─────────────┐              │
                      │    Order    │              │
                      ├─────────────┤              │
                      │ id (PK)     │              │
                      │ orderNumber │              │
                      │ customerId  │──────────────┤
                      │ orderDate   │              │
                      │ totalAmount │              │
                      │ paymentType │              │
                      │ status      │              │
                      │ notes       │              │
                      │ createdById │              │
                      │ createdAt   │              │
                      │ updatedAt   │              │
                      └─────────────┘              │
                             │                     │
                             ▼                     ▼
                      ┌─────────────────────────────┐
                      │        OrderItem            │
                      ├─────────────────────────────┤
                      │ id (PK)                     │
                      │ orderId (FK)                │
                      │ productId (FK)              │
                      │ quantity                    │
                      │ unitPrice (satış fiyatı)    │
                      │ purchasePrice (alış fiyatı) │
                      │ subtotal                    │
                      └─────────────────────────────┘
```

### Prisma Schema

```prisma
// prisma/schema.prisma

generator client {
  provider = "prisma-client-js"
}

datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}

enum UserRole {
  ADMIN
  STAFF
}

enum PaymentType {
  CASH        // Nakit
  CREDIT_CARD // Kredi Kartı
  BANK_TRANSFER // Havale/EFT
  OTHER       // Diğer
}

enum OrderStatus {
  PENDING     // Beklemede
  COMPLETED   // Tamamlandı
  CANCELLED   // İptal Edildi
}

model User {
  id        String   @id @default(cuid())
  email     String   @unique
  password  String
  name      String
  role      UserRole @default(STAFF)
  isActive  Boolean  @default(true)
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt

  // İlişkiler
  customers Customer[]
  orders    Order[]
}

model Customer {
  id        String   @id @default(cuid())
  name      String
  phone     String?
  email     String?
  address   String?
  notes     String?
  isActive  Boolean  @default(true)
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt

  // İlişkiler
  createdBy   User?   @relation(fields: [createdById], references: [id])
  createdById String?
  orders      Order[]

  @@index([name])
  @@index([phone])
}

model Product {
  id            String   @id @default(cuid())
  name          String
  sku           String?  @unique
  description   String?
  category      String?
  purchasePrice Decimal  @db.Decimal(10, 2) // Alış fiyatı
  sellPrice     Decimal  @db.Decimal(10, 2) // Varsayılan satış fiyatı
  stockQuantity Int      @default(0)        // Stok miktarı (opsiyonel)
  isActive      Boolean  @default(true)
  createdAt     DateTime @default(now())
  updatedAt     DateTime @updatedAt

  // İlişkiler
  orderItems OrderItem[]

  @@index([name])
  @@index([sku])
  @@index([category])
}

model Order {
  id          String      @id @default(cuid())
  orderNumber String      @unique // SIP-2024-0001 formatında
  orderDate   DateTime    @default(now())
  totalAmount Decimal     @db.Decimal(10, 2)
  paymentType PaymentType @default(CASH)
  status      OrderStatus @default(COMPLETED)
  notes       String?
  createdAt   DateTime    @default(now())
  updatedAt   DateTime    @updatedAt

  // İlişkiler
  customer    Customer    @relation(fields: [customerId], references: [id])
  customerId  String
  createdBy   User?       @relation(fields: [createdById], references: [id])
  createdById String?
  items       OrderItem[]

  @@index([orderNumber])
  @@index([orderDate])
  @@index([customerId])
}

model OrderItem {
  id            String  @id @default(cuid())
  quantity      Int
  unitPrice     Decimal @db.Decimal(10, 2) // Siparişteki satış fiyatı
  purchasePrice Decimal @db.Decimal(10, 2) // O andaki alış fiyatı (kar hesabı için)
  subtotal      Decimal @db.Decimal(10, 2)

  // İlişkiler
  order     Order   @relation(fields: [orderId], references: [id], onDelete: Cascade)
  orderId   String
  product   Product @relation(fields: [productId], references: [id])
  productId String

  @@index([orderId])
  @@index([productId])
}

// İşletme bilgileri (tek kayıt)
model BusinessInfo {
  id        String  @id @default(cuid())
  name      String
  address   String?
  phone     String?
  email     String?
  taxNumber String? // Vergi numarası
  logo      String? // Logo URL
}
```

---

## API Uç Noktaları

### Kimlik Doğrulama (Authentication)

| Method | Endpoint | Açıklama |
|--------|----------|----------|
| POST | `/api/auth/login` | Kullanıcı girişi |
| POST | `/api/auth/logout` | Çıkış |
| GET | `/api/auth/me` | Mevcut kullanıcı bilgisi |
| PUT | `/api/auth/password` | Şifre değiştirme |

### Müşteriler (Customers)

| Method | Endpoint | Açıklama |
|--------|----------|----------|
| GET | `/api/customers` | Tüm müşterileri listele (sayfalama, arama destekli) |
| GET | `/api/customers/:id` | Tek müşteri detayı |
| POST | `/api/customers` | Yeni müşteri oluştur |
| PUT | `/api/customers/:id` | Müşteri güncelle |
| DELETE | `/api/customers/:id` | Müşteri sil (soft delete) |
| GET | `/api/customers/:id/orders` | Müşterinin sipariş geçmişi |

**Query Parametreleri:**
```
GET /api/customers?search=ahmet&page=1&limit=20&sortBy=name&sortOrder=asc
```

### Ürünler (Products)

| Method | Endpoint | Açıklama |
|--------|----------|----------|
| GET | `/api/products` | Tüm ürünleri listele |
| GET | `/api/products/:id` | Tek ürün detayı |
| POST | `/api/products` | Yeni ürün oluştur |
| PUT | `/api/products/:id` | Ürün güncelle |
| DELETE | `/api/products/:id` | Ürün sil (soft delete) |
| GET | `/api/products/categories` | Kategori listesi |

**Query Parametreleri:**
```
GET /api/products?search=laptop&category=elektronik&page=1&limit=20
```

### Siparişler (Orders)

| Method | Endpoint | Açıklama |
|--------|----------|----------|
| GET | `/api/orders` | Tüm siparişleri listele |
| GET | `/api/orders/:id` | Tek sipariş detayı |
| POST | `/api/orders` | Yeni sipariş oluştur |
| PUT | `/api/orders/:id` | Sipariş güncelle |
| DELETE | `/api/orders/:id` | Sipariş sil |
| GET | `/api/orders/:id/receipt` | Sipariş fişi (PDF) |
| GET | `/api/orders/:id/print` | Yazdırma için HTML |

**Query Parametreleri:**
```
GET /api/orders?customerId=xxx&startDate=2024-01-01&endDate=2024-12-31&status=COMPLETED
```

### Raporlar (Reports) - Gelecek Versiyon

| Method | Endpoint | Açıklama |
|--------|----------|----------|
| GET | `/api/reports/sales` | Satış raporu |
| GET | `/api/reports/profit` | Kar/Zarar raporu |
| GET | `/api/reports/top-customers` | En çok alışveriş yapan müşteriler |
| GET | `/api/reports/top-products` | En çok satan ürünler |

### Dışa Aktarma (Export)

| Method | Endpoint | Açıklama |
|--------|----------|----------|
| GET | `/api/export/customers` | Müşterileri CSV/Excel olarak indir |
| GET | `/api/export/products` | Ürünleri CSV/Excel olarak indir |
| GET | `/api/export/orders` | Siparişleri CSV/Excel olarak indir |

### İşletme Bilgileri

| Method | Endpoint | Açıklama |
|--------|----------|----------|
| GET | `/api/business` | İşletme bilgilerini getir |
| PUT | `/api/business` | İşletme bilgilerini güncelle |

---

## Ön Yüz Ekranları ve Bileşenler

### Sayfa Yapısı

```
┌────────────────────────────────────────────────────────────┐
│                      HEADER                                 │
│  [Logo] İşletme Adı          [👤 Admin] [⚙️] [🚪 Çıkış]    │
├────────────────────────────────────────────────────────────┤
│        │                                                    │
│  NAV   │              MAIN CONTENT                         │
│  BAR   │                                                    │
│        │                                                    │
│ [🏠]   │   ┌──────────────────────────────────────┐        │
│ Ana    │   │                                      │        │
│ Sayfa  │   │         Page Content                 │        │
│        │   │                                      │        │
│ [👥]   │   │                                      │        │
│ Müşte- │   │                                      │        │
│ riler  │   │                                      │        │
│        │   │                                      │        │
│ [📦]   │   │                                      │        │
│ Ürün-  │   │                                      │        │
│ ler    │   └──────────────────────────────────────┘        │
│        │                                                    │
│ [🧾]   │                                                    │
│ Sipa-  │                                                    │
│ rişler │                                                    │
│        │                                                    │
│ [➕]   │                                                    │
│ Yeni   │                                                    │
│ Sipariş│                                                    │
│        │                                                    │
│ [📊]   │                                                    │
│ Rapor- │                                                    │
│ lar    │                                                    │
│        │                                                    │
└────────┴────────────────────────────────────────────────────┘
```

### Mobil Tasarım (< 768px)

```
┌─────────────────────┐
│ [☰] İşletme    [👤] │  ← Hamburger menü
├─────────────────────┤
│                     │
│   MAIN CONTENT      │
│                     │
│                     │
│                     │
│                     │
│                     │
│                     │
├─────────────────────┤
│ [🏠] [👥] [📦] [🧾] │  ← Bottom navigation
│ Ana  Müş  Ürün Sip  │
└─────────────────────┘
```

---

### 1. Giriş Ekranı (`/login`)

```
┌────────────────────────────────────────┐
│                                        │
│           🏪 İŞLETME ADI               │
│       Satış Yönetim Sistemi            │
│                                        │
│    ┌──────────────────────────┐        │
│    │ 📧 E-posta                │        │
│    │ admin@isletme.com        │        │
│    └──────────────────────────┘        │
│                                        │
│    ┌──────────────────────────┐        │
│    │ 🔒 Şifre                  │        │
│    │ ••••••••                 │        │
│    └──────────────────────────┘        │
│                                        │
│    [✓] Beni hatırla                    │
│                                        │
│    ┌──────────────────────────┐        │
│    │       GİRİŞ YAP          │        │
│    └──────────────────────────┘        │
│                                        │
│    Şifremi unuttum                     │
│                                        │
└────────────────────────────────────────┘
```

**Özellikler:**
- Büyük, okunabilir fontlar (min 16px input)
- Yüksek kontrast renk şeması
- Hata mesajları net ve Türkçe
- "Şifremi göster" toggle butonu

---

### 2. Ana Sayfa / Dashboard (`/`)

```
┌──────────────────────────────────────────────────────────────┐
│  📊 Genel Bakış                                    📅 Bugün  │
├──────────────────────────────────────────────────────────────┤
│                                                              │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐          │
│  │  💰 GÜNLÜK  │  │  📈 AYLIK   │  │  👥 TOPLAM  │          │
│  │   SATIŞ    │  │   SATIŞ    │  │  MÜŞTERİ   │          │
│  │            │  │            │  │            │          │
│  │  ₺2,450    │  │  ₺45,780   │  │    127     │          │
│  │  +12%      │  │  +8%       │  │  +5 yeni   │          │
│  └─────────────┘  └─────────────┘  └─────────────┘          │
│                                                              │
│  ┌─────────────────────────────┐  ┌────────────────────────┐│
│  │  📋 SON SİPARİŞLER          │  │  ⚡ HIZLI İŞLEMLER    ││
│  ├─────────────────────────────┤  ├────────────────────────┤│
│  │ SIP-2024-0156               │  │                        ││
│  │ Ahmet Yılmaz - ₺350         │  │  [➕ Yeni Sipariş]     ││
│  │ 10 dk önce                  │  │                        ││
│  ├─────────────────────────────┤  │  [👤 Yeni Müşteri]     ││
│  │ SIP-2024-0155               │  │                        ││
│  │ Fatma Kaya - ₺1,200         │  │  [📦 Yeni Ürün]        ││
│  │ 45 dk önce                  │  │                        ││
│  ├─────────────────────────────┤  │  [🖨️ Son Fişi Yazdır]  ││
│  │ SIP-2024-0154               │  │                        ││
│  │ Mehmet Demir - ₺890         │  └────────────────────────┘│
│  │ 2 saat önce                 │                            │
│  └─────────────────────────────┘                            │
│                                                              │
└──────────────────────────────────────────────────────────────┘
```

**Özellikler:**
- Özet istatistikler (kartlar)
- Son siparişler listesi
- Hızlı erişim butonları
- Tarih aralığı seçici (bugün/hafta/ay)

---

### 3. Müşteri Listesi (`/customers`)

```
┌──────────────────────────────────────────────────────────────┐
│  👥 Müşteriler                            [➕ Yeni Müşteri]  │
├──────────────────────────────────────────────────────────────┤
│                                                              │
│  🔍 ┌──────────────────────────────────────────────┐         │
│     │ Müşteri ara (ad, telefon)...                 │         │
│     └──────────────────────────────────────────────┘         │
│                                                              │
│  ┌────────────────────────────────────────────────────────┐  │
│  │ AD SOYAD        │ TELEFON       │ SON SİPARİŞ │ İŞLEM  │  │
│  ├────────────────────────────────────────────────────────┤  │
│  │                                                        │  │
│  │ 👤 Ahmet Yılmaz │ 0532 123 4567 │ 2 gün önce  │ [···]  │  │
│  │   İstanbul      │               │ ₺350        │        │  │
│  │                                                        │  │
│  ├────────────────────────────────────────────────────────┤  │
│  │                                                        │  │
│  │ 👤 Fatma Kaya   │ 0544 987 6543 │ 1 hafta önce│ [···]  │  │
│  │   Ankara        │               │ ₺1,200      │        │  │
│  │                                                        │  │
│  ├────────────────────────────────────────────────────────┤  │
│  │                                                        │  │
│  │ 👤 Mehmet Demir │ 0555 456 7890 │ Bugün       │ [···]  │  │
│  │   İzmir         │               │ ₺890        │        │  │
│  │                                                        │  │
│  └────────────────────────────────────────────────────────┘  │
│                                                              │
│  ◀ Önceki    Sayfa 1 / 7    Sonraki ▶                       │
│                                                              │
└──────────────────────────────────────────────────────────────┘
```

**[···] Menü İçeriği:**
- 👁️ Detay Görüntüle
- ✏️ Düzenle
- 🧾 Sipariş Geçmişi
- ➕ Yeni Sipariş
- 🗑️ Sil

---

### 4. Müşteri Detay / Düzenleme (`/customers/:id`)

```
┌──────────────────────────────────────────────────────────────┐
│  ← Geri    👤 Müşteri Detayı                    [✏️ Düzenle] │
├──────────────────────────────────────────────────────────────┤
│                                                              │
│  ┌──────────────────────────┐  ┌──────────────────────────┐  │
│  │  📋 BİLGİLER             │  │  📊 İSTATİSTİKLER        │  │
│  ├──────────────────────────┤  ├──────────────────────────┤  │
│  │                          │  │                          │  │
│  │  Ad Soyad                │  │  Toplam Sipariş: 24      │  │
│  │  Ahmet Yılmaz            │  │  Toplam Harcama: ₺12,450 │  │
│  │                          │  │  Ortalama: ₺518          │  │
│  │  Telefon                 │  │  Son Sipariş: 2 gün önce │  │
│  │  0532 123 4567           │  │                          │  │
│  │                          │  └──────────────────────────┘  │
│  │  E-posta                 │                                │
│  │  ahmet@email.com         │  [➕ Yeni Sipariş Oluştur]     │
│  │                          │                                │
│  │  Adres                   │                                │
│  │  Kadıköy, İstanbul       │                                │
│  │                          │                                │
│  │  Notlar                  │                                │
│  │  VIP müşteri, özel       │                                │
│  │  indirim uygulanır       │                                │
│  │                          │                                │
│  └──────────────────────────┘                                │
│                                                              │
│  ┌──────────────────────────────────────────────────────────┐│
│  │  🧾 SİPARİŞ GEÇMİŞİ                                      ││
│  ├──────────────────────────────────────────────────────────┤│
│  │ TARİH      │ SİPARİŞ NO     │ TUTAR   │ DURUM  │ İŞLEM  ││
│  ├──────────────────────────────────────────────────────────┤│
│  │ 25.11.2024 │ SIP-2024-0156  │ ₺350    │ ✓      │ [···]  ││
│  │ 18.11.2024 │ SIP-2024-0142  │ ₺780    │ ✓      │ [···]  ││
│  │ 05.11.2024 │ SIP-2024-0128  │ ₺1,200  │ ✓      │ [···]  ││
│  └──────────────────────────────────────────────────────────┘│
│                                                              │
└──────────────────────────────────────────────────────────────┘
```

---

### 5. Ürün Listesi (`/products`)

```
┌──────────────────────────────────────────────────────────────┐
│  📦 Ürünler                                   [➕ Yeni Ürün]  │
├──────────────────────────────────────────────────────────────┤
│                                                              │
│  🔍 ┌────────────────────────┐  📂 ┌─────────────────┐       │
│     │ Ürün ara...            │     │ Tüm Kategoriler ▼│      │
│     └────────────────────────┘     └─────────────────┘       │
│                                                              │
│  ┌──────────────────────────────────────────────────────────┐│
│  │ ÜRÜN ADI       │ SKU     │ ALIŞ    │ SATIŞ   │ STOK │ İŞ ││
│  ├──────────────────────────────────────────────────────────┤│
│  │                                                          ││
│  │ 📦 Laptop HP   │ LP-001  │ ₺15,000 │ ₺18,500 │ 5    │[···]│
│  │   Elektronik   │         │         │ %23 kar │      │    ││
│  │                                                          ││
│  ├──────────────────────────────────────────────────────────┤│
│  │                                                          ││
│  │ 📦 Mouse       │ MS-002  │ ₺150    │ ₺250    │ 42   │[···]│
│  │   Aksesuar     │         │         │ %67 kar │      │    ││
│  │                                                          ││
│  ├──────────────────────────────────────────────────────────┤│
│  │                                                          ││
│  │ 📦 Klavye      │ KB-003  │ ₺300    │ ₺450    │ 18   │[···]│
│  │   Aksesuar     │         │         │ %50 kar │      │    ││
│  │                                                          ││
│  └──────────────────────────────────────────────────────────┘│
│                                                              │
│  📊 Toplam: 156 ürün   💰 Toplam Stok Değeri: ₺125,400      │
│                                                              │
└──────────────────────────────────────────────────────────────┘
```

---

### 6. Yeni Sipariş Oluşturma (`/orders/new`)

```
┌──────────────────────────────────────────────────────────────┐
│  ← Geri    🧾 Yeni Sipariş Oluştur                           │
├──────────────────────────────────────────────────────────────┤
│                                                              │
│  ADIM 1: MÜŞTERİ SEÇİMİ                                     │
│  ┌──────────────────────────────────────────────────────────┐│
│  │ 🔍 Müşteri ara veya seç...                       [➕ Yeni]│
│  │ ┌──────────────────────────────────────────────────────┐ ││
│  │ │ ✓ Ahmet Yılmaz - 0532 123 4567                       │ ││
│  │ └──────────────────────────────────────────────────────┘ ││
│  └──────────────────────────────────────────────────────────┘│
│                                                              │
│  ADIM 2: ÜRÜN EKLEME                                        │
│  ┌──────────────────────────────────────────────────────────┐│
│  │ 🔍 Ürün ara...                                           ││
│  │                                                          ││
│  │ ┌──────────────────────────────────────────────────────┐ ││
│  │ │ ÜRÜN           │ MİKTAR │ BİRİM FİYAT  │ TOPLAM │ 🗑️ │ ││
│  │ ├──────────────────────────────────────────────────────┤ ││
│  │ │ Laptop HP      │ [1][-][+]│ ₺[18,500]   │ ₺18,500│ ✕ │ ││
│  │ │ (Var. ₺18,500) │        │  (değiştir.) │        │   │ ││
│  │ ├──────────────────────────────────────────────────────┤ ││
│  │ │ Mouse          │ [2][-][+]│ ₺[250]      │ ₺500   │ ✕ │ ││
│  │ │ (Var. ₺250)    │        │              │        │   │ ││
│  │ └──────────────────────────────────────────────────────┘ ││
│  │                                                          ││
│  │ [➕ Ürün Ekle]                                           ││
│  └──────────────────────────────────────────────────────────┘│
│                                                              │
│  ADIM 3: ÖDEME BİLGİLERİ                                    │
│  ┌──────────────────────────────────────────────────────────┐│
│  │                                                          ││
│  │  Ödeme Tipi:  ○ Nakit  ● Kredi Kartı  ○ Havale  ○ Diğer ││
│  │                                                          ││
│  │  📅 Tarih: [27.11.2024]                                  ││
│  │                                                          ││
│  │  📝 Notlar: ┌─────────────────────────────────────────┐  ││
│  │             │                                         │  ││
│  │             └─────────────────────────────────────────┘  ││
│  │                                                          ││
│  └──────────────────────────────────────────────────────────┘│
│                                                              │
│  ┌────────────────────────────────────────────────────────┐  │
│  │                              ARA TOPLAM:   ₺19,000     │  │
│  │                              KDV (%18):    ₺3,420      │  │
│  │                              ─────────────────────     │  │
│  │                              GENEL TOPLAM: ₺22,420     │  │
│  └────────────────────────────────────────────────────────┘  │
│                                                              │
│  ┌─────────────────┐  ┌─────────────────┐  ┌───────────────┐ │
│  │    İPTAL        │  │   KAYDET        │  │ KAYDET &      │ │
│  │                 │  │                 │  │ FİŞ YAZDIR    │ │
│  └─────────────────┘  └─────────────────┘  └───────────────┘ │
│                                                              │
└──────────────────────────────────────────────────────────────┘
```

**Önemli UX Notları:**
- Birim fiyat varsayılan olarak ürünün satış fiyatı gelir ama **düzenlenebilir**
- Fiyat değiştirildiğinde varsayılandan farklı olduğu görsel olarak belirtilir
- Miktar butonları touch-friendly (+/- butonları)
- Anlık toplam hesaplama
- Form validasyonu (boş sipariş engellemesi)

---

### 7. Sipariş Detay ve Fiş (`/orders/:id`)

```
┌──────────────────────────────────────────────────────────────┐
│  ← Geri    🧾 Sipariş Detayı              [🖨️ Yazdır] [📄 PDF]│
├──────────────────────────────────────────────────────────────┤
│                                                              │
│  ┌───────────────────────────────────────────────────────┐   │
│  │                                                       │   │
│  │                  🏪 İŞLETME ADI                       │   │
│  │           Adres: Örnek Mah. No:1 İstanbul             │   │
│  │           Tel: 0212 123 4567                          │   │
│  │                                                       │   │
│  │  ─────────────────────────────────────────────────    │   │
│  │                                                       │   │
│  │  Sipariş No: SIP-2024-0156                           │   │
│  │  Tarih: 27.11.2024 14:35                             │   │
│  │                                                       │   │
│  │  Müşteri: Ahmet Yılmaz                               │   │
│  │  Telefon: 0532 123 4567                              │   │
│  │                                                       │   │
│  │  ─────────────────────────────────────────────────    │   │
│  │                                                       │   │
│  │  ÜRÜN                    MİKTAR    FİYAT     TOPLAM   │   │
│  │  ─────────────────────────────────────────────────    │   │
│  │  Laptop HP                  1    ₺18,500   ₺18,500   │   │
│  │  Mouse                      2    ₺250      ₺500      │   │
│  │                                                       │   │
│  │  ─────────────────────────────────────────────────    │   │
│  │                                                       │   │
│  │                           ARA TOPLAM:      ₺19,000   │   │
│  │                           KDV (%18):       ₺3,420    │   │
│  │                           ═══════════════════════    │   │
│  │                           GENEL TOPLAM:    ₺22,420   │   │
│  │                                                       │   │
│  │  ─────────────────────────────────────────────────    │   │
│  │                                                       │   │
│  │  Ödeme Tipi: Kredi Kartı                             │   │
│  │  Durum: ✓ Tamamlandı                                 │   │
│  │                                                       │   │
│  │  ─────────────────────────────────────────────────    │   │
│  │                                                       │   │
│  │              Teşekkür ederiz!                         │   │
│  │           Yine bekleriz... 🙏                        │   │
│  │                                                       │   │
│  └───────────────────────────────────────────────────────┘   │
│                                                              │
│  ┌─────────────────┐  ┌─────────────────┐  ┌───────────────┐ │
│  │   ✏️ DÜZENLE    │  │   🖨️ YAZDIR     │  │  📄 PDF İNDİR │ │
│  └─────────────────┘  └─────────────────┘  └───────────────┘ │
│                                                              │
└──────────────────────────────────────────────────────────────┘
```

---

### 8. Sipariş Listesi (`/orders`)

```
┌──────────────────────────────────────────────────────────────┐
│  🧾 Siparişler                            [➕ Yeni Sipariş]   │
├──────────────────────────────────────────────────────────────┤
│                                                              │
│  FİLTRELER                                                   │
│  ┌────────────────┐ ┌────────────────┐ ┌────────────────┐    │
│  │ 📅 Başlangıç   │ │ 📅 Bitiş       │ │ 👤 Müşteri     │    │
│  │ [01.11.2024]   │ │ [30.11.2024]   │ │ [Tümü       ▼] │    │
│  └────────────────┘ └────────────────┘ └────────────────┘    │
│                                                              │
│  ┌────────────────┐                                          │
│  │ 📊 Durum       │   [🔍 Filtrele]  [✕ Temizle]             │
│  │ [Tümü       ▼] │                                          │
│  └────────────────┘                                          │
│                                                              │
│  ┌──────────────────────────────────────────────────────────┐│
│  │ SİPARİŞ NO   │ TARİH      │ MÜŞTERİ      │ TUTAR  │ İŞLEM││
│  ├──────────────────────────────────────────────────────────┤│
│  │ SIP-2024-0156│ 27.11.2024 │ Ahmet Yılmaz │₺22,420 │ [···]││
│  │              │ 14:35      │ Kredi Kartı  │ ✓      │      ││
│  ├──────────────────────────────────────────────────────────┤│
│  │ SIP-2024-0155│ 27.11.2024 │ Fatma Kaya   │₺5,800  │ [···]││
│  │              │ 11:20      │ Nakit        │ ✓      │      ││
│  ├──────────────────────────────────────────────────────────┤│
│  │ SIP-2024-0154│ 26.11.2024 │ Mehmet Demir │₺890    │ [···]││
│  │              │ 16:45      │ Havale       │ ✓      │      ││
│  └──────────────────────────────────────────────────────────┘│
│                                                              │
│  📊 Gösterilen: 45 sipariş  |  💰 Toplam: ₺145,780          │
│                                                              │
│  ◀ Önceki    Sayfa 1 / 5    Sonraki ▶                       │
│                                                              │
└──────────────────────────────────────────────────────────────┘
```

---

### 9. Raporlar (`/reports`) - Gelecek Versiyon

```
┌──────────────────────────────────────────────────────────────┐
│  📊 Raporlar ve Analizler                                    │
├──────────────────────────────────────────────────────────────┤
│                                                              │
│  📅 Dönem: [Bu Ay ▼]  veya  [01.11.2024] - [30.11.2024]     │
│                                                              │
│  ┌─────────────────────────────────────────────────────────┐ │
│  │                 📈 SATIŞ GRAFİĞİ                        │ │
│  │                                                         │ │
│  │     ▄                                                   │ │
│  │    ▄█▄        ▄                                        │ │
│  │   ▄███▄     ▄█▄     ▄▄                                 │ │
│  │  ▄█████▄   ▄███▄   ▄██▄                                │ │
│  │ ▄███████▄ ▄█████▄ ▄████▄                               │ │
│  │ ─────────────────────────                              │ │
│  │ Hft1  Hft2  Hft3  Hft4                                 │ │
│  │                                                         │ │
│  └─────────────────────────────────────────────────────────┘ │
│                                                              │
│  ┌──────────────┐ ┌──────────────┐ ┌──────────────┐          │
│  │ 💰 TOPLAM    │ │ 📈 KAR       │ │ 🧾 SİPARİŞ   │          │
│  │    SATIŞ     │ │   MARJI      │ │    SAYISI    │          │
│  │              │ │              │ │              │          │
│  │  ₺145,780    │ │  ₺42,350     │ │     89       │          │
│  │  +15%        │ │  %29         │ │  +12%        │          │
│  └──────────────┘ └──────────────┘ └──────────────┘          │
│                                                              │
│  ┌─────────────────────────┐ ┌─────────────────────────┐     │
│  │ 🏆 EN ÇOK SATAN ÜRÜNLER │ │ ⭐ EN İYİ MÜŞTERİLER    │     │
│  ├─────────────────────────┤ ├─────────────────────────┤     │
│  │ 1. Laptop HP    (24)    │ │ 1. Ahmet Yılmaz ₺12,450│     │
│  │ 2. Mouse        (156)   │ │ 2. Fatma Kaya   ₺8,900 │     │
│  │ 3. Klavye       (89)    │ │ 3. Mehmet Demir ₺6,780 │     │
│  │ 4. Monitor      (12)    │ │ 4. Ayşe Çelik   ₺5,200 │     │
│  │ 5. USB Kablo    (234)   │ │ 5. Can Özkan    ₺4,100 │     │
│  └─────────────────────────┘ └─────────────────────────┘     │
│                                                              │
│  [📥 Excel İndir]  [📄 PDF Rapor]                            │
│                                                              │
└──────────────────────────────────────────────────────────────┘
```

---

### 10. Ayarlar (`/settings`)

```
┌──────────────────────────────────────────────────────────────┐
│  ⚙️ Ayarlar                                                  │
├──────────────────────────────────────────────────────────────┤
│                                                              │
│  ┌──────────────────────────────────────────────────────────┐│
│  │ 🏪 İŞLETME BİLGİLERİ                                     ││
│  ├──────────────────────────────────────────────────────────┤│
│  │                                                          ││
│  │  İşletme Adı    ┌─────────────────────────────────────┐  ││
│  │                 │ Örnek Ticaret                        │  ││
│  │                 └─────────────────────────────────────┘  ││
│  │                                                          ││
│  │  Adres          ┌─────────────────────────────────────┐  ││
│  │                 │ Örnek Mah. No:1 İstanbul             │  ││
│  │                 └─────────────────────────────────────┘  ││
│  │                                                          ││
│  │  Telefon        ┌─────────────────────────────────────┐  ││
│  │                 │ 0212 123 4567                        │  ││
│  │                 └─────────────────────────────────────┘  ││
│  │                                                          ││
│  │  Vergi No       ┌─────────────────────────────────────┐  ││
│  │                 │ 1234567890                           │  ││
│  │                 └─────────────────────────────────────┘  ││
│  │                                                          ││
│  │  Logo           [📷 Logo Yükle]                          ││
│  │                                                          ││
│  │                                          [💾 Kaydet]     ││
│  └──────────────────────────────────────────────────────────┘│
│                                                              │
│  ┌──────────────────────────────────────────────────────────┐│
│  │ 👤 KULLANICI YÖNETİMİ                   [➕ Yeni Kullanıcı]│
│  ├──────────────────────────────────────────────────────────┤│
│  │                                                          ││
│  │  AD          │ E-POSTA            │ ROL    │ DURUM │ İŞ  ││
│  │  ────────────┼────────────────────┼────────┼───────┼──── ││
│  │  Yönetici    │ admin@isletme.com  │ Admin  │ Aktif │[···]││
│  │  Ali Personel│ ali@isletme.com    │ Personel│Aktif │[···]││
│  │                                                          ││
│  └──────────────────────────────────────────────────────────┘│
│                                                              │
│  ┌──────────────────────────────────────────────────────────┐│
│  │ 🔐 ŞİFRE DEĞİŞTİR                                        ││
│  ├──────────────────────────────────────────────────────────┤│
│  │  Mevcut Şifre  [••••••••]                                ││
│  │  Yeni Şifre    [••••••••]                                ││
│  │  Tekrar        [••••••••]                                ││
│  │                                          [💾 Değiştir]   ││
│  └──────────────────────────────────────────────────────────┘│
│                                                              │
└──────────────────────────────────────────────────────────────┘
```

---

## Kullanıcı Akışları

### Akış 1: Yeni Sipariş Oluşturma

```
┌─────────────┐    ┌─────────────┐    ┌─────────────┐    ┌─────────────┐
│  Dashboard  │───▶│   Müşteri   │───▶│    Ürün     │───▶│   Ödeme     │
│  veya       │    │   Seçimi    │    │   Ekleme    │    │   Bilgisi   │
│  Müşteri    │    │             │    │             │    │             │
│  Sayfası    │    │ - Arama     │    │ - Arama     │    │ - Tip       │
│             │    │ - Seç       │    │ - Miktar    │    │ - Tarih     │
│ [+Sipariş]  │    │ - Yeni ekle │    │ - Fiyat     │    │ - Not       │
└─────────────┘    └─────────────┘    └─────────────┘    └─────────────┘
                                                                │
                                                                ▼
┌─────────────┐    ┌─────────────┐    ┌─────────────┐    ┌─────────────┐
│   Müşteri   │◀───│   Sipariş   │◀───│    Fiş      │◀───│   Kaydet    │
│   Geçmişi   │    │   Detayı    │    │   Yazdır    │    │   veya      │
│   Güncell.  │    │             │    │   / PDF     │    │   Yazdır    │
└─────────────┘    └─────────────┘    └─────────────┘    └─────────────┘
```

### Akış 2: Müşteri Sipariş Geçmişini Görüntüleme

```
┌─────────────┐    ┌─────────────┐    ┌─────────────┐    ┌─────────────┐
│  Müşteri    │───▶│   Müşteri   │───▶│   Sipariş   │───▶│    Fiş      │
│  Listesi    │    │   Detayı    │    │   Detayı    │    │   Görünt.   │
│             │    │             │    │             │    │   / Yazdır  │
│ - Arama     │    │ - Bilgiler  │    │ - Ürünler   │    │             │
│ - Filtre    │    │ - Geçmiş    │    │ - Fiyatlar  │    │             │
└─────────────┘    └─────────────┘    └─────────────┘    └─────────────┘
```

### Akış 3: Sipariş Düzenleme

```
┌─────────────┐    ┌─────────────┐    ┌─────────────┐    ┌─────────────┐
│  Sipariş    │───▶│   Sipariş   │───▶│   Düzenle   │───▶│   Kaydet    │
│  Listesi    │    │   Detayı    │    │   Formu     │    │   & Güncelle│
│             │    │             │    │             │    │             │
│ veya        │    │ [Düzenle]   │    │ - Ürün +-   │    │ Eski fiş    │
│ Müşteri     │    │             │    │ - Fiyat     │    │ geçersiz,   │
│ Geçmişi     │    │             │    │ - Not       │    │ yeni yazdır │
└─────────────┘    └─────────────┘    └─────────────┘    └─────────────┘
```

---

## Bileşen Kütüphanesi

### Temel UI Bileşenleri

| Bileşen | Açıklama | Erişilebilirlik |
|---------|----------|-----------------|
| `Button` | Ana, ikincil, tehlike varyantları | Min 44x44px touch target |
| `Input` | Metin, sayı, tarih, telefon maskeleri | 16px+ font, yüksek kontrast |
| `Select` | Dropdown, aranabilir | Klavye navigasyonu |
| `Table` | Sıralanabilir, sayfalanabilir | Responsive - mobilde kart görünümü |
| `Card` | Bilgi kartları | Geniş padding, net sınırlar |
| `Modal` | Dialog pencereleri | Focus trap, ESC ile kapatma |
| `Toast` | Bildirimler | 4+ saniye görünür, kontrast |
| `Tabs` | Sekme navigasyonu | ARIA labels |
| `SearchInput` | Arama alanı (debounced) | Temizle butonu |
| `DatePicker` | Tarih seçici (Türkçe) | Manuel giriş desteği |
| `NumberInput` | Sayı girişi (+/- butonları) | Büyük dokunma hedefi |
| `Pagination` | Sayfalama | Büyük butonlar |
| `EmptyState` | Boş durum gösterimi | Yardımcı mesajlar |
| `LoadingSpinner` | Yüklenme göstergesi | Screen reader text |
| `ConfirmDialog` | Silme onayı | Açık Türkçe mesajlar |

### Layout Bileşenleri

| Bileşen | Açıklama |
|---------|----------|
| `AppShell` | Ana sayfa yapısı (sidebar + header + content) |
| `Sidebar` | Sol navigasyon menüsü (collapse edilebilir) |
| `Header` | Üst bar (kullanıcı bilgisi, bildirimler) |
| `MobileNav` | Mobil alt navigasyon |
| `PageHeader` | Sayfa başlığı + aksiyonlar |
| `PageContainer` | İçerik sarmalayıcı (max-width, padding) |

### Özel Bileşenler

| Bileşen | Açıklama |
|---------|----------|
| `CustomerSelector` | Müşteri arama ve seçme |
| `ProductSelector` | Ürün arama ve seçme |
| `OrderItemRow` | Sipariş satırı (ürün, miktar, fiyat) |
| `PriceInput` | Para birimi formatlı giriş |
| `ReceiptPreview` | Fiş önizleme |
| `StatCard` | Dashboard istatistik kartı |
| `OrderStatusBadge` | Sipariş durumu etiketi |
| `PaymentTypeBadge` | Ödeme tipi etiketi |
| `CustomerCard` | Müşteri bilgi kartı (mobil) |
| `ProductCard` | Ürün bilgi kartı (mobil) |
| `OrderCard` | Sipariş özet kartı (mobil) |

---

## Responsive Tasarım Breakpoints

```css
/* Tailwind varsayılan breakpoints */
sm: 640px   /* Büyük telefon */
md: 768px   /* Tablet dikey */
lg: 1024px  /* Tablet yatay / küçük laptop */
xl: 1280px  /* Desktop */
2xl: 1536px /* Geniş ekran */
```

### Responsive Davranışlar

| Ekran | Sidebar | Tablo | Kartlar | Navigasyon |
|-------|---------|-------|---------|------------|
| < 768px (Mobil) | Gizli (drawer) | Kart görünümü | Tek sütun | Alt bar |
| 768px - 1024px (Tablet) | Daraltılmış (ikonlar) | Tablo | 2 sütun | Sidebar |
| > 1024px (Desktop) | Tam genişlik | Tablo | 3-4 sütun | Sidebar |

---

## Erişilebilirlik Gereksinimleri

### Görsel
- Minimum font boyutu: 16px (gövde), 14px (etiketler)
- Kontrast oranı: minimum 4.5:1 (AA standart)
- Tıklanabilir alan: minimum 44x44 piksel
- Renk körü dostu palet (sadece renge bağlı bilgi yok)

### Klavye
- Tab navigasyonu tüm interaktif öğelerde
- Focus göstergesi net ve görünür
- ESC ile modalları kapatma
- Enter ile formları gönderme

### Ekran Okuyucu
- Semantik HTML (heading hiyerarşisi)
- ARIA etiketleri
- Form alanlarında label bağlantısı
- Hata mesajları aria-live

---

## Güvenlik Gereksinimleri

1. **Kimlik Doğrulama**
   - JWT tabanlı oturum (httpOnly cookie)
   - Şifre hashleme (bcrypt, salt rounds: 12)
   - Rate limiting (login denemelerinde)
   - CSRF koruması

2. **Yetkilendirme**
   - Rol tabanlı erişim kontrolü (RBAC)
   - API route koruması (middleware)
   - Veri izolasyonu (multi-tenant hazırlığı)

3. **Veri Güvenliği**
   - HTTPS zorunlu
   - SQL injection koruması (Prisma ORM)
   - XSS koruması (React default escaping)
   - Input validasyonu (Zod şemaları)

---

## MVP Planı

### Faz 1: Temel Altyapı (Hafta 1-2)

**Hedef:** Çalışan bir iskelet uygulama

- [ ] Proje kurulumu (Next.js, TypeScript, Tailwind)
- [ ] Veritabanı şeması ve Prisma kurulumu
- [ ] Kimlik doğrulama sistemi (login/logout)
- [ ] Temel layout (sidebar, header, responsive shell)
- [ ] Ana sayfa (boş dashboard)

**Çıktı:** Giriş yapılabilen, navigasyonu olan boş uygulama

---

### Faz 2: Müşteri Yönetimi (Hafta 3)

**Hedef:** Tam fonksiyonel müşteri CRUD

- [ ] Müşteri listesi sayfası
- [ ] Müşteri ekleme formu
- [ ] Müşteri düzenleme
- [ ] Müşteri silme (onay dialogu)
- [ ] Müşteri arama/filtreleme
- [ ] Müşteri detay sayfası

**Çıktı:** Müşteri yönetimi tamamlanmış

---

### Faz 3: Ürün Yönetimi (Hafta 4)

**Hedef:** Tam fonksiyonel ürün CRUD

- [ ] Ürün listesi sayfası
- [ ] Ürün ekleme formu (alış/satış fiyatı)
- [ ] Ürün düzenleme
- [ ] Ürün silme
- [ ] Ürün arama/filtreleme
- [ ] Kategori yönetimi

**Çıktı:** Ürün yönetimi tamamlanmış

---

### Faz 4: Sipariş Sistemi (Hafta 5-6)

**Hedef:** Sipariş oluşturma ve görüntüleme

- [ ] Yeni sipariş formu
  - [ ] Müşteri seçici
  - [ ] Ürün seçici ve ekleme
  - [ ] Miktar ve fiyat düzenleme
  - [ ] Ödeme tipi ve notlar
  - [ ] Toplam hesaplama
- [ ] Sipariş listesi sayfası
- [ ] Sipariş detay sayfası
- [ ] Sipariş düzenleme
- [ ] Sipariş silme
- [ ] Müşteri sipariş geçmişi entegrasyonu

**Çıktı:** Sipariş sistemi tamamlanmış

---

### Faz 5: Fiş ve Yazdırma (Hafta 7)

**Hedef:** Fiş görüntüleme ve yazdırma

- [ ] Fiş şablonu tasarımı (Türkçe)
- [ ] Fiş önizleme bileşeni
- [ ] Tarayıcı yazdırma entegrasyonu
- [ ] PDF oluşturma ve indirme
- [ ] İşletme bilgileri ayarları (fiş için)

**Çıktı:** MVP tamamlanmış, kullanılabilir uygulama

---

### Faz 6: İyileştirmeler (Hafta 8)

**Hedef:** Polish ve UX iyileştirmeleri

- [ ] Dashboard istatistikleri
- [ ] Yükleme durumları (skeleton)
- [ ] Hata işleme ve mesajları
- [ ] Boş durum ekranları
- [ ] Mobil optimizasyonlar
- [ ] Performans iyileştirmeleri
- [ ] Test ve hata düzeltmeleri

**Çıktı:** Production-ready MVP

---

## Gelecek Geliştirmeler (Post-MVP)

### Versiyon 1.1 - Raporlama
- Satış raporları
- Kar/zarar analizi
- Grafik ve görselleştirmeler
- Excel/CSV dışa aktarma

### Versiyon 1.2 - Gelişmiş Özellikler
- Stok takibi
- Düşük stok uyarıları
- Çoklu kullanıcı (personel hesapları)
- Rol tabanlı izinler

### Versiyon 1.3 - Entegrasyonlar
- E-fatura entegrasyonu
- SMS bildirim (sipariş onayı)
- E-posta gönderimi (fiş)
- Yedekleme sistemi

### Versiyon 2.0 - Genişleme
- Çoklu dil desteği
- Çoklu işletme (franchise)
- Müşteri portalı
- Mobil uygulama (React Native)

---

## Proje Yapısı

```
project/
├── prisma/
│   ├── schema.prisma         # Veritabanı şeması
│   ├── seed.ts               # Seed verileri
│   └── migrations/           # Migrasyon dosyaları
│
├── src/
│   ├── app/                  # Next.js App Router
│   │   ├── (auth)/           # Auth route grubu
│   │   │   ├── login/
│   │   │   └── layout.tsx
│   │   │
│   │   ├── (dashboard)/      # Ana uygulama route grubu
│   │   │   ├── page.tsx      # Dashboard
│   │   │   ├── customers/
│   │   │   │   ├── page.tsx
│   │   │   │   ├── [id]/
│   │   │   │   │   └── page.tsx
│   │   │   │   └── new/
│   │   │   │       └── page.tsx
│   │   │   ├── products/
│   │   │   ├── orders/
│   │   │   ├── reports/
│   │   │   ├── settings/
│   │   │   └── layout.tsx
│   │   │
│   │   ├── api/              # API Routes
│   │   │   ├── auth/
│   │   │   ├── customers/
│   │   │   ├── products/
│   │   │   ├── orders/
│   │   │   └── reports/
│   │   │
│   │   ├── layout.tsx        # Root layout
│   │   └── globals.css       # Global stiller
│   │
│   ├── components/
│   │   ├── ui/               # shadcn/ui bileşenleri
│   │   │   ├── button.tsx
│   │   │   ├── input.tsx
│   │   │   ├── table.tsx
│   │   │   └── ...
│   │   │
│   │   ├── layout/           # Layout bileşenleri
│   │   │   ├── app-shell.tsx
│   │   │   ├── sidebar.tsx
│   │   │   ├── header.tsx
│   │   │   └── mobile-nav.tsx
│   │   │
│   │   ├── customers/        # Müşteri bileşenleri
│   │   │   ├── customer-list.tsx
│   │   │   ├── customer-form.tsx
│   │   │   ├── customer-card.tsx
│   │   │   └── customer-selector.tsx
│   │   │
│   │   ├── products/         # Ürün bileşenleri
│   │   │   ├── product-list.tsx
│   │   │   ├── product-form.tsx
│   │   │   └── product-selector.tsx
│   │   │
│   │   ├── orders/           # Sipariş bileşenleri
│   │   │   ├── order-list.tsx
│   │   │   ├── order-form.tsx
│   │   │   ├── order-item-row.tsx
│   │   │   └── receipt-preview.tsx
│   │   │
│   │   └── shared/           # Ortak bileşenler
│   │       ├── search-input.tsx
│   │       ├── pagination.tsx
│   │       ├── confirm-dialog.tsx
│   │       ├── empty-state.tsx
│   │       └── stat-card.tsx
│   │
│   ├── lib/
│   │   ├── prisma.ts         # Prisma client
│   │   ├── auth.ts           # Auth yardımcıları
│   │   ├── utils.ts          # Genel yardımcılar
│   │   └── validations/      # Zod şemaları
│   │       ├── customer.ts
│   │       ├── product.ts
│   │       └── order.ts
│   │
│   ├── hooks/                # Custom hooks
│   │   ├── use-customers.ts
│   │   ├── use-products.ts
│   │   └── use-orders.ts
│   │
│   ├── types/                # TypeScript tipleri
│   │   └── index.ts
│   │
│   └── i18n/                 # Çeviri dosyaları
│       └── tr.json
│
├── public/
│   └── logo.png
│
├── .env                      # Environment değişkenleri
├── .env.example
├── package.json
├── tsconfig.json
├── tailwind.config.ts
├── next.config.js
└── README.md
```

---

## Ortam Değişkenleri

```env
# .env.example

# Database
DATABASE_URL="postgresql://user:password@localhost:5432/isletme_db"

# NextAuth
NEXTAUTH_SECRET="your-secret-key-here"
NEXTAUTH_URL="http://localhost:3000"

# App
NEXT_PUBLIC_APP_NAME="İşletme Yönetim Sistemi"
NEXT_PUBLIC_APP_URL="http://localhost:3000"
```

---

## Başlangıç Komutları

```bash
# Proje kurulumu
npx create-next-app@latest isletme-yonetim --typescript --tailwind --eslint --app --src-dir

# Bağımlılıkları yükle
npm install @prisma/client @tanstack/react-query zod react-hook-form @hookform/resolvers next-auth bcryptjs
npm install @react-pdf/renderer react-to-print date-fns
npm install -D prisma @types/bcryptjs

# shadcn/ui kurulumu
npx shadcn@latest init
npx shadcn@latest add button input table card dialog select tabs toast

# Prisma kurulumu
npx prisma init
npx prisma db push
npx prisma generate
npx prisma db seed

# Geliştirme sunucusunu başlat
npm run dev
```

---

## Sonuç

Bu şartname belgesi, küçük işletmeler için tasarlanan satış ve sipariş yönetim sisteminin tam bir mavi baskısını (blueprint) sunmaktadır. 

**Temel Özellikler:**
- ✅ Türkçe arayüz
- ✅ Responsive tasarım (mobil, tablet, masaüstü)
- ✅ Erişilebilir UI (yaşlı kullanıcılar için)
- ✅ Müşteri, ürün ve sipariş yönetimi
- ✅ Esnek fiyatlandırma (müşteriye/siparişe özel)
- ✅ Fiş yazdırma ve PDF dışa aktarma
- ✅ Genişletilebilir mimari

**MVP Tahmini Süre:** 8 hafta (tek geliştirici)

**Teknoloji Seçimi Gerekçesi:**
- Next.js: Hızlı geliştirme, SSR, API routes
- PostgreSQL: Güvenilir, ilişkisel veri
- Prisma: Type-safe, kolay migration
- Tailwind + shadcn/ui: Hızlı UI geliştirme, erişilebilirlik
- TanStack Query: Verimli veri yönetimi

Bu belge, geliştirme sürecinde referans olarak kullanılmalı ve gerektiğinde güncellenmelidir.

---

*Belge Versiyonu: 1.0*  
*Son Güncelleme: 27 Kasım 2024*

