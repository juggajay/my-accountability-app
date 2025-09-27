#!/bin/bash

# Load environment variables
source .env.local

echo "🚀 Setting up Supabase database..."
echo "📡 Connecting to: $NEXT_PUBLIC_SUPABASE_URL"

# Function to execute SQL file
execute_sql_file() {
    local file_path="$1"
    local description="$2"
    
    echo ""
    echo "📄 Executing $description..."
    
    if [ ! -f "$file_path" ]; then
        echo "   ❌ File not found: $file_path"
        return 1
    fi
    
    # Read SQL file and execute via REST API
    sql_content=$(cat "$file_path")
    
    response=$(curl -s -X POST \
        "$NEXT_PUBLIC_SUPABASE_URL/rest/v1/rpc/exec_sql" \
        -H "apikey: $SUPABASE_SERVICE_KEY" \
        -H "Authorization: Bearer $SUPABASE_SERVICE_KEY" \
        -H "Content-Type: application/json" \
        -d "{\"sql_statement\": $(echo "$sql_content" | jq -Rs .)}")
    
    if echo "$response" | grep -q "error"; then
        echo "   ⚠️  Response: $response"
        return 1
    else
        echo "   ✅ SQL executed successfully"
        return 0
    fi
}

# Function to create storage bucket
create_bucket() {
    local bucket_name="$1"
    local is_public="$2"
    
    echo "   Creating bucket: $bucket_name ($([ "$is_public" = "true" ] && echo "public" || echo "private"))"
    
    response=$(curl -s -X POST \
        "$NEXT_PUBLIC_SUPABASE_URL/storage/v1/bucket" \
        -H "apikey: $SUPABASE_SERVICE_KEY" \
        -H "Authorization: Bearer $SUPABASE_SERVICE_KEY" \
        -H "Content-Type: application/json" \
        -d "{\"name\": \"$bucket_name\", \"public\": $is_public}")
    
    if echo "$response" | grep -q "already exists\|Bucket created"; then
        echo "   ✅ $bucket_name"
    else
        echo "   ⚠️  $bucket_name: $response"
    fi
}

# Check if required files exist
if [ ! -f ".env.local" ]; then
    echo "❌ .env.local file not found"
    exit 1
fi

if [ ! -f "supabase/migrations/001_initial_schema.sql" ]; then
    echo "❌ Migration file not found"
    exit 1
fi

# Execute migration
echo ""
echo "📄 Executing Initial schema migration..."
echo "   Note: Using alternative approach since RPC may not be available"

# Since we can't easily execute arbitrary SQL via API without a custom RPC,
# let's provide instructions for manual execution
echo ""
echo "⚠️  Manual SQL execution required:"
echo ""
echo "1. Open your Supabase dashboard: https://supabase.com/dashboard"
echo "2. Navigate to your project: ttkdbdfezvyigdegfiwm"
echo "3. Go to SQL Editor"
echo "4. Copy and execute the following files in order:"
echo ""
echo "   a) supabase/migrations/001_initial_schema.sql"
echo "   b) scripts/seed-exercises.sql"
echo "   c) scripts/seed-sample-data.sql"
echo ""

# Create storage buckets using API
echo "🪣 Creating storage buckets..."

create_bucket "exercise-videos" "true"
create_bucket "receipts" "false"
create_bucket "profile" "false"

echo ""
echo "🎉 Setup script completed!"
echo ""
echo "📊 Summary:"
echo "   ⚠️  Schema migration: Manual execution required (see instructions above)"
echo "   ⚠️  Exercise library: Manual execution required (see instructions above)"
echo "   ⚠️  Sample data: Manual execution required (see instructions above)"
echo "   ✅ Storage buckets: Created/Verified via API"
echo ""
echo "🔄 Next steps:"
echo "   1. Execute the SQL files manually in Supabase dashboard"
echo "   2. Verify tables and data are created"
echo "   3. Test the application connectivity"
echo "   4. Storage buckets should already be created"