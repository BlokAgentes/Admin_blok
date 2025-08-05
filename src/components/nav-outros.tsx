"use client"

import { type LucideIcon } from "lucide-react"
import { usePathname } from "next/navigation"

import {
  SidebarGroup,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarMenuSub,
  SidebarMenuSubButton,
  SidebarMenuSubItem,
  useSidebar,
} from "@/components/ui/sidebar"
import { useTabSync } from "@/contexts/TabSyncContext"

export function NavOutros({
  outros,
  onCRMClick,
}: {
  outros: {
    name: string
    url: string
    icon: LucideIcon
    items?: {
      title: string
      url: string
      onClick?: () => void
    }[]
  }[]
  onCRMClick?: () => void
}) {
  const { isMobile } = useSidebar()
  const pathname = usePathname()
  const { activeTab } = useTabSync()

  return (
    <SidebarGroup className="group-data-[collapsible=icon]:hidden">
      <SidebarGroupLabel>Outros</SidebarGroupLabel>
      <SidebarMenu>
        {outros.map((item) => (
          <SidebarMenuItem key={item.name}>
            {item.items?.length ? (
              <SidebarMenuButton 
                tooltip={item.name}
                isActive={activeTab === item.name.toLowerCase() || item.items?.some(sub => pathname === sub.url)}
              >
                <item.icon />
                <span>{item.name}</span>
              </SidebarMenuButton>
            ) : (
              <SidebarMenuButton asChild tooltip={item.name} isActive={pathname === item.url || activeTab === item.name.toLowerCase()}>
                <a href={item.url}>
                  <item.icon />
                  <span>{item.name}</span>
                </a>
              </SidebarMenuButton>
            )}
            {item.items?.length ? (
              <SidebarMenuSub className="animate-in fade-in-0 duration-200">
                {item.items?.map((subItem) => (
                  <SidebarMenuSubItem key={subItem.title}>
                    <SidebarMenuSubButton 
                      asChild={!subItem.onClick}
                      onClick={subItem.onClick}
                      isActive={pathname === subItem.url}
                    >
                      {subItem.onClick ? (
                        <button className="w-full text-left">
                          <span>{subItem.title}</span>
                        </button>
                      ) : (
                        <a href={subItem.url}>
                          <span>{subItem.title}</span>
                        </a>
                      )}
                    </SidebarMenuSubButton>
                  </SidebarMenuSubItem>
                ))}
              </SidebarMenuSub>
            ) : null}
          </SidebarMenuItem>
        ))}
      </SidebarMenu>
    </SidebarGroup>
  )
}