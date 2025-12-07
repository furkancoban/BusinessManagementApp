# 📝 DATABASE_URL Setup for Netlify

## Your Connection String

Your Neon PostgreSQL connection string is:
```
postgresql://neondb_owner:npg_nS0BJ6yuowxt@ep-cool-breeze-ag565esl-pooler.c-2.eu-central-1.aws.neon.tech/neondb?sslmode=require&channel_binding=require
```

## ⚠️ Important Notes

1. **Remove `psql` and quotes** - Netlify needs only the URL part
2. **Recommended format** - Remove `channel_binding=require` parameter (it can cause issues)

## ✅ Use This in Netlify

Copy this EXACT value to Netlify environment variable:

```
postgresql://neondb_owner:npg_nS0BJ6yuowxt@ep-cool-breeze-ag565esl-pooler.c-2.eu-central-1.aws.neon.tech/neondb?sslmode=require
```

Or if you want to keep channel_binding:

```
postgresql://neondb_owner:npg_nS0BJ6yuowxt@ep-cool-breeze-ag565esl-pooler.c-2.eu-central-1.aws.neon.tech/neondb?sslmode=require&channel_binding=require
```

## 📋 Steps to Add to Netlify

1. Go to **Netlify Dashboard**
2. Select your site
3. Go to **Site settings** → **Environment variables**
4. Click **"Add a variable"**
5. **Key:** `DATABASE_URL`
6. **Value:** Paste one of the URLs above (recommended: without channel_binding)
7. Click **"Save"**
8. **Trigger a new deployment** (Deploys → Trigger deploy → Deploy site)

## 🧪 Test After Deploy

After deployment completes, test the connection:
```
https://your-site.netlify.app/api/test-db
```

Expected response:
```json
{
  "success": true,
  "message": "Database connection successful",
  "userCount": 0,
  "businessCount": 0
}
```

## 🔐 Security Note

⚠️ **IMPORTANT:** Your connection string contains credentials. Make sure:
- It's only stored in Netlify environment variables (not in code)
- You don't share this URL publicly
- If exposed, regenerate it in Neon dashboard
