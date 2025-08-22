# Blok Platform

Uma plataforma moderna de gerenciamento de fluxos de clientes, construída como monorepo pnpm com Next.js 15, TypeScript, Tailwind CSS e Prisma.

## 🚀 Funcionalidades

- **Sistema de Autenticação**: Login e registro de usuários com JWT
- **Dashboard Interativo**: Visão geral com estatísticas e métricas
- **Gerenciamento de Clientes**: CRUD completo de clientes
- **Gerenciamento de Fluxos**: Criação e edição de fluxos de trabalho
- **Visualização Interativa**: Diagramas interativos com React Flow
- **Sistema de Compartilhamento**: Links públicos/privados para fluxos
- **Interface Responsiva**: Design moderno e adaptável

## 🛠️ Tecnologias

- **Frontend**: Next.js 15.4.3, TypeScript, Tailwind CSS
- **UI Components**: shadcn/ui
- **Backend**: Express.js + Next.js API Routes (monorepo)
- **Database**: PostgreSQL com Prisma ORM
- **Autenticação**: JWT
- **Diagramas**: React Flow
- **Animações**: Framer Motion

## 📋 Pré-requisitos

- Node.js 18+ 
- pnpm (gerenciador de pacotes)
- PostgreSQL (local ou Supabase)

## 🔧 Instalação

1. **Clone o repositório**
   ```bash
   git clone <repository-url>
   cd blok-platform
   ```

2. **Instale as dependências**
   ```bash
   pnpm install
   ```

3. **Configure as variáveis de ambiente**
   ```bash
   cp .env.example .env
   ```
   
   Edite o arquivo `.env` com suas configurações:
   ```env
   # Database
   DATABASE_URL="postgresql://username:password@localhost:5432/client_flows_db"
   
   # JWT
   JWT_SECRET="your-super-secret-jwt-key-change-this-in-production"
   
   # Next.js
   NEXTAUTH_SECRET="your-nextauth-secret"
   NEXTAUTH_URL="http://localhost:3000"
   
   # App
   NEXT_PUBLIC_APP_URL="http://localhost:3000"
   ```

4. **Configure o banco de dados**
   ```bash
   # Gere o cliente Prisma (no frontend)
   cd apps/frontend && npx prisma generate
   
   # Execute as migrações
   cd apps/frontend && npx prisma migrate dev --name init
   
   # (Opcional) Popule com dados de exemplo
   cd apps/frontend && npx prisma db seed
   ```

5. **Inicie o servidor de desenvolvimento**
   ```bash
   # Inicia frontend e backend em paralelo
   pnpm dev
   
   # OU inicie separadamente:
   pnpm dev:frontend  # localhost:3000
   pnpm dev:backend   # localhost:5000
   ```

6. **Acesse a aplicação**
   ```
   http://localhost:3000
   ```

## 📁 Estrutura do Projeto (Monorepo)

```
├── apps/
│   ├── frontend/              # Next.js 15.4.3 application
│   │   ├── src/
│   │   │   ├── app/          # Next.js App Router
│   │   │   │   ├── admin/    # Admin panel routes
│   │   │   │   ├── api/      # API routes
│   │   │   │   └── ...       # Other routes
│   │   │   ├── components/   # React components
│   │   │   │   ├── ui/       # shadcn/ui components
│   │   │   │   ├── forms/    # Formulários
│   │   │   │   └── ...       # Other components
│   │   │   ├── contexts/     # React contexts
│   │   │   ├── hooks/        # Custom hooks
│   │   │   └── lib/          # Utilities
│   │   ├── prisma/          # Database schema
│   │   └── package.json
│   ├── backend/              # Express.js API service
│   │   ├── src/
│   │   │   ├── index.ts     # Server entry point
│   │   │   ├── routes/      # API routes
│   │   │   ├── middleware/  # Express middleware
│   │   │   └── lib/         # Backend utilities
│   │   └── package.json
│   └── cursor/              # Cursor-specific files
├── packages/                # Shared packages (future use)
├── postgresql-mcp-server/   # PostgreSQL MCP server
├── package.json            # Root package.json
├── pnpm-workspace.yaml     # pnpm workspace config
└── CLAUDE.md              # Project instructions
```

## 🗄️ Modelos do Banco de Dados

