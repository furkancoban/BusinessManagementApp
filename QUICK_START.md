# 🚀 Hızlı Başlangıç Kılavuzu

## İşletme Satış ve Sipariş Yönetim Sistemi

---

## 📁 Proje Dosyaları

| Dosya | İçerik |
|-------|--------|
| `SPECIFICATION.md` | Detaylı teknik şartname (tam blueprint) |
| `DATABASE_SCHEMA.sql` | PostgreSQL veritabanı şeması ve örnek veriler |
| `QUICK_START.md` | Bu dosya - hızlı başvuru kılavuzu |

---

## 🎯 Proje Özeti

**Ne:** Küçük işletmeler için müşteri, ürün ve sipariş yönetim sistemi  
**Dil:** Türkçe  
**Platform:** Web (responsive - masaüstü, tablet, mobil)  
**Hedef Kullanıcı:** İşletme sahipleri, yaşlı kullanıcı dostu

---

## ⚡ 5 Dakikada Kurulum

```bash
# 1. Next.js projesi oluştur
npx create-next-app@latest isletme-yonetim --typescript --tailwind --eslint --app --src-dir

# 2. Proje klasörüne gir
cd isletme-yonetim

# 3. Bağımlılıkları yükle
npm install @prisma/client @tanstack/react-query zod react-hook-form @hookform/resolvers next-auth bcryptjs @react-pdf/renderer react-to-print date-fns lucide-react
npm install -D prisma @types/bcryptjs

# 4. shadcn/ui kur
npx shadcn@latest init
npx shadcn@latest add button input label card table dialog select tabs toast dropdown-menu avatar badge separator skeleton

# 5. Prisma başlat
npx prisma init

# 6. .env dosyasını düzenle (DATABASE_URL ekle)

# 7. Veritabanını oluştur
npx prisma db push

# 8. Başlat
npm run dev
```

---

## 🗂️ Ana Özellikler (Checklist)

### MVP (İlk Sürüm) ✅
- [ ] Kullanıcı girişi (Admin)
- [ ] Müşteri CRUD (Oluştur, Oku, Güncelle, Sil)
- [ ] Ürün CRUD (alış/satış fiyatı dahil)
- [ ] Sipariş oluşturma (müşteri seç, ürün ekle, fiyat ayarla)
- [ ] Sipariş geçmişi görüntüleme
- [ ] Fiş yazdırma / PDF

### Gelecek Sürümler 🔮
- [ ] Dashboard istatistikleri
- [ ] Raporlar ve grafikler
- [ ] Stok takibi
- [ ] Çoklu kullanıcı (personel hesapları)
- [ ] Excel/CSV dışa aktarma
- [ ] E-fatura entegrasyonu

---

## 🏗️ Mimari Özet

```
┌─────────────────────────────────────────────────────┐
│                    FRONTEND                          │
│              (Next.js + React + Tailwind)            │
├─────────────────────────────────────────────────────┤
│                    API LAYER                         │
│              (Next.js API Routes)                    │
├─────────────────────────────────────────────────────┤
│                    DATABASE                          │
│              (PostgreSQL + Prisma ORM)               │
└─────────────────────────────────────────────────────┘
```

---

## 📊 Veri Modeli (Basitleştirilmiş)

```
Users (Kullanıcılar)
  └── id, email, password, name, role

Customers (Müşteriler)
  └── id, name, phone, email, address, notes

Products (Ürünler)
  └── id, name, sku, purchasePrice, sellPrice, category

Orders (Siparişler)
  └── id, orderNumber, customerId, totalAmount, paymentType, status

OrderItems (Sipariş Satırları)
  └── id, orderId, productId, quantity, unitPrice, subtotal
```

**Önemli:** `unitPrice` (siparişteki satış fiyatı) her sipariş için ayrı saklanır - böylece aynı ürün farklı müşterilere farklı fiyatla satılabilir!

---

## 🖥️ Ekranlar

| Sayfa | URL | Açıklama |
|-------|-----|----------|
| Giriş | `/login` | Kullanıcı girişi |
| Dashboard | `/` | Ana sayfa, özet istatistikler |
| Müşteriler | `/customers` | Müşteri listesi |
| Müşteri Detay | `/customers/[id]` | Müşteri bilgisi + sipariş geçmişi |
| Ürünler | `/products` | Ürün listesi |
| Siparişler | `/orders` | Tüm siparişler |
| Yeni Sipariş | `/orders/new` | Sipariş oluşturma formu |
| Sipariş Detay | `/orders/[id]` | Sipariş detayı + fiş |
| Ayarlar | `/settings` | İşletme bilgileri, kullanıcı yönetimi |

---

## 🔌 API Endpoints

