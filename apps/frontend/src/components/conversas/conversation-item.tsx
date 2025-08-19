import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"

interface Conversation {
  id: string
  clientName: string
  clientAvatar?: string
  lastMessage: string
  lastMessageTime: Date
  unreadCount: number
  isArchived: boolean
}

interface ConversationItemProps {
  conversation: Conversation
  onClick?: () => void
}

export function ConversationItem({ conversation, onClick }: ConversationItemProps) {
  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map(n => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2)
  }

  const formatTime = (date: Date) => {
    const now = new Date()
    const diff = now.getTime() - date.getTime()
    const days = Math.floor(diff / (1000 * 60 * 60 * 24))
    
    if (days === 0) {
      return date.toLocaleTimeString('pt-BR', { 
        hour: '2-digit', 
        minute: '2-digit' 
      })
    } else if (days === 1) {
      return 'Ontem'
    } else if (days < 7) {
      return `${days}d`
    } else {
      return date.toLocaleDateString('pt-BR', { 
        day: '2-digit', 
        month: '2-digit' 
      })
    }
  }

  const getAvatarColor = (name: string) => {
    const colors = [
      'bg-blue-500',
      'bg-green-500', 
      'bg-purple-500',
      'bg-pink-500',
      'bg-indigo-500',
      'bg-orange-500',
    ]
    const index = name.charCodeAt(0) % colors.length
    return colors[index]
  }

  return (
    <div 
      className="flex items-center space-x-4 p-4 hover:bg-accent/50 rounded-lg cursor-pointer transition-colors border-b last:border-b-0"
      onClick={onClick}
    >
      <Avatar className="h-12 w-12">
        <AvatarImage src={conversation.clientAvatar} alt={conversation.clientName} />
        <AvatarFallback 
          className={`${getAvatarColor(conversation.clientName)} text-white font-semibold`}
        >
          {getInitials(conversation.clientName)}
        </AvatarFallback>
      </Avatar>
      
      <div className="flex-1 min-w-0 space-y-1">
        <div className="flex items-center justify-between">
          <p className="text-sm font-semibold truncate text-foreground">
            {conversation.clientName}
          </p>
          <p className="text-xs text-muted-foreground">
            {formatTime(conversation.lastMessageTime)}
          </p>
        </div>
        
        <div className="flex items-center justify-between">
          <p className="text-sm text-muted-foreground truncate max-w-[200px] md:max-w-[300px] lg:max-w-[400px]">
            {conversation.lastMessage}
          </p>
          
          {conversation.unreadCount > 0 && (
            <Badge 
              variant="default" 
              className="ml-2 bg-primary text-primary-foreground"
            >
              {conversation.unreadCount}
            </Badge>
          )}
        </div>
      </div>
    </div>
  )
}