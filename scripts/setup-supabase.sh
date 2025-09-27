#!/bin/bash

# Supabase Setup Script
# This script helps set up your Supabase project with all necessary configurations

set -e

echo "🚀 Supabase Setup Script"
echo "========================"
echo ""

# Colors for output
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

# Check if .env.local exists
if [ ! -f .env.local ]; then
    echo -e "${RED}❌ Error: .env.local file not found${NC}"
    echo "Please copy .env.example to .env.local and fill in your credentials"
    exit 1
fi

# Source environment variables
source .env.local

# Check if Supabase credentials are set
if [ -z "$NEXT_PUBLIC_SUPABASE_URL" ] || [ -z "$SUPABASE_SERVICE_KEY" ]; then
    echo -e "${RED}❌ Error: Supabase credentials not set in .env.local${NC}"
    exit 1
fi

echo -e "${GREEN}✓${NC} Environment variables loaded"
echo ""

# Function to run SQL file
run_sql_file() {
    local file=$1
    local description=$2
    
    echo -e "${YELLOW}→${NC} Running: $description"
    
    if [ -f "$file" ]; then
        # Extract SQL content
        SQL_CONTENT=$(cat "$file")
        
        # Note: This is a placeholder. In production, you'd use Supabase CLI or API
        echo -e "${GREEN}✓${NC} SQL file ready: $file"
        echo "   📋 Please run this SQL in your Supabase SQL Editor:"
        echo "   🔗 https://app.supabase.com/project/YOUR_PROJECT/sql"
        echo ""
    else
        echo -e "${RED}❌${NC} File not found: $file"
        exit 1
    fi
}

echo "📊 Database Setup"
echo "=================="
echo ""

# Run migrations
if [ -d "supabase/migrations" ]; then
    echo -e "${YELLOW}Found migrations directory${NC}"
    for migration in supabase/migrations/*.sql; do
        if [ -f "$migration" ]; then
            filename=$(basename "$migration")
            run_sql_file "$migration" "Migration: $filename"
        fi
    done
else
    echo -e "${RED}❌ No migrations directory found${NC}"
fi

echo ""
echo "📦 Storage Buckets"
echo "=================="
echo ""
echo "Please create these storage buckets in Supabase:"
echo "1. exercise-videos (public)"
echo "2. receipts (private)"
echo "3. profile (private)"
echo ""
echo "🔗 Go to: https://app.supabase.com/project/YOUR_PROJECT/storage/buckets"
echo ""

echo "🔐 Row Level Security"
echo "====================="
echo ""
echo "RLS policies have been included in the migration."
echo "All tables are secured with personal use policies."
echo ""

echo "✅ Setup Instructions Complete!"
echo "==============================="
echo ""
echo "Next steps:"
echo "1. Go to your Supabase SQL Editor"
echo "2. Run the migration file: supabase/migrations/001_initial_schema.sql"
echo "3. Create the 3 storage buckets mentioned above"
echo "4. Run: npm run dev"
echo ""
echo "📖 For detailed instructions, see QUICK_START.md"
echo ""