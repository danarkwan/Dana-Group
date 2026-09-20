'use server';
import { getTranslations } from 'next-intl/server';;

import { prisma } from '@/lib/prisma';
import { revalidatePath } from 'next/cache';

import { verifyServerActionAccess } from '@/lib/permissions';

export async function createPurchase(data: any) {
  await verifyServerActionAccess('inventory');

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
          type: 'PAYMENT', 
          amount: data.paidAmount,
          description: `Payment for Purchase ${purchase.purchaseNumber || purchase.id}`,
          supplierId: data.supplierId || null,
        }
      });
    }

    // Automatically update inventory
    for (const item of data.items) {
      if (item.productId && item.quantity > 0) {
        await prisma.product.update({
          where: { id: item.productId },
          data: {
            stock: { increment: item.quantity },
            purchasePrice: item.price
          }
        });

        await prisma.stockMovement.create({
          data: {
            productId: item.productId,
            type: 'IN',
            quantity: item.quantity,
            reason: `Purchase ${purchase.purchaseNumber || purchase.id}`,
            reference: purchase.id
          }
        });
      }
    }

    revalidatePath('/', 'layout');
    revalidatePath('/', 'layout');
    
    return { success: true, purchase };
  } catch (error: any) {
    console.error('Failed to create purchase:', error);
    const t = await getTranslations('Errors');
    return { success: false, error: t('saveFailed') };
  }
}

export async function deletePurchase(id: string) {
  await verifyServerActionAccess('inventory');

  try {
    const purchase = await prisma.purchase.findUnique({ 
      where: { id },
      include: { items: true } 
    });
    if (!purchase) {
      const t = await getTranslations('Errors');
      return { success: false, error: t('saveFailed') };
    }

    // Revert inventory
    for (const item of purchase.items) {
      if (item.productId && item.quantity > 0) {
        await prisma.product.update({
          where: { id: item.productId },
          data: { stock: { decrement: item.quantity } }
        });

        await prisma.stockMovement.create({
          data: {
            productId: item.productId,
            type: 'OUT',
            quantity: item.quantity,
            reason: `Reverted Purchase ${purchase.purchaseNumber || purchase.id}`,
            reference: purchase.id
          }
        });
      }
    }

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
  } catch (error: any) {
    const t = await getTranslations('Errors');
    return { success: false, error: t('deleteFailed') };
  }
}

export async function recordPurchasePayment(purchaseId: string, amount: number) {
  await verifyServerActionAccess('inventory');

  try {
    const purchase = await prisma.purchase.findUnique({ where: { id: purchaseId } });
    if (!purchase) {
      const t = await getTranslations('Errors');
      throw new Error(t('notFound'))
    }
      
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
          type: 'PAYMENT',
          amount: amount,
          description: `Payment for Purchase ${purchase.purchaseNumber || purchase.id}`,
          supplierId: purchase.supplierId
        }
      })
    ]);

    revalidatePath('/', 'layout');
    revalidatePath('/', 'layout');
    
    return { success: true };
  } catch (error: any) {
    const t = await getTranslations('Errors');
    return { success: false, error: t('saveFailed') };
  }
}
