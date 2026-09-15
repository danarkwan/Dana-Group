'use server'

import { PrismaClient } from '@prisma/client'
import { revalidatePath } from 'next/cache'

const prisma = new PrismaClient()

export async function createTransaction(formData: FormData) {
  try {
    const type = formData.get('type') as string
    const amount = parseFloat(formData.get('amount') as string) || 0
    const description = formData.get('description') as string
    const dateStr = formData.get('date') as string
    
    let date = new Date()
    if (dateStr) {
      date = new Date(dateStr)
    }

    const transaction = await prisma.transaction.create({
      data: {
        type,
        amount,
        description,
        date
      }
    })

    revalidatePath('/', 'layout');
    return { success: true, transaction }
  } catch (error) {
    console.error('Failed to create transaction:', error)
    return { success: false, error: 'Failed to create transaction' }
  }
}

export async function updateTransaction(id: string, formData: FormData) {
  try {
    const type = formData.get('type') as string
    const amount = parseFloat(formData.get('amount') as string) || 0
    const description = formData.get('description') as string
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
        date
      }
    })

    revalidatePath('/', 'layout');
    return { success: true, transaction }
  } catch (error) {
    console.error('Failed to update transaction:', error)
    return { success: false, error: 'Failed to update transaction' }
  }
}

export async function deleteTransaction(id: string) {
  try {
    await prisma.transaction.delete({ where: { id } })
    revalidatePath('/', 'layout');
    return { success: true }
  } catch (error) {
    console.error('Failed to delete transaction:', error)
    return { success: false, error: 'Failed to delete transaction' }
  }
}
