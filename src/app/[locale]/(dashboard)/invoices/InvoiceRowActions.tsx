'use client'

import { useState } from 'react'
import Link from 'next/link'
import { toast } from 'sonner'
import { recordPayment, deleteInvoice } from '@/lib/actions/invoices'
import { Trash2 } from 'lucide-react'

interface InvoiceRowActionsProps {
  invoiceId: string
  locale: string
  status: string
  remainingBalance: number
}

export default function InvoiceRowActions({ invoiceId, locale, status, remainingBalance }: InvoiceRowActionsProps) {
  const [loading, setLoading] = useState(false)
  const [isDeleting, setIsDeleting] = useState(false)

  const handleMarkAsPaid = async () => {
    if (!confirm('دڵنیایت کە پارەی ئەم وەسڵە بە تەواوی دراوە؟')) return
    
    setLoading(true)
    try {
      const res = await recordPayment(invoiceId, remainingBalance)
      if (res.success) {
        toast.success('بە سەرکەوتوویی کرا بە "دراوە"')
      } else {
        toast.error(res.error || 'هەڵەیەک ڕوویدا')
      }
    } catch (e) {
      toast.error('هەڵەیەک ڕوویدا')
    } finally {
      setLoading(false)
    }
  }

  const handleDelete = async () => {
    if (!confirm('دڵنیایت کە دەتەوێت ئەم وەسڵە بسڕیتەوە؟ ئەم کارە ناگەڕێتەوە!')) return
    
    setIsDeleting(true)
    try {
      const res = await deleteInvoice(invoiceId)
      if (res.success) {
        toast.success('وەسڵەکە بە سەرکەوتوویی سڕایەوە')
      } else {
        toast.error(res.error || 'هەڵەیەک ڕوویدا')
      }
    } catch (e) {
      toast.error('هەڵەیەک ڕوویدا')
    } finally {
      setIsDeleting(false)
    }
  }

  return (
    <div style={{ display: 'flex', gap: '0.5rem', justifyContent: 'center', alignItems: 'center' }}>
      {status !== 'PAID' && (
        <button 
          onClick={handleMarkAsPaid} 
          disabled={loading || isDeleting}
          className="btn btn-primary"
          style={{ padding: '0.25rem 0.5rem', fontSize: '0.8rem' }}
        >
          {loading ? '...' : 'پێدان'}
        </button>
      )}
      <Link href={`/${locale}/invoices/${invoiceId}`} style={{ color: 'var(--color-primary)', fontWeight: 500, fontSize: '0.875rem' }}>
        بینینی هەمووی
      </Link>
      <button 
        onClick={handleDelete}
        disabled={loading || isDeleting}
        style={{ background: 'none', border: 'none', color: 'var(--color-danger)', cursor: 'pointer', display: 'flex', alignItems: 'center' }}
        title="سڕینەوە"
      >
        <Trash2 size={18} />
      </button>
    </div>
  )
}
