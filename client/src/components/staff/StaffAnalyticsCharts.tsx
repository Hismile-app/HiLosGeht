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

  if (!data || data.length === 0) {
    return (
      <div className="w-full h-72 sm:h-80 flex flex-col items-center justify-center border border-dashed border-border rounded-xl bg-surface/30 p-6 text-center">
        <div className="w-10 h-10 rounded-xl bg-orange-50 text-primary flex items-center justify-center mb-2.5">
          <span className="font-mono text-xs font-bold">0h</span>
        </div>
        <p className="text-xs font-bold text-ink">No Operating Shifts Logged Yet</p>
        <p className="text-[11px] text-muted max-w-xs mt-1">
          Your daily engine hours and diesel burn rate will plot on this chart once you submit your first shift log.
        </p>
      </div>
    );
  }

  const chartData = data;

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

  if (!data || data.length === 0) {
    return (
      <div className="w-full h-72 sm:h-80 flex flex-col items-center justify-center border border-dashed border-border rounded-xl bg-surface/30 p-6 text-center">
        <p className="text-xs font-bold text-ink">No Machinery Hours Recorded</p>
        <p className="text-[11px] text-muted max-w-xs mt-1">
          When you operate excavators, graders, dozers, or tippers and submit logs, your equipment hours will appear here.
        </p>
      </div>
    );
  }

  const chartData = data.slice(0, 5);

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

  const hasData = data && data.length > 0 && data.some(d => d.value > 0);

  if (!hasData) {
    return (
      <div className="w-full h-64 flex flex-col items-center justify-center border border-dashed border-border rounded-xl bg-surface/30 p-6 text-center">
        <p className="text-xs font-bold text-ink">No Vouchers In Review</p>
        <p className="text-[11px] text-muted max-w-xs mt-1">
          Supervisor sign-off status and approval ratios will populate here as your shift logs are verified.
        </p>
      </div>
    );
  }

  const validData = data;
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

