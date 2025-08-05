"use client"

import { AdminLayout } from "@/components/layouts/AdminLayout"

export default function GeralPage() {
  return (
    <AdminLayout 
      breadcrumb={[
        { title: "Admin", href: "/admin" },
        { title: "Geral" }
      ]}
    >
      <div className="grid auto-rows-min gap-4 md:grid-cols-3">
        <div className="aspect-video rounded-xl bg-muted/50" />
        <div className="aspect-video rounded-xl bg-muted/50" />
        <div className="aspect-video rounded-xl bg-muted/50" />
      </div>
      <div className="min-h-[100vh] flex-1 rounded-xl bg-muted/50 md:min-h-min" />
    </AdminLayout>
  )
} 