import { prisma } from '@/lib/prisma';


export async function getFinancialSummary(startDate?: Date, endDate?: Date) {
  const [invoices, purchases, transactions, activeEmployees, payrolls] = await Promise.all([
    prisma.invoice.findMany({ select: { date: true, remainingBalance: true } }),
    prisma.purchase.findMany({ select: { date: true, remainingBalance: true } }),
    prisma.transaction.findMany({ select: { date: true, amount: true, type: true } }),
    prisma.employee.count({ where: { isActive: true } }),
    prisma.payroll.findMany({ select: { date: true, amount: true, status: true } })
  ])

  let totalIncomePeriod = 0
  let totalExpensesPeriod = 0
  let totalIncomeAllTime = 0
  let totalExpensesAllTime = 0
  let outstandingReceivables = 0
  let outstandingPayables = 0
  
  let salariesPaidPeriod = 0
  let pendingSalaries = 0

  let prevPeriodIncome = 0
  let prevPeriodExpenses = 0

  const now = endDate ? new Date(endDate) : new Date()
  if (!endDate) now.setHours(23, 59, 59, 999)

  const duration = startDate ? now.getTime() - startDate.getTime() : 0;
  const prevStartDate = startDate ? new Date(startDate.getTime() - duration) : new Date(0);
  const prevEndDate = startDate ? new Date(startDate.getTime() - 1) : new Date(0);

  // Outstanding Receivables
  invoices.forEach(inv => {
    if (inv.date > now) return;
    outstandingReceivables += inv.remainingBalance
  })

  // Outstanding Payables
  purchases.forEach(pur => {
    if (pur.date > now) return;
    outstandingPayables += pur.remainingBalance
  })

  // Income & Expenses from Transactions
  transactions.forEach(tx => {
    if (tx.date > now) return;
    
    if (tx.type === 'INCOME') {
      totalIncomeAllTime += tx.amount
      if (!startDate || tx.date >= startDate) totalIncomePeriod += tx.amount
      if (startDate && tx.date >= prevStartDate && tx.date <= prevEndDate) prevPeriodIncome += tx.amount
    }
    if (tx.type === 'EXPENSE' || tx.type === 'PAYMENT') {
      totalExpensesAllTime += tx.amount
      if (!startDate || tx.date >= startDate) totalExpensesPeriod += tx.amount
      if (startDate && tx.date >= prevStartDate && tx.date <= prevEndDate) prevPeriodExpenses += tx.amount
    }
  })

  // Payroll calculations
  payrolls.forEach(pr => {
    if (pr.status === 'PENDING') {
      pendingSalaries += pr.amount;
    } else if (pr.status === 'PAID') {
      if (!startDate || pr.date >= startDate) {
        if (pr.date <= now) {
           salariesPaidPeriod += pr.amount;
        }
      }
    }
  })

  const netProfit = totalIncomePeriod - totalExpensesPeriod
  const totalBalance = totalIncomeAllTime - totalExpensesAllTime

  const calcChange = (current: number, previous: number) => {
    if (!startDate) return 0;
    if (previous === 0) return current > 0 ? 100 : (current < 0 ? -100 : 0);
    return ((current - previous) / previous) * 100;
  }

  const prevPeriodProfit = prevPeriodIncome - prevPeriodExpenses

  return {
    totalBalance,
    totalIncome: totalIncomePeriod,
    totalExpenses: totalExpensesPeriod,
    netProfit,
    dailyProfit: 0,
    weeklyProfit: 0,
    monthlyProfit: 0,
    yearlyProfit: 0,
    cashFlow: totalIncomePeriod - totalExpensesPeriod,
    outstandingReceivables,
    outstandingPayables,
    totalEmployees: activeEmployees,
    salariesPaid: salariesPaidPeriod,
    pendingSalaries,
    changes: {
      totalBalance: 0,
      totalIncome: calcChange(totalIncomePeriod, prevPeriodIncome).toFixed(1),
      totalExpenses: calcChange(totalExpensesPeriod, prevPeriodExpenses).toFixed(1),
      netProfit: calcChange(netProfit, prevPeriodProfit).toFixed(1),
      outstandingReceivables: 0,
      outstandingPayables: 0,
    }
  }
}

