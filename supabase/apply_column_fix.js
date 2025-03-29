// Script to apply fix for questionsUsed/questions_used column issue

require('dotenv').config();

const { createClient } = require('@supabase/supabase-js');

// Get Supabase URL and key from environment variables or set them directly here
const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_KEY; // Note: Service key needed for admin operations

if (!supabaseUrl || !supabaseKey) {
  console.error('Missing Supabase credentials. Set SUPABASE_URL and SUPABASE_SERVICE_KEY env variables.');
  process.exit(1);
}

// Initialize Supabase client with admin privileges
const supabase = createClient(supabaseUrl, supabaseKey);

async function applyColumnFix() {
  try {
    console.log('Fetching profiles table metadata...');
    
    // First check if the camelCase column exists
    const { data: columns, error: metadataError } = await supabase
      .from('profiles')
      .select('questionsused, questions_used')
      .limit(1);
    
    if (metadataError) {
      console.error('Error fetching profiles:', metadataError);
      return false;
    }
    
    // If we have data, check which column exists
    const hasCamelCase = columns.length > 0 && 'questionsused' in columns[0];
    const hasSnakeCase = columns.length > 0 && 'questions_used' in columns[0];
    
    console.log(`Column status: questionsused: ${hasCamelCase}, questions_used: ${hasSnakeCase}`);
    
    if (hasCamelCase && !hasSnakeCase) {
      console.log('Found questionsused but no questions_used. Running SQL to rename column...');
      
      // Run SQL to rename the column
      const { error: sqlError } = await supabase
        .from('profiles')
        .update({ questions_used: supabase.raw('questionsused') })
        .eq('questionsused', true);
      
      if (sqlError) {
        console.error('Error running SQL rename:', sqlError);
        return false;
      }
      
      console.log('Column renamed successfully!');
    } else if (!hasSnakeCase) {
      console.log('No questions_used column found. Adding it...');
      
      // Run SQL to add the column
      const { error: sqlError } = await supabase
        .from('profiles')
        .update({ questions_used: 0 });
      
      if (sqlError) {
        console.error('Error adding questions_used column:', sqlError);
        return false;
      }
      
      console.log('Column added successfully!');
    } else if (hasCamelCase && hasSnakeCase) {
      console.log('Both columns exist. Migrating data and removing old column...');
      
      // Migrate data from camelCase to snake_case where snake_case is null
      const { error: migrateError } = await supabase
        .from('profiles')
        .update({ questions_used: supabase.raw('questionsused') })
        .is('questions_used', null);
      
      if (migrateError) {
        console.error('Error migrating data:', migrateError);
        return false;
      }
      
      // Drop the camelCase column
      const { error: dropError } = await supabase
        .from('profiles')
        .update({ questionsused: null });
      
      if (dropError) {
        console.error('Error dropping old column:', dropError);
        return false;
      }
      
      console.log('Data migrated and old column removed successfully!');
    } else {
      console.log('questions_used column already exists. No action needed.');
    }
    
    // Verify fix applied
    const { data: verifyColumns, error: verifyError } = await supabase
      .from('profiles')
      .select('questions_used')
      .limit(1);
    
    if (verifyError) {
      console.error('Error verifying fix:', verifyError);
      return false;
    }
    
    const fixApplied = verifyColumns.length > 0 && 'questions_used' in verifyColumns[0];
    console.log(`Verification: questions_used column exists: ${fixApplied}`);
    
    return fixApplied;
  } catch (err) {
    console.error('Error applying column fix:', err);
    return false;
  }
}

// Run the fix
applyColumnFix()
  .then(success => {
    if (success) {
      console.log('Column fix successfully applied!');
      process.exit(0);
    } else {
      console.error('Failed to apply column fix.');
      process.exit(1);
    }
  })
  .catch(err => {
    console.error('Unexpected error:', err);
    process.exit(1);
  }); 