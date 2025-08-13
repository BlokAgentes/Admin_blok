"use client"

import * as React from "react"
import {
  BookOpen,
  Bot,
  Command,
  Frame,
  LifeBuoy,
  Map,
  PieChart,
  Send,
  Settings2,
  SquareTerminal,
  Table,
  MessageCircle,
  CreditCard
} from "lucide-react"

import { NavMain } from "@/components/nav-main"
import { NavProjects } from "@/components/nav-projects"
import { NavOutros } from "@/components/nav-outros"
import { NavSecondary } from "@/components/nav-secondary"
import { NavUser } from "@/components/nav-user"
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar"
import { useBlur } from "@/contexts/BlurContext"

const data = {
  user: {
    name: "shadcn",
    email: "m@example.com",
    avatar: "/avatars/shadcn.jpg",
  },
  navMain: [
    {
      title: "Admin",
      url: "/admin",
      icon: SquareTerminal,
      items: [
        {
          title: "Geral",
          url: "/admin/geral",
        },
        {
          title: "Configuração",
          url: "/conta?section=geral",
        },
      ],
    },
  ],
  outros: [
    {
      name: "Configuração",
      url: "#",
      icon: Settings2,
      items: [
        {
          title: "Geral",
          url: "/conta?section=geral",
        },
        {
          title: "Perfil",
          url: "/conta?section=perfil",
        },
        {
          title: "Cobrança",
          url: "/conta?section=cobranca",
        },
        {
          title: "Notificações",
          url: "/conta?section=notificacoes",
        },
      ],
    },
    {
      name: "API - Em Breve",
      url: "#",
      icon: SquareTerminal,
      items: [
        {
          title: "CRM",
          url: "/conta?section=crm",
        },
        {
          title: "Modelos",
          url: "/conta?section=modelos",
        },
      ],
    },
  ],
  navSecondary: [],
  projects: [
    {
      name: "Tabelas",
      url: "/tabelas",
      icon: Table,
    },
    {
      name: "Conversas",
      url: "/conversas",
      icon: MessageCircle,
    },
    {
      name: "Cobrança",
      url: "/cobranca",
      icon: CreditCard,
    },
  ],
}

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  const { setBlurred } = useBlur();

  // Função para lidar com o clique no CRM
  const handleCRMClick = () => {
    setBlurred(true);
    // Remove o blur após 3 segundos
    setTimeout(() => {
      setBlurred(false);
    }, 3000);
  };

  // Criar dados dinamicamente com a função de callback
  const dynamicData = {
    ...data,
    outros: data.outros.map(item => {
      if (item.name === "API - Em Breve") {
        return {
          ...item,
          items: item.items?.map(subItem => {
            // Removendo o onClick do CRM já que agora tem página própria
            return subItem;
          })
        };
      }
      return item;
    })
  };

  return (
    <Sidebar variant="inset" {...props}>
      <SidebarHeader>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton size="lg" asChild>
              <a href="#">
                <div className="flex aspect-square size-8 items-center justify-center rounded-lg bg-sidebar-primary text-sidebar-primary-foreground">
                  <Command className="size-4" />
                </div>
                <div className="grid flex-1 text-left text-sm leading-tight">
                  <span className="truncate font-semibold">Acme Inc</span>
                  <span className="truncate text-xs">Enterprise</span>
                </div>
              </a>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>
      <SidebarContent>
        <NavMain items={dynamicData.navMain} />
        <NavProjects projects={dynamicData.projects} />
        <NavOutros outros={dynamicData.outros} />
        <NavSecondary items={dynamicData.navSecondary} className="mt-auto" />
      </SidebarContent>
      <SidebarFooter>
        <NavUser user={dynamicData.user} />
      </SidebarFooter>
    </Sidebar>
  )
}
