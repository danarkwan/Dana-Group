'use server';
import { verifyServerActionAccess } from '@/lib/permissions';
import { getTranslations } from 'next-intl/server';

import { prisma } from '@/lib/prisma';
import { revalidatePath } from 'next/cache'
import { createNotification } from './notifications'


export async function getStockMovements(productId?: string) {
  await verifyServerActionAccess('inventory');

  try {
    const whereClause = productId ? { productId } : {}
    const movements = await prisma.stockMovement.findMany({
      where: whereClause,
      include: {
        product: { select: { name: true, sku: true } },
        user: { select: { name: true } }
      },
      orderBy: { date: 'desc' },
      take: 50
    })
    return { success: true, movements }
  } catch (error) {
    console.error('Failed to fetch stock movements:', error)
    return { success: false, error: 'Failed to fetch stock movements' }
  }
}

export async function recordStockMovement(
  productId: string,
  type: 'IN' | 'OUT' | 'ADJUSTMENT',
  quantity: number,
  reason?: string,
  userId?: string
) {
  await verifyServerActionAccess('inventory');

  try {
    const result = await prisma.$transaction(async (tx) => {
      const product = await tx.product.findUnique({
        where: { id: productId }
      })

      if (!product) {
        const t = await getTranslations('Errors');
        throw new Error(t('notFound'))
      }

      let newStock = product.stock

      if (type === 'IN') {
        newStock += quantity
      } else if (type === 'OUT') {
        if (product.stock < quantity) {
          const t = await getTranslations('Errors');
          throw new Error(t('insufficientStock'))
        }
        newStock -= quantity
      } else if (type === 'ADJUSTMENT') {
        newStock = quantity // for adjustment, quantity is the NEW exact stock level
      }

      if (newStock < 0) {
        const t = await getTranslations('Errors');
        throw new Error(t('insufficientStock'))
      }

      const updatedProduct = await tx.product.update({
        where: { id: productId },
        data: { stock: newStock }
      })

      const movement = await tx.stockMovement.create({
        data: {
          productId,
          type,
          quantity: type === 'ADJUSTMENT' ? (newStock - product.stock) : quantity,
          reason,
          userId
        }
      })

      return { product: updatedProduct, movement }
    })

    if (result.product.stock <= result.product.minStock) {
      await createNotification({
        type: 'LOW_STOCK',
        title: 'کاڵا کەمە لە کۆگا',
        message: `کاڵای "${result.product.name}" ژمارەی گەیشتووەتە ئاستی کەمترین (${result.product.stock}).`,
        link: '/inventory'
      });
    }

    revalidatePath('/', 'layout')
    return { success: true, data: result }
  } catch (error: any) {
    console.error('Failed to record stock movement:', error)
    return { success: false, error: error.message || 'Failed to update stock' }
  }
}
