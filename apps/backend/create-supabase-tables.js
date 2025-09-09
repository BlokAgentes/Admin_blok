require('dotenv').config();
const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
const path = require('path');

console.log('🚀 Creating Supabase Database Tables...\n');

// Configuration
const SUPABASE_URL = process.env.SUPABASE_URL;
const SUPABASE_SERVICE_ROLE = process.env.SUPABASE_SERVICE_ROLE;

if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE) {
  console.error('❌ Missing Supabase environment variables');
  console.log('Required: SUPABASE_URL and SUPABASE_SERVICE_ROLE');
  process.exit(1);
}

// Create Supabase admin client
const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
});

// SQL Commands to create schema
const sqlCommands = [
  {
    name: 'Create Role Enum',
    sql: `CREATE TYPE IF NOT EXISTS public.role AS ENUM ('ADMIN', 'CLIENT');`
  },
  {
    name: 'Create ClientStatus Enum',
    sql: `CREATE TYPE IF NOT EXISTS public.client_status AS ENUM ('ACTIVE', 'INACTIVE', 'ARCHIVED');`
  },
  {
    name: 'Create FlowStatus Enum',
    sql: `CREATE TYPE IF NOT EXISTS public.flow_status AS ENUM ('DRAFT', 'PUBLISHED', 'ARCHIVED');`
  },
  {
    name: 'Create Users Table',
    sql: `
      CREATE TABLE IF NOT EXISTS public.users (
        id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::TEXT,
        email TEXT NOT NULL UNIQUE,
        name TEXT NOT NULL,
        password TEXT NOT NULL,
        role public.role NOT NULL DEFAULT 'CLIENT',
        created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
        updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
      );
    `
  },
  {
    name: 'Create Clients Table',
    sql: `
      CREATE TABLE IF NOT EXISTS public.clients (
        id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::TEXT,
        name TEXT NOT NULL,
        email TEXT,
        phone TEXT,
        company TEXT,
        description TEXT,
        status public.client_status NOT NULL DEFAULT 'ACTIVE',
        user_id TEXT NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
        created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
        updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
      );
    `
  },
  {
    name: 'Create Flows Table',
    sql: `
      CREATE TABLE IF NOT EXISTS public.flows (
        id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::TEXT,
        title TEXT NOT NULL,
        description TEXT,
        status public.flow_status NOT NULL DEFAULT 'DRAFT',
        is_public BOOLEAN NOT NULL DEFAULT FALSE,
        user_id TEXT NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
        client_id TEXT REFERENCES public.clients(id) ON DELETE SET NULL,
        created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
        updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
      );
    `
  },
  {
    name: 'Create FlowVersions Table',
    sql: `
      CREATE TABLE IF NOT EXISTS public.flow_versions (
        id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::TEXT,
        version INTEGER NOT NULL,
        data JSONB NOT NULL,
        flow_id TEXT NOT NULL REFERENCES public.flows(id) ON DELETE CASCADE,
        created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
        UNIQUE(flow_id, version)
      );
    `
  },
  {
    name: 'Create Shares Table',
    sql: `
      CREATE TABLE IF NOT EXISTS public.shares (
        id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::TEXT,
        token TEXT NOT NULL UNIQUE,
        expires_at TIMESTAMPTZ,
        is_active BOOLEAN NOT NULL DEFAULT TRUE,
        flow_id TEXT NOT NULL REFERENCES public.flows(id) ON DELETE CASCADE,
        user_id TEXT NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
        created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
      );
    `
  },
  {
    name: 'Create AuditLogs Table',
    sql: `
      CREATE TABLE IF NOT EXISTS public.audit_logs (
        id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::TEXT,
        action TEXT NOT NULL,
        resource TEXT NOT NULL,
        resource_id TEXT,
        details JSONB,
        ip_address TEXT,
        user_agent TEXT,
        user_id TEXT NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
        created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
      );
    `
  },
  {
    name: 'Create Updated At Trigger Function',
    sql: `
      CREATE OR REPLACE FUNCTION public.update_updated_at_column()
      RETURNS TRIGGER AS $$
      BEGIN
        NEW.updated_at = NOW();
        RETURN NEW;
      END;
      $$ LANGUAGE 'plpgsql';
    `
  },
  {
    name: 'Create Triggers for Updated At',
    sql: `
      DROP TRIGGER IF EXISTS update_users_updated_at ON public.users;
      CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON public.users FOR EACH ROW EXECUTE PROCEDURE update_updated_at_column();

      DROP TRIGGER IF EXISTS update_clients_updated_at ON public.clients;
      CREATE TRIGGER update_clients_updated_at BEFORE UPDATE ON public.clients FOR EACH ROW EXECUTE PROCEDURE update_updated_at_column();

      DROP TRIGGER IF EXISTS update_flows_updated_at ON public.flows;
      CREATE TRIGGER update_flows_updated_at BEFORE UPDATE ON public.flows FOR EACH ROW EXECUTE PROCEDURE update_updated_at_column();
    `
  },
  {
    name: 'Create Indexes for Performance',
    sql: `
      -- Users indexes
      CREATE INDEX IF NOT EXISTS idx_users_email ON public.users(email);
      CREATE INDEX IF NOT EXISTS idx_users_role ON public.users(role);
      
      -- Clients indexes
      CREATE INDEX IF NOT EXISTS idx_clients_user_id ON public.clients(user_id);
      CREATE INDEX IF NOT EXISTS idx_clients_status ON public.clients(status);
      CREATE INDEX IF NOT EXISTS idx_clients_email ON public.clients(email);
      
      -- Flows indexes
      CREATE INDEX IF NOT EXISTS idx_flows_user_id ON public.flows(user_id);
      CREATE INDEX IF NOT EXISTS idx_flows_client_id ON public.flows(client_id);
      CREATE INDEX IF NOT EXISTS idx_flows_status ON public.flows(status);
      CREATE INDEX IF NOT EXISTS idx_flows_is_public ON public.flows(is_public);
      
      -- Flow versions indexes
      CREATE INDEX IF NOT EXISTS idx_flow_versions_flow_id ON public.flow_versions(flow_id);
      CREATE INDEX IF NOT EXISTS idx_flow_versions_version ON public.flow_versions(flow_id, version);
      
      -- Shares indexes
      CREATE INDEX IF NOT EXISTS idx_shares_token ON public.shares(token);
      CREATE INDEX IF NOT EXISTS idx_shares_flow_id ON public.shares(flow_id);
      CREATE INDEX IF NOT EXISTS idx_shares_user_id ON public.shares(user_id);
      CREATE INDEX IF NOT EXISTS idx_shares_is_active ON public.shares(is_active);
      
      -- Audit logs indexes
      CREATE INDEX IF NOT EXISTS idx_audit_logs_user_id ON public.audit_logs(user_id);
      CREATE INDEX IF NOT EXISTS idx_audit_logs_resource ON public.audit_logs(resource);
      CREATE INDEX IF NOT EXISTS idx_audit_logs_created_at ON public.audit_logs(created_at);
    `
  }
];

