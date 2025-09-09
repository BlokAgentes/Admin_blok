# Configuração de Database - Blok Platform

## Status Atual
✅ **Backend e Frontend** configurados para usar o Supabase
✅ **Schemas Supabase** sincronizados com `Role.CLIENT` 
⚠️ **Supabase** precisa ser configurado

## Opção 1: Supabase Cloud (Recomendado)

### Configuração do Supabase
1. Criar projeto em [supabase.com](https://supabase.com)
2. Obter connection string e chaves de API
3. Atualizar `.env` nos apps:

```bash
# Frontend (.env)
NEXT_PUBLIC_SUPABASE_URL="https://[PROJECT-ID].supabase.co"
NEXT_PUBLIC_SUPABASE_ANON_KEY="[ANON-KEY]"
SUPABASE_SERVICE_ROLE_KEY="[SERVICE-ROLE-KEY]"

# Backend (.env)
SUPABASE_URL="https://[PROJECT-ID].supabase.co"
SUPABASE_ANON_KEY="[ANON-KEY]"
SUPABASE_SERVICE_ROLE_KEY="[SERVICE-ROLE-KEY]"
```

### Após configurar Supabase:
```bash
# Configurar schema do Supabase
npm run supabase:setup

# Validar configuração
npm run supabase:validate

# Se migrando de outro banco
npm run supabase:migrate
```

## Opção 2: Supabase Local (Desenvolvimento)

### Docker (se disponível)
```bash
# Usar docker-compose.yml existente
docker-compose up -d supabase

# OU comando direto
docker run --name blok_supabase \
  -e POSTGRES_PASSWORD=your_password \
  -e JWT_SECRET=your_jwt_secret \
  -p 5432:5432 -d supabase/postgres:15.1.0.117
```

## Opção 3: Desenvolvimento Mock (Temporário)

Para desenvolvimento sem database, implementamos um sistema mock que simula Supabase.

**Arquivos criados:**
- `apps/backend/src/lib/mock-db.ts` - Database mock
- `apps/frontend/src/lib/mock-users.ts` - Dados simulados

## Conexões Configuradas

### Frontend (`apps/frontend/.env`)
```
NEXT_PUBLIC_SUPABASE_URL="https://[PROJECT-ID].supabase.co"
NEXT_PUBLIC_SUPABASE_ANON_KEY="[ANON-KEY]"
```

### Backend (`apps/backend/.env`)  
```
SUPABASE_URL="https://[PROJECT-ID].supabase.co"
SUPABASE_ANON_KEY="[ANON-KEY]"
SUPABASE_SERVICE_ROLE_KEY="[SERVICE-ROLE-KEY]"
```

## Próximos Passos

1. **Escolher opção de database** (Supabase Cloud ou Local)
2. **Configurar Supabase** seguindo os passos acima
3. **Configurar schema** via Supabase dashboard ou CLI
4. **Testar autenticação** entre backend/frontend
5. **Popular dados** iniciais (admin + clientes)

## Verificação

Depois de configurar, testar com:
```bash
# Testar conexão Supabase
cd apps/frontend && npm run test:supabase
cd apps/backend && npm run test:supabase

# Iniciar serviços
npm dev:backend  # localhost:5000
npm dev:frontend # localhost:3000
```

## Comandos Supabase

```bash
# Configurar conexão
npm run supabase:configure

# Setup do schema
npm run supabase:setup

# Validar configuração
npm run supabase:validate

# Migrar dados existentes
npm run supabase:migrate
```