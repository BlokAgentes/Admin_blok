"use client"

import React from 'react'
import { AppSidebar } from "@/components/app-sidebar"
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb"
import { Separator } from "@/components/ui/separator"
import {
  SidebarInset,
  SidebarProvider,
  SidebarTrigger,
} from "@/components/ui/sidebar"
import { useBlur } from "@/contexts/BlurContext"
import { useSidebarState } from "@/contexts/SidebarContext"

interface AdminLayoutProps {
  children: React.ReactNode
  breadcrumb?: {
    title: string
    href?: string
  }[]
  pageTitle?: string
}

export function AdminLayout({ children, breadcrumb, pageTitle }: AdminLayoutProps) {
  const { isBlurred } = useBlur()
  const { isOpen, setIsOpen } = useSidebarState()
  
  // Use the last breadcrumb item as page title, or pageTitle prop, or default to "Geral"
  const currentPageTitle = pageTitle || breadcrumb?.[breadcrumb.length - 1]?.title || "Geral"

  return (
    <SidebarProvider 
      className="min-h-screen bg-background font-geist"
      open={isOpen}
      onOpenChange={setIsOpen}
    >
      <AppSidebar />
      <SidebarInset className="bg-background rounded-tl-xl rounded-tr-xl overflow-hidden">
        <header className="flex h-16 shrink-0 items-center gap-2 transition-[width,height] ease-linear group-has-[[data-collapsible=icon]]/sidebar-wrapper:h-12 bg-background rounded-tl-xl rounded-tr-xl">
          <div className="flex items-center gap-2 px-4 flex-1">
            <SidebarTrigger className="-ml-1" />
            <Separator orientation="vertical" className="mr-2 h-4" />
            <Breadcrumb>
              <BreadcrumbList>
                <BreadcrumbItem className="hidden md:block">
                  <BreadcrumbLink href="/admin">
                    Painel de Controle
                  </BreadcrumbLink>
                </BreadcrumbItem>
                {breadcrumb?.map((item, index) => (
                  <React.Fragment key={`breadcrumb-${index}`}>
                    <BreadcrumbSeparator className="hidden md:block" />
                    <BreadcrumbItem>
                      {item.href ? (
                        <BreadcrumbLink href={item.href}>
                          {item.title}
                        </BreadcrumbLink>
                      ) : (
                        <BreadcrumbPage>{item.title}</BreadcrumbPage>
                      )}
                    </BreadcrumbItem>
                  </React.Fragment>
                ))}
              </BreadcrumbList>
            </Breadcrumb>
          </div>
        </header>
        <div 
          className={`flex flex-1 flex-col p-4 pt-0 transition-all duration-300 bg-background ${
            isBlurred ? 'blur-sm pointer-events-none' : ''
          }`}
        >
          <Separator className="w-full mb-4" />
          <div className="flex items-center gap-2 px-0 mb-1">
            <h1 className="text-2xl font-semibold">{currentPageTitle}</h1>
          </div>
          {children}
        </div>
      </SidebarInset>
    </SidebarProvider>
  )
}