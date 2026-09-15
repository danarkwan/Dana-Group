import { getTranslations } from 'next-intl/server'
import { PrismaClient } from '@prisma/client'
import ProductsClient from './ProductsClient'

const prisma = new PrismaClient()

export default async function ProductsPage() {
  const t = await getTranslations('Products')
  
  // Fetch products with their invoice items to calculate sold quantity
  const productsRaw = await prisma.product.findMany({
    orderBy: { createdAt: 'desc' },
    include: {
      invoiceItems: {
        select: {
          quantity: true
        }
      }
    }
  })

  const products = productsRaw.map(p => {
    const sold = p.invoiceItems.reduce((acc, curr) => acc + curr.quantity, 0)
    return {
      id: p.id,
      name: p.name,
      description: p.description,
      image: p.image,
      price: p.price,
      stock: p.stock,
      category: p.category,
      sold
    }
  })

  return (
    <div className="pageContainer">
      <div className="pageHeader">
        <h1 className="pageTitle">{t('title')}</h1>
      </div>
      
      <ProductsClient 
        initialProducts={products} 
        translations={{
          addProduct: t('addProduct'),
          emptyState: t('emptyState'),
          edit: t('edit'),
          delete: t('delete'),
          deleteConfirm: t('deleteConfirm')
        }} 
      />
    </div>
  )
}
