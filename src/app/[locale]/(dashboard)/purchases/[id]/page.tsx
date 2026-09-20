import { prisma } from '@/lib/prisma';
import { notFound } from 'next/navigation'
import PurchaseClient from './PurchaseClient'


export default async function PurchasePage({ params }: { params: Promise<{ locale: string, id: string }> }) {
  const { id } = await params
  
  const purchase = await prisma.purchase.findUnique({
    where: { id },
    include: {
      supplier: true,
      items: {
        include: {
          product: true
        }
      }
    }
  })

  if (!purchase) {
    notFound()
  }

  return <PurchaseClient purchase={purchase} />
}
