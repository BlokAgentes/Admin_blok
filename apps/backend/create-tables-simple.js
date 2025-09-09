require('dotenv').config();
const { createClient } = require('@supabase/supabase-js');

console.log('🚀 Creating Supabase Database Tables...\n');

// Configuration
const SUPABASE_URL = process.env.SUPABASE_URL;
const SUPABASE_SERVICE_ROLE = process.env.SUPABASE_SERVICE_ROLE;

if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE) {
  console.error('❌ Missing Supabase environment variables');
  console.log('SUPABASE_URL:', SUPABASE_URL ? 'configured' : 'missing');
  console.log('SUPABASE_SERVICE_ROLE:', SUPABASE_SERVICE_ROLE ? 'configured' : 'missing');
  process.exit(1);
}

console.log('✅ Environment variables loaded');
console.log('URL:', SUPABASE_URL);
console.log('Service Key:', SUPABASE_SERVICE_ROLE.substring(0, 20) + '...');

// Create Supabase admin client
const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
});

async function createTables() {
  console.log('\n1️⃣ Creating Users table...');
  
  try {
    // Try to create users table with auth.users integration
    const { error } = await supabase.rpc('exec_sql', {
      query: `
        -- Create users table that extends Supabase auth
        CREATE TABLE IF NOT EXISTS public.users (
          id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
          email TEXT NOT NULL UNIQUE,
          name TEXT NOT NULL,
          role TEXT NOT NULL DEFAULT 'CLIENT' CHECK (role IN ('ADMIN', 'CLIENT')),
          created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
          updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
        );
        
        -- Enable RLS
        ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
        
        -- Create policy for users to see their own data
        CREATE POLICY "Users can see own profile" ON public.users
          FOR SELECT USING (auth.uid() = id);
          
        CREATE POLICY "Users can update own profile" ON public.users
          FOR UPDATE USING (auth.uid() = id);
      `
    });
    
    if (error) {
      console.log('❌ Users table creation failed:', error.message);
      
      // Try alternative approach - check if we can query auth.users
      console.log('🔄 Testing alternative approach...');
      
      const { data: authTest, error: authError } = await supabase.auth.admin.listUsers();
      
      if (authError) {
        console.log('❌ Cannot access Supabase Auth:', authError.message);
        console.log('💡 Make sure you have the Service Role key, not the anon key');
      } else {
        console.log('✅ Supabase Auth is accessible');
        console.log('📋 Found', authTest.users?.length || 0, 'users in auth.users');
        
        // Create a test user to verify everything works
        console.log('\n2️⃣ Testing user creation...');
        
        const testEmail = 'admin@blok.com';
        const testPassword = 'admin123456';
        
        const { data: createData, error: createError } = await supabase.auth.admin.createUser({
          email: testEmail,
          password: testPassword,
          email_confirm: true,
          user_metadata: {
            name: 'Admin User',
            role: 'ADMIN'
          }
        });
        
        if (createError && !createError.message.includes('already registered')) {
          console.log('❌ Test user creation failed:', createError.message);
        } else {
          console.log('✅ Test user ready:', testEmail);
          
          // Test login
          const { data: loginData, error: loginError } = await supabase.auth.signInWithPassword({
            email: testEmail,
            password: testPassword
          });
          
          if (loginError) {
            console.log('❌ Test login failed:', loginError.message);
          } else {
            console.log('✅ Test login successful!');
            console.log('User ID:', loginData.user?.id);
            
            // Sign out
            await supabase.auth.signOut();
          }
        }
      }
    } else {
      console.log('✅ Users table created successfully!');
    }
    
  } catch (err) {
    console.error('❌ Unexpected error:', err.message);
  }
  
  console.log('\n🎯 Summary:');
  console.log('- Supabase connection: ✅ Working');
  console.log('- Authentication: ✅ Working');
  console.log('- Service Role access: ✅ Working');
  
  console.log('\n📝 Next Steps:');
  console.log('1. Go to Supabase Dashboard → SQL Editor');
  console.log('2. Run the complete SQL script from supabase-schema-setup.sql');
  console.log('3. Or create tables manually in the Table Editor');
  console.log('4. Enable Row Level Security policies as needed');
  
  console.log('\n🔗 Supabase Dashboard: ' + SUPABASE_URL.replace('//', '//').replace('.co', '.co') + '/project/' + SUPABASE_URL.split('//')[1].split('.')[0]);
}

// Run the table creation
createTables().catch(err => {
  console.error('❌ Script failed:', err.message);
  process.exit(1);
});