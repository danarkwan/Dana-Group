'use server'

import { prisma } from '@/lib/prisma'
import { revalidatePath } from 'next/cache'
import { verifyServerActionAccess } from '@/lib/permissions'
import { v4 as uuidv4 } from 'uuid' // Or just let Prisma generate CUID, wait, let's use standard prisma creates without importing uuid unless needed. Actually, transactionNumber uses a custom format in other places.

export async function getPayrolls() {
  await verifyServerActionAccess('payroll')
  
  return prisma.payroll.findMany({
    include: {
      employee: {
        select: {
          fullName: true,
          employeeId: true,
          department: true,
        }
      }
    },
    orderBy: {
      date: 'desc'
    }
  })
}

export async function createPayroll(data: {
  employeeId: string
  amount: number
  date?: Date
  period: string
  method: string
  notes?: string
  status?: string
}) {
  await verifyServerActionAccess('payroll')
  
  // If status is paid immediately upon creation, we must create a transaction.
  const isPaid = data.status === 'PAID'
  
  let result;
  
  if (isPaid) {
    const employee = await prisma.employee.findUnique({ where: { id: data.employeeId } })
    if (!employee) throw new Error("Employee not found")
      
    result = await prisma.$transaction(async (tx) => {
      const transaction = await tx.transaction.create({
        data: {
          type: 'EXPENSE',
          category: 'مووچە (Salary)',
          amount: data.amount,
          description: `Salary payment for ${employee.fullName} (${data.period})`,
          paymentMethod: data.method,
          status: 'COMPLETED',
          date: data.date || new Date(),
        }
      })
      
      return tx.payroll.create({
        data: {
          ...data,
          status: 'PAID',
          transactionId: transaction.id
        }
      })
    })
  } else {
    result = await prisma.payroll.create({
      data: {
        ...data,
        status: data.status || 'PENDING'
      }
    })
  }
  
  revalidatePath('/[locale]/(dashboard)/payroll', 'page')
  return result
}

export async function updatePayroll(id: string, data: {
  amount?: number
  period?: string
  method?: string
  notes?: string
  date?: Date
}) {
  await verifyServerActionAccess('payroll')
  
  const payroll = await prisma.payroll.findUnique({ where: { id } })
  if (!payroll) throw new Error("Payroll not found")
  if (payroll.status === 'PAID') throw new Error("Cannot edit a paid payroll")
  
  const result = await prisma.payroll.update({
    where: { id },
    data
  })
  
  revalidatePath('/[locale]/(dashboard)/payroll', 'page')
  return result
}

export async function markPayrollPaid(id: string, paymentMethod?: string) {
  await verifyServerActionAccess('payroll')
  
  const payroll = await prisma.payroll.findUnique({ 
    where: { id },
    include: { employee: true }
  })
  
  if (!payroll) throw new Error("Payroll not found")
  if (payroll.status === 'PAID') throw new Error("Payroll is already paid")
  
  const result = await prisma.$transaction(async (tx) => {
    const transaction = await tx.transaction.create({
      data: {
        type: 'EXPENSE',
        category: 'مووچە (Salary)',
        amount: payroll.amount,
        description: `Salary payment for ${payroll.employee.fullName} (${payroll.period})`,
        paymentMethod: paymentMethod || payroll.method,
        status: 'COMPLETED',
        date: new Date(),
      }
    })
    
    return tx.payroll.update({
      where: { id },
      data: {
        status: 'PAID',
        method: paymentMethod || payroll.method,
        transactionId: transaction.id,
        date: new Date()
      }
    })
  })
  
  revalidatePath('/[locale]/(dashboard)/payroll', 'page')
  return result
}

export async function deletePayroll(id: string) {
  await verifyServerActionAccess('payroll')
  
  const payroll = await prisma.payroll.findUnique({ where: { id } })
  if (!payroll) throw new Error("Payroll not found")
    
  await prisma.$transaction(async (tx) => {
    if (payroll.transactionId) {
      await tx.transaction.delete({ where: { id: payroll.transactionId } })
    }
    await tx.payroll.delete({ where: { id } })
  })
  
  revalidatePath('/[locale]/(dashboard)/payroll', 'page')
  return true
}
