"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { 
  AlertTriangle, 
  User, 
  LogOut, 
  Shield,
  ArrowLeft
} from "lucide-react"

interface ImpersonationBannerProps {
  currentUser: {
    id: string
    name: string
    email: string
    role: 'CLIENT'
  }
  originalUser: {
    id: string
    name: string
    email: string
    role: 'ADMIN'
  }
  onStopImpersonation: () => void
  loading?: boolean
}

export function ImpersonationBanner({ 
  currentUser, 
  originalUser, 
  onStopImpersonation,
  loading = false 
}: ImpersonationBannerProps) {
  const [isExpanded, setIsExpanded] = useState(false)

  const getInitials = (name: string) => {
    return name.split(' ').map(n => n[0]).join('').toUpperCase()
  }

  return (
    <Card className="border-orange-200 bg-orange-50 shadow-sm">
      <div className="p-4">
        <div className="flex items-center justify-between">
          {/* Left side - Warning and info */}
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2">
              <AlertTriangle className="w-5 h-5 text-orange-600" />
              <Badge variant="outline" className="bg-orange-100 text-orange-800 border-orange-300">
                Modo Impersonation
              </Badge>
            </div>
            
            <div className="hidden sm:flex items-center gap-2 text-sm text-orange-700">
              <span>Você está logado como:</span>
              <div className="flex items-center gap-2 font-medium">
                <Avatar className="w-6 h-6">
                  <AvatarFallback className="text-xs bg-orange-200 text-orange-800">
                    {getInitials(currentUser.name)}
                  </AvatarFallback>
                </Avatar>
                <span>{currentUser.name}</span>
                <span className="text-orange-600">({currentUser.email})</span>
              </div>
            </div>
          </div>

          {/* Right side - Action buttons */}
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setIsExpanded(!isExpanded)}
              className="sm:hidden border-orange-300 text-orange-700 hover:bg-orange-100"
            >
              <User className="w-4 h-4" />
            </Button>
            
            <Button
              variant="outline"
              size="sm"
              onClick={onStopImpersonation}
              disabled={loading}
              className="border-orange-300 text-orange-700 hover:bg-orange-100"
            >
              {loading ? (
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-orange-600" />
              ) : (
                <>
                  <ArrowLeft className="w-4 h-4 mr-1" />
                  <span className="hidden sm:inline">Voltar para Admin</span>
                  <span className="sm:hidden">Voltar</span>
                </>
              )}
            </Button>
          </div>
        </div>

        {/* Expanded mobile view */}
        {isExpanded && (
          <div className="mt-3 pt-3 border-t border-orange-200 sm:hidden">
            <div className="space-y-2 text-sm text-orange-700">
              <div className="flex items-center gap-2">
                <User className="w-4 h-4" />
                <span>Logado como:</span>
                <span className="font-medium">{currentUser.name}</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="w-4" />
                <span className="text-orange-600">{currentUser.email}</span>
              </div>
              <div className="flex items-center gap-2">
                <Shield className="w-4 h-4" />
                <span>Admin original:</span>
                <span className="font-medium">{originalUser.name}</span>
              </div>
            </div>
          </div>
        )}

        {/* Desktop detailed view */}
        <div className="hidden sm:block mt-2 pt-2 border-t border-orange-200">
          <div className="flex items-center gap-2 text-xs text-orange-600">
            <Shield className="w-4 h-4" />
            <span>Admin original:</span>
            <span className="font-medium">{originalUser.name} ({originalUser.email})</span>
          </div>
        </div>
      </div>
    </Card>
  )
}