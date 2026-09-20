'use server';

import { prisma } from '@/lib/prisma';
import { getServerSession } from 'next-auth';

import { verifyServerActionAccess } from '@/lib/permissions';

// 1. Financial Summary
export async function getFinancialSummary(startDate?: string, endDate?: string) {
  await verifyServerActionAccess('reports');

  const session = await getServerSession();
  if (!session) throw new Error('Unauthorized');

  const dateFilter: any = {};
  if (startDate) dateFilter.gte = new Date(startDate);
  if (endDate) {
    const end = new Date(endDate);
    end.setHours(23, 59, 59, 999);
    dateFilter.lte = end;
  }
  
  const whereClause = Object.keys(dateFilter).length > 0 ? { date: dateFilter } : {};
  const createdAtWhereClause = Object.keys(dateFilter).length > 0 ? { createdAt: dateFilter } : {};

  // Income transactions
  const incomeTransactions = await prisma.transaction.aggregate({
    where: {
      type: 'INCOME',
      status: 'COMPLETED',
      ...whereClause
    },
    _sum: {
      amount: true
    }
  });

  // Expense transactions
  const expenseTransactions = await prisma.transaction.aggregate({
    where: {
      type: { in: ['EXPENSE', 'PAYMENT'] },
      status: 'COMPLETED',
      ...whereClause
    },
    _sum: {
      amount: true
    }
  });

  const totalIncome = (incomeTransactions._sum.amount || 0);
  const totalExpenses = (expenseTransactions._sum.amount || 0);
  const netProfit = totalIncome - totalExpenses;

  return {
    totalIncome,
    totalExpenses,
    netProfit
  };
}

// 2. Debts Report
export async function getDebtsReport() {
  await verifyServerActionAccess('reports');

  const session = await getServerSession();
  if (!session) throw new Error('Unauthorized');

  // Customer Debts
  const customers = await prisma.customer.findMany({
    include: {
      invoices: {
        where: {
          status: { in: ['PENDING', 'PARTIAL'] }
        },
        select: {
          remainingBalance: true
        }
      }
    }
  });

  const customerDebts = customers.map(c => {
    const totalDebt = c.invoices.reduce((sum, inv) => sum + inv.remainingBalance, 0);
    return {
      id: c.id,
      name: c.name,
      phone: c.phone,
      totalDebt
    };
  }).filter(c => c.totalDebt > 0);

  const totalReceivables = customerDebts.reduce((sum, c) => sum + c.totalDebt, 0);

  // Supplier Debts
  const suppliers = await prisma.supplier.findMany({
    include: {
      purchases: {
        where: {
          status: { in: ['PENDING', 'PARTIAL'] }
        },
        select: {
          remainingBalance: true
        }
      }
    }
  });

  const supplierDebts = suppliers.map(s => {
    const totalDebt = s.purchases.reduce((sum, p) => sum + p.remainingBalance, 0);
    return {
      id: s.id,
      name: s.name,
      phone: s.phone,
      totalDebt
    };
  }).filter(s => s.totalDebt > 0);

  const totalPayables = supplierDebts.reduce((sum, s) => sum + s.totalDebt, 0);

  return {
    customerDebts,
    totalReceivables,
    supplierDebts,
    totalPayables
  };
}

// 3. Sales Report
export async function getSalesReport(startDate?: string, endDate?: string) {
  await verifyServerActionAccess('reports');

  const session = await getServerSession();
  if (!session) throw new Error('Unauthorized');

  const dateFilter: any = {};
  if (startDate) dateFilter.gte = new Date(startDate);
  if (endDate) {
    const end = new Date(endDate);
    end.setHours(23, 59, 59, 999);
    dateFilter.lte = end;
  }
  
  const whereClause = Object.keys(dateFilter).length > 0 ? { date: dateFilter } : {};

  const invoices = await prisma.invoice.findMany({
    where: whereClause,
    include: {
      customer: true
    },
    orderBy: {
      date: 'desc'
    }
  });

  const totalSales = invoices.reduce((sum, i) => sum + i.total, 0);
  const totalDiscounts = invoices.reduce((sum, i) => sum + i.discount, 0);
  const totalPaid = invoices.reduce((sum, i) => sum + i.paidAmount, 0);

  return {
    invoices,
    summary: {
      totalSales,
      totalDiscounts,
      totalPaid,
      count: invoices.length
    }
  };
}

// 4. Purchases Report
export async function getPurchasesReport(startDate?: string, endDate?: string) {
  await verifyServerActionAccess('reports');

  const session = await getServerSession();
  if (!session) throw new Error('Unauthorized');

  const dateFilter: any = {};
  if (startDate) dateFilter.gte = new Date(startDate);
  if (endDate) {
    const end = new Date(endDate);
    end.setHours(23, 59, 59, 999);
    dateFilter.lte = end;
  }
  
  const whereClause = Object.keys(dateFilter).length > 0 ? { date: dateFilter } : {};

  const purchases = await prisma.purchase.findMany({
    where: whereClause,
    include: {
      supplier: true
    },
    orderBy: {
      date: 'desc'
    }
  });

  const totalPurchases = purchases.reduce((sum, p) => sum + p.total, 0);
  const totalDiscounts = purchases.reduce((sum, p) => sum + p.discount, 0);
  const totalPaid = purchases.reduce((sum, p) => sum + p.paidAmount, 0);

  return {
    purchases,
    summary: {
      totalPurchases,
      totalDiscounts,
      totalPaid,
      count: purchases.length
    }
  };
}

// 5. Inventory Report
export async function getInventoryReport() {
  await verifyServerActionAccess('reports');

  const session = await getServerSession();
  if (!session) throw new Error('Unauthorized');

  const products = await prisma.product.findMany({
    include: {
      supplier: true
    },
    orderBy: {
      stock: 'asc'
    }
  });

  const lowStockProducts = products.filter(p => p.stock <= p.minStock);
  const totalInventoryValue = products.reduce((sum, p) => sum + (p.stock * p.purchasePrice), 0);
  const totalRetailValue = products.reduce((sum, p) => sum + (p.stock * p.price), 0);

  return {
    products,
    lowStockProducts,
    summary: {
      totalItems: products.length,
      lowStockCount: lowStockProducts.length,
      totalInventoryValue,
      totalRetailValue
    }
  };
}
