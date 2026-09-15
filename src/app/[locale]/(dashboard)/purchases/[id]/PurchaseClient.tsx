'use client'

import { useTranslations } from 'next-intl'
import { Printer, Download, ArrowLeft } from 'lucide-react'
import Link from 'next/link'
import { formatCurrencyBoth } from '@/lib/formatters'
import styles from '../purchases.module.css'

export default function PurchaseClient({ purchase }: { purchase: any }) {
  const t = useTranslations('Purchases')
  const locale = 'ku' 
  
  const handlePrint = () => {
    window.print()
  }

  const handleDownloadImage = async () => {
    try {
      const html2canvas = (await import('html2canvas')).default
      const element = document.getElementById('purchase-printable')
      
      if (!element) return;
      
      const canvas = await html2canvas(element, { 
        scale: 2, 
        useCORS: true,
        backgroundColor: '#ffffff'
      });
      
      const image = canvas.toDataURL("image/jpeg", 0.9);
      const link = document.createElement('a');
      link.href = image;
      link.download = `purchase-${purchase.purchaseNumber}.jpg`;
      link.click();
    } catch (error) {
      console.error('Error generating image:', error);
    }
  }

  return (
    <div className={styles.container}>
      <style dangerouslySetInnerHTML={{__html: `
        @media print {
          body * {
            visibility: hidden;
          }
          #purchase-printable, #purchase-printable * {
            visibility: visible;
          }
          #purchase-printable {
            position: absolute;
            left: 0;
            top: 0;
            width: 100%;
          }
          .no-print {
            display: none !important;
          }
        }
      `}} />

      <div className={`${styles.header} no-print`}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--spacing-md)' }}>
          <Link href="/ku/purchases" className="btn btn-secondary">
            <ArrowLeft size={20} /> گەڕانەوە
          </Link>
          <h1 className={styles.title}>کڕینی {purchase.purchaseNumber}</h1>
        </div>
        <div style={{ display: 'flex', gap: 'var(--spacing-sm)' }}>
          <button onClick={handlePrint} className="btn btn-primary">
            <Printer size={20} /> چاپکردن (Print)
          </button>
          <button onClick={handleDownloadImage} className="btn btn-secondary">
            <Download size={20} /> دابەزاندن (وێنە)
          </button>
        </div>
      </div>

      <div id="purchase-printable" className={`card ${styles.invoicePrintable}`}>
        <div className={styles.invoicePrintHeader}>
          <div className={styles.invoicePrintHeaderRight}></div>
          <div className={styles.invoicePrintHeaderCenter}>
            <h2 style={{ fontSize: '2rem', fontWeight: 'bold', color: 'var(--color-primary)' }}>DANA GROUP</h2>
            <p style={{ color: 'var(--color-text-muted)' }}>سیستەمی ژمێریاری و بەڕێوەبردن</p>
          </div>
          <div className={styles.invoicePrintHeaderLeft}></div>
        </div>

        <div className={styles.invoiceCustomerInfo}>
          <div>
            <h3 style={{ color: 'var(--color-text-muted)', marginBottom: '0.5rem' }}>بۆ (دابینکەر):</h3>
            <p style={{ fontWeight: 600, fontSize: '1.2rem' }}>{purchase.supplierName || purchase.supplier?.name || 'دابینکەری گشتی'}</p>
            {purchase.supplier?.phone && <p>{purchase.supplier.phone}</p>}
            {purchase.supplier?.address && <p>{purchase.supplier.address}</p>}
          </div>
          <div style={{ textAlign: 'left' }}>
            <div style={{ marginBottom: '0.5rem' }}>
              <span style={{ color: 'var(--color-text-muted)', marginLeft: '1rem' }}>بەروار:</span>
              <span style={{ fontWeight: 600 }}>
                {(() => {
                  const d = new Date(purchase.date);
                  return `${d.getDate().toString().padStart(2, '0')}/${(d.getMonth() + 1).toString().padStart(2, '0')}/${d.getFullYear()}`;
                })()}
              </span>
            </div>
            <div>
              <span style={{ color: 'var(--color-text-muted)', marginLeft: '1rem' }}>کڕین:</span>
              <span style={{ fontWeight: 600, fontSize: '0.95rem' }}>#{purchase.purchaseNumber}</span>
            </div>
          </div>
        </div>

        <div className={styles.invoiceTableWrapper}>
          <table style={{ width: '100%', borderCollapse: 'collapse', minWidth: '400px' }}>
            <thead>
              <tr style={{ backgroundColor: 'var(--color-surface-hover)', borderBottom: '2px solid var(--color-border)' }}>
                <th style={{ padding: '1rem', textAlign: 'right' }}>وەسف</th>
                <th style={{ padding: '1rem', textAlign: 'center' }}>بڕ</th>
                <th style={{ padding: '1rem', textAlign: 'center' }}>نرخ</th>
                <th style={{ padding: '1rem', textAlign: 'left' }}>کۆی گشتی</th>
              </tr>
            </thead>
            <tbody>
              {purchase.items.map((item: any) => (
                <tr key={item.id} style={{ borderBottom: '1px solid var(--color-border)' }}>
                  <td style={{ padding: '1rem', textAlign: 'right' }}>
                    {item.description || item.product?.name}
                  </td>
                  <td style={{ padding: '1rem', textAlign: 'center' }}>{item.quantity}</td>
                  <td style={{ padding: '1rem', textAlign: 'center' }}>{formatCurrencyBoth(item.price)}</td>
                  <td style={{ padding: '1rem', textAlign: 'left', fontWeight: 600 }}>{formatCurrencyBoth(item.quantity * item.price)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className={styles.invoiceBottomSection}>
          <div style={{ flex: 1 }}>
            {purchase.notes && (
              <div>
                <h4 style={{ color: 'var(--color-text-muted)', marginBottom: '0.5rem' }}>تێبینی:</h4>
                <p style={{ fontSize: '0.9rem', color: 'var(--color-text)' }}>{purchase.notes}</p>
              </div>
            )}
          </div>
          <div className={styles.invoiceTotals}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
              <span style={{ color: 'var(--color-text-muted)' }}>کۆی گشتی پێش باج:</span>
              <span>{formatCurrencyBoth(purchase.subtotal)}</span>
            </div>
            {purchase.discount > 0 && (
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
                <span style={{ color: 'var(--color-text-muted)' }}>داشکاندن:</span>
                <span>-{formatCurrencyBoth(purchase.discount)}</span>
              </div>
            )}
            {purchase.tax > 0 && (
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
                <span style={{ color: 'var(--color-text-muted)' }}>باج:</span>
                <span>{formatCurrencyBoth(purchase.tax)}</span>
              </div>
            )}
            <div style={{ display: 'flex', justifyContent: 'space-between', borderTop: '2px solid var(--color-border)', paddingTop: '1rem', marginTop: '0.5rem', fontWeight: 'bold', fontSize: '1.2rem' }}>
              <span>کۆی گشتی:</span>
              <span>{formatCurrencyBoth(purchase.total)}</span>
            </div>
            {purchase.paidAmount > 0 && (
              <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '1rem', color: 'var(--color-success)' }}>
                <span>بڕی دراو:</span>
                <span>{formatCurrencyBoth(purchase.paidAmount)}</span>
              </div>
            )}
            {purchase.remainingBalance > 0 && (
              <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '0.5rem', color: 'var(--color-danger)', fontWeight: 'bold' }}>
                <span>بڕی ماوە:</span>
                <span>{formatCurrencyBoth(purchase.remainingBalance)}</span>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
