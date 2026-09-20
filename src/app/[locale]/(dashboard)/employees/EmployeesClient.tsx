'use client';
import { toast } from 'sonner';
import { useState } from 'react';
import { Employee, Payroll } from '@prisma/client';
import { createEmployee, updateEmployee, deleteEmployee } from '@/lib/actions/employees';
import { createPayroll } from '@/lib/actions/payroll';
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
  const [payDialog, setPayDialog] = useState({ isOpen: false, employee: null as Employee | null });

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
    
    try {
      await createPayroll({
        employeeId: payDialog.employee.id,
        amount: payDialog.employee.baseSalary,
        period: period,
        method: 'CASH',
        notes: 'پێدانی خێرا لە لیستی کارمەندان',
        status: 'PAID'
      });
      // We assume the new payroll is added successfully. 
      // Update local payrolls state to reflect the new PAID status.
      setPayrolls([{
        id: 'temp-' + Date.now(),
        employeeId: payDialog.employee.id,
        amount: payDialog.employee.baseSalary,
        period: period,
        method: 'CASH',
        notes: 'پێدانی خێرا لە لیستی کارمەندان',
        status: 'PAID',
        date: new Date()
      } as Payroll, ...payrolls]);
      toast.success("مووچە بە سەرکەوتوویی درا و چووە سەر خەرجییەکان");
      setPayDialog({ isOpen: false, employee: null });
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
            const currentPeriod = `${now.getFullYear()}-${(now.getMonth() + 1).toString().padStart(2, '0')}`;
            const currentPayroll = payrolls.find(p => p.employeeId === employee.id && p.period === currentPeriod);
            
            let statusBadge = null;
            if (currentPayroll?.status === 'PAID') {
              statusBadge = <span style={{display: 'inline-block', padding: '0.25rem 0.75rem', backgroundColor: '#dcfce7', color: '#166534', borderRadius: '1rem', fontSize: '0.8rem', fontWeight: 'bold', marginTop: '0.5rem', border: '1px solid #bbf7d0'}}>✓ مووچەی وەرگرتووە</span>;
            } else {
              statusBadge = <span style={{display: 'inline-block', padding: '0.25rem 0.75rem', backgroundColor: '#fee2e2', color: '#991b1b', borderRadius: '1rem', fontSize: '0.8rem', fontWeight: 'bold', marginTop: '0.5rem', border: '1px solid #fecaca'}}>⚠️ کاتی مووچەیە (نەدراوە)</span>;
            }

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
                {currentPayroll?.status !== 'PAID' && (
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
                    onClick={() => setPayDialog({ isOpen: true, employee })}
                  >
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect width="20" height="12" x="2" y="6" rx="2"/><circle cx="12" cy="12" r="2"/><path d="M6 12h.01M18 12h.01"/></svg>
                    پێدانی مووچە
                  </button>
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
      
      <ConfirmDialog
        isOpen={payDialog.isOpen}
        message={`دڵنیای کە دەتەوێت بڕی ${payDialog.employee ? formatCurrencyBoth(payDialog.employee.baseSalary) : ''} وەک مووچەی ئەم مانگە بدەیت بە ${payDialog.employee?.fullName}؟ (ئەمە ڕاستەوخۆ پارەکە لە باڵانس دەبڕێت و دەیخاتە سەر خەرجییەکان)`}
        onConfirm={handleQuickPay}
        onCancel={() => setPayDialog({ isOpen: false, employee: null })}
        intent="success"
        confirmText="بەڵێ، مووچەی بدە"
      />
    </div>
  );
}
