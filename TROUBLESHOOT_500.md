# 🔍 Troubleshooting 500 Errors

Hala 500 hatası alıyorsanız, aşağıdaki adımları kontrol edin:

## 1. DATABASE_URL Kontrolü

### Netlify'da kontrol edin:
1. Site settings → Environment variables
2. `DATABASE_URL` var mı?
3. Değeri doğru mu? (Format: `postgresql://...`)

### Test endpoint'i kullanın:
```
https://your-site.netlify.app/api/test-db
```

Bu size şunları gösterecek:
- Database bağlantısı çalışıyor mu?
- DATABASE_URL set edilmiş mi?
- Gerçek hata mesajı nedir?

## 2. Deployment Yapıldı mı?

⚠️ **ÖNEMLİ:** Environment variable ekledikten SONRA:
1. Yeni bir deployment tetikleyin
2. Deployment'ın tamamlanmasını bekleyin (2-5 dakika)
3. Deployment loglarını kontrol edin

## 3. Database Schema Push Edildi mi?

Database bağlantısı çalışsa bile, tablolar oluşturulmamış olabilir.

### Netlify CLI ile push edin:

```bash
# Netlify CLI'yi kurun (eğer yoksa)
npm install -g netlify-cli

# Netlify'a login olun
netlify login

# Site'ınıza bağlanın
netlify link

# Environment variable'ları local'e çekin
netlify env:get DATABASE_URL

# Prisma schema'yı push edin
npx prisma db push
```

### Alternatif: Neon Dashboard'dan SQL ile

1. Neon Dashboard'a gidin
2. SQL Editor'ı açın
3. `prisma/migrations` klasöründeki migration dosyalarını çalıştırın

## 4. Common Errors ve Çözümleri

### Error: "relation does not exist"
**Çözüm:** Database schema push edilmemiş. `npx prisma db push` çalıştırın.

### Error: "connection refused" veya "timeout"
**Çözüm:** 
- Connection string'i kontrol edin
- Neon database'iniz aktif mi?
- IP whitelist kontrolü yapın (eğer varsa)

### Error: "invalid authentication"
**Çözüm:**
- Connection string'deki şifreyi kontrol edin
- Neon dashboard'dan yeni bir connection string alın

### Error: "DATABASE_URL must start with postgresql://"
**Çözüm:**
- Connection string formatını kontrol edin
- Tırnak işaretleri olmamalı
- `psql` komutu olmamalı

## 5. Netlify Function Logs

Netlify Dashboard'da:
1. Functions → View logs
2. Hangi endpoint'te hata var?
3. Tam hata mesajı nedir?

## 6. Test Adımları

Sırayla test edin:

### Step 1: DATABASE_URL var mı?
```bash
curl https://your-site.netlify.app/api/test-db
```

Response'da `hasDatabaseUrl: true` olmalı.

### Step 2: Database bağlantısı çalışıyor mu?
Response'da `success: true` olmalı.

### Step 3: Schema push edildi mi?
Eğer `success: false` ve "relation does not exist" hatası alıyorsanız, schema push edilmemiş.

## 7. Quick Fix Checklist

- [ ] DATABASE_URL Netlify'da set edilmiş
- [ ] Format doğru (`postgresql://...`)
- [ ] Environment variable ekledikten sonra deployment yapıldı
- [ ] Database schema push edildi (`npx prisma db push`)
- [ ] Neon database aktif
- [ ] Connection string güncel (eski değil)
- [ ] Test endpoint'i çalışıyor (`/api/test-db`)

## 8. Hala Sorun Varsa

1. Test endpoint'inden tam hata mesajını alın
2. Netlify Function logs'u kontrol edin
3. Neon dashboard'da database connection'ı test edin
4. Yeni bir connection string deneyin
