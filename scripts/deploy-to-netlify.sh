#!/bin/bash

# Automated Netlify Deployment Script
# This script helps automate the deployment process

set -e

echo "🚀 Netlify Deployment Helper"
echo "============================"
echo ""

# Check if Netlify CLI is installed
if ! command -v netlify &> /dev/null; then
    echo "📦 Installing Netlify CLI..."
    npm install -g netlify-cli
    echo "✅ Netlify CLI installed"
    echo ""
fi

# Check if logged in
if ! netlify status &> /dev/null; then
    echo "🔐 Please login to Netlify..."
    netlify login
    echo ""
fi

# Check if site is linked
if [ ! -f ".netlify/state.json" ]; then
    echo "🔗 Linking to Netlify site..."
    netlify link
    echo ""
fi

# Get environment variables
echo "📝 Setting up environment variables..."
echo ""

read -p "Enter your DATABASE_URL (PostgreSQL connection string): " DATABASE_URL
read -p "Enter your NEXTAUTH_SECRET (or press Enter to generate): " NEXTAUTH_SECRET_INPUT
read -p "Enter your NEXTAUTH_URL (e.g., https://your-site.netlify.app): " NEXTAUTH_URL

if [ -z "$NEXTAUTH_SECRET_INPUT" ]; then
    NEXTAUTH_SECRET=$(openssl rand -base64 32)
    echo "Generated NEXTAUTH_SECRET: $NEXTAUTH_SECRET"
else
    NEXTAUTH_SECRET=$NEXTAUTH_SECRET_INPUT
fi

# Set environment variables
netlify env:set DATABASE_URL "$DATABASE_URL"
netlify env:set NEXTAUTH_SECRET "$NEXTAUTH_SECRET"
netlify env:set NEXTAUTH_URL "$NEXTAUTH_URL"

echo ""
echo "✅ Environment variables set"
echo ""

# Ask about SMTP
read -p "Do you want to configure SMTP for emails? (y/n): " CONFIGURE_SMTP
if [ "$CONFIGURE_SMTP" = "y" ]; then
    read -p "SMTP_HOST (default: smtp.gmail.com): " SMTP_HOST
    read -p "SMTP_PORT (default: 587): " SMTP_PORT
    read -p "SMTP_USER: " SMTP_USER
    read -p "SMTP_PASS: " SMTP_PASS
    read -p "SMTP_FROM: " SMTP_FROM
    
    netlify env:set SMTP_HOST "${SMTP_HOST:-smtp.gmail.com}"
    netlify env:set SMTP_PORT "${SMTP_PORT:-587}"
    netlify env:set SMTP_USER "$SMTP_USER"
    netlify env:set SMTP_PASS "$SMTP_PASS"
    netlify env:set SMTP_FROM "$SMTP_FROM"
    
    echo "✅ SMTP configured"
    echo ""
fi

# Build and deploy
echo "🏗️  Building and deploying..."
netlify build
netlify deploy --prod

echo ""
echo "✅ Deployment complete!"
echo ""
echo "📋 Next steps:"
echo "1. Set up database schema:"
echo "   npx prisma db push"
echo ""
echo "2. Create first admin user:"
echo "   npx tsx scripts/create-business.ts 'Business Name' admin@email.com password 'Admin Name'"
echo ""

