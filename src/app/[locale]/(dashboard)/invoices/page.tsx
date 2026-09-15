import { getTranslations } from 'next-intl/server'
import { PrismaClient } from '@prisma/client'
import Link from 'next/link'
import { FileText, CheckCircle, Clock, AlertCircle, Plus } from 'lucide-react'
import { formatCurrencyBoth } from '@/lib/formatters'
import styles from './invoices.module.css'
import InvoiceRowActions from './InvoiceRowActions'

const prisma = new PrismaClient()

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params
  const t = await getTranslations({ locale, namespace: 'Invoices' })
  return { title: `${t('title')} | Dana Group` }
}

export default async function InvoicesPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params
  const invoices = await prisma.invoice.findMany({
    include: { customer: true },
    orderBy: { createdAt: 'desc' }
  })
  
  const total = invoices.length
  const paid = invoices.filter(i => i.status === 'PAID').length
  const unpaid = invoices.filter(i => i.status === 'PENDING').length
  const overdue = invoices.filter(i => i.status === 'OVERDUE' || (i.status === 'PENDING' && i.dueDate < new Date())).length
  const partial = invoices.filter(i => i.status === 'PARTIAL').length

  const totalValue = invoices.reduce((sum, inv) => sum + inv.total, 0)
  const outstandingValue = invoices.reduce((sum, inv) => sum + inv.remainingBalance, 0)

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <h1 className={styles.title}>
          <ClientTranslate id="Invoices.title" />
        </h1>
        <Link 
          href={`/${locale}/invoices/create`} 
          className="btn btn-primary"
        >
          <Plus size={20} />
          <ClientTranslate id="Invoices.create" />
        </Link>
      </div>

      {/* Summary Cards */}
      <div className={styles.statsGrid}>
        <SummaryCard 
          title="Invoices.total" 
          value={total} 
          subtitle={formatCurrencyBoth(totalValue)}
          icon={<FileText size={24} color="var(--color-primary)" />} 
        />
        <SummaryCard 
          title="Invoices.paid" 
          value={paid} 
          subtitle={`+${partial} Partial`}
          icon={<CheckCircle size={24} color="var(--color-success)" />} 
        />
        <SummaryCard 
          title="Invoices.unpaid" 
          value={unpaid} 
          subtitle={`${formatCurrencyBoth(outstandingValue)} remaining`}
          icon={<Clock size={24} color="var(--color-warning)" />} 
        />
        <SummaryCard 
          title="Invoices.overdue" 
          value={overdue} 
          subtitle="Action needed"
          icon={<AlertCircle size={24} color="var(--color-danger)" />} 
        />
      </div>

      {/* Invoices Table */}
      <div className={`card ${styles.tableContainer}`}>
        <table className={styles.table}>
          <thead>
            <tr>
              <th><ClientTranslate id="Invoices.invoiceNumber" /></th>
              <th><ClientTranslate id="Invoices.customer" /></th>
              <th><ClientTranslate id="Invoices.date" /></th>
              <th><ClientTranslate id="Invoices.amount" /></th>
              <th><ClientTranslate id="Invoices.status" /></th>
              <th style={{ textAlign: 'center' }}><ClientTranslate id="Invoices.actions" /></th>
            </tr>
          </thead>
          <tbody>
            {invoices.length > 0 ? invoices.map((invoice) => (
              <tr key={invoice.id}>
                <td style={{ fontWeight: 600 }}>
                  {invoice.invoiceNumber}
                </td>
                <td>
                  {invoice.customer?.name || invoice.customerName || 'Walk-in Customer'}
                </td>
                <td>
                  {new Date(invoice.date).toLocaleDateString(locale)}
                </td>
                <td style={{ fontWeight: 600 }}>
                  {formatCurrencyBoth(invoice.total)}
                </td>
                <td>
                  <StatusBadge status={invoice.status} />
                </td>
                <td style={{ textAlign: 'center' }}>
                  <InvoiceRowActions 
                    invoiceId={invoice.id} 
                    locale={locale} 
                    status={invoice.status} 
                    remainingBalance={invoice.remainingBalance} 
                  />
                </td>
              </tr>
            )) : (
              <tr>
                <td colSpan={6} style={{ textAlign: 'center', padding: 'var(--spacing-2xl)', color: 'var(--color-text-muted)' }}>
                  No invoices found.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
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
      <ClientTranslate id={`Invoices.${status.toLowerCase()}`} />
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
  const t = await getServerTranslations(namespace || 'Invoices')
  return <>{t(key || id)}</>
}
