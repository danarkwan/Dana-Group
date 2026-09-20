'use server'

import { prisma } from '@/lib/prisma'
import { revalidatePath } from 'next/cache'
import { verifyServerActionAccess } from '@/lib/permissions'

export async function getEmployees() {
  await verifyServerActionAccess('employees')
  
  return prisma.employee.findMany({
    orderBy: {
      createdAt: 'desc'
    }
  })
}

export async function getEmployeeById(id: string) {
  await verifyServerActionAccess('employees')
  
  return prisma.employee.findUnique({
    where: { id },
    include: {
      payrolls: {
        orderBy: { date: 'desc' }
      }
    }
  })
}

export async function createEmployee(data: {
  fullName: string
  employeeId: string
  phone?: string
  jobPosition?: string
  department?: string
  startDate?: Date
  salaryType: string
  baseSalary: number
  notes?: string
}) {
  await verifyServerActionAccess('employees')
  
  const result = await prisma.employee.create({
    data
  })
  
  revalidatePath('/[locale]/(dashboard)/employees', 'page')
  return result
}

export async function updateEmployee(id: string, data: {
  fullName?: string
  employeeId?: string
  phone?: string
  jobPosition?: string
  department?: string
  startDate?: Date
  salaryType?: string
  baseSalary?: number
  notes?: string
  isActive?: boolean
}) {
  await verifyServerActionAccess('employees')
  
  const result = await prisma.employee.update({
    where: { id },
    data
  })
  
  revalidatePath('/[locale]/(dashboard)/employees', 'page')
  return result
}

export async function deleteEmployee(id: string) {
  await verifyServerActionAccess('employees')
  
  const result = await prisma.employee.delete({
    where: { id }
  })
  
  revalidatePath('/[locale]/(dashboard)/employees', 'page')
  return result
}
