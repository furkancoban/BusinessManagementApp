# Quick Deploy Guide - Step by Step

Follow these steps to deploy your app to Netlify in about 10 minutes.

## Step 1: Create PostgreSQL Database (2 minutes)

1. Go to **https://neon.tech** (or https://supabase.com)
2. Click **"Sign Up"** (free account)
3. Click **"Create Project"**
4. Choose a name and region
5. Click **"Create Project"**
6. Copy the **Connection String** (looks like: `postgresql://user:pass@host/db?sslmode=require`)
   - Click on your project → **Connection Details** → Copy the connection string

**Save this connection string - you'll need it in Step 4!**

---

## Step 2: Push Code to GitHub (2 minutes)

If you haven't already:

```bash
# Add your GitHub remote (replace with your actual repo URL)
git remote add origin https://github.com/YOUR_USERNAME/YOUR_REPO.git

# Push to GitHub
git add .
git commit -m "Ready for Netlify deployment"
git branch -M main
git push -u origin main
```

**Don't have a GitHub repo yet?**
1. Go to https://github.com/new
2. Create a new repository
3. Copy the repository URL
4. Use it in the command above

---

## Step 3: Create Netlify Site (1 minute)

1. Go to **https://app.netlify.com**
2. Click **"Sign up"** (free account) or **"Log in"**
3. Click **"Add new site"** → **"Import an existing project"**
4. Click **"GitHub"** (or your Git provider)
5. Authorize Netlify to access your repositories
6. Select your repository
7. Netlify will auto-detect settings - **click "Deploy site"**

**Wait for the first build to complete** (it will fail - that's OK, we need to add environment variables first)

---

## Step 4: Configure Environment Variables (2 minutes)

1. In Netlify, go to **Site settings** → **Environment variables**
2. Click **"Add a variable"** and add these one by one:

### Required Variables:

**DATABASE_URL**
```
postgresql://user:password@host:5432/dbname?sslmode=require
```
*(Paste the connection string from Step 1)*

**NEXTAUTH_SECRET**
```
4j3HWGvrEIYeEsEt6/vQL+DHsPZlCUy9f21/Tsz3Ibc=
```
*(Or generate your own with: `openssl rand -base64 32`)*

**NEXTAUTH_URL**
```
https://YOUR-SITE-NAME.netlify.app
```
*(Replace YOUR-SITE-NAME with your actual Netlify site name - you can find it in the site URL)*

### Optional (for email features):

**SMTP_HOST**
```
smtp.gmail.com
```

**SMTP_PORT**
```
587
```

**SMTP_USER**
```
your-email@gmail.com
```

**SMTP_PASS**
```
your-app-password
```
*(For Gmail: Enable 2FA, then create App Password at https://myaccount.google.com/apppasswords)*

**SMTP_FROM**
```
noreply@yourdomain.com
```

3. After adding all variables, go to **Deploys** tab
4. Click **"Trigger deploy"** → **"Deploy site"**
5. Wait for build to complete (2-5 minutes)

---

## Step 5: Set Up Database (2 minutes)

After the build succeeds:

### Option A: Using Netlify CLI (Recommended)

```bash
# Install Netlify CLI (if not installed)
npm install -g netlify-cli

# Login
netlify login

# Link to your site
netlify link

# Set DATABASE_URL locally (use the same one from Step 4)
export DATABASE_URL="postgresql://user:pass@host/db?sslmode=require"

# Push database schema
npx prisma db push

# Create first admin user
npx tsx scripts/create-business.ts "My Business" admin@example.com password123 "Admin Name"
```

### Option B: Using Local Terminal

1. Create a `.env` file in your project:
```bash
DATABASE_URL="postgresql://user:pass@host/db?sslmode=require"
```

2. Run:
```bash
npx prisma db push
npx tsx scripts/create-business.ts "My Business" admin@example.com password123 "Admin Name"
```

---

## Step 6: Test Your Site (1 minute)

1. Visit your Netlify site URL
2. Try to login with the credentials you created in Step 5
3. Test creating a customer, product, or order

**🎉 Congratulations! Your app is live!**

---

## Troubleshooting

### Build Fails
- Check build logs in Netlify Dashboard
- Verify all environment variables are set correctly
- Make sure `DATABASE_URL` is correct

### Can't Login
- Verify database schema was pushed (`npx prisma db push`)
- Check that you created an admin user
- Verify `NEXTAUTH_SECRET` and `NEXTAUTH_URL` are correct

### Database Connection Errors
- Verify `DATABASE_URL` is correct
- Check that your database allows connections from anywhere (most free tiers do)
- Ensure SSL mode is set: `?sslmode=require`

---

## Need Help?

- Check `DEPLOYMENT.md` for detailed instructions
- Check Netlify build logs for errors
- Verify all environment variables are set

Good luck! 🚀

