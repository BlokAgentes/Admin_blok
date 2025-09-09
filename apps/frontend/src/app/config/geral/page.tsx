"use client"

import { AdminLayout } from "@/components/layouts/AdminLayout"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Switch } from "@/components/ui/switch"
import { Label } from "@/components/ui/label"
import { Separator } from "@/components/ui/separator"
import { FlowExecutionChart } from "@/components/charts/flow-execution-chart"
import { ConversasStats } from "@/components/conversas/stats-cards"
import { ShimmerButton } from "@/components/magicui/shimmer-button"
import { Settings, Bell, Shield, Palette, Database, Globe } from "lucide-react"

export default function ConfigGeralPage() {
  return (
    <AdminLayout 
      breadcrumb={[
        { title: "Configuração", href: "/config" },
        { title: "Geral" }
      ]}
    >
      <div className="max-w-6xl space-y-8">
        {/* Stats Overview */}
        <div className="space-y-4">
          <h2 className="text-lg font-semibold flex items-center gap-2">
            <Settings className="h-5 w-5" />
            Visão Geral do Sistema
          </h2>
          <ConversasStats 
            totalContacts={1247}
            unreadMessages={23}
            totalConversations={89}
          />
        </div>

        <Separator />

        {/* Chart Section */}
        <div className="space-y-4">
          <h2 className="text-lg font-semibold">Analytics de Performance</h2>
          <FlowExecutionChart data={[]} />
        </div>

        <Separator />

        {/* Configuration Cards Grid */}
        <div className="grid gap-6 md:grid-cols-2">
          {/* Configurações Básicas */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <Globe className="h-5 w-5" />
                Configurações Básicas
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="app-name">Nome da Aplicação</Label>
                <Input
                  id="app-name"
                  defaultValue="Blok"
                  className="max-w-md"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="app-url">URL da Aplicação</Label>
                <Input
                  id="app-url"
                  defaultValue="https://app.blok.com"
                  className="max-w-md"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="timezone">Fuso Horário</Label>
                <Select>
                  <SelectTrigger className="max-w-md">
                    <SelectValue placeholder="Selecione o fuso horário" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="america/sao_paulo">America/São_Paulo (UTC-3)</SelectItem>
                    <SelectItem value="america/new_york">America/New_York (UTC-5)</SelectItem>
                    <SelectItem value="europe/london">Europe/London (UTC+0)</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
          </Card>

          {/* Configurações de Notificação */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <Bell className="h-5 w-5" />
                Notificações
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>Notificações por Email</Label>
                  <p className="text-sm text-muted-foreground">
                    Receber notificações importantes por email
                  </p>
                </div>
                <Switch defaultChecked />
              </div>
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>Notificações Push</Label>
                  <p className="text-sm text-muted-foreground">
                    Notificações no navegador
                  </p>
                </div>
                <Switch />
              </div>
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>Relatórios Semanais</Label>
                  <p className="text-sm text-muted-foreground">
                    Resumo semanal por email
                  </p>
                </div>
                <Switch defaultChecked />
              </div>
            </CardContent>
          </Card>

          {/* Configurações de Segurança */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <Shield className="h-5 w-5" />
                Segurança
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>Autenticação de Dois Fatores</Label>
                  <p className="text-sm text-muted-foreground">
                    Aumentar a segurança da conta
                  </p>
                </div>
                <Switch />
              </div>
              <div className="space-y-2">
                <Label htmlFor="session-timeout">Timeout de Sessão (minutos)</Label>
                <Input
                  id="session-timeout"
                  type="number"
                  defaultValue="30"
                  className="max-w-32"
                />
              </div>
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>Logs de Auditoria</Label>
                  <p className="text-sm text-muted-foreground">
                    Registrar ações dos usuários
                  </p>
                </div>
                <Switch defaultChecked />
              </div>
            </CardContent>
          </Card>

          {/* Configurações de Tema */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <Palette className="h-5 w-5" />
                Aparência
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="theme">Tema</Label>
                <Select>
                  <SelectTrigger className="max-w-md">
                    <SelectValue placeholder="Selecione o tema" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="light">Claro</SelectItem>
                    <SelectItem value="dark">Escuro</SelectItem>
                    <SelectItem value="system">Sistema</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="language">Idioma</Label>
                <Select>
                  <SelectTrigger className="max-w-md">
                    <SelectValue placeholder="Selecione o idioma" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="pt">Português</SelectItem>
                    <SelectItem value="en">English</SelectItem>
                    <SelectItem value="es">Español</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>Animações</Label>
                  <p className="text-sm text-muted-foreground">
                    Habilitar animações na interface
                  </p>
                </div>
                <Switch defaultChecked />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Database Configuration */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <Database className="h-5 w-5" />
              Configurações do Banco de Dados
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="db-host">Host do Banco</Label>
                <Input
                  id="db-host"
                  defaultValue="localhost"
                  disabled
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="db-port">Porta</Label>
                <Input
                  id="db-port"
                  defaultValue="5432"
                  disabled
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="db-name">Nome do Banco</Label>
                <Input
                  id="db-name"
                  defaultValue="client_flows_db"
                  disabled
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="backup-frequency">Frequência de Backup</Label>
                <Select>
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione a frequência" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="daily">Diário</SelectItem>
                    <SelectItem value="weekly">Semanal</SelectItem>
                    <SelectItem value="monthly">Mensal</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Action Buttons */}
        <div className="flex gap-4 pt-6">
          <ShimmerButton className="px-8 py-3">
            Salvar Configurações
          </ShimmerButton>
          <Button variant="outline" size="lg">
            Restaurar Padrões
          </Button>
          <Button variant="secondary" size="lg">
            Exportar Configurações
          </Button>
        </div>
      </div>
    </AdminLayout>
  )
} 