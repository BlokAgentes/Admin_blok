"use client"

import { useEffect, useState } from "react"
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle, CardToolbar } from '@/components/ui/card'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { ArrowDown, ArrowUp, MoreHorizontal, Pin, Settings, Share2, Trash, TriangleAlert } from 'lucide-react'

const stats = [
  {
    title: 'Quantidade Total',
    value: 122380,
    delta: 15.1,
    lastMonth: 105922,
    positive: true,
    prefix: '',
    suffix: '',
  },
  {
    title: 'Pedidos Criados',
    value: 1902380,
    delta: -2.0,
    lastMonth: 2002098,
    positive: false,
    prefix: '',
    suffix: '',
  },
  {
    title: 'Eficiência',
    value: 98.1,
    delta: 0.4,
    lastMonth: 97.8,
    positive: true,
    prefix: '',
    suffix: '%',
    format: (v: number) => `${v}%`,
    lastFormat: (v: number) => `${v}%`,
  },
  {
    title: 'Usuários Ativos*',
    value: 48210,
    delta: 3.7,
    lastMonth: 46480,
    positive: true,
    prefix: '',
    suffix: '',
  },
];

function formatNumber(n: number) {
  if (n >= 1_000_000) return (n / 1_000_000).toFixed(1) + 'M';
  if (n >= 1_000) {
    // Use a locale-independent approach to avoid hydration mismatches
    return n.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ',');
  }
  return n.toString();
}

