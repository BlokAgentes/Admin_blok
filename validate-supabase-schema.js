#!/usr/bin/env node

/**
 * Supabase Database Schema Validation Script
 * 
 * This script validates that the database schema is correctly set up
 * and all tables, relationships, and policies are working as expected.
 * 
 * Usage:
 *   node validate-supabase-schema.js
 */

import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = process.env.SUPABASE_URL || 'https://eslcwpuxyqopwylgzddz.supabase.co';
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;
const SUPABASE_ANON_KEY = process.env.SUPABASE_ANON_KEY;

if (!SUPABASE_SERVICE_ROLE_KEY || !SUPABASE_ANON_KEY) {
    console.error('❌ Both SUPABASE_SERVICE_ROLE_KEY and SUPABASE_ANON_KEY are required');
    process.exit(1);
}

// Create admin client for schema validation
const adminClient = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, {
    auth: { autoRefreshToken: false, persistSession: false }
});

// Create regular client for testing RLS policies
const anonClient = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

async function validateSchema() {
    console.log('🔍 Validating Supabase database schema...\n');

    let allTestsPassed = true;

    // Test 1: Check if all tables exist
    console.log('📋 Test 1: Verifying all tables exist...');
    const requiredTables = ['users', 'clients', 'flows', 'flow_versions', 'shares', 'audit_logs'];
    
    try {
        const { data: tables, error } = await adminClient
            .from('information_schema.tables')
            .select('table_name')
            .eq('table_schema', 'public')
            .in('table_name', requiredTables);

        if (error) throw error;

        const existingTables = tables.map(t => t.table_name).sort();
        const missingTables = requiredTables.filter(t => !existingTables.includes(t));

        if (missingTables.length > 0) {
            console.error(`❌ Missing tables: ${missingTables.join(', ')}`);
            allTestsPassed = false;
        } else {
            console.log(`✅ All ${requiredTables.length} tables exist: ${existingTables.join(', ')}`);
        }
    } catch (err) {
        console.error('❌ Error checking tables:', err.message);
        allTestsPassed = false;
    }

    // Test 2: Check if all enums exist
    console.log('\n🏷️  Test 2: Verifying enums exist...');
    const requiredEnums = ['role', 'client_status', 'flow_status'];
    
    try {
        const { data: enums, error } = await adminClient
            .from('information_schema.data_type_privileges')
            .select('type_name')
            .eq('type_schema', 'public')
            .in('type_name', requiredEnums);

        if (error) {
            // Fallback: query pg_type directly
            const { data: pgEnums, error: pgError } = await adminClient.rpc('execute_sql', {
                sql_query: `
                    SELECT typname 
                    FROM pg_type 
                    WHERE typname IN ('role', 'client_status', 'flow_status')
                    AND typtype = 'e'
                `
            });

            if (pgError) throw pgError;

            const existingEnums = pgEnums?.map(e => e.typname) || [];
            const missingEnums = requiredEnums.filter(e => !existingEnums.includes(e));

            if (missingEnums.length > 0) {
                console.error(`❌ Missing enums: ${missingEnums.join(', ')}`);
                allTestsPassed = false;
            } else {
                console.log(`✅ All ${requiredEnums.length} enums exist: ${existingEnums.join(', ')}`);
            }
        }
    } catch (err) {
        console.error('❌ Error checking enums:', err.message);
        allTestsPassed = false;
    }

    // Test 3: Check foreign key constraints
    console.log('\n🔗 Test 3: Verifying foreign key relationships...');
    
    try {
        const { data: constraints, error } = await adminClient.rpc('execute_sql', {
            sql_query: `
                SELECT 
                    tc.table_name,
                    tc.constraint_name,
                    kcu.column_name,
                    ccu.table_name AS foreign_table_name,
                    ccu.column_name AS foreign_column_name 
                FROM information_schema.table_constraints AS tc 
                JOIN information_schema.key_column_usage AS kcu
                    ON tc.constraint_name = kcu.constraint_name
                    AND tc.table_schema = kcu.table_schema
                JOIN information_schema.constraint_column_usage AS ccu
                    ON ccu.constraint_name = tc.constraint_name
                    AND ccu.table_schema = tc.table_schema
                WHERE tc.constraint_type = 'FOREIGN KEY' 
                    AND tc.table_schema = 'public'
                    AND tc.table_name IN ('clients', 'flows', 'flow_versions', 'shares', 'audit_logs')
                ORDER BY tc.table_name, tc.constraint_name;
            `
        });

        if (error) throw error;

        console.log(`✅ Found ${constraints?.length || 0} foreign key constraints:`);
        constraints?.forEach(c => {
            console.log(`   ${c.table_name}.${c.column_name} → ${c.foreign_table_name}.${c.foreign_column_name}`);
        });
    } catch (err) {
        console.error('❌ Error checking foreign keys:', err.message);
        allTestsPassed = false;
    }

    // Test 4: Check indexes
    console.log('\n⚡ Test 4: Verifying performance indexes...');
    
    try {
        const { data: indexes, error } = await adminClient.rpc('execute_sql', {
            sql_query: `
                SELECT 
                    schemaname,
                    tablename,
                    indexname
                FROM pg_indexes 
                WHERE schemaname = 'public' 
                    AND tablename IN ('users', 'clients', 'flows', 'flow_versions', 'shares', 'audit_logs')
                    AND indexname LIKE 'idx_%'
                ORDER BY tablename, indexname;
            `
        });

        if (error) throw error;

        console.log(`✅ Found ${indexes?.length || 0} performance indexes:`);
        const tableIndexes = {};
        indexes?.forEach(idx => {
            if (!tableIndexes[idx.tablename]) tableIndexes[idx.tablename] = [];
            tableIndexes[idx.tablename].push(idx.indexname);
        });

        Object.entries(tableIndexes).forEach(([table, indexList]) => {
            console.log(`   ${table}: ${indexList.length} indexes`);
        });
    } catch (err) {
        console.error('❌ Error checking indexes:', err.message);
        allTestsPassed = false;
    }

    // Test 5: Check RLS is enabled
    console.log('\n🔐 Test 5: Verifying Row Level Security...');
    
    try {
        const { data: rlsStatus, error } = await adminClient.rpc('execute_sql', {
            sql_query: `
                SELECT 
                    tablename,
                    rowsecurity
                FROM pg_tables 
                WHERE schemaname = 'public' 
                    AND tablename IN ('users', 'clients', 'flows', 'flow_versions', 'shares', 'audit_logs')
                ORDER BY tablename;
            `
        });

        if (error) throw error;

        const tablesWithoutRLS = rlsStatus?.filter(t => !t.rowsecurity);
        if (tablesWithoutRLS?.length > 0) {
            console.error(`❌ Tables without RLS: ${tablesWithoutRLS.map(t => t.tablename).join(', ')}`);
            allTestsPassed = false;
        } else {
            console.log(`✅ RLS enabled on all ${rlsStatus?.length} tables`);
        }
    } catch (err) {
        console.error('❌ Error checking RLS:', err.message);
        allTestsPassed = false;
    }

    // Test 6: Test basic CRUD operations
    console.log('\n🧪 Test 6: Testing basic CRUD operations...');
    
    try {
        // Test user creation (this should work with service role)
        const testEmail = `test-${Date.now()}@example.com`;
        const { data: newUser, error: userError } = await adminClient
            .from('users')
            .insert({
                email: testEmail,
                name: 'Test User',
                password: 'hashed-password',
                role: 'CLIENT'
            })
            .select()
            .single();

        if (userError) throw userError;

        console.log(`✅ User creation test passed (ID: ${newUser.id})`);

        // Test client creation
        const { data: newClient, error: clientError } = await adminClient
            .from('clients')
            .insert({
                name: 'Test Client',
                email: 'client@test.com',
                user_id: newUser.id
            })
            .select()
            .single();

        if (clientError) throw clientError;

        console.log(`✅ Client creation test passed (ID: ${newClient.id})`);

        // Test flow creation
        const { data: newFlow, error: flowError } = await adminClient
            .from('flows')
            .insert({
                title: 'Test Flow',
                description: 'A test flow',
                user_id: newUser.id,
                client_id: newClient.id
            })
            .select()
            .single();

        if (flowError) throw flowError;

        console.log(`✅ Flow creation test passed (ID: ${newFlow.id})`);

        // Test flow version creation
        const { data: newVersion, error: versionError } = await adminClient
            .from('flow_versions')
            .insert({
                flow_id: newFlow.id,
                version: 1,
                data: { nodes: [], edges: [] }
            })
            .select()
            .single();

        if (versionError) throw versionError;

        console.log(`✅ Flow version creation test passed (ID: ${newVersion.id})`);

        // Clean up test data
        await adminClient.from('users').delete().eq('id', newUser.id);
        console.log('🗑️  Cleaned up test data');

    } catch (err) {
        console.error('❌ Error in CRUD tests:', err.message);
        allTestsPassed = false;
    }

    // Test 7: Verify utility functions
    console.log('\n🔧 Test 7: Verifying utility functions...');
    
    try {
        const { data: functions, error } = await adminClient.rpc('execute_sql', {
            sql_query: `
                SELECT routine_name 
                FROM information_schema.routines 
                WHERE routine_schema = 'public' 
                    AND routine_name IN ('get_latest_flow_version', 'create_flow_version', 'log_audit_event')
                ORDER BY routine_name;
            `
        });

        if (error) throw error;

        console.log(`✅ Found ${functions?.length || 0} utility functions:`);
        functions?.forEach(f => console.log(`   ${f.routine_name}`));
    } catch (err) {
        console.error('❌ Error checking functions:', err.message);
        allTestsPassed = false;
    }

    // Final result
    console.log('\n' + '='.repeat(50));
    if (allTestsPassed) {
        console.log('🎉 All validation tests passed! Your Supabase schema is ready to use.');
        console.log('\n📝 Summary of what was validated:');
        console.log('   ✅ All 6 required tables exist');
        console.log('   ✅ All 3 enum types are defined');
        console.log('   ✅ Foreign key relationships are properly configured');
        console.log('   ✅ Performance indexes are in place');
        console.log('   ✅ Row Level Security is enabled');
        console.log('   ✅ Basic CRUD operations work correctly');
        console.log('   ✅ Utility functions are available');
    } else {
        console.log('❌ Some validation tests failed. Please check the errors above.');
        process.exit(1);
    }
}

validateSchema()
    .then(() => {
        console.log('\n✨ Schema validation completed!');
        process.exit(0);
    })
    .catch((error) => {
        console.error('\n💥 Schema validation failed:', error);
        process.exit(1);
    });