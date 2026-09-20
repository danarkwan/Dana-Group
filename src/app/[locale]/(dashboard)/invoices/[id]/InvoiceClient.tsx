import { toast } from 'sonner';
'use client'

import { useTranslations } from 'next-intl'
import { Printer, Download, ArrowLeft, Share2 } from 'lucide-react'
import Link from 'next/link'
import { formatCurrencyBoth } from '@/lib/formatters'
import styles from '../invoices.module.css'

export default function InvoiceClient({ invoice }: { invoice: any }) {
  const t = useTranslations('Invoices')
  const locale = 'ku' // could be dynamic but assuming kurdish for now since that's what the user wants mostly
  
  const handlePrint = () => {
    window.print()
  }

  const handleDownloadImage = async () => {
    try {
      const html2canvas = (await import('html2canvas')).default
      const element = document.getElementById('invoice-printable')
      
      if (!element) return;
      
      const canvas = await html2canvas(element, { 
        scale: 2, 
        useCORS: true,
        backgroundColor: '#ffffff'
      });
      
      const image = canvas.toDataURL("image/jpeg", 0.9);
      const link = document.createElement('a');
      link.href = image;
      link.download = `invoice-${invoice.invoiceNumber}.jpg`;
      link.click();
    } catch (error) {
      console.error('Error generating image:', error);
    }
  }

  const handleShare = async () => {
    try {
      if (navigator.share) {
        // Try to share just the text/url first
        await navigator.share({
          title: `وەسڵی ${invoice.invoiceNumber} - Dana Group`,
          text: `فەرموو، ئەمە وەسڵی ژمارە ${invoice.invoiceNumber} یە بە بڕی ${formatCurrencyBoth(invoice.total)}.`,
          url: window.location.href,
        });
      } else {
        // Fallback for browsers that don't support Web Share API
        navigator.clipboard.writeText(window.location.href);
        toast.success('لینکی وەسڵەکە کۆپی کرا بۆ فۆنەکەت!');
      }
    } catch (error) {
      console.log('Error sharing:', error);
    }
  }

  return (
    <div className={styles.container}>
      <style dangerouslySetInnerHTML={{__html: `
        @media print {
          @page {
            margin: 0;
            size: A4 portrait;
          }
          body {
            margin: 1cm;
          }
          body * {
            visibility: hidden;
          }
          #invoice-printable, #invoice-printable * {
            visibility: visible;
            -webkit-print-color-adjust: exact !important;
            print-color-adjust: exact !important;
          }
          #invoice-printable {
            position: absolute;
            left: 0;
            top: 0;
            width: 100%;
            margin: 0;
            padding: 0;
            box-shadow: none !important;
          }
          .no-print {
            display: none !important;
          }
        }
      `}} />

      <div className={`${styles.header} no-print`}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--spacing-md)' }}>
          <Link href="/ku/invoices" className="btn btn-secondary">
            <ArrowLeft size={20} /> گەڕانەوە
          </Link>
          <h1 className={styles.title}>وەسڵی {invoice.invoiceNumber}</h1>
        </div>
        <div style={{ display: 'flex', gap: 'var(--spacing-sm)' }}>
          <button onClick={handlePrint} className="btn btn-primary">
            <Printer size={20} /> چاپکردن / PDF
          </button>
          <button onClick={handleDownloadImage} className="btn btn-secondary">
            <Download size={20} /> وێنە
          </button>
          <button onClick={handleShare} className="btn btn-secondary">
            <Share2 size={20} /> ناردن
          </button>
        </div>
      </div>

      <div id="invoice-printable" className={`card ${styles.invoicePrintable}`}>
        <div className={styles.invoicePrintHeader}>
          <div className={styles.invoicePrintHeaderCenter}>
            <h2>DANA GROUP</h2>
            <p>سیستەمی ژمێریاری و بەڕێوەبردن</p>
          </div>
        </div>

        <div className={styles.invoiceInfoGrid}>
          <div className={styles.invoiceInfoBox}>
            <h3>بۆ:</h3>
            <p>{invoice.customerName || invoice.customer?.name || 'کڕیاری گشتی'}</p>
            {invoice.customer?.phone && <div className={styles.infoDetail}>{invoice.customer.phone}</div>}
            {invoice.customer?.address && <div className={styles.infoDetail}>{invoice.customer.address}</div>}
          </div>
          <div className={styles.invoiceInfoBox} style={{ textAlign: 'left' }}>
            <div style={{ marginBottom: '1rem' }}>
              <h3>بەروار:</h3>
              <p>
                {(() => {
                  const d = new Date(invoice.date);
                  return `${d.getDate().toString().padStart(2, '0')}/${(d.getMonth() + 1).toString().padStart(2, '0')}/${d.getFullYear()}`;
                })()}
              </p>
            </div>
            <div>
              <h3>وەسڵ:</h3>
              <p style={{ fontSize: '1.25rem', color: '#4b5563' }}>#{invoice.invoiceNumber}</p>
            </div>
          </div>
        </div>

        <div className={styles.invoiceTableWrapper}>
          <table className={styles.invoiceTable}>
            <thead>
              <tr>
                <th style={{ textAlign: 'right' }}>وەسف</th>
                <th style={{ textAlign: 'center' }}>بڕ</th>
                <th style={{ textAlign: 'center' }}>نرخ</th>
                <th style={{ textAlign: 'left' }}>کۆی گشتی</th>
              </tr>
            </thead>
            <tbody>
              {invoice.items.map((item: any) => (
                <tr key={item.id}>
                  <td style={{ textAlign: 'right', fontWeight: 500 }}>
                    {item.description || item.product?.name}
                  </td>
                  <td style={{ textAlign: 'center' }}>{item.quantity}</td>
                  <td style={{ textAlign: 'center' }}>{formatCurrencyBoth(item.price)}</td>
                  <td style={{ textAlign: 'left', fontWeight: 600 }}>{formatCurrencyBoth(item.quantity * item.price)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className={styles.invoiceBottomSection}>
          <div className={styles.invoiceNotes}>
            {invoice.notes ? (
              <>
                <h4>تێبینییەکان:</h4>
                <p>{invoice.notes}</p>
              </>
            ) : (
              <>
                <h4>زانیاری زیاتر:</h4>
                <p>سوپاس بۆ مامەڵەکردنتان لەگەڵ دانا گروپ. هیوادارین لە خزمەتگوزارییەکانمان ڕازی بن.</p>
              </>
            )}
          </div>

          <div className={styles.invoiceTotals}>
            <div className={styles.invoiceTotalRow}>
              <span>کۆی گشتی پێش باج:</span>
              <span>{formatCurrencyBoth(invoice.subtotal)}</span>
            </div>
            {invoice.discount > 0 && (
              <div className={styles.invoiceTotalRow}>
                <span>داشکاندن:</span>
                <span>-{formatCurrencyBoth(invoice.discount)}</span>
              </div>
            )}
            {invoice.tax > 0 && (
              <div className={styles.invoiceTotalRow}>
                <span>باج:</span>
                <span>{formatCurrencyBoth(invoice.tax)}</span>
              </div>
            )}
            <div className={`${styles.invoiceTotalRow} ${styles.highlight}`}>
              <span>کۆی گشتی:</span>
              <span>{formatCurrencyBoth(invoice.total)}</span>
            </div>
            {invoice.paidAmount > 0 && (
              <div className={`${styles.invoiceTotalRow} ${styles.paid}`} style={{ marginTop: '0.75rem' }}>
                <span>بڕی دراو:</span>
                <span>{formatCurrencyBoth(invoice.paidAmount)}</span>
              </div>
            )}
            {invoice.remainingBalance > 0 && (
              <div className={`${styles.invoiceTotalRow} ${styles.due}`}>
                <span>بڕی ماوە:</span>
                <span>{formatCurrencyBoth(invoice.remainingBalance)}</span>
              </div>
            )}
          </div>
        </div>

        <div className={styles.invoiceFooterMessage}>
          ئامادەین بۆ فرۆشتنی هەموو جۆرە نەمامێک و چاککردنی باخچەکان بە جوانترین شێوە
        </div>
      </div>
    </div>
  )
}
