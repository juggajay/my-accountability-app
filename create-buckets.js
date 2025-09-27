#!/usr/bin/env node

const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('❌ Missing Supabase credentials in .env.local');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
});

async function createStorageBuckets() {
  console.log('🪣 Creating storage buckets...');
  
  const buckets = [
    { name: 'exercise-videos', public: true },
    { name: 'receipts', public: false },
    { name: 'profile', public: false }
  ];
  
  let success = 0;
  
  for (const bucket of buckets) {
    try {
      const { data, error } = await supabase.storage.createBucket(bucket.name, {
        public: bucket.public
      });
      
      if (error) {
        if (error.message.includes('already exists')) {
          console.log(`   ✅ ${bucket.name} (${bucket.public ? 'public' : 'private'}) - already exists`);
          success++;
        } else {
          console.log(`   ❌ ${bucket.name}: ${error.message}`);
        }
      } else {
        console.log(`   ✅ ${bucket.name} (${bucket.public ? 'public' : 'private'}) - created`);
        success++;
      }
    } catch (err) {
      console.log(`   ❌ ${bucket.name}: ${err.message}`);
    }
  }
  
  console.log(`\n📊 Storage buckets: ${success}/${buckets.length} successful`);
  return success === buckets.length;
}

async function main() {
  console.log('🚀 Creating Supabase storage buckets...');
  console.log(`📡 Connecting to: ${supabaseUrl}`);
  
  try {
    const success = await createStorageBuckets();
    
    if (success) {
      console.log('\n✅ All storage buckets created successfully!');
    } else {
      console.log('\n⚠️  Some storage buckets had issues');
    }
    
  } catch (error) {
    console.error('❌ Setup failed:', error.message);
    process.exit(1);
  }
}

main();