```
POST   /api/auth/login          # Giriş
POST   /api/auth/logout         # Çıkış

GET    /api/customers           # Müşteri listesi
POST   /api/customers           # Müşteri oluştur
GET    /api/customers/:id       # Müşteri detay
PUT    /api/customers/:id       # Müşteri güncelle
DELETE /api/customers/:id       # Müşteri sil

GET    /api/products            # Ürün listesi
POST   /api/products            # Ürün oluştur
GET    /api/products/:id        # Ürün detay
PUT    /api/products/:id        # Ürün güncelle
DELETE /api/products/:id        # Ürün sil

GET    /api/orders              # Sipariş listesi
POST   /api/orders              # Sipariş oluştur
GET    /api/orders/:id          # Sipariş detay
PUT    /api/orders/:id          # Sipariş güncelle
DELETE /api/orders/:id          # Sipariş sil
GET    /api/orders/:id/receipt  # Fiş PDF
```

---

## 🎨 UI/UX Prensipleri

### Erişilebilirlik (Yaşlı Kullanıcılar İçin)
- ✅ Minimum font boyutu: **16px**
- ✅ Yüksek kontrast renk şeması
- ✅ Büyük tıklama alanları: **44x44px**
- ✅ Net, anlaşılır Türkçe etiketler
- ✅ Onay dialogları (silme işlemlerinde)

### Responsive Tasarım
| Ekran | Davranış |
|-------|----------|
| Mobil (<768px) | Alt navigasyon, kart görünümü |
| Tablet (768-1024px) | Daraltılmış sidebar |
| Desktop (>1024px) | Tam sidebar, tablo görünümü |

---

## 🖨️ Fiş Formatı (Örnek)

```
═══════════════════════════════════
         ÖRNEK TİCARET
    Örnek Mah. No:1 İstanbul
       Tel: 0212 123 4567
═══════════════════════════════════
Sipariş No: SIP-2024-0156
Tarih: 27.11.2024 14:35

Müşteri: Ahmet Yılmaz
Tel: 0532 123 4567
───────────────────────────────────
ÜRÜN              ADET   FİYAT
───────────────────────────────────
Laptop HP           1   ₺18,500
Mouse               2   ₺250
───────────────────────────────────
ARA TOPLAM:              ₺19,000
───────────────────────────────────
GENEL TOPLAM:            ₺19,000
───────────────────────────────────
Ödeme: Kredi Kartı
Durum: ✓ Tamamlandı

    Teşekkür ederiz!
═══════════════════════════════════
```

---

## 📅 MVP Zaman Çizelgesi

| Hafta | Görev | Çıktı |
|-------|-------|-------|
| 1-2 | Altyapı kurulumu, auth | Giriş yapılabilen iskelet |
| 3 | Müşteri yönetimi | Tam CRUD |
| 4 | Ürün yönetimi | Tam CRUD |
| 5-6 | Sipariş sistemi | Sipariş oluşturma/görüntüleme |
| 7 | Fiş yazdırma | PDF ve tarayıcı yazdırma |
| 8 | Polish & test | Production-ready MVP |

**Toplam: ~8 hafta** (tek geliştirici)

---

## 🛠️ Geliştirme İpuçları

### Öncelik Sırası
1. **Auth** - Her şeyden önce giriş sistemi
2. **Müşteri** - En basit CRUD, öğrenme için iyi
3. **Ürün** - Müşteriye benzer, hızlı tamamlanır
4. **Sipariş** - En karmaşık, en sona bırak
5. **Fiş** - Sipariş bittikten sonra ekle

### Kaçınılması Gerekenler
- ❌ Over-engineering - MVP'de sadece gerekeni yap
- ❌ Erken optimizasyon - Önce çalışsın, sonra hızlandır
- ❌ Feature creep - Listeye yeni özellik ekleme

### Öneriler
- ✅ Her özellik için ayrı branch
- ✅ Commit mesajları Türkçe olabilir
- ✅ Düzenli test (en azından manuel)
- ✅ Gerçek veriyle test et

---

## 🔗 Faydalı Linkler

- [Next.js Docs](https://nextjs.org/docs)
- [Prisma Docs](https://www.prisma.io/docs)
- [shadcn/ui Components](https://ui.shadcn.com)
- [Tailwind CSS](https://tailwindcss.com/docs)
- [React Hook Form](https://react-hook-form.com)
- [TanStack Query](https://tanstack.com/query)

---

## 📝 Notlar

- Veritabanı şemasını değiştirirken `npx prisma db push` çalıştır
- Production'da `npx prisma migrate deploy` kullan
- `.env` dosyasını git'e commit'leme!
- Admin şifresi değiştirilmeli (seed'deki varsayılan: `admin123`)

---

*Detaylı bilgi için `SPECIFICATION.md` dosyasına bakın.*

