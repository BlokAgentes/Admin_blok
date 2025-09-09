"use client"

import * as React from "react"
import {
  ColumnDef,
  ColumnFiltersState,
  flexRender,
  getCoreRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  SortingState,
  useReactTable,
  VisibilityState,
} from "@tanstack/react-table"
import { ArrowUpDown, ChevronDown, MoreHorizontal } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox"
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Input } from "@/components/ui/input"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"

// Data interface for billing/invoice records
export interface Cobranca {
  id: string
  valor: number
  status: "pendente" | "pago" | "vencido" | "cancelado"
  cliente: string
  email: string
  dataVencimento: Date
  dataPagamento?: Date
  descricao: string
  numeroFatura: string
  metodoPagamento?: "cartao" | "boleto" | "pix" | "transferencia"
}

const dataCobranca: Cobranca[] = [
  {
    id: "fat001",
    valor: 850.00,
    status: "pago",
    cliente: "João Silva Ltda",
    email: "joao@silvaempresa.com",
    dataVencimento: new Date("2025-08-15"),
    dataPagamento: new Date("2025-08-12"),
    descricao: "Serviços de automação - Agosto 2025",
    numeroFatura: "FAT-2025-001",
    metodoPagamento: "pix"
  },
  {
    id: "fat002", 
    valor: 1200.50,
    status: "pendente",
    cliente: "Maria Santos ME",
    email: "maria@santosme.com.br",
    dataVencimento: new Date("2025-08-20"),
    descricao: "Plataforma CRM - Mensalidade",
    numeroFatura: "FAT-2025-002"
  },
  {
    id: "fat003",
    valor: 2400.00,
    status: "vencido",
    cliente: "Pedro Oliveira & Cia",
    email: "pedro@oliveiracia.com",
    dataVencimento: new Date("2025-07-30"),
    descricao: "Sistema de gestão completo",
    numeroFatura: "FAT-2025-003"
  },
  {
    id: "fat004",
    valor: 650.75,
    status: "pago",
    cliente: "Ana Costa Digital",
    email: "contato@anacosta.digital",
    dataVencimento: new Date("2025-08-10"),
    dataPagamento: new Date("2025-08-09"),
    descricao: "Consultoria em automação",
    numeroFatura: "FAT-2025-004",
    metodoPagamento: "cartao"
  },
  {
    id: "fat005",
    valor: 3200.00,
    status: "pendente",
    cliente: "Carlos Mendes Corp",
    email: "carlos@mendescorp.com",
    dataVencimento: new Date("2025-08-25"),
    descricao: "Desenvolvimento de fluxos personalizados",
    numeroFatura: "FAT-2025-005"
  }
]

const statusMap = {
  pendente: { label: "Pendente", color: "bg-yellow-100 text-yellow-800" },
  pago: { label: "Pago", color: "bg-green-100 text-green-800" },
  vencido: { label: "Vencido", color: "bg-red-100 text-red-800" },
  cancelado: { label: "Cancelado", color: "bg-gray-100 text-gray-800" }
}

