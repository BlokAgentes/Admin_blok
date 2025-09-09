"use client"

import { useEffect } from "react"
import { useRouter } from "next/navigation"
import { AdminLayout } from "@/components/layouts/AdminLayout"

export default function AdminPage() {
  const router = useRouter()

  useEffect(() => {
    // Redirect to /admin/geral when accessing /admin
    router.replace('/admin/geral')
  }, [router])

  // Show loading content while redirecting
  return (
    <AdminLayout breadcrumb={[{ title: "Admin" }]}>
      <div className="flex items-center justify-center min-h-[50vh]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-white mx-auto mb-4"></div>
          <p className="text-muted-foreground">Redirecionando para a página geral...</p>
        </div>
      </div>
    </AdminLayout>
  )
}