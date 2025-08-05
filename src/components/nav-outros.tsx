"use client"

import { ChevronRight, type LucideIcon } from "lucide-react"
import { usePathname } from "next/navigation"

import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible"
import {
  SidebarGroup,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuAction,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarMenuSub,
  SidebarMenuSubButton,
  SidebarMenuSubItem,
  useSidebar,
} from "@/components/ui/sidebar"
import { useCollapsible } from "@/contexts/CollapsibleContext"

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
  const { isItemOpen, toggleItem } = useCollapsible()

  return (
    <SidebarGroup className="group-data-[collapsible=icon]:hidden">
      <SidebarGroupLabel>Outros</SidebarGroupLabel>
      <SidebarMenu>
        {outros.map((item) => (
          <Collapsible 
            key={item.name} 
            asChild 
            open={isItemOpen(item.name)}
            onOpenChange={(open) => toggleItem(item.name)}
          >
            <SidebarMenuItem>
              {item.items?.length ? (
                <SidebarMenuButton 
                  tooltip={item.name}
                  onClick={() => toggleItem(item.name)}
                >
                  <item.icon />
                  <span>{item.name}</span>
                </SidebarMenuButton>
              ) : (
                <SidebarMenuButton asChild tooltip={item.name}>
                  <a href={item.url}>
                    <item.icon />
                    <span>{item.name}</span>
                  </a>
                </SidebarMenuButton>
              )}
              {item.items?.length ? (
                <>
                  <CollapsibleTrigger asChild>
                    <SidebarMenuAction className="data-[state=open]:rotate-90 transition-transform duration-200">
                      <ChevronRight />
                      <span className="sr-only">Toggle</span>
                    </SidebarMenuAction>
                  </CollapsibleTrigger>
                  <CollapsibleContent>
                    <SidebarMenuSub className="animate-in fade-in-0 duration-200">
                      {item.items?.map((subItem) => (
                        <SidebarMenuSubItem key={subItem.title}>
                          <SidebarMenuSubButton 
                            asChild={!subItem.onClick}
                            onClick={subItem.onClick}
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
                  </CollapsibleContent>
                </>
              ) : null}
            </SidebarMenuItem>
          </Collapsible>
        ))}
      </SidebarMenu>
    </SidebarGroup>
  )
}