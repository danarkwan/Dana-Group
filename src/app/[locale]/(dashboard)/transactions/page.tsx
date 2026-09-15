import { PrismaClient } from '@prisma/client'
import TransactionsClient from './TransactionsClient'

const prisma = new PrismaClient()

export default async function TransactionsPage() {
  const transactions = await prisma.transaction.findMany({
    orderBy: { date: 'desc' }
  })

  return (
    <div className="pageContainer">
      <div className="pageHeader">
        <h1 className="pageTitle">مامەڵەکان</h1>
      </div>
      
      <TransactionsClient initialTransactions={transactions} />
    </div>
  )
}
