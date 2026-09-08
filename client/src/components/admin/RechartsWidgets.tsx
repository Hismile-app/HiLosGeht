'use client';

import React from 'react';
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

interface FinancialTimelineProps {
  data: Array<{
    day_label: string;
    hours_yield: number;
    fuel_litres: number;
    fuel_cost_kes: number;
  }>;
}

export function FuelAndHoursAreaChart({ data }: FinancialTimelineProps) {
  const chartData = data && data.length > 0 ? data : [
    { day_label: 'Mon', hours_yield: 24.5, fuel_litres: 340, fuel_cost_kes: 61200 },
    { day_label: 'Tue', hours_yield: 31.0, fuel_litres: 420, fuel_cost_kes: 75600 },
    { day_label: 'Wed', hours_yield: 28.5, fuel_litres: 390, fuel_cost_kes: 70200 },
    { day_label: 'Thu', hours_yield: 35.0, fuel_litres: 480, fuel_cost_kes: 86400 },
    { day_label: 'Fri', hours_yield: 42.0, fuel_litres: 560, fuel_cost_kes: 100800 },
    { day_label: 'Sat', hours_yield: 38.0, fuel_litres: 510, fuel_cost_kes: 91800 },
    { day_label: 'Sun', hours_yield: 18.0, fuel_litres: 220, fuel_cost_kes: 39600 },
  ];

  return (
    <div className="w-full h-72">
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
          <defs>
            <linearGradient id="colorHours" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#F37021" stopOpacity={0.8}/>
              <stop offset="95%" stopColor="#F37021" stopOpacity={0}/>
            </linearGradient>
            <linearGradient id="colorFuel" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#FFB800" stopOpacity={0.8}/>
              <stop offset="95%" stopColor="#FFB800" stopOpacity={0}/>
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" stroke="#262626" />
          <XAxis dataKey="day_label" stroke="#8A8A8A" fontSize={11} />
          <YAxis stroke="#8A8A8A" fontSize={11} />
          <Tooltip 
            contentStyle={{ backgroundColor: '#121212', borderColor: '#F37021', borderRadius: '8px', fontSize: '12px' }}
            itemStyle={{ color: '#FFFFFF' }}
          />
          <Legend wrapperStyle={{ fontSize: '11px' }} />
          <Area type="monotone" dataKey="hours_yield" name="Engine Hours (hrs)" stroke="#F37021" fillOpacity={1} fill="url(#colorHours)" />
          <Area type="monotone" dataKey="fuel_litres" name="Fuel Consumed (L)" stroke="#FFB800" fillOpacity={1} fill="url(#colorFuel)" />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}

interface MachineCostBarProps {
  data: Array<{
    machine_name: string;
    total_hours: number;
    total_fuel_litres: number;
    cost_per_hour_kes: number;
  }>;
}

export function MachineCostBarChart({ data }: MachineCostBarProps) {
  const chartData = data && data.length > 0 ? data.slice(0, 6) : [
    { machine_name: 'Komatsu PC-200', total_hours: 48, cost_per_hour_kes: 2450 },
    { machine_name: 'Komatsu D155AX-8', total_hours: 36, cost_per_hour_kes: 3800 },
    { machine_name: 'JCB 3DXPLUS', total_hours: 52, cost_per_hour_kes: 1650 },
    { machine_name: 'Shantui SL60W-2', total_hours: 41, cost_per_hour_kes: 2200 },
    { machine_name: 'Shantui SG18-3', total_hours: 39, cost_per_hour_kes: 2600 },
    { machine_name: 'Isuzu FVZ 34', total_hours: 64, cost_per_hour_kes: 1850 },
  ];

  return (
    <div className="w-full h-72">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={chartData} margin={{ top: 10, right: 10, left: -10, bottom: 25 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#262626" />
          <XAxis dataKey="machine_name" stroke="#8A8A8A" fontSize={9} angle={-15} textAnchor="end" />
          <YAxis stroke="#8A8A8A" fontSize={11} />
          <Tooltip 
            contentStyle={{ backgroundColor: '#121212', borderColor: '#F37021', borderRadius: '8px', fontSize: '12px' }}
            itemStyle={{ color: '#FFFFFF' }}
          />
          <Bar dataKey="cost_per_hour_kes" name="Cost per Hour (KES)" fill="#F37021" radius={[4, 4, 0, 0]} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}

export function FleetUtilizationDonut({
  available = 5,
  booked = 2,
  maintenance = 1
}: {
  available?: number;
  booked?: number;
  maintenance?: number;
}) {
  const data = [
    { name: 'Available for Hire', value: available, color: '#10B981' },
    { name: 'Active on Jobsite (Rented)', value: booked, color: '#F37021' },
    { name: 'Under Maintenance', value: maintenance, color: '#F43F5E' },
  ];

  return (
    <div className="w-full h-64 flex flex-col items-center justify-center">
      <ResponsiveContainer width="100%" height="100%">
        <PieChart>
          <Pie
            data={data}
            cx="50%"
            cy="50%"
            innerRadius={60}
            outerRadius={85}
            paddingAngle={4}
            dataKey="value"
          >
            {data.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={entry.color} />
            ))}
          </Pie>
          <Tooltip 
            contentStyle={{ backgroundColor: '#121212', borderColor: '#F37021', borderRadius: '8px', fontSize: '12px' }}
            itemStyle={{ color: '#FFFFFF' }}
          />
          <Legend wrapperStyle={{ fontSize: '11px' }} />
        </PieChart>
      </ResponsiveContainer>
    </div>
  );
}
