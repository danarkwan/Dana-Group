'use client';

import { useState } from 'react';
import { toast } from 'sonner';
import { recordInvoicePayment, recordPurchasePayment } from '@/lib/actions/payments';
import { formatCurrencyBoth, formatDate } from '@/lib/formatters';
import styles from './payments.module.css';

interface PaymentsClientProps {
  pendingInvoices: any[];
  pendingPurchases: any[];
  translations: any;
}

export default function PaymentsClient({ pendingInvoices, pendingPurchases, translations }: PaymentsClientProps) {
  const [activeTab, setActiveTab] = useState<'customers' | 'suppliers'>('customers');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedRecord, setSelectedRecord] = useState<any>(null);
  const [loading, setLoading] = useState(false);

  const handleOpenModal = (record: any) => {
    setSelectedRecord(record);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setSelectedRecord(null);
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);

    const formData = new FormData(e.currentTarget);
    
    try {
      let res;
      if (activeTab === 'customers') {
        res = await recordInvoicePayment(formData);
      } else {
        res = await recordPurchasePayment(formData);
      }

      if (res.success) {
        toast.success('پارەدانەکە بە سەرکەوتوویی تۆمارکرا');
        handleCloseModal();
      } else {
        toast.error(res.error || 'هەڵەیەک ڕوویدا');
      }
    } catch (error) {
      toast.error('هەڵەیەکی نەزانراو ڕوویدا');
    } finally {
      setLoading(false);
    }
  };

  const getStatusClass = (status: string) => {
    if (status === 'PENDING') return styles.statusPending;
    if (status === 'PARTIAL') return styles.statusPartial;
    if (status === 'PAID') return styles.statusPaid;
    return '';
  };

  const getStatusLabel = (status: string) => {
    if (status === 'PENDING') return 'چاوەڕێکراو (Pending)';
    if (status === 'PARTIAL') return 'بەشێک (Partial)';
    if (status === 'PAID') return 'دراوە (Paid)';
    return status;
  };

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <h1 className={styles.title}>{translations.title}</h1>
      </div>

      <div className={styles.tabs}>
        <button 
          className={`${styles.tab} ${activeTab === 'customers' ? styles.activeTab : ''}`}
          onClick={() => setActiveTab('customers')}
        >
          {translations.customerPayments}
        </button>
        <button 
          className={`${styles.tab} ${activeTab === 'suppliers' ? styles.activeTab : ''}`}
          onClick={() => setActiveTab('suppliers')}
        >
          {translations.supplierPayments}
        </button>
      </div>

      <div className={styles.tableContainer}>
        {activeTab === 'customers' && (
          pendingInvoices.length === 0 ? (
            <div className={styles.emptyState}>
              <div className={styles.emptyStateIcon}>✅</div>
              <p>هیچ قەرزێکی کڕیارەکان نەماوە</p>
            </div>
          ) : (
            <table className={styles.table}>
              <thead>
                <tr>
                  <th>ژمارەی وەسڵ</th>
                  <th>بەروار</th>
                  <th>کڕیار</th>
                  <th>کۆی گشتی</th>
                  <th>پارەی دراو</th>
                  <th>قەرزی ماوە</th>
                  <th>بارودۆخ</th>
                  <th>کردارەکان</th>
                </tr>
              </thead>
              <tbody>
                {pendingInvoices.map((invoice) => (
                  <tr key={invoice.id}>
                    <td style={{ fontWeight: 500 }}>{invoice.invoiceNumber}</td>
                    <td>{formatDate(invoice.date)}</td>
                    <td>{invoice.customer?.name || invoice.customerName}</td>
                    <td>{formatCurrencyBoth(invoice.total)}</td>
                    <td style={{ color: 'var(--color-success)' }}>{formatCurrencyBoth(invoice.paidAmount)}</td>
                    <td style={{ color: 'var(--color-danger)', fontWeight: 'bold' }}>{formatCurrencyBoth(invoice.remainingBalance)}</td>
                    <td>
                      <span className={`${styles.statusBadge} ${getStatusClass(invoice.status)}`}>
                        {getStatusLabel(invoice.status)}
                      </span>
                    </td>
                    <td>
                      <button 
                        className="btn btn-primary" 
                        style={{ padding: '0.25rem 0.75rem', fontSize: '0.875rem' }}
                        onClick={() => handleOpenModal(invoice)}
                      >
                        وەرگرتنی پارە
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )
        )}

        {activeTab === 'suppliers' && (
          pendingPurchases.length === 0 ? (
            <div className={styles.emptyState}>
              <div className={styles.emptyStateIcon}>✅</div>
              <p>هیچ قەرزێکی دابینکارەکان نەماوە</p>
            </div>
          ) : (
            <table className={styles.table}>
              <thead>
                <tr>
                  <th>ژمارەی کڕین</th>
                  <th>بەروار</th>
                  <th>دابینکار</th>
                  <th>کۆی گشتی</th>
                  <th>پارەی دراو</th>
                  <th>قەرزی ماوە</th>
                  <th>بارودۆخ</th>
                  <th>کردارەکان</th>
                </tr>
              </thead>
              <tbody>
                {pendingPurchases.map((purchase) => (
                  <tr key={purchase.id}>
                    <td style={{ fontWeight: 500 }}>{purchase.purchaseNumber || '-'}</td>
                    <td>{formatDate(purchase.date)}</td>
                    <td>{purchase.supplier?.name || '-'}</td>
                    <td>{formatCurrencyBoth(purchase.total)}</td>
                    <td style={{ color: 'var(--color-success)' }}>{formatCurrencyBoth(purchase.paidAmount)}</td>
                    <td style={{ color: 'var(--color-danger)', fontWeight: 'bold' }}>{formatCurrencyBoth(purchase.remainingBalance)}</td>
                    <td>
                      <span className={`${styles.statusBadge} ${getStatusClass(purchase.status)}`}>
                        {getStatusLabel(purchase.status)}
                      </span>
                    </td>
                    <td>
                      <button 
                        className="btn btn-primary" 
                        style={{ padding: '0.25rem 0.75rem', fontSize: '0.875rem' }}
                        onClick={() => handleOpenModal(purchase)}
                      >
                        پێدانی پارە
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )
        )}
      </div>

      {isModalOpen && selectedRecord && (
        <div className="modalOverlay" style={{ zIndex: 1000, position: 'fixed', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', backgroundColor: 'rgba(0,0,0,0.5)', padding: '1rem' }}>
          <div className="modalContent" style={{ backgroundColor: 'var(--color-surface)', width: '100%', maxWidth: '500px', borderRadius: '12px', padding: '2rem', direction: 'rtl' }}>
            <h2 style={{ fontSize: '1.25rem', fontWeight: 600, marginBottom: '1.5rem', borderBottom: '1px solid var(--color-border)', paddingBottom: '0.5rem' }}>
              {activeTab === 'customers' ? 'وەرگرتنی پارەی کڕیار' : 'پێدانی پارەی دابینکار'}
            </h2>
            
            <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              {activeTab === 'customers' ? (
                <input type="hidden" name="invoiceId" value={selectedRecord.id} />
              ) : (
                <input type="hidden" name="purchaseId" value={selectedRecord.id} />
              )}

              <div style={{ padding: '1rem', backgroundColor: 'var(--color-surface-hover)', borderRadius: '8px', display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ fontWeight: 500 }}>بڕی قەرزی ماوە:</span>
                <span style={{ fontWeight: 'bold', color: 'var(--color-danger)' }}>{formatCurrencyBoth(selectedRecord.remainingBalance)}</span>
              </div>
              
              <div className="formGroup">
                <label className="label" style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 500 }}>بڕی پارەی دراو</label>
                <input 
                  type="number" 
                  name="amount" 
                  className="input" 
                  step="250" 
                  max={selectedRecord.remainingBalance}
                  required 
                  defaultValue={selectedRecord.remainingBalance}
                  style={{ width: '100%', padding: '0.75rem', borderRadius: '8px', border: '1px solid var(--color-border)' }} 
                />
              </div>

              <div className="formGroup">
                <label className="label" style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 500 }}>بەروار</label>
                <input 
                  type="date" 
                  name="date" 
                  className="input" 
                  required 
                  defaultValue={new Date().toISOString().split('T')[0]} 
                  style={{ width: '100%', padding: '0.75rem', borderRadius: '8px', border: '1px solid var(--color-border)' }} 
                />
              </div>

              <div className="formGroup">
                <label className="label" style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 500 }}>شێوازی پارەدان</label>
                <select name="paymentMethod" className="input" style={{ width: '100%', padding: '0.75rem', borderRadius: '8px', border: '1px solid var(--color-border)' }}>
                  <option value="CASH">کاش (Cash)</option>
                  <option value="BANK">بانک (Bank)</option>
                  <option value="CREDIT_CARD">کارت (Credit Card)</option>
                  <option value="OTHER">تر (Other)</option>
                </select>
              </div>

              <div className="formGroup">
                <label className="label" style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 500 }}>تێبینی (ئارەزوومەندانە)</label>
                <input 
                  type="text" 
                  name="note" 
                  className="input" 
                  placeholder="بۆ نموونە: قەرستی یەکەم..." 
                  style={{ width: '100%', padding: '0.75rem', borderRadius: '8px', border: '1px solid var(--color-border)' }} 
                />
              </div>

              <div style={{ display: 'flex', gap: '1rem', justifyContent: 'flex-end', marginTop: '1rem' }}>
                <button type="button" className="btn btn-secondary" onClick={handleCloseModal} disabled={loading} style={{ padding: '0.75rem 1.5rem', borderRadius: '8px', border: '1px solid var(--color-border)', backgroundColor: 'transparent', cursor: 'pointer' }}>
                  پاشگەزبوونەوە
                </button>
                <button type="submit" className="btn btn-primary" disabled={loading} style={{ padding: '0.75rem 1.5rem', borderRadius: '8px', border: 'none', backgroundColor: 'var(--color-primary)', color: 'white', cursor: 'pointer' }}>
                  {loading ? '...' : 'پاشەکەوتکردن'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
