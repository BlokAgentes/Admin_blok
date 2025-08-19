"use client"

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { Textarea } from '@/components/ui/textarea'
import { 
  Search, 
  Send, 
  MoreVertical, 
  Paperclip,
  CheckCheck,
  Check,
  ArrowLeft
} from 'lucide-react'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'

interface Message {
  id: string
  type: 'sent' | 'received'
  text: string
  time: string
  status?: 'sent' | 'delivered' | 'read'
}

interface Conversation {
  id: string
  name: string
  phone: string
  avatar: string
  isOnline: boolean
  lastMessage: string
  time: string
  unreadCount: number
  isTyping?: boolean
}

const conversations: Conversation[] = [
  {
    id: '1',
    name: 'João Silva',
    phone: '+55 (11) 99999-1234',
    avatar: 'JS',
    isOnline: true,
    lastMessage: 'Preciso de ajuda com o login da plataforma',
    time: '14:32',
    unreadCount: 3,
  },
  {
    id: '2',
    name: 'Maria Santos',
    phone: '+55 (11) 98888-5678',
    avatar: 'MS',
    isOnline: false,
    lastMessage: 'Obrigada pelo atendimento! Problema resolvido 😊',
    time: '13:45',
    unreadCount: 0,
  },
  {
    id: '3',
    name: 'Pedro Oliveira',
    phone: '+55 (11) 97777-9012',
    avatar: 'PO',
    isOnline: true,
    lastMessage: 'Quando será lançada a nova versão?',
    time: '12:18',
    unreadCount: 1,
    isTyping: true,
  },
  {
    id: '4',
    name: 'Ana Costa',
    phone: '+55 (11) 96666-3456',
    avatar: 'AC',
    isOnline: false,
    lastMessage: 'Como fazer backup dos dados da empresa?',
    time: '11:22',
    unreadCount: 2,
  },
  {
    id: '5',
    name: 'Carlos Mendes',
    phone: '+55 (11) 95555-7890',
    avatar: 'CM',
    isOnline: true,
    lastMessage: 'Gostaria de conhecer melhor os planos disponíveis',
    time: '10:47',
    unreadCount: 0,
  },
  {
    id: '6',
    name: 'Laura Fernandes',
    phone: '+55 (11) 94444-2468',
    avatar: 'LF',
    isOnline: false,
    lastMessage: 'A integração com o sistema está funcionando perfeitamente',
    time: '09:15',
    unreadCount: 1,
  },
]

const messages: Record<string, Message[]> = {
  '1': [
    { id: '1', type: 'received', text: 'Olá! Preciso de ajuda urgente', time: '14:20' },
    { id: '2', type: 'received', text: 'Como posso alterar minha senha de acesso?', time: '14:21' },
    { id: '3', type: 'received', text: 'Não consigo acessar minha conta', time: '14:22' },
    { id: '4', type: 'sent', text: 'Olá! Vou te ajudar com isso agora mesmo.', time: '14:25', status: 'read' },
    { id: '5', type: 'sent', text: 'Para alterar sua senha, acesse a página de configurações e clique em "Alterar Senha"', time: '14:26', status: 'read' },
    { id: '6', type: 'received', text: 'Perfeito! Consegui alterar. Muito obrigado pela ajuda! 😊', time: '14:30' },
  ],
  '2': [
    { id: '1', type: 'received', text: 'Boa tarde! Gostaria de saber sobre os planos', time: '13:30' },
    { id: '2', type: 'sent', text: 'Boa tarde! Claro, vou te mostrar nossos planos disponíveis', time: '13:32', status: 'read' },
    { id: '3', type: 'sent', text: 'Temos 3 opções: Básico, Premium e Enterprise', time: '13:33', status: 'read' },
    { id: '4', type: 'received', text: 'Obrigada pelo atendimento! Vou testar e te retorno.', time: '13:45' },
  ],
  '3': [
    { id: '1', type: 'received', text: 'Estava com problema no sistema', time: '12:10' },
    { id: '2', type: 'sent', text: 'Vamos resolver isso! Qual erro está aparecendo?', time: '12:12', status: 'delivered' },
    { id: '3', type: 'received', text: 'Já consegui! Era problema de cache', time: '12:15' },
    { id: '4', type: 'received', text: 'Quando será lançada a nova versão?', time: '12:18' },
  ]
}

