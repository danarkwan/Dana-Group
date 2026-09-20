'use client';

import React, { useState, useEffect } from 'react';
import { PieChart, Pie, Cell, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { formatCurrencyBoth } from '@/lib/formatters';
import { fetchExpenseCategoriesData } from '@/lib/actions/analytics';
import { useTranslations } from 'next-intl';

interface CategoryData {
  name: string;
  value: number;
}

interface ExpenseCategoryChartProps {
  initialData: CategoryData[];
  title: string;
}

const COLORS = ['#ef4444', '#f97316', '#f59e0b', '#84cc16', '#0ea5e9', '#6366f1', '#a855f7', '#ec4899'];

const CustomTooltip = ({ active, payload }: any) => {
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
        <p style={{ margin: '0 0 0.5rem 0', fontWeight: 600, color: '#374151' }}>{payload[0].name}</p>
        <p style={{ margin: 0, color: payload[0].payload.fill, fontWeight: 600, fontSize: '0.875rem' }}>
          <span dir="ltr">{formatCurrencyBoth(payload[0].value)}</span>
        </p>
      </div>
    );
  }
  return null;
};

export default function ExpenseCategoryChart({ initialData, title }: ExpenseCategoryChartProps) {
  const [data, setData] = useState<CategoryData[]>(initialData);
  const [period, setPeriod] = useState<'7d' | '30d' | '12m' | 'custom'>('30d');
  const [loading, setLoading] = useState(false);
  const t = useTranslations('Dashboard');

  useEffect(() => {
    if (period === '30d' && data === initialData) return;
    const loadData = async () => {
      setLoading(true);
      try {
        const newData = await fetchExpenseCategoriesData(period);
        setData(newData);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    loadData();
  }, [period, initialData]);

  const isEmpty = data.length === 0 || data.every(d => d.value === 0);

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
              <path d="M21.21 15.89A10 10 0 1 1 8 2.83M22 12A10 10 0 0 0 12 2v10z"/>
            </svg>
            <p style={{ margin: 0, fontSize: '0.95rem', fontWeight: 500 }}>هیچ خەرجییەک نییە لەم ماوەیەدا</p>
          </div>
        ) : (
          <ResponsiveContainer width="100%" height="100%">
            <PieChart margin={{ top: 0, right: 0, bottom: 0, left: 0 }}>
              <Pie
                data={data}
                cx="50%"
                cy="50%"
                innerRadius={70}
                outerRadius={100}
                paddingAngle={5}
                dataKey="value"
                stroke="none"
              >
                {data.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip content={<CustomTooltip />} />
              <Legend 
                layout="horizontal" 
                verticalAlign="bottom" 
                align="center"
                wrapperStyle={{ paddingTop: '20px', fontFamily: 'inherit', fontSize: '0.875rem' }}
              />
            </PieChart>
          </ResponsiveContainer>
        )}
      </div>
    </div>
  );
}
