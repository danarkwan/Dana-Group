import { getTranslations } from 'next-intl/server'
import { prisma } from '@/lib/prisma';
import ProductsClient from './ProductsClient'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { hasAccess } from '@/lib/permissions'
import { redirect } from 'next/navigation'
import Pagination from '@/components/ui/Pagination'
import ProductsFilter from './ProductsFilter'


export default async function ProductsPage({ 
  params,
  searchParams
}: { 
  params: Promise<{ locale: string }>,
  searchParams: { page?: string, query?: string }
}) {
  const t = await getTranslations('Products')
  const { locale } = await params
  
  const session = await getServerSession(authOptions)
  if (!hasAccess(session?.user, 'products')) {
    redirect(`/${locale}`)
  }

  const page = Number(searchParams.page) || 1;
  const take = 20;
  const skip = (page - 1) * take;

  const where: any = {};
  if (searchParams.query) {
    where.OR = [
      { name: { contains: searchParams.query, mode: 'insensitive' } },
      { sku: { contains: searchParams.query, mode: 'insensitive' } },
      { category: { contains: searchParams.query, mode: 'insensitive' } }
    ];
  }

  const [productsRaw, totalCount, suppliers] = await Promise.all([
    prisma.product.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      skip,
      take,
      include: {
        supplier: {
          select: { id: true, name: true }
        },
        invoiceItems: {
          select: {
            quantity: true
          }
        }
      }
    }),
    prisma.product.count({ where }),
    prisma.supplier.findMany({
      orderBy: { name: 'asc' },
      select: { id: true, name: true }
    })
  ]);

  const totalPages = Math.ceil(totalCount / take);

  const products = productsRaw.map(p => {
    const sold = p.invoiceItems.reduce((acc, curr) => acc + curr.quantity, 0)
    return {
      id: p.id,
      name: p.name,
      sku: p.sku,
      description: p.description,
      image: p.image,
      price: p.price,
      purchasePrice: p.purchasePrice,
      stock: p.stock,
      minStock: p.minStock,
      unit: p.unit,
      category: p.category,
      supplierId: p.supplierId,
      supplierName: p.supplier?.name || null,
      sold
    }
  })

  return (
    <div className="pageContainer">
      <div className="pageHeader">
        <h1 className="pageTitle">{t('title')}</h1>
      </div>
      
      <ProductsFilter />
      
      <ProductsClient 
        initialProducts={products} 
        suppliers={suppliers}
        translations={{
          addProduct: t('addProduct'),
          emptyState: t('emptyState'),
          edit: t('edit'),
          delete: t('delete'),
          deleteConfirm: t('deleteConfirm'),
          manageStock: t('manageStock'),
          lowStock: t('lowStock'),
          sku: t('sku')
        }} 
      />

      <Pagination totalPages={totalPages} />
    </div>
  )
}
