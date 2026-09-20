'use client';

import React, { useState, useEffect } from 'react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { formatCurrencyBoth } from '@/lib/formatters';
import { fetchRevenueChartData } from '@/lib/actions/analytics';
import { useTranslations } from 'next-intl';

interface ChartData {
  name: string;
  income: number;
  expenses: number;
  netProfit: number;
}

interface RevenueChartProps {
  initialData: ChartData[];
  title: string;
}

const CustomTooltip = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    return (
      <div style={{
        backgroundColor: 'rgba(255, 255, 255, 0.9)',
        backdropFilter: 'blur(8px)',
        border: '1px solid rgba(229, 231, 235, 0.5)',
        borderRadius: '12px',
        padding: '1rem',
        boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)',
        direction: 'rtl'
      }}>
        <p style={{ margin: '0 0 0.5rem 0', fontWeight: 600, color: '#374151' }}>{label}</p>
        <p style={{ margin: 0, color: '#10b981', fontWeight: 500, fontSize: '0.875rem', display: 'flex', justifyContent: 'space-between', gap: '1rem' }}>
          <span>داهات:</span> <span dir="ltr">{formatCurrencyBoth(payload.find((p:any) => p.dataKey === 'income')?.value || 0)}</span>
        </p>
        <p style={{ margin: '0.25rem 0 0 0', color: '#ef4444', fontWeight: 500, fontSize: '0.875rem', display: 'flex', justifyContent: 'space-between', gap: '1rem' }}>
          <span>خەرجی:</span> <span dir="ltr">{formatCurrencyBoth(payload.find((p:any) => p.dataKey === 'expenses')?.value || 0)}</span>
        </p>
        <div style={{ margin: '0.5rem 0', height: '1px', backgroundColor: '#e5e7eb' }}></div>
        <p style={{ margin: 0, color: '#3b82f6', fontWeight: 600, fontSize: '0.875rem', display: 'flex', justifyContent: 'space-between', gap: '1rem' }}>
          <span>قازانج:</span> <span dir="ltr">{formatCurrencyBoth(payload.find((p:any) => p.dataKey === 'netProfit')?.value || 0)}</span>
        </p>
      </div>
    );
  }
  return null;
};