export const columns: ColumnDef<Cobranca>[] = [
  {
    id: "select",
    header: ({ table }) => (
      <Checkbox
        checked={
          table.getIsAllPageRowsSelected() ||
          (table.getIsSomePageRowsSelected() && "indeterminate")
        }
        onCheckedChange={(value) => table.toggleAllPageRowsSelected(!!value)}
        aria-label="Selecionar todos"
      />
    ),
    cell: ({ row }) => (
      <Checkbox
        checked={row.getIsSelected()}
        onCheckedChange={(value) => row.toggleSelected(!!value)}
        aria-label="Selecionar linha"
      />
    ),
    enableSorting: false,
    enableHiding: false,
  },
  {
    accessorKey: "numeroFatura",
    header: ({ column }) => {
      return (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
        >
          Nº Fatura
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      )
    },
    cell: ({ row }) => (
      <div className="font-medium">{row.getValue("numeroFatura")}</div>
    ),
  },
  {
    accessorKey: "cliente",
    header: ({ column }) => {
      return (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
        >
          Cliente
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      )
    },
    cell: ({ row }) => (
      <div>
        <div className="font-medium">{row.getValue("cliente")}</div>
        <div className="text-sm text-muted-foreground">{row.original.email}</div>
      </div>
    ),
  },
  {
    accessorKey: "valor",
    header: ({ column }) => {
      return (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
        >
          Valor
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      )
    },
    cell: ({ row }) => {
      const valor = parseFloat(row.getValue("valor"))
      const formatted = new Intl.NumberFormat("pt-BR", {
        style: "currency",
        currency: "BRL",
      }).format(valor)
      return <div className="font-medium">{formatted}</div>
    },
  },
  {
    accessorKey: "status",
    header: "Status",
    cell: ({ row }) => {
      const status = row.getValue("status") as keyof typeof statusMap
      const statusInfo = statusMap[status]
      return (
        <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${statusInfo.color}`}>
          {statusInfo.label}
        </span>
      )
    },
  },
  {
    accessorKey: "dataVencimento",
    header: ({ column }) => {
      return (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
        >
          Vencimento
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      )
    },
    cell: ({ row }) => {
      const date = row.getValue("dataVencimento") as Date
      return <div>{date.toLocaleDateString("pt-BR")}</div>
    },
  },
  {
    accessorKey: "descricao",
    header: "Descrição",
    cell: ({ row }) => (
      <div className="max-w-[200px] truncate">{row.getValue("descricao")}</div>
    ),
  },
  {
    id: "actions",
    enableHiding: false,
    cell: ({ row }) => {
      const cobranca = row.original

      return (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" className="h-8 w-8 p-0">
              <span className="sr-only">Abrir menu</span>
              <MoreHorizontal className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuLabel>Ações</DropdownMenuLabel>
            <DropdownMenuItem
              onClick={() => navigator.clipboard.writeText(cobranca.id)}
            >
              Copiar ID da fatura
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem>Ver detalhes</DropdownMenuItem>
            <DropdownMenuItem>Enviar cobrança</DropdownMenuItem>
            <DropdownMenuItem>Marcar como pago</DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      )
    },
  },
]

export function DataTableCobranca() {
  const [showModal, setShowModal] = React.useState(false)
  const [showViewDropdown, setShowViewDropdown] = React.useState(false)

  // Prevent background scroll when modal is open
  React.useEffect(() => {
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
          <div className="relative">
            <button 
              onClick={() => setShowViewDropdown(!showViewDropdown)}
              className="inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50 border border-input bg-background shadow-sm hover:bg-accent hover:text-accent-foreground h-9 px-4 py-2"
            >
              <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                <line x1="3" y1="8" x2="13" y2="8" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
                <circle cx="6" cy="8" r="2" fill="white" stroke="currentColor" strokeWidth="1.5"/>
                <circle cx="10" cy="8" r="2" fill="white" stroke="currentColor" strokeWidth="1.5"/>
              </svg>
              Filtro
            </button>
            {showViewDropdown && (
              <div className="absolute top-full right-0 mt-2 bg-popover border border-border rounded-lg p-2 w-64 shadow-lg z-10">
                <div className="text-sm font-semibold text-foreground p-2 mb-2">Toggle columns</div>
                {['NumeroFatura', 'Cliente', 'Valor', 'Status', 'DataVencimento', 'Descricao'].map((column) => (
                  <div key={column} className="flex items-center gap-3 p-2 rounded hover:bg-accent hover:text-accent-foreground cursor-pointer">
                    <div className="w-4 h-4 border-2 border-primary rounded bg-primary flex items-center justify-center">
                      <span className="text-primary-foreground text-xs">✓</span>
                    </div>
                    <span className="text-sm text-foreground">{column}</span>
                  </div>
                ))}
              </div>
            )}
          </div>
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
              <th className="text-left p-3 text-sm font-medium text-muted-foreground">Nº Fatura</th>
              <th className="text-left p-3 text-sm font-medium text-muted-foreground">Cliente ↓</th>
              <th className="text-left p-3 text-sm font-medium text-muted-foreground">Valor</th>
              <th className="text-left p-3 text-sm font-medium text-muted-foreground">Status</th>
              <th className="text-left p-3 text-sm font-medium text-muted-foreground">Vencimento</th>
              <th className="text-left p-3 text-sm font-medium text-muted-foreground">Descrição</th>
              <th className="text-left p-3 text-sm font-medium text-muted-foreground"></th>
            </tr>
          </thead>
          <tbody>
            {dataCobranca.map((item, index) => (
              <tr key={index} className="border-b border-border hover:bg-muted/50 transition-colors">
                <td className="p-4">
                  <input type="checkbox" className="w-4 h-4 border border-input rounded cursor-pointer"/>
                </td>
                <td className="p-4">
                  <span className="text-sm font-medium text-foreground">{item.numeroFatura}</span>
                </td>
                <td className="p-4">
                  <div>
                    <div className="text-sm font-medium text-foreground">{item.cliente}</div>
                    <div className="text-sm text-muted-foreground">{item.email}</div>
                  </div>
                </td>
                <td className="p-4">
                  <span className="text-sm font-medium text-foreground">
                    {new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(item.valor)}
                  </span>
                </td>
                <td className="p-4">
                  <span className={`inline-block px-2 py-1 rounded text-xs font-medium ${
                    item.status === 'pago' ? 'bg-green-100 text-green-800' :
                    item.status === 'pendente' ? 'bg-yellow-100 text-yellow-800' :
                    item.status === 'vencido' ? 'bg-red-100 text-red-800' :
                    item.status === 'cancelado' ? 'bg-gray-100 text-gray-600' : ''
                  }`}>
                    {statusMap[item.status].label}
                  </span>
                </td>
                <td className="p-4 text-sm text-foreground">{item.dataVencimento.toLocaleDateString("pt-BR")}</td>
                <td className="p-4 text-sm text-foreground max-w-[200px] truncate">{item.descricao}</td>
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


      {/* Click outside to close dropdown */}
      {showViewDropdown && (
        <div 
          className="fixed inset-0 z-0" 
          onClick={() => setShowViewDropdown(false)}
        />
      )}
    </div>
  )
}