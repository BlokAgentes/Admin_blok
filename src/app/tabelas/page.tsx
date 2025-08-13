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
      <div className="flex-1 space-y-6 p-4 md:p-6 lg:p-8">
        {/* Header */}
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Tabelas</h1>
          <p className="text-muted-foreground">
            Gerencie usuários, dados e informações do sistema
          </p>
        </div>

        {/* Data Table */}
        <UserTableDashboard />
      </div>
    </AdminLayout>
  )
} 