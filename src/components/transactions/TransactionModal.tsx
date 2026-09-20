'use client'

import { useState, useEffect } from 'react'
import { toast } from 'sonner'
import { createTransaction, updateTransaction } from '@/lib/actions/transactions'

interface TransactionModalProps {
  isOpen: boolean
  onClose: () => void
  transaction?: any
  initialType?: string
  customers: any[]
  suppliers: any[]
}

export default function TransactionModal({ isOpen, onClose, transaction, initialType, customers, suppliers }: TransactionModalProps) {
  const [loading, setLoading] = useState(false)
  const [type, setType] = useState(transaction?.type || initialType || 'INCOME')

  useEffect(() => {
    if (isOpen) {
      setType(transaction?.type || initialType || 'INCOME')
    }
  }, [isOpen, transaction, initialType])

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

  const defaultDate = transaction?.date 
    ? new Date(transaction.date).toISOString().split('T')[0] 
    : new Date().toISOString().split('T')[0]

  return (
    <div className="modalOverlay" style={{ zIndex: 1000, position: 'fixed', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', backgroundColor: 'rgba(0,0,0,0.5)', padding: '1rem' }}>
      <div className="modalContent" style={{ backgroundColor: 'var(--color-surface)', width: '100%', maxWidth: '600px', borderRadius: '12px', padding: '2rem', maxHeight: '90vh', overflowY: 'auto', direction: 'rtl' }}>
        <h2 className="modalTitle" style={{ fontSize: '1.5rem', fontWeight: 600, marginBottom: '1.5rem', borderBottom: '1px solid var(--color-border)', paddingBottom: '0.5rem' }}>
          {transaction ? 'گۆڕینی مامەڵە' : 'زیادکردنی مامەڵە'}
        </h2>
        
        <form onSubmit={handleSubmit} style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
          
          <div className="formGroup" style={{ gridColumn: '1 / -1' }}>
            <label className="label" style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 500 }}>جۆری مامەڵە</label>
            <select name="type" className="input" required value={type} onChange={(e) => setType(e.target.value)} style={{ width: '100%', padding: '0.75rem', borderRadius: '8px', border: '1px solid var(--color-border)' }}>
              <option value="INCOME">داهات (Income)</option>
              <option value="EXPENSE">خەرجی (Expense)</option>
              <option value="PAYMENT">پێدان (Payment)</option>
              <option value="PURCHASE">کڕین (Purchase)</option>
              <option value="SALE">فرۆشتن (Sale)</option>
              <option value="TRANSFER">حەواڵە (Transfer)</option>
            </select>
          </div>

          <div className="formGroup">
            <label className="label" style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 500 }}>بڕی پارە (دینار)</label>
            <input type="number" name="amount" className="input" step="250" required defaultValue={transaction?.amount || ''} style={{ width: '100%', padding: '0.75rem', borderRadius: '8px', border: '1px solid var(--color-border)' }} />
          </div>

          <div className="formGroup">
            <label className="label" style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 500 }}>بەروار</label>
            <input type="date" name="date" className="input" required defaultValue={defaultDate} style={{ width: '100%', padding: '0.75rem', borderRadius: '8px', border: '1px solid var(--color-border)' }} />
          </div>

          <div className="formGroup">
            <label className="label" style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 500 }}>هاوپۆل (Category)</label>
            <input type="text" name="category" className="input" defaultValue={transaction?.category || ''} placeholder="نموونە: کرێ، مووچە..." style={{ width: '100%', padding: '0.75rem', borderRadius: '8px', border: '1px solid var(--color-border)' }} />
          </div>

          <div className="formGroup">
            <label className="label" style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 500 }}>شێوازی پارەدان</label>
            <select name="paymentMethod" className="input" defaultValue={transaction?.paymentMethod || 'CASH'} style={{ width: '100%', padding: '0.75rem', borderRadius: '8px', border: '1px solid var(--color-border)' }}>
              <option value="CASH">کاش (Cash)</option>
              <option value="BANK">بانک (Bank)</option>
              <option value="CREDIT_CARD">کارت (Credit Card)</option>
              <option value="CHECK">چەک (Check)</option>
              <option value="OTHER">تر (Other)</option>
            </select>
          </div>

          <div className="formGroup">
            <label className="label" style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 500 }}>باری مامەڵە (Status)</label>
            <select name="status" className="input" defaultValue={transaction?.status || 'COMPLETED'} style={{ width: '100%', padding: '0.75rem', borderRadius: '8px', border: '1px solid var(--color-border)' }}>
              <option value="COMPLETED">تەواوبوو (Completed)</option>
              <option value="PENDING">چاوەڕێکراو (Pending)</option>
              <option value="CANCELLED">هەڵوەشایەوە (Cancelled)</option>
            </select>
          </div>

          {(type === 'INCOME' || type === 'SALE' || type === 'PAYMENT') && (
            <div className="formGroup">
              <label className="label" style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 500 }}>کڕیار</label>
              <select name="customerId" className="input" defaultValue={transaction?.customerId || ''} style={{ width: '100%', padding: '0.75rem', borderRadius: '8px', border: '1px solid var(--color-border)' }}>
                <option value="">(هیچ)</option>
                {customers.map(c => (
                  <option key={c.id} value={c.id}>{c.name}</option>
                ))}
              </select>
            </div>
          )}

          {(type === 'EXPENSE' || type === 'PURCHASE' || type === 'PAYMENT') && (
            <div className="formGroup">
              <label className="label" style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 500 }}>دابینکار (Supplier)</label>
              <select name="supplierId" className="input" defaultValue={transaction?.supplierId || ''} style={{ width: '100%', padding: '0.75rem', borderRadius: '8px', border: '1px solid var(--color-border)' }}>
                <option value="">(هیچ)</option>
                {suppliers.map(s => (
                  <option key={s.id} value={s.id}>{s.name}</option>
                ))}
              </select>
            </div>
          )}

          <div className="formGroup" style={{ gridColumn: '1 / -1' }}>
            <label className="label" style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 500 }}>تێبینی / وەسف</label>
            <textarea name="description" className="input" rows={3} defaultValue={transaction?.description || ''} style={{ width: '100%', padding: '0.75rem', borderRadius: '8px', border: '1px solid var(--color-border)' }}></textarea>
          </div>

          <div className="modalActions" style={{ gridColumn: '1 / -1', display: 'flex', gap: '1rem', justifyContent: 'flex-end', marginTop: '1rem' }}>
            <button type="button" className="btn btn-secondary" onClick={onClose} disabled={loading} style={{ padding: '0.75rem 1.5rem', borderRadius: '8px', border: '1px solid var(--color-border)', backgroundColor: 'transparent', cursor: 'pointer' }}>
              پاشگەزبوونەوە
            </button>
            <button type="submit" className="btn btn-primary" disabled={loading} style={{ padding: '0.75rem 1.5rem', borderRadius: '8px', border: 'none', backgroundColor: 'var(--color-primary)', color: 'white', cursor: 'pointer' }}>
              {loading ? '...' : 'پاشەکەوتکردن'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
