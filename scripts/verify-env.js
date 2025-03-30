/**
 * Environment Variables Verification Script
 * 
 * This script checks if all required environment variables are set.
 * Run this script before deployment to ensure all necessary variables are configured.
 * 
 * Usage: node scripts/verify-env.js
 */

// Required environment variables for the application
const requiredVariables = [
  // Supabase
  'NEXT_PUBLIC_SUPABASE_URL',
  'NEXT_PUBLIC_SUPABASE_ANON_KEY',
  
  // Razorpay
  'NEXT_PUBLIC_RAZORPAY_KEY_ID',
  'RAZORPAY_KEY_SECRET',
  
  // Application
  'NEXT_PUBLIC_APP_URL',
];

// Optional environment variables
const optionalVariables = [
  'NEXT_PUBLIC_PERPLEXITY_API_KEY'
];

console.log('🔍 Checking environment variables...\n');

let missingVars = [];
let presentVars = [];

// Check required variables
for (const variable of requiredVariables) {
  if (!process.env[variable]) {
    missingVars.push(variable);
  } else {
    presentVars.push(variable);
  }
}

// Display results
if (missingVars.length > 0) {
  console.log('❌ Missing required environment variables:');
  missingVars.forEach(variable => {
    console.log(`   - ${variable}`);
  });
  console.log('\n⚠️ These variables are required for the application to work properly.');
  console.log('Please set them in your .env.local file or in your deployment environment.\n');
} else {
  console.log('✅ All required environment variables are set!\n');
}

// Display present variables
console.log('✅ Present environment variables:');
presentVars.forEach(variable => {
  // Mask the actual values for security
  const value = process.env[variable];
  const maskedValue = value && value.length > 8 
    ? `${value.substring(0, 4)}...${value.substring(value.length - 4)}`
    : '****';
  console.log(`   - ${variable}: ${maskedValue}`);
});

// Check optional variables
let missingOptionalVars = [];
optionalVariables.forEach(variable => {
  if (!process.env[variable]) {
    missingOptionalVars.push(variable);
  }
});

if (missingOptionalVars.length > 0) {
  console.log('\n⚠️ Missing optional environment variables:');
  missingOptionalVars.forEach(variable => {
    console.log(`   - ${variable}`);
  });
  console.log('\nThese variables are optional but may enhance functionality if set.');
}

// Provide Vercel deployment command examples
console.log('\n📋 For Vercel deployment, you can set variables using:');
console.log('vercel env add VARIABLE_NAME');
console.log('or through the Vercel dashboard > Project Settings > Environment Variables\n');

// Exit with appropriate code
if (missingVars.length > 0) {
  process.exit(1); // Exit with error
} else {
  process.exit(0); // Exit successfully
} 