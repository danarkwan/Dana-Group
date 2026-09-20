'use client'

import { useState, useRef, useEffect } from 'react'
import { useTranslations } from 'next-intl'
import { toast } from 'sonner'
import { createProduct, updateProduct } from '@/lib/actions/products'

interface ProductModalProps {
  isOpen: boolean
  onClose: () => void
  product?: any // To populate form when editing
  suppliers?: { id: string, name: string }[]
}

export default function ProductModal({ isOpen, onClose, product, suppliers = [] }: ProductModalProps) {
  const t = useTranslations('Products')
  const [loading, setLoading] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [imagePreview, setImagePreview] = useState<string | null>(null)

  useEffect(() => {
    if (product) {
      setImagePreview(product.image || null)
    } else {
      setImagePreview(null)
    }
  }, [product, isOpen])

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      const url = URL.createObjectURL(file)
      setImagePreview(url)
    }
  }

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setLoading(true)

    const formData = new FormData(e.currentTarget)
    
    try {
      let res
      if (product) {
        res = await updateProduct(product.id, formData)
      } else {
        res = await createProduct(formData)
      }

      if (res.success) {
        toast.success(product ? 'Product updated successfully' : 'Product created successfully')
        onClose()
      } else {
        toast.error(res.error || (product ? 'Failed to update product' : 'Failed to create product'))
      }
    } catch (error) {
      toast.error('An unexpected error occurred')
    } finally {
      setLoading(false)
    }
  }

  if (!isOpen) return null

  return (
    <div className="modalOverlay">
      <div className="modalContent" style={{ maxWidth: '600px' }}>
        <h2 className="modalTitle">{product ? t('edit') : t('addProduct')}</h2>
        
        <form onSubmit={handleSubmit} className="modalForm">
          <div className="formGroup">
            <label className="label">{t('name')}</label>
            <input type="text" name="name" className="input" required defaultValue={product?.name || ''} />
          </div>

          <div className="formGroup">
            <label className="label">{t('description')}</label>
            <textarea name="description" className="input" rows={3} defaultValue={product?.description || ''}></textarea>
          </div>

          <div style={{ display: 'flex', gap: '1rem', marginBottom: '1rem' }}>
            <div className="formGroup" style={{ flex: 1, marginBottom: 0 }}>
              <label className="label">{t('sellingPrice')}</label>
              <input type="number" name="price" className="input" step="0.01" required defaultValue={product?.price || ''} />
            </div>
            <div className="formGroup" style={{ flex: 1, marginBottom: 0 }}>
              <label className="label">{t('purchasePrice')}</label>
              <input type="number" name="purchasePrice" className="input" step="0.01" required defaultValue={product?.purchasePrice || ''} />
            </div>
          </div>
          
          <div style={{ display: 'flex', gap: '1rem', marginBottom: '1rem' }}>
            <div className="formGroup" style={{ flex: 1, marginBottom: 0 }}>
              <label className="label">{t('sku')}</label>
              <input type="text" name="sku" className="input" defaultValue={product?.sku || ''} />
            </div>
            <div className="formGroup" style={{ flex: 1, marginBottom: 0 }}>
              <label className="label">{t('category')}</label>
              <input type="text" name="category" className="input" defaultValue={product?.category || ''} />
            </div>
          </div>
          
          <div style={{ display: 'flex', gap: '1rem', marginBottom: '1rem' }}>
            <div className="formGroup" style={{ flex: 1, marginBottom: 0 }}>
              <label className="label">{t('stock')}</label>
              <input type="number" name="stock" className="input" min="0" required defaultValue={product?.stock || 0} />
            </div>
            <div className="formGroup" style={{ flex: 1, marginBottom: 0 }}>
              <label className="label">{t('minStock')}</label>
              <input type="number" name="minStock" className="input" min="0" required defaultValue={product?.minStock || 0} />
            </div>
            <div className="formGroup" style={{ flex: 1, marginBottom: 0 }}>
              <label className="label">{t('unit')}</label>
              <input type="text" name="unit" className="input" required defaultValue={product?.unit || 'pcs'} />
            </div>
          </div>

          <div className="formGroup">
            <label className="label">{t('supplier')}</label>
            <select name="supplierId" className="input" defaultValue={product?.supplierId || ''}>
              <option value="">-- Select Supplier --</option>
              {suppliers.map(s => (
                <option key={s.id} value={s.id}>{s.name}</option>
              ))}
            </select>
          </div>

          <div className="formGroup">
            <label className="label">{t('image')}</label>
            <input 
              type="file" 
              name="image" 
              accept="image/*" 
              className="input" 
              onChange={handleImageChange}
              ref={fileInputRef}
            />
            {imagePreview && (
              <div style={{ marginTop: '0.5rem' }}>
                <img src={imagePreview} alt="Preview" style={{ maxWidth: '100px', borderRadius: '4px' }} />
              </div>
            )}
          </div>

          <div className="modalActions">
            <button type="button" className="btn btn-secondary" onClick={onClose} disabled={loading}>
              {t('cancel')}
            </button>
            <button type="submit" className="btn btn-primary" disabled={loading}>
              {loading ? '...' : t('save')}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
