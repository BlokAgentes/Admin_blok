# Configuração de Database - Blok Platform

## Status Atual
✅ **Backend e Frontend** configurados para usar o mesmo database
✅ **Schemas Prisma** sincronizados com `Role.CLIENT` 
⚠️ **PostgreSQL** precisa ser configurado localmente

## Opção 1: PostgreSQL Local (Recomendado)

### macOS (Homebrew)
```bash
# Instalar PostgreSQL
brew install postgresql@15
brew services start postgresql@15

# Criar database
psql postgres
CREATE DATABASE client_flows;
CREATE USER postgres WITH PASSWORD 'postgres';
GRANT ALL PRIVILEGES ON DATABASE client_flows TO postgres;
\q
```

### Docker (se disponível)
```bash
# Usar docker-compose.yml existente
docker-compose up -d postgres

# OU comando direto
docker run --name blok_postgres \
  -e POSTGRES_DB=client_flows \
  -e POSTGRES_USER=postgres \
  -e POSTGRES_PASSWORD=postgres \
  -p 5432:5432 -d postgres:15-alpine
```

### Após configurar PostgreSQL:
```bash
# No frontend (principal)
cd apps/frontend
npx prisma migrate dev --name initial_setup
npx prisma db seed

# No backend
cd apps/backend  
npx prisma generate
```

## Opção 2: Supabase (Cloud)

1. Criar projeto em [supabase.com](https://supabase.com)
2. Obter connection string
3. Atualizar `.env` nos apps:

```bash
DATABASE_URL="postgresql://postgres:[PASSWORD]@db.[PROJECT-ID].supabase.co:5432/postgres"
```

## Opção 3: Desenvolvimento Mock (Temporário)

Para desenvolvimento sem database, implementamos um sistema mock que simula Prisma.

**Arquivos criados:**
- `apps/backend/src/lib/mock-db.ts` - Database mock
- `apps/frontend/src/lib/mock-users.ts` - Dados simulados

## Conexões Configuradas

### Frontend (`apps/frontend/.env`)
```
DATABASE_URL="postgresql://postgres:postgres@localhost:5432/client_flows"
```

### Backend (`apps/backend/.env`)  
```
DATABASE_URL="postgresql://postgres:postgres@localhost:5432/client_flows"
```

## Próximos Passos

1. **Escolher opção de database** (PostgreSQL local, Docker, ou Supabase)
2. **Configurar database** seguindo os passos acima
3. **Rodar migrações** do Prisma
4. **Testar autenticação** entre backend/frontend
5. **Popular dados** iniciais (admin + clientes)

## Verificação

Depois de configurar, testar com:
```bash
# Testar conexão
cd apps/frontend && npx prisma db push
cd apps/backend && npx prisma db push

# Iniciar serviços
pnpm dev:backend  # localhost:5000
pnpm dev:frontend # localhost:3000
```