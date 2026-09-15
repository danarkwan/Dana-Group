import { getTranslations } from 'next-intl/server';
import { getSuppliers } from '@/lib/actions/suppliers';
import SuppliersClient from './SuppliersClient';

export default async function SuppliersPage() {
  const t = await getTranslations('Suppliers');
  const initialSuppliers = await getSuppliers();

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
    <SuppliersClient 
      initialSuppliers={initialSuppliers} 
      translations={translations} 
    />
  );
}
