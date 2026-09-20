'use server';
import { getTranslations } from 'next-intl/server';;

import { prisma } from '@/lib/prisma';
import { revalidatePath } from 'next/cache';
import { createNotification } from './notifications';

import { verifyServerActionAccess } from '@/lib/permissions';

export async function getPendingInvoices() {
  await verifyServerActionAccess('payments');

  try {
    return await prisma.invoice.findMany({
      where: {
        remainingBalance: { gt: 0 }
      },
      include: {
        customer: true
      },
      orderBy: { date: 'asc' }
    });
  } catch (error: any) {
    console.error('Error fetching pending invoices:', error);
    return [];
  }
}

export async function getPendingPurchases() {
  await verifyServerActionAccess('payments');

  try {
    return await prisma.purchase.findMany({
      where: {
        remainingBalance: { gt: 0 }
      },
      include: {
        supplier: true
      },
      orderBy: { date: 'asc' }
    });
  } catch (error: any) {
    console.error('Error fetching pending purchases:', error);
    return [];
  }
}

export async function recordInvoicePayment(formData: FormData) {
  await verifyServerActionAccess('payments');

  try {
    const invoiceId = formData.get('invoiceId') as string;
    const amountStr = formData.get('amount') as string;
    const amount = parseFloat(amountStr);
    const dateStr = formData.get('date') as string;
    const date = dateStr ? new Date(dateStr) : new Date();
    const method = formData.get('paymentMethod') as string || 'CASH';
    const note = formData.get('note') as string || '';

    if (!invoiceId || isNaN(amount) || amount <= 0) {
      const t = await getTranslations('Errors');
    return { success: false, error: t('saveFailed') };
    }

    const invoice = await prisma.invoice.findUnique({ where: { id: invoiceId } });
    if (!invoice) {
      const t = await getTranslations('Errors');
    return { success: false, error: t('saveFailed') };
    }

    if (amount > invoice.remainingBalance) {
      const t = await getTranslations('Errors');
    return { success: false, error: t('saveFailed') };
    }

    const newPaidAmount = invoice.paidAmount + amount;
    const newRemaining = invoice.remainingBalance - amount;
    const newStatus = newRemaining <= 0 ? 'PAID' : 'PARTIAL';

    await prisma.$transaction([
      prisma.transaction.create({
        data: {
          type: 'INCOME',
          amount: amount,
          description: `Payment for Invoice ${invoice.invoiceNumber}${note ? ' - ' + note : ''}`,
          paymentMethod: method,
          date: date,
          customerId: invoice.customerId,
          category: 'Sales Payment'
        }
      }),
      prisma.invoice.update({
        where: { id: invoiceId },
        data: {
          paidAmount: newPaidAmount,
          remainingBalance: newRemaining,
          status: newStatus
        }
      })
    ]);

    await createNotification({
      type: 'PAYMENT',
      title: 'پارەدانی نوێ',
      message: `بڕی ${amount} وەرگیرا بۆ وەسڵی ژمارە ${invoice.invoiceNumber}.`,
      link: '/payments'
    });

    revalidatePath('/', 'layout');
    return { success: true };
  } catch (error: any) {
    console.error('Error recording invoice payment:', error);
    const t = await getTranslations('Errors');
    return { success: false, error: t('saveFailed') };
  }
}

export async function recordPurchasePayment(formData: FormData) {
  await verifyServerActionAccess('payments');

  try {
    const purchaseId = formData.get('purchaseId') as string;
    const amountStr = formData.get('amount') as string;
    const amount = parseFloat(amountStr);
    const dateStr = formData.get('date') as string;
    const date = dateStr ? new Date(dateStr) : new Date();
    const method = formData.get('paymentMethod') as string || 'CASH';
    const note = formData.get('note') as string || '';

    if (!purchaseId || isNaN(amount) || amount <= 0) {
      const t = await getTranslations('Errors');
    return { success: false, error: t('saveFailed') };
    }

    const purchase = await prisma.purchase.findUnique({ where: { id: purchaseId } });
    if (!purchase) {
      const t = await getTranslations('Errors');
    return { success: false, error: t('saveFailed') };
    }

    if (amount > purchase.remainingBalance) {
      const t = await getTranslations('Errors');
    return { success: false, error: t('saveFailed') };
    }

    const newPaidAmount = purchase.paidAmount + amount;
    const newRemaining = purchase.remainingBalance - amount;
    const newStatus = newRemaining <= 0 ? 'PAID' : 'PARTIAL';

    await prisma.$transaction([
      prisma.transaction.create({
        data: {
          type: 'PAYMENT',
          amount: amount,
          description: `Payment for Purchase ${purchase.purchaseNumber || purchase.id}${note ? ' - ' + note : ''}`,
          paymentMethod: method,
          date: date,
          supplierId: purchase.supplierId,
          category: 'Purchase Payment'
        }
      }),
      prisma.purchase.update({
        where: { id: purchaseId },
        data: {
          paidAmount: newPaidAmount,
          remainingBalance: newRemaining,
          status: newStatus
        }
      })
    ]);

    await createNotification({
      type: 'PAYMENT',
      title: 'پارەدانی نوێ بۆ دابینکار',
      message: `بڕی ${amount} درا بە دابینکار بۆ وەسڵی ژمارە ${purchase.purchaseNumber || purchase.id}.`,
      link: '/payments'
    });

    revalidatePath('/', 'layout');
    return { success: true };
  } catch (error: any) {
    console.error('Error recording purchase payment:', error);
    const t = await getTranslations('Errors');
    return { success: false, error: t('saveFailed') };
  }
}
