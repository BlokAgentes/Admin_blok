#!/usr/bin/env node

/**
 * Supabase Database Schema Setup Script
 * 
 * This script creates the complete database schema for the Blok Platform
 * based on the Prisma schema defined in apps/frontend/prisma/schema.prisma
 * 
 * Usage:
 *   node setup-supabase-schema.js
 * 
 * Environment variables required:
 *   SUPABASE_URL - Your Supabase project URL
 *   SUPABASE_SERVICE_ROLE_KEY - Your service role key (not anon key)
 */

import { createClient } from '@supabase/supabase-js';
import fs from 'fs';
import path from 'path';

// Configuration
const SUPABASE_URL = process.env.SUPABASE_URL || 'https://eslcwpuxyqopwylgzddz.supabase.co';
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!SUPABASE_SERVICE_ROLE_KEY) {
    console.error('❌ SUPABASE_SERVICE_ROLE_KEY environment variable is required');
    console.log('💡 Find your service role key in your Supabase project settings > API');
    process.exit(1);
}

// Create Supabase client with service role key for admin operations
const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, {
    auth: {
        autoRefreshToken: false,
        persistSession: false
    }
});

async function executeSQL(sql, description) {
    console.log(`🔄 ${description}...`);
    try {
        const { data, error } = await supabase.rpc('execute_sql', { sql_query: sql });
        
        if (error) {
            console.error(`❌ Error in ${description}:`, error);
            return false;
        }
        
        console.log(`✅ ${description} completed successfully`);
        return true;
    } catch (err) {
        console.error(`❌ Exception in ${description}:`, err.message);
        return false;
    }
}

