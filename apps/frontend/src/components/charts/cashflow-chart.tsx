'use client';

import React, { useState } from 'react';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger } from '@/components/ui/select';
import { TrendingUp } from 'lucide-react';
import { Area, CartesianGrid, ComposedChart, Line, XAxis, YAxis, ResponsiveContainer, Tooltip } from 'recharts';

// Static executions data for last 6 months (to avoid hydration issues)
const executionsData = [
  { month: 'FEV', value: 189 }, // Feb 2025
  { month: 'MAR', value: 234 }, // Mar 2025  
  { month: 'ABR', value: 278 }, // Apr 2025
  { month: 'MAI', value: 298 }, // May 2025
  { month: 'JUN', value: 267 }, // Jun 2025
  { month: 'JUL', value: 312 }, // Jul 2025
  { month: 'AGO', value: 289 }, // Aug 2025 (current)
];

// Chart color configuration
const chartColor = '#8b5cf6'; // violet-500

// Helper function for consistent number formatting
const formatExecutions = (value: number): string => {
  return value.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ',');
};

// Custom Tooltip Component
const CustomTooltip = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    const value = payload[0].value;
    const change = payload.length > 1 ? payload[1] : null;
    
    return (
      <div className="rounded-lg bg-white dark:bg-zinc-900 border border-border p-4 shadow-xl backdrop-blur-sm">
        <div className="text-xs font-medium text-muted-foreground uppercase tracking-wide mb-2">
          {label} 2025
        </div>
        <div className="flex items-center gap-2">
          <div className="text-lg font-bold text-foreground">
            {formatExecutions(value)}
          </div>
          <div className="text-sm text-muted-foreground">
            execuções
          </div>
        </div>
        <div className="mt-2 pt-2 border-t border-border/50">
          <div className="text-xs text-muted-foreground">
            Total no período: {formatExecutions(value)}
          </div>
        </div>
      </div>
    );
  }
  return null;
};

// Static date ranges to avoid hydration mismatch
const getDateRange = (months: number): string => {
  // Using static dates to ensure server/client consistency
  const ranges = {
    6: '26 Fev 2025 - 26 Ago 2025',  // 6 months
    3: '26 Mai 2025 - 26 Ago 2025',  // 3 months  
    2: '26 Jun 2025 - 26 Ago 2025'   // 2 months
  };
  
  return ranges[months as keyof typeof ranges] || ranges[6];
};

// Period configuration
const PERIODS = {
  '6m': {
    key: '6m',
    label: '6 meses',
    dateRange: getDateRange(6),
  },
  '3m': {
    key: '3m',
    label: '3 meses', 
    dateRange: getDateRange(3),
  },
  '2m': {
    key: '2m',
    label: '2 meses',
    dateRange: getDateRange(2),
  },
} as const;

export type PeriodKey = keyof typeof PERIODS;

export { PERIODS };

interface CashflowChartProps {
  selectedPeriod: PeriodKey;
  onPeriodChange: (period: PeriodKey) => void;
}

