# Netlify Deployment Guide

This guide will walk you through deploying your Next.js application to Netlify step by step.

## Prerequisites

- A GitHub/GitLab/Bitbucket account with your code repository
- A Netlify account (free tier is sufficient)
- A PostgreSQL database (we'll set this up)

---

## Step 1: Set Up PostgreSQL Database

Your app currently uses SQLite for local development, but Netlify requires PostgreSQL for production.

### Option A: Neon (Recommended - Free Tier)

1. Go to [neon.tech](https://neon.tech)
2. Sign up for a free account
3. Click "Create Project"
4. Choose a name and region (closest to your users)
5. After creation, copy the **Connection String** (it looks like: `postgresql://user:password@host/dbname?sslmode=require`)

### Option B: Supabase (Alternative - Free Tier)

1. Go to [supabase.com](https://supabase.com)
2. Create a new project
3. Go to **Settings** > **Database**
4. Find **Connection string** > **URI** and copy it

### Option C: Railway, Render, or Other Providers

Any PostgreSQL provider will work. Just get your connection string ready.

---

## Step 2: Update Prisma Schema for PostgreSQL

The schema is already configured for PostgreSQL. If you want to use SQLite locally, you can:

1. Keep using PostgreSQL for both dev and production (recommended)
2. Or create a separate schema file for local development

For now, the schema is set to PostgreSQL which works for both.

---

## Step 3: Push Your Code to GitHub

If you haven't already:

```bash
git init
git add .
git commit -m "Initial commit"
git remote add origin https://github.com/yourusername/your-repo.git
git push -u origin main
```

---

## Step 4: Create Netlify Site

1. Go to [app.netlify.com](https://app.netlify.com)
2. Click **"Add new site"** > **"Import an existing project"**
3. Connect to your Git provider (GitHub/GitLab/Bitbucket)
4. Select your repository
5. Netlify will auto-detect Next.js settings:
   - **Build command**: `npm run build`
   - **Publish directory**: `.next`
   - **Node version**: 20

6. Click **"Show advanced"** and verify the settings match `netlify.toml`

7. **Don't deploy yet!** We need to set environment variables first.

---

## Step 5: Configure Environment Variables

In Netlify Dashboard:

1. Go to **Site settings** > **Environment variables**
2. Click **"Add a variable"** and add each of these:

### Required Variables

```
DATABASE_URL=postgresql://user:password@host:5432/dbname?sslmode=require
```
*(Use the connection string from Step 1)*

```
NEXTAUTH_SECRET=your-super-secret-random-string-minimum-32-characters
```
*(Generate a random string - you can use: `openssl rand -base64 32`)*

```
NEXTAUTH_URL=https://your-site-name.netlify.app
```
*(Replace `your-site-name` with your actual Netlify site name)*

### Optional Variables (for Email Features)

```
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_SECURE=false
SMTP_USER=your-email@gmail.com
SMTP_PASS=your-app-specific-password
SMTP_FROM=noreply@yourdomain.com
```

**Note**: For Gmail, you need to:
- Enable 2FA on your Google account
- Create an [App Password](https://myaccount.google.com/apppasswords)
- Use that app password (not your regular password)

---

## Step 6: Deploy

1. Go back to **Deploys** tab
2. Click **"Trigger deploy"** > **"Deploy site"**
3. Wait for the build to complete (usually 2-5 minutes)

---

## Step 7: Set Up Database Schema

After the first successful deploy:

### Option A: Using Netlify CLI (Recommended)

```bash
# Install Netlify CLI
npm install -g netlify-cli

# Login to Netlify
netlify login

# Link to your site
netlify link

# Set environment variables locally (if not already set)
netlify env:set DATABASE_URL "your-connection-string"
netlify env:set NEXTAUTH_SECRET "your-secret"
netlify env:set NEXTAUTH_URL "https://your-site.netlify.app"

# Push database schema
npx prisma db push

# (Optional) Seed with demo data
npm run db:seed
```

### Option B: Using Prisma Studio Locally

1. Set your local `.env` file with the production `DATABASE_URL`
2. Run `npx prisma db push`
3. Run `npm run db:seed` (optional)

### Option C: Using Database Provider's SQL Editor

You can run the migration SQL directly in your database provider's SQL editor.

---

## Step 8: Create First Admin User

After the database is set up, create your first admin user:

```bash
# Using the script (if you have the production DATABASE_URL in .env)
npx tsx scripts/create-business.ts "İşletme Adı" admin@email.com password123 "Admin Adı"
```

Or manually through your database provider's interface.

---

## Step 9: Verify Deployment

1. Visit your Netlify site URL
2. Try to register a new account
3. Check that emails are being sent (if SMTP is configured)
4. Test login functionality

---

## Troubleshooting

### Build Fails

- Check build logs in Netlify Dashboard
- Ensure all environment variables are set
- Verify Node version is 20
- Check that `DATABASE_URL` is correct

### Database Connection Errors

- Verify `DATABASE_URL` is correct
- Check that your database allows connections from Netlify's IPs
- Ensure SSL mode is set correctly (`?sslmode=require`)

### Authentication Issues

- Verify `NEXTAUTH_SECRET` is set and at least 32 characters
- Check that `NEXTAUTH_URL` matches your actual site URL
- Clear browser cookies and try again

### Email Not Sending

- Verify SMTP credentials are correct
- For Gmail, ensure you're using an App Password, not your regular password
- Check Netlify function logs for email errors

---

## Post-Deployment

### Custom Domain (Optional)

1. Go to **Domain settings** in Netlify
2. Click **"Add custom domain"**
3. Follow the DNS configuration instructions
4. Update `NEXTAUTH_URL` environment variable to your custom domain

### Continuous Deployment

Netlify automatically deploys when you push to your main branch. You can:
- Set up branch previews for pull requests
- Configure deploy notifications
- Set up build hooks for manual deployments

---

## Environment Variables Summary

| Variable | Required | Description |
|----------|----------|-------------|
| `DATABASE_URL` | ✅ Yes | PostgreSQL connection string |
| `NEXTAUTH_SECRET` | ✅ Yes | Secret for NextAuth (min 32 chars) |
| `NEXTAUTH_URL` | ✅ Yes | Your site URL (https://...) |
| `SMTP_HOST` | ❌ No | SMTP server hostname |
| `SMTP_PORT` | ❌ No | SMTP server port |
| `SMTP_SECURE` | ❌ No | Use TLS (true/false) |
| `SMTP_USER` | ❌ No | SMTP username |
| `SMTP_PASS` | ❌ No | SMTP password |
| `SMTP_FROM` | ❌ No | From email address |

---

## Need Help?

- Check Netlify build logs
- Review Prisma migration status
- Verify environment variables are set correctly
- Check database connection from Netlify functions

Good luck with your deployment! 🚀