- **Users**: Usuários da plataforma
- **Clients**: Clientes e suas informações
- **Flows**: Fluxos de trabalho
- **FlowVersions**: Versões dos fluxos
- **Shares**: Compartilhamentos de fluxos
- **AuditLog**: Logs de auditoria

## 🔐 Autenticação

A plataforma usa JWT para autenticação. Os tokens são armazenados no localStorage e enviados nas requisições via header Authorization.

## 🎨 Componentes UI

A plataforma utiliza shadcn/ui como base de componentes, oferecendo:
- Design system consistente
- Componentes acessíveis
- Customização via Tailwind CSS
- Suporte a temas claro/escuro

## 📱 Responsividade

A interface é totalmente responsiva, adaptando-se a diferentes tamanhos de tela:
- Mobile-first design
- Sidebar colapsível em dispositivos móveis
- Layout flexível e adaptável

## 🚀 Deploy

### Vercel (Recomendado)

1. Conecte seu repositório ao Vercel
2. Configure as variáveis de ambiente
3. Deploy automático a cada push

### Outras Plataformas

A aplicação pode ser deployada em qualquer plataforma que suporte Next.js:
- Netlify
- Railway
- Heroku
- AWS Amplify

## 🤝 Contribuição

1. Fork o projeto
2. Crie uma branch para sua feature (`git checkout -b feature/AmazingFeature`)
3. Commit suas mudanças (`git commit -m 'Add some AmazingFeature'`)
4. Push para a branch (`git push origin feature/AmazingFeature`)
5. Abra um Pull Request

## 📄 Licença

Este projeto está sob a licença MIT. Veja o arquivo `LICENSE` para mais detalhes.

## 🆘 Suporte

Se você encontrar algum problema ou tiver dúvidas, abra uma issue no repositório.

## ⚙️ Configuração de Chaves de API

Para configurar chaves de API para integrações externas, incluindo sincronização com modelos selecionados:

### Gerenciar Chave

A funcionalidade "Gerenciar Chave" permite sincronizar os modelos de IA selecionados durante a configuração da chave de API, garantindo que as integrações utilizem os modelos corretos para cada serviço.

**POST** `/api/settings/api-keys` - Criar nova chave de API com modelos
```bash
curl -X POST http://localhost:3000/api/settings/api-keys \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Integração CRM",
    "service": "salesforce",
    "key": "your-api-key-here",
    "permissions": ["read", "write"],
    "models": ["gpt-4", "claude-3-opus", "gemini-pro"],
    "syncModels": true
  }'
```

**GET** `/api/settings/api-keys` - Listar chaves de API com modelos sincronizados
```bash
curl -X GET http://localhost:3000/api/settings/api-keys \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

**PUT** `/api/settings/api-keys/:id` - Atualizar chave de API e sincronizar modelos
```bash
curl -X PUT http://localhost:3000/api/settings/api-keys/123 \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Integração CRM Atualizada",
    "permissions": ["read"],
    "models": ["gpt-4-turbo", "claude-3-sonnet"],
    "syncModels": true
  }'
```

**POST** `/api/settings/api-keys/:id/sync-models` - Sincronizar modelos manualmente
```bash
curl -X POST http://localhost:3000/api/settings/api-keys/123/sync-models \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "models": ["gpt-4", "claude-3-opus", "gemini-pro"]
  }'
```

**DELETE** `/api/settings/api-keys/:id` - Remover chave de API
```bash
curl -X DELETE http://localhost:3000/api/settings/api-keys/123 \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

### Sincronização de Modelos

A sincronização ocorre automaticamente quando:
- Uma nova chave é criada com `syncModels: true`
- Modelos são atualizados via PUT request
- A sincronização manual é acionada via POST `/sync-models`

Os modelos sincronizados ficam disponíveis no dashboard em **Configurações > Gerenciar Chave > Modelos Sincronizados**.

## 📡 Endpoints Disponíveis e Exemplos de Uso

## 🔄 Roadmap

- [ ] Sistema de notificações
- [ ] Exportação de fluxos (PDF, PNG)
- [ ] Templates de fluxos
- [ ] Integração com APIs externas
- [ ] Analytics avançados
- [ ] Sistema de comentários
- [ ] Colaboração em tempo real
