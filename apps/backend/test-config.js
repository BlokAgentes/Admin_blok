require('dotenv').config();

const { createClient } = require('@supabase/supabase-js');

console.log('🔧 Testing Supabase Configuration...\n');

console.log('Environment Variables:');
console.log('SUPABASE_URL:', process.env.SUPABASE_URL ? 'configured' : 'missing');
console.log('SUPABASE_ANON_KEY:', process.env.SUPABASE_ANON_KEY ? 'configured' : 'missing');  
console.log('SUPABASE_SERVICE_ROLE:', process.env.SUPABASE_SERVICE_ROLE ? 'configured' : 'missing');

if (process.env.SUPABASE_URL && process.env.SUPABASE_ANON_KEY) {
  console.log('\n🚀 Creating Supabase client...');
  
  const supabase = createClient(
    process.env.SUPABASE_URL,
    process.env.SUPABASE_ANON_KEY
  );
  
  console.log('✅ Supabase client created successfully');
  
  // Test basic connectivity
  supabase.auth.getSession().then(({ data, error }) => {
    if (error) {
      console.log('⚠️  Auth test result:', error.message);
    } else {
      console.log('✅ Supabase connection successful');
      console.log('Session status:', data.session ? 'active' : 'no active session');
    }
  }).catch(err => {
    console.error('❌ Connection test failed:', err.message);
  });
  
} else {
  console.log('❌ Missing required environment variables');
}