# 🔍 Debug Steps for 500 Errors

## Step 1: Test Database Connection

Visit this URL in your browser:
```
https://your-site.netlify.app/api/test-db
```

This will show you:
- Is DATABASE_URL set?
- Is the format correct?
- Can we connect to the database?
- What's the exact error?

## Step 2: Check the Response

Look for these in the response:

### ✅ Good Response:
```json
{
  "success": true,
  "message": "Database connection successful",
  "userCount": 0,
  "businessCount": 0
}
```

### ❌ If DATABASE_URL is missing:
```json
{
  "success": false,
  "hasDatabaseUrl": false,
  "error": "..."
}
```
**Fix:** Add DATABASE_URL to Netlify environment variables

### ❌ If format is wrong:
```json
{
  "success": false,
  "hasDatabaseUrl": true,
  "databaseUrlFormat": "invalid",
  "error": "URL must start with postgresql://"
}
```
**Fix:** Check DATABASE_URL format in Netlify

### ❌ If schema doesn't exist:
```json
{
  "success": false,
  "error": "relation \"User\" does not exist"
}
```
**Fix:** Run `npx prisma db push` (see Step 3)

## Step 3: Push Database Schema

If you get "relation does not exist" error:

### Option A: Using Netlify CLI

```bash
# Install Netlify CLI
npm install -g netlify-cli

# Login
netlify login

# Link to your site
netlify link

# Pull environment variables
netlify env:get DATABASE_URL

# Set locally (copy the value from Netlify)
export DATABASE_URL="your-connection-string-here"

# Push schema
npx prisma db push
```

### Option B: Direct Connection

```bash
# Set DATABASE_URL
export DATABASE_URL="postgresql://neondb_owner:npg_nS0BJ6yuowxt@ep-cool-breeze-ag565esl-pooler.c-2.eu-central-1.aws.neon.tech/neondb?sslmode=require"

# Push schema
npx prisma db push
```

## Step 4: Verify Environment Variable in Netlify

1. Go to Netlify Dashboard
2. Site settings → Environment variables
3. Check `DATABASE_URL`:
   - ✅ Exists
   - ✅ Value starts with `postgresql://`
   - ✅ No extra quotes or spaces
   - ✅ Full connection string (not truncated)

## Step 5: Check Netlify Function Logs

1. Netlify Dashboard → Functions → View logs
2. Look for errors
3. Check the exact error message

## Step 6: Common Issues

### Issue: "relation does not exist"
**Cause:** Database schema not pushed
**Fix:** Run `npx prisma db push`

### Issue: "connection refused"
**Cause:** Wrong connection string or database down
**Fix:** Check Neon dashboard, verify connection string

### Issue: "invalid authentication"
**Cause:** Wrong password in connection string
**Fix:** Get new connection string from Neon

### Issue: DATABASE_URL not found
**Cause:** Environment variable not set or deployment not triggered
**Fix:** Set DATABASE_URL and trigger new deployment

## Step 7: Redeploy

After making changes:
1. Netlify Dashboard → Deploys
2. Click "Trigger deploy" → "Deploy site"
3. Wait for deployment to complete (2-5 minutes)
4. Test again

## Quick Checklist

- [ ] `/api/test-db` endpoint tested
- [ ] DATABASE_URL exists in Netlify
- [ ] DATABASE_URL format is correct (postgresql://...)
- [ ] New deployment triggered after adding DATABASE_URL
- [ ] Database schema pushed (`npx prisma db push`)
- [ ] Neon database is active
- [ ] Connection string is current (not expired)
