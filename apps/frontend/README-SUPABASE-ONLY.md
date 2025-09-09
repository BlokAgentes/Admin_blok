# Frontend - Supabase Only

## Status Atual

✅ **Frontend configurado para usar apenas Supabase**
✅ **Autenticação via Supabase Auth**
✅ **Database operations via Supabase Client**

## Configuração

### Environment Variables

Crie um arquivo `.env.local` na raiz do frontend:

```bash
# Supabase Configuration
NEXT_PUBLIC_SUPABASE_URL="https://[PROJECT-ID].supabase.co"
NEXT_PUBLIC_SUPABASE_ANON_KEY="[ANON-KEY]"
SUPABASE_SERVICE_ROLE_KEY="[SERVICE-ROLE-KEY]"

# App Configuration
NEXT_PUBLIC_APP_URL="http://localhost:3000"
NEXTAUTH_SECRET="your-nextauth-secret"
NEXTAUTH_URL="http://localhost:3000"
```

### Supabase Client

O cliente Supabase está configurado em `src/lib/supabase.ts`:

```typescript
import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

export const supabase = createClient(supabaseUrl, supabaseAnonKey)
```

## Autenticação

### Login
- **Endpoint**: `POST /api/auth/login`
- **Funcionalidade**: Autentica usuário via Supabase Auth
- **Retorno**: JWT token para sessão

### Registro
- **Endpoint**: `POST /api/auth/register`
- **Funcionalidade**: Cria novo usuário no Supabase
- **Retorno**: Usuário criado com confirmação

## Database Operations

### CRUD Operations
Todas as operações de banco são feitas via Supabase Client:

```typescript
// Exemplo: Buscar clientes
const { data: clients, error } = await supabase
  .from('clients')
  .select('*')
  .eq('user_id', userId)

// Exemplo: Criar cliente
const { data, error } = await supabase
  .from('clients')
  .insert([{ name: 'Cliente', email: 'cliente@email.com' }])
```

### Row Level Security (RLS)
- Todas as tabelas têm RLS habilitado
- Usuários só acessam seus próprios dados
- Políticas configuradas no Supabase

## Componentes

### Auth Components
- `LoginForm` - Formulário de login
- `RegisterForm` - Formulário de registro
- `AuthGuard` - Proteção de rotas

### Database Components
- `ClientList` - Lista de clientes
- `FlowEditor` - Editor de fluxos
- `DataTable` - Tabelas de dados

## Middleware

### Auth Middleware
Protege rotas que requerem autenticação:

```typescript
// src/lib/middleware.ts
export function withAuth(handler: NextApiHandler) {
  return async (req: NextApiRequest, res: NextApiResponse) => {
    // Verifica JWT token
    // Adiciona user_id ao request
  }
}
```

## Testing

### Teste de Conexão
```bash
npm run test:supabase
```

### Teste de Autenticação
```bash
# Testar login
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"password123"}'
```

## Estrutura de Arquivos

```
src/
├── lib/
│   ├── supabase.ts          # Cliente Supabase
│   ├── supabase-crud.ts     # Operações CRUD
│   └── middleware.ts        # Middleware de auth
├── components/
│   ├── auth/                # Componentes de autenticação
│   ├── database/            # Componentes de dados
│   └── ui/                  # Componentes UI
└── app/
    ├── api/                 # API routes
    └── ...                  # Páginas da aplicação
```

## Troubleshooting

### Erros Comuns

#### 1. "Invalid JWT"
- Verifique se `NEXT_PUBLIC_SUPABASE_ANON_KEY` está correto
- Confirme se o projeto Supabase está ativo

#### 2. "RLS policy violation"
- Verifique se as políticas RLS estão configuradas
- Confirme se o usuário está autenticado

#### 3. "Table does not exist"
- Execute o setup do schema no Supabase
- Verifique se as tabelas foram criadas

### Debug

```bash
# Habilitar logs detalhados
NEXT_PUBLIC_SUPABASE_DEBUG=true
```

## Próximos Passos

1. ✅ Configurar Supabase
2. ✅ Configurar autenticação
3. ✅ Testar operações CRUD
4. ✅ Implementar RLS policies
5. ✅ Testar performance
6. ✅ Configurar backups

## Recursos

- [Supabase Documentation](https://supabase.com/docs)
- [Supabase JavaScript Client](https://supabase.com/docs/reference/javascript)
- [Row Level Security](https://supabase.com/docs/guides/auth/row-level-security)