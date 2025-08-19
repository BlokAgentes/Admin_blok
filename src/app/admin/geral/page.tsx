"use client"

import { AdminLayout } from "@/components/layouts/AdminLayout"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle, CardToolbar } from "@/components/ui/card"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import CashflowChart from "@/components/charts/cashflow-chart"
import { 
  TrendingUp, 
  Clock, 
  Users, 
  HardDrive, 
  DollarSign,
  ArrowDown, 
  ArrowUp, 
  MoreHorizontal, 
  Pin, 
  Settings, 
  Share2, 
  Trash, 
  TriangleAlert
} from "lucide-react"
import { useState } from "react"


function formatNumber(n: number) {
  if (n >= 1_000_000) return (n / 1_000_000).toFixed(1) + 'M';
  if (n >= 1_000) {
    return n.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ',');
  }
  return n.toString();
}

export default function GeralPage() {
  const stats = [
    {
      title: 'Execuções Totais',
      value: 750,
      delta: 10.2,
      lastMonth: 600,
      positive: true,
      prefix: '',
      suffix: '',
    },
    {
      title: 'Tempo Médio',
      value: 5.14,
      delta: 8.5,
      lastMonth: 4.74,
      positive: false,
      suffix: ' min',
    },
    {
      title: 'Total de Usuários',
      value: 8344,
      delta: 14.2,
      lastMonth: 7300,
      positive: true,
      prefix: '',
      suffix: '',
    },
    {
      title: 'Horas Economizadas',
      value: 1247,
      delta: 15.3,
      lastMonth: 1084,
      positive: true,
      suffix: 'h',
    },
  ]

  const recentActivities = [
    {
      email: "braulio4@yahoo.com",
      id: "#329341",
      duration: "4:32 min",
      date: "14/08/2025 14:23",
      avatar: "Br"
    },
    {
      email: "jane_heidenreich@gmail.com",
      id: "#329341",
      duration: "5:47 min",
      date: "13/08/2025 09:15",
      avatar: "Ja"
    },
    {
      email: "octavia_konopelski28@yahoo.com",
      id: "#329341",
      duration: "4:15 min",
      date: "12/08/2025 16:42",
      avatar: "Oc"
    },
    {
      email: "pedro6@hotmail.com",
      id: "#329341",
      duration: "6:08 min",
      date: "11/08/2025 11:37",
      avatar: "Pe"
    },
    {
      email: "maria.silva@gmail.com",
      id: "#329342",
      duration: "3:45 min",
      date: "10/08/2025 15:20",
      avatar: "Ma"
    }
  ]

  return (
    <AdminLayout 
      breadcrumb={[
        { title: "Admin", href: "/admin" },
        { title: "Geral" }
      ]}
    >
      <div className="flex-1 space-y-4">
        {/* Header */}
        <p className="text-muted-foreground">
          Overview de sua conta e atividades
        </p>

        {/* Content Container */}
        <div className="pt-4">
          {/* Layout: Stats Cards on Left, Table on Right */}
          <div className="grid gap-6 lg:grid-cols-2 mb-8">
            {/* Left Side - Stats Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              {stats.map((stat, index) => (
                <Card key={index}>
                  <CardHeader className="border-0">
                    <CardTitle className="text-muted-foreground text-sm font-medium">{stat.title}</CardTitle>
                    <CardToolbar>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end" side="bottom">
                          <DropdownMenuItem>
                            <Settings className="mr-2 h-4 w-4" />
                            Configurações
                          </DropdownMenuItem>
                          <DropdownMenuItem>
                            <TriangleAlert className="mr-2 h-4 w-4" /> Adicionar Alerta
                          </DropdownMenuItem>
                          <DropdownMenuItem>
                            <Pin className="mr-2 h-4 w-4" /> Fixar no Dashboard
                          </DropdownMenuItem>
                          <DropdownMenuItem>
                            <Share2 className="mr-2 h-4 w-4" /> Compartilhar
                          </DropdownMenuItem>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem className="text-destructive">
                            <Trash className="mr-2 h-4 w-4" />
                            Remover
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </CardToolbar>
                  </CardHeader>
                  <CardContent className="space-y-2.5">
                    <div className="flex items-center gap-2.5">
                      <span className="text-2xl font-medium text-foreground tracking-tight">
                        {formatNumber(stat.value)}{stat.suffix || ''}
                      </span>
                      <Badge variant={stat.positive ? 'secondary' : 'destructive'} className={`text-xs ${stat.positive ? 'bg-green-100 text-green-800 hover:bg-green-200' : 'bg-red-100 text-red-800 hover:bg-red-200'}`}>
                        {stat.delta > 0 ? <ArrowUp className="w-3 h-3 mr-1" /> : <ArrowDown className="w-3 h-3 mr-1" />}
                        {stat.delta}%
                      </Badge>
                    </div>
                    <div className="text-xs text-muted-foreground mt-2 border-t pt-2.5">
                      Vs mês passado:{' '}
                      <span className="font-medium text-foreground">
                        {formatNumber(stat.lastMonth)}{stat.suffix || ''}
                      </span>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>

            {/* Right Side - Table */}
            <div className="space-y-4">
              {/* Title */}
              <h3 className="text-lg font-semibold text-foreground">Atividade Recente</h3>
              
              {/* Table */}
              <div className="overflow-x-auto">
                <table className="w-full border-collapse">
                  <thead className="bg-muted/50 border-t border-b border-border">
                    <tr>
                      <th className="text-left p-3 w-10">
                        <input type="checkbox" className="w-4 h-4 border border-input rounded cursor-pointer"/>
                      </th>
                      <th className="text-left p-3 text-sm font-medium text-muted-foreground">Email ↓</th>
                      <th className="text-left p-3 text-sm font-medium text-muted-foreground">ID</th>
                      <th className="text-left p-3 text-sm font-medium text-muted-foreground">Duração</th>
                      <th className="text-left p-3 text-sm font-medium text-muted-foreground">Data</th>
                    </tr>
                  </thead>
                  <tbody>
                    {recentActivities.map((activity, index) => (
                      <tr key={index} className="border-b border-border hover:bg-muted/50 transition-colors">
                        <td className="p-4">
                          <input type="checkbox" className="w-4 h-4 border border-input rounded cursor-pointer"/>
                        </td>
                        <td className="p-4">
                          <span className="text-sm font-medium text-foreground underline cursor-pointer hover:text-primary">{activity.email}</span>
                        </td>
                        <td className="p-4 text-sm text-foreground">{activity.id}</td>
                        <td className="p-4 text-sm text-foreground">{activity.duration}</td>
                        <td className="p-4 text-sm text-foreground">{activity.date}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>

        {/* Cashflow Chart Section */}
        <CashflowChart />
      </div>
    </AdminLayout>
  )
}