# Supabase Database Setup Guide

This guide helps you set up the complete database schema for the Blok Platform using Supabase.

## Prerequisites

1. **Supabase Project**: You should already have a Supabase project set up
   - Project Reference: `eslcwpuxyqopwylgzddz`
   - URL: `https://eslcwpuxyqopwylgzddz.supabase.co`

2. **API Keys**: You'll need both keys from your Supabase dashboard:
   - **Service Role Key** (for admin operations) 
   - **Anon Key** (for client operations)

3. **Node.js**: Version 18+ (already configured in package.json)

## Environment Setup

### 1. Get Your API Keys

1. Go to your Supabase dashboard: https://supabase.com/dashboard/project/eslcwpuxyqopwylgzddz
2. Navigate to **Settings** → **API**
3. Copy both keys:
   - `anon` `public` key → This is your `SUPABASE_ANON_KEY`
   - `service_role` `secret` key → This is your `SUPABASE_SERVICE_ROLE_KEY`

### 2. Update Environment Variables

Add these to your `.env` file:

```env
# Supabase Configuration
SUPABASE_URL="https://eslcwpuxyqopwylgzddz.supabase.co"
SUPABASE_ANON_KEY="your_anon_key_here"
SUPABASE_SERVICE_ROLE_KEY="your_service_role_key_here"

# Update DATABASE_URL to point to Supabase
DATABASE_URL="postgresql://postgres:[your-password]@db.eslcwpuxyqopwylgzddz.supabase.co:5432/postgres"
```

### 3. Update Frontend Configuration

Update your frontend Supabase configuration in `/apps/frontend/src/lib/supabase.ts`:

```typescript
import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

export const supabase = createClient(supabaseUrl, supabaseAnonKey)
```

And add these to your frontend `.env.local`:

```env
NEXT_PUBLIC_SUPABASE_URL="https://eslcwpuxyqopwylgzddz.supabase.co"
NEXT_PUBLIC_SUPABASE_ANON_KEY="your_anon_key_here"
```

## Schema Setup Methods

You have 3 options to set up your database schema:

### Option 1: Automated Setup Script (Recommended)

```bash
# Install dependencies (if not already installed)
pnpm install

# Set up the complete schema automatically
node setup-supabase-schema.js
```

### Option 2: Manual SQL Execution

1. Open the Supabase SQL Editor: https://supabase.com/dashboard/project/eslcwpuxyqopwylgzddz/sql
2. Copy and paste the contents of `supabase-schema-setup.sql`
3. Execute the script

### Option 3: Using Supabase CLI

```bash
# Install Supabase CLI
npm install -g supabase

# Login to Supabase
supabase login

# Link to your project
supabase link --project-ref eslcwpuxyqopwylgzddz

# Apply the schema
supabase db push --include-all < supabase-schema-setup.sql
```

## Schema Validation

After setup, validate everything is working:

```bash
node validate-supabase-schema.js
```

This will check:
- ✅ All 6 tables exist (users, clients, flows, flow_versions, shares, audit_logs)
- ✅ All 3 enums are defined (role, client_status, flow_status)  
- ✅ Foreign key relationships work
- ✅ Performance indexes are created
- ✅ Row Level Security is enabled
- ✅ Basic CRUD operations function
- ✅ Utility functions are available

## Database Schema Overview

### Tables Created

1. **users** - Platform users with role-based access
2. **clients** - Customer records with contact information
3. **flows** - Workflow definitions with versioning support
4. **flow_versions** - Individual versions of workflow diagrams
5. **shares** - Public/private sharing tokens for collaboration
6. **audit_logs** - Comprehensive action logging for compliance

### Enums Created

1. **role** - `ADMIN`, `CLIENT`
2. **client_status** - `ACTIVE`, `INACTIVE`, `ARCHIVED`  
3. **flow_status** - `DRAFT`, `PUBLISHED`, `ARCHIVED`

### Key Features

- **Referential Integrity**: Proper foreign key constraints with cascading deletes
- **Performance**: Strategic indexes on frequently queried columns
- **Security**: Row Level Security (RLS) policies for data isolation
- **Auditing**: Complete audit trail for all user actions
- **Versioning**: Flow diagrams support multiple versions
- **Sharing**: Secure token-based sharing with expiration
- **Validation**: Data validation constraints for emails, phones, etc.

## Row Level Security (RLS) Policies

The schema includes comprehensive RLS policies:

### Users
- Users can view/update their own profile
- Admins can view all users

### Clients  
- Users can only access their own client records

### Flows
- Users can access their own flows
- Public flows are accessible to everyone
- Private flows are restricted to owners

### Flow Versions
- Access tied to parent flow permissions
- Supports both private and public flow versions

### Shares
- Users can only manage their own sharing tokens

### Audit Logs
- Users can view their own audit logs
- Admins can view all audit logs
- System can insert logs (for automated logging)

## Utility Functions

### Flow Version Management
```sql
-- Get the latest version of a flow
SELECT * FROM public.get_latest_flow_version('flow-id');

-- Create a new version (automatically increments version number)
SELECT * FROM public.create_flow_version('flow-id', '{"nodes": [], "edges": []}');
```

### Audit Logging
```sql
-- Log an audit event
SELECT * FROM public.log_audit_event(
    'user-id', 
    'CREATE', 
    'flow', 
    'flow-id', 
    '{"title": "New Flow"}',
    '192.168.1.1',
    'Mozilla/5.0...'
);
```

### Helpful Views
```sql
-- Get flows with their latest version data
SELECT * FROM public.flows_with_latest_version;

-- Get user statistics  
SELECT * FROM public.user_stats;
```

## Migration from Prisma

If you're migrating from an existing Prisma setup:

1. **Backup existing data** before migration
2. **Export data** from your current PostgreSQL database:
   ```bash
   cd apps/frontend
   npx prisma db pull --print > current-schema.sql
   ```
3. **Run the Supabase setup** using the methods above
4. **Import your data** to Supabase
5. **Update connection strings** to point to Supabase
6. **Test thoroughly** with the validation script

## Troubleshooting

### Common Issues

**Permission Errors**
- Ensure you're using the service role key for setup
- Check that RLS policies allow the operations you need

**Connection Errors** 
- Verify your `SUPABASE_URL` and API keys
- Ensure your Supabase project is active

**Migration Issues**
- Check foreign key constraint violations
- Ensure all enum values match your Prisma schema
- Validate data types are compatible

### Getting Help

1. Check Supabase logs in your dashboard
2. Use the validation script to identify specific issues
3. Review the generated SQL script for manual debugging
4. Check Supabase documentation: https://supabase.com/docs

## Performance Considerations

The schema includes optimizations for:

- **Query Performance**: Indexes on frequently searched columns
- **JSON Operations**: JSONB for flow diagram data with GIN indexes
- **Time-based Queries**: Indexes on created_at/updated_at columns
- **Authentication**: Optimized user lookups by email and role
- **Audit Trails**: Efficient logging with minimal performance impact

## Security Features

- **Password Hashing**: bcryptjs compatible password storage
- **Token Security**: Unique sharing tokens with expiration
- **Data Isolation**: RLS policies prevent cross-user data access
- **Input Validation**: Email, phone, and data format constraints
- **Audit Compliance**: Complete action logging for regulatory requirements

## Next Steps

After successful setup:

1. ✅ Update your frontend Supabase client configuration
2. ✅ Test authentication flows with the new schema
3. ✅ Migrate any existing data if needed
4. ✅ Update API routes to use Supabase instead of direct Prisma
5. ✅ Test all application features thoroughly
6. ✅ Set up database monitoring and backups