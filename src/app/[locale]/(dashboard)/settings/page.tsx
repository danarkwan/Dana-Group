import { getServerSession } from 'next-auth/next'
import { authOptions } from '@/lib/auth'
import { PrismaClient } from '@prisma/client'
import SettingsClient from './SettingsClient'
import { redirect } from 'next/navigation'

const prisma = new PrismaClient()

export default async function SettingsPage() {
  const session = await getServerSession(authOptions)
  
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
