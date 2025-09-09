import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Users, MessageSquare, Mail } from "lucide-react"

interface StatsCardProps {
  title: string
  value: number
  icon: React.ElementType
  color: "blue" | "red" | "green" | "purple" | "orange"
  description?: string
}

const colorClasses = {
  blue: {
    icon: "text-blue-500",
    text: "text-blue-600",
    bg: "bg-blue-50",
    border: "border-blue-200",
  },
  red: {
    icon: "text-red-500",
    text: "text-red-600",
    bg: "bg-red-50",
    border: "border-red-200",
  },
  green: {
    icon: "text-green-500",
    text: "text-green-600",
    bg: "bg-green-50",
    border: "border-green-200",
  },
  purple: {
    icon: "text-purple-500",
    text: "text-purple-600",
    bg: "bg-purple-50",
    border: "border-purple-200",
  },
  orange: {
    icon: "text-orange-500",
    text: "text-orange-600",
    bg: "bg-orange-50",
    border: "border-orange-200",
  },
}

export function StatsCard({ 
  title, 
  value, 
  icon: Icon, 
  color, 
  description 
}: StatsCardProps) {
  const colors = colorClasses[color]
  
  return (
    <Card className={`${colors.bg} ${colors.border} border-2`}>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3">
        <CardTitle className="text-sm font-medium text-foreground/80">
          {title}
        </CardTitle>
        <div className={`p-2 rounded-lg ${colors.bg}`}>
          <Icon className={`h-5 w-5 ${colors.icon}`} />
        </div>
      </CardHeader>
      <CardContent>
        <div className={`text-3xl font-bold ${colors.text}`}>{value}</div>
        {description && (
          <p className="text-sm text-muted-foreground mt-1">{description}</p>
        )}
      </CardContent>
    </Card>
  )
}

export function ConversasStats({ 
  totalContacts, 
  unreadMessages, 
  totalConversations 
}: {
  totalContacts: number
  unreadMessages: number
  totalConversations: number
}) {
  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
      <StatsCard 
        title="Total de Contatos" 
        value={totalContacts} 
        icon={Users} 
        color="blue"
        description="Clientes cadastrados"
      />
      <StatsCard 
        title="Não Lidos" 
        value={unreadMessages} 
        icon={MessageSquare} 
        color="red"
        description="Mensagens pendentes"
      />
      <StatsCard 
        title="Conversas Ativas" 
        value={totalConversations} 
        icon={Mail} 
        color="green"
        description="Conversas em andamento"
      />
    </div>
  )
}