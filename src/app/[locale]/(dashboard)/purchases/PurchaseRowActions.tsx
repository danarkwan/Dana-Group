'use client'

import { useState } from 'react'
import Link from 'next/link'
import { toast } from 'sonner'
import { recordPurchasePayment, deletePurchase } from '@/lib/actions/purchases'
import { Trash2 } from 'lucide-react'
import ConfirmDialog from '@/components/ui/ConfirmDialog'

interface PurchaseRowActionsProps {
  purchaseId: string
  locale: string
  status: string
  remainingBalance: number
}

export default function PurchaseRowActions({ purchaseId, locale, status, remainingBalance }: PurchaseRowActionsProps) {
  const [loading, setLoading] = useState(false)
  const [isDeleting, setIsDeleting] = useState(false)
  const [confirmDialog, setConfirmDialog] = useState({ isOpen: false, message: '', onConfirm: () => {} })

  const handleMarkAsPaid = () => {
    setConfirmDialog({
      isOpen: true,
      message: 'دڵنیایت کە پارەی ئەم کڕینە بە تەواوی دراوە؟',
      onConfirm: async () => {
        setLoading(true)
        try {
          const res = await recordPurchasePayment(purchaseId, remainingBalance)
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
      },
    })
  }

  const handleDelete = () => {
    setConfirmDialog({
      isOpen: true,
      message: 'دڵنیایت کە دەتەوێت ئەم کڕینە بسڕیتەوە؟ ئەم کارە ناگەڕێتەوە!',
      onConfirm: async () => {
        setIsDeleting(true)
        try {
          const res = await deletePurchase(purchaseId)
          if (res.success) {
            toast.success('کڕینەکە بە سەرکەوتوویی سڕایەوە')
          } else {
            toast.error(res.error || 'هەڵەیەک ڕوویدا')
          }
        } catch (e) {
          toast.error('هەڵەیەک ڕوویدا')
        } finally {
          setIsDeleting(false)
        }
      },
    })
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
      <Link href={`/${locale}/purchases/${purchaseId}`} style={{ color: 'var(--color-primary)', fontWeight: 500, fontSize: '0.875rem' }}>
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
      <ConfirmDialog
        isOpen={confirmDialog.isOpen}
        message={confirmDialog.message}
        onConfirm={confirmDialog.onConfirm}
        onCancel={() => setConfirmDialog(p => ({ ...p, isOpen: false }))}
      />
    </div>
  )
}
