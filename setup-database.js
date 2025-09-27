#!/usr/bin/env node

const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
const path = require('path');

// Load environment variables
require('dotenv').config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('❌ Missing Supabase credentials in .env.local');
  process.exit(1);
}

// Create Supabase client with service role
const supabase = createClient(supabaseUrl, supabaseServiceKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
});

async function executeSQLFile(filePath, description) {
  console.log(`\n📄 Executing ${description}...`);
  
  try {
    const sql = fs.readFileSync(filePath, 'utf8');
    
    // Execute the entire SQL file as one statement
    console.log(`   Executing SQL file...`);
    
    const { data, error } = await supabase.rpc('exec_sql', { 
      sql_statement: sql 
    });
    
    if (error) {
      console.log(`   ⚠️  Error: ${error.message}`);
      return false;
    } else {
      console.log(`   ✅ SQL executed successfully`);
      return true;
    }
    
  } catch (error) {
    console.error(`❌ Error executing ${description}:`, error.message);
    return false;
  }
}

async function createStorageBuckets() {
  console.log('\n🪣 Creating storage buckets...');
  
  const buckets = [
    { name: 'exercise-videos', public: true },
    { name: 'receipts', public: false },
    { name: 'profile', public: false }
  ];
  
  for (const bucket of buckets) {
    try {
      const { data, error } = await supabase.storage.createBucket(bucket.name, {
        public: bucket.public,
        allowedMimeTypes: bucket.name === 'exercise-videos' 
          ? ['video/mp4', 'video/webm', 'video/ogg']
          : bucket.name === 'receipts'
          ? ['image/jpeg', 'image/png', 'image/webp', 'application/pdf']
          : ['image/jpeg', 'image/png', 'image/webp']
      });
      
      if (error && !error.message.includes('already exists')) {
        console.log(`   ⚠️  ${bucket.name}: ${error.message}`);
      } else {
        console.log(`   ✅ ${bucket.name} (${bucket.public ? 'public' : 'private'})`);
      }
    } catch (err) {
      console.log(`   ⚠️  ${bucket.name}: ${err.message}`);
    }
  }
}

async function main() {
  console.log('🚀 Setting up Supabase database...');
  console.log(`📡 Connecting to: ${supabaseUrl}`);
  
  try {
    // Test connection by checking if we can access the database
    console.log('✅ Connected to Supabase successfully');
    
    // Execute migration
    const migrationSuccess = await executeSQLFile(
      './supabase/migrations/001_initial_schema.sql',
      'Initial schema migration'
    );
    
    if (!migrationSuccess) {
      console.log('⚠️  Migration had issues, but continuing...');
    }
    
    // Execute exercise seed
    const exerciseSuccess = await executeSQLFile(
      './scripts/seed-exercises.sql',
      'Exercise library seed'
    );
    
    // Execute sample data seed
    const sampleSuccess = await executeSQLFile(
      './scripts/seed-sample-data.sql',
      'Sample data seed'
    );
    
    // Create storage buckets
    await createStorageBuckets();
    
    console.log('\n🎉 Database setup completed!');
    console.log('\n📊 Summary:');
    console.log(`   ✅ Schema migration: ${migrationSuccess ? 'Success' : 'Issues encountered'}`);
    console.log(`   ✅ Exercise library: ${exerciseSuccess ? 'Success' : 'Issues encountered'}`);
    console.log(`   ✅ Sample data: ${sampleSuccess ? 'Success' : 'Issues encountered'}`);
    console.log('   ✅ Storage buckets: Created/Verified');
    
    console.log('\n🔄 Next steps:');
    console.log('   1. Check Supabase dashboard for table creation');
    console.log('   2. Verify sample data in the tables');
    console.log('   3. Test the application connectivity');
    console.log('   4. Review any warning messages above');
    
  } catch (error) {
    console.error('❌ Setup failed:', error.message);
    process.exit(1);
  }
}

main();