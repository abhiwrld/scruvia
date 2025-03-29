#!/usr/bin/env node

const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
const path = require('path');
require('dotenv').config({ path: '.env.local' });

console.log('Supabase Schema Setup Tool');
console.log('==========================');

// Get Supabase URL and key from environment variables
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('Error: Supabase URL or key not found in environment variables');
  console.error('Make sure NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY are set in .env.local');
  process.exit(1);
}

console.log(`Connected to Supabase project: ${supabaseUrl}`);

// Create Supabase client
const supabase = createClient(supabaseUrl, supabaseKey);

// Read SQL schema file
const schemaPath = path.join(__dirname, '..', 'supabase', 'schema.sql');
const schema = fs.readFileSync(schemaPath, 'utf8');

// Split schema into individual statements
const statements = schema
  .split(';')
  .map(statement => statement.trim())
  .filter(statement => statement.length > 0);

console.log(`Found ${statements.length} SQL statements to execute`);

async function executeSchema() {
  try {
    // Check if we can connect to Supabase
    const { data: healthCheck, error: healthError } = await supabase.auth.getSession();
    
    if (healthError) {
      console.error('Error connecting to Supabase:', healthError);
      console.error('Full error details:', JSON.stringify(healthError, null, 2));
      console.log('\nPlease check your Supabase URL and API key in .env.local');
      process.exit(1);
    }
    
    console.log('Successfully connected to Supabase');
    
    // Try to execute the schema through different methods
    
    // Method 1: Using execute_sql RPC function if it exists
    try {
      console.log('Attempting to use execute_sql RPC function...');
      
      // Test if execute_sql exists
      const testResult = await supabase.rpc('execute_sql', { 
        sql: 'SELECT 1 as test' 
      });
      
      if (!testResult.error) {
        console.log('execute_sql RPC function exists, proceeding with schema setup');
        
        // Execute each statement
        for (let i = 0; i < statements.length; i++) {
          const statement = statements[i];
          console.log(`Executing statement ${i + 1}/${statements.length}...`);
          
          // Execute the SQL statement
          const { error } = await supabase.rpc('execute_sql', { sql: statement });
          
          if (error) {
            console.error(`Error executing statement ${i + 1}:`, error);
            console.error('Statement:', statement);
          } else {
            console.log(`Statement ${i + 1} executed successfully`);
          }
        }
        
        console.log('Schema setup completed using execute_sql!');
        return;
      }
    } catch (error) {
      console.log('execute_sql RPC function not available:', error?.message || 'Unknown error');
      console.log('Trying alternative methods...');
    }
    
    // Method 2: Checking if tables exist to determine if schema is already set up
    try {
      console.log('Checking if schema is already set up...');
      
      // Check if profiles table exists
      const { data: profilesCheck, error: profilesError } = await supabase
        .from('profiles')
        .select('count(*)', { count: 'exact', head: true });
      
      if (!profilesError) {
        console.log('Profiles table found, schema appears to be already set up');
        console.log('If you want to reset the schema, please use the Supabase dashboard SQL editor');
        console.log('You can copy and paste the schema from: ' + schemaPath);
        return;
      }
    } catch (error) {
      console.log('Tables not found, schema needs to be set up');
    }
    
    // Method 3: Instruct user to manually run the SQL
    console.log('\n===== MANUAL SETUP REQUIRED =====');
    console.log('Could not automatically run the schema. Please follow these steps:');
    console.log('1. Log in to your Supabase dashboard at https://app.supabase.io');
    console.log('2. Select your project');
    console.log('3. Go to the SQL Editor');
    console.log('4. Copy the SQL schema from: ' + schemaPath);
    console.log('5. Paste it into the SQL Editor and run it');
    console.log('\nAlternatively, create a function called execute_sql in your database:');
    console.log(`
CREATE OR REPLACE FUNCTION execute_sql(sql text)
RETURNS void AS $$
BEGIN
  EXECUTE sql;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;`);
    console.log('\nThen run this setup script again.');
    
  } catch (error) {
    console.error('Unexpected error:', error);
    process.exit(1);
  }
}

executeSchema(); 