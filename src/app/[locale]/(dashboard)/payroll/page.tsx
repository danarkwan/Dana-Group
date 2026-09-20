import { getTranslations } from 'next-intl/server';
import { getPayrolls } from '@/lib/actions/payroll';
import { getEmployees } from '@/lib/actions/employees';
import PayrollClient from './PayrollClient';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { hasAccess } from '@/lib/permissions';
import { redirect } from 'next/navigation';

export default async function PayrollPage({ 
  params,
}: { 
  params: Promise<{ locale: string }>
}) {
  const { locale } = await params;
  const session = await getServerSession(authOptions);
  if (!hasAccess(session?.user, 'payroll')) {
    redirect(`/${locale}`);
  }
  
  const payrolls = await getPayrolls();
  const employees = await getEmployees();
  
  return (
    <PayrollClient 
      initialPayrolls={payrolls} 
      employees={employees.filter(e => e.isActive)}
    />
  );
}
