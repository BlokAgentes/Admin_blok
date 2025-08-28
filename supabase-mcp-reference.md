# Supabase MCP Tools Reference

Based on your `.mcp.json` configuration, you have access to the Supabase MCP server with auth, database, and storage feature groups.

## Available MCP Tools

When connected to the Supabase MCP server, you should have access to these tools:

### Database Operations
- `mcp__supabase__query` - Execute SQL queries
- `mcp__supabase__select` - Select data from tables
- `mcp__supabase__insert` - Insert data into tables
- `mcp__supabase__update` - Update existing records
- `mcp__supabase__delete` - Delete records
- `mcp__supabase__upsert` - Insert or update records

### Schema Management
- `mcp__supabase__create_table` - Create new tables
- `mcp__supabase__alter_table` - Modify existing tables
- `mcp__supabase__drop_table` - Delete tables
- `mcp__supabase__create_index` - Add database indexes
- `mcp__supabase__create_function` - Create stored procedures/functions

### Authentication & User Management
- `mcp__supabase__create_user` - Create new users
- `mcp__supabase__update_user` - Update user information
- `mcp__supabase__delete_user` - Remove users
- `mcp__supabase__list_users` - Get all users
- `mcp__supabase__get_user` - Get specific user details

### Storage Operations
- `mcp__supabase__upload_file` - Upload files to storage buckets
- `mcp__supabase__download_file` - Download files from storage
- `mcp__supabase__delete_file` - Remove files from storage
- `mcp__supabase__list_files` - List files in buckets
- `mcp__supabase__create_bucket` - Create storage buckets

### Row Level Security (RLS)
- `mcp__supabase__create_policy` - Create RLS policies
- `mcp__supabase__update_policy` - Modify existing policies
- `mcp__supabase__delete_policy` - Remove policies
- `mcp__supabase__list_policies` - View all policies

## Using MCP Tools in Claude Code

If the MCP server is properly connected, you can use these tools directly in your Claude Code session:

```javascript
// Example: Create the users table using MCP
mcp__supabase__create_table({
    table_name: "users",
    columns: [
        { name: "id", type: "text", primary_key: true, default: "gen_random_uuid()::text" },
        { name: "email", type: "text", unique: true, not_null: true },
        { name: "name", type: "text", not_null: true },
        { name: "password", type: "text", not_null: true },
        { name: "role", type: "role", default: "CLIENT", not_null: true },
        { name: "created_at", type: "timestamptz", default: "now()", not_null: true },
        { name: "updated_at", type: "timestamptz", default: "now()", not_null: true }
    ]
});

// Example: Insert a new user
mcp__supabase__insert({
    table: "users",
    data: {
        email: "admin@example.com",
        name: "Admin User", 
        password: "$2a$12$...",
        role: "ADMIN"
    }
});

// Example: Query with joins
mcp__supabase__query({
    sql: `
        SELECT f.*, u.name as user_name, c.name as client_name
        FROM flows f
        JOIN users u ON f.user_id = u.id
        LEFT JOIN clients c ON f.client_id = c.id
        WHERE f.status = 'PUBLISHED'
    `
});
```

## Configuration Check

To verify your MCP connection is working, you can test:

```bash
# In Claude Code, test if MCP tools are available
claude --mcp-debug

# Or check connection status
echo "Testing MCP connection..." && claude --test-mcp
```

## Alternative: Direct Supabase Client Usage

If MCP tools are not available, use the Node.js scripts provided:

```bash
# Configure environment variables interactively
pnpm supabase:configure

# Set up the complete database schema
pnpm supabase:setup

# Validate everything is working
pnpm supabase:validate

# Migrate existing data (if you have a Prisma database)
pnpm supabase:migrate --dry-run  # Test first
pnpm supabase:migrate           # Actual migration
```

## MCP Server Status

Your current configuration in `.mcp.json`:

```json
{
  "supabase-auth": {
    "type": "stdio",
    "command": "npx",
    "args": ["-y", "@supabase/mcp-server-supabase@latest", "--feature-groups=auth,database,storage"],
    "env": {
      "SUPABASE_ACCESS_TOKEN": "sbp_786dbf607341bd13c73c5b4446764d37e59ca522",
      "SUPABASE_PROJECT_REF": "eslcwpuxyqopwylgzddz"
    }
  }
}
```

This should give you access to all the database, auth, and storage MCP tools when Claude Code connects to the MCP server.

## Troubleshooting MCP Connection

If MCP tools are not available:

1. **Restart Claude Code** to reconnect to MCP servers
2. **Check MCP server logs** for connection errors
3. **Verify environment variables** in `.mcp.json` are correct
4. **Update MCP server** to latest version: `npm update -g @supabase/mcp-server-supabase`
5. **Use Node.js scripts** as fallback (provided in this setup)

## Benefits of Using MCP vs Direct Scripts

**MCP Tools Advantages:**
- Direct integration with Claude Code session
- Real-time schema manipulation
- Interactive debugging and exploration
- Integrated with Claude's reasoning capabilities

**Node.js Scripts Advantages:**
- Guaranteed to work regardless of MCP status
- Better error handling and validation
- Comprehensive setup with all optimizations
- Self-contained and portable

Both approaches achieve the same result - choose based on your preference and MCP availability.