export function ConversationsInterface() {
  const [selectedConversation, setSelectedConversation] = useState<string | null>('1')
  const [searchTerm, setSearchTerm] = useState('')
  const [messageInput, setMessageInput] = useState('')

  const selectedConv = conversations.find(c => c.id === selectedConversation)
  const currentMessages = selectedConv ? messages[selectedConv.id] || [] : []

  const filteredConversations = conversations.filter(conv =>
    conv.phone.toLowerCase().includes(searchTerm.toLowerCase()) ||
    conv.lastMessage.toLowerCase().includes(searchTerm.toLowerCase())
  )

  const sendMessage = () => {
    if (!messageInput.trim()) return
    setMessageInput('')
  }

  return (
    <div className="h-[calc(100vh-200px)] flex bg-background rounded-lg border border-border overflow-hidden">
      {/* Left Sidebar - Conversations List */}
      <div className="w-80 border-r border-border flex flex-col">
        {/* Header */}
        <div className="p-4 border-b border-border bg-muted/30">
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-lg font-semibold">Conversas</h2>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                  <MoreVertical className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuLabel>Opções</DropdownMenuLabel>
                <DropdownMenuItem>Recarregar</DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem>Configurações</DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
          
          {/* Search */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
            <Input
              placeholder="Buscar Conversa"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 bg-background"
            />
          </div>
        </div>

        {/* Conversations List */}
        <div className="flex-1 overflow-y-auto">
          {filteredConversations.map((conversation) => (
            <div
              key={conversation.id}
              className={`p-3 cursor-pointer hover:bg-muted/50 transition-colors border-b border-border/50 ${
                selectedConversation === conversation.id ? 'bg-muted/70' : ''
              }`}
              onClick={() => setSelectedConversation(conversation.id)}
            >
              <div className="flex items-center space-x-3">
                <div className="relative">
                  <Avatar className="h-12 w-12">
                    <AvatarFallback className={conversation.isOnline ? 'bg-primary text-primary-foreground' : 'bg-muted'}>
                      {conversation.avatar}
                    </AvatarFallback>
                  </Avatar>
                  {conversation.isOnline && (
                    <div className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 border-2 border-background rounded-full" />
                  )}
                </div>
                
                <div className="flex-1 min-w-0">
                  <div className="flex justify-between items-center">
                    <h3 className="font-medium truncate text-foreground">{conversation.phone}</h3>
                    <div className="flex items-center space-x-2">
                      <span className={`text-xs ${conversation.unreadCount > 0 ? 'text-primary font-medium' : 'text-muted-foreground'}`}>
                        {conversation.time}
                      </span>
                      {conversation.unreadCount > 0 && (
                        <Badge variant="default" className="h-5 w-5 rounded-full p-0 flex items-center justify-center text-xs bg-primary">
                          {conversation.unreadCount}
                        </Badge>
                      )}
                    </div>
                  </div>
                  
                  <div className="flex items-center mt-1">
                    {conversation.isTyping ? (
                      <span className="text-primary text-sm italic">digitando...</span>
                    ) : (
                      <p className={`text-sm truncate ${conversation.unreadCount > 0 ? 'font-medium text-foreground' : 'text-muted-foreground'}`}>
                        {conversation.lastMessage}
                      </p>
                    )}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Right Side - Chat Area */}
      {selectedConversation ? (
        <div className="flex-1 flex flex-col">
          {/* Chat Header */}
          <div className="p-4 border-b border-border bg-muted/30 flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setSelectedConversation(null)}
                className="md:hidden"
              >
                <ArrowLeft className="h-4 w-4" />
              </Button>
              <Avatar className="h-10 w-10">
                <AvatarFallback className={selectedConv?.isOnline ? 'bg-primary text-primary-foreground' : 'bg-muted'}>
                  {selectedConv?.avatar}
                </AvatarFallback>
              </Avatar>
              <div>
                <h3 className="font-semibold text-foreground">{selectedConv?.phone}</h3>
                <p className="text-sm text-muted-foreground">
                  {selectedConv?.isOnline ? 'online' : 'visto por último hoje às 12:30'}
                </p>
              </div>
            </div>
            
            <div className="flex items-center space-x-2">
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="sm">
                    <MoreVertical className="h-4 w-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem>Info do contato</DropdownMenuItem>
                  <DropdownMenuItem>Buscar mensagens</DropdownMenuItem>
                  <DropdownMenuItem>Mídia, links e docs</DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem className="text-destructive">Apagar Contato</DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>

          {/* Messages Area */}
          <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-muted/10">
            {currentMessages.map((message) => (
              <div
                key={message.id}
                className={`flex ${message.type === 'sent' ? 'justify-end' : 'justify-start'}`}
              >
                <div
                  className={`max-w-[70%] rounded-lg px-3 py-2 ${
                    message.type === 'sent'
                      ? 'bg-primary text-primary-foreground'
                      : 'bg-background border shadow-sm'
                  }`}
                >
                  <p className="text-sm">{message.text}</p>
                  <div className={`flex items-center justify-end gap-1 mt-1 ${
                    message.type === 'sent' ? 'text-primary-foreground/70' : 'text-muted-foreground'
                  }`}>
                    <span className="text-xs">{message.time}</span>
                    {message.type === 'sent' && (
                      <div className="flex">
                        {message.status === 'read' ? (
                          <CheckCheck className="h-3 w-3 text-blue-400" />
                        ) : message.status === 'delivered' ? (
                          <CheckCheck className="h-3 w-3" />
                        ) : (
                          <Check className="h-3 w-3" />
                        )}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Message Input */}
          <div className="p-4 border-t border-border bg-background">
            <div className="flex items-center gap-3">
              <Button variant="ghost" size="icon" className="h-[32px] w-[32px] shrink-0">
                <Paperclip className="h-4 w-4" />
              </Button>
              
              <div className="flex-1">
                <Textarea
                  value={messageInput}
                  onChange={(e) => setMessageInput(e.target.value)}
                  placeholder="Digite uma mensagem"
                  className="min-h-[32px] max-h-[120px] resize-none py-1"
                  style={{ lineHeight: '1.1' }}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' && !e.shiftKey) {
                      e.preventDefault()
                      sendMessage()
                    }
                  }}
                />
              </div>
              
              <Button
                onClick={sendMessage}
                disabled={!messageInput.trim()}
                size="icon"
                className="shrink-0 h-[32px] w-[32px] rounded-full"
              >
                <Send className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>
      ) : (
        <div className="flex-1 flex items-center justify-center bg-muted/10">
          <div className="text-center">
            <div className="w-64 h-64 mx-auto mb-8 rounded-full bg-muted/50 flex items-center justify-center">
              <div className="text-6xl">💬</div>
            </div>
            <h3 className="text-xl font-semibold text-foreground mb-2">Blok Web</h3>
            <p className="text-muted-foreground max-w-md">
              Envie e receba mensagens dos seus clientes diretamente pela plataforma.
              Selecione uma conversa para começar.
            </p>
          </div>
        </div>
      )}
    </div>
  )
}