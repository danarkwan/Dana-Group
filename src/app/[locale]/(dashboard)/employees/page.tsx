import { getTranslations } from 'next-intl/server';
import { getEmployees } from '@/lib/actions/employees';
import { getPayrolls } from '@/lib/actions/payroll';
import EmployeesClient from './EmployeesClient';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { hasAccess } from '@/lib/permissions';
import { redirect } from 'next/navigation';

export default async function EmployeesPage({ 
  params,
}: { 
  params: Promise<{ locale: string }>
}) {
  const { locale } = await params;
  const session = await getServerSession(authOptions);
  if (!hasAccess(session?.user, 'employees')) {
    redirect(`/${locale}`);
  }
  
  const employees = await getEmployees();
  const payrolls = await getPayrolls();
  
  // Using static translation objects since we don't have Kurdish locale strings for employees set up properly yet, 
  // but we provide fallback text in case `t` fails.
  const t = await getTranslations('Navigation').catch(() => (key: string) => key);

  return (
    <EmployeesClient 
      initialEmployees={employees} 
      initialPayrolls={payrolls}
    />
  );
}
