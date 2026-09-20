import { getServerSession } from 'next-auth/next';
import { authOptions } from './auth';

export type AppRole = 'ADMINISTRATOR' | 'ACCOUNTANT' | 'CASHIER' | 'EMPLOYEE';

export type AppSection = 
  | 'dashboard'
  | 'products'
  | 'inventory'
  | 'customers'
  | 'suppliers'
  | 'invoices'
  | 'payments'
  | 'transactions'
  | 'reports'
  | 'settings'
  | 'users'
  | 'employees'
  | 'payroll';

export function hasAccess(user: { role?: string; permissions?: string[] } | null | undefined, section: AppSection): boolean {
  if (!user || !user.role) return false;

  if (user.role === 'ADMINISTRATOR') {
    return true;
  }

  if (user.role === 'ACCOUNTANT') {
    // Accountants have access to all financial and reporting sections
    const accountantSections: AppSection[] = [
      'dashboard',
      'products', // Need to see products for invoices
      'customers',
      'suppliers',
      'invoices',
      'payments',
      'transactions',
      'reports',
      'employees',
      'payroll',
    ];
    return accountantSections.includes(section);
  }
  
  if (user.role === 'CASHIER') {
    // Cashiers might only have access to POS / invoices and payments
    const cashierSections: AppSection[] = [
      'dashboard',
      'products',
      'customers',
      'invoices',
      'payments'
    ];
    return cashierSections.includes(section);
  }

  if (user.role === 'EMPLOYEE') {
    // Employees only have access to sections explicitly granted in their permissions array,
    // plus the dashboard by default.
    if (section === 'dashboard') return true;
    
    if (user.permissions && Array.isArray(user.permissions)) {
      return user.permissions.includes(section);
    }
  }

  return false;
}

export async function verifyServerActionAccess(section: AppSection) {
  const session = await getServerSession(authOptions);
  if (!session || !hasAccess(session.user, section)) {
    throw new Error('Unauthorized');
  }
}
