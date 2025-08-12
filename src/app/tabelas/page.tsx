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
      <div className="flex-1 p-4 md:p-6 lg:p-8">
        {/* Data Table */}
        <DataTableDemo />
      </div>
    </AdminLayout>
  )
} 