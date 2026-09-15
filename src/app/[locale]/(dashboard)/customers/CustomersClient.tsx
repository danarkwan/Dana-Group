'use client';

import { useState } from 'react';
import { Customer } from '@prisma/client';
import { createCustomer, updateCustomer, deleteCustomer } from '@/lib/actions/customers';
import styles from './customers.module.css';
import CustomerModal from '@/components/customers/CustomerModal';

type CustomerWithCount = Customer & {
  _count: {
    invoices: number;
  };
};

type CustomersClientProps = {
  initialCustomers: CustomerWithCount[];
  translations: {
    title: string;
    addCustomer: string;
    name: string;
    email: string;
    phone: string;
    address: string;
    save: string;
    cancel: string;
    delete: string;
    edit: string;
    deleteConfirm: string;
    emptyState: string;
    totalInvoices: string;
  };
};

export default function CustomersClient({ initialCustomers, translations }: CustomersClientProps) {
  const [customers, setCustomers] = useState<CustomerWithCount[]>(initialCustomers);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingCustomer, setEditingCustomer] = useState<Customer | undefined>(undefined);

  function handleOpenModal(customer?: Customer) {
    setEditingCustomer(customer);
    setIsModalOpen(true);
  }

  function handleCloseModal() {
    setIsModalOpen(false);
    setEditingCustomer(undefined);
  }

  async function handleSave(formData: FormData) {
    if (editingCustomer) {
      const result = await updateCustomer(editingCustomer.id, formData);
      if (result.success && result.customer) {
        setCustomers(customers.map(c => 
          c.id === result.customer!.id 
            ? { ...result.customer!, _count: c._count } 
            : c
        ));
        handleCloseModal();
      } else {
        alert(result.error);
      }
    } else {
      const result = await createCustomer(formData);
      if (result.success && result.customer) {
        setCustomers([{ ...result.customer!, _count: { invoices: 0 } }, ...customers]);
        handleCloseModal();
      } else {
        alert(result.error);
      }
    }
  }

  async function handleDelete(id: string) {
    if (confirm(translations.deleteConfirm)) {
      const result = await deleteCustomer(id);
      if (result.success) {
        setCustomers(customers.filter(c => c.id !== id));
      } else {
        alert(result.error);
      }
    }
  }

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <h1 className={styles.title}>{translations.title}</h1>
        <button 
          className="btn btn-primary"
          onClick={() => handleOpenModal()}
        >
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <line x1="12" y1="5" x2="12" y2="19"></line>
            <line x1="5" y1="12" x2="19" y2="12"></line>
          </svg>
          {translations.addCustomer}
        </button>
      </div>

      {customers.length === 0 ? (
        <div className={styles.emptyState}>
          <p>{translations.emptyState}</p>
        </div>
      ) : (
        <div className={styles.grid}>
          {customers.map((customer) => (
            <div key={customer.id} className={`${styles.card} card animate-fade-in`}>
              <div className={styles.cardHeader}>
                <h3 className={styles.cardTitle}>{customer.name}</h3>
                <div className={styles.actions}>
                  <button 
                    className="btn btn-secondary"
                    style={{ padding: '0.25rem 0.5rem', fontSize: '0.75rem' }}
                    onClick={() => handleOpenModal(customer)}
                  >
                    {translations.edit}
                  </button>
                  <button 
                    className="btn btn-secondary"
                    style={{ padding: '0.25rem 0.5rem', fontSize: '0.75rem', color: 'var(--color-danger)', borderColor: 'var(--color-danger-light)' }}
                    onClick={() => handleDelete(customer.id)}
                  >
                    {translations.delete}
                  </button>
                </div>
              </div>
              
              {customer.phone && (
                <div className={styles.infoRow}>
                  <svg className={styles.infoIcon} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"></path>
                  </svg>
                  {customer.phone}
                </div>
              )}

              {customer.email && (
                <div className={styles.infoRow}>
                  <svg className={styles.infoIcon} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"></path>
                    <polyline points="22,6 12,13 2,6"></polyline>
                  </svg>
                  {customer.email}
                </div>
              )}

              {customer.address && (
                <div className={styles.infoRow}>
                  <svg className={styles.infoIcon} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"></path>
                    <circle cx="12" cy="10" r="3"></circle>
                  </svg>
                  {customer.address}
                </div>
              )}

              <div className={styles.statsRow}>
                <span className={styles.infoRow} style={{ marginBottom: 0 }}>
                  {translations.totalInvoices}
                </span>
                <span className={styles.statBadge}>
                  {customer._count.invoices}
                </span>
              </div>
            </div>
          ))}
        </div>
      )}

      <CustomerModal
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        onSave={handleSave}
        customer={editingCustomer}
        translations={translations}
      />
    </div>
  );
}
