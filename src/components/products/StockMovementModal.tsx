'use client'

import { useState } from 'react'
import { toast } from 'sonner'
import { recordStockMovement } from '@/lib/actions/inventory'
import { useTranslations } from 'next-intl'

interface Product {
  id: string
  name: string
  stock: number
  sku: string | null
}

interface StockMovementModalProps {
  isOpen: boolean
  onClose: () => void
  product?: Product
}

export default function StockMovementModal({ isOpen, onClose, product }: StockMovementModalProps) {
  const t = useTranslations('Products')
  const [loading, setLoading] = useState(false)

  if (!isOpen || !product) return null

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setLoading(true)

    const formData = new FormData(e.currentTarget)
    const type = formData.get('type') as 'IN' | 'OUT' | 'ADJUSTMENT'
    const quantity = parseInt(formData.get('quantity') as string)
    const reason = formData.get('reason') as string

    try {
      const result = await recordStockMovement(product.id, type, quantity, reason)
      if (result.success) {
        toast.success(t('saveStock') + ' - Success')
        onClose()
      } else {
        toast.error(result.error || 'Failed to update stock')
      }
    } catch (error) {
      toast.error('An error occurred')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="modalOverlay" onClick={onClose}>
      <div className="modalContent" style={{ maxWidth: '500px' }} onClick={e => e.stopPropagation()}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
          <h2 className="modalTitle" style={{ margin: 0 }}>{t('manageStock')} - {product.name}</h2>
          <button onClick={onClose} style={{ background: 'none', border: 'none', fontSize: '1.5rem', cursor: 'pointer', color: 'var(--color-text-muted)' }}>&times;</button>
        </div>

        <form onSubmit={handleSubmit} className="modalForm">
          <div style={{ marginBottom: '1rem', padding: '1rem', backgroundColor: 'var(--color-surface-hover)', borderRadius: '8px' }}>
            <p style={{ margin: 0 }}><strong>{t('stock')}:</strong> {product.stock}</p>
          </div>

          <div className="formGroup">
            <label htmlFor="type" className="label">{t('type')}</label>
            <select id="type" name="type" className="input" required>
              <option value="IN">{t('stockIn')}</option>
              <option value="OUT">{t('stockOut')}</option>
              <option value="ADJUSTMENT">{t('stockAdjustment')}</option>
            </select>
          </div>

          <div className="formGroup">
            <label htmlFor="quantity" className="label">{t('quantity')}</label>
            <input 
              type="number" 
              id="quantity" 
              name="quantity" 
              className="input" 
              required 
              min="0"
            />
          </div>

          <div className="formGroup">
            <label htmlFor="reason" className="label">{t('reason')}</label>
            <input 
              type="text" 
              id="reason" 
              name="reason" 
              className="input" 
            />
          </div>

          <div className="modalActions">
            <button type="button" className="btn btn-secondary" onClick={onClose} disabled={loading}>
              {t('cancel')}
            </button>
            <button type="submit" className="btn btn-primary" disabled={loading}>
              {loading ? '...' : t('saveStock')}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
