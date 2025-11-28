#!/bin/bash

# Netlify Deployment Setup Script
# This script helps you set up your project for Netlify deployment

set -e

echo "🚀 Netlify Deployment Setup"
echo "============================"
echo ""

# Check if git is initialized
if [ ! -d ".git" ]; then
    echo "📦 Initializing git repository..."
    git init
    git add .
    git commit -m "Initial commit - ready for Netlify deployment"
    echo "✅ Git repository initialized"
    echo ""
fi

# Generate NEXTAUTH_SECRET if not exists
if [ ! -f ".env.production" ]; then
    echo "🔐 Generating NEXTAUTH_SECRET..."
    NEXTAUTH_SECRET=$(openssl rand -base64 32)
    echo "NEXTAUTH_SECRET=$NEXTAUTH_SECRET" > .env.production
    echo "✅ Generated NEXTAUTH_SECRET: $NEXTAUTH_SECRET"
    echo "   (Saved to .env.production - DO NOT commit this file!)"
    echo ""
fi

echo "📋 Next Steps:"
echo "=============="
echo ""
echo "1. Push to GitHub:"
echo "   git remote add origin https://github.com/YOUR_USERNAME/YOUR_REPO.git"
echo "   git push -u origin main"
echo ""
echo "2. Create PostgreSQL Database:"
echo "   - Go to https://neon.tech (recommended) or https://supabase.com"
echo "   - Create a free account and project"
echo "   - Copy the connection string"
echo ""
echo "3. Create Netlify Site:"
echo "   - Go to https://app.netlify.com"
echo "   - Click 'Add new site' > 'Import an existing project'"
echo "   - Connect your GitHub repository"
echo ""
echo "4. Set Environment Variables in Netlify:"
echo "   - DATABASE_URL (from step 2)"
echo "   - NEXTAUTH_SECRET (from .env.production file above)"
echo "   - NEXTAUTH_URL (your Netlify site URL)"
echo ""
echo "5. After first deploy, run:"
echo "   npx prisma db push"
echo "   npx tsx scripts/create-business.ts 'Business Name' admin@email.com password 'Admin Name'"
echo ""
echo "✅ Setup complete! Follow the steps above to deploy."
echo ""

