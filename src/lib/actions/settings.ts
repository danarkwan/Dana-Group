'use server';
import { verifyServerActionAccess } from '@/lib/permissions';

import { prisma } from '@/lib/prisma';
import { revalidatePath } from 'next/cache'
import bcrypt from 'bcryptjs'


export async function updateProfile(id: string, formData: FormData) {
  await verifyServerActionAccess('settings');

  try {
    const name = formData.get('name') as string
    const email = formData.get('email') as string
    const newPassword = formData.get('newPassword') as string

    const dataToUpdate: any = {
      name,
      email
    }

    if (newPassword && newPassword.trim() !== '') {
      const hashedPassword = await bcrypt.hash(newPassword, 10)
      dataToUpdate.password = hashedPassword
    }

    const user = await prisma.user.update({
      where: { id },
      data: dataToUpdate
    })

    revalidatePath('/', 'layout');
    return { success: true, user }
  } catch (error) {
    console.error('Failed to update profile:', error)
    return { success: false, error: 'هەڵەیەک ڕوویدا لە نوێکردنەوەی زانیارییەکان' }
  }
}
