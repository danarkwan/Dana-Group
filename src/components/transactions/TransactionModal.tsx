'use client'

import { useState, useEffect } from 'react'
import { toast } from 'sonner'
import { createTransaction, updateTransaction } from '@/lib/actions/transactions'

interface TransactionModalProps {
  isOpen: boolean
  onClose: () => void
  transaction?: any
}

export default function TransactionModal({ isOpen, onClose, transaction }: TransactionModalProps) {
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setLoading(true)

    const formData = new FormData(e.currentTarget)
    
    try {
      let res
      if (transaction) {
        res = await updateTransaction(transaction.id, formData)
      } else {
        res = await createTransaction(formData)
      }

      if (res.success) {
        toast.success(transaction ? 'گۆڕانکارییەکان پاشەکەوت کران' : 'مامەڵەکە بە سەرکەوتوویی زیاد کرا')
        onClose()
      } else {
        toast.error(res.error || 'هەڵەیەک ڕوویدا')
      }
    } catch (error) {
      toast.error('هەڵەیەکی نەزانراو ڕوویدا')
    } finally {
      setLoading(false)
    }
  }

  if (!isOpen) return null

  // Format date for default value in input type="date"
  const defaultDate = transaction?.date 
    ? new Date(transaction.date).toISOString().split('T')[0] 
    : new Date().toISOString().split('T')[0]

  return (
    <div className="modalOverlay">
      <div className="modalContent" style={{ maxWidth: '500px' }}>
        <h2 className="modalTitle">{transaction ? 'گۆڕینی مامەڵە' : 'زیادکردنی مامەڵە'}</h2>
        
        <form onSubmit={handleSubmit} className="modalForm">
          <div className="formGroup">
            <label className="label">جۆری مامەڵە</label>
            <select name="type" className="input" required defaultValue={transaction?.type || 'INCOME'}>
              <option value="INCOME">داهات (Income)</option>
              <option value="EXPENSE">خەرجی (Expense)</option>
            </select>
          </div>

          <div className="formGroup">
            <label className="label">بڕی پارە (دینار)</label>
            <input type="number" name="amount" className="input" step="250" required defaultValue={transaction?.amount || ''} />
          </div>

          <div className="formGroup">
            <label className="label">تێبینی / وەسف</label>
            <textarea name="description" className="input" rows={3} defaultValue={transaction?.description || ''}></textarea>
          </div>
          
          <div className="formGroup">
            <label className="label">بەروار</label>
            <input type="date" name="date" className="input" required defaultValue={defaultDate} />
          </div>

          <div className="modalActions">
            <button type="button" className="btn btn-secondary" onClick={onClose} disabled={loading}>
              پاشگەزبوونەوە
            </button>
            <button type="submit" className="btn btn-primary" disabled={loading}>
              {loading ? '...' : 'پاشەکەوتکردن'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
