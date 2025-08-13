"use client"

import { AdminLayout } from "@/components/layouts/AdminLayout"
import { UserTableDashboard } from "@/components/tabelas/user-table-dashboard"


export default function TabelasPage() {
  return (
    <AdminLayout 
      breadcrumb={[
        { title: "Tabelas" }
      ]}
    >
      <div className="flex-1 space-y-4">
        {/* Header */}
        <p className="text-muted-foreground">
          Gerencie usuários, dados e informações do sistema
        </p>

        {/* Data Table */}
        <UserTableDashboard />
      </div>
    </AdminLayout>
  )
} 