import { getTranslations } from 'next-intl/server';
import { getFinancialSummary, getDebtsReport, getSalesReport, getPurchasesReport, getInventoryReport } from '@/lib/actions/reports';
import ReportsClient from './ReportsClient';

import { redirect } from 'next/navigation';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';
import { hasAccess } from '@/lib/permissions';

export default async function ReportsPage({ searchParams }: { searchParams: { start?: string, end?: string } }) {
  const session = await getServerSession(authOptions);
  if (!session || !hasAccess(session.user, 'reports')) {
    redirect(`/en/auth/signin`);
  }

  const t = await getTranslations('Dashboard'); // Using Dashboard translations, can add Reports if needed
  
  // Default to current month if no dates provided
  const now = new Date();
  const firstDay = new Date(now.getFullYear(), now.getMonth(), 1).toISOString().split('T')[0];
  const lastDay = new Date(now.getFullYear(), now.getMonth() + 1, 0).toISOString().split('T')[0];
  
  const startDate = searchParams.start || firstDay;
  const endDate = searchParams.end || lastDay;

  // Fetch all report data
  const [financial, debts, sales, purchases, inventory] = await Promise.all([
    getFinancialSummary(startDate, endDate),
    getDebtsReport(), // Debts are current, not date dependent
    getSalesReport(startDate, endDate),
    getPurchasesReport(startDate, endDate),
    getInventoryReport() // Inventory is current, not date dependent
  ]);

  return (
    <ReportsClient 
      startDate={startDate}
      endDate={endDate}
      financial={financial}
      debts={debts}
      sales={sales}
      purchases={purchases}
      inventory={inventory}
      translations={{
        title: 'ڕاپۆرتەکان',
        financialSummary: 'پوختەی دارایی',
        totalIncome: 'کۆی داهات',
        totalExpenses: 'کۆی خەرجی',
        netProfit: 'قازانجی سافی',
        debtsSummary: 'پوختەی قەرزەکان',
        customerDebts: 'قەرزی لای کڕیارەکان (Receivables)',
        supplierDebts: 'قەرزی لای دابینکارەکان (Payables)',
        salesReport: 'ڕاپۆرتی فرۆشتن (Sales)',
        purchasesReport: 'ڕاپۆرتی کڕین (Purchases)',
        inventoryReport: 'ڕاپۆرتی کۆگا (Inventory)',
        print: 'چاپکردن',
        exportPdf: 'PDF',
        exportExcel: 'Excel',
        filter: 'پاڵاوتن',
        startDate: 'لە بەرواری',
        endDate: 'تا بەرواری',
      }}
    />
  );
}
