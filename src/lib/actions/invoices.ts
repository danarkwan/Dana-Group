'use server';
import { verifyServerActionAccess } from '@/lib/permissions';
import { getTranslations } from 'next-intl/server';

import { prisma } from '@/lib/prisma';
import { revalidatePath } from 'next/cache'


export async function createInvoice(data: any) {
  await verifyServerActionAccess('invoices');

  try {
    // Basic validation & formatting
    const invoice = await prisma.invoice.create({
      data: {
        invoiceNumber: data.invoiceNumber,
        customerId: data.customerId || null,
        customerName: data.customerName || null,
        date: new Date(data.date),
        dueDate: new Date(data.dueDate),
        subtotal: data.subtotal,
        tax: data.tax,
        discount: data.discount,
        total: data.total,
        paidAmount: data.paidAmount,
        remainingBalance: data.remainingBalance,
        paymentMethod: data.paymentMethod,
        notes: data.notes,
        terms: data.terms,
        status: data.remainingBalance <= 0 ? 'PAID' : (data.paidAmount > 0 ? 'PARTIAL' : 'PENDING'),
        items: {
          create: data.items.map((item: any) => ({
            productId: item.productId || null,
            description: item.description || 'Custom Item',
            quantity: item.quantity,
            price: item.price
          }))
        }
      }
    })

    if (data.paidAmount > 0) {
      await prisma.transaction.create({
        data: {
          type: 'INCOME',
          amount: data.paidAmount,
          description: `Payment for Invoice ${invoice.invoiceNumber}`,
          customerId: data.customerId || null
        }
      })
    }

    // Automatically update inventory
    for (const item of data.items) {
      if (item.productId && item.quantity > 0) {
        await prisma.product.update({
          where: { id: item.productId },
          data: {
            stock: { decrement: item.quantity }
          }
        });

        await prisma.stockMovement.create({
          data: {
            productId: item.productId,
            type: 'OUT',
            quantity: item.quantity,
            reason: `Sale Invoice ${invoice.invoiceNumber}`,
            reference: invoice.id
          }
        });
      }
    }

    revalidatePath('/', 'layout');
    revalidatePath('/', 'layout');
    
    return { success: true, invoice }
  } catch (error: any) {
    console.error('Failed to create invoice:', error)
    return { success: false, error: 'Failed to create invoice' }
  }
}

export async function deleteInvoice(id: string) {
  await verifyServerActionAccess('invoices');

  try {
    const invoice = await prisma.invoice.findUnique({ 
      where: { id },
      include: { items: true }
    });
    if (!invoice) {
      const t = await getTranslations('Errors');
      return { success: false, error: t('saveFailed') };
    }

    // Revert inventory
    for (const item of invoice.items) {
      if (item.productId && item.quantity > 0) {
        await prisma.product.update({
          where: { id: item.productId },
          data: { stock: { increment: item.quantity } }
        });

        await prisma.stockMovement.create({
          data: {
            productId: item.productId,
            type: 'IN',
            quantity: item.quantity,
            reason: `Reverted Sale Invoice ${invoice.invoiceNumber}`,
            reference: invoice.id
          }
        });
      }
    }

    await prisma.$transaction([
      prisma.transaction.deleteMany({
        where: {
          description: {
            contains: invoice.invoiceNumber
          }
        }
      }),
      prisma.invoice.delete({ where: { id } })
    ]);

    revalidatePath('/', 'layout');
    revalidatePath('/', 'layout');
    revalidatePath('/', 'layout');
    return { success: true };
  } catch (error: any) {
    const t = await getTranslations('Errors');
    return { success: false, error: t('deleteFailed') };
  }
}

export async function recordPayment(invoiceId: string, amount: number) {
  await verifyServerActionAccess('invoices');

  try {
    const invoice = await prisma.invoice.findUnique({ where: { id: invoiceId } })
    if (!invoice) {
      const t = await getTranslations('Errors');
      throw new Error(t('notFound'))
    }
      
    const newPaidAmount = invoice.paidAmount + amount
    const newRemainingBalance = invoice.total - newPaidAmount
    
    let newStatus = 'PENDING'
    if (newRemainingBalance <= 0) newStatus = 'PAID'
    else if (newPaidAmount > 0) newStatus = 'PARTIAL'

    await prisma.$transaction([
      prisma.invoice.update({
        where: { id: invoiceId },
        data: {
          paidAmount: newPaidAmount,
          remainingBalance: newRemainingBalance,
          status: newStatus
        }
      }),
      prisma.transaction.create({
        data: {
          type: 'INCOME',
          amount: amount,
          description: `Payment for Invoice ${invoice.invoiceNumber}`,
          customerId: invoice.customerId
        }
      })
    ])

    revalidatePath('/', 'layout');
    revalidatePath('/', 'layout');
    
    return { success: true }
  } catch (error: any) {
    return { success: false, error: 'Failed to record payment' }
  }
}
