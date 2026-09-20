import { hasAccess } from '@/lib/permissions';
import { getServerSession } from 'next-auth/next'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma';
import SettingsClient from './SettingsClient'
import { redirect } from 'next/navigation'


export default async function SettingsPage() {
  const session = await getServerSession(authOptions);
  if (!session || !hasAccess(session.user, 'settings')) {
    redirect(`/en/auth/signin`);
  }


  if (!session?.user?.email) {
    redirect('/en/login')
  }

  // Fetch fresh user data from DB
  const user = await prisma.user.findUnique({
    where: { email: session.user.email },
    select: {
      id: true,
      name: true,
      email: true,
      role: true
    }
  })

  if (!user) {
    redirect('/en/login')
  }

  return (
    <div className="pageContainer">
      <div className="pageHeader">
        <h1 className="pageTitle">ڕێکخستنەکان</h1>
      </div>
      
      <SettingsClient user={user} />
    </div>
  )
}
