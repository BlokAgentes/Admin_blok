# Backend Completo de Autenticação com MCP Supabase

Este documento descreve a implementação do sistema de autenticação usando o MCP (Model Context Protocol) do Supabase.

## ✅ Funcionalidades Implementadas

### 1. **Configuração MCP Supabase**
- **Arquivo**: `.mcp.json` - Configuração do servidor MCP do Supabase
- **Variáveis de Ambiente**: Configurações completas no `.env.example`
- **Feature Groups**: `auth,database,storage` habilitados

### 2. **Sistema de Autenticação**
- **Registro de Usuários**: `POST /api/auth/register`
- **Login**: `POST /api/auth/login` 
- **Login Admin**: `POST /api/auth/admin/login`
- **Logout**: `POST /api/auth/logout`
- **Recuperação de Senha**: `POST /api/auth/forgot-password`
- **Confirmação de Email**: `POST /api/auth/confirm-email`
- **Refresh Token**: `POST /api/auth/refresh`
- **Perfil do Usuário**: `GET /api/auth/me`

### 3. **Gerenciamento de Perfil**
- **Visualizar Perfil**: `GET /api/profile/:userId?`
- **Atualizar Perfil**: `PUT /api/profile`
- **Upload de Avatar**: `POST /api/profile/avatar`
- **Deletar Avatar**: `DELETE /api/profile/avatar`
- **Logs de Atividade**: `GET /api/profile/activity/logs`
- **Deletar Conta**: `DELETE /api/profile/delete-account`

### 4. **Funcionalidades Admin**
- **Listar Clientes**: `GET /api/auth/admin/clients`
- **Visualizar Perfil de Usuário**: `GET /api/profile/admin/:userId`
- **Atualizar Perfil de Usuário**: `PUT /api/profile/admin/:userId`
- **Atividade de Usuário**: `GET /api/profile/admin/:userId/activity`
- **Deletar Conta de Usuário**: `DELETE /api/profile/admin/:userId/delete`

### 5. **Segurança e Rate Limiting**
- **Rate Limiting**: Configurado para todas as rotas
- **Sanitização de Inputs**: Middleware de sanitização
- **Validação de Arquivos**: Upload seguro de imagens
- **Headers de Segurança**: Helmet configurado
- **CORS**: Configuração segura

### 6. **Integração Dual**
- **Supabase Auth**: Autenticação principal via Supabase
- **Prisma Sync**: Sincronização com banco local para compatibilidade
- **Audit Trail**: Logs completos de auditoria

## 🔧 Configuração Necessária

### 1. **Variáveis de Ambiente**
```env
# Supabase MCP Configuration
SUPABASE_ACCESS_TOKEN="your_supabase_personal_access_token_here"
SUPABASE_PROJECT_REF="your_supabase_project_ref_here"
SUPABASE_URL="https://your-project.supabase.co"
SUPABASE_ANON_KEY="your_supabase_anon_key_here"
SUPABASE_SERVICE_ROLE="your_supabase_service_role_key_here"

# Security Configuration
RATE_LIMIT_ENABLED="true"
RATE_LIMIT_WINDOW_MS="900000"
RATE_LIMIT_MAX_REQUESTS="100"
```

### 2. **Configuração do Supabase**
1. Criar Personal Access Token no painel do Supabase
2. Obter Project Reference ID
3. Configurar Storage bucket "avatars"
4. Criar tabela "profiles" (opcional, para dados extras)

### 3. **Setup MCP**
```bash
# O MCP Server será instalado automaticamente
npx @supabase/mcp-server-supabase@latest --help
```

## 📁 Estrutura dos Arquivos

```
apps/backend/src/
├── config/
│   └── security.ts              # Configurações de segurança
├── mcp/
│   ├── supabase-client.ts       # Cliente MCP Supabase
│   ├── simple-auth-service.ts   # Serviço de autenticação simplificado
│   └── profile-service.ts       # Serviço de gerenciamento de perfil
├── middleware/
│   └── mcp-auth.ts             # Middleware de autenticação MCP
├── routes/
│   ├── auth.ts                 # Rotas de autenticação
│   └── profile.ts              # Rotas de perfil
└── index.ts                    # Server principal
```

## 🚀 Como Usar

### 1. **Instalação de Dependências**
```bash
cd apps/backend
pnpm install
```

### 2. **Configurar Variáveis de Ambiente**
```bash
cp .env.example .env
# Editar .env com suas credenciais do Supabase
```

### 3. **Iniciar Servidor**
```bash
pnpm dev  # Desenvolvimento
pnpm start  # Produção
```

### 4. **Testar Endpoints**
```bash
# Registro
curl -X POST http://localhost:5000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"password123","name":"Test User"}'

# Login
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"password123"}'

# Perfil
curl -X GET http://localhost:5000/api/auth/me \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

## 🛡️ Recursos de Segurança

### 1. **Rate Limiting Inteligente**
- Diferentes limites por tipo de operação
- Combinação IP + email para auth
- Skip em requests bem-sucedidos

### 2. **Validação e Sanitização**
- Sanitização automática de inputs
- Validação de tipos de arquivo
- Proteção contra XSS básico

### 3. **Headers de Segurança**
- Content Security Policy
- CORS configurado
- Headers de segurança via Helmet

### 4. **Audit Trail Completo**
- Logs de todas as operações
- Rastreamento de IP e User Agent
- Timestamps precisos

## 📊 Monitoramento

### 1. **Logs de Sistema**
```javascript
// Logs automáticos de:
// - Tentativas de login
// - Alterações de perfil  
// - Uploads de arquivo
// - Operações administrativas
```

### 2. **Rate Limit Status**
```bash
# Headers de resposta incluem:
X-RateLimit-Limit: 100
X-RateLimit-Remaining: 95
X-RateLimit-Reset: 1640995200
```

## 🔮 Próximos Passos

### 1. **Funcionalidades Futuras**
- [ ] Sistema de impersonation completo
- [ ] OAuth providers (Google, GitHub)
- [ ] Two-factor authentication
- [ ] Session management avançado
- [ ] Webhooks do Supabase

### 2. **Melhorias de Performance**
- [ ] Cache de sessões
- [ ] Otimização de queries
- [ ] CDN para avatares
- [ ] Database connection pooling

### 3. **Observabilidade**
- [ ] Métricas detalhadas
- [ ] Alertas de segurança
- [ ] Dashboard de monitoramento
- [ ] Logs estruturados

## ⚠️ Notas Importantes

1. **Ambiente de Desenvolvimento**: Use `MCP_READ_ONLY="false"` apenas em desenvolvimento
2. **Produção**: Configure `NODE_ENV=production` para validações extras
3. **Backup**: Mantenha backup das chaves de API
4. **Atualizações**: Monitore atualizações do MCP Server do Supabase

## 🐛 Troubleshooting

### 1. **Problemas Comuns**
- **MCP não conecta**: Verificar Personal Access Token
- **Rate limit atingido**: Ajustar configurações em `config/security.ts`
- **Upload falha**: Verificar configuração do Storage bucket
- **Sessions expiram**: Implementar auto-refresh no frontend

### 2. **Debug**
```bash
# Verificar logs do MCP
DEBUG=mcp* pnpm dev

# Testar conexão Supabase
curl -H "Authorization: Bearer YOUR_TOKEN" \
  https://your-project.supabase.co/rest/v1/
```

---

**Implementado com ❤️ usando MCP Supabase + Express.js + TypeScript**