# 🚀 Instruções para Supabase - Projeto Blok_Agents

## 📋 Informações do Projeto
- **Project Ref**: `eslcwpuxyqopwylgzddz`
- **Nome**: Blok_Agents
- **Região**: South America (São Paulo)
- **Dashboard**: https://supabase.com/dashboard/project/eslcwpuxyqopwylgzddz

## 🔑 Como Obter as Chaves de API

### 1. Acesse o Dashboard
- Vá para: https://supabase.com/dashboard/project/eslcwpuxyqopwylgzddz
- Faça login na sua conta

### 2. Vá para Settings > API
- No menu lateral, clique em "Settings"
- Clique em "API"

### 3. Copie as Chaves
Você verá duas chaves importantes:
- **anon public**: Para operações públicas (recomendado para desenvolvimento)
- **service_role**: Para operações administrativas (use com cuidado)

## 📊 Como Verificar as Tabelas Existentes

### Opção 1: Table Editor (Mais Fácil)
1. No dashboard, clique em "Table Editor"
2. Você verá todas as tabelas do schema `public`

### Opção 2: SQL Editor
1. No dashboard, clique em "SQL Editor"
2. Execute esta query:
```sql
SELECT 
    table_name,
    table_type
FROM information_schema.tables 
WHERE table_schema = 'public'
ORDER BY table_name;
```

## 🗄️ Como Criar a Tabela "Teste"

### Opção 1: SQL Editor (Recomendado)
1. No dashboard, vá para "SQL Editor"
2. Cole e execute este SQL:

```sql
-- Criar tabela "Teste"
CREATE TABLE IF NOT EXISTS "Teste" (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    nome VARCHAR(255) NOT NULL,
    descricao TEXT,
    data_criacao TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    ativo BOOLEAN DEFAULT true
);

-- Adicionar comentário
COMMENT ON TABLE "Teste" IS 'Tabela de teste criada via MCP Supabase';

-- Inserir dados de exemplo
INSERT INTO "Teste" (nome, descricao) VALUES 
    ('Teste 1', 'Primeiro registro de teste'),
    ('Teste 2', 'Segundo registro de teste'),
    ('Teste 3', 'Terceiro registro de teste');
```

### Opção 2: Table Editor
1. No dashboard, vá para "Table Editor"
2. Clique em "New Table"
3. Configure:
   - **Name**: `Teste`
   - **Columns**:
     - `id` (UUID, Primary Key, Default: `gen_random_uuid()`)
     - `nome` (VARCHAR(255), Not Null)
     - `descricao` (TEXT)
     - `data_criacao` (TIMESTAMP WITH TIME ZONE, Default: `NOW()`)
     - `ativo` (BOOLEAN, Default: `true`)

## 🔧 Scripts Disponíveis

### 1. `create_teste_final.js`
- Script para criar e gerenciar a tabela "Teste"
- **IMPORTANTE**: Substitua `SUA_CHAVE_AQUI` pela chave real

### 2. `list_tables.js`
- Script para listar todas as tabelas
- Requer chave API válida

### 3. `list_tables_pg.js`
- Script para conectar diretamente ao PostgreSQL
- Requer senha do banco

## 🚨 Problemas Comuns e Soluções

### Erro: "Invalid API key"
- **Solução**: Use a chave correta (anon public ou service_role)
- **Onde obter**: Settings > API no dashboard

### Erro: "SASL authentication failed"
- **Solução**: A senha pode estar incorreta ou o projeto inativo
- **Verificar**: Acesse o dashboard para confirmar status

### Erro: "Project not found"
- **Solução**: Verifique se o project-ref está correto
- **Correto**: `eslcwpuxyqopwylgzddz`

## 📝 Estrutura da Tabela "Teste"

```sql
CREATE TABLE "Teste" (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    nome VARCHAR(255) NOT NULL,
    descricao TEXT,
    data_criacao TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    ativo BOOLEAN DEFAULT true
);
```

### Campos:
- **`id`**: Identificador único (UUID)
- **`nome`**: Nome do teste (obrigatório)
- **`descricao`**: Descrição do teste (opcional)
- **`data_criacao`**: Data/hora de criação (automático)
- **`ativo`**: Status ativo/inativo (padrão: true)

## 🎯 Próximos Passos

1. **Acesse o dashboard** e verifique as tabelas existentes
2. **Obtenha as chaves API** em Settings > API
3. **Crie a tabela "Teste"** usando o SQL fornecido
4. **Teste os scripts** com as chaves corretas
5. **Integre com seu projeto** usando as chaves API

## 🔗 Links Úteis

- **Dashboard**: https://supabase.com/dashboard/project/eslcwpuxyqopwylgzddz
- **Documentação**: https://supabase.com/docs
- **API Reference**: https://supabase.com/docs/reference/javascript
- **SQL Editor**: https://supabase.com/dashboard/project/eslcwpuxyqopwylgzddz/sql/new 