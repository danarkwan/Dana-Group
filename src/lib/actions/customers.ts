'use server';
import { getTranslations } from 'next-intl/server';;

import { prisma } from '@/lib/prisma';
import { revalidatePath } from 'next/cache';

import { verifyServerActionAccess } from '@/lib/permissions';

export async function getCustomers(query?: string, skip?: number, take?: number) {
  await verifyServerActionAccess('customers');

  try {
    const where = query ? {
      OR: [
        { name: { contains: query, mode: 'insensitive' as const } },
        { email: { contains: query, mode: 'insensitive' as const } },
        { phone: { contains: query, mode: 'insensitive' as const } }
      ]
    } : {};

    const [customersRaw, totalCount] = await Promise.all([
      prisma.customer.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        ...(skip !== undefined ? { skip } : {}),
        ...(take !== undefined ? { take } : {}),
        include: {
          _count: {
            select: { invoices: true }
          },
          invoices: {
            select: { total: true }
          },
          transactions: {
            where: { type: 'INCOME' },
            select: { amount: true }
          }
        }
      }),
      prisma.customer.count({ where })
    ]);
    
    const customers = customersRaw.map(customer => {
      const totalInvoices = customer.invoices.reduce((sum, inv) => sum + inv.total, 0);
      const totalPayments = customer.transactions.reduce((sum, tx) => sum + tx.amount, 0);
      const remainingDebt = totalInvoices - totalPayments;
      
      const { invoices, transactions, ...rest } = customer;
      return { ...rest, remainingDebt };
    });

    return { customers, totalCount };
  } catch (error: any) {
    console.error('Error fetching customers:', error);
    return { customers: [], totalCount: 0 };
  }
}

export async function createCustomer(formData: FormData) {
  await verifyServerActionAccess('customers');

  try {
    const name = formData.get('name') as string;
    const email = formData.get('email') as string | null;
    const phone = formData.get('phone') as string | null;
    const address = formData.get('address') as string | null;

    if (!name) {
      const t = await getTranslations('Errors');
      throw new Error(t('requiredFields'));
    }

    const customer = await prisma.customer.create({
      data: {
        name,
        email,
        phone,
        address,
      },
    });

    revalidatePath('/', 'layout');
    return { success: true, customer };
  } catch (error: any) {
    console.error('Error creating customer:', error);
    const t = await getTranslations('Errors');
    if (error.code === 'P2002') {
      if (error.meta?.target?.includes('email')) return { success: false, error: t('emailExists') };
      if (error.meta?.target?.includes('phone')) return { success: false, error: t('phoneExists') };
    }
    return { success: false, error: t('saveFailed') };
  }
}

export async function updateCustomer(id: string, formData: FormData) {
  await verifyServerActionAccess('customers');

  try {
    const name = formData.get('name') as string;
    const email = formData.get('email') as string | null;
    const phone = formData.get('phone') as string | null;
    const address = formData.get('address') as string | null;

    if (!name) {
      const t = await getTranslations('Errors');
      throw new Error(t('requiredFields'));
    }

    const customer = await prisma.customer.update({
      where: { id },
      data: {
        name,
        email,
        phone,
        address,
      },
    });

    revalidatePath('/', 'layout');
    return { success: true, customer };
  } catch (error: any) {
    console.error('Error updating customer:', error);
    const t = await getTranslations('Errors');
    if (error.code === 'P2002') {
      if (error.meta?.target?.includes('email')) return { success: false, error: t('emailExists') };
      if (error.meta?.target?.includes('phone')) return { success: false, error: t('phoneExists') };
    }
    return { success: false, error: t('saveFailed') };
  }
}

export async function deleteCustomer(id: string) {
  await verifyServerActionAccess('customers');

  try {
    await prisma.customer.delete({
      where: { id },
    });
    revalidatePath('/', 'layout');
    return { success: true };
  } catch (error: any) {
    console.error('Error deleting customer:', error);
    const t = await getTranslations('Errors');
    return { success: false, error: t('deleteFailed') };
  }
}