async function setupSchema() {
    console.log('🚀 Setting up Supabase database schema for Blok Platform...\n');

    // Step 1: Create enums
    console.log('📝 Step 1: Creating enums...');
    
    const enumsSQL = `
        -- Create Role enum
        DO $$ BEGIN
            CREATE TYPE public.role AS ENUM ('ADMIN', 'CLIENT');
        EXCEPTION
            WHEN duplicate_object THEN null;
        END $$;

        -- Create ClientStatus enum  
        DO $$ BEGIN
            CREATE TYPE public.client_status AS ENUM ('ACTIVE', 'INACTIVE', 'ARCHIVED');
        EXCEPTION
            WHEN duplicate_object THEN null;
        END $$;

        -- Create FlowStatus enum
        DO $$ BEGIN
            CREATE TYPE public.flow_status AS ENUM ('DRAFT', 'PUBLISHED', 'ARCHIVED');
        EXCEPTION
            WHEN duplicate_object THEN null;
        END $$;
    `;

    if (!(await executeSQL(enumsSQL, 'Creating enums'))) return;

    // Step 2: Create tables
    console.log('\n🏗️  Step 2: Creating tables...');

    const tablesSQL = `
        -- Create users table
        CREATE TABLE IF NOT EXISTS public.users (
            id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::TEXT,
            email TEXT NOT NULL UNIQUE,
            name TEXT NOT NULL,
            password TEXT NOT NULL,
            role public.role NOT NULL DEFAULT 'CLIENT',
            created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
            updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
        );

        -- Create clients table
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

        -- Create flows table
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

        -- Create flow_versions table
        CREATE TABLE IF NOT EXISTS public.flow_versions (
            id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::TEXT,
            version INTEGER NOT NULL,
            data JSONB NOT NULL,
            flow_id TEXT NOT NULL REFERENCES public.flows(id) ON DELETE CASCADE,
            created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
        );

        -- Add unique constraint for flow versions
        ALTER TABLE public.flow_versions DROP CONSTRAINT IF EXISTS unique_flow_version;
        ALTER TABLE public.flow_versions ADD CONSTRAINT unique_flow_version UNIQUE (flow_id, version);

        -- Create shares table
        CREATE TABLE IF NOT EXISTS public.shares (
            id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::TEXT,
            token TEXT NOT NULL UNIQUE,
            expires_at TIMESTAMPTZ,
            is_active BOOLEAN NOT NULL DEFAULT TRUE,
            flow_id TEXT NOT NULL REFERENCES public.flows(id) ON DELETE CASCADE,
            user_id TEXT NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
            created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
        );

        -- Create audit_logs table
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
    `;

    if (!(await executeSQL(tablesSQL, 'Creating tables'))) return;

    // Step 3: Create indexes
    console.log('\n⚡ Step 3: Creating indexes for performance...');

    const indexesSQL = `
        -- Users indexes
        CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_users_email ON public.users(email);
        CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_users_role ON public.users(role);
        CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_users_created_at ON public.users(created_at);

        -- Clients indexes
        CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_clients_user_id ON public.clients(user_id);
        CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_clients_status ON public.clients(status);
        CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_clients_email ON public.clients(email) WHERE email IS NOT NULL;
        CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_clients_created_at ON public.clients(created_at);

        -- Flows indexes
        CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_flows_user_id ON public.flows(user_id);
        CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_flows_client_id ON public.flows(client_id) WHERE client_id IS NOT NULL;
        CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_flows_status ON public.flows(status);
        CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_flows_is_public ON public.flows(is_public) WHERE is_public = TRUE;
        CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_flows_created_at ON public.flows(created_at);

        -- Flow versions indexes
        CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_flow_versions_flow_id ON public.flow_versions(flow_id);
        CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_flow_versions_version ON public.flow_versions(version);
        CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_flow_versions_created_at ON public.flow_versions(created_at);

        -- Shares indexes
        CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_shares_token ON public.shares(token);
        CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_shares_flow_id ON public.shares(flow_id);
        CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_shares_user_id ON public.shares(user_id);
        CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_shares_expires_at ON public.shares(expires_at) WHERE expires_at IS NOT NULL;
        CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_shares_is_active ON public.shares(is_active) WHERE is_active = TRUE;

        -- Audit logs indexes
        CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_audit_logs_user_id ON public.audit_logs(user_id);
        CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_audit_logs_resource ON public.audit_logs(resource);
        CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_audit_logs_action ON public.audit_logs(action);
        CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_audit_logs_created_at ON public.audit_logs(created_at);
        CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_audit_logs_resource_id ON public.audit_logs(resource_id) WHERE resource_id IS NOT NULL;
    `;

    if (!(await executeSQL(indexesSQL, 'Creating performance indexes'))) return;

    // Step 4: Create triggers
    console.log('\n🔄 Step 4: Setting up automated triggers...');

    const triggersSQL = `
        -- Function to update the updated_at column
        CREATE OR REPLACE FUNCTION public.set_updated_at()
        RETURNS TRIGGER AS $$
        BEGIN
            NEW.updated_at = NOW();
            RETURN NEW;
        END;
        $$ LANGUAGE plpgsql;

        -- Apply updated_at triggers to tables that need them
        DROP TRIGGER IF EXISTS tr_users_updated_at ON public.users;
        CREATE TRIGGER tr_users_updated_at
            BEFORE UPDATE ON public.users
            FOR EACH ROW
            EXECUTE FUNCTION public.set_updated_at();

        DROP TRIGGER IF EXISTS tr_clients_updated_at ON public.clients;
        CREATE TRIGGER tr_clients_updated_at
            BEFORE UPDATE ON public.clients
            FOR EACH ROW
            EXECUTE FUNCTION public.set_updated_at();

        DROP TRIGGER IF EXISTS tr_flows_updated_at ON public.flows;
        CREATE TRIGGER tr_flows_updated_at
            BEFORE UPDATE ON public.flows
            FOR EACH ROW
            EXECUTE FUNCTION public.set_updated_at();
    `;

    if (!(await executeSQL(triggersSQL, 'Setting up triggers'))) return;

    // Step 5: Enable RLS and create policies
    console.log('\n🔐 Step 5: Setting up Row Level Security...');

    const rlsSQL = `
        -- Enable RLS on all tables
        ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
        ALTER TABLE public.clients ENABLE ROW LEVEL SECURITY;
        ALTER TABLE public.flows ENABLE ROW LEVEL SECURITY;
        ALTER TABLE public.flow_versions ENABLE ROW LEVEL SECURITY;
        ALTER TABLE public.shares ENABLE ROW LEVEL SECURITY;
        ALTER TABLE public.audit_logs ENABLE ROW LEVEL SECURITY;

        -- Users policies
        DROP POLICY IF EXISTS "Users can view their own profile" ON public.users;
        CREATE POLICY "Users can view their own profile" ON public.users
            FOR SELECT USING (auth.uid()::text = id);

        DROP POLICY IF EXISTS "Users can update their own profile" ON public.users;
        CREATE POLICY "Users can update their own profile" ON public.users
            FOR UPDATE USING (auth.uid()::text = id);

        DROP POLICY IF EXISTS "Admins can view all users" ON public.users;
        CREATE POLICY "Admins can view all users" ON public.users
            FOR SELECT USING (
                EXISTS (
                    SELECT 1 FROM public.users u 
                    WHERE u.id = auth.uid()::text AND u.role = 'ADMIN'
                )
            );

        -- Clients policies
        DROP POLICY IF EXISTS "Users can view their own clients" ON public.clients;
        CREATE POLICY "Users can view their own clients" ON public.clients
            FOR SELECT USING (user_id = auth.uid()::text);

        DROP POLICY IF EXISTS "Users can manage their own clients" ON public.clients;
        CREATE POLICY "Users can manage their own clients" ON public.clients
            FOR ALL USING (user_id = auth.uid()::text);

        -- Flows policies  
        DROP POLICY IF EXISTS "Users can view their own flows" ON public.flows;
        CREATE POLICY "Users can view their own flows" ON public.flows
            FOR SELECT USING (user_id = auth.uid()::text);

        DROP POLICY IF EXISTS "Users can view public flows" ON public.flows;
        CREATE POLICY "Users can view public flows" ON public.flows
            FOR SELECT USING (is_public = true);

        DROP POLICY IF EXISTS "Users can manage their own flows" ON public.flows;
        CREATE POLICY "Users can manage their own flows" ON public.flows
            FOR ALL USING (user_id = auth.uid()::text);

        -- Flow versions policies
        DROP POLICY IF EXISTS "Users can view versions of their flows" ON public.flow_versions;
        CREATE POLICY "Users can view versions of their flows" ON public.flow_versions
            FOR SELECT USING (
                EXISTS (
                    SELECT 1 FROM public.flows f 
                    WHERE f.id = flow_id AND f.user_id = auth.uid()::text
                )
            );

        DROP POLICY IF EXISTS "Users can view versions of public flows" ON public.flow_versions;
        CREATE POLICY "Users can view versions of public flows" ON public.flow_versions
            FOR SELECT USING (
                EXISTS (
                    SELECT 1 FROM public.flows f 
                    WHERE f.id = flow_id AND f.is_public = true
                )
            );

        DROP POLICY IF EXISTS "Users can manage versions of their flows" ON public.flow_versions;
        CREATE POLICY "Users can manage versions of their flows" ON public.flow_versions
            FOR ALL USING (
                EXISTS (
                    SELECT 1 FROM public.flows f 
                    WHERE f.id = flow_id AND f.user_id = auth.uid()::text
                )
            );

        -- Shares policies
        DROP POLICY IF EXISTS "Users can view their own shares" ON public.shares;
        CREATE POLICY "Users can view their own shares" ON public.shares
            FOR SELECT USING (user_id = auth.uid()::text);

        DROP POLICY IF EXISTS "Users can manage their own shares" ON public.shares;
        CREATE POLICY "Users can manage their own shares" ON public.shares
            FOR ALL USING (user_id = auth.uid()::text);

        -- Audit logs policies
        DROP POLICY IF EXISTS "Users can view their own audit logs" ON public.audit_logs;
        CREATE POLICY "Users can view their own audit logs" ON public.audit_logs
            FOR SELECT USING (user_id = auth.uid()::text);

        DROP POLICY IF EXISTS "Admins can view all audit logs" ON public.audit_logs;
        CREATE POLICY "Admins can view all audit logs" ON public.audit_logs
            FOR SELECT USING (
                EXISTS (
                    SELECT 1 FROM public.users u 
                    WHERE u.id = auth.uid()::text AND u.role = 'ADMIN'
                )
            );

        DROP POLICY IF EXISTS "System can insert audit logs" ON public.audit_logs;
        CREATE POLICY "System can insert audit logs" ON public.audit_logs
            FOR INSERT WITH CHECK (true);
    `;

    if (!(await executeSQL(rlsSQL, 'Setting up Row Level Security'))) return;

    // Step 6: Create utility functions
    console.log('\n🔧 Step 6: Creating utility functions...');

    const functionsSQL = `
        -- Function to get the latest flow version
        CREATE OR REPLACE FUNCTION public.get_latest_flow_version(flow_id TEXT)
        RETURNS public.flow_versions AS $$
        DECLARE
            result public.flow_versions;
        BEGIN
            SELECT * INTO result
            FROM public.flow_versions fv
            WHERE fv.flow_id = get_latest_flow_version.flow_id
            ORDER BY fv.version DESC
            LIMIT 1;
            
            RETURN result;
        END;
        $$ LANGUAGE plpgsql SECURITY DEFINER;

        -- Function to create a new flow version
        CREATE OR REPLACE FUNCTION public.create_flow_version(
            p_flow_id TEXT,
            p_data JSONB
        )
        RETURNS public.flow_versions AS $$
        DECLARE
            new_version INTEGER;
            result public.flow_versions;
        BEGIN
            -- Get next version number
            SELECT COALESCE(MAX(version), 0) + 1 INTO new_version
            FROM public.flow_versions
            WHERE flow_id = p_flow_id;
            
            -- Insert new version
            INSERT INTO public.flow_versions (flow_id, version, data)
            VALUES (p_flow_id, new_version, p_data)
            RETURNING * INTO result;
            
            RETURN result;
        END;
        $$ LANGUAGE plpgsql SECURITY DEFINER;

        -- Function to log audit events
        CREATE OR REPLACE FUNCTION public.log_audit_event(
            p_user_id TEXT,
            p_action TEXT,
            p_resource TEXT,
            p_resource_id TEXT DEFAULT NULL,
            p_details JSONB DEFAULT NULL,
            p_ip_address TEXT DEFAULT NULL,
            p_user_agent TEXT DEFAULT NULL
        )
        RETURNS public.audit_logs AS $$
        DECLARE
            result public.audit_logs;
        BEGIN
            INSERT INTO public.audit_logs (
                user_id, action, resource, resource_id, details, ip_address, user_agent
            )
            VALUES (
                p_user_id, p_action, p_resource, p_resource_id, p_details, p_ip_address, p_user_agent
            )
            RETURNING * INTO result;
            
            RETURN result;
        END;
        $$ LANGUAGE plpgsql SECURITY DEFINER;
    `;

    if (!(await executeSQL(functionsSQL, 'Creating utility functions'))) return;

    // Step 7: Create views
    console.log('\n👁️  Step 7: Creating helpful views...');

    const viewsSQL = `
        -- View for flows with latest version data
        CREATE OR REPLACE VIEW public.flows_with_latest_version AS
        SELECT 
            f.*,
            fv.version as latest_version,
            fv.data as latest_data,
            fv.created_at as version_created_at
        FROM public.flows f
        LEFT JOIN public.flow_versions fv ON f.id = fv.flow_id
        WHERE fv.version = (
            SELECT MAX(version) 
            FROM public.flow_versions fv2 
            WHERE fv2.flow_id = f.id
        ) OR fv.version IS NULL;

        -- View for user statistics
        CREATE OR REPLACE VIEW public.user_stats AS
        SELECT 
            u.id,
            u.name,
            u.email,
            u.role,
            COUNT(DISTINCT c.id) as client_count,
            COUNT(DISTINCT f.id) as flow_count,
            COUNT(DISTINCT s.id) as share_count,
            u.created_at
        FROM public.users u
        LEFT JOIN public.clients c ON u.id = c.user_id
        LEFT JOIN public.flows f ON u.id = f.user_id  
        LEFT JOIN public.shares s ON u.id = s.user_id
        GROUP BY u.id, u.name, u.email, u.role, u.created_at;
    `;

    if (!(await executeSQL(viewsSQL, 'Creating helpful views'))) return;

    // Step 8: Verification
    console.log('\n✅ Step 8: Verifying schema setup...');

    try {
        const { data: tables, error: tablesError } = await supabase
            .from('information_schema.tables')
            .select('table_name')
            .eq('table_schema', 'public')
            .in('table_name', ['users', 'clients', 'flows', 'flow_versions', 'shares', 'audit_logs']);

        if (tablesError) {
            console.error('❌ Error verifying tables:', tablesError);
            return;
        }

        console.log('📋 Created tables:', tables?.map(t => t.table_name).sort());

        // Test a simple query to ensure everything works
        const { data: userCount, error: countError } = await supabase
            .from('users')
            .select('id', { count: 'exact', head: true });

        if (countError) {
            console.error('❌ Error testing table access:', countError);
            return;
        }

        console.log(`📊 Users table is accessible (current count: ${userCount || 0})`);

    } catch (err) {
        console.error('❌ Error during verification:', err.message);
        return;
    }

    console.log('\n🎉 Database schema setup completed successfully!');
    console.log('\n📋 Next steps:');
    console.log('1. Update your .env file with the Supabase connection details');
    console.log('2. Test the connection with your frontend application');
    console.log('3. Run any initial data migrations if needed');
    console.log('4. Consider setting up database backups and monitoring');
}

// Execute the setup
setupSchema()
    .then(() => {
        console.log('\n✨ Schema setup completed successfully!');
        process.exit(0);
    })
    .catch((error) => {
        console.error('\n💥 Schema setup failed:', error);
        process.exit(1);
    });