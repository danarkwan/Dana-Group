import { redirect } from 'next/navigation';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';
import { hasAccess } from '@/lib/permissions';
import { getUsers } from '@/lib/actions/users';
import UsersClient from './UsersClient';

export const dynamic = 'force-dynamic';

export default async function UsersPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  const session = await getServerSession(authOptions);
  
  // Only administrators can access this page
  if (!session || !hasAccess(session.user, 'users')) {
    redirect(`/${locale}/auth/signin?callbackUrl=/${locale}/users`);
  }

  const initialUsers = await getUsers();

  return (
    <UsersClient initialUsers={initialUsers} />
  );
}
