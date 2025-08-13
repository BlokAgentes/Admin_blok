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
        <p className="text-3xl font-bold tracking-tight text-muted-foreground">
          Gerencie seus pagamentos, boletos e cobranças.
        </p>

        {/* Data Table */}
        <DataTableCobranca />
      </div>
    </AdminLayout>
  )
} 