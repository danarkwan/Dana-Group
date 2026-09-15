'use server'

import { PrismaClient } from '@prisma/client'
import { revalidatePath } from 'next/cache'

const prisma = new PrismaClient()

export async function createInvoice(data: any) {
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
          description: `Payment for Invoice ${invoice.invoiceNumber}`
        }
      })
    }

    revalidatePath('/', 'layout');
    revalidatePath('/', 'layout');
    
    return { success: true, invoice }
  } catch (error) {
    console.error('Failed to create invoice:', error)
    return { success: false, error: 'Failed to create invoice' }
  }
}

export async function deleteInvoice(id: string) {
  try {
    const invoice = await prisma.invoice.findUnique({ where: { id } });
    if (!invoice) return { success: false, error: 'Invoice not found' };

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
  } catch (error) {
    return { success: false, error: 'Failed to delete invoice' };
  }
}

export async function recordPayment(invoiceId: string, amount: number) {
  try {
    const invoice = await prisma.invoice.findUnique({ where: { id: invoiceId } })
    if (!invoice) throw new Error("Invoice not found")
      
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
          description: `Payment for Invoice ${invoice.invoiceNumber}`
        }
      })
    ])

    revalidatePath('/', 'layout');
    revalidatePath('/', 'layout');
    
    return { success: true }
  } catch (error) {
    return { success: false, error: 'Failed to record payment' }
  }
}
