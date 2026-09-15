import { getTranslations, getLocale } from 'next-intl/server';
import styles from './dashboard.module.css';
import { getFinancialSummary, getRevenueChartData, getRecentTransactions } from '@/lib/services/analytics';
import SummaryCard from '@/components/dashboard/SummaryCard';
import RevenueChart from '@/components/dashboard/RevenueChart';
import RecentTransactions from '@/components/dashboard/RecentTransactions';
import DashboardFilter from '@/components/dashboard/DashboardFilter';
import { Wallet, TrendingUp, TrendingDown, DollarSign, Activity, FileText, CreditCard } from 'lucide-react';
import { formatCurrencyBoth } from '@/lib/formatters';

export default async function DashboardPage(props: { searchParams: Promise<{ date?: string }> }) {
  const searchParams = await props.searchParams;
  const t = await getTranslations('Dashboard');
  const locale = await getLocale();
  
  const baseDate = searchParams?.date ? new Date(searchParams.date) : new Date();
  
  const [summary, chartData, recentTransactions] = await Promise.all([
    getFinancialSummary(baseDate),
    getRevenueChartData(baseDate),
    getRecentTransactions(baseDate)
  ]);

  const now = baseDate;
  const dateFormatter = new Intl.DateTimeFormat('ku-IQ', { day: 'numeric', month: 'long', year: 'numeric' });
  const monthFormatter = new Intl.DateTimeFormat('ku-IQ', { month: 'long', year: 'numeric' });
  
  const todayStr = dateFormatter.format(now);
  const sevenDaysAgo = new Date(now);
  sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
  const weekStr = `${dateFormatter.format(sevenDaysAgo)} - ${todayStr}`;
  const monthStr = monthFormatter.format(now);
  const yearStr = now.getFullYear().toString();

  const formatChange = (changeVal: string | number, periodKey: string) => {
    // Determine sign
    const val = typeof changeVal === 'string' ? parseFloat(changeVal) : changeVal;
    if (isNaN(val) || val === 0) return `0% ${t(periodKey)}`;
    const sign = val > 0 ? '+' : '';
    return `${sign}${val}% ${t(periodKey)}`;
  };

  const stats = [
    { title: t('totalBalance'), value: summary.totalBalance, change: formatChange(summary.changes.totalBalance, 'fromLastMonth'), isPositive: parseFloat(summary.changes.totalBalance as string) >= 0, Icon: Wallet },
    { title: t('income'), value: summary.totalIncome, change: formatChange(summary.changes.totalIncome, 'fromLastMonth'), isPositive: parseFloat(summary.changes.totalIncome as string) >= 0, Icon: TrendingUp },
    { title: t('expenses'), value: summary.totalExpenses, change: formatChange(summary.changes.totalExpenses, 'fromLastMonth'), isPositive: parseFloat(summary.changes.totalExpenses as string) >= 0, Icon: TrendingDown },
    { title: t('profit'), value: summary.netProfit, change: formatChange(summary.changes.netProfit, 'fromLastMonth'), isPositive: parseFloat(summary.changes.netProfit as string) >= 0, Icon: DollarSign },
    { title: t('dailyProfit'), value: summary.dailyProfit, change: todayStr, isPositive: true, Icon: DollarSign },
    { title: t('weeklyProfit'), value: summary.weeklyProfit, change: weekStr, isPositive: true, Icon: DollarSign },
    { title: t('monthlyProfit'), value: summary.monthlyProfit, change: monthStr, isPositive: true, Icon: DollarSign },
    { title: t('yearlyProfit'), value: summary.yearlyProfit, change: yearStr, isPositive: true, Icon: DollarSign },
    { title: t('cashFlow'), value: summary.cashFlow, change: formatChange(summary.changes.netProfit, 'fromLastMonth'), isPositive: true, Icon: Activity },
    { title: t('outstandingReceivables'), value: summary.outstandingReceivables, change: formatChange(summary.changes.outstandingReceivables, 'fromLastMonth'), isPositive: parseFloat(summary.changes.outstandingReceivables as string) <= 0, Icon: FileText, href: `/${locale}/invoices` },
    { title: t('outstandingPayables'), value: summary.outstandingPayables, change: formatChange(summary.changes.outstandingPayables, 'fromLastMonth'), isPositive: parseFloat(summary.changes.outstandingPayables as string) <= 0, Icon: CreditCard, href: `/${locale}/purchases` },
  ];

  return (
    <div className={styles.container}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
        <h1 className={styles.pageTitle} style={{ marginBottom: 0 }}>{t('title')}</h1>
        <DashboardFilter />
      </div>

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
        <div className={`card ${styles.mainChart}`} style={{ padding: '1.5rem', backgroundColor: 'var(--color-surface)', borderRadius: 'var(--radius-lg)', border: '1px solid var(--color-border)', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.05)' }}>
          <RevenueChart data={chartData} title={t('revenueOverview')} />
        </div>
        <div className={`card ${styles.sideChart}`} style={{ padding: '1.5rem', backgroundColor: 'var(--color-surface)', borderRadius: 'var(--radius-lg)', border: '1px solid var(--color-border)', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.05)' }}>
          <RecentTransactions transactions={recentTransactions} title={t('recentTransactions')} viewAllText={t('viewAll')} />
        </div>
      </div>
    </div>
  );
}
