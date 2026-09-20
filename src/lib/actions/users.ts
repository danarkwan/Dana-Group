'use server';
import { getTranslations } from 'next-intl/server';;

import { prisma } from '@/lib/prisma';
import { revalidatePath } from 'next/cache';
import { verifyServerActionAccess } from '@/lib/permissions';

export async function getUsers() {
  await verifyServerActionAccess('users');
  try {
    const users = await prisma.user.findMany({
      orderBy: { createdAt: 'desc' },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        permissions: true,
        createdAt: true,
      }
    });
    return users;
  } catch (error: any) {
    console.error('Error fetching users:', error);
    return [];
  }
}

export async function updateUserRoleAndPermissions(id: string, role: string, permissions: string[]) {
  await verifyServerActionAccess('users');
  try {
    const user = await prisma.user.update({
      where: { id },
      data: {
        role,
        permissions,
      },
    });

    revalidatePath('/', 'layout');
    return { success: true, user };
  } catch (error: any) {
    console.error('Error updating user:', error);
    const t = await getTranslations('Errors');
    return { success: false, error: t('saveFailed') };
  }
}

export async function deleteUser(id: string) {
  await verifyServerActionAccess('users');
  try {
    await prisma.user.delete({
      where: { id },
    });
    revalidatePath('/', 'layout');
    return { success: true };
  } catch (error: any) {
    console.error('Error deleting user:', error);
    const t = await getTranslations('Errors');
    return { success: false, error: t('deleteFailed') };
  }
}
