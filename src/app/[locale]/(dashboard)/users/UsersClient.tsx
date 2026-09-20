import { toast } from 'sonner';
'use client';

import { useState } from 'react';
import { updateUserRoleAndPermissions, deleteUser } from '@/lib/actions/users';
import UserModal from '@/components/users/UserModal';
import ConfirmDialog from '@/components/ui/ConfirmDialog';
import styles from './users.module.css';

type UsersClientProps = {
  initialUsers: any[];
};

export default function UsersClient({ initialUsers }: UsersClientProps) {
  const [users, setUsers] = useState(initialUsers);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingUser, setEditingUser] = useState<any>(undefined);
  const [confirmDialog, setConfirmDialog] = useState({ isOpen: false, message: '', onConfirm: () => {} });

  function handleOpenModal(user: any) {
    setEditingUser(user);
    setIsModalOpen(true);
  }

  function handleCloseModal() {
    setIsModalOpen(false);
    setEditingUser(undefined);
  }

  async function handleSave(id: string, role: string, permissions: string[]) {
    const result = await updateUserRoleAndPermissions(id, role, permissions);
    if (result.success && result.user) {
      setUsers(users.map(u => 
        u.id === result.user!.id 
          ? { ...u, role: result.user!.role, permissions: result.user!.permissions } 
          : u
      ));
      handleCloseModal();
    } else {
      toast.error(result.error);
    }
  }

  function handleDelete(id: string) {
    setConfirmDialog({
      isOpen: true,
      message: 'دڵنیایت لە سڕینەوەی ئەم بەکارهێنەرە؟',
      onConfirm: async () => {
        const result = await deleteUser(id);
        if (result.success) {
          setUsers(users.filter(u => u.id !== id));
        } else {
          toast.error(result.error);
        }
      }
    });
  }

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <h1 className={styles.title}>بەڕێوەبردنی بەکارهێنەران</h1>
      </div>

      <div className={`card ${styles.tableContainer}`}>
        <table className={styles.table}>
          <thead>
            <tr>
              <th>ناو</th>
              <th>ئیمەیڵ</th>
              <th>ناونیشان (Role)</th>
              <th>بەشە ڕێگەپێدراوەکان</th>
              <th style={{ textAlign: 'center' }}>کردارەکان</th>
            </tr>
          </thead>
          <tbody>
            {users.length > 0 ? users.map((user) => (
              <tr key={user.id}>
                <td style={{ fontWeight: 600 }}>
                  {user.name || 'بێ ناو'}
                </td>
                <td>
                  {user.email}
                </td>
                <td>
                  <span className={styles.roleBadge}>{user.role}</span>
                </td>
                <td>
                  {user.role === 'EMPLOYEE' ? (
                    <div className={styles.permissionsList}>
                      {user.permissions && user.permissions.length > 0 
                        ? user.permissions.map((p: string) => <span key={p} className={styles.permissionBadge}>{p}</span>)
                        : <span className={styles.noPermissions}>هیچ</span>
                      }
                    </div>
                  ) : (
                    <span className={styles.allPermissions}>هەموو بەشەکان (بەپێی ناونیشان)</span>
                  )}
                </td>
                <td style={{ textAlign: 'center' }}>
                  <button 
                    className="btn btn-secondary"
                    style={{ padding: '0.25rem 0.5rem', fontSize: '0.75rem', marginRight: '0.5rem' }}
                    onClick={() => handleOpenModal(user)}
                  >
                    گۆڕین
                  </button>
                  <button 
                    className="btn btn-secondary"
                    style={{ padding: '0.25rem 0.5rem', fontSize: '0.75rem', color: 'var(--color-danger)', borderColor: 'var(--color-danger-light)' }}
                    onClick={() => handleDelete(user.id)}
                  >
                    سڕینەوە
                  </button>
                </td>
              </tr>
            )) : (
              <tr>
                <td colSpan={5} style={{ textAlign: 'center', padding: 'var(--spacing-2xl)', color: 'var(--color-text-muted)' }}>
                  هیچ بەکارهێنەرێک نەدۆزرایەوە.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      <UserModal
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        onSave={handleSave}
        user={editingUser}
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