export function UserTableDashboard() {
  const [showModal, setShowModal] = useState(false)
  const [passwordVisible, setPasswordVisible] = useState({
    password: false,
    confirmPassword: false
  })

  const togglePassword = (field: 'password' | 'confirmPassword') => {
    setPasswordVisible(prev => ({
      ...prev,
      [field]: !prev[field]
    }))
  }

  // Prevent background scroll when modal is open
  useEffect(() => {
    if (showModal) {
      const originalOverflow = document.body.style.overflow
      document.body.style.overflow = 'hidden'
      return () => {
        document.body.style.overflow = originalOverflow
      }
    }
  }, [showModal])

  return (
    <div className="pt-4">
      {/* Header removed: Add User will live next to View in controls */}

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
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
                  {stat.format ? stat.format(stat.value) : stat.prefix + formatNumber(stat.value) + stat.suffix}
                </span>
                <Badge variant={stat.positive ? 'secondary' : 'destructive'} className={`text-xs ${stat.positive ? 'bg-green-100 text-green-800 hover:bg-green-200' : 'bg-red-100 text-red-800 hover:bg-red-200'}`}>
                  {stat.delta > 0 ? <ArrowUp className="w-3 h-3 mr-1" /> : <ArrowDown className="w-3 h-3 mr-1" />}
                  {stat.delta}%
                </Badge>
              </div>
              <div className="text-xs text-muted-foreground mt-2 border-t pt-2.5">
                Vs mês passado:{' '}
                <span className="font-medium text-foreground">
                  {stat.lastFormat
                    ? stat.lastFormat(stat.lastMonth)
                    : stat.prefix + formatNumber(stat.lastMonth) + stat.suffix}
                </span>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Table Controls */}
      <div className="flex justify-between items-center mb-5">
        <div className="flex items-center gap-4">
          <div className="relative w-70">
            <input 
              type="text" 
              placeholder="Buscar" 
              className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm transition-colors file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50"
            />
          </div>
        </div>
        <div className="flex items-center gap-2">
          <button 
            onClick={() => setShowModal(true)}
            className="inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50 bg-primary text-primary-foreground shadow hover:bg-primary/90 h-9 px-4 py-2"
          >
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
              <path d="M8 4V12M4 8H12" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
            </svg>
            Adicionar
          </button>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button className="inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50 border border-input bg-background shadow-sm hover:bg-accent hover:text-accent-foreground h-9 px-4 py-2">
                <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                  <line x1="3" y1="8" x2="13" y2="8" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
                  <circle cx="6" cy="8" r="2" fill="white" stroke="currentColor" strokeWidth="1.5"/>
                  <circle cx="10" cy="8" r="2" fill="white" stroke="currentColor" strokeWidth="1.5"/>
                </svg>
                Filtro
              </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" side="bottom" className="w-64">
              <div className="text-sm font-semibold text-foreground p-2 mb-2">Filtrar Colunas</div>
              
              <DropdownMenuItem>
                <div className="flex items-center gap-3 w-full">
                  <div className="w-4 h-4 border-2 border-primary rounded bg-primary flex items-center justify-center">
                    <span className="text-primary-foreground text-xs">✓</span>
                  </div>
                  <span className="text-sm text-foreground">Nome</span>
                </div>
              </DropdownMenuItem>
              
              <DropdownMenuItem>
                <div className="flex items-center gap-3 w-full">
                  <div className="w-4 h-4 border-2 border-primary rounded bg-primary flex items-center justify-center">
                    <span className="text-primary-foreground text-xs">✓</span>
                  </div>
                  <span className="text-sm text-foreground">Email</span>
                </div>
              </DropdownMenuItem>
              
              <DropdownMenuItem>
                <div className="flex items-center gap-3 w-full">
                  <div className="w-4 h-4 border-2 border-primary rounded bg-primary flex items-center justify-center">
                    <span className="text-primary-foreground text-xs">✓</span>
                  </div>
                  <span className="text-sm text-foreground">Telefone</span>
                </div>
              </DropdownMenuItem>
              
              <DropdownMenuItem>
                <div className="flex items-center gap-3 w-full">
                  <div className="w-4 h-4 border-2 border-primary rounded bg-primary flex items-center justify-center">
                    <span className="text-primary-foreground text-xs">✓</span>
                  </div>
                  <span className="text-sm text-foreground">Data de Registro</span>
                </div>
              </DropdownMenuItem>
              
              <DropdownMenuItem>
                <div className="flex items-center gap-3 w-full">
                  <div className="w-4 h-4 border-2 border-primary rounded bg-primary flex items-center justify-center">
                    <span className="text-primary-foreground text-xs">✓</span>
                  </div>
                  <span className="text-sm text-foreground">Último Login</span>
                </div>
              </DropdownMenuItem>
              
              <DropdownMenuItem>
                <div className="flex items-center gap-3 w-full">
                  <div className="w-4 h-4 border-2 border-primary rounded bg-primary flex items-center justify-center">
                    <span className="text-primary-foreground text-xs">✓</span>
                  </div>
                  <span className="text-sm text-foreground">Status</span>
                </div>
              </DropdownMenuItem>
              
              <DropdownMenuItem>
                <div className="flex items-center gap-3 w-full">
                  <div className="w-4 h-4 border-2 border-primary rounded bg-primary flex items-center justify-center">
                    <span className="text-primary-foreground text-xs">✓</span>
                  </div>
                  <span className="text-sm text-foreground">Cargo</span>
                </div>
              </DropdownMenuItem>
              
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>

      {/* Table */}
      <div className="overflow-x-auto">
        <table className="w-full border-collapse">
          <thead className="bg-muted/50 border-t border-b border-border">
            <tr>
              <th className="text-left p-3 w-10">
                <input type="checkbox" className="w-4 h-4 border border-input rounded cursor-pointer"/>
              </th>
              <th className="text-left p-3 text-sm font-medium text-muted-foreground">Name</th>
              <th className="text-left p-3 text-sm font-medium text-muted-foreground">Email ↓</th>
              <th className="text-left p-3 text-sm font-medium text-muted-foreground">Phone Number</th>
              <th className="text-left p-3 text-sm font-medium text-muted-foreground">Registered Date</th>
              <th className="text-left p-3 text-sm font-medium text-muted-foreground">Last Login Date</th>
              <th className="text-left p-3 text-sm font-medium text-muted-foreground">Status</th>
              <th className="text-left p-3 text-sm font-medium text-muted-foreground">Role</th>
              <th className="text-left p-3 text-sm font-medium text-muted-foreground"></th>
            </tr>
          </thead>
          <tbody>
            {[
              { name: "Montana Muller", email: "montana_schamberger@yahoo.com", phone: "+12827614031", registered: "12 Nov, 2024", lastLogin: "16 Jul, 2025", status: "Active", role: "Cashier", icon: "👤" },
              { name: "Aida Durgan", email: "aida_graham@gmail.com", phone: "+14069695927", registered: "24 Aug, 2024", lastLogin: "10 Jun, 2025", status: "Invited", role: "Superadmin", icon: "⭕" },
              { name: "Chadrick Trantow", email: "chadrick26@yahoo.com", phone: "+16939493174", registered: "24 Mar, 2025", lastLogin: "08 Jul, 2025", status: "Inactive", role: "Superadmin", icon: "⭕" },
              { name: "Abbie Reilly", email: "abbie_roberts@yahoo.com", phone: "+15843633665", registered: "27 Jan, 2025", lastLogin: "26 Jun, 2025", status: "Inactive", role: "Manager", icon: "👤" },
              { name: "Charley Hane", email: "charley_lebsack53@yahoo.com", phone: "+14937636683", registered: "01 Apr, 2025", lastLogin: "22 Jul, 2025", status: "Invited", role: "Admin", icon: "👤" },
              { name: "Loyce Lubowitz", email: "loyce56@yahoo.com", phone: "+12564755345", registered: "10 Sep, 2024", lastLogin: "11 Jun, 2025", status: "Active", role: "Manager", icon: "👤" },
              { name: "Jillian Klocko", email: "jillian.ernser85@hotmail.com", phone: "+17363308778", registered: "26 Nov, 2024", lastLogin: "08 May, 2025", status: "Suspended", role: "Manager", icon: "👤" },
              { name: "Donavon Donnelly", email: "donavon_reinger49@yahoo.com", phone: "+16507749792", registered: "16 Dec, 2024", lastLogin: "26 Jan, 2025", status: "Invited", role: "Admin", icon: "👤" },
              { name: "Kameron Turcotte", email: "kameron.heller25@yahoo.com", phone: "+19715552582", registered: "26 Nov, 2024", lastLogin: "18 Jul, 2025", status: "Inactive", role: "Superadmin", icon: "⭕" },
              { name: "Vernie Collins", email: "vernie75@yahoo.com", phone: "+17988907194", registered: "26 Apr, 2025", lastLogin: "29 May, 2025", status: "Invited", role: "Superadmin", icon: "⭕" }
            ].map((user, index) => (
              <tr key={index} className="border-b border-border hover:bg-muted/50 transition-colors">
                <td className="p-4">
                  <input type="checkbox" className="w-4 h-4 border border-input rounded cursor-pointer"/>
                </td>
                <td className="p-4">
                  <span className="text-sm font-medium text-foreground underline cursor-pointer hover:text-primary">{user.name}</span>
                </td>
                <td className="p-4 text-sm text-foreground">{user.email}</td>
                <td className="p-4 text-sm text-foreground">{user.phone}</td>
                <td className="p-4 text-sm text-foreground">{user.registered}</td>
                <td className="p-4 text-sm text-foreground">{user.lastLogin}</td>
                <td className="p-4">
                  <span className={`inline-block px-2 py-1 rounded text-xs font-medium ${
                    user.status === 'Active' ? 'bg-green-100 text-green-800' :
                    user.status === 'Invited' ? 'bg-blue-100 text-blue-800' :
                    user.status === 'Inactive' ? 'bg-gray-100 text-gray-600' :
                    user.status === 'Suspended' ? 'bg-red-100 text-red-800' : ''
                  }`}>
                    {user.status}
                  </span>
                </td>
                <td className="p-4">
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <span>{user.icon}</span>
                    <span>{user.role}</span>
                  </div>
                </td>
                <td className="p-4">
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <button className="text-muted-foreground hover:text-foreground p-1 transition-colors">
                        <MoreHorizontal className="h-4 w-4" />
                      </button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuLabel>Ações</DropdownMenuLabel>
                      <DropdownMenuItem>
                        Editar
                      </DropdownMenuItem>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem>
                        Adicionar em Cima
                      </DropdownMenuItem>
                      <DropdownMenuItem>
                        Adicionar em Baixo
                      </DropdownMenuItem>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem className="text-destructive">
                        Remover
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      <div className="flex justify-end items-center mt-5 pt-4">
        <div className="flex gap-1">
          <button disabled className="inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50 border border-input bg-background shadow-sm hover:bg-accent hover:text-accent-foreground h-8 w-8">
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
              <path d="M10 4L6 8L10 12" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
              <path d="M6 4L2 8L6 12" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
            </svg>
          </button>
          <button disabled className="inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50 border border-input bg-background shadow-sm hover:bg-accent hover:text-accent-foreground h-8 w-8">
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
              <path d="M10 4L6 8L10 12" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
            </svg>
          </button>
          <button className="inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50 border border-input bg-background shadow-sm hover:bg-accent hover:text-accent-foreground h-8 w-8">
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
              <path d="M6 4L10 8L6 12" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
            </svg>
          </button>
          <button className="inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50 border border-input bg-background shadow-sm hover:bg-accent hover:text-accent-foreground h-8 w-8">
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
              <path d="M6 4L10 8L6 12" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
              <path d="M10 4L14 8L10 12" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
            </svg>
          </button>
        </div>
      </div>

      {/* Add User Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50" onClick={() => setShowModal(false)}>
          <div className="bg-background rounded-xl w-full max-w-md mx-4 animate-in slide-in-from-top-4 border border-border shadow-lg overflow-hidden" onClick={(e) => e.stopPropagation()}>
            <div className="flex justify-between items-center p-6 border-b border-border">
              <h2 className="font-semibold leading-none tracking-tight">Adicionar novo usuário</h2>
              <button 
                onClick={() => setShowModal(false)}
                className="w-8 h-8 flex items-center justify-center text-muted-foreground hover:bg-accent rounded-lg transition-colors"
              >
                ×
              </button>
            </div>
            <div className="p-6 max-h-[70vh] overflow-y-auto">
              <p className="text-sm text-muted-foreground mb-6">Crie um novo usuário aqui. Clique em salvar quando terminar.</p>
              
              <div className="space-y-4">
                <div>
                  <label className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">Nome</label>
                  <input type="text" placeholder="João" className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm transition-colors file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50"/>
                </div>

                <div>
                  <label className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">Sobrenome</label>
                  <input type="text" placeholder="Silva" className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm transition-colors file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50"/>
                </div>

                <div>
                  <label className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">Nome de usuário</label>
                  <input type="text" placeholder="john_doe" className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm transition-colors file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50"/>
                </div>

                <div>
                  <label className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">E-mail</label>
                  <input type="email" placeholder="joao.silva@gmail.com" className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm transition-colors file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50"/>
                </div>

                <div>
                  <label className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">Telefone</label>
                  <input type="tel" placeholder="+123456789" className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm transition-colors file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50"/>
                </div>

                <div>
                  <label className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">Cargo</label>
                  <select className="flex h-9 w-full items-center justify-between whitespace-nowrap rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-sm ring-offset-background placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-ring disabled:cursor-not-allowed disabled:opacity-50">
                    <option value="">Selecione um cargo</option>
                    <option value="admin">Administrador</option>
                    <option value="manager">Gerente</option>
                    <option value="cashier">Caixa</option>
                    <option value="superadmin">Superadministrador</option>
                  </select>
                </div>

                <div>
                  <label className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">Senha</label>
                  <div className="relative">
                    <input 
                      type={passwordVisible.password ? "text" : "password"} 
                      placeholder="••••••••" 
                      className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 pr-10 text-sm shadow-sm transition-colors file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50"
                    />
                    <button 
                      type="button"
                      onClick={() => togglePassword('password')}
                      className="absolute right-3 top-1/2 transform -translate-y-1/2 text-muted-foreground hover:text-foreground p-1 transition-colors"
                    >
                      <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
                        <path d="M10 4C4.5 4 1 10 1 10s3.5 6 9 6 9-6 9-6-3.5-6-9-6z" stroke="currentColor" strokeWidth="1.5"/>
                        <circle cx="10" cy="10" r="3" stroke="currentColor" strokeWidth="1.5"/>
                      </svg>
                    </button>
                  </div>
                </div>

                <div>
                  <label className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">Confirmar senha</label>
                  <div className="relative">
                    <input 
                      type={passwordVisible.confirmPassword ? "text" : "password"} 
                      placeholder="••••••••" 
                      className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 pr-10 text-sm shadow-sm transition-colors file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50"
                    />
                    <button 
                      type="button"
                      onClick={() => togglePassword('confirmPassword')}
                      className="absolute right-3 top-1/2 transform -translate-y-1/2 text-muted-foreground hover:text-foreground p-1 transition-colors"
                    >
                      <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
                        <path d="M10 4C4.5 4 1 10 1 10s3.5 6 9 6 9-6 9-6-3.5-6-9-6z" stroke="currentColor" strokeWidth="1.5"/>
                        <circle cx="10" cy="10" r="3" stroke="currentColor" strokeWidth="1.5"/>
                      </svg>
                    </button>
                  </div>
                </div>
              </div>
            </div>
            <div className="p-6 border-t border-border flex justify-end">
              <button 
                onClick={() => setShowModal(false)}
                className="inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50 bg-primary text-primary-foreground shadow hover:bg-primary/90 h-9 px-4 py-2"
              >
                Salvar alterações
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  )
}
