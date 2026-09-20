import { redirect } from 'next/navigation';
import { hasAccess } from '@/lib/permissions';
import { authOptions } from '@/lib/auth';
import { getServerSession } from 'next-auth/next';
import { getTranslations } from 'next-intl/server'
import { prisma } from '@/lib/prisma';
import Link from 'next/link'
import { ShoppingBag, CreditCard, Clock, AlertCircle, Plus } from 'lucide-react'
import { formatCurrencyBoth } from '@/lib/formatters'
import styles from './purchases.module.css'
import PurchaseRowActions from './PurchaseRowActions'
import Pagination from '@/components/ui/Pagination'
import PurchasesFilter from './PurchasesFilter'


export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params
  const t = await getTranslations({ locale, namespace: 'Purchases' })
  return { title: `${t('title')} | Dana Group` }
}

export default async function PurchasesPage({ 
  params,
  searchParams
}: { 
  params: Promise<{ locale: string }>,
  searchParams: { page?: string, query?: string, status?: string }
}) {
  const session = await getServerSession(authOptions);
  const { locale } = await params;
  if (!session || !hasAccess(session.user, 'inventory')) {
    redirect(`/${locale}/auth/signin`);
  }

  const page = Number(searchParams.page) || 1;
  const take = 20;
  const skip = (page - 1) * take;

  const where: any = {};
  if (searchParams.query) {
    where.OR = [
      { purchaseNumber: { contains: searchParams.query, mode: 'insensitive' } },
      { supplier: { name: { contains: searchParams.query, mode: 'insensitive' } } }
    ];
  }
  if (searchParams.status && searchParams.status !== 'ALL') {
    where.status = searchParams.status;
  }

  const [purchases, totalCount, statusCounts, sumResult] = await Promise.all([
    prisma.purchase.findMany({
      where,
      include: { supplier: true },
      orderBy: { createdAt: 'desc' },
      skip,
      take
    }),
    prisma.purchase.count({ where }),
    prisma.purchase.groupBy({
      by: ['status'],
      where,
      _count: true
    }),
    prisma.purchase.aggregate({
      where,
      _sum: { total: true, remainingBalance: true }
    })
  ]);

  const totalPages = Math.ceil(totalCount / take);
  
  let paid = 0, unpaid = 0, overdue = 0, partial = 0;
  statusCounts.forEach(s => {
    if (s.status === 'PAID') paid = s._count;
    if (s.status === 'PENDING') unpaid = s._count;
    if (s.status === 'OVERDUE') overdue = s._count;
    if (s.status === 'PARTIAL') partial = s._count;
  });

  const totalValue = sumResult._sum.total || 0;
  const outstandingValue = sumResult._sum.remainingBalance || 0;

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <h1 className={styles.title}>
          <ClientTranslate id="Purchases.title" />
        </h1>
        <Link 
          href={`/${locale}/purchases/create`} 
          className="btn btn-primary"
        >
          <Plus size={20} />
          <ClientTranslate id="Purchases.create" />
        </Link>
      </div>

      <div className={styles.statsGrid}>
        <SummaryCard 
          title="Purchases.total" 
          value={totalCount} 
          subtitle={formatCurrencyBoth(totalValue)}
          icon={<ShoppingBag size={24} color="var(--color-primary)" />} 
        />
        <SummaryCard 
          title="Purchases.paid" 
          value={paid} 
          subtitle={`+${partial} Partial`}
          icon={<CreditCard size={24} color="var(--color-success)" />} 
        />
        <SummaryCard 
          title="Purchases.unpaid" 
          value={unpaid} 
          subtitle={`${formatCurrencyBoth(outstandingValue)} remaining`}
          icon={<Clock size={24} color="var(--color-warning)" />} 
        />
        <SummaryCard 
          title="Purchases.overdue" 
          value={overdue} 
          subtitle="Action needed"
          icon={<AlertCircle size={24} color="var(--color-danger)" />} 
        />
      </div>

      <PurchasesFilter />

      <div className={`card ${styles.tableContainer}`}>
        <table className={styles.table}>
          <thead>
            <tr>
              <th><ClientTranslate id="Purchases.purchaseNumber" /></th>
              <th><ClientTranslate id="Purchases.supplier" /></th>
              <th><ClientTranslate id="Purchases.date" /></th>
              <th><ClientTranslate id="Purchases.amount" /></th>
              <th><ClientTranslate id="Purchases.status" /></th>
              <th style={{ textAlign: 'center' }}><ClientTranslate id="Purchases.actions" /></th>
            </tr>
          </thead>
          <tbody>
            {purchases.length > 0 ? purchases.map((purchase) => (
              <tr key={purchase.id}>
                <td style={{ fontWeight: 600 }}>
                  {purchase.purchaseNumber || 'N/A'}
                </td>
                <td>
                  {purchase.supplier?.name || 'Walk-in Supplier'}
                </td>
                <td>
                  {new Date(purchase.date).toLocaleDateString(locale)}
                </td>
                <td style={{ fontWeight: 600 }}>
                  {formatCurrencyBoth(purchase.total)}
                </td>
                <td>
                  <StatusBadge status={purchase.status} />
                </td>
                <td style={{ textAlign: 'center' }}>
                  <PurchaseRowActions 
                    purchaseId={purchase.id} 
                    locale={locale} 
                    status={purchase.status} 
                    remainingBalance={purchase.remainingBalance} 
                  />
                </td>
              </tr>
            )) : (
              <tr>
                <td colSpan={6} style={{ textAlign: 'center', padding: 'var(--spacing-2xl)', color: 'var(--color-text-muted)' }}>
                  No purchases found.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      <Pagination totalPages={totalPages} />
    </div>
  )
}

function StatusBadge({ status }: { status: string }) {
  let badgeClass = styles.statusPending
  if (status === 'PAID') badgeClass = styles.statusPaid
  else if (status === 'PARTIAL') badgeClass = styles.statusPartial
  else if (status === 'OVERDUE') badgeClass = styles.statusOverdue
  
  return (
    <span className={`${styles.statusBadge} ${badgeClass}`}>
      <ClientTranslate id={`Purchases.${status.toLowerCase()}`} />
    </span>
  )
}

function SummaryCard({ title, value, subtitle, icon }: { title: string, value: number, subtitle?: string, icon: React.ReactNode }) {
  return (
    <div className="card" style={{ display: 'flex', alignItems: 'flex-start', gap: 'var(--spacing-md)' }}>
      <div style={{ padding: 'var(--spacing-sm)', backgroundColor: 'var(--color-surface-hover)', borderRadius: 'var(--radius-md)' }}>
        {icon}
      </div>
      <div>
        <p style={{ fontSize: '0.875rem', fontWeight: 500, color: 'var(--color-text-muted)' }}>
          <ClientTranslate id={title} />
        </p>
        <h3 style={{ fontSize: '1.5rem', fontWeight: 700, margin: 'var(--spacing-xs) 0' }}>{value}</h3>
        {subtitle && (
          <p style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)' }}>{subtitle}</p>
        )}
      </div>
    </div>
  )
}

import { getTranslations as getServerTranslations } from 'next-intl/server'
async function ClientTranslate({ id }: { id: string }) {
  const [namespace, key] = id.split('.')
  const t = await getServerTranslations(namespace || 'Purchases')
  return <>{t(key || id)}</>
}
