'use client';
import { toast } from 'sonner';
import { useState } from 'react';
import { Employee, Payroll } from '@prisma/client';
import { createPayroll, updatePayroll, deletePayroll, markPayrollPaid } from '@/lib/actions/payroll';
import PayrollModal from '@/components/payroll/PayrollModal';
import ConfirmDialog from '@/components/ui/ConfirmDialog';
import { formatCurrencyBoth } from '@/lib/formatters';
import styles from '../customers/customers.module.css';

type PayrollWithEmployee = Payroll & { employee: Employee };

export default function PayrollClient({ initialPayrolls, employees }: { initialPayrolls: PayrollWithEmployee[], employees: Employee[] }) {
  const [payrolls, setPayrolls] = useState<PayrollWithEmployee[]>(initialPayrolls);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingPayroll, setEditingPayroll] = useState<PayrollWithEmployee | undefined>(undefined);
  const [confirmDialog, setConfirmDialog] = useState({ isOpen: false, message: '', onConfirm: () => {} });

  function handleOpenModal(payroll?: PayrollWithEmployee) {
    setEditingPayroll(payroll);
    setIsModalOpen(true);
  }

  function handleCloseModal() {
    setIsModalOpen(false);
    setEditingPayroll(undefined);
  }

  async function handleSave(formData: FormData) {
    const data = {
      employeeId: formData.get('employeeId') as string,
      amount: parseFloat(formData.get('amount') as string) || 0,
      period: formData.get('period') as string,
      method: formData.get('method') as string,
      notes: formData.get('notes') as string,
      status: formData.get('status') as string,
    };

    try {
      if (editingPayroll) {
        const result = await updatePayroll(editingPayroll.id, data);
        setPayrolls(payrolls.map(p => p.id === result.id ? { ...result, employee: editingPayroll.employee } : p));
        toast.success("بە سەرکەوتوویی نوێکرایەوە");
      } else {
        const result = await createPayroll(data);
        const emp = employees.find(e => e.id === result.employeeId);
        if (emp) {
          setPayrolls([{ ...result, employee: emp }, ...payrolls]);
        }
        toast.success("مووچە بە سەرکەوتوویی زیادکرا");
      }
      handleCloseModal();
    } catch (e: any) {
      toast.error(e.message || "هەڵەیەک ڕوویدا");
    }
  }

  function handleDelete(id: string) {
    setConfirmDialog({
      isOpen: true,
      message: "دڵنیای لە سڕینەوەی ئەم تۆمارە؟ تێبینی: ئەمە گەڕانەوەی بۆ نییە.",
      onConfirm: async () => {
        try {
          await deletePayroll(id);
          setPayrolls(payrolls.filter(p => p.id !== id));
          toast.success("تۆمار سڕایەوە");
        } catch (e: any) {
          toast.error(e.message || "هەڵەیەک ڕوویدا");
        }
      }
    });
  }

  function handleMarkPaid(payroll: PayrollWithEmployee) {
    setConfirmDialog({
      isOpen: true,
      message: `دڵنیای کە مووچەی (${payroll.employee.fullName}) دراوە؟ ئەمە ڕاستەوخۆ دەچێتە سەر خەرجییەکان.`,
      onConfirm: async () => {
        try {
          await markPayrollPaid(payroll.id);
          setPayrolls(payrolls.map(p => p.id === payroll.id ? { ...p, status: 'PAID' } : p));
          toast.success("مووچە وەک دراوە دیاریکرا و چووە سەر خەرجییەکان");
        } catch (e: any) {
          toast.error(e.message || "هەڵەیەک ڕوویدا");
        }
      }
    });
  }

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <h1 className={styles.title}>مووچەکان (Payroll)</h1>
        <button className="btn btn-primary" onClick={() => handleOpenModal()}>
          + پارەدانی نوێ
        </button>
      </div>

      {payrolls.length === 0 ? (
        <div className={styles.emptyState}>
          <p>هیچ تۆمارێکی مووچە نەدۆزرایەوە.</p>
        </div>
      ) : (
        <div className={styles.grid}>
          {payrolls.map((payroll) => (
            <div key={payroll.id} className={`${styles.card} card animate-fade-in`}>
              <div className={styles.cardHeader}>
                <h3 className={styles.cardTitle}>{payroll.employee.fullName}</h3>
                <div className={styles.actions}>
                  {payroll.status === 'PENDING' && (
                    <>
                      <button className="btn btn-secondary" style={{ padding: '0.25rem 0.5rem', fontSize: '0.75rem', backgroundColor: 'var(--color-success)', color: 'white', borderColor: 'var(--color-success)' }} onClick={() => handleMarkPaid(payroll)}>
                        پارەدان
                      </button>
                      <button className="btn btn-secondary" style={{ padding: '0.25rem 0.5rem', fontSize: '0.75rem' }} onClick={() => handleOpenModal(payroll)}>
                        دەستکاری
                      </button>
                    </>
                  )}
                  <button className="btn btn-secondary" style={{ padding: '0.25rem 0.5rem', fontSize: '0.75rem', color: 'var(--color-danger)', borderColor: 'var(--color-danger-light)' }} onClick={() => handleDelete(payroll.id)}>
                    سڕینەوە
                  </button>
                </div>
              </div>
              
              <div className={styles.infoRow}><strong>بەش:</strong> {payroll.employee.department || 'بێ بەش'}</div>
              <div className={styles.infoRow}><strong>مانگ:</strong> {payroll.period}</div>
              <div className={styles.infoRow}><strong>بەروار:</strong> {new Date(payroll.date).toLocaleDateString('ku-IQ')}</div>
              {payroll.notes && <div className={styles.infoRow}><strong>تێبینی:</strong> {payroll.notes}</div>}
              
              <div className={styles.statsRow} style={{ marginTop: '0.5rem' }}>
                <span className={styles.infoRow} style={{ marginBottom: 0 }}>
                  <span style={{
                    display: 'inline-block',
                    padding: '2px 8px',
                    borderRadius: '12px',
                    fontSize: '0.75rem',
                    backgroundColor: payroll.status === 'PAID' ? 'var(--color-success-light)' : 'var(--color-warning-light)',
                    color: payroll.status === 'PAID' ? 'var(--color-success)' : 'var(--color-warning-dark)',
                    marginRight: '8px'
                  }}>
                    {payroll.status === 'PAID' ? 'دراوە' : 'نەدراوە'}
                  </span>
                </span>
                <span className={styles.statBadge}>{formatCurrencyBoth(payroll.amount)}</span>
              </div>
            </div>
          ))}
        </div>
      )}

      <PayrollModal
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        onSave={handleSave}
        payroll={editingPayroll}
        employees={employees}
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
