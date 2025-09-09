# Supabase Setup Guide - Blok Platform

## Overview

Este guia configura o Supabase como banco de dados principal para a Blok Platform.

## 🚀 Quick Start

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

#### Frontend (.env)
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

### 4. Setup Automático

```bash
# Configurar conexão
npm run supabase:configure

# Setup do schema
npm run supabase:setup

# Validar configuração
npm run supabase:validate
```

## 🗄️ Database Schema

### Tabelas Principais

#### users
```sql
CREATE TABLE users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email VARCHAR(255) UNIQUE NOT NULL,
  name VARCHAR(255) NOT NULL,
  role VARCHAR(50) DEFAULT 'USER',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

#### clients
```sql
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
```

#### flows
```sql
CREATE TABLE flows (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(255) NOT NULL,
  description TEXT,
  status VARCHAR(50) DEFAULT 'DRAFT',
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

#### flow_versions
```sql
CREATE TABLE flow_versions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  flow_id UUID REFERENCES flows(id) ON DELETE CASCADE,
  version_number INTEGER NOT NULL,
  data JSONB NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

#### shares
```sql
CREATE TABLE shares (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  flow_id UUID REFERENCES flows(id) ON DELETE CASCADE,
  token VARCHAR(255) UNIQUE NOT NULL,
  is_public BOOLEAN DEFAULT false,
  expires_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

#### audit_logs
```sql
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

### Índices Recomendados

```sql
-- Performance para consultas comuns
CREATE INDEX idx_clients_user_id ON clients(user_id);
CREATE INDEX idx_flows_user_id ON flows(user_id);
CREATE INDEX idx_flow_versions_flow_id ON flow_versions(flow_id);
CREATE INDEX idx_shares_flow_id ON shares(flow_id);
CREATE INDEX idx_audit_logs_user_id ON audit_logs(user_id);
CREATE INDEX idx_audit_logs_created_at ON audit_logs(created_at);

-- Índices para busca de texto
CREATE INDEX idx_clients_name ON clients USING gin(to_tsvector('english', name));
CREATE INDEX idx_flows_name ON flows USING gin(to_tsvector('english', name));
```

## 🔐 Row Level Security (RLS)

### Políticas de Segurança

```sql
-- Habilitar RLS em todas as tabelas
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE clients ENABLE ROW LEVEL SECURITY;
ALTER TABLE flows ENABLE ROW LEVEL SECURITY;
ALTER TABLE flow_versions ENABLE ROW LEVEL SECURITY;
ALTER TABLE shares ENABLE ROW LEVEL SECURITY;
ALTER TABLE audit_logs ENABLE ROW LEVEL SECURITY;

-- Política para users (usuários só veem seus próprios dados)
CREATE POLICY "Users can view own profile" ON users
  FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can update own profile" ON users
  FOR UPDATE USING (auth.uid() = id);

-- Política para clients (usuários só veem seus próprios clientes)
CREATE POLICY "Users can manage own clients" ON clients
  FOR ALL USING (auth.uid() = user_id);

-- Política para flows (usuários só veem seus próprios fluxos)
CREATE POLICY "Users can manage own flows" ON flows
  FOR ALL USING (auth.uid() = user_id);

-- Política para flow_versions (usuários só veem versões de seus fluxos)
CREATE POLICY "Users can manage own flow versions" ON flow_versions
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM flows 
      WHERE flows.id = flow_versions.flow_id 
      AND flows.user_id = auth.uid()
    )
  );

-- Política para shares (qualquer one pode ver shares públicos)
CREATE POLICY "Anyone can view public shares" ON shares
  FOR SELECT USING (is_public = true);

-- Política para audit_logs (usuários só veem seus próprios logs)
CREATE POLICY "Users can view own audit logs" ON audit_logs
  FOR SELECT USING (auth.uid() = user_id);
```

## 🔄 Migration from Other Databases

Se você está migrando de outro setup de banco de dados existente:

### 1. Exportar Schema Atual
```bash
# Se você tem um banco PostgreSQL rodando
pg_dump -h localhost -U postgres -d your_database > current-schema.sql
```

### 2. Comparar Schemas
```bash
# Compare o schema atual com o novo schema Supabase
diff current-schema.sql supabase-config.md
```

### 3. Migrar Dados
```bash
# Use ferramentas de migração apropriadas para seu banco atual
# Exemplo para PostgreSQL:
psql -h [SUPABASE_HOST] -U postgres -d postgres -f migrate-data.sql
```

### 4. Verificar Integridade
```bash
# Valide a migração
# Teste todas as funcionalidades da aplicação
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
# Testar login/registro
curl -X POST http://localhost:3000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"password123","name":"Test User"}'
```

## 🚨 Troubleshooting

### Erros Comuns

#### 1. "Invalid JWT"
- Verifique se `SUPABASE_ANON_KEY` está correto
- Confirme se o projeto está ativo

#### 2. "Connection refused"
- Verifique se a URL do Supabase está correta
- Confirme se não há firewall bloqueando

#### 3. "RLS policy violation"
- Verifique se as políticas RLS estão configuradas
- Confirme se o usuário está autenticado

#### 4. "Table does not exist"
- Execute `npm run supabase:setup` novamente
- Verifique se o schema foi criado no dashboard

### Logs e Debug

```bash
# Habilitar logs detalhados no frontend
NEXT_PUBLIC_SUPABASE_DEBUG=true

# Habilitar logs no backend
SUPABASE_DEBUG=true
```

## 📚 Recursos Adicionais

- [Supabase Documentation](https://supabase.com/docs)
- [Supabase JavaScript Client](https://supabase.com/docs/reference/javascript)
- [Row Level Security Guide](https://supabase.com/docs/guides/auth/row-level-security)
- [Database Functions](https://supabase.com/docs/guides/database/functions)

## 🔄 Atualizações

Para manter o Supabase atualizado:

```bash
# Atualizar dependências
npm update @supabase/supabase-js

# Verificar novas funcionalidades
npm run supabase:validate
```

## ✅ Checklist de Setup

- [ ] Projeto Supabase criado
- [ ] Credenciais obtidas
- [ ] Environment variables configuradas
- [ ] Schema criado via `supabase:setup`
- [ ] RLS policies configuradas
- [ ] Testes de conexão passando
- [ ] Autenticação funcionando
- [ ] Dados migrados (se aplicável)
- [ ] Validação completa passando

## 🆘 Suporte

Se encontrar problemas:

1. Verifique os logs de erro
2. Consulte a documentação do Supabase
3. Abra uma issue no repositório
4. Use o comando `npm run supabase:validate` para diagnóstico