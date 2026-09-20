'use client';
import { toast } from 'sonner';
import { useState, useEffect } from 'react';
import { Supplier } from '@prisma/client';
import { createSupplier, updateSupplier, deleteSupplier } from '@/lib/actions/suppliers';
import styles from '../customers/customers.module.css'; // Reusing customer styles
import { useSearchParams, useRouter, usePathname } from 'next/navigation';
import Link from 'next/link';
import SupplierModal from '@/components/suppliers/SupplierModal';
import ConfirmDialog from '@/components/ui/ConfirmDialog';

type SupplierWithCount = Supplier & {
  _count: {
    purchases: number;
  };
};

type SuppliersClientProps = {
  initialSuppliers: SupplierWithCount[];
  translations: {
    title: string;
    addSupplier: string;
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
    totalPurchases: string;
  };
};

export default function SuppliersClient({ initialSuppliers, translations }: SuppliersClientProps) {
  const searchParams = useSearchParams()
  const router = useRouter()
  const pathname = usePathname()
  
  const [suppliers, setSuppliers] = useState<SupplierWithCount[]>(initialSuppliers);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingSupplier, setEditingSupplier] = useState<Supplier | undefined>(undefined);
  const [confirmDialog, setConfirmDialog] = useState({ isOpen: false, message: '', onConfirm: () => {} });

  useEffect(() => {
    const action = searchParams.get('action')
    if (action === 'add-supplier') {
      setIsModalOpen(true)
      router.replace(pathname, { scroll: false })
    }
  }, [searchParams, pathname, router])

  function handleOpenModal(supplier?: Supplier) {
    setEditingSupplier(supplier);
    setIsModalOpen(true);
  }

  function handleCloseModal() {
    setIsModalOpen(false);
    setEditingSupplier(undefined);
  }

  async function handleSave(formData: FormData) {
    if (editingSupplier) {
      const result = await updateSupplier(editingSupplier.id, formData);
      if (result.success && result.supplier) {
        setSuppliers(suppliers.map(s => 
          s.id === result.supplier!.id 
            ? { ...result.supplier!, _count: s._count } 
            : s
        ));
        handleCloseModal();
      } else {
        toast.error(result.error);
      }
    } else {
      const result = await createSupplier(formData);
      if (result.success && result.supplier) {
        setSuppliers([{ ...result.supplier!, _count: { purchases: 0 } }, ...suppliers]);
        handleCloseModal();
      } else {
        toast.error(result.error);
      }
    }
  }

  function handleDelete(id: string) {
    setConfirmDialog({
      isOpen: true,
      message: translations.deleteConfirm,
      onConfirm: async () => {
        const result = await deleteSupplier(id);
        if (result.success) {
          setSuppliers(suppliers.filter(s => s.id !== id));
        } else {
          toast.error(result.error);
        }
      }
    });
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
          {translations.addSupplier}
        </button>
      </div>

      {suppliers.length === 0 ? (
        <div className={styles.emptyState}>
          <p>{translations.emptyState}</p>
        </div>
      ) : (
        <div className={styles.grid}>
          {suppliers.map((supplier) => (
            <div key={supplier.id} className={`${styles.card} card animate-fade-in`}>
              <div className={styles.cardHeader}>
                <Link href={`/${pathname.split('/')[1]}/suppliers/${supplier.id}`} style={{textDecoration: 'none', color: 'inherit'}}>
                  <h3 className={styles.cardTitle}>{supplier.name}</h3>
                </Link>
                <div className={styles.actions}>
                  <Link 
                    href={`/${pathname.split('/')[1]}/suppliers/${supplier.id}`}
                    className="btn btn-primary"
                    style={{ padding: '0.25rem 0.5rem', fontSize: '0.75rem' }}
                  >
                    Profile
                  </Link>
                  <button 
                    className="btn btn-secondary"
                    style={{ padding: '0.25rem 0.5rem', fontSize: '0.75rem' }}
                    onClick={() => handleOpenModal(supplier)}
                  >
                    {translations.edit}
                  </button>
                  <button 
                    className="btn btn-secondary"
                    style={{ padding: '0.25rem 0.5rem', fontSize: '0.75rem', color: 'var(--color-danger)', borderColor: 'var(--color-danger-light)' }}
                    onClick={() => handleDelete(supplier.id)}
                  >
                    {translations.delete}
                  </button>
                </div>
              </div>
              
              {supplier.phone && (
                <div className={styles.infoRow}>
                  <svg className={styles.infoIcon} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"></path>
                  </svg>
                  {supplier.phone}
                </div>
              )}

              {supplier.email && (
                <div className={styles.infoRow}>
                  <svg className={styles.infoIcon} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"></path>
                    <polyline points="22,6 12,13 2,6"></polyline>
                  </svg>
                  {supplier.email}
                </div>
              )}

              {supplier.address && (
                <div className={styles.infoRow}>
                  <svg className={styles.infoIcon} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"></path>
                    <circle cx="12" cy="10" r="3"></circle>
                  </svg>
                  {supplier.address}
                </div>
              )}

              <div className={styles.statsRow}>
                <span className={styles.infoRow} style={{ marginBottom: 0 }}>
                  {translations.totalPurchases}
                </span>
                <span className={styles.statBadge}>
                  {supplier._count.purchases}
                </span>
              </div>
            </div>
          ))}
        </div>
      )}

      <SupplierModal
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        onSave={handleSave}
        supplier={editingSupplier}
        translations={translations}
      />
      <ConfirmDialog
        isOpen={confirmDialog.isOpen}
        message={confirmDialog.message}
        onConfirm={confirmDialog.onConfirm}
        onCancel={() => setConfirmDialog(p => ({ ...p, isOpen: false }))}
      />
    </div>
  );
}
