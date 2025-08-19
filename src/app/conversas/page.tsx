"use client"

import { AdminLayout } from "@/components/layouts/AdminLayout"
import { ConversationsInterface } from "@/components/conversas/conversations-interface"

export default function ConversasPage() {
  return (
    <AdminLayout 
      breadcrumb={[
        { title: "Conversas" }
      ]}
    >
      <div className="flex-1 space-y-4">
        {/* Header */}
        <p className="text-muted-foreground">
          Gerencie e monitore todas as conversas ativas com clientes
        </p>

        <div className="pt-4">
          <ConversationsInterface />
        </div>
      </div>
    </AdminLayout>
  )
}