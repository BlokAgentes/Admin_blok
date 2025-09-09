# Página de Conversas - Requisitos

## Visão Geral
Desenvolver uma página de conversas que permita gerenciar comunicações com clientes, exibindo estatísticas de contatos e mensagens não lidas, integrada com o design system da aplicação.

## Funcionalidades Principais

### 1. Dashboard de Estatísticas
- **Card de Estatísticas**: Exibir total de contatos e quantidade de mensagens não lidas
- **Visualização Clara**: Usar componentes shadcn/ui Cards com ícones apropriados
- **Atualização em Tempo Real**: Refletir mudanças conforme novas mensagens chegam

### 2. Lista de Conversas
- **Visualização em Lista**: Exibir todas as conversas com preview da última mensagem
- **Indicador de Não Lidas**: Badge visual para mensagens não lidas
- **Ordenação**: Por data da última mensagem (mais recente primeiro)
- **Filtros**: Por status (todas, não lidas, arquivadas)

### 3. Design System
- **Cores**: Usar paleta de cores consistente com Admin/Sidebar
- **Tipografia**: Mesma fonte e hierarquia visual
- **Componentes**: Usar exclusivamente shadcn/ui components
- **Responsividade**: Layout adaptável para mobile e desktop

### 4. Integração
- **Clientes**: Vincular conversas aos clientes existentes no banco
- **Notificações**: Badge de notificação no sidebar
- **Navegação**: Transição suave entre conversas

## Componentes Necessários

### shadcn/ui Components
- Card (para estatísticas)
- Badge (para contadores)
- Avatar (para fotos de perfil)
- ScrollArea (para lista de conversas)
- Separator (para divisões visuais)
- Tabs (para filtros)
- Button (para ações)

### Custom Components
- StatsCard (card personalizado para estatísticas)
- ConversationList (lista de conversas)
- ConversationItem (item individual de conversa)

## Estrutura de Dados

### Modelo de Conversa
```typescript
interface Conversation {
  id: string
  clientId: string
  clientName: string
  clientAvatar?: string
  lastMessage: string
  lastMessageTime: Date
  unreadCount: number
  isArchived: boolean
}
```

### Estatísticas
```typescript
interface ConversationStats {
  totalContacts: number
  unreadMessages: number
}
```

## Layout Responsivo

### Desktop
- Sidebar fixa com largura de 320px
- Área principal com lista de conversas
- Header com estatísticas

### Mobile
- Sidebar retrátil
- Lista de conversas em tela cheia
- Header colapsível

## Interações
- **Click na conversa**: Abrir conversa selecionada
- **Hover**: Efeito visual suave
- **Scroll**: Lazy loading para performance
- **Filtros**: Atualização instantânea da lista

## Estados de Loading
- **Skeleton**: Para lista de conversas
- **Spinner**: Para carregamento de estatísticas
- **Empty State**: Quando não há conversas

## Performance
- **Paginação**: Carregar 20 conversas por vez
- **Cache**: Armazenar estatísticas localmente
- **Optimistic Updates**: Atualizar UI antes da resposta do servidor