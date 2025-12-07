# 🔧 Troubleshooting 500 Errors

Build başarılı ama hala 500 hatası alıyorsanız, aşağıdaki adımları takip edin:

## 1. DATABASE_URL Kontrolü

Netlify Dashboard'da:
- Site settings > Environment variables
- `DATABASE_URL` var mı kontrol edin
- Format: `postgresql://user:password@host:5432/dbname?sslmode=require`

## 2. Test Endpoint

Şu URL'yi açın (site URL'nizi kullanın):
```
https://your-site.netlify.app/api/test-db
```

Bu size şunları gösterecek:
- Database bağlantısı çalışıyor mu?
- DATABASE_URL set edilmiş mi?
- Gerçek hata mesajı nedir?

## 3. Netlify Function Logs

Netlify Dashboard'da:
- Functions > View logs
- Hangi API'de hata var?
- Hata mesajı nedir?

## 4. Database Schema

Eğer DATABASE_URL doğruysa, veritabanı şeması güncel olmayabilir:

```bash
# Netlify CLI ile
netlify link
export DATABASE_URL="your-connection-string"
npx prisma db push
```

## 5. Yaygın Sorunlar

1. **DATABASE_URL eksik**: En yaygın sorun
2. **Yanlış connection string**: Format kontrol edin
3. **Database şeması uyumsuz**: `paidAt` field eksik olabilir
4. **Prisma client eski**: Build sırasında generate ediliyor mu?

## Sonraki Adımlar

1. `/api/test-db` endpoint'ini test edin
2. Netlify Function logs'u kontrol edin
3. DATABASE_URL'i doğrulayın
4. Gerekirse database schema'yı push edin
