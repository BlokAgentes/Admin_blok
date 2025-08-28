require('dotenv').config();

const { createClient } = require('@supabase/supabase-js');

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

async function confirmUser() {
  try {
    const testEmail = 'test@demo.com';
    
    console.log('🔧 Finding user by email...');
    
    // Get user by email
    const { data: users, error: listError } = await supabaseAdmin.auth.admin.listUsers();
    
    if (listError) {
      throw listError;
    }
    
    const user = users.users.find(u => u.email === testEmail);
    
    if (!user) {
      console.log('❌ User not found');
      return;
    }
    
    console.log('✅ User found:', user.id);
    console.log('Email confirmed:', !!user.email_confirmed_at);
    
    if (!user.email_confirmed_at) {
      console.log('🔧 Confirming user email...');
      
      const { data: updateData, error: updateError } = await supabaseAdmin.auth.admin.updateUserById(
        user.id,
        { email_confirm: true }
      );
      
      if (updateError) {
        throw updateError;
      }
      
      console.log('✅ User email confirmed!');
    }
    
  } catch (error) {
    console.error('❌ Error:', error.message);
  }
}

confirmUser();