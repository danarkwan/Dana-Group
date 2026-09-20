import { getTranslations } from 'next-intl/server';
import { getSuppliers } from '@/lib/actions/suppliers';
import SuppliersClient from './SuppliersClient';

import { redirect } from 'next/navigation';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';
import { hasAccess } from '@/lib/permissions';
import Pagination from '@/components/ui/Pagination';
import SuppliersFilter from './SuppliersFilter';

export default async function SuppliersPage({ 
  params,
  searchParams
}: { 
  params: Promise<{ locale: string }>,
  searchParams: { page?: string, query?: string }
}) {
  const session = await getServerSession(authOptions);
  if (!session || !hasAccess(session.user, 'suppliers')) {
    redirect(`/en/auth/signin`);
  }

  const page = Number(searchParams.page) || 1;
  const take = 20;
  const skip = (page - 1) * take;

  const t = await getTranslations('Suppliers');
  const { suppliers: initialSuppliers, totalCount } = await getSuppliers(searchParams.query, skip, take);

  const totalPages = Math.ceil(totalCount / take);

  const translations = {
    title: t('title'),
    addSupplier: t('addSupplier'),
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
    totalPurchases: t('totalPurchases'),
  };

  return (
    <>
      <SuppliersFilter />
      <SuppliersClient 
        initialSuppliers={initialSuppliers} 
        translations={translations} 
      />
      <Pagination totalPages={totalPages} />
    </>
  );
}
