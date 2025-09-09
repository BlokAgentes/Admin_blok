# Supabase Configuration Guide

## Overview

Este guia fornece instruções para configurar o Supabase como banco de dados principal da Blok Platform.

## 🚀 Quick Setup

### 1. Criar Projeto Supabase

1. Acesse [supabase.com](https://supabase.com)
2. Faça login e clique em "New Project"
3. Escolha sua organização
4. Digite um nome para o projeto (ex: "blok-platform")
5. Digite uma senha forte para o banco
6. Escolha uma região próxima
7. Clique em "Create new project"

### 2. Obter Credenciais

Após a criação, vá para **Settings > API** e copie:

```bash
# Project URL
https://[PROJECT-ID].supabase.co

# anon/public key
eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...

# service_role key (mantenha segura!)
eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

### 3. Configurar Environment Variables

#### Frontend (.env.local)
```bash
NEXT_PUBLIC_SUPABASE_URL="https://[PROJECT-ID].supabase.co"
NEXT_PUBLIC_SUPABASE_ANON_KEY="[ANON-KEY]"
SUPABASE_SERVICE_ROLE_KEY="[SERVICE-ROLE-KEY]"
```

#### Backend (.env)
```bash
SUPABASE_URL="https://[PROJECT-ID].supabase.co"
SUPABASE_ANON_KEY="[ANON-KEY]"
SUPABASE_SERVICE_ROLE_KEY="[SERVICE-ROLE-KEY]"
```

## 🗄️ Database Schema

### Tabelas Principais

Execute o seguinte SQL no Supabase SQL Editor:

```sql
-- Users table
CREATE TABLE users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email VARCHAR(255) UNIQUE NOT NULL,
  name VARCHAR(255) NOT NULL,
  role VARCHAR(50) DEFAULT 'USER',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Clients table
CREATE TABLE clients (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(255) NOT NULL,
  email VARCHAR(255),
  phone VARCHAR(50),
  status VARCHAR(50) DEFAULT 'ACTIVE',
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Flows table
CREATE TABLE flows (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(255) NOT NULL,
  description TEXT,
  status VARCHAR(50) DEFAULT 'DRAFT',
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Flow versions table
CREATE TABLE flow_versions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  flow_id UUID REFERENCES flows(id) ON DELETE CASCADE,
  version_number INTEGER NOT NULL,
  data JSONB NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Shares table
CREATE TABLE shares (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  flow_id UUID REFERENCES flows(id) ON DELETE CASCADE,
  token VARCHAR(255) UNIQUE NOT NULL,
  is_public BOOLEAN DEFAULT false,
  expires_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Audit logs table
CREATE TABLE audit_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id) ON DELETE SET NULL,
  action VARCHAR(100) NOT NULL,
  table_name VARCHAR(100),
  record_id UUID,
  details JSONB,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

### Índices de Performance

```sql
-- Performance indexes
CREATE INDEX idx_clients_user_id ON clients(user_id);
CREATE INDEX idx_flows_user_id ON flows(user_id);
CREATE INDEX idx_flow_versions_flow_id ON flow_versions(flow_id);
CREATE INDEX idx_shares_flow_id ON shares(flow_id);
CREATE INDEX idx_audit_logs_user_id ON audit_logs(user_id);
CREATE INDEX idx_audit_logs_created_at ON audit_logs(created_at);

-- Text search indexes
CREATE INDEX idx_clients_name ON clients USING gin(to_tsvector('english', name));
CREATE INDEX idx_flows_name ON flows USING gin(to_tsvector('english', name));
```

## 🔐 Row Level Security (RLS)

### Habilitar RLS

```sql
-- Enable RLS on all tables
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE clients ENABLE ROW LEVEL SECURITY;
ALTER TABLE flows ENABLE ROW LEVEL SECURITY;
ALTER TABLE flow_versions ENABLE ROW LEVEL SECURITY;
ALTER TABLE shares ENABLE ROW LEVEL SECURITY;
ALTER TABLE audit_logs ENABLE ROW LEVEL SECURITY;
```

### Políticas de Segurança

```sql
-- Users policies
CREATE POLICY "Users can view own profile" ON users
  FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can update own profile" ON users
  FOR UPDATE USING (auth.uid() = id);

-- Clients policies
CREATE POLICY "Users can manage own clients" ON clients
  FOR ALL USING (auth.uid() = user_id);

-- Flows policies
CREATE POLICY "Users can manage own flows" ON flows
  FOR ALL USING (auth.uid() = user_id);

-- Flow versions policies
CREATE POLICY "Users can manage own flow versions" ON flow_versions
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM flows 
      WHERE flows.id = flow_versions.flow_id 
      AND flows.user_id = auth.uid()
    )
  );

-- Shares policies
CREATE POLICY "Anyone can view public shares" ON shares
  FOR SELECT USING (is_public = true);

-- Audit logs policies
CREATE POLICY "Users can view own audit logs" ON audit_logs
  FOR SELECT USING (auth.uid() = user_id);
```

## 🧪 Testing

### Teste de Conexão

```bash
# Frontend
cd apps/frontend && npm run test:supabase

# Backend
cd apps/backend && npm run test:supabase
```

### Teste de Autenticação

```bash
# Testar registro
curl -X POST http://localhost:3000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"password123","name":"Test User"}'

# Testar login
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"password123"}'
```

## 🚨 Troubleshooting

### Erros Comuns

#### 1. "Invalid JWT"
- Verifique se as chaves de API estão corretas
- Confirme se o projeto está ativo

#### 2. "Connection refused"
- Verifique se a URL do Supabase está correta
- Confirme se não há firewall bloqueando

#### 3. "RLS policy violation"
- Verifique se as políticas RLS estão configuradas
- Confirme se o usuário está autenticado

#### 4. "Table does not exist"
- Execute o schema SQL no Supabase
- Verifique se as tabelas foram criadas

### Debug

```bash
# Habilitar logs detalhados
NEXT_PUBLIC_SUPABASE_DEBUG=true
SUPABASE_DEBUG=true
```

## 📚 Recursos

- [Supabase Documentation](https://supabase.com/docs)
- [Supabase JavaScript Client](https://supabase.com/docs/reference/javascript)
- [Row Level Security Guide](https://supabase.com/docs/guides/auth/row-level-security)
- [Database Functions](https://supabase.com/docs/guides/database/functions)

## ✅ Checklist

- [ ] Projeto Supabase criado
- [ ] Credenciais obtidas
- [ ] Environment variables configuradas
- [ ] Schema criado
- [ ] RLS policies configuradas
- [ ] Testes de conexão passando
- [ ] Autenticação funcionando
- [ ] Validação completa passando
