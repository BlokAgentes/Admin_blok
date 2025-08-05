# Página de Tabelas - Data Table

## Visão Geral
Desenvolver uma página de tabelas que demonstre o uso de Data Tables avançados com shadcn/ui, incluindo funcionalidades de filtro, ordenação, paginação e seleção de linhas.

## Funcionalidades Principais

### 1. Data Table Avançado
- **Tabela Interativa**: Interface completa com @tanstack/react-table
- **Colunas Dinâmicas**: Configuração flexível de colunas com diferentes tipos de dados
- **Ordenação**: Click em headers para ordenar asc/desc
- **Filtragem**: Campo de busca para filtrar registros
- **Paginação**: Navegação entre páginas com controle de tamanho
- **Seleção**: Checkbox para selecionar múltiplas linhas
- **Ações**: Menu dropdown para ações em cada linha

### 2. Tipos de Dados
- **Pagamentos**: Demonstração com dados de transações
- **Clientes**: Lista de clientes com informações detalhadas
- **Produtos**: Catálogo com preços e estoque
- **Ordens**: Histórico de pedidos

### 3. Componentes shadcn/ui
- **Table**: Componente base para estrutura da tabela
- **Input**: Campo de busca para filtragem
- **Button**: Botões de ação e paginação
- **DropdownMenu**: Menu de ações e visibilidade de colunas
- **Checkbox**: Seleção de linhas
- **Card**: Container para a tabela
- **Badge**: Status visual para estados

### 4. Visualização
- **Headers Interativos**: Click para ordenar com ícones indicativos
- **Células Formatadas**: Formatação de valores monetários e datas
- **Estados Visuais**: Badges coloridos para status
- **Ações Contextuais**: Menu dropdown por linha
- **Responsividade**: Scroll horizontal em telas pequenas

### 5. Funcionalidades Avançadas
- **Visibilidade de Colunas**: Toggle para mostrar/esconder colunas
- **Seleção em Massa**: Checkbox para selecionar todas as linhas da página
- **Contador de Seleção**: Display de linhas selecionadas
- **Ações em Lote**: Operações em múltiplas linhas selecionadas
- **Export**: Possibilidade de exportar dados selecionados

## Estrutura de Dados

### Modelo de Pagamento
```typescript
interface Payment {
  id: string
  amount: number
  status: "pending" | "processing" | "success" | "failed"
  email: string
  clientName: string
  date: Date
  method: "credit" | "debit" | "paypal" | "transfer"
}
```

### Modelo de Cliente
```typescript
interface Client {
  id: string
  name: string
  email: string
  phone: string
  status: "active" | "inactive" | "pending"
  joinDate: Date
  totalSpent: number
}
```

## Layout Responsivo

### Desktop
- Tabela completa com todas as colunas
- Sidebar fixa com filtros laterais
- Paginação na parte inferior

### Tablet
- Tabela com scroll horizontal
- Colunas prioritárias visíveis
- Menu compacto para ações

### Mobile
- Cards empilhados ao invés de tabela
- Informações essenciais destacadas
- Ações swipe ou menu contextual

## Integração
- **AdminLayout**: Consistente com outras páginas admin
- **Theme**: Mesma paleta de cores do sistema
- **Loading**: Estados de carregamento skeleton
- **Empty**: Estado vazio quando não há dados