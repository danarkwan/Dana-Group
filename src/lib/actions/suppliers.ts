'use server';
import { getTranslations } from 'next-intl/server';;

import { prisma } from '@/lib/prisma';
import { revalidatePath } from 'next/cache';

import { verifyServerActionAccess } from '@/lib/permissions';

export async function getSuppliers(query?: string, skip?: number, take?: number) {
  await verifyServerActionAccess('suppliers');

  try {
    const where = query ? {
      OR: [
        { name: { contains: query, mode: 'insensitive' as const } },
        { email: { contains: query, mode: 'insensitive' as const } },
        { phone: { contains: query, mode: 'insensitive' as const } }
      ]
    } : {};

    const [suppliers, totalCount] = await Promise.all([
      prisma.supplier.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        ...(skip !== undefined ? { skip } : {}),
        ...(take !== undefined ? { take } : {}),
        include: {
          _count: {
            select: { purchases: true }
          }
        }
      }),
      prisma.supplier.count({ where })
    ]);
    
    return { suppliers, totalCount };
  } catch (error: any) {
    console.error('Error fetching suppliers:', error);
    return { suppliers: [], totalCount: 0 };
  }
}

export async function createSupplier(formData: FormData) {
  await verifyServerActionAccess('suppliers');

  try {
    const name = formData.get('name') as string;
    const email = formData.get('email') as string | null;
    const phone = formData.get('phone') as string | null;
    const address = formData.get('address') as string | null;

    if (!name) {
      const t = await getTranslations('Errors');
      throw new Error(t('requiredFields'));
    }

    const supplier = await prisma.supplier.create({
      data: {
        name,
        email,
        phone,
        address,
      },
    });

    revalidatePath('/', 'layout');
    return { success: true, supplier };
  } catch (error: any) {
    console.error('Error creating supplier:', error);
    const t = await getTranslations('Errors');
    if (error.code === 'P2002') {
      if (error.meta?.target?.includes('email')) return { success: false, error: t('emailExists') };
      if (error.meta?.target?.includes('phone')) return { success: false, error: t('phoneExists') };
    }
    return { success: false, error: t('saveFailed') };
  }
}

export async function updateSupplier(id: string, formData: FormData) {
  await verifyServerActionAccess('suppliers');

  try {
    const name = formData.get('name') as string;
    const email = formData.get('email') as string | null;
    const phone = formData.get('phone') as string | null;
    const address = formData.get('address') as string | null;

    if (!name) {
      const t = await getTranslations('Errors');
      throw new Error(t('requiredFields'));
    }

    const supplier = await prisma.supplier.update({
      where: { id },
      data: {
        name,
        email,
        phone,
        address,
      },
    });

    revalidatePath('/', 'layout');
    return { success: true, supplier };
  } catch (error: any) {
    console.error('Error updating supplier:', error);
    const t = await getTranslations('Errors');
    if (error.code === 'P2002') {
      if (error.meta?.target?.includes('email')) return { success: false, error: t('emailExists') };
      if (error.meta?.target?.includes('phone')) return { success: false, error: t('phoneExists') };
    }
    return { success: false, error: t('saveFailed') };
  }
}

export async function deleteSupplier(id: string) {
  await verifyServerActionAccess('suppliers');

  try {
    await prisma.supplier.delete({
      where: { id },
    });
    revalidatePath('/', 'layout');
    return { success: true };
  } catch (error: any) {
    console.error('Error deleting supplier:', error);
    const t = await getTranslations('Errors');
    return { success: false, error: t('deleteFailed') };
  }
}

export async function getSupplierProfile(id: string) {
  await verifyServerActionAccess('suppliers');

  try {
    const supplier = await prisma.supplier.findUnique({
      where: { id },
      include: {
        purchases: {
          orderBy: { date: 'desc' },
        },
        transactions: {
          where: { type: 'PAYMENT' },
          orderBy: { date: 'desc' },
        }
      }
    });

    if (!supplier) {
      return null;
    }

    const totalPurchases = supplier.purchases.reduce((sum, purchase) => sum + purchase.total, 0);
    const totalPayments = supplier.transactions.reduce((sum, tx) => sum + tx.amount, 0);
    const remainingDebt = totalPurchases - totalPayments;

    return {
      ...supplier,
      totalPurchases,
      totalPayments,
      remainingDebt
    };
  } catch (error: any) {
    console.error('Error fetching supplier profile:', error);
    return null;
  }
}

