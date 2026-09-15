'use client'

import { useState } from 'react'
import ProductModal from '@/components/products/ProductModal'
import { deleteProduct } from '@/lib/actions/products'
import { toast } from 'sonner'
import styles from './products.module.css'

interface Product {
  id: string
  name: string
  description: string | null
  price: number
  category: string | null
  image: string | null
  stock: number
  sold: number
}

import { formatCurrencyBoth } from '@/lib/formatters'

interface ProductsClientProps {
  initialProducts: Product[]
  translations: any
}

export default function ProductsClient({ initialProducts, translations }: ProductsClientProps) {
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [selectedProduct, setSelectedProduct] = useState<Product | undefined>(undefined)

  const handleAddClick = () => {
    setSelectedProduct(undefined)
    setIsModalOpen(true)
  }

  const handleEditClick = (product: Product) => {
    setSelectedProduct(product)
    setIsModalOpen(true)
  }

  const handleDelete = async (id: string) => {
    if (confirm(translations.deleteConfirm)) {
      const res = await deleteProduct(id)
      if (res.success) {
        toast.success('Product deleted')
      } else {
        toast.error('Failed to delete product')
      }
    }
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
          {initialProducts.map(product => (
            <div key={product.id} className={styles.card}>
              <div className={styles.imageContainer}>
                {product.image ? (
                  <img src={product.image} alt={product.name} className={styles.image} />
                ) : (
                  <div className={styles.placeholderImage}>No Image</div>
                )}
              </div>
              <div className={styles.cardContent}>
                <h3 className={styles.title}>{product.name}</h3>
                <p className={styles.category}>{product.category || 'N/A'}</p>
                
                {product.description && (
                  <p style={{ fontSize: '0.85rem', color: 'var(--color-text-muted)', margin: '0.5rem 0', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden', lineHeight: '1.4' }}>
                    {product.description}
                  </p>
                )}
                
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.875rem', margin: '0.5rem 0', color: 'var(--color-text-muted)' }}>
                  <span style={{ backgroundColor: 'var(--color-surface-hover)', padding: '2px 8px', borderRadius: '4px' }}>ماوە: {product.stock}</span>
                  <span style={{ backgroundColor: 'var(--color-success-light)', color: 'var(--color-success)', padding: '2px 8px', borderRadius: '4px' }}>فرۆشراوە: {product.sold}</span>
                </div>

                <div className={styles.priceContainer}>
                  <span className={styles.iqdPrice}>{formatCurrencyBoth(product.price)}</span>
                </div>
                <div className={styles.actions} style={{ display: 'flex', gap: '0.5rem' }}>
                  <button 
                    className="btn btn-secondary" 
                    onClick={() => handleEditClick(product)}
                    style={{ padding: '0.25rem 0.5rem', fontSize: '0.875rem', flex: 1 }}
                  >
                    گۆڕین
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
          ))}
        </div>
      )}

      <ProductModal 
        isOpen={isModalOpen} 
        onClose={() => setIsModalOpen(false)} 
        product={selectedProduct}
      />
    </div>
  )
}
