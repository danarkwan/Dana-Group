'use server'

import { PrismaClient } from '@prisma/client'
import { revalidatePath } from 'next/cache'
import fs from 'fs/promises'
import path from 'path'

const prisma = new PrismaClient()

export async function getProducts() {
  try {
    const products = await prisma.product.findMany({
      orderBy: { createdAt: 'desc' }
    })
    return { success: true, products }
  } catch (error) {
    console.error('Failed to fetch products:', error)
    return { success: false, error: 'Failed to fetch products' }
  }
}

export async function createProduct(formData: FormData) {
  try {
    const name = formData.get('name') as string
    const description = formData.get('description') as string
    const price = parseFloat(formData.get('price') as string) || 0
    const category = formData.get('category') as string
    const stock = parseInt(formData.get('stock') as string) || 0
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
        description,
        price,
        category,
        stock,
        image: imagePath
      }
    })

    revalidatePath('/', 'layout');
    return { success: true, product }
  } catch (error) {
    console.error('Failed to create product:', error)
    return { success: false, error: 'Failed to create product' }
  }
}

export async function deleteProduct(id: string) {
  try {
    await prisma.product.delete({ where: { id } })
    revalidatePath('/', 'layout');
    return { success: true }
  } catch (error) {
    return { success: false, error: 'Failed to delete product' }
  }
}

export async function updateProduct(id: string, formData: FormData) {
  try {
    const name = formData.get('name') as string
    const description = formData.get('description') as string
    const price = parseFloat(formData.get('price') as string) || 0
    const category = formData.get('category') as string
    const stock = parseInt(formData.get('stock') as string) || 0
    const imageFile = formData.get('image') as File | null

    const dataToUpdate: any = {
      name,
      description,
      price,
      category,
      stock
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
  } catch (error) {
    console.error('Failed to update product:', error)
    return { success: false, error: 'Failed to update product' }
  }
}
