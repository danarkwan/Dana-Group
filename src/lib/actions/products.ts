'use server';
import { verifyServerActionAccess } from '@/lib/permissions';
import { getTranslations } from 'next-intl/server';

import { prisma } from '@/lib/prisma';
import { revalidatePath } from 'next/cache'
import fs from 'fs/promises'
import path from 'path'


export async function getProducts() {
  await verifyServerActionAccess('products');

  try {
    const products = await prisma.product.findMany({
      orderBy: { createdAt: 'desc' },
      include: {
        supplier: {
          select: { name: true }
        }
      }
    })
    return { success: true, products }
  } catch (error: any) {
    console.error('Failed to fetch products:', error)
    return { success: false, error: 'Failed to fetch products' }
  }
}

export async function createProduct(formData: FormData) {
  await verifyServerActionAccess('products');

  try {
    const name = formData.get('name') as string
    const sku = (formData.get('sku') as string) || null
    const description = formData.get('description') as string
    const price = parseFloat(formData.get('price') as string) || 0
    const purchasePrice = parseFloat(formData.get('purchasePrice') as string) || 0
    const category = formData.get('category') as string
    const stock = parseInt(formData.get('stock') as string) || 0
    const minStock = parseInt(formData.get('minStock') as string) || 0
    const unit = (formData.get('unit') as string) || 'pcs'
    const supplierId = (formData.get('supplierId') as string) || null
    const imageFile = formData.get('image') as File | null

    let imagePath = null

    if (imageFile && imageFile.size > 0) {
      const buffer = Buffer.from(await imageFile.arrayBuffer())
      const filename = `${Date.now()}-${imageFile.name.replaceAll(' ', '_')}`
      
      const uploadDir = path.join(process.cwd(), 'public', 'uploads', 'products')
      // Ensure directory exists
      await fs.mkdir(uploadDir, { recursive: true })
      
      await fs.writeFile(path.join(uploadDir, filename), buffer)
      imagePath = `/uploads/products/${filename}`
    }

    const product = await prisma.product.create({
      data: {
        name,
        sku,
        description,
        price,
        purchasePrice,
        category,
        stock,
        minStock,
        unit,
        supplierId,
        image: imagePath
      }
    })

    revalidatePath('/', 'layout');
    return { success: true, product }
  } catch (error: any) {
    console.error('Failed to create product:', error)
    const t = await getTranslations('Errors');
    return { success: false, error: t('saveFailed') }
  }
}

export async function deleteProduct(id: string) {
  await verifyServerActionAccess('products');

  try {
    await prisma.product.delete({ where: { id } })
    revalidatePath('/', 'layout');
    return { success: true }
  } catch (error: any) {
    const t = await getTranslations('Errors');
    return { success: false, error: t('deleteFailed') }
  }
}

export async function updateProduct(id: string, formData: FormData) {
  await verifyServerActionAccess('products');

  try {
    const name = formData.get('name') as string
    const sku = (formData.get('sku') as string) || null
    const description = formData.get('description') as string
    const price = parseFloat(formData.get('price') as string) || 0
    const purchasePrice = parseFloat(formData.get('purchasePrice') as string) || 0
    const category = formData.get('category') as string
    const stock = parseInt(formData.get('stock') as string) || 0
    const minStock = parseInt(formData.get('minStock') as string) || 0
    const unit = (formData.get('unit') as string) || 'pcs'
    const supplierId = (formData.get('supplierId') as string) || null
    const imageFile = formData.get('image') as File | null

    const dataToUpdate: any = {
      name,
      sku,
      description,
      price,
      purchasePrice,
      category,
      stock,
      minStock,
      unit,
      supplierId
    }

    if (imageFile && imageFile.size > 0) {
      const buffer = Buffer.from(await imageFile.arrayBuffer())
      const filename = `${Date.now()}-${imageFile.name.replaceAll(' ', '_')}`
      
      const uploadDir = path.join(process.cwd(), 'public', 'uploads', 'products')
      await fs.mkdir(uploadDir, { recursive: true })
      
      await fs.writeFile(path.join(uploadDir, filename), buffer)
      dataToUpdate.image = `/uploads/products/${filename}`
    }

    const product = await prisma.product.update({
      where: { id },
      data: dataToUpdate
    })

    revalidatePath('/', 'layout');
    return { success: true, product }
  } catch (error: any) {
    console.error('Failed to update product:', error)
    const t = await getTranslations('Errors');
    return { success: false, error: t('saveFailed') }
  }
}
