import React from 'react';
import Link from 'next/link';
import { PlusCircle, ArrowUpRight, ArrowDownRight, Users, Truck, FileText, CreditCard } from 'lucide-react';
import styles from './QuickActions.module.css';
import { getTranslations } from 'next-intl/server';

export default async function QuickActions({ locale }: { locale: string }) {
  const t = await getTranslations('Dashboard');
  
  const actions = [
    { label: t('addIncome'), icon: ArrowUpRight, href: `/${locale}/transactions?action=add-income`, color: 'var(--color-success)' },
    { label: t('addExpense'), icon: ArrowDownRight, href: `/${locale}/transactions?action=add-expense`, color: 'var(--color-danger)' },
    { label: t('addCustomer'), icon: Users, href: `/${locale}/customers?action=add-customer`, color: 'var(--color-primary)' },
    { label: t('addSupplier'), icon: Truck, href: `/${locale}/suppliers?action=add-supplier`, color: 'var(--color-secondary)' },
    { label: t('createInvoice'), icon: FileText, href: `/${locale}/invoices/create`, color: 'var(--color-info)' },
    { label: t('addPayment'), icon: CreditCard, href: `/${locale}/transactions?action=add-income`, color: 'var(--color-warning)' },
  ];

  return (
    <div className={styles.container}>
      <h2 className={styles.title}>{t('quickActions')}</h2>
      <div className={styles.grid}>
        {actions.map((action, i) => {
          const Icon = action.icon;
          return (
            <Link key={i} href={action.href} className={styles.actionCard}>
              <div className={styles.iconWrapper} style={{ backgroundColor: action.color + '20', color: action.color }}>
                <Icon size={24} />
              </div>
              <span className={styles.label}>{action.label}</span>
            </Link>
          )
        })}
      </div>
    </div>
  )
}
