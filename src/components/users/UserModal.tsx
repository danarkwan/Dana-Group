/* eslint-disable react-hooks/set-state-in-effect */
import { useState, useEffect } from 'react';
import styles from './users.module.css';

type UserModalProps = {
  isOpen: boolean;
  onClose: () => void;
  onSave: (id: string, role: string, permissions: string[]) => void;
  user?: any;
};

const ROLES = ['ADMINISTRATOR', 'ACCOUNTANT', 'CASHIER', 'EMPLOYEE'];
const SECTIONS = ['dashboard', 'products', 'inventory', 'customers', 'suppliers', 'invoices', 'payments', 'transactions', 'reports', 'settings', 'employees', 'payroll'];

export default function UserModal({ isOpen, onClose, onSave, user }: UserModalProps) {
  const [role, setRole] = useState('EMPLOYEE');
  const [permissions, setPermissions] = useState<string[]>([]);

  useEffect(() => {
    if (user) {
      setRole(user.role || 'EMPLOYEE');
      setPermissions(user.permissions || []);
    } else {
      setRole('EMPLOYEE');
      setPermissions([]);
    }
  }, [user, isOpen]);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (user) {
      onSave(user.id, role, permissions);
    }
  };

  const handlePermissionToggle = (section: string) => {
    setPermissions(prev => 
      prev.includes(section) ? prev.filter(p => p !== section) : [...prev, section]
    );
  };

  return (
    <div className={styles.modalOverlay} onClick={onClose}>
      <div className={styles.modal} onClick={e => e.stopPropagation()}>
        <div className={styles.modalHeader}>
          <h2>{user ? 'گۆڕینی دەسەڵاتەکان' : 'بەڕێوەبردنی بەکارهێنەر'}</h2>
          <button onClick={onClose} className={styles.closeButton}>&times;</button>
        </div>
        <form onSubmit={handleSubmit} className={styles.form}>
          <div className={styles.formGroup}>
            <label>ناونیشان (Role)</label>
            <select 
              value={role} 
              onChange={e => setRole(e.target.value)}
              className={styles.input}
            >
              {ROLES.map(r => (
                <option key={r} value={r}>{r}</option>
              ))}
            </select>
          </div>
          
          {role === 'EMPLOYEE' && (
            <div className={styles.formGroup}>
              <label>بەشە ڕێگەپێدراوەکان (Permissions)</label>
              <div className={styles.permissionsGrid}>
                {SECTIONS.map(section => (
                  <label key={section} className={styles.checkboxLabel}>
                    <input 
                      type="checkbox"
                      checked={permissions.includes(section)}
                      onChange={() => handlePermissionToggle(section)}
                    />
                    {section}
                  </label>
                ))}
              </div>
            </div>
          )}

          <div className={styles.modalActions}>
            <button type="button" onClick={onClose} className="btn btn-secondary">ڕەتکردنەوە</button>
            <button type="submit" className="btn btn-primary">پاشەکەوتکردن</button>
          </div>
        </form>
      </div>
    </div>
  );
}
