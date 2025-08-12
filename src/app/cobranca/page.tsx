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
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Cobrança</h1>
          <p className="text-muted-foreground">
            Gerencie faturas, cobranças e controle financeiro
          </p>
        </div>

        {/* Data Table */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-semibold">Faturas e Cobranças</h2>
          </div>
          
          <DataTableCobranca />
        </div>
      </div>
    </AdminLayout>
  )
} 