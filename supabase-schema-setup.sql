-- Supabase Database Schema Setup Script
-- Based on Prisma schema from apps/frontend/prisma/schema.prisma
-- Run this in your Supabase SQL Editor or via CLI

-- ============================================================================
-- 1. CREATE ENUMS FIRST
-- ============================================================================

-- Create Role enum
CREATE TYPE public.role AS ENUM ('ADMIN', 'CLIENT');

-- Create ClientStatus enum  
CREATE TYPE public.client_status AS ENUM ('ACTIVE', 'INACTIVE', 'ARCHIVED');

-- Create FlowStatus enum
CREATE TYPE public.flow_status AS ENUM ('DRAFT', 'PUBLISHED', 'ARCHIVED');

-- ============================================================================
-- 2. CREATE TABLES WITH PROPER RELATIONSHIPS
-- ============================================================================

-- Create users table
CREATE TABLE public.users (
    id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::TEXT,
    email TEXT NOT NULL UNIQUE,
    name TEXT NOT NULL,
    password TEXT NOT NULL,
    role public.role NOT NULL DEFAULT 'CLIENT',
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Create clients table
CREATE TABLE public.clients (
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
CREATE TABLE public.flows (
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
CREATE TABLE public.flow_versions (
    id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::TEXT,
    version INTEGER NOT NULL,
    data JSONB NOT NULL, -- Using JSONB for better performance
    flow_id TEXT NOT NULL REFERENCES public.flows(id) ON DELETE CASCADE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    
    -- Ensure unique version per flow
    CONSTRAINT unique_flow_version UNIQUE (flow_id, version)
);

-- Create shares table
CREATE TABLE public.shares (
    id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::TEXT,
    token TEXT NOT NULL UNIQUE,
    expires_at TIMESTAMPTZ,
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    flow_id TEXT NOT NULL REFERENCES public.flows(id) ON DELETE CASCADE,
    user_id TEXT NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Create audit_logs table
CREATE TABLE public.audit_logs (
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

-- ============================================================================
-- 3. CREATE INDEXES FOR PERFORMANCE
-- ============================================================================

-- Users indexes
CREATE INDEX idx_users_email ON public.users(email);
CREATE INDEX idx_users_role ON public.users(role);
CREATE INDEX idx_users_created_at ON public.users(created_at);

-- Clients indexes
CREATE INDEX idx_clients_user_id ON public.clients(user_id);
CREATE INDEX idx_clients_status ON public.clients(status);
CREATE INDEX idx_clients_email ON public.clients(email);
CREATE INDEX idx_clients_created_at ON public.clients(created_at);

-- Flows indexes
CREATE INDEX idx_flows_user_id ON public.flows(user_id);
CREATE INDEX idx_flows_client_id ON public.flows(client_id);
CREATE INDEX idx_flows_status ON public.flows(status);
CREATE INDEX idx_flows_is_public ON public.flows(is_public);
CREATE INDEX idx_flows_created_at ON public.flows(created_at);

-- Flow versions indexes
CREATE INDEX idx_flow_versions_flow_id ON public.flow_versions(flow_id);
CREATE INDEX idx_flow_versions_version ON public.flow_versions(version);
CREATE INDEX idx_flow_versions_created_at ON public.flow_versions(created_at);

-- Shares indexes
CREATE INDEX idx_shares_token ON public.shares(token);
CREATE INDEX idx_shares_flow_id ON public.shares(flow_id);
CREATE INDEX idx_shares_user_id ON public.shares(user_id);
CREATE INDEX idx_shares_expires_at ON public.shares(expires_at);
CREATE INDEX idx_shares_is_active ON public.shares(is_active);

-- Audit logs indexes
CREATE INDEX idx_audit_logs_user_id ON public.audit_logs(user_id);
CREATE INDEX idx_audit_logs_resource ON public.audit_logs(resource);
CREATE INDEX idx_audit_logs_action ON public.audit_logs(action);
CREATE INDEX idx_audit_logs_created_at ON public.audit_logs(created_at);
CREATE INDEX idx_audit_logs_resource_id ON public.audit_logs(resource_id);

-- ============================================================================
-- 4. CREATE UPDATED_AT TRIGGERS (Supabase standard pattern)
-- ============================================================================

-- Function to update the updated_at column
CREATE OR REPLACE FUNCTION public.set_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Apply updated_at triggers to tables that need them
CREATE TRIGGER tr_users_updated_at
    BEFORE UPDATE ON public.users
    FOR EACH ROW
    EXECUTE FUNCTION public.set_updated_at();

CREATE TRIGGER tr_clients_updated_at
    BEFORE UPDATE ON public.clients
    FOR EACH ROW
    EXECUTE FUNCTION public.set_updated_at();

CREATE TRIGGER tr_flows_updated_at
    BEFORE UPDATE ON public.flows
    FOR EACH ROW
    EXECUTE FUNCTION public.set_updated_at();

-- ============================================================================
-- 5. ROW LEVEL SECURITY (RLS) POLICIES
-- ============================================================================

-- Enable RLS on all tables
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.clients ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.flows ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.flow_versions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.shares ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.audit_logs ENABLE ROW LEVEL SECURITY;

-- Users policies
CREATE POLICY "Users can view their own profile" ON public.users
    FOR SELECT USING (auth.uid()::text = id);

CREATE POLICY "Users can update their own profile" ON public.users
    FOR UPDATE USING (auth.uid()::text = id);

-- Admins can view all users
CREATE POLICY "Admins can view all users" ON public.users
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM public.users u 
            WHERE u.id = auth.uid()::text AND u.role = 'ADMIN'
        )
    );

-- Clients policies
CREATE POLICY "Users can view their own clients" ON public.clients
    FOR SELECT USING (user_id = auth.uid()::text);

CREATE POLICY "Users can manage their own clients" ON public.clients
    FOR ALL USING (user_id = auth.uid()::text);

-- Flows policies  
CREATE POLICY "Users can view their own flows" ON public.flows
    FOR SELECT USING (user_id = auth.uid()::text);

CREATE POLICY "Users can view public flows" ON public.flows
    FOR SELECT USING (is_public = true);

CREATE POLICY "Users can manage their own flows" ON public.flows
    FOR ALL USING (user_id = auth.uid()::text);

-- Flow versions policies
CREATE POLICY "Users can view versions of their flows" ON public.flow_versions
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM public.flows f 
            WHERE f.id = flow_id AND f.user_id = auth.uid()::text
        )
    );

CREATE POLICY "Users can view versions of public flows" ON public.flow_versions
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM public.flows f 
            WHERE f.id = flow_id AND f.is_public = true
        )
    );