async function executeCommand(command) {
  console.log(`🔄 ${command.name}...`);
  
  try {
    const { data, error } = await supabase.rpc('exec', { sql: command.sql });
    
    if (error) {
      console.error(`❌ Error in ${command.name}:`, error.message);
      return false;
    }
    
    console.log(`✅ ${command.name} completed successfully`);
    return true;
  } catch (err) {
    console.error(`❌ Exception in ${command.name}:`, err.message);
    return false;
  }
}

async function createSchema() {
  console.log('📋 Starting database schema creation...\n');
  
  let successCount = 0;
  let errorCount = 0;
  
  for (const command of sqlCommands) {
    const success = await executeCommand(command);
    
    if (success) {
      successCount++;
    } else {
      errorCount++;
    }
    
    // Small delay between commands
    await new Promise(resolve => setTimeout(resolve, 500));
  }
  
  console.log('\n📊 Schema Creation Summary:');
  console.log(`✅ Successful operations: ${successCount}`);
  console.log(`❌ Failed operations: ${errorCount}`);
  
  if (errorCount === 0) {
    console.log('\n🎉 Database schema created successfully!');
    console.log('📝 Next steps:');
    console.log('  1. Update your frontend to use the Supabase tables');
    console.log('  2. Test the authentication endpoints');
    console.log('  3. Verify RLS policies if needed');
  } else {
    console.log('\n⚠️  Some operations failed. Please check the errors above.');
  }
}

// Test Supabase connection first
async function testConnection() {
  try {
    // Simple query to test connection
    const { data, error } = await supabase.rpc('exec', { sql: 'SELECT 1 as test;' });
    
    console.log('✅ Supabase connection successful');
    return true;
  } catch (err) {
    console.error('❌ Connection error:', err.message);
    return false;
  }
}

// Main execution
async function main() {
  const connected = await testConnection();
  
  if (!connected) {
    console.log('💡 Please check your Supabase URL and Service Role key');
    process.exit(1);
  }
  
  await createSchema();
}

main().catch(err => {
  console.error('❌ Unexpected error:', err);
  process.exit(1);
});