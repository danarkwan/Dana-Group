import { redirect } from 'next/navigation';
import { hasAccess } from '@/lib/permissions';
import { authOptions } from '@/lib/auth';
import { getServerSession } from 'next-auth/next';
import { prisma } from '@/lib/prisma';
import TransactionsClient from './TransactionsClient'


export default async function TransactionsPage({
  searchParams
}: {
  searchParams: { page?: string, query?: string, type?: string, category?: string }
}) {
  const session = await getServerSession(authOptions);
  if (!session || !hasAccess(session.user, 'transactions')) {
    redirect(`/en/auth/signin`);
  }

  const page = Number(searchParams.page) || 1;
  const take = 20;
  const skip = (page - 1) * take;

  const where = {
    ...(searchParams.query ? {
      OR: [
        { transactionNumber: { contains: searchParams.query, mode: 'insensitive' as const } },
        { description: { contains: searchParams.query, mode: 'insensitive' as const } },
      ]
    } : {}),
    ...(searchParams.type && searchParams.type !== 'ALL' ? { type: searchParams.type } : {}),
    ...(searchParams.category && searchParams.category !== 'ALL' ? { category: searchParams.category } : {})
  };

  const [transactions, total, totalsAggr, customers, suppliers] = await Promise.all([
    prisma.transaction.findMany({
      where,
      orderBy: { date: 'desc' },
      skip,
      take,
      include: { customer: true, supplier: true }
    }),
    prisma.transaction.count({ where }),
    prisma.transaction.groupBy({
      by: ['type'],
      where,
      _sum: { amount: true }
    }),
    prisma.customer.findMany({ orderBy: { name: 'asc' } }),
    prisma.supplier.findMany({ orderBy: { name: 'asc' } })
  ])

  const totalPages = Math.ceil(total / take);
  
  let totalIncome = 0;
  let totalExpense = 0;
  totalsAggr.forEach(t => {
    if (['INCOME', 'SALE'].includes(t.type)) totalIncome += (t._sum.amount || 0);
    if (['EXPENSE', 'PURCHASE'].includes(t.type)) totalExpense += (t._sum.amount || 0);
  });
  const balance = totalIncome - totalExpense;

  return (
    <div className="pageContainer">
      <div className="pageHeader">
        <h1 className="pageTitle">مامەڵەکان</h1>
      </div>
      
      <TransactionsClient 
        initialTransactions={transactions} 
        customers={customers} 
        suppliers={suppliers}
        totalPages={totalPages}
        currentPage={page}
        totalIncome={totalIncome}
        totalExpense={totalExpense}
        balance={balance}
      />
    </div>
  )
}