CREATE POLICY "Users can manage versions of their flows" ON public.flow_versions
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM public.flows f 
            WHERE f.id = flow_id AND f.user_id = auth.uid()::text
        )
    );

-- Shares policies
CREATE POLICY "Users can view their own shares" ON public.shares
    FOR SELECT USING (user_id = auth.uid()::text);

CREATE POLICY "Users can manage their own shares" ON public.shares
    FOR ALL USING (user_id = auth.uid()::text);

-- Audit logs policies
CREATE POLICY "Users can view their own audit logs" ON public.audit_logs
    FOR SELECT USING (user_id = auth.uid()::text);

-- Admins can view all audit logs
CREATE POLICY "Admins can view all audit logs" ON public.audit_logs
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM public.users u 
            WHERE u.id = auth.uid()::text AND u.role = 'ADMIN'
        )
    );

CREATE POLICY "System can insert audit logs" ON public.audit_logs
    FOR INSERT WITH CHECK (true);

-- ============================================================================
-- 6. ADDITIONAL CONSTRAINTS AND VALIDATIONS
-- ============================================================================

-- Email validation constraints
ALTER TABLE public.users ADD CONSTRAINT users_email_valid 
    CHECK (email ~* '^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$');

ALTER TABLE public.clients ADD CONSTRAINT clients_email_valid 
    CHECK (email IS NULL OR email ~* '^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$');

-- Phone validation (basic international format)
ALTER TABLE public.clients ADD CONSTRAINT clients_phone_valid
    CHECK (phone IS NULL OR phone ~* '^\+?[1-9]\d{1,14}$');

