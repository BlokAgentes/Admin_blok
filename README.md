# Blok Platform

Uma plataforma moderna de gerenciamento de fluxos de clientes, construída como monorepo npm com Next.js 15, TypeScript, Tailwind CSS e Supabase.

## 🚀 Tecnologias

- **Frontend**: Next.js 15.4.3 + React 19.1.0 + TypeScript
- **Backend**: Express.js + TypeScript
- **Database**: PostgreSQL com Supabase
- **Styling**: Tailwind CSS + shadcn/ui
- **Package Manager**: npm
- **Monorepo**: npm workspaces

## 📁 Estrutura do Projeto

```
blok-platform/
├── apps/
│   ├── frontend/          # Next.js frontend
│   └── backend/           # Express.js backend
├── packages/               # Pacotes compartilhados
└── postgresql-mcp-server/ # Servidor MCP PostgreSQL
```

## 🛠️ Instalação

### Pré-requisitos
- Node.js 18+
- npm 8+
- Conta no Supabase

### Setup

1. **Clone o repositório**
```bash
git clone <repository-url>
cd blok-platform
```

2. **Instale as dependências**
```bash
npm install
```

3. **Configure o Supabase**
```bash
# Configure as variáveis de ambiente
cp .env.example .env

# Edite .env com suas credenciais do Supabase
NEXT_PUBLIC_SUPABASE_URL="https://[PROJECT-ID].supabase.co"
NEXT_PUBLIC_SUPABASE_ANON_KEY="[ANON-KEY]"
SUPABASE_SERVICE_ROLE_KEY="[SERVICE-ROLE-KEY]"
```

4. **Configure o schema do Supabase**
```bash
npm run supabase:setup
```

5. **Inicie o desenvolvimento**
```bash
# Desenvolvimento completo (frontend + backend)
npm dev

# Apenas frontend
npm dev:frontend

# Apenas backend
npm dev:backend
```

## 🗄️ Database

O projeto usa Supabase como banco de dados principal:

- **Autenticação**: Supabase Auth
- **Database**: PostgreSQL gerenciado
- **Storage**: Supabase Storage
- **Real-time**: Supabase Realtime

### Comandos do Supabase

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

## 🔧 Scripts Disponíveis

### Root (Monorepo)
- `npm dev` - Inicia todos os apps em paralelo
- `npm build` - Build de todos os apps
- `npm lint` - Lint em todos os apps
- `npm test` - Testes em todos os apps

### Frontend
- `npm dev:frontend` - Inicia apenas o frontend
- `npm build:frontend` - Build do frontend
- `npm lint:frontend` - Lint do frontend

### Backend
- `npm dev:backend` - Inicia apenas o backend
- `npm build:backend` - Build do backend
- `npm test:backend` - Testes do backend

## 📱 Aplicações

### Frontend (Next.js)
- **Porta**: 3000
- **URL**: http://localhost:3000
- **Features**: 
  - Autenticação JWT
  - Dashboard responsivo
  - Gerenciamento de fluxos
  - Visualização de dados

### Backend (Express.js)
- **Porta**: 5000
- **URL**: http://localhost:5000
- **Features**:
  - API REST
  - Autenticação
  - Rate limiting
  - Validação de dados

## 🔐 Autenticação

O sistema usa autenticação JWT com Supabase:

1. **Login**: `/api/auth/login`
2. **Registro**: `/api/auth/register`
3. **Middleware**: Proteção de rotas
4. **Tokens**: Armazenados em localStorage

## 🎨 UI/UX

- **Design System**: shadcn/ui
- **Styling**: Tailwind CSS
- **Icons**: Lucide React
- **Themes**: Dark/Light mode
- **Responsivo**: Mobile-first

## 🧪 Testes

```bash
# Testes completos
npm test

# Testes específicos
npm test:frontend
npm test:backend

# Teste de conexão Supabase
npm run test:supabase
```

## 🚀 Deploy

### Frontend (Vercel)
1. Conecte o repositório ao Vercel
2. Configure o diretório raiz como `apps/frontend`
3. Configure as variáveis de ambiente
4. Deploy automático

### Backend
- Deploy no Railway, Heroku ou similar
- Configure o diretório raiz como `apps/backend`
- Configure as variáveis de ambiente

## 📚 Documentação

- [DATABASE_SETUP.md](./DATABASE_SETUP.md) - Configuração do banco
- [SUPABASE_SETUP.md](./SUPABASE_SETUP.md) - Setup do Supabase
- [CLAUDE.md](./CLAUDE.md) - Guia para desenvolvedores

## 🤝 Contribuição

1. Fork o projeto
2. Crie uma branch para sua feature
3. Commit suas mudanças
4. Push para a branch
5. Abra um Pull Request

## 📄 Licença

Este projeto está sob a licença MIT.
