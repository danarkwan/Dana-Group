'use server';

import { prisma } from '@/lib/prisma';
import { revalidatePath } from 'next/cache';

export async function createPurchase(data: any) {
  try {
    const purchase = await prisma.purchase.create({
      data: {
        purchaseNumber: data.purchaseNumber,
        supplierId: data.supplierId || null,
        date: new Date(data.date),
        dueDate: data.dueDate ? new Date(data.dueDate) : null,
        subtotal: data.subtotal,
        tax: data.tax,
        discount: data.discount,
        total: data.total,
        paidAmount: data.paidAmount,
        remainingBalance: data.remainingBalance,
        paymentMethod: data.paymentMethod,
        notes: data.notes,
        status: data.remainingBalance <= 0 ? 'PAID' : (data.paidAmount > 0 ? 'PARTIAL' : 'PENDING'),
        items: {
          create: data.items.map((item: any) => ({
            productId: item.productId || null,
            description: item.description || null,
            quantity: item.quantity,
            price: item.price
          }))
        }
      }
    });

    if (data.paidAmount > 0) {
      await prisma.transaction.create({
        data: {
          type: 'EXPENSE', // It's an expense because we paid the supplier
          amount: data.paidAmount,
          description: `Payment for Purchase ${purchase.purchaseNumber || purchase.id}`
        }
      });
    }

    revalidatePath('/', 'layout');
    revalidatePath('/', 'layout');
    
    return { success: true, purchase };
  } catch (error) {
    console.error('Failed to create purchase:', error);
    return { success: false, error: 'Failed to create purchase' };
  }
}

export async function deletePurchase(id: string) {
  try {
    const purchase = await prisma.purchase.findUnique({ where: { id } });
    if (!purchase) return { success: false, error: 'Purchase not found' };

    await prisma.$transaction([
      prisma.transaction.deleteMany({
        where: {
          description: {
            contains: purchase.purchaseNumber || purchase.id
          }
        }
      }),
      prisma.purchase.delete({ where: { id } })
    ]);
    
    revalidatePath('/', 'layout');
    revalidatePath('/', 'layout');
    revalidatePath('/', 'layout');
    return { success: true };
  } catch (error) {
    return { success: false, error: 'Failed to delete purchase' };
  }
}

export async function recordPurchasePayment(purchaseId: string, amount: number) {
  try {
    const purchase = await prisma.purchase.findUnique({ where: { id: purchaseId } });
    if (!purchase) throw new Error("Purchase not found");
      
    const newPaidAmount = purchase.paidAmount + amount;
    const newRemainingBalance = purchase.total - newPaidAmount;
    
    let newStatus = 'PENDING';
    if (newRemainingBalance <= 0) newStatus = 'PAID';
    else if (newPaidAmount > 0) newStatus = 'PARTIAL';

    await prisma.$transaction([
      prisma.purchase.update({
        where: { id: purchaseId },
        data: {
          paidAmount: newPaidAmount,
          remainingBalance: newRemainingBalance,
          status: newStatus
        }
      }),
      prisma.transaction.create({
        data: {
          type: 'EXPENSE',
          amount: amount,
          description: `Payment for Purchase ${purchase.purchaseNumber || purchase.id}`
        }
      })
    ]);

    revalidatePath('/', 'layout');
    revalidatePath('/', 'layout');
    
    return { success: true };
  } catch (error) {
    return { success: false, error: 'Failed to record payment' };
  }
}
