import { getTranslations, getLocale } from 'next-intl/server';
import styles from './dashboard.module.css';
import { getFinancialSummary, getRevenueChartData, getRecentTransactions, getExpenseCategoriesData } from '@/lib/services/analytics';
import SummaryCard from '@/components/dashboard/SummaryCard';
import RevenueChart from '@/components/dashboard/RevenueChart';
import ProfitTrendChart from '@/components/dashboard/ProfitTrendChart';
import ExpenseCategoryChart from '@/components/dashboard/ExpenseCategoryChart';
import RecentTransactions from '@/components/dashboard/RecentTransactions';
import DashboardFilter from '@/components/dashboard/DashboardFilter';
import QuickActions from '@/components/dashboard/QuickActions';
import { Wallet, TrendingUp, TrendingDown, DollarSign, FileText, CreditCard, Users, Banknote, UserCheck } from 'lucide-react';
import { formatCurrencyBoth } from '@/lib/formatters';

import { redirect } from 'next/navigation';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';
import { hasAccess } from '@/lib/permissions';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

export default async function DashboardPage(props: { params: Promise<{ locale: string }>, searchParams: Promise<{ period?: string, from?: string, to?: string }> }) {
  const { locale } = await props.params;
  const session = await getServerSession(authOptions);
  if (!session || !hasAccess(session.user, 'dashboard')) {
    redirect(`/${locale}/auth/signin`);
  }

  const searchParams = await props.searchParams;
  const t = await getTranslations('Dashboard');
  
  let startDate: Date | undefined;
  let endDate: Date | undefined;

  const now = new Date();
  const period = searchParams.period || 'thisMonth';
  
  if (period === 'today') {
    startDate = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    endDate = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 23, 59, 59, 999);
  } else if (period === 'thisWeek') {
    startDate = new Date(now);
    startDate.setDate(now.getDate() - now.getDay()); // Assuming week starts on Sunday
    startDate.setHours(0,0,0,0);
    endDate = new Date(now);
    endDate.setHours(23,59,59,999);
  } else if (period === 'thisMonth') {
    startDate = new Date(now.getFullYear(), now.getMonth(), 1);
    endDate = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59, 999);
  } else if (period === 'thisYear') {
    startDate = new Date(now.getFullYear(), 0, 1);
    endDate = new Date(now.getFullYear(), 11, 31, 23, 59, 59, 999);
  } else if (period === 'allTime') {
    startDate = undefined;
    endDate = new Date(now);
    endDate.setHours(23,59,59,999);
  } else if (period === 'custom') {
    if (searchParams.from) {
      startDate = new Date(searchParams.from);
      startDate.setHours(0,0,0,0);
    }
    if (searchParams.to) {
      endDate = new Date(searchParams.to);
      endDate.setHours(23,59,59,999);
    } else {
      endDate = new Date(now);
      endDate.setHours(23,59,59,999);
    }
  }
  
  const [summary, chartData, expenseCategories, recentTransactions] = await Promise.all([
    getFinancialSummary(startDate, endDate),
    getRevenueChartData('30d'), // Initial load with default 30d
    getExpenseCategoriesData('30d'), // Initial load with default 30d
    getRecentTransactions(endDate)
  ]);

  const formatChange = (changeVal: string | number, periodKey: string) => {
    if (!startDate) return `-`; // Don't show percentage change if no start date (e.g. all time)
    const val = typeof changeVal === 'string' ? parseFloat(changeVal) : changeVal;
    if (isNaN(val) || val === 0) return `0% ${t(periodKey)}`;
    const sign = val > 0 ? '+' : '';
    return `${sign}${val}% ${t(periodKey)}`;
  };

  const getFloat = (val: string | number) => typeof val === 'string' ? parseFloat(val) : val;

  const stats = [
    { title: t('totalBalance'), value: summary.totalBalance, change: formatChange(summary.changes.totalBalance, 'fromPreviousPeriod'), isPositive: getFloat(summary.changes.totalBalance) >= 0, Icon: Wallet },
    { title: t('income'), value: summary.totalIncome, change: formatChange(summary.changes.totalIncome, 'fromPreviousPeriod'), isPositive: getFloat(summary.changes.totalIncome) >= 0, Icon: TrendingUp },
    { title: t('expenses'), value: summary.totalExpenses, change: formatChange(summary.changes.totalExpenses, 'fromPreviousPeriod'), isPositive: getFloat(summary.changes.totalExpenses) >= 0, Icon: TrendingDown },
    { title: t('profit'), value: summary.netProfit, change: formatChange(summary.changes.netProfit, 'fromPreviousPeriod'), isPositive: getFloat(summary.changes.netProfit) >= 0, Icon: DollarSign },
    { title: t('outstandingReceivables'), value: summary.outstandingReceivables, change: formatChange(summary.changes.outstandingReceivables, 'fromPreviousPeriod'), isPositive: getFloat(summary.changes.outstandingReceivables) <= 0, Icon: FileText, href: `/${locale}/invoices` },
    { title: t('outstandingPayables'), value: summary.outstandingPayables, change: formatChange(summary.changes.outstandingPayables, 'fromPreviousPeriod'), isPositive: getFloat(summary.changes.outstandingPayables) <= 0, Icon: CreditCard, href: `/${locale}/purchases` },
    { title: 'کارمەندەکان', value: summary.totalEmployees, change: '-', isPositive: true, Icon: Users, href: `/${locale}/employees` },
    { title: 'مووچەی دراو', value: summary.salariesPaid, change: '-', isPositive: false, Icon: Banknote, href: `/${locale}/payroll` },
    { title: 'مووچەی نەدراو', value: summary.pendingSalaries, change: '-', isPositive: false, Icon: UserCheck, href: `/${locale}/payroll` },
  ];

  return (
    <div className={styles.container}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
        <h1 className={styles.pageTitle} style={{ marginBottom: 0 }}>{t('title')}</h1>
        <DashboardFilter />
      </div>

      <QuickActions locale={locale} />

      <div className={styles.statsGrid}>
        {stats.map((stat, idx) => (
          <SummaryCard 
            key={idx}
            title={stat.title}
            value={formatCurrencyBoth(stat.value)}
            change={stat.change}
            isPositive={stat.isPositive}
            Icon={stat.Icon}
            href={stat.href}
          />
        ))}
      </div>

      <div className={styles.chartsGrid}>
        <div className={`card ${styles.mainChart} ${styles.fullWidth}`} style={{ padding: '1.5rem', backgroundColor: 'var(--color-surface)', borderRadius: 'var(--radius-lg)', border: '1px solid var(--color-border)', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.05)' }}>
          <RevenueChart initialData={chartData} title={t('revenueOverview')} />
        </div>
        <div className={`card ${styles.sideChart}`} style={{ padding: '1.5rem', backgroundColor: 'var(--color-surface)', borderRadius: 'var(--radius-lg)', border: '1px solid var(--color-border)', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.05)' }}>
          <ProfitTrendChart initialData={chartData} title="رەوتی قازانج" />
        </div>
        <div className={`card ${styles.sideChart}`} style={{ padding: '1.5rem', backgroundColor: 'var(--color-surface)', borderRadius: 'var(--radius-lg)', border: '1px solid var(--color-border)', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.05)' }}>
          <ExpenseCategoryChart initialData={expenseCategories} title="جۆرەکانی خەرجی" />
        </div>
        <div className={`card ${styles.mainChart} ${styles.fullWidth}`} style={{ padding: '1.5rem', backgroundColor: 'var(--color-surface)', borderRadius: 'var(--radius-lg)', border: '1px solid var(--color-border)', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.05)' }}>
          <RecentTransactions transactions={recentTransactions} title={t('recentTransactions')} viewAllText={t('viewAll')} />
        </div>
      </div>
    </div>
  );
}
