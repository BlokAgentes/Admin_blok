"use client"

import { AdminLayout } from "@/components/layouts/AdminLayout"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { ScrollArea } from "@/components/ui/scroll-area"
import { ConversasStats } from "@/components/conversas/stats-cards"
import { ConversationItem } from "@/components/conversas/conversation-item"

// Mock data para demonstração
const mockConversations = [
  {
    id: "1",
    clientName: "João Silva",
    clientAvatar: "",
    lastMessage: "Olá, gostaria de saber mais sobre os fluxos disponíveis",
    lastMessageTime: new Date("2025-07-31T10:30:00"),
    unreadCount: 2,
    isArchived: false,
  },
  {
    id: "2",
    clientName: "Maria Santos",
    clientAvatar: "",
    lastMessage: "Obrigado pelo suporte! O fluxo está funcionando perfeitamente.",
    lastMessageTime: new Date("2025-07-31T09:15:00"),
    unreadCount: 0,
    isArchived: false,
  },
  {
    id: "3",
    clientName: "Pedro Oliveira",
    clientAvatar: "",
    lastMessage: "Podemos agendar uma reunião para amanhã para discutir os detalhes?",
    lastMessageTime: new Date("2025-07-30T16:45:00"),
    unreadCount: 1,
    isArchived: false,
  },
  {
    id: "4",
    clientName: "Ana Costa",
    clientAvatar: "",
    lastMessage: "Confirmado! Estarei lá às 14h conforme combinado.",
    lastMessageTime: new Date("2025-07-30T14:20:00"),
    unreadCount: 0,
    isArchived: false,
  },
  {
    id: "5",
    clientName: "Carlos Mendes",
    clientAvatar: "",
    lastMessage: "Preciso de ajuda para configurar o novo fluxo de onboarding",
    lastMessageTime: new Date("2025-07-29T11:30:00"),
    unreadCount: 3,
    isArchived: false,
  },
  {
    id: "6",
    clientName: "Lucia Ferreira",
    clientAvatar: "",
    lastMessage: "Obrigada pela orientação! Vou implementar hoje mesmo.",
    lastMessageTime: new Date("2025-07-29T09:45:00"),
    unreadCount: 0,
    isArchived: false,
  },
]

// Estatísticas mockadas - seriam buscadas do backend
const stats = {
  totalContacts: 47,
  unreadMessages: 6,
}

export default function ConversasPage() {
  const totalNaoLidos = mockConversations.reduce((acc, conv) => acc + conv.unreadCount, 0)

  return (
    <AdminLayout 
      breadcrumb={[
        { title: "Conversas" }
      ]}
    >
      <div className="flex-1 space-y-6 p-4 md:p-6 lg:p-8">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Conversas</h1>
            <p className="text-muted-foreground">
              Gerencie suas comunicações com clientes
            </p>
          </div>
          
          <div className="flex items-center gap-2">
            <span className="text-sm text-muted-foreground">
              {totalNaoLidos} mensagens não lidas
            </span>
          </div>
        </div>

        {/* Cards de estatísticas */}
        <ConversasStats 
          totalContacts={stats.totalContacts}
          unreadMessages={totalNaoLidos}
          totalConversations={mockConversations.length}
        />

        {/* Lista de conversas */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-semibold">Conversas Recentes</h2>
            <span className="text-sm text-muted-foreground">{mockConversations.length} conversas</span>
          </div>
          
          <Card className="overflow-hidden">
            <CardHeader className="border-b">
              <CardTitle className="text-base flex items-center justify-between">
                <span>Mensagens</span>
                <span className="text-sm font-normal text-muted-foreground">
                  Clique para abrir a conversa
                </span>
              </CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              <ScrollArea className="h-[calc(100vh-400px)] min-h-[300px] max-h-[600px]">
                <div className="divide-y divide-border">
                  {mockConversations.map((conversation) => (
                    <ConversationItem 
                      key={conversation.id} 
                      conversation={conversation}
                      onClick={() => console.log(`Abrir conversa com ${conversation.clientName}`)}
                    />
                  ))}
                </div>
              </ScrollArea>
            </CardContent>
          </Card>
        </div>
      </div>
    </AdminLayout>
  )
}