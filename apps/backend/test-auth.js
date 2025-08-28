require('dotenv').config();

const { createClient } = require('@supabase/supabase-js');

console.log('🔐 Testing Supabase Authentication...\n');

const supabaseAdmin = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE,
  {
    auth: {
      autoRefreshToken: false,
      persistSession: false
    }
  }
);

const supabaseClient = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_ANON_KEY
);

async function testAuth() {
  try {
    const testEmail = 'test@demo.com';
    const testPassword = 'testpassword123';
    
    console.log('1️⃣ Creating test user...');
    
    const { data: createData, error: createError } = await supabaseAdmin.auth.admin.createUser({
      email: testEmail,
      password: testPassword,
      email_confirm: true,
      user_metadata: {
        name: 'Test User',
        role: 'CLIENT'
      }
    });
    
    if (createError) {
      if (createError.message.includes('already registered') || createError.message.includes('already been registered')) {
        console.log('ℹ️  User already exists, proceeding to login test...');
      } else {
        throw createError;
      }
    } else {
      console.log('✅ User created:', createData.user.id);
    }
    
    console.log('\n2️⃣ Testing login...');
    
    const { data: loginData, error: loginError } = await supabaseClient.auth.signInWithPassword({
      email: testEmail,
      password: testPassword
    });
    
    if (loginError) {
      throw loginError;
    }
    
    console.log('✅ Login successful!');
    console.log('User ID:', loginData.user.id);
    console.log('Session token:', loginData.session.access_token.substring(0, 20) + '...');
    
    console.log('\n3️⃣ Testing session validation...');
    
    const { data: userData, error: userError } = await supabaseClient.auth.getUser(
      loginData.session.access_token
    );
    
    if (userError) {
      throw userError;
    }
    
    console.log('✅ Token validation successful!');
    console.log('Validated user:', userData.user.email);
    
    console.log('\n🎉 All authentication tests passed!');
    
  } catch (error) {
    console.error('❌ Authentication test failed:', error.message);
  }
}

testAuth();