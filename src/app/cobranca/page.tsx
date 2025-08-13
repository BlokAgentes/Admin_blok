"use client"

import { AdminLayout } from "@/components/layouts/AdminLayout"
import { DataTableCobranca } from "@/components/cobranca/data-table-cobranca"

export default function CobrancaPage() {
  return (
    <AdminLayout 
      breadcrumb={[
        { title: "Cobrança" }
      ]}
    >
      <div className="flex-1 space-y-6 p-4 md:p-6 lg:p-8">
        {/* Header */}
        <p className="text-muted-foreground">
          Gerencie faturas, cobranças e controle financeiro
        </p>

        {/* Data Table */}
        <DataTableCobranca />
      </div>
    </AdminLayout>
  )
} 