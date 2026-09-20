'use client';
import { useState } from 'react';
import { Employee } from '@prisma/client';

type EmployeeModalProps = {
  isOpen: boolean;
  onClose: () => void;
  onSave: (formData: FormData) => Promise<void>;
  employee?: Employee;
};

export default function EmployeeModal({ isOpen, onClose, onSave, employee }: EmployeeModalProps) {
  const [isLoading, setIsLoading] = useState(false);

  if (!isOpen) return null;

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setIsLoading(true);
    const formData = new FormData(e.currentTarget);
    
    // Convert boolean
    formData.set('isActive', e.currentTarget.isActive.checked ? 'true' : 'false');
    
    await onSave(formData);
    setIsLoading(false);
  }

  return (
    <div className="modalOverlay" onClick={onClose}>
      <div className="modalContent animate-fade-in" onClick={e => e.stopPropagation()}>
        <h2 className="modalTitle">
          {employee ? 'دەستکاری کارمەند' : 'زیادکردنی کارمەند'}
        </h2>

        <form onSubmit={handleSubmit} className="modalForm">
          <div className="formGroup">
            <label className="label">ناوی سیانی</label>
            <input name="fullName" type="text" defaultValue={employee?.fullName} required className="input" />
          </div>
          <div className="formGroup">
            <label className="label">ژمارەی کارمەند / ID</label>
            <input name="employeeId" type="text" defaultValue={employee?.employeeId} required className="input" />
          </div>
          <div className="formGroup">
            <label className="label">ژمارەی مۆبایل</label>
            <input name="phone" type="text" defaultValue={employee?.phone || ''} className="input" />
          </div>
          <div className="formGroup">
            <label className="label">پلەی کار / پۆست</label>
            <input name="jobPosition" type="text" defaultValue={employee?.jobPosition || ''} className="input" />
          </div>
          <div className="formGroup">
            <label className="label">بەش</label>
            <input name="department" type="text" defaultValue={employee?.department || ''} className="input" />
          </div>
          <div className="formGroup">
            <label className="label">جۆری مووچە</label>
            <select name="salaryType" defaultValue={employee?.salaryType || 'MONTHLY'} className="input">
              <option value="MONTHLY">مانگانە</option>
              <option value="DAILY">ڕۆژانە</option>
            </select>
          </div>
          <div className="formGroup">
            <label className="label">بڕی مووچە (بنەڕەتی)</label>
            <input name="baseSalary" type="number" step="0.01" defaultValue={employee?.baseSalary} required className="input" />
          </div>
          <div className="formGroup">
            <label className="label">تێبینی</label>
            <textarea name="notes" defaultValue={employee?.notes || ''} className="input" rows={3} />
          </div>
          <div className="formGroup">
            <label className="label">باری کارمەند</label>
            <div style={{display: 'flex', gap: '0.5rem', alignItems: 'center'}}>
              <input name="isActive" type="checkbox" defaultChecked={employee ? employee.isActive : true} />
              <span>چالاکە (Active)</span>
            </div>
          </div>
          
          <div className="modalActions">
            <button type="button" onClick={onClose} className="btn btn-secondary" disabled={isLoading}>ڕەتکردنەوە</button>
            <button type="submit" className="btn btn-primary" disabled={isLoading}>{isLoading ? '...' : 'پاشەکەوتکردن'}</button>
          </div>
        </form>
      </div>
    </div>
  );
}
