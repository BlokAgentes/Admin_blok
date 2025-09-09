import React from 'react';
import { TrendingUp } from 'lucide-react';

const RevenueWidget = ({ 
  title = "Total Revenue",
  value = "$15,231.89",
  trend = "+20.1% from last month",
  chartData = []
}) => {
  const generateLinePath = () => {
    const points = chartData.map((val, i) => ({
      x: (i / (chartData.length - 1)) * 100,
      y: 50 - (val / 100) * 40
    }));
    
    let path = `M ${points[0].x},${points[0].y}`;
    for (let i = 1; i < points.length; i++) {
      path += ` L ${points[i].x},${points[i].y}`;
    }
    return path;
  };

  const defaultData = [20, 45, 30, 50, 35, 60, 45, 70, 55, 80, 65, 85];

  return (
    <div className="bg-white rounded-lg p-6 shadow-sm border border-gray-100">
      <h3 className="text-sm font-medium text-gray-600 mb-2">{title}</h3>
      
      <div className="flex items-end justify-between mb-4">
        <div>
          <div className="text-3xl font-bold text-gray-900">{value}</div>
          <p className="text-sm text-gray-500 mt-1 flex items-center gap-1">
            <TrendingUp className="w-3 h-3 text-green-500" />
            {trend}
          </p>
        </div>
        
        <div className="w-32 h-16">
          <svg viewBox="0 0 100 50" className="w-full h-full">
            <path
              d={generateLinePath()}
              fill="none"
              stroke="#3b82f6"
              strokeWidth="2"
            />
            {(chartData.length > 0 ? chartData : defaultData).map((val, i) => (
              <circle
                key={i}
                cx={(i / ((chartData.length || defaultData.length) - 1)) * 100}
                cy={50 - (val / 100) * 40}
                r="2"
                fill="#3b82f6"
              />
            ))}
          </svg>
        </div>
      </div>
    </div>
  );
};

export default function RevenueWidgetDemo() {
  return (
    <div className="p-6 bg-gray-50">
      <RevenueWidget 
        chartData={[20, 45, 30, 50, 35, 60, 45, 70, 55, 80, 65, 85]}
      />
    </div>
  );
}