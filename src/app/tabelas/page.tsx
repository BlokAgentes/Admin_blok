"use client"

import { AdminLayout } from "@/components/layouts/AdminLayout"
import { DataTableDemo } from "@/components/tabelas/data-table-demo"

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
            Gerencie e visualize dados com tabelas interativas
          </p>
        </div>

        {/* Data Table */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-semibold">Tabela de Pagamentos</h2>
          </div>
          
          <DataTableDemo />
        </div>
      </div>
    </AdminLayout>
  )
} 