import React from 'react'
import { Prisma } from '@prisma/client'
import { useTranslations } from 'next-intl'
import { formatCurrencyBoth } from '@/lib/formatters'

type InvoiceWithRelations = Prisma.InvoiceGetPayload<{
  include: { customer: true, items: true }
}>

export default function InvoicePrintTemplate({ invoice, companyInfo }: { invoice: InvoiceWithRelations, companyInfo?: any }) {
  const t = useTranslations('Invoices')
  
  return (
    <div className="hidden print:block w-full bg-white text-black p-8 font-sans" dir="auto">
      <div className="flex justify-between items-start mb-12 border-b-2 border-gray-800 pb-6">
        <div>
          <h1 className="text-4xl font-bold text-gray-900 mb-2">INVOICE</h1>
          <p className="text-gray-500 font-medium">#{invoice.invoiceNumber}</p>
        </div>
        <div className="text-right">
          <h2 className="text-xl font-bold text-gray-900">{companyInfo?.name || 'Dana Group'}</h2>
          <p className="text-gray-600">{companyInfo?.address || 'Erbil, Kurdistan Region, Iraq'}</p>
          <p className="text-gray-600">{companyInfo?.email || 'info@danagroup.com'}</p>
          <p className="text-gray-600">{companyInfo?.phone || '+964 000 000 0000'}</p>
        </div>
      </div>

      <div className="flex justify-between mb-12">
        <div>
          <h3 className="text-sm font-bold text-gray-400 uppercase tracking-wider mb-2">Billed To</h3>
          <p className="font-bold text-gray-900">{invoice.customer?.name || 'Walk-in Customer'}</p>
          {invoice.customer?.email && <p className="text-gray-600">{invoice.customer.email}</p>}
          {invoice.customer?.phone && <p className="text-gray-600">{invoice.customer.phone}</p>}
        </div>
        <div className="text-right">
          <div className="mb-2">
            <span className="text-sm font-bold text-gray-400 uppercase tracking-wider">Invoice Date</span>
            <p className="font-bold text-gray-900">{new Date(invoice.date).toLocaleDateString()}</p>
          </div>
          <div>
            <span className="text-sm font-bold text-gray-400 uppercase tracking-wider">Due Date</span>
            <p className="font-bold text-gray-900">{new Date(invoice.dueDate).toLocaleDateString()}</p>
          </div>
        </div>
      </div>

      <table className="w-full mb-12 text-left">
        <thead>
          <tr className="border-b-2 border-gray-800 text-gray-900">
            <th className="py-3 font-bold uppercase text-sm tracking-wider">Description</th>
            <th className="py-3 font-bold uppercase text-sm tracking-wider text-right">Qty</th>
            <th className="py-3 font-bold uppercase text-sm tracking-wider text-right">Price</th>
            <th className="py-3 font-bold uppercase text-sm tracking-wider text-right">Total</th>
          </tr>
        </thead>
        <tbody>
          {invoice.items.map((item, idx) => (
            <tr key={idx} className="border-b border-gray-200">
              <td className="py-4 text-gray-900">Product Item</td>
              <td className="py-4 text-gray-900 text-right">{item.quantity}</td>
              <td className="py-4 text-gray-900 text-right">{formatCurrencyBoth(item.price)}</td>
              <td className="py-4 text-gray-900 text-right">{formatCurrencyBoth(item.quantity * item.price)}</td>
            </tr>
          ))}
        </tbody>
      </table>

      <div className="flex justify-end mb-12">
        <div className="w-1/2">
          <div className="flex justify-between py-2 border-b border-gray-200">
            <span className="text-gray-600 font-medium">Subtotal</span>
            <span className="text-gray-900 font-bold">{formatCurrencyBoth(invoice.subtotal)}</span>
          </div>
          {invoice.tax > 0 && (
            <div className="flex justify-between py-2 border-b border-gray-200">
              <span className="text-gray-600 font-medium">Tax</span>
              <span className="text-gray-900 font-bold">{formatCurrencyBoth(invoice.tax)}</span>
            </div>
          )}
          {invoice.discount > 0 && (
            <div className="flex justify-between py-2 border-b border-gray-200">
              <span className="text-gray-600 font-medium">Discount</span>
              <span className="text-gray-900 font-bold">-{formatCurrencyBoth(invoice.discount)}</span>
            </div>
          )}
          <div className="flex justify-between py-4 border-b-2 border-gray-800">
            <span className="text-gray-900 font-bold text-xl">Total</span>
            <span className="text-gray-900 font-bold text-xl">{formatCurrencyBoth(invoice.total)}</span>
          </div>
          <div className="flex justify-between py-2">
            <span className="text-gray-600 font-medium">Amount Paid</span>
            <span className="text-gray-900 font-bold">{formatCurrencyBoth(invoice.paidAmount)}</span>
          </div>
          <div className="flex justify-between py-2 bg-gray-50 rounded px-2 mt-2">
            <span className="text-gray-900 font-bold">Balance Due</span>
            <span className="text-gray-900 font-bold text-lg">{formatCurrencyBoth(invoice.remainingBalance)}</span>
          </div>
        </div>
      </div>

      {(invoice.notes || invoice.terms) && (
        <div className="text-sm text-gray-600 mt-12 border-t border-gray-200 pt-6">
          {invoice.notes && (
            <div className="mb-4">
              <span className="font-bold text-gray-900">Notes: </span>
              {invoice.notes}
            </div>
          )}
          {invoice.terms && (
            <div>
              <span className="font-bold text-gray-900">Terms & Conditions: </span>
              {invoice.terms}
            </div>
          )}
        </div>
      )}
      
      <div className="mt-16 text-center text-gray-400 text-sm">
        Thank you for your business!
      </div>
    </div>
  )
}
