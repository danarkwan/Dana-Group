'use client'

import { useState } from 'react'
import ProductModal from '@/components/products/ProductModal'
import StockMovementModal from '@/components/products/StockMovementModal'
import { deleteProduct } from '@/lib/actions/products'
import { toast } from 'sonner'
import ConfirmDialog from '@/components/ui/ConfirmDialog'
import styles from './products.module.css'
import { formatCurrencyBoth } from '@/lib/formatters'

interface Product {
  id: string
  name: string
  sku: string | null
  description: string | null
  price: number
  purchasePrice: number
  category: string | null
  image: string | null
  stock: number
  minStock: number
  unit: string
  supplierId: string | null
  supplierName: string | null
  sold: number
}

interface ProductsClientProps {
  initialProducts: Product[]
  suppliers: { id: string, name: string }[]
  translations: any
}

export default function ProductsClient({ initialProducts, suppliers, translations }: ProductsClientProps) {
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [isStockModalOpen, setIsStockModalOpen] = useState(false)
  const [selectedProduct, setSelectedProduct] = useState<Product | undefined>(undefined)
  const [confirmDialog, setConfirmDialog] = useState({ isOpen: false, message: '', onConfirm: () => {} })

  const handleAddClick = () => {
    setSelectedProduct(undefined)
    setIsModalOpen(true)
  }

  const handleEditClick = (product: Product) => {
    setSelectedProduct(product)
    setIsModalOpen(true)
  }

  const handleStockClick = (product: Product) => {
    setSelectedProduct(product)
    setIsStockModalOpen(true)
  }

  const handleDelete = (id: string) => {
    setConfirmDialog({
      isOpen: true,
      message: translations.deleteConfirm,
      onConfirm: async () => {
        const res = await deleteProduct(id)
        if (res.success) {
          toast.success('Product deleted')
        } else {
          toast.error('Failed to delete product')
        }
      }
    });
  }

  return (
    <div>
      <div style={{ marginBottom: '2rem' }}>
        <button className="btn btn-primary" onClick={handleAddClick}>
          + {translations.addProduct}
        </button>
      </div>

      {initialProducts.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '3rem', color: 'var(--color-text-muted)' }}>
          {translations.emptyState}
        </div>
      ) : (
        <div className={styles.grid}>
          {initialProducts.map(product => {
            const isLowStock = product.stock <= product.minStock
            return (
              <div key={product.id} className={styles.card} style={isLowStock ? { border: '1px solid var(--color-danger)' } : {}}>
                <div className={styles.imageContainer}>
                  {product.image ? (
                    <img src={product.image} alt={product.name} className={styles.image} />
                  ) : (
                    <div className={styles.placeholderImage}>No Image</div>
                  )}
                  {isLowStock && (
                    <div style={{ position: 'absolute', top: 8, right: 8, background: 'var(--color-danger)', color: 'white', padding: '2px 8px', borderRadius: '4px', fontSize: '0.75rem', fontWeight: 'bold' }}>
                      {translations.lowStock}
                    </div>
                  )}
                </div>
                
                <div className={styles.cardContent}>
                  <h3 className={styles.title}>{product.name}</h3>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.8rem', color: 'var(--color-text-muted)', marginBottom: '0.5rem' }}>
                    <span>{translations.sku}: {product.sku || 'N/A'}</span>
                    <span>{product.category || 'Uncategorized'}</span>
                  </div>
                  
                  {product.supplierName && (
                    <p style={{ fontSize: '0.8rem', color: 'var(--color-text-muted)', margin: '0 0 0.5rem 0' }}>
                      Supplier: {product.supplierName}
                    </p>
                  )}

                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.875rem', margin: '0.5rem 0', color: 'var(--color-text-muted)' }}>
                    <span style={{ 
                      backgroundColor: isLowStock ? 'var(--color-danger-light)' : 'var(--color-surface-hover)', 
                      color: isLowStock ? 'var(--color-danger)' : 'inherit',
                      padding: '2px 8px', 
                      borderRadius: '4px' 
                    }}>
                      Stock: {product.stock} {product.unit}
                    </span>
                    <span style={{ backgroundColor: 'var(--color-success-light)', color: 'var(--color-success)', padding: '2px 8px', borderRadius: '4px' }}>
                      Sold: {product.sold}
                    </span>
                  </div>

                  <div className={styles.priceContainer}>
                    <span className={styles.iqdPrice}>{formatCurrencyBoth(product.price)}</span>
                  </div>
                  
                  <div className={styles.actions} style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                    <button 
                      className="btn btn-primary" 
                      onClick={() => handleStockClick(product)}
                      style={{ padding: '0.4rem', fontSize: '0.875rem', width: '100%', background: 'var(--color-surface-hover)', color: 'var(--color-text)' }}
                    >
                      {translations.manageStock}
                    </button>
                    <div style={{ display: 'flex', gap: '0.5rem' }}>
                      <button 
                        className="btn btn-secondary" 
                        onClick={() => handleEditClick(product)}
                        style={{ padding: '0.25rem 0.5rem', fontSize: '0.875rem', flex: 1 }}
                      >
                        {translations.edit}
                      </button>
                      <button 
                        className="btn btn-danger" 
                        onClick={() => handleDelete(product.id)}
                        style={{ padding: '0.25rem 0.5rem', fontSize: '0.875rem', flex: 1 }}
                      >
                        {translations.delete}
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      )}

      <ProductModal 
        isOpen={isModalOpen} 
        onClose={() => setIsModalOpen(false)} 
        product={selectedProduct}
        suppliers={suppliers}
      />
      
      <StockMovementModal 
        isOpen={isStockModalOpen}
        onClose={() => setIsStockModalOpen(false)}
        product={selectedProduct}
      />
      <ConfirmDialog
        isOpen={confirmDialog.isOpen}
        message={confirmDialog.message}
        onConfirm={confirmDialog.onConfirm}
        onCancel={() => setConfirmDialog(p => ({ ...p, isOpen: false }))}
      />
    </div>
  )
}
