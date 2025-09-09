"use client"

import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Calendar, TrendingUp } from 'lucide-react'

interface FlowExecutionData {
  month: string
  executions: number
  flowName: string
}

interface FlowExecutionChartProps {
  data: FlowExecutionData[]
  title?: string
  description?: string
}

// Dados mockados para fallback - será substituído por dados reais
const defaultFlowExecutionData = [
  { month: 'Jan', executions: 145, flowName: 'Fluxo de Conversa' },
  { month: 'Fev', executions: 203, flowName: 'Fluxo de Conversa' },
  { month: 'Mar', executions: 187, flowName: 'Fluxo de Conversa' },
  { month: 'Abr', executions: 234, flowName: 'Fluxo de Conversa' },
  { month: 'Mai', executions: 298, flowName: 'Fluxo de Conversa' },
  { month: 'Jun', executions: 312, flowName: 'Fluxo de Conversa' },
  { month: 'Jul', executions: 289, flowName: 'Fluxo de Conversa' },
  { month: 'Ago', executions: 156, flowName: 'Fluxo de Conversa' },
  { month: 'Set', executions: 198, flowName: 'Fluxo de Conversa' },
  { month: 'Out', executions: 267, flowName: 'Fluxo de Conversa' },
  { month: 'Nov', executions: 321, flowName: 'Fluxo de Conversa' },
  { month: 'Dez', executions: 378, flowName: 'Fluxo de Conversa' },
]

export function FlowExecutionChart({ 
  data = defaultFlowExecutionData, 
  title = "Execuções de Fluxo por Mês",
  description = "Visualização do número de execuções de fluxos ao longo dos meses"
}: FlowExecutionChartProps) {
  
  const totalExecutions = data.reduce((sum, item) => sum + item.executions, 0)
  const averageExecutions = Math.round(totalExecutions / data.length)
  const maxExecutions = Math.max(...data.map(item => item.executions))
  
  return (
    <Card className="w-full overflow-hidden">
      <CardHeader className="bg-gradient-to-r from-purple-50 to-blue-50">
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="text-xl flex items-center gap-2">
              <TrendingUp className="h-5 w-5 text-purple-600" />
              {title}
            </CardTitle>
            <CardDescription>{description}</CardDescription>
          </div>
          <div className="flex items-center gap-4 text-sm">
            <div className="text-right">
              <div className="font-semibold text-purple-600">{totalExecutions}</div>
              <div className="text-muted-foreground">Total</div>
            </div>
            <div className="text-right">
              <div className="font-semibold text-blue-600">{averageExecutions}</div>
              <div className="text-muted-foreground">Média</div>
            </div>
          </div>
        </div>
      </CardHeader>
      <CardContent className="pt-6">
        <div className="h-[350px] w-full">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart
              data={data}
              margin={{
                top: 20,
                right: 30,
                left: 20,
                bottom: 5,
              }}
              barCategoryGap="20%"
            >
              <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
              <XAxis 
                dataKey="month" 
                stroke="#64748b"
                fontSize={12}
                tickLine={false}
                axisLine={false}
              />
              <YAxis 
                stroke="#64748b"
                fontSize={12}
                tickLine={false}
                axisLine={false}
                tickFormatter={(value) => `${value}`}
              />
              <Tooltip
                contentStyle={{
                  backgroundColor: 'rgba(255, 255, 255, 0.95)',
                  border: '1px solid #e2e8f0',
                  borderRadius: '8px',
                  boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
                }}
                labelStyle={{ color: '#1e293b', fontWeight: '600' }}
                formatter={(value: number) => [
                  `${value} execuções`,
                  'Execuções'
                ]}
              />
              <Bar 
                dataKey="executions" 
                fill="url(#colorGradient)"
                radius={[4, 4, 0, 0]}
                animationDuration={1000}
              />
              <defs>
                <linearGradient id="colorGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#8b5cf6" stopOpacity={0.8}/>
                  <stop offset="100%" stopColor="#3b82f6" stopOpacity={0.6}/>
                </linearGradient>
              </defs>
            </BarChart>
          </ResponsiveContainer>
        </div>
        
        {/* Resumo de estatísticas */}
        <div className="mt-6 grid grid-cols-1 md:grid-cols-3 gap-4 pt-4 border-t">
          <div className="flex items-center gap-3">
            <Calendar className="h-5 w-5 text-purple-500" />
            <div>
              <div className="font-semibold text-sm">Período</div>
              <div className="text-sm text-muted-foreground">
                {data.length} meses
              </div>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <TrendingUp className="h-5 w-5 text-blue-500" />
            <div>
              <div className="font-semibold text-sm">Pico</div>
              <div className="text-sm text-muted-foreground">
                {maxExecutions} execuções
              </div>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <div className="h-5 w-5 rounded bg-gradient-to-r from-purple-500 to-blue-500" />
            <div>
              <div className="font-semibold text-sm">Tendência</div>
              <div className="text-sm text-muted-foreground">
                {data[data.length - 1]?.executions > data[data.length - 2]?.executions ? 'Crescente' : 'Decrescente'}
              </div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}