export default function CashflowChart({ selectedPeriod, onPeriodChange }: CashflowChartProps) {
  const [isHovering, setIsHovering] = useState(false);

  // Filter data based on selected period
  const getFilteredData = () => {
    switch (selectedPeriod) {
      case '6m':
        return executionsData.slice(-6);
      case '3m':
        return executionsData.slice(-3);
      case '2m':
        return executionsData.slice(-2);
      default:
        return executionsData.slice(-6);
    }
  };

  const filteredData = getFilteredData();

  // Get current period configuration
  const currentPeriod = PERIODS[selectedPeriod];

  // Calculate total and percentage based on filtered data
  const totalExecutions = filteredData.reduce((sum, item) => sum + item.value, 0);
  const lastValue = filteredData[filteredData.length - 1]?.value || 0;
  const previousValue = filteredData[filteredData.length - 2]?.value || 0;
  const percentageChange = previousValue > 0 ? ((lastValue - previousValue) / previousValue) * 100 : 0;

  return (
    <Card className="w-full">
      <CardHeader className="border-0 min-h-auto pt-6 pb-4 flex flex-row items-center justify-between">
        <CardTitle className="text-lg font-semibold">Execuções</CardTitle>
        <Select value={selectedPeriod} onValueChange={(value) => onPeriodChange(value as PeriodKey)}>
          <SelectTrigger className="w-[100px]">
            {currentPeriod.label}
          </SelectTrigger>
          <SelectContent>
            {Object.values(PERIODS).map((period) => (
              <SelectItem key={period.key} value={period.key}>
                {period.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </CardHeader>

      <CardContent className="px-0">
        {/* Stats Section */}
        <div className="px-5 mb-8">
          <div className="text-xs font-medium text-muted-foreground tracking-wide mb-2">
            {currentPeriod.dateRange}
          </div>
          <div className="flex items-center gap-3 mb-4">
            <div className="text-3xl font-bold">{formatExecutions(totalExecutions)}</div>
            <Badge variant="secondary" className="bg-green-100 text-green-800 hover:bg-green-200">
              <TrendingUp className="size-3" />
              {Math.abs(percentageChange).toFixed(2)}%
            </Badge>
          </div>
        </div>

        {/* Chart */}
        <div 
          className="h-[300px] w-full px-5 transition-all duration-200"
          onMouseEnter={() => setIsHovering(true)}
          onMouseLeave={() => setIsHovering(false)}
        >
          <ResponsiveContainer width="100%" height="100%">
            <ComposedChart
              data={filteredData}
              margin={{
                top: 25,
                right: 25,
                left: 20,
                bottom: 25,
              }}
              onMouseEnter={() => setIsHovering(true)}
              onMouseLeave={() => setIsHovering(false)}
            >
              {/* Gradient */}
              <defs>
                <linearGradient id="cashflowGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor={chartColor} stopOpacity={isHovering ? 0.25 : 0.15} />
                  <stop offset="100%" stopColor={chartColor} stopOpacity={0} />
                </linearGradient>
              </defs>

              <CartesianGrid
                strokeDasharray="4 12"
                stroke="#e2e8f0"
                strokeOpacity={1}
                horizontal={true}
                vertical={false}
              />

              <XAxis
                dataKey="month"
                axisLine={false}
                tickLine={false}
                tick={{ fontSize: 12 }}
                tickMargin={12}
                stroke="#64748b"
              />

              <YAxis
                axisLine={false}
                tickLine={false}
                tick={{ fontSize: 12 }}
                tickFormatter={(value) => `${value}`}
                domain={[0, 'dataMax + 50']}
                tickCount={6}
                tickMargin={12}
                stroke="#64748b"
              />

              <Tooltip
                content={<CustomTooltip />}
                cursor={{
                  stroke: chartColor,
                  strokeWidth: 2,
                  strokeDasharray: '5,5',
                  strokeOpacity: 0.8,
                }}
                animationDuration={200}
                wrapperStyle={{ outline: 'none' }}
                position={{ y: -10 }}
              />

              {/* Gradient area */}
              <Area
                type="monotone"
                dataKey="value"
                stroke="transparent"
                fill="url(#cashflowGradient)"
                strokeWidth={0}
                dot={false}
              />

              {/* Main executions line */}
              <Line
                type="monotone"
                dataKey="value"
                stroke={chartColor}
                strokeWidth={3}
                dot={false}
                activeDot={{
                  r: 8,
                  fill: chartColor,
                  stroke: 'white',
                  strokeWidth: 3,
                  style: {
                    filter: 'drop-shadow(0 4px 8px rgba(139, 92, 246, 0.4))',
                    cursor: 'pointer',
                    transition: 'all 0.2s ease-in-out',
                  },
                }}
                connectNulls={false}
                animationDuration={1200}
                animationEasing="ease-out"
              />
            </ComposedChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
}