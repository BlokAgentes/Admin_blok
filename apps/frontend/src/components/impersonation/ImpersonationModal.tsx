"use client"

import { useState } from "react"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { 
  AlertTriangle, 
  User, 
  Shield,
  LogIn,
  Users
} from "lucide-react"

interface ImpersonationModalProps {
  isOpen: boolean
  onClose: () => void
  onConfirm: () => void
  clientUser: {
    id: string
    name: string
    email: string
    role: 'CLIENT'
  }
  adminUser: {
    id: string
    name: string
    email: string
    role: 'ADMIN'
  }
  loading?: boolean
}

export function ImpersonationModal({
  isOpen,
  onClose,
  onConfirm,
  clientUser,
  adminUser,
  loading = false
}: ImpersonationModalProps) {
  const getInitials = (name: string) => {
    return name.split(' ').map(n => n[0]).join('').toUpperCase()
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <LogIn className="w-5 h-5 text-blue-600" />
            Confirmar Impersonation
          </DialogTitle>
          <DialogDescription>
            Você está prestes a fazer login como outro usuário. Esta ação será registrada nos logs de auditoria.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          {/* Warning */}
          <div className="flex items-start gap-3 p-4 bg-orange-50 border border-orange-200 rounded-lg">
            <AlertTriangle className="w-5 h-5 text-orange-600 mt-0.5 flex-shrink-0" />
            <div className="text-sm text-orange-700">
              <p className="font-medium mb-1">Importante:</p>
              <ul className="space-y-1 text-xs">
                <li>• Todas as ações serão realizadas em nome do cliente</li>
                <li>• A sessão será registrada nos logs de auditoria</li>
                <li>• Você pode voltar para sua conta admin a qualquer momento</li>
              </ul>
            </div>
          </div>

          {/* User cards */}
          <div className="space-y-3">
            {/* Current admin */}
            <div className="flex items-center gap-3 p-3 bg-blue-50 border border-blue-200 rounded-lg">
              <Avatar>
                <AvatarFallback className="bg-blue-100 text-blue-700">
                  {getInitials(adminUser.name)}
                </AvatarFallback>
              </Avatar>
              <div className="flex-1">
                <div className="flex items-center gap-2">
                  <span className="font-medium text-blue-900">{adminUser.name}</span>
                  <Badge variant="secondary" className="bg-blue-100 text-blue-800">
                    <Shield className="w-3 h-3 mr-1" />
                    Admin
                  </Badge>
                </div>
                <p className="text-sm text-blue-700">{adminUser.email}</p>
                <p className="text-xs text-blue-600">Sua conta atual</p>
              </div>
            </div>

            {/* Arrow */}
            <div className="flex justify-center">
              <LogIn className="w-6 h-6 text-muted-foreground" />
            </div>

            {/* Target client */}
            <div className="flex items-center gap-3 p-3 bg-green-50 border border-green-200 rounded-lg">
              <Avatar>
                <AvatarFallback className="bg-green-100 text-green-700">
                  {getInitials(clientUser.name)}
                </AvatarFallback>
              </Avatar>
              <div className="flex-1">
                <div className="flex items-center gap-2">
                  <span className="font-medium text-green-900">{clientUser.name}</span>
                  <Badge variant="outline" className="bg-green-50 text-green-700 border-green-300">
                    <Users className="w-3 h-3 mr-1" />
                    Cliente
                  </Badge>
                </div>
                <p className="text-sm text-green-700">{clientUser.email}</p>
                <p className="text-xs text-green-600">Conta que você irá acessar</p>
              </div>
            </div>
          </div>
        </div>

        <DialogFooter className="flex-col sm:flex-row gap-2">
          <Button
            variant="outline"
            onClick={onClose}
            disabled={loading}
            className="w-full sm:w-auto"
          >
            Cancelar
          </Button>
          <Button
            onClick={onConfirm}
            disabled={loading}
            className="w-full sm:w-auto bg-blue-600 hover:bg-blue-700"
          >
            {loading ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2" />
                Iniciando...
              </>
            ) : (
              <>
                <LogIn className="w-4 h-4 mr-2" />
                Confirmar Impersonation
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}