export async function getRevenueChartData(period: '7d' | '30d' | '12m' | 'all' | 'custom' = '30d', customStart?: Date, customEnd?: Date) {
  const now = customEnd ? new Date(customEnd) : new Date();
  if (!customEnd) now.setHours(23, 59, 59, 999);
  
  let startDate = new Date();
  let groupBy: 'day' | 'month' = 'day';

  if (period === '7d') {
    startDate.setDate(now.getDate() - 6);
    startDate.setHours(0, 0, 0, 0);
  } else if (period === '30d') {
    startDate.setDate(now.getDate() - 29);
    startDate.setHours(0, 0, 0, 0);
  } else if (period === '12m') {
    startDate = new Date(now.getFullYear(), now.getMonth() - 11, 1);
    groupBy = 'month';
  } else if (period === 'all') {
    const firstTx = await prisma.transaction.findFirst({ orderBy: { date: 'asc' } });
    startDate = firstTx ? new Date(firstTx.date) : new Date(now.getFullYear(), 0, 1);
    const daysDiff = (now.getTime() - startDate.getTime()) / (1000 * 3600 * 24);
    groupBy = daysDiff > 90 ? 'month' : 'day';
  } else if (period === 'custom' && customStart) {
    startDate = new Date(customStart);
    startDate.setHours(0, 0, 0, 0);
    const daysDiff = (now.getTime() - startDate.getTime()) / (1000 * 3600 * 24);
    groupBy = daysDiff > 90 ? 'month' : 'day';
  }

  const transactions = await prisma.transaction.findMany({
    where: {
      date: {
        gte: startDate,
        lte: now,
      }
    },
    select: { date: true, amount: true, type: true }
  });

  const chartData = new Map();
  const dayFormatter = new Intl.DateTimeFormat('ku-IQ', { day: 'numeric', month: 'short' });
  const monthFormatter = new Intl.DateTimeFormat('ku-IQ', { month: 'short', year: 'numeric' });
  
  // Initialize data map
  let current = new Date(startDate);
  while (current <= now) {
    if (groupBy === 'day') {
      const key = `${current.getFullYear()}-${current.getMonth()}-${current.getDate()}`;
      chartData.set(key, { name: dayFormatter.format(current), income: 0, expenses: 0, netProfit: 0 });
      current.setDate(current.getDate() + 1);
    } else {
      const key = `${current.getFullYear()}-${current.getMonth()}`;
      chartData.set(key, { name: monthFormatter.format(current), income: 0, expenses: 0, netProfit: 0 });
      current.setMonth(current.getMonth() + 1);
    }
  }

  transactions.forEach(tx => {
    let key;
    if (groupBy === 'day') {
      key = `${tx.date.getFullYear()}-${tx.date.getMonth()}-${tx.date.getDate()}`;
    } else {
      key = `${tx.date.getFullYear()}-${tx.date.getMonth()}`;
    }
    
    if (chartData.has(key)) {
      const data = chartData.get(key);
      if (tx.type === 'INCOME') {
        data.income += tx.amount;
        data.netProfit += tx.amount;
      } else if (tx.type === 'EXPENSE' || tx.type === 'PAYMENT') {
        data.expenses += tx.amount;
        data.netProfit -= tx.amount;
      }
    }
  });

  return Array.from(chartData.values());
}

export async function getExpenseCategoriesData(period: '7d' | '30d' | '12m' | 'all' | 'custom' = '30d', customStart?: Date, customEnd?: Date) {
  const now = customEnd ? new Date(customEnd) : new Date();
  if (!customEnd) now.setHours(23, 59, 59, 999);
  
  let startDate = new Date();
  if (period === '7d') startDate.setDate(now.getDate() - 6);
  else if (period === '30d') startDate.setDate(now.getDate() - 29);
  else if (period === '12m') startDate = new Date(now.getFullYear(), now.getMonth() - 11, 1);
  else if (period === 'all') startDate = new Date(0);
  else if (period === 'custom' && customStart) startDate = new Date(customStart);
  startDate.setHours(0, 0, 0, 0);

  const expenses = await prisma.transaction.findMany({
    where: {
      type: {
        in: ['EXPENSE', 'PAYMENT']
      },
      date: {
        gte: startDate,
        lte: now,
      }
    },
    select: { category: true, amount: true }
  });

  const categoryMap = new Map<string, number>();
  
  expenses.forEach(exp => {
    const cat = exp.category || 'نەزانراو (Unknown)';
    categoryMap.set(cat, (categoryMap.get(cat) || 0) + exp.amount);
  });

  const result = Array.from(categoryMap.entries()).map(([name, value]) => ({
    name,
    value
  }));

  // Sort by value descending
  return result.sort((a, b) => b.value - a.value);
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
