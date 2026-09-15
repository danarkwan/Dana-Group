'use server';

import { prisma } from '@/lib/prisma';
import { revalidatePath } from 'next/cache';

export async function getSuppliers() {
  try {
    const suppliers = await prisma.supplier.findMany({
      orderBy: { createdAt: 'desc' },
      include: {
        _count: {
          select: { purchases: true }
        }
      }
    });
    return suppliers;
  } catch (error) {
    console.error('Error fetching suppliers:', error);
    return [];
  }
}

export async function createSupplier(formData: FormData) {
  try {
    const name = formData.get('name') as string;
    const email = formData.get('email') as string | null;
    const phone = formData.get('phone') as string | null;
    const address = formData.get('address') as string | null;

    if (!name) {
      throw new Error('Name is required');
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
  } catch (error) {
    console.error('Error creating supplier:', error);
    return { success: false, error: 'Failed to create supplier' };
  }
}

export async function updateSupplier(id: string, formData: FormData) {
  try {
    const name = formData.get('name') as string;
    const email = formData.get('email') as string | null;
    const phone = formData.get('phone') as string | null;
    const address = formData.get('address') as string | null;

    if (!name) {
      throw new Error('Name is required');
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
  } catch (error) {
    console.error('Error updating supplier:', error);
    return { success: false, error: 'Failed to update supplier' };
  }
}

export async function deleteSupplier(id: string) {
  try {
    await prisma.supplier.delete({
      where: { id },
    });
    revalidatePath('/', 'layout');
    return { success: true };
  } catch (error) {
    console.error('Error deleting supplier:', error);
    return { success: false, error: 'Failed to delete supplier' };
  }
}
