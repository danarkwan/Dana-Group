import { getTranslations } from 'next-intl/server';
import { getCustomers } from '@/lib/actions/customers';
import CustomersClient from './CustomersClient';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { hasAccess } from '@/lib/permissions';
import { redirect } from 'next/navigation';
import Pagination from '@/components/ui/Pagination';
import CustomersFilter from './CustomersFilter';

export default async function CustomersPage({ 
  params,
  searchParams
}: { 
  params: Promise<{ locale: string }>,
  searchParams: { page?: string, query?: string }
}) {
  const { locale } = await params;
  const session = await getServerSession(authOptions);
  if (!hasAccess(session?.user, 'customers')) {
    redirect(`/${locale}`);
  }
  
  const page = Number(searchParams.page) || 1;
  const take = 20;
  const skip = (page - 1) * take;

  const t = await getTranslations('Customers');
  const { customers: initialCustomers, totalCount } = await getCustomers(searchParams.query, skip, take);

  const totalPages = Math.ceil(totalCount / take);

  const translations = {
    title: t('title'),
    addCustomer: t('addCustomer'),
    name: t('name'),
    email: t('email'),
    phone: t('phone'),
    address: t('address'),
    save: t('save'),
    cancel: t('cancel'),
    delete: t('delete'),
    edit: t('edit'),
    deleteConfirm: t('deleteConfirm'),
    emptyState: t('emptyState'),
    totalInvoices: t('totalInvoices'),
  };

  return (
    <>
      <CustomersFilter />
      <CustomersClient 
        initialCustomers={initialCustomers} 
        translations={translations} 
      />
      <Pagination totalPages={totalPages} />
    </>
  );
}
