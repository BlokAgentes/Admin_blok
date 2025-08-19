"use client"

import { AdminLayout } from "@/components/layouts/AdminLayout"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Calendar } from "lucide-react"

export default function ConfigPerfilPage() {
  return (
    <AdminLayout 
      breadcrumb={[
        { title: "Configuração", href: "/config" },
        { title: "Perfil" }
      ]}
    >
      <div className="max-w-2xl space-y-8">
        {/* Nome */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Nome</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            <Input
              placeholder="Seu nome"
              className="max-w-md"
            />
            <p className="text-sm text-muted-foreground">
              Este é o nome que será exibido no seu perfil e em e-mails.
            </p>
          </CardContent>
        </Card>

        {/* Nome de usuário */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Nome de usuário</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            <Input
              defaultValue="shadcn"
              className="max-w-md"
            />
            <p className="text-sm text-muted-foreground">
              Este é o seu nome público de exibição. Pode ser seu nome real ou um pseudônimo. Você só pode alterá-lo uma vez a cada 30 dias.
            </p>
          </CardContent>
        </Card>

        {/* E-mail */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">E-mail</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            <Select>
              <SelectTrigger className="max-w-md">
                <SelectValue placeholder="Selecione um e-mail verificado para exibir" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="email1">user@example.com</SelectItem>
                <SelectItem value="email2">admin@example.com</SelectItem>
                <SelectItem value="email3">contact@example.com</SelectItem>
              </SelectContent>
            </Select>
            <p className="text-sm text-muted-foreground">
              Você pode gerenciar endereços de e-mail verificados nas configurações de e-mail.
            </p>
          </CardContent>
        </Card>

        {/* Data de nascimento */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Data de nascimento</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            <div className="relative max-w-md">
              <Input
                defaultValue="22 jan 2023"
                className="pr-10"
              />
              <Calendar className="absolute right-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            </div>
            <p className="text-sm text-muted-foreground">
              Sua data de nascimento é usada para calcular sua idade.
            </p>
          </CardContent>
        </Card>

        {/* Idioma */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Idioma</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            <Select>
              <SelectTrigger className="max-w-md">
                <SelectValue placeholder="Selecione o idioma" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="en">Inglês</SelectItem>
                <SelectItem value="pt">Português</SelectItem>
                <SelectItem value="es">Espanhol</SelectItem>
                <SelectItem value="fr">Francês</SelectItem>
              </SelectContent>
            </Select>
            <p className="text-sm text-muted-foreground">
              Este é o idioma que será usado no painel.
            </p>
          </CardContent>
        </Card>

        {/* Botão Salvar */}
        <div className="pt-6">
          <Button size="lg">
            Atualizar perfil
          </Button>
        </div>
      </div>
    </AdminLayout>
  )
} 