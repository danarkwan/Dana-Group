'use client';
import { useState, useEffect } from 'react';
import { Employee, Payroll } from '@prisma/client';

type PayrollModalProps = {
  isOpen: boolean;
  onClose: () => void;
  onSave: (formData: FormData) => Promise<void>;
  payroll?: Payroll & { employee: Employee };
  employees: Employee[];
};

export default function PayrollModal({ isOpen, onClose, onSave, payroll, employees }: PayrollModalProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [selectedEmployeeId, setSelectedEmployeeId] = useState(payroll?.employeeId || '');
  const [amount, setAmount] = useState<number | ''>(payroll?.amount || '');

  useEffect(() => {
    if (isOpen) {
      if (payroll) {
        setSelectedEmployeeId(payroll.employeeId);
        setAmount(payroll.amount);
      } else {
        setSelectedEmployeeId('');
        setAmount('');
      }
    }
  }, [isOpen, payroll]);

  if (!isOpen) return null;

  const selectedEmployee = employees.find(e => e.id === selectedEmployeeId);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setIsLoading(true);
    const formData = new FormData(e.currentTarget);
    await onSave(formData);
    setIsLoading(false);
  }

  const generatePeriodOptions = () => {
    const options = [];
    const now = new Date();
    for (let i = -1; i <= 3; i++) {
      const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const label = d.toLocaleString('ku-IQ', { month: 'long', year: 'numeric' });
      const value = `${d.getFullYear()}-${(d.getMonth() + 1).toString().padStart(2, '0')}`;
      options.push({ label, value });
    }
    return options;
  };

  return (
    <div className="modalOverlay" onClick={onClose}>
      <div className="modalContent animate-fade-in" onClick={e => e.stopPropagation()}>
        <h2 className="modalTitle">
          {payroll ? 'دەستکاری مووچە' : 'زیادکردنی مووچە'}
        </h2>

        <form onSubmit={handleSubmit} className="modalForm">
          <div className="formGroup">
            <label className="label">کارمەند</label>
            <select 
              name="employeeId" 
              className="input" 
              required 
              value={selectedEmployeeId}
              onChange={(e) => {
                setSelectedEmployeeId(e.target.value);
                const emp = employees.find(emp => emp.id === e.target.value);
                if (emp && !payroll) {
                  setAmount(emp.baseSalary);
                }
              }}
              disabled={!!payroll} // Cannot change employee for existing record
            >
              <option value="" disabled>کارمەند هەڵبژێرە</option>
              {employees.map(e => (
                <option key={e.id} value={e.id}>{e.fullName} - {e.department || 'بێ بەش'}</option>
              ))}
            </select>
          </div>

          <div className="formGroup">
            <label className="label">بڕی مووچە</label>
            <input 
              name="amount" 
              type="number" 
              step="0.01" 
              required 
              className="input" 
              value={amount}
              onChange={e => setAmount(parseFloat(e.target.value) || '')}
            />
            {selectedEmployee && (
              <small style={{color: 'var(--color-text-light)', marginTop: '0.25rem', display: 'block'}}>
                مووچەی بنەڕەتی: {selectedEmployee.baseSalary.toLocaleString()}
              </small>
            )}
          </div>

          <div className="formGroup">
            <label className="label">بۆ مانگی</label>
            <select name="period" defaultValue={payroll?.period || generatePeriodOptions()[1].value} className="input">
              {generatePeriodOptions().map(opt => (
                <option key={opt.value} value={opt.value}>{opt.label}</option>
              ))}
            </select>
          </div>

          <div className="formGroup">
            <label className="label">شێوازی پارەدان</label>
            <select name="method" defaultValue={payroll?.method || 'CASH'} className="input">
              <option value="CASH">کاش (Cash)</option>
              <option value="BANK_TRANSFER">حەواڵەی بانکی (Transfer)</option>
              <option value="CHECK">چەک (Check)</option>
            </select>
          </div>

          <div className="formGroup">
            <label className="label">تێبینی</label>
            <textarea name="notes" defaultValue={payroll?.notes || ''} className="input" rows={2} />
          </div>

          {!payroll && (
             <div className="formGroup">
              <label className="label">باری پارەدان</label>
              <select name="status" defaultValue="PENDING" className="input">
                <option value="PENDING">نەدراوە (Pending)</option>
                <option value="PAID">دراوە (Paid)</option>
              </select>
            </div>
          )}
          
          <div className="modalActions">
            <button type="button" onClick={onClose} className="btn btn-secondary" disabled={isLoading}>ڕەتکردنەوە</button>
            <button type="submit" className="btn btn-primary" disabled={isLoading}>{isLoading ? '...' : 'پاشەکەوتکردن'}</button>
          </div>
        </form>
      </div>
    </div>
  );
}
