'use client';

import React, { useState, useEffect } from 'react';
import {
  AreaChart,
  Area,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from 'recharts';

export interface TimelinePoint {
  date: string;
  day_label: string;
  hours_yield: number;
  fuel_litres: number;
  log_count: number;
}

export interface MachineBreakdownItem {
  machine_name: string;
  category: string;
  total_hours: number;
  total_fuel_litres: number;
  shift_count: number;
  avg_burn_rate: number;
}

export interface VerificationStatItem {
  name: string;
  value: number;
  color: string;
}

interface TimelineChartProps {
  data: TimelinePoint[];
}

export function StaffYieldTimelineAreaChart({ data }: TimelineChartProps) {
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);

  if (!mounted) {
    return <div className="w-full h-72 bg-surface/50 rounded-xl animate-pulse" />;
  }

  const chartData = data && data.length > 0 ? data : [
    { date: '2026-10-01', day_label: 'Oct 01', hours_yield: 6.5, fuel_litres: 45.0, log_count: 1 },
    { date: '2026-10-02', day_label: 'Oct 02', hours_yield: 7.0, fuel_litres: 50.0, log_count: 1 },
    { date: '2026-10-03', day_label: 'Oct 03', hours_yield: 8.5, fuel_litres: 60.0, log_count: 1 },
    { date: '2026-10-04', day_label: 'Oct 04', hours_yield: 6.0, fuel_litres: 42.0, log_count: 1 },
    { date: '2026-10-05', day_label: 'Oct 05', hours_yield: 7.5, fuel_litres: 55.4, log_count: 1 },
  ];

  return (
    <div className="w-full h-72 sm:h-80">
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
          <defs>
            <linearGradient id="staffColorHours" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#D95400" stopOpacity={0.45} />
              <stop offset="95%" stopColor="#D95400" stopOpacity={0.02} />
            </linearGradient>
            <linearGradient id="staffColorFuel" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#EAB308" stopOpacity={0.45} />
              <stop offset="95%" stopColor="#EAB308" stopOpacity={0.02} />
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" stroke="#E4E4E7" vertical={false} />
          <XAxis 
            dataKey="day_label" 
            stroke="#71717A" 
            fontSize={11} 
            tickLine={false}
            dy={8}
          />
          <YAxis 
            stroke="#71717A" 
            fontSize={11} 
            tickLine={false} 
          />
          <Tooltip
            contentStyle={{
              backgroundColor: '#18181B',
              borderColor: '#D95400',
              borderRadius: '12px',
              color: '#FFFFFF',
              fontSize: '12px',
              boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.3)',
              padding: '10px 14px',
            }}
            itemStyle={{ color: '#F4F4F5' }}
            formatter={(value: any, name: any) => {
              if (name === 'Engine Hours (hrs)') return [`${value} hrs`, name];
              if (name === 'Fuel Logged (L)') return [`${value} Litres`, name];
              return [value, name];
            }}
          />
          <Legend 
            verticalAlign="top"
            height={36}
            wrapperStyle={{ fontSize: '12px', paddingBottom: '8px' }} 
          />
          <Area
            type="monotone"
            dataKey="hours_yield"
            name="Engine Hours (hrs)"
            stroke="#D95400"
            strokeWidth={2.5}
            fillOpacity={1}
            fill="url(#staffColorHours)"
          />
          <Area
            type="monotone"
            dataKey="fuel_litres"
            name="Fuel Logged (L)"
            stroke="#EAB308"
            strokeWidth={2}
            fillOpacity={1}
            fill="url(#staffColorFuel)"
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}

interface MachineBarChartProps {
  data: MachineBreakdownItem[];
}

export function StaffEquipmentHoursBarChart({ data }: MachineBarChartProps) {
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);

  if (!mounted) {
    return <div className="w-full h-72 bg-surface/50 rounded-xl animate-pulse" />;
  }

  const chartData = data && data.length > 0 ? data.slice(0, 5) : [
    { machine_name: 'Komatsu PC-200 Heavy Excavator', total_hours: 24.5, total_fuel_litres: 180, avg_burn_rate: 7.3 },
    { machine_name: 'Isuzu FVZ 34 Heavy Tipper', total_hours: 14.0, total_fuel_litres: 150, avg_burn_rate: 10.7 },
  ];

  return (
    <div className="w-full h-72 sm:h-80">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart 
          data={chartData} 
          margin={{ top: 10, right: 10, left: -20, bottom: 25 }}
        >
          <CartesianGrid strokeDasharray="3 3" stroke="#E4E4E7" vertical={false} />
          <XAxis 
            dataKey="machine_name" 
            stroke="#71717A" 
            fontSize={10} 
            tickLine={false}
            tickFormatter={(val) => {
              if (val.length > 18) return val.slice(0, 16) + '…';
              return val;
            }}
            dy={8}
          />
          <YAxis 
            stroke="#71717A" 
            fontSize={11} 
            tickLine={false} 
          />
          <Tooltip
            contentStyle={{
              backgroundColor: '#18181B',
              borderColor: '#D95400',
              borderRadius: '12px',
              color: '#FFFFFF',
              fontSize: '12px',
              boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.3)',
              padding: '10px 14px',
            }}
            itemStyle={{ color: '#F4F4F5' }}
            formatter={(value: any, name: any) => [`${value} hrs`, 'Total Hours Logged']}
            labelFormatter={(label) => `Machine: ${label}`}
          />
          <Bar 
            dataKey="total_hours" 
            name="Operating Hours" 
            fill="#D95400" 
            radius={[6, 6, 0, 0]} 
          />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}

interface VerificationDonutProps {
  data: VerificationStatItem[];
}

export function StaffVerificationDonutChart({ data }: VerificationDonutProps) {
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);

  if (!mounted) {
    return <div className="w-full h-64 bg-surface/50 rounded-xl animate-pulse" />;
  }

  const validData = data && data.length > 0 && data.some(d => d.value > 0)
    ? data
    : [
        { name: 'Approved', value: 4, color: '#10B981' },
        { name: 'Pending Review', value: 1, color: '#F59E0B' },
      ];

  const total = validData.reduce((acc, d) => acc + d.value, 0);

  return (
    <div className="w-full h-64 flex flex-col items-center justify-center relative">
      <ResponsiveContainer width="100%" height="100%">
        <PieChart>
          <Pie
            data={validData}
            cx="50%"
            cy="50%"
            innerRadius={55}
            outerRadius={80}
            paddingAngle={4}
            dataKey="value"
          >
            {validData.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={entry.color} />
            ))}
          </Pie>
          <Tooltip
            contentStyle={{
              backgroundColor: '#18181B',
              borderColor: '#10B981',
              borderRadius: '10px',
              color: '#FFFFFF',
              fontSize: '12px',
            }}
            itemStyle={{ color: '#F4F4F5' }}
            formatter={(value: any, name: any) => [`${value} shifts (${total > 0 ? Math.round((Number(value) / total) * 100) : 0}%)`, name]}
          />
          <Legend 
            verticalAlign="bottom" 
            wrapperStyle={{ fontSize: '11px', paddingTop: '10px' }} 
          />
        </PieChart>
      </ResponsiveContainer>
      
      {/* Center Label */}
      <div className="absolute top-[42%] left-1/2 -translate-x-1/2 -translate-y-1/2 text-center pointer-events-none">
        <span className="text-xl font-heading font-black text-ink">{total}</span>
        <span className="block text-[9px] font-mono uppercase text-muted tracking-wider">Shifts</span>
      </div>
    </div>
  );
}
