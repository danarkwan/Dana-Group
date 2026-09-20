'use client';

import { useState } from 'react';
import Link from 'next/link';
import { ArrowLeft, Phone, Mail, MapPin, FileText, CreditCard, DollarSign, Calendar } from 'lucide-react';
import { formatCurrencyBoth } from '@/lib/formatters';

type SupplierProfileData = {
  id: string;
  name: string;
  email: string | null;
  phone: string | null;
  address: string | null;
  totalPurchases: number;
  totalPayments: number;
  remainingDebt: number;
  purchases: any[];
  transactions: any[];
};

type Props = {
  supplier: SupplierProfileData;
  translations: Record<string, string>;
  locale: string;
};

export default function SupplierProfileClient({ supplier, translations, locale }: Props) {
  const [activeTab, setActiveTab] = useState<'purchases' | 'payments'>('purchases');

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--spacing-lg)' }}>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--spacing-md)' }}>
        <Link href={`/${locale}/suppliers`} className="btn btn-secondary" style={{ padding: '0.5rem' }}>
          <ArrowLeft size={20} />
        </Link>
        <h1 style={{ fontSize: '1.75rem', fontWeight: 'bold' }}>{supplier.name}</h1>
      </div>

      {/* Profile Info */}
      <div className="card" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 'var(--spacing-md)' }}>
        {supplier.phone && (
          <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--spacing-sm)', color: 'var(--color-text-muted)' }}>
            <Phone size={18} />
            <span>{supplier.phone}</span>
          </div>
        )}
        {supplier.email && (
          <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--spacing-sm)', color: 'var(--color-text-muted)' }}>
            <Mail size={18} />
            <span>{supplier.email}</span>
          </div>
        )}
        {supplier.address && (
          <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--spacing-sm)', color: 'var(--color-text-muted)' }}>
            <MapPin size={18} />
            <span>{supplier.address}</span>
          </div>
        )}
      </div>

      {/* Financial Summary */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: 'var(--spacing-lg)' }}>
        <div className="card" style={{ display: 'flex', alignItems: 'center', gap: 'var(--spacing-md)' }}>
          <div style={{ padding: 'var(--spacing-md)', backgroundColor: 'var(--color-surface-hover)', borderRadius: 'var(--radius-md)' }}>
            <FileText size={28} color="var(--color-primary)" />
          </div>
          <div>
            <p style={{ fontSize: '0.875rem', color: 'var(--color-text-muted)', fontWeight: 500 }}>{translations.totalPurchases}</p>
            <h3 style={{ fontSize: '1.5rem', fontWeight: 'bold' }}>{formatCurrencyBoth(supplier.totalPurchases)}</h3>
          </div>
        </div>

        <div className="card" style={{ display: 'flex', alignItems: 'center', gap: 'var(--spacing-md)' }}>
          <div style={{ padding: 'var(--spacing-md)', backgroundColor: 'var(--color-surface-hover)', borderRadius: 'var(--radius-md)' }}>
            <CreditCard size={28} color="var(--color-success)" />
          </div>
          <div>
            <p style={{ fontSize: '0.875rem', color: 'var(--color-text-muted)', fontWeight: 500 }}>{translations.totalPayments}</p>
            <h3 style={{ fontSize: '1.5rem', fontWeight: 'bold' }}>{formatCurrencyBoth(supplier.totalPayments)}</h3>
          </div>
        </div>

        <div className="card" style={{ display: 'flex', alignItems: 'center', gap: 'var(--spacing-md)' }}>
          <div style={{ padding: 'var(--spacing-md)', backgroundColor: 'var(--color-surface-hover)', borderRadius: 'var(--radius-md)' }}>
            <DollarSign size={28} color="var(--color-danger)" />
          </div>
          <div>
            <p style={{ fontSize: '0.875rem', color: 'var(--color-text-muted)', fontWeight: 500 }}>{translations.remainingDebt}</p>
            <h3 style={{ fontSize: '1.5rem', fontWeight: 'bold' }}>{formatCurrencyBoth(supplier.remainingDebt)}</h3>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
        <div style={{ display: 'flex', borderBottom: '1px solid var(--color-border)' }}>
          <button 
            onClick={() => setActiveTab('purchases')}
            style={{
              flex: 1, padding: '1rem', fontWeight: 600, background: 'none', border: 'none',
              borderBottom: activeTab === 'purchases' ? '2px solid var(--color-primary)' : '2px solid transparent',
              color: activeTab === 'purchases' ? 'var(--color-primary)' : 'var(--color-text-muted)',
              cursor: 'pointer'
            }}
          >
            {translations.purchaseHistory}
          </button>
          <button 
            onClick={() => setActiveTab('payments')}
            style={{
              flex: 1, padding: '1rem', fontWeight: 600, background: 'none', border: 'none',
              borderBottom: activeTab === 'payments' ? '2px solid var(--color-primary)' : '2px solid transparent',
              color: activeTab === 'payments' ? 'var(--color-primary)' : 'var(--color-text-muted)',
              cursor: 'pointer'
            }}
          >
            {translations.paymentHistory}
          </button>
        </div>

        <div style={{ padding: 'var(--spacing-lg)' }}>
          {activeTab === 'purchases' && (
            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
                <thead>
                  <tr style={{ borderBottom: '1px solid var(--color-border)', color: 'var(--color-text-muted)' }}>
                    <th style={{ padding: '0.75rem 1rem' }}>{translations.date}</th>
                    <th style={{ padding: '0.75rem 1rem' }}>Number</th>
                    <th style={{ padding: '0.75rem 1rem' }}>{translations.status}</th>
                    <th style={{ padding: '0.75rem 1rem' }}>{translations.amount}</th>
                  </tr>
                </thead>
                <tbody>
                  {supplier.purchases.length > 0 ? supplier.purchases.map((purchase) => (
                    <tr key={purchase.id} style={{ borderBottom: '1px solid var(--color-border)' }}>
                      <td style={{ padding: '1rem' }}>{new Date(purchase.date).toLocaleDateString(locale)}</td>
                      <td style={{ padding: '1rem', fontWeight: 500 }}>
                        <Link href={`/${locale}/purchases/${purchase.id}`} style={{ color: 'var(--color-primary)', textDecoration: 'none' }}>
                          {purchase.purchaseNumber || '-'}
                        </Link>
                      </td>
                      <td style={{ padding: '1rem' }}>
                        <span style={{
                          padding: '0.25rem 0.5rem', borderRadius: '4px', fontSize: '0.75rem', fontWeight: 600,
                          backgroundColor: purchase.status === 'PAID' ? 'var(--color-success-light)' : 'var(--color-warning-light)',
                          color: purchase.status === 'PAID' ? 'var(--color-success)' : 'var(--color-warning)'
                        }}>
                          {purchase.status}
                        </span>
                      </td>
                      <td style={{ padding: '1rem', fontWeight: 600 }}>{formatCurrencyBoth(purchase.total)}</td>
                    </tr>
                  )) : (
                    <tr>
                      <td colSpan={4} style={{ padding: '2rem', textAlign: 'center', color: 'var(--color-text-muted)' }}>
                        {translations.emptyPurchases}
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          )}

          {activeTab === 'payments' && (
            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
                <thead>
                  <tr style={{ borderBottom: '1px solid var(--color-border)', color: 'var(--color-text-muted)' }}>
                    <th style={{ padding: '0.75rem 1rem' }}>{translations.date}</th>
                    <th style={{ padding: '0.75rem 1rem' }}>{translations.paymentMethod}</th>
                    <th style={{ padding: '0.75rem 1rem' }}>{translations.notes}</th>
                    <th style={{ padding: '0.75rem 1rem' }}>{translations.amount}</th>
                  </tr>
                </thead>
                <tbody>
                  {supplier.transactions.length > 0 ? supplier.transactions.map((tx) => (
                    <tr key={tx.id} style={{ borderBottom: '1px solid var(--color-border)' }}>
                      <td style={{ padding: '1rem' }}>{new Date(tx.date).toLocaleDateString(locale)}</td>
                      <td style={{ padding: '1rem' }}>{tx.paymentMethod || '-'}</td>
                      <td style={{ padding: '1rem', color: 'var(--color-text-muted)' }}>{tx.description || '-'}</td>
                      <td style={{ padding: '1rem', fontWeight: 600, color: 'var(--color-success)' }}>
                        {formatCurrencyBoth(tx.amount)}
                      </td>
                    </tr>
                  )) : (
                    <tr>
                      <td colSpan={4} style={{ padding: '2rem', textAlign: 'center', color: 'var(--color-text-muted)' }}>
                        {translations.emptyPayments}
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
