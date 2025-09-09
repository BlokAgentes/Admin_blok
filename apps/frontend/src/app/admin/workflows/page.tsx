'use client'

import { AdminLayout } from '@/components/layouts/AdminLayout'
import { WorkflowsTable } from '@/components/admin/workflows-table'

export default function AdminWorkflowsPage() {
  return (
    <AdminLayout breadcrumb={[
      { title: "Admin", href: "/admin" },
      { title: "Workflows" }
    ]}>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold">Gerenciamento de Workflows</h1>
          <p className="text-muted-foreground">
            Visualize e gerencie todos os workflows conectados ao n8n
          </p>
        </div>
        
        <WorkflowsTable />
      </div>
    </AdminLayout>
  )
}