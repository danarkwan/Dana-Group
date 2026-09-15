import React from 'react';
import { ArrowDownLeft, ArrowUpRight } from 'lucide-react';
import { formatCurrencyBoth } from '@/lib/formatters';

interface Transaction {
  id: string;
  date: string;
  description: string;
  party: string;
  type: string;
  amount: number;
  status: string;
}

interface RecentTransactionsProps {
  transactions: Transaction[];
  title: string;
  viewAllText: string;
}

export default function RecentTransactions({ transactions, title, viewAllText }: RecentTransactionsProps) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
        <h3 style={{ fontSize: '1.25rem', fontWeight: 600 }}>{title}</h3>
        <button style={{ color: 'var(--color-primary)', fontSize: '0.875rem', fontWeight: 500, background: 'none', border: 'none', cursor: 'pointer' }}>
          {viewAllText}
        </button>
      </div>
      
      <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', flex: 1, overflowY: 'auto' }}>
        {transactions.map((t) => {
          const isIncome = t.type === 'INCOME';
          return (
            <div key={t.id} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0.5rem 0', borderBottom: '1px solid var(--color-border)' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                <div style={{ 
                  display: 'flex', alignItems: 'center', justifyContent: 'center', 
                  width: '40px', height: '40px', borderRadius: '50%',
                  backgroundColor: isIncome ? '#ecfdf5' : '#fef2f2',
                  color: isIncome ? '#10b981' : '#ef4444'
                }}>
                  {isIncome ? <ArrowDownLeft size={20} /> : <ArrowUpRight size={20} />}
                </div>
                <div>
                  <p style={{ fontWeight: 500, fontSize: '0.875rem', color: 'var(--color-text)' }}>{t.description}</p>
                  <p style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)' }}>{new Date(t.date).toLocaleDateString()}</p>
                </div>
              </div>
              <div style={{ textAlign: 'right' }}>
                <p style={{ fontWeight: 600, fontSize: '0.875rem', color: isIncome ? '#10b981' : 'var(--color-text)' }}>
                  {isIncome ? '+' : '-'}{formatCurrencyBoth(Math.abs(t.amount))}
                </p>
                <span style={{ 
                  fontSize: '0.7rem', padding: '0.125rem 0.375rem', borderRadius: '999px', 
                  backgroundColor: t.status === 'COMPLETED' ? '#dcfce7' : '#fef9c3',
                  color: t.status === 'COMPLETED' ? '#166534' : '#854d0e'
                }}>
                  {t.status}
                </span>
              </div>
            </div>
          );
        })}
        {transactions.length === 0 && (
          <div style={{ display: 'flex', flex: 1, alignItems: 'center', justifyContent: 'center', color: 'var(--color-text-muted)' }}>
            No recent transactions
          </div>
        )}
      </div>
    </div>
  );
}
