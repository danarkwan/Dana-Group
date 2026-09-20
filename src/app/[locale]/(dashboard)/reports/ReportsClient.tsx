'use client';

import { useRouter, usePathname } from 'next/navigation';
import { formatCurrencyBoth } from '@/lib/formatters';
import { Printer, Download, FileSpreadsheet } from 'lucide-react';
import styles from './reports.module.css';
import { toast } from 'sonner';

export default function ReportsClient({ 
  startDate, endDate, financial, debts, sales, purchases, inventory, translations 
}: any) {
  const router = useRouter();
  const pathname = usePathname();

  const handleFilter = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const start = formData.get('start') as string;
    const end = formData.get('end') as string;
    
    router.push(`${pathname}?start=${start}&end=${end}`);
  };

  const handlePrint = () => {
    window.print();
  };

  const exportPDF = async () => {
    try {
      const html2pdf = (await import('html2pdf.js')).default;
      
      // Unhide the template momentarily for capture
      const element = document.getElementById('pdf-template-wrapper');
      if (element) {
        element.style.display = 'block';
        
        const opt = {
          margin:       0.5,
          filename:     `report_${startDate}_to_${endDate}.pdf`,
          image:        { type: 'jpeg' as const, quality: 0.98 },
          html2canvas:  { scale: 2, useCORS: true, windowWidth: 800 },
          jsPDF:        { unit: 'in', format: 'a4', orientation: 'portrait' as const }
        };

        await html2pdf().set(opt).from(element).save();
        
        // Hide again
        element.style.display = 'none';
      }
    } catch (error) {
      console.error(error);
      toast.error('هەڵەیەک ڕوویدا لە کاتی دروستکردنی PDF');
    }
  };

  const exportExcel = async () => {
    const XLSX = await import('xlsx');
    const wb = XLSX.utils.book_new();

    // Financials
    const financialData = [
      ['پێوەر', 'بڕ'],
      ['کۆی داهات', financial.totalIncome],
      ['کۆی خەرجی', financial.totalExpenses],
      ['قازانجی سافی', financial.netProfit],
      ['کۆی قەرزی کڕیارەکان', debts.totalReceivables],
      ['کۆی قەرزی دابینکارەکان', debts.totalPayables]
    ];
    const wsFinancial = XLSX.utils.aoa_to_sheet(financialData);
    XLSX.utils.book_append_sheet(wb, wsFinancial, 'پوختەی دارایی');

    // Customer Debts
    const customerDebtsData = [['ناوی کڕیار', 'مۆبایل', 'کۆی قەرز']];
    debts.customerDebts.forEach((c: any) => {
      customerDebtsData.push([c.name, c.phone || '', c.totalDebt]);
    });
    const wsCustomers = XLSX.utils.aoa_to_sheet(customerDebtsData);
    XLSX.utils.book_append_sheet(wb, wsCustomers, 'قەرزی کڕیارەکان');

    // Supplier Debts
    const supplierDebtsData = [['ناوی دابینکار', 'مۆبایل', 'کۆی قەرز']];
    debts.supplierDebts.forEach((s: any) => {
      supplierDebtsData.push([s.name, s.phone || '', s.totalDebt]);
    });
    const wsSuppliers = XLSX.utils.aoa_to_sheet(supplierDebtsData);
    XLSX.utils.book_append_sheet(wb, wsSuppliers, 'قەرزی دابینکارەکان');

    // Write file
    XLSX.writeFile(wb, `financial_report_${startDate}_to_${endDate}.xlsx`);
  };

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <h1 className={styles.title}>{translations.title}</h1>
        
        <div className={styles.actions}>
          <form className={styles.filterForm} onSubmit={handleFilter}>
            <input type="date" name="start" className="input" defaultValue={startDate} required style={{ padding: '0.5rem', borderRadius: '4px', border: '1px solid var(--color-border)' }} />
            <span>-</span>
            <input type="date" name="end" className="input" defaultValue={endDate} required style={{ padding: '0.5rem', borderRadius: '4px', border: '1px solid var(--color-border)' }} />
            <button type="submit" className="btn btn-primary" style={{ padding: '0.5rem 1rem' }}>{translations.filter}</button>
          </form>
          
          <button onClick={handlePrint} className="btn btn-secondary" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', padding: '0.5rem 1rem' }}>
            <Printer size={18} /> {translations.print}
          </button>
          <button onClick={exportPDF} className="btn btn-secondary" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', padding: '0.5rem 1rem' }}>
            <Download size={18} /> {translations.exportPdf}
          </button>
          <button onClick={exportExcel} className="btn btn-secondary" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', padding: '0.5rem 1rem' }}>
            <FileSpreadsheet size={18} /> {translations.exportExcel}
          </button>
        </div>
      </div>

      <div id="report-content" style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem', padding: '1rem', backgroundColor: 'white' }}>
        <div style={{ marginBottom: '1rem', borderBottom: '2px solid var(--color-border)', paddingBottom: '1rem' }}>
          <h2>{translations.financialSummary}</h2>
          <p style={{ color: 'var(--color-text-muted)' }}>{translations.startDate}: {startDate} - {translations.endDate}: {endDate}</p>
        </div>

        <div className={styles.summaryGrid}>
          <div className={styles.summaryCard}>
            <span className={styles.cardTitle}>{translations.totalIncome}</span>
            <span className={styles.cardValue} style={{ color: 'var(--color-success)' }}>{formatCurrencyBoth(financial.totalIncome)}</span>
          </div>
          <div className={styles.summaryCard}>
            <span className={styles.cardTitle}>{translations.totalExpenses}</span>
            <span className={styles.cardValue} style={{ color: 'var(--color-danger)' }}>{formatCurrencyBoth(financial.totalExpenses)}</span>
          </div>
          <div className={styles.summaryCard}>
            <span className={styles.cardTitle}>{translations.netProfit}</span>
            <span className={`${styles.cardValue} ${financial.netProfit >= 0 ? styles.profitPositive : styles.profitNegative}`}>
              {formatCurrencyBoth(financial.netProfit)}
            </span>
          </div>
          <div className={styles.summaryCard}>
            <span className={styles.cardTitle}>{translations.customerDebts}</span>
            <span className={styles.cardValue} style={{ color: 'var(--color-primary)' }}>{formatCurrencyBoth(debts.totalReceivables)}</span>
          </div>
          <div className={styles.summaryCard}>
            <span className={styles.cardTitle}>{translations.supplierDebts}</span>
            <span className={styles.cardValue} style={{ color: '#854d0e' }}>{formatCurrencyBoth(debts.totalPayables)}</span>
          </div>
        </div>

        <div className={styles.section}>
          <h2 className={styles.sectionTitle}>{translations.salesReport} & {translations.purchasesReport}</h2>
          <div className={styles.summaryGrid} style={{ marginBottom: '1rem' }}>
            <div className={styles.summaryCard}>
              <span className={styles.cardTitle}>کۆی بەهای فرۆشتنەکان</span>
              <span className={styles.cardValue}>{formatCurrencyBoth(sales.summary.totalSales)}</span>
            </div>
            <div className={styles.summaryCard}>
              <span className={styles.cardTitle}>کۆی بەهای کڕینەکان</span>
              <span className={styles.cardValue}>{formatCurrencyBoth(purchases.summary.totalPurchases)}</span>
            </div>
          </div>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem' }}>
          <div className={styles.section}>
            <h2 className={styles.sectionTitle}>{translations.customerDebts}</h2>
            <div className={styles.tableContainer}>
              <table className={styles.table}>
                <thead>
                  <tr>
                    <th>کڕیار</th>
                    <th>بڕی قەرز</th>
                  </tr>
                </thead>
                <tbody>
                  {debts.customerDebts.map((c: any) => (
                    <tr key={c.id}>
                      <td>{c.name}</td>
                      <td style={{ color: 'var(--color-danger)', fontWeight: 'bold' }}>{formatCurrencyBoth(c.totalDebt)}</td>
                    </tr>
                  ))}
                  {debts.customerDebts.length === 0 && (
                    <tr><td colSpan={2} style={{ textAlign: 'center' }}>هیچ قەرزێک نییە</td></tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>

          <div className={styles.section}>
            <h2 className={styles.sectionTitle}>{translations.supplierDebts}</h2>
            <div className={styles.tableContainer}>
              <table className={styles.table}>
                <thead>
                  <tr>
                    <th>دابینکار</th>
                    <th>بڕی قەرز</th>
                  </tr>
                </thead>
                <tbody>
                  {debts.supplierDebts.map((s: any) => (
                    <tr key={s.id}>
                      <td>{s.name}</td>
                      <td style={{ color: 'var(--color-danger)', fontWeight: 'bold' }}>{formatCurrencyBoth(s.totalDebt)}</td>
                    </tr>
                  ))}
                  {debts.supplierDebts.length === 0 && (
                    <tr><td colSpan={2} style={{ textAlign: 'center' }}>هیچ قەرزێک نییە</td></tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        <div className={styles.section}>
          <h2 className={styles.sectionTitle}>{translations.inventoryReport}</h2>
          <div className={styles.summaryGrid} style={{ marginBottom: '1rem' }}>
            <div className={styles.summaryCard}>
              <span className={styles.cardTitle}>کۆی پارچەکان</span>
              <span className={styles.cardValue}>{inventory.summary.totalItems}</span>
            </div>
            <div className={styles.summaryCard}>
              <span className={styles.cardTitle}>پارچە کەمبووەکان</span>
              <span className={styles.cardValue} style={{ color: 'var(--color-danger)' }}>{inventory.summary.lowStockCount}</span>
            </div>
            <div className={styles.summaryCard}>
              <span className={styles.cardTitle}>بەهای تێچووی کۆگا</span>
              <span className={styles.cardValue}>{formatCurrencyBoth(inventory.summary.totalInventoryValue)}</span>
            </div>
            <div className={styles.summaryCard}>
              <span className={styles.cardTitle}>بەهای فرۆشتنی کۆگا</span>
              <span className={styles.cardValue} style={{ color: 'var(--color-success)' }}>{formatCurrencyBoth(inventory.summary.totalRetailValue)}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Hidden PDF Template that looks exactly like jspdf-autotable but supports Kurdish */}
      <div id="pdf-template-wrapper" style={{ display: 'none', backgroundColor: 'white', padding: '20px', direction: 'rtl', fontFamily: 'system-ui, -apple-system, sans-serif' }}>
        <h1 style={{ fontSize: '24px', marginBottom: '8px', fontWeight: 'bold' }}>ڕاپۆرتی دارایی</h1>
        <p style={{ fontSize: '14px', marginBottom: '24px', color: '#4b5563' }}>بەروار: {startDate} بۆ {endDate}</p>
        
        <table style={{ width: '100%', borderCollapse: 'collapse', marginBottom: '40px', fontSize: '13px' }}>
          <thead>
            <tr style={{ backgroundColor: '#3b82f6', color: 'white' }}>
              <th style={{ padding: '10px 14px', textAlign: 'right', fontWeight: 'bold', borderBottom: '1px solid #e5e7eb' }}>پێوەر</th>
              <th style={{ padding: '10px 14px', textAlign: 'right', fontWeight: 'bold', borderBottom: '1px solid #e5e7eb' }}>بڕ</th>
            </tr>
          </thead>
          <tbody>
            <tr style={{ backgroundColor: '#f9fafb' }}>
              <td style={{ padding: '10px 14px', borderBottom: '1px solid #f3f4f6', color: '#111827' }}>کۆی داهات</td>
              <td style={{ padding: '10px 14px', borderBottom: '1px solid #f3f4f6', color: '#111827' }}>{formatCurrencyBoth(financial.totalIncome)}</td>
            </tr>
            <tr>
              <td style={{ padding: '10px 14px', borderBottom: '1px solid #f3f4f6', color: '#111827' }}>کۆی خەرجی</td>
              <td style={{ padding: '10px 14px', borderBottom: '1px solid #f3f4f6', color: '#111827' }}>{formatCurrencyBoth(financial.totalExpenses)}</td>
            </tr>
            <tr style={{ backgroundColor: '#f9fafb' }}>
              <td style={{ padding: '10px 14px', borderBottom: '1px solid #f3f4f6', color: '#111827' }}>قازانجی سافی</td>
              <td style={{ padding: '10px 14px', borderBottom: '1px solid #f3f4f6', color: '#111827' }}>{formatCurrencyBoth(financial.netProfit)}</td>
            </tr>
            <tr>
              <td style={{ padding: '10px 14px', borderBottom: '1px solid #f3f4f6', color: '#111827' }}>کۆی قەرزی کڕیارەکان</td>
              <td style={{ padding: '10px 14px', borderBottom: '1px solid #f3f4f6', color: '#111827' }}>{formatCurrencyBoth(debts.totalReceivables)}</td>
            </tr>
            <tr style={{ backgroundColor: '#f9fafb' }}>
              <td style={{ padding: '10px 14px', borderBottom: '1px solid #f3f4f6', color: '#111827' }}>کۆی قەرزی دابینکارەکان</td>
              <td style={{ padding: '10px 14px', borderBottom: '1px solid #f3f4f6', color: '#111827' }}>{formatCurrencyBoth(debts.totalPayables)}</td>
            </tr>
          </tbody>
        </table>

        <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '13px' }}>
          <thead>
            <tr style={{ backgroundColor: '#3b82f6', color: 'white' }}>
              <th style={{ padding: '10px 14px', textAlign: 'right', fontWeight: 'bold', borderBottom: '1px solid #e5e7eb' }}>کۆگا</th>
              <th style={{ padding: '10px 14px', textAlign: 'right', fontWeight: 'bold', borderBottom: '1px solid #e5e7eb' }}>بەها</th>
            </tr>
          </thead>
          <tbody>
            <tr style={{ backgroundColor: '#f9fafb' }}>
              <td style={{ padding: '10px 14px', borderBottom: '1px solid #f3f4f6', color: '#111827' }}>کۆی پارچەکان</td>
              <td style={{ padding: '10px 14px', borderBottom: '1px solid #f3f4f6', color: '#111827' }}>{inventory.summary.totalItems}</td>
            </tr>
            <tr>
              <td style={{ padding: '10px 14px', borderBottom: '1px solid #f3f4f6', color: '#111827' }}>پارچە کەمبووەکان</td>
              <td style={{ padding: '10px 14px', borderBottom: '1px solid #f3f4f6', color: '#111827' }}>{inventory.summary.lowStockCount}</td>
            </tr>
            <tr style={{ backgroundColor: '#f9fafb' }}>
              <td style={{ padding: '10px 14px', borderBottom: '1px solid #f3f4f6', color: '#111827' }}>بەهای تێچووی کۆگا</td>
              <td style={{ padding: '10px 14px', borderBottom: '1px solid #f3f4f6', color: '#111827' }}>{formatCurrencyBoth(inventory.summary.totalInventoryValue)}</td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  );
}
