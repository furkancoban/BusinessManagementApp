# Netlify Deployment Checklist

Quick reference checklist for deploying to Netlify.

## Pre-Deployment

- [ ] Code is pushed to GitHub/GitLab/Bitbucket
- [ ] PostgreSQL database is created (Neon, Supabase, etc.)
- [ ] Database connection string is ready
- [ ] Prisma schema is set to PostgreSQL (already done ✅)

## Netlify Setup

- [ ] Create new site on Netlify
- [ ] Connect to your Git repository
- [ ] Verify build settings (auto-detected from `netlify.toml`)

## Environment Variables

Add these in Netlify Dashboard > Site settings > Environment variables:

- [ ] `DATABASE_URL` - PostgreSQL connection string
- [ ] `NEXTAUTH_SECRET` - Random 32+ character string
- [ ] `NEXTAUTH_URL` - Your Netlify site URL (https://...)
- [ ] `SMTP_HOST` - (Optional) Email server
- [ ] `SMTP_PORT` - (Optional) Email port
- [ ] `SMTP_USER` - (Optional) Email username
- [ ] `SMTP_PASS` - (Optional) Email password
- [ ] `SMTP_FROM` - (Optional) From email address

## Deploy

- [ ] Trigger first deployment
- [ ] Wait for build to complete
- [ ] Check build logs for errors

## Database Setup

- [ ] Run `npx prisma db push` to create tables
- [ ] (Optional) Run `npm run db:seed` for demo data
- [ ] Create first admin user

## Verify

- [ ] Site loads correctly
- [ ] Can register new account
- [ ] Can login
- [ ] Database operations work
- [ ] (If configured) Emails are sent

## Post-Deployment

- [ ] (Optional) Set up custom domain
- [ ] Update `NEXTAUTH_URL` if using custom domain
- [ ] Test all major features
- [ ] Monitor Netlify function logs

---

**Need detailed instructions?** See [DEPLOYMENT.md](./DEPLOYMENT.md)