export default function RevenueChart({ initialData, title }: RevenueChartProps) {
  const [data, setData] = useState<ChartData[]>(initialData);
  const [period, setPeriod] = useState<'7d' | '30d' | '12m' | 'custom'>('30d');
  const [loading, setLoading] = useState(false);
  const t = useTranslations('Dashboard');

  useEffect(() => {
    if (period === '30d' && data === initialData) return; // Skip initial fetch
    const loadData = async () => {
      setLoading(true);
      try {
        const newData = await fetchRevenueChartData(period);
        setData(newData);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    loadData();
  }, [period, initialData]);

  const isEmpty = data.length === 0 || data.every(d => d.income === 0 && d.expenses === 0 && d.netProfit === 0);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%', width: '100%' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
        <h3 style={{ fontSize: '1.25rem', fontWeight: 600, margin: 0, color: 'var(--color-text)' }}>{title}</h3>
        <div style={{ display: 'flex', gap: '0.5rem', backgroundColor: 'var(--color-background)', padding: '0.25rem', borderRadius: '8px' }}>
          <button 
            onClick={() => setPeriod('7d')}
            style={{ padding: '0.4rem 0.75rem', fontSize: '0.75rem', fontWeight: 600, border: 'none', borderRadius: '6px', cursor: 'pointer', backgroundColor: period === '7d' ? 'var(--color-surface)' : 'transparent', color: period === '7d' ? 'var(--color-primary)' : 'var(--color-text-secondary)', boxShadow: period === '7d' ? '0 1px 3px rgba(0,0,0,0.1)' : 'none', transition: 'all 0.2s' }}
          >
            7 ڕۆژ
          </button>
          <button 
            onClick={() => setPeriod('30d')}
            style={{ padding: '0.4rem 0.75rem', fontSize: '0.75rem', fontWeight: 600, border: 'none', borderRadius: '6px', cursor: 'pointer', backgroundColor: period === '30d' ? 'var(--color-surface)' : 'transparent', color: period === '30d' ? 'var(--color-primary)' : 'var(--color-text-secondary)', boxShadow: period === '30d' ? '0 1px 3px rgba(0,0,0,0.1)' : 'none', transition: 'all 0.2s' }}
          >
            30 ڕۆژ
          </button>
          <button 
            onClick={() => setPeriod('12m')}
            style={{ padding: '0.4rem 0.75rem', fontSize: '0.75rem', fontWeight: 600, border: 'none', borderRadius: '6px', cursor: 'pointer', backgroundColor: period === '12m' ? 'var(--color-surface)' : 'transparent', color: period === '12m' ? 'var(--color-primary)' : 'var(--color-text-secondary)', boxShadow: period === '12m' ? '0 1px 3px rgba(0,0,0,0.1)' : 'none', transition: 'all 0.2s' }}
          >
            12 مانگ
          </button>
        </div>
      </div>
      
      <div style={{ flex: 1, minHeight: '300px', position: 'relative' }} dir="ltr">
        {loading && (
          <div style={{ position: 'absolute', inset: 0, backgroundColor: 'rgba(255,255,255,0.5)', zIndex: 10, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <div style={{ width: '24px', height: '24px', borderRadius: '50%', border: '2px solid var(--color-primary)', borderTopColor: 'transparent', animation: 'spin 1s linear infinite' }} />
          </div>
        )}
        
        {isEmpty ? (
          <div style={{ height: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', color: 'var(--color-text-secondary)' }}>
            <svg width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1" strokeLinecap="round" strokeLinejoin="round" style={{ opacity: 0.2, marginBottom: '1rem' }}>
              <path d="M3 3v18h18"/><path d="M18 17V9"/><path d="M13 17V5"/><path d="M8 17v-3"/>
            </svg>
            <p style={{ margin: 0, fontSize: '0.95rem', fontWeight: 500 }}>هیچ داتایەک نییە بۆ ئەم ماوەیە</p>
          </div>
        ) : (
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart
              data={data}
              margin={{ top: 10, right: 10, left: 20, bottom: 0 }}
            >
              <defs>
                <linearGradient id="colorIncome" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#10b981" stopOpacity={0.6}/>
                  <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
                </linearGradient>
                <linearGradient id="colorExpense" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#ef4444" stopOpacity={0.6}/>
                  <stop offset="95%" stopColor="#ef4444" stopOpacity={0}/>
                </linearGradient>
                <linearGradient id="colorProfit" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.6}/>
                  <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/>
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e5e7eb" opacity={0.5} />
              <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fill: '#9ca3af', fontSize: 12, fontWeight: 500}} dy={10} />
              <YAxis 
                axisLine={false} 
                tickLine={false} 
                tick={{fill: '#9ca3af', fontSize: 12, fontWeight: 500}} 
                dx={-15} 
                tickFormatter={(value) => {
                  if (Math.abs(value) >= 1000000) return `${(value / 1000000).toFixed(1)}M`;
                  if (Math.abs(value) >= 1000) return `${(value / 1000).toFixed(0)}k`;
                  return value;
                }} 
              />
              <Tooltip content={<CustomTooltip />} />
              <Area type="monotone" dataKey="income" stroke="#10b981" strokeWidth={3} fillOpacity={1} fill="url(#colorIncome)" />
              <Area type="monotone" dataKey="expenses" stroke="#ef4444" strokeWidth={3} fillOpacity={1} fill="url(#colorExpense)" />
              <Area type="monotone" dataKey="netProfit" stroke="#3b82f6" strokeWidth={2} fillOpacity={1} fill="url(#colorProfit)" />
            </AreaChart>
          </ResponsiveContainer>
        )}
      </div>
    </div>
  );
}
