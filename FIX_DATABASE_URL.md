# 🔧 Fix DATABASE_URL Error

## Problem
```
error: Error validating datasource `db`: the URL must start with the protocol `postgresql://` or `postgres://`.
```

## Solution

### Step 1: Check Netlify Environment Variables

1. Go to Netlify Dashboard
2. Navigate to: **Site settings** > **Environment variables**
3. Check if `DATABASE_URL` exists

### Step 2: Verify DATABASE_URL Format

The `DATABASE_URL` must be in this format:

```
postgresql://user:password@host:port/database?sslmode=require
```

or

```
postgres://user:password@host:port/database?sslmode=require
```

### Step 3: Common Issues

❌ **Wrong:**
```
file:./dev.db
sqlite://dev.db
DATABASE_URL=postgresql://...
```

✅ **Correct:**
```
postgresql://user:password@host:5432/dbname?sslmode=require
```

### Step 4: Get PostgreSQL Connection String

If you don't have a PostgreSQL database yet:

1. **Option A: Neon (Free)**
   - Go to https://neon.tech
   - Create account and project
   - Copy connection string from dashboard

2. **Option B: Supabase (Free)**
   - Go to https://supabase.com
   - Create project
   - Settings > Database > Connection string

### Step 5: Set in Netlify

1. Go to Netlify Dashboard
2. Site settings > Environment variables
3. Click "Add a variable"
4. Key: `DATABASE_URL`
5. Value: Your PostgreSQL connection string (the full URL)
6. Click "Save"
7. **Redeploy the site**

### Step 6: Test

After redeploy, test the database connection:
```
https://your-site.netlify.app/api/test-db
```

This should return:
```json
{
  "success": true,
  "message": "Database connection successful",
  "userCount": 0,
  "businessCount": 0
}
```

## Important Notes

- The connection string should NOT have quotes around it
- Make sure there are no extra spaces
- The protocol MUST be `postgresql://` or `postgres://`
- After setting the variable, you MUST redeploy for it to take effect
