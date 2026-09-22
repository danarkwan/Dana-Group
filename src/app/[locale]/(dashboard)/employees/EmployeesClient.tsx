'use client';
import { toast } from 'sonner';
import { useState } from 'react';
import { Employee, Payroll } from '@prisma/client';
import { createEmployee, updateEmployee, deleteEmployee } from '@/lib/actions/employees';
import { createPayroll, deletePayroll } from '@/lib/actions/payroll';
import EmployeeModal from '@/components/employees/EmployeeModal';
import ConfirmDialog from '@/components/ui/ConfirmDialog';
import { formatCurrencyBoth } from '@/lib/formatters';
import styles from '../customers/customers.module.css'; // Reusing customer styles for grid

export default function EmployeesClient({ initialEmployees, initialPayrolls = [] }: { initialEmployees: Employee[], initialPayrolls?: Payroll[] }) {
  const [employees, setEmployees] = useState<Employee[]>(initialEmployees);
  const [payrolls, setPayrolls] = useState<Payroll[]>(initialPayrolls);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingEmployee, setEditingEmployee] = useState<Employee | undefined>(undefined);
  const [confirmDialog, setConfirmDialog] = useState({ isOpen: false, message: '', onConfirm: () => {} });
  const [payDialog, setPayDialog] = useState({ isOpen: false, employee: null as Employee | null, penaltyAmount: 0 });
  const [undoDialog, setUndoDialog] = useState({ isOpen: false, payrollId: '', employeeName: '' });

  function handleOpenModal(employee?: Employee) {
    setEditingEmployee(employee);
    setIsModalOpen(true);
  }

  function handleCloseModal() {
    setIsModalOpen(false);
    setEditingEmployee(undefined);
  }

  async function handleSave(formData: FormData) {
    const data = {
      fullName: formData.get('fullName') as string,
      employeeId: formData.get('employeeId') as string,
      phone: formData.get('phone') as string,
      jobPosition: formData.get('jobPosition') as string,
      department: formData.get('department') as string,
      salaryType: formData.get('salaryType') as string,
      baseSalary: parseFloat(formData.get('baseSalary') as string) || 0,
      notes: formData.get('notes') as string,
      isActive: formData.get('isActive') === 'true',
    };

    try {
      if (editingEmployee) {
        const result = await updateEmployee(editingEmployee.id, data);
        setEmployees(employees.map(e => e.id === result.id ? result : e));
        toast.success("بە سەرکەوتوویی نوێکرایەوە");
      } else {
        const result = await createEmployee(data);
        setEmployees([result, ...employees]);
        toast.success("بە سەرکەوتوویی زیادکرا");
      }
      handleCloseModal();
    } catch (e: any) {
      toast.error(e.message || "هەڵەیەک ڕوویدا");
    }
  }

  function handleDelete(id: string) {
    setConfirmDialog({
      isOpen: true,
      message: "دڵنیای لە سڕینەوەی ئەم کارمەندە؟",
      onConfirm: async () => {
        try {
          await deleteEmployee(id);
          setEmployees(employees.filter(e => e.id !== id));
          toast.success("کارمەند سڕایەوە");
        } catch (e: any) {
          toast.error(e.message || "هەڵەیەک ڕوویدا");
        }
      }
    });
  }

  async function handleQuickPay() {
    if (!payDialog.employee) return;
    
    const now = new Date();
    const period = `${now.getFullYear()}-${(now.getMonth() + 1).toString().padStart(2, '0')}`;
    const finalAmount = payDialog.employee.baseSalary - (payDialog.penaltyAmount || 0);
    const penaltyNote = payDialog.penaltyAmount > 0 ? ` (بڕی غەرامە: ${formatCurrencyBoth(payDialog.penaltyAmount)})` : '';
    
    try {
      const createdPayroll = await createPayroll({
        employeeId: payDialog.employee.id,
        amount: finalAmount,
        period: period,
        method: 'CASH',
        notes: 'پێدانی خێرا لە لیستی کارمەندان' + penaltyNote,
        status: 'PAID'
      });
      
      setPayrolls([createdPayroll, ...payrolls]);
      toast.success("مووچە بە سەرکەوتوویی درا و چووە سەر خەرجییەکان");
      setPayDialog({ isOpen: false, employee: null, penaltyAmount: 0 });
    } catch (e: any) {
      toast.error(e.message || "هەڵەیەک ڕوویدا");
    }
  }

  async function handleUndoPay() {
    if (!undoDialog.payrollId) return;
    try {
      await deletePayroll(undoDialog.payrollId);
      setPayrolls(payrolls.filter(p => p.id !== undoDialog.payrollId));
      toast.success("پێدانی مووچە هەڵوەشێنرایەوە");
      setUndoDialog({ isOpen: false, payrollId: '', employeeName: '' });
    } catch (e: any) {
      toast.error(e.message || "هەڵەیەک ڕوویدا");
    }
  }

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <h1 className={styles.title}>لیستی کارمەندان (Employees)</h1>
        <button className="btn btn-primary" onClick={() => handleOpenModal()}>
          + زیادکردنی کارمەند
        </button>
      </div>

      {employees.length === 0 ? (
        <div className={styles.emptyState}>
          <p>هیچ کارمەندێک نەدۆزرایەوە.</p>
        </div>
      ) : (
        <div className={styles.grid}>
          {employees.map((employee) => {
            const now = new Date();
            const employeePayrolls = payrolls
              .filter(p => p.employeeId === employee.id && p.status === 'PAID')
              .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
            
            const lastPayroll = employeePayrolls.length > 0 ? employeePayrolls[0] : null;
            
            let isPaid = false;
            let statusBadgeText = '';

            if (lastPayroll) {
              const lastPaidDate = new Date(lastPayroll.date);
              
              if (employee.salaryType === 'DAILY') {
                const diffTime = now.getTime() - lastPaidDate.getTime();
                const diffHours = diffTime / (1000 * 60 * 60);
                if (diffHours < 24) {
                  isPaid = true;
                  statusBadgeText = `✓ مووچەی وەرگرتووە (${lastPaidDate.toLocaleDateString('en-GB')})`;
                }
              } else {
                const nextSalaryDate = new Date(lastPaidDate);
                nextSalaryDate.setMonth(nextSalaryDate.getMonth() + 1);
                const diffTime = nextSalaryDate.getTime() - now.getTime();
                const daysLeft = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
                
                if (daysLeft > 0) {
                  isPaid = true;
                  statusBadgeText = `✓ مووچەی وەرگرتووە (ماوە: ${daysLeft} ڕۆژ)`;
                }
              }
            }

            if (!isPaid) {
              statusBadgeText = '⚠️ کاتی مووچەیە (نەدراوە)';
            }

            const statusBadge = (
              <span style={{
                display: 'inline-block', 
                padding: '0.25rem 0.75rem', 
                backgroundColor: isPaid ? '#dcfce7' : '#fee2e2', 
                color: isPaid ? '#166534' : '#991b1b', 
                borderRadius: '1rem', 
                fontSize: '0.8rem', 
                fontWeight: 'bold', 
                marginTop: '0.5rem', 
                border: `1px solid ${isPaid ? '#bbf7d0' : '#fecaca'}`
              }}>
                {statusBadgeText}
              </span>
            );

            return (
            <div key={employee.id} className={`${styles.card} card animate-fade-in`}>
              <div className={styles.cardHeader}>
                <div style={{ display: 'flex', flexDirection: 'column' }}>
                  <h3 className={styles.cardTitle} style={{ marginBottom: 0 }}>{employee.fullName}</h3>
                  {statusBadge}
                </div>
                <div className={styles.actions}>
                  <button className="btn btn-secondary" style={{ padding: '0.25rem 0.5rem', fontSize: '0.75rem' }} onClick={() => handleOpenModal(employee)}>
                    دەستکاری
                  </button>
                  <button className="btn btn-secondary" style={{ padding: '0.25rem 0.5rem', fontSize: '0.75rem', color: 'var(--color-danger)', borderColor: 'var(--color-danger-light)' }} onClick={() => handleDelete(employee.id)}>
                    سڕینەوە
                  </button>
                </div>
              </div>
              
              <div className={styles.infoRow}><strong>ID:</strong> {employee.employeeId}</div>
              {employee.phone && <div className={styles.infoRow}><strong>مۆبایل:</strong> {employee.phone}</div>}
              {employee.jobPosition && <div className={styles.infoRow}><strong>پۆست:</strong> {employee.jobPosition}</div>}
              {employee.department && <div className={styles.infoRow}><strong>بەش:</strong> {employee.department}</div>}
              <div className={styles.infoRow}><strong>باری کارمەند:</strong> {employee.isActive ? 'چالاک' : 'ناچالاک'}</div>
              
              <div className={styles.statsRow} style={{ marginTop: '1rem', paddingTop: '1rem', borderTop: '1px solid var(--color-border)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '0.5rem' }}>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
                  <span style={{ fontSize: '0.75rem', color: 'var(--color-text-light)' }}>
                    مووچە ({employee.salaryType === 'MONTHLY' ? 'مانگانە' : 'ڕۆژانە'})
                  </span>
                  <span className={styles.statBadge} style={{ alignSelf: 'flex-start' }}>
                    {formatCurrencyBoth(employee.baseSalary)}
                  </span>
                </div>
                {!isPaid ? (
                  <button 
                    className="btn btn-primary" 
                    style={{ 
                      padding: '0.4rem 0.75rem', 
                      fontSize: '0.85rem', 
                      backgroundColor: 'var(--color-success)', 
                      color: 'white', 
                      borderColor: 'var(--color-success)',
                      whiteSpace: 'nowrap',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '0.25rem',
                      boxShadow: '0 2px 4px rgba(16, 185, 129, 0.2)'
                    }} 
                    onClick={() => setPayDialog({ isOpen: true, employee, penaltyAmount: 0 })}
                  >
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect width="20" height="12" x="2" y="6" rx="2"/><circle cx="12" cy="12" r="2"/><path d="M6 12h.01M18 12h.01"/></svg>
                    پێدانی مووچە
                  </button>
                ) : (
                  lastPayroll && (
                    <button 
                      className="btn btn-secondary" 
                      style={{ 
                        padding: '0.4rem 0.75rem', 
                        fontSize: '0.85rem', 
                        color: 'var(--color-danger)', 
                        borderColor: 'var(--color-danger-light)',
                        whiteSpace: 'nowrap',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '0.25rem'
                      }} 
                      onClick={() => setUndoDialog({ isOpen: true, payrollId: lastPayroll.id, employeeName: employee.fullName })}
                    >
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8"/><path d="M3 3v5h5"/></svg>
                      پاشگەزبوونەوە
                    </button>
                  )
                )}
              </div>
            </div>
          );
        })}
        </div>
      )}

      <EmployeeModal
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        onSave={handleSave}
        employee={editingEmployee}
      />
      
      <ConfirmDialog
        isOpen={confirmDialog.isOpen}
        message={confirmDialog.message}
        onConfirm={confirmDialog.onConfirm}
        onCancel={() => setConfirmDialog(p => ({ ...p, isOpen: false }))}
      />
      
      {payDialog.isOpen && payDialog.employee && (
        <div className="modalOverlay" onClick={() => setPayDialog({ isOpen: false, employee: null, penaltyAmount: 0 })} style={{ zIndex: 9999 }}>
          <div className="modalContent animate-fade-in" onClick={e => e.stopPropagation()} style={{ maxWidth: '400px' }}>
            <h3 className="modalTitle" style={{ marginBottom: '1rem', color: 'var(--color-success)' }}>
              پێدانی مووچە
            </h3>
            <p style={{ marginBottom: '1.5rem', color: 'var(--text-secondary, #4b5563)', lineHeight: '1.5' }}>
              دڵنیای کە دەتەوێت مووچە بدەیت بە <strong>{payDialog.employee.fullName}</strong>؟
              (ئەمە ڕاستەوخۆ پارەکە لە باڵانس دەبڕێت و دەیخاتە سەر خەرجییەکان)
            </p>
            
            <div className="formGroup" style={{ marginBottom: '1.5rem' }}>
              <label className="formLabel">مووچەی بنەڕەتی:</label>
              <div style={{ padding: '0.5rem', backgroundColor: 'var(--color-bg-secondary)', borderRadius: '0.5rem', fontWeight: 'bold' }}>
                {formatCurrencyBoth(payDialog.employee.baseSalary)}
              </div>
            </div>

            <div className="formGroup" style={{ marginBottom: '1.5rem' }}>
              <label className="formLabel">بڕی غەرامە (لێبڕین):</label>
              <input 
                type="number" 
                className="formInput" 
                min="0"
                value={payDialog.penaltyAmount || ''} 
                onChange={e => setPayDialog({...payDialog, penaltyAmount: parseFloat(e.target.value) || 0})}
                placeholder="0"
              />
            </div>

            <div className="formGroup" style={{ marginBottom: '2rem' }}>
              <label className="formLabel">کۆی گشتی پێدراو:</label>
              <div style={{ padding: '0.5rem', backgroundColor: '#dcfce7', color: '#166534', borderRadius: '0.5rem', fontWeight: 'bold', border: '1px solid #bbf7d0' }}>
                {formatCurrencyBoth(payDialog.employee.baseSalary - (payDialog.penaltyAmount || 0))}
              </div>
            </div>

            <div className="modalActions" style={{ display: 'flex', gap: '1rem', justifyContent: 'flex-end' }}>
              <button
                type="button"
                className="btn btn-secondary"
                onClick={() => setPayDialog({ isOpen: false, employee: null, penaltyAmount: 0 })}
              >
                پەشیمانبوونەوە
              </button>
              <button
                type="button"
                className="btn btn-primary"
                onClick={handleQuickPay}
                style={{ backgroundColor: 'var(--color-success)', borderColor: 'var(--color-success)' }}
              >
                بەڵێ، مووچەی بدە
              </button>
            </div>
          </div>
        </div>
      )}

      <ConfirmDialog
        isOpen={undoDialog.isOpen}
        message={`دڵنیای کە دەتەوێت پێدانی مووچەی کارمەند (${undoDialog.employeeName}) هەڵبوەشێنیتەوە؟ (ئەمە پارەکە دەگەڕێنێتەوە بۆ باڵانس)`}
        onConfirm={handleUndoPay}
        onCancel={() => setUndoDialog({ isOpen: false, payrollId: '', employeeName: '' })}
        intent="danger"
        confirmText="بەڵێ، هەڵیوەشێنەوە"
      />
    </div>
  );
}
