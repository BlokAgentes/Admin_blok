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
      <div className="flex-1 space-y-4">
        {/* Header */}
        <p className="text-muted-foreground">
          Gerencie seus pagamentos, boletos e cobranças.
        </p>

        {/* Data Table */}
        <DataTableCobranca />
      </div>
    </AdminLayout>
  )
} 