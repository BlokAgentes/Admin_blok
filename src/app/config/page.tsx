"use client"

import { useEffect } from "react"
import { useRouter } from "next/navigation"

export default function ConfigPage() {
  const router = useRouter()

  useEffect(() => {
    // Redireciona para a página principal de configurações (/conta)
    router.replace("/conta?section=geral")
  }, [router])

  return (
    <div className="flex items-center justify-center min-h-screen">
      <div className="text-muted-foreground">Redirecionando...</div>
    </div>
  )
}