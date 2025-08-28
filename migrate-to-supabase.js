#!/usr/bin/env node

/**
 * Migration Script: Prisma → Supabase
 * 
 * This script helps migrate data from your existing Prisma PostgreSQL 
 * database to your new Supabase database.
 * 
 * Usage:
 *   node migrate-to-supabase.js [--dry-run]
 */

import { createClient } from '@supabase/supabase-js';
import { PrismaClient } from '@prisma/client';

// Configuration
const SUPABASE_URL = process.env.SUPABASE_URL || 'https://eslcwpuxyqopwylgzddz.supabase.co';
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;
const isDryRun = process.argv.includes('--dry-run');

if (!SUPABASE_SERVICE_ROLE_KEY) {
    console.error('❌ SUPABASE_SERVICE_ROLE_KEY environment variable is required');
    process.exit(1);
}

// Initialize clients
const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, {
    auth: { autoRefreshToken: false, persistSession: false }
});

const prisma = new PrismaClient();

async function migrateTables() {
    console.log(`🚚 ${isDryRun ? 'DRY RUN: ' : ''}Starting data migration from Prisma to Supabase...\n`);

    try {
        // Step 1: Migrate users
        console.log('👥 Step 1: Migrating users...');
        const users = await prisma.user.findMany();
        console.log(`   Found ${users.length} users to migrate`);

        if (!isDryRun && users.length > 0) {
            const { data: migratedUsers, error: usersError } = await supabase
                .from('users')
                .upsert(users.map(user => ({
                    id: user.id,
                    email: user.email,
                    name: user.name,
                    password: user.password,
                    role: user.role,
                    created_at: user.createdAt.toISOString(),
                    updated_at: user.updatedAt.toISOString()
                })))
                .select();

            if (usersError) throw usersError;
            console.log(`   ✅ Migrated ${migratedUsers.length} users`);
        }

        // Step 2: Migrate clients
        console.log('\n🏢 Step 2: Migrating clients...');
        const clients = await prisma.client.findMany();
        console.log(`   Found ${clients.length} clients to migrate`);

        if (!isDryRun && clients.length > 0) {
            const { data: migratedClients, error: clientsError } = await supabase
                .from('clients')
                .upsert(clients.map(client => ({
                    id: client.id,
                    name: client.name,
                    email: client.email,
                    phone: client.phone,
                    company: client.company,
                    description: client.description,
                    status: client.status,
                    user_id: client.userId,
                    created_at: client.createdAt.toISOString(),
                    updated_at: client.updatedAt.toISOString()
                })))
                .select();

            if (clientsError) throw clientsError;
            console.log(`   ✅ Migrated ${migratedClients.length} clients`);
        }

        // Step 3: Migrate flows
        console.log('\n🌊 Step 3: Migrating flows...');
        const flows = await prisma.flow.findMany();
        console.log(`   Found ${flows.length} flows to migrate`);

        if (!isDryRun && flows.length > 0) {
            const { data: migratedFlows, error: flowsError } = await supabase
                .from('flows')
                .upsert(flows.map(flow => ({
                    id: flow.id,
                    title: flow.title,
                    description: flow.description,
                    status: flow.status,
                    is_public: flow.isPublic,
                    user_id: flow.userId,
                    client_id: flow.clientId,
                    created_at: flow.createdAt.toISOString(),
                    updated_at: flow.updatedAt.toISOString()
                })))
                .select();

            if (flowsError) throw flowsError;
            console.log(`   ✅ Migrated ${migratedFlows.length} flows`);
        }

        // Step 4: Migrate flow versions
        console.log('\n📝 Step 4: Migrating flow versions...');
        const flowVersions = await prisma.flowVersion.findMany();
        console.log(`   Found ${flowVersions.length} flow versions to migrate`);

        if (!isDryRun && flowVersions.length > 0) {
            const { data: migratedVersions, error: versionsError } = await supabase
                .from('flow_versions')
                .upsert(flowVersions.map(version => ({
                    id: version.id,
                    version: version.version,
                    data: version.data,
                    flow_id: version.flowId,
                    created_at: version.createdAt.toISOString()
                })))
                .select();

            if (versionsError) throw versionsError;
            console.log(`   ✅ Migrated ${migratedVersions.length} flow versions`);
        }

        // Step 5: Migrate shares
        console.log('\n🔗 Step 5: Migrating shares...');
        const shares = await prisma.share.findMany();
        console.log(`   Found ${shares.length} shares to migrate`);

        if (!isDryRun && shares.length > 0) {
            const { data: migratedShares, error: sharesError } = await supabase
                .from('shares')
                .upsert(shares.map(share => ({
                    id: share.id,
                    token: share.token,
                    expires_at: share.expiresAt?.toISOString(),
                    is_active: share.isActive,
                    flow_id: share.flowId,
                    user_id: share.userId,
                    created_at: share.createdAt.toISOString()
                })))
                .select();

            if (sharesError) throw sharesError;
            console.log(`   ✅ Migrated ${migratedShares.length} shares`);
        }

        // Step 6: Migrate audit logs
        console.log('\n📊 Step 6: Migrating audit logs...');
        const auditLogs = await prisma.auditLog.findMany();
        console.log(`   Found ${auditLogs.length} audit logs to migrate`);

        if (!isDryRun && auditLogs.length > 0) {
            const { data: migratedLogs, error: logsError } = await supabase
                .from('audit_logs')
                .upsert(auditLogs.map(log => ({
                    id: log.id,
                    action: log.action,
                    resource: log.resource,
                    resource_id: log.resourceId,
                    details: log.details,
                    ip_address: log.ipAddress,
                    user_agent: log.userAgent,
                    user_id: log.userId,
                    created_at: log.createdAt.toISOString()
                })))
                .select();

            if (logsError) throw logsError;
            console.log(`   ✅ Migrated ${migratedLogs.length} audit logs`);
        }

        // Summary
        console.log('\n' + '='.repeat(50));
        console.log(`🎉 ${isDryRun ? 'DRY RUN COMPLETED' : 'MIGRATION COMPLETED SUCCESSFULLY'}!`);
        console.log('\n📊 Migration Summary:');
        console.log(`   Users: ${users.length}`);
        console.log(`   Clients: ${clients.length}`);
        console.log(`   Flows: ${flows.length}`);
        console.log(`   Flow Versions: ${flowVersions.length}`);
        console.log(`   Shares: ${shares.length}`);
        console.log(`   Audit Logs: ${auditLogs.length}`);

        if (isDryRun) {
            console.log('\n💡 Run without --dry-run to perform actual migration');
        } else {
            console.log('\n✨ Your data has been successfully migrated to Supabase!');
            console.log('\n📋 Next steps:');
            console.log('1. Run: node validate-supabase-schema.js');
            console.log('2. Update your application to use Supabase client');
            console.log('3. Test all application features thoroughly');
            console.log('4. Consider setting up database backups');
        }

    } catch (error) {
        console.error('\n💥 Migration failed:', error.message);
        console.log('\n🛠️  Troubleshooting tips:');
        console.log('1. Ensure your Prisma database is accessible');
        console.log('2. Verify Supabase API keys are correct');
        console.log('3. Check that the Supabase schema is set up first');
        console.log('4. Run with --dry-run to test without making changes');
        process.exit(1);
    } finally {
        await prisma.$disconnect();
        rl.close();
    }
}

configureSupabase().catch(console.error);