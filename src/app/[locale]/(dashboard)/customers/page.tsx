import { getTranslations } from 'next-intl/server';
import { getCustomers } from '@/lib/actions/customers';
import CustomersClient from './CustomersClient';

export default async function CustomersPage() {
  const t = await getTranslations('Customers');
  const initialCustomers = await getCustomers();

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
    <CustomersClient 
      initialCustomers={initialCustomers} 
      translations={translations} 
    />
  );
}
