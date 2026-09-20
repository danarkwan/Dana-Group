'use server';

import { prisma } from '@/lib/prisma';


export async function getFinancialReportData() {
  const transactions = await prisma.transaction.findMany({
    orderBy: { date: 'asc' },
  });

  let totalIncome = 0;
  let totalExpenses = 0;

  transactions.forEach(t => {
    if (t.type === 'INCOME') totalIncome += t.amount;
    if (t.type === 'EXPENSE') totalExpenses += t.amount;
  });

  return {
    totalIncome,
    totalExpenses,
    netProfit: totalIncome - totalExpenses,
    transactions: transactions.slice(-50), // Send last 50 for detail view
  };
}

export async function getSalesPurchasesReportData() {
  const [invoices, purchases] = await Promise.all([
    prisma.invoice.findMany({
      include: { customer: true },
      orderBy: { date: 'desc' },
      take: 50,
    }),
    prisma.purchase.findMany({
      include: { supplier: true },
      orderBy: { date: 'desc' },
      take: 50,
    }),
  ]);

  let totalSales = 0;
  let totalPurchases = 0;

  invoices.forEach(inv => totalSales += inv.total);
  purchases.forEach(pur => totalPurchases += pur.total);

  return {
    totalSales,
    totalPurchases,
    invoices,
    purchases,
  };
}

export async function getDebtsReportData() {
  const [invoices, purchases] = await Promise.all([
    prisma.invoice.findMany({
      where: { remainingBalance: { gt: 0 } },
      include: { customer: true },
      orderBy: { dueDate: 'asc' },
    }),
    prisma.purchase.findMany({
      where: { remainingBalance: { gt: 0 } },
      include: { supplier: true },
      orderBy: { dueDate: 'asc' },
    }),
  ]);

  let totalCustomerDebts = 0;
  let totalSupplierDebts = 0;

  invoices.forEach(inv => totalCustomerDebts += inv.remainingBalance);
  purchases.forEach(pur => totalSupplierDebts += pur.remainingBalance);

  return {
    totalCustomerDebts,
    totalSupplierDebts,
    customerDebts: invoices,
    supplierDebts: purchases,
  };
}
