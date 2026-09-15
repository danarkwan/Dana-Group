import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

export async function getFinancialSummary(baseDate?: Date) {
  const [invoices, purchases, transactions] = await Promise.all([
    prisma.invoice.findMany(),
    prisma.purchase.findMany(),
    prisma.transaction.findMany(),
  ])

  let totalIncome = 0
  let totalExpenses = 0
  let outstandingReceivables = 0
  let outstandingPayables = 0

  let dailyProfit = 0
  let weeklyProfit = 0
  let monthlyProfit = 0
  let yearlyProfit = 0

  // For previous periods
  let prevMonthIncome = 0
  let prevMonthExpenses = 0
  let thisMonthIncome = 0
  let thisMonthExpenses = 0

  const now = baseDate ? new Date(baseDate) : new Date()
  now.setHours(23, 59, 59, 999)

  const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate())
  const sevenDaysAgo = new Date(todayStart)
  sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7)
  const monthStart = new Date(now.getFullYear(), now.getMonth(), 1)
  const yearStart = new Date(now.getFullYear(), 0, 1)

  const prevMonthStart = new Date(now.getFullYear(), now.getMonth() - 1, 1)
  const prevMonthEnd = new Date(now.getFullYear(), now.getMonth(), 0)
  prevMonthEnd.setHours(23, 59, 59, 999)

  const addProfitByDate = (date: Date, amount: number) => {
    if (date > now) return;
    if (date >= todayStart) dailyProfit += amount
    if (date >= sevenDaysAgo) weeklyProfit += amount
    if (date >= monthStart) monthlyProfit += amount
    if (date >= yearStart) yearlyProfit += amount
  }

  // Outstanding Receivables
  invoices.forEach(inv => {
    if (inv.date > now) return;
    outstandingReceivables += inv.remainingBalance
  })

  // Outstanding Payables
  purchases.forEach(pur => {
    if (pur.createdAt > now) return;
    outstandingPayables += pur.remainingBalance
  })

  // Income & Expenses from Transactions
  transactions.forEach(tx => {
    if (tx.date > now) return;
    if (tx.type === 'INCOME') {
      totalIncome += tx.amount
      addProfitByDate(tx.date, tx.amount)
      
      if (tx.date >= monthStart) thisMonthIncome += tx.amount
      if (tx.date >= prevMonthStart && tx.date <= prevMonthEnd) prevMonthIncome += tx.amount
    }
    if (tx.type === 'EXPENSE') {
      totalExpenses += tx.amount
      addProfitByDate(tx.date, -tx.amount)

      if (tx.date >= monthStart) thisMonthExpenses += tx.amount
      if (tx.date >= prevMonthStart && tx.date <= prevMonthEnd) prevMonthExpenses += tx.amount
    }
  })

  const netProfit = totalIncome - totalExpenses
  const totalBalance = netProfit // Assuming starting balance is 0 for now

  const calcChange = (current: number, previous: number) => {
    if (previous === 0) return current > 0 ? 100 : (current < 0 ? -100 : 0);
    return ((current - previous) / previous) * 100;
  }

  const thisMonthProfit = thisMonthIncome - thisMonthExpenses
  const prevMonthProfit = prevMonthIncome - prevMonthExpenses

  return {
    totalBalance,
    totalIncome,
    totalExpenses,
    netProfit,
    dailyProfit,
    weeklyProfit,
    monthlyProfit,
    yearlyProfit,
    cashFlow: totalIncome - totalExpenses,
    outstandingReceivables,
    outstandingPayables,
    changes: {
      totalBalance: calcChange(thisMonthProfit, prevMonthProfit).toFixed(1),
      totalIncome: calcChange(thisMonthIncome, prevMonthIncome).toFixed(1),
      totalExpenses: calcChange(thisMonthExpenses, prevMonthExpenses).toFixed(1),
      netProfit: calcChange(thisMonthProfit, prevMonthProfit).toFixed(1),
      outstandingReceivables: outstandingReceivables > 0 ? "0.0" : "0.0", // Hard to calculate snapshot history without time-series
      outstandingPayables: outstandingPayables > 0 ? "0.0" : "0.0",
    }
  }
}

export async function getRevenueChartData(baseDate?: Date) {
  const now = baseDate ? new Date(baseDate) : new Date();
  now.setHours(23, 59, 59, 999);
  
  // Get data for the last 6 months including current month
  const sixMonthsAgo = new Date(now.getFullYear(), now.getMonth() - 5, 1);

  const transactions = await prisma.transaction.findMany({
    where: {
      date: {
        gte: sixMonthsAgo,
        lte: now,
      }
    }
  });

  // Initialize data for the last 6 months
  const monthsData = new Map();
  // Using Kurdish formatter for short month names
  const monthFormatter = new Intl.DateTimeFormat('ku-IQ', { month: 'short' });
  
  for (let i = 5; i >= 0; i--) {
    const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
    const key = `${d.getFullYear()}-${d.getMonth()}`;
    const name = monthFormatter.format(d);
    monthsData.set(key, { name, income: 0, expenses: 0 });
  }

  transactions.forEach(tx => {
    const key = `${tx.date.getFullYear()}-${tx.date.getMonth()}`;
    if (monthsData.has(key)) {
      const data = monthsData.get(key);
      if (tx.type === 'INCOME') {
        data.income += tx.amount;
      } else if (tx.type === 'EXPENSE') {
        data.expenses += tx.amount;
      }
    }
  });

  return Array.from(monthsData.values());
}

export async function getRecentTransactions(baseDate?: Date) {
  const now = baseDate ? new Date(baseDate) : new Date();
  now.setHours(23, 59, 59, 999);

  const transactions = await prisma.transaction.findMany({
    where: {
      date: {
        lte: now,
      }
    },
    orderBy: { date: 'desc' },
    take: 10,
  })
  
  // Format to unified transaction shape
  return transactions.map(t => ({
    id: t.id,
    date: t.date.toISOString(),
    description: t.description || 'N/A',
    party: 'General',
    type: t.type,
    amount: t.amount,
    status: 'COMPLETED'
  }))
}