-- Flow version must be positive
ALTER TABLE public.flow_versions ADD CONSTRAINT flow_versions_version_positive
    CHECK (version > 0);

-- Share token must be non-empty
ALTER TABLE public.shares ADD CONSTRAINT shares_token_not_empty
    CHECK (length(trim(token)) > 0);

-- Audit log action and resource must be non-empty
ALTER TABLE public.audit_logs ADD CONSTRAINT audit_logs_action_not_empty
    CHECK (length(trim(action)) > 0);

ALTER TABLE public.audit_logs ADD CONSTRAINT audit_logs_resource_not_empty
    CHECK (length(trim(resource)) > 0);

-- ============================================================================
-- 7. FUNCTIONS FOR COMMON OPERATIONS
-- ============================================================================

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

-- ============================================================================
-- 8. VIEWS FOR COMMON QUERIES
-- ============================================================================

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

-- ============================================================================
-- 9. SEED DATA (OPTIONAL)
-- ============================================================================

-- Insert demo admin user (password: 'admin123' - change this!)
INSERT INTO public.users (id, email, name, password, role) VALUES 
('admin-user-id', 'admin@example.com', 'Admin User', '$2a$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewdBPj3GBAgMxoW.', 'ADMIN')
ON CONFLICT (email) DO NOTHING;

-- Insert demo client user (password: 'client123' - change this!)
INSERT INTO public.users (id, email, name, password, role) VALUES 
('client-user-id', 'client@example.com', 'Client User', '$2a$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewdBPj3GBAgMxoW.', 'CLIENT')
ON CONFLICT (email) DO NOTHING;

-- Insert demo client record
INSERT INTO public.clients (name, email, phone, company, user_id) VALUES 
('Demo Client', 'demo@client.com', '+1234567890', 'Demo Company', 'client-user-id')
ON CONFLICT DO NOTHING;

-- ============================================================================
-- 10. STORAGE BUCKETS (IF NEEDED FOR FILE UPLOADS)
-- ============================================================================

-- Create storage bucket for flow attachments
INSERT INTO storage.buckets (id, name, public) VALUES ('flow-attachments', 'flow-attachments', false)
ON CONFLICT (id) DO NOTHING;

-- Storage policies for flow attachments
CREATE POLICY "Users can view their own flow attachments" ON storage.objects
    FOR SELECT USING (
        bucket_id = 'flow-attachments' AND 
        (storage.foldername(name))[1] = auth.uid()::text
    );

CREATE POLICY "Users can upload their own flow attachments" ON storage.objects
    FOR INSERT WITH CHECK (
        bucket_id = 'flow-attachments' AND 
        (storage.foldername(name))[1] = auth.uid()::text
    );

CREATE POLICY "Users can delete their own flow attachments" ON storage.objects
    FOR DELETE USING (
        bucket_id = 'flow-attachments' AND 
        (storage.foldername(name))[1] = auth.uid()::text
    );

-- ============================================================================
-- 11. REALTIME SUBSCRIPTIONS (OPTIONAL)
-- ============================================================================

-- Enable realtime for flows table (for collaborative editing)
ALTER PUBLICATION supabase_realtime ADD TABLE public.flows;
ALTER PUBLICATION supabase_realtime ADD TABLE public.flow_versions;
ALTER PUBLICATION supabase_realtime ADD TABLE public.audit_logs;

-- ============================================================================
-- SCRIPT COMPLETION
-- ============================================================================

-- Verify all tables were created
SELECT 
    schemaname,
    tablename,
    tableowner
FROM pg_tables 
WHERE schemaname = 'public' 
    AND tablename IN ('users', 'clients', 'flows', 'flow_versions', 'shares', 'audit_logs')
ORDER BY tablename;

-- Verify all enums were created
SELECT 
    typname,
    typtype,
    enumlabel
FROM pg_type t
LEFT JOIN pg_enum e ON t.oid = e.enumtypid
WHERE typname IN ('role', 'client_status', 'flow_status')
ORDER BY typname, enumsortorder;

COMMIT;