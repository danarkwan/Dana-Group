import { prisma } from '@/lib/prisma';
import { notFound } from 'next/navigation'
import InvoiceClient from './InvoiceClient'


export default async function InvoicePage({ params }: { params: Promise<{ locale: string, id: string }> }) {
  const { id } = await params
  
  const invoice = await prisma.invoice.findUnique({
    where: { id },
    include: {
      customer: true,
      items: {
        include: {
          product: true
        }
      }
    }
  })

  if (!invoice) {
    notFound()
  }

  return <InvoiceClient invoice={invoice} />
}
