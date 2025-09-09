// Test Supabase connection
require('dotenv').config();
const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = process.env.SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_ANON_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

console.log('Testing Supabase connection...');
console.log('URL:', supabaseUrl);
console.log('Key exists:', !!supabaseKey);

if (!supabaseUrl || !supabaseKey) {
  console.error('❌ Missing Supabase credentials');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

// Test registration
async function testRegistration() {
  try {
    const testEmail = `test-${Date.now()}@example.com`;
    console.log('\n🧪 Testing registration with email:', testEmail);
    
    const { data, error } = await supabase.auth.signUp({
      email: testEmail,
      password: '123456',
      options: {
        data: {
          name: 'Test User',
          role: 'CLIENT',
          display_name: 'Test User',
          user_role: 'CLIENT'
        }
      }
    });

    if (error) {
      console.error('❌ Registration error:', error.message);
      return false;
    }

    console.log('✅ Registration successful');
    console.log('User ID:', data.user?.id);
    console.log('Session exists:', !!data.session);
    console.log('Email confirmed:', !!data.user?.email_confirmed_at);
    
    return true;
  } catch (error) {
    console.error('❌ Unexpected error:', error.message);
    return false;
  }
}

testRegistration();