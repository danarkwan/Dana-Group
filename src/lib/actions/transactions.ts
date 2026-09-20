'use server';
import { verifyServerActionAccess } from '@/lib/permissions';
import { getTranslations } from 'next-intl/server';

import { prisma } from '@/lib/prisma';
import { revalidatePath } from 'next/cache'
import { createNotification } from './notifications'


export async function createTransaction(formData: FormData) {
  await verifyServerActionAccess('transactions');

  try {
    const type = formData.get('type') as string
    const amount = parseFloat(formData.get('amount') as string) || 0
    const description = formData.get('description') as string
    const category = formData.get('category') as string
    const paymentMethod = formData.get('paymentMethod') as string
    const status = formData.get('status') as string || 'COMPLETED'
    const customerId = formData.get('customerId') as string || null
    const supplierId = formData.get('supplierId') as string || null
    const dateStr = formData.get('date') as string
    
    let date = new Date()
    if (dateStr) {
      date = new Date(dateStr)
    }

    // Generate transaction number
    const txCount = await prisma.transaction.count()
    const transactionNumber = `TRX-${1000 + txCount + 1}`

    const transaction = await prisma.transaction.create({
      data: {
        transactionNumber,
        type,
        amount,
        description,
        category,
        paymentMethod,
        status,
        customerId,
        supplierId,
        date
      }
    })

    await createNotification({
      type: 'TRANSACTION',
      title: 'مامەڵەی نوێ',
      message: `مامەڵەی نوێ (${type}) بە بڕی ${amount} تۆمارکرا.`,
      link: '/transactions'
    });

    revalidatePath('/', 'layout');
    return { success: true, transaction }
  } catch (error: any) {
    console.error('Failed to create transaction:', error)
    const t = await getTranslations('Errors');
    return { success: false, error: t('saveFailed') }
  }
}

export async function updateTransaction(id: string, formData: FormData) {
  await verifyServerActionAccess('transactions');

  try {
    const type = formData.get('type') as string
    const amount = parseFloat(formData.get('amount') as string) || 0
    const description = formData.get('description') as string
    const category = formData.get('category') as string
    const paymentMethod = formData.get('paymentMethod') as string
    const status = formData.get('status') as string || 'COMPLETED'
    const customerId = formData.get('customerId') as string || null
    const supplierId = formData.get('supplierId') as string || null
    const dateStr = formData.get('date') as string
    
    let date = new Date()
    if (dateStr) {
      date = new Date(dateStr)
    }

    const transaction = await prisma.transaction.update({
      where: { id },
      data: {
        type,
        amount,
        description,
        category,
        paymentMethod,
        status,
        customerId,
        supplierId,
        date
      }
    })

    revalidatePath('/', 'layout');
    return { success: true, transaction }
  } catch (error: any) {
    console.error('Failed to update transaction:', error)
    const t = await getTranslations('Errors');
    return { success: false, error: t('saveFailed') }
  }
}

export async function deleteTransaction(id: string) {
  await verifyServerActionAccess('transactions');

  try {
    await prisma.transaction.delete({ where: { id } })
    revalidatePath('/', 'layout');
    return { success: true }
  } catch (error: any) {
    console.error('Failed to delete transaction:', error)
    const t = await getTranslations('Errors');
    return { success: false, error: t('deleteFailed') }
  }
}
