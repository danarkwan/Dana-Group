import { getTranslations } from 'next-intl/server';
import { getPendingInvoices, getPendingPurchases } from '@/lib/actions/payments';
import PaymentsClient from './PaymentsClient';

import { redirect } from 'next/navigation';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';
import { hasAccess } from '@/lib/permissions';

export default async function PaymentsPage() {
  const session = await getServerSession(authOptions);
  if (!session || !hasAccess(session.user, 'payments')) {
    redirect(`/en/auth/signin`);
  }

  const t = await getTranslations('Dashboard');
  
  const pendingInvoices = await getPendingInvoices();
  const pendingPurchases = await getPendingPurchases();

  return (
    <PaymentsClient 
      pendingInvoices={pendingInvoices} 
      pendingPurchases={pendingPurchases}
      translations={{
        title: 'پارەدانەکان',
        customerPayments: 'وەرگرتنی پارەی کڕیار',
        supplierPayments: 'پێدانی پارەی دابینکار',
        generalPayment: 'مامەڵەی گشتی',
      }}
    />
  );
}
