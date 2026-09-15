'use client'

import { useState, useEffect } from 'react'
import { useTranslations } from 'next-intl'
import { useRouter } from 'next/navigation'
import { Plus, Trash2, Save, FileText, User, Calendar, CreditCard, Box, Tag } from 'lucide-react'
import Image from 'next/image'
import { createInvoice } from '@/lib/actions/invoices'
import { formatCurrencyBoth } from '@/lib/formatters'
import { toast } from 'sonner'
import styles from '../invoices.module.css'
import { Customer, Product } from '@prisma/client'

export default function CreateInvoiceClient({ 
  initialCustomers = [],
  initialProducts = [] 
}: { 
  initialCustomers?: Customer[],
  initialProducts?: Product[] 
}) {
  const t = useTranslations('Invoices')
  const router = useRouter()
  
  const [loading, setLoading] = useState(false)
  const [items, setItems] = useState([{ productId: '', description: '', quantity: 1, price: 0 }])
  const [activeProductDropdown, setActiveProductDropdown] = useState<number | null>(null)
  const [hasDueDate, setHasDueDate] = useState(false)
  const [formData, setFormData] = useState({
    invoiceNumber: '',
    customerId: '',
    customerName: '',
    date: '',
    dueDate: '',
    tax: 0,
    discount: 0,
    paidAmount: 0,
    paymentMethod: 'CASH',
    notes: '',
    terms: ''
  })

  // Fix Hydration mismatch by generating dynamic values after mount
  useEffect(() => {
    setFormData(prev => ({
      ...prev,
      invoiceNumber: `INV-${new Date().getFullYear()}-${Math.floor(1000 + Math.random() * 9000)}`,
      date: new Date().toISOString().split('T')[0],
      dueDate: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    }))
  }, [])

  const subtotal = items.reduce((sum, item) => sum + (item.quantity * item.price), 0)
  const total = subtotal + formData.tax - formData.discount
  const remainingBalance = total - formData.paidAmount

  const handleAddItem = () => {
    setItems([...items, { productId: '', description: '', quantity: 1, price: 0 }])
  }

  const handleRemoveItem = (index: number) => {
    if (items.length === 1) return; // Keep at least one item
    setItems(items.filter((_, i) => i !== index))
  }

  const handleItemChange = (index: number, field: string, value: any) => {
    const newItems = [...items]
    newItems[index] = { ...newItems[index], [field]: value }
    
    // Auto-fill product details if description matches a product
    if (field === 'description') {
      const selectedProduct = initialProducts.find(p => p.name === value)
      if (selectedProduct) {
        newItems[index].productId = selectedProduct.id
        newItems[index].price = selectedProduct.price
      } else {
        newItems[index].productId = ''
      }
    }
    
    setItems(newItems)
  }

  const handleCustomerSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value
    setFormData(prev => ({ ...prev, customerName: value }))
    
    // Check if the selected name matches any registered customer exactly
    const selectedCustomer = initialCustomers.find(c => c.name === value)
    if (selectedCustomer) {
      setFormData(prev => ({ ...prev, customerId: selectedCustomer.id, customerName: selectedCustomer.name }))
    } else {
      setFormData(prev => ({ ...prev, customerId: '' })) // Clear ID if it's a new name
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    
    const dataToSubmit = {
      ...formData,
      dueDate: hasDueDate ? formData.dueDate : formData.date,
      subtotal,
      total,
      remainingBalance,
      items: items.filter(i => i.price > 0 && i.quantity > 0 && (i.productId || i.description))
    }

    try {
      const res = await createInvoice(dataToSubmit)
      if (res.success) {
        toast.success('Invoice created successfully!', {
          description: `Invoice ${formData.invoiceNumber} has been saved.`
        })
        router.push('../invoices')
      } else {
        toast.error('Failed to create invoice', {
          description: res.error || 'An unknown error occurred.'
        })
        setLoading(false)
      }
    } catch (error: any) {
      toast.error('Failed to create invoice', {
        description: error.message || 'An unknown error occurred.'
      })
      setLoading(false)
    }
  }

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <h1 className={styles.title}>{t('create')}</h1>
      </div>

      <form onSubmit={handleSubmit} className="card">
        {/* Top Section */}
        <div className={styles.formGrid}>
          <div className={styles.formGroup}>
            <label className="label">{t('invoiceNumber')}</label>
            <input 
              type="text" 
              required
              value={formData.invoiceNumber}
              onChange={e => setFormData({...formData, invoiceNumber: e.target.value})}
              className="input"
            />
          </div>
          <div className={styles.formGroup}>
            <label className="label">{t('customer')}</label>
            <input 
              type="text" 
              placeholder="Walk-in Customer"
              value={formData.customerName}
              onChange={handleCustomerSelect}
              className="input"
              list="customer-list"
            />
            <datalist id="customer-list">
              {initialCustomers.map((customer) => (
                <option key={customer.id} value={customer.name} />
              ))}
            </datalist>
          </div>
          <div className={styles.formGroup}>
            <label className="label">{t('date')}</label>
            <input 
              type="date" 
              required
              value={formData.date}
              onChange={e => setFormData({...formData, date: e.target.value})}
              className="input"
            />
          </div>
          <div className={styles.formGroup}>
            <label className="label">
              <input 
                type="checkbox" 
                checked={hasDueDate} 
                onChange={(e) => setHasDueDate(e.target.checked)} 
                style={{ marginRight: '0.5rem', marginLeft: '0.5rem' }} 
              />
              کاتی بەسەرچوون دیاری بکە (قەرز)
            </label>
            {hasDueDate ? (
              <input 
                type="date" 
                required
                value={formData.dueDate}
                onChange={e => setFormData({...formData, dueDate: e.target.value})}
                className="input animate-fade-in"
              />
            ) : (
              <input 
                type="text" 
                value="نەزانراو / قەرز نییە" 
                disabled 
                className="input" 
                style={{ backgroundColor: 'var(--color-surface-hover)', color: 'var(--color-text-muted)' }}
              />
            )}
          </div>
        </div>

        {/* Items Section */}
        <div>
          <h3 className={styles.sectionTitle}>{t('items')}</h3>
          <div>
            {items.map((item, index) => (
              <div key={index} className={styles.itemRow}>
                <div className={styles.itemDesc} style={{ position: 'relative' }}>
                  <label className="label">Product Description</label>
                  <input 
                    type="text" 
                    placeholder="Product/Service"
                    value={item.description}
                    onChange={e => {
                      handleItemChange(index, 'description', e.target.value)
                      setActiveProductDropdown(index)
                    }}
                    onFocus={() => setActiveProductDropdown(index)}
                    onBlur={() => setTimeout(() => setActiveProductDropdown(null), 200)}
                    className="input"
                    autoComplete="off"
                  />
                  
                  {activeProductDropdown === index && initialProducts.filter(p => p.name.toLowerCase().includes(item.description.toLowerCase())).length > 0 && (
                    <div className={styles.dropdownMenu}>
                      {initialProducts.filter(p => p.name.toLowerCase().includes(item.description.toLowerCase())).map((product) => (
                        <div 
                          key={product.id} 
                          className={styles.dropdownItem}
                          onClick={() => {
                            handleItemChange(index, 'description', product.name)
                            setActiveProductDropdown(null)
                          }}
                        >
                          {product.image ? (
                            <Image src={product.image} alt={product.name} width={40} height={40} className={styles.dropdownImage} />
                          ) : (
                            <div className={styles.dropdownImagePlaceholder}><Box size={20} /></div>
                          )}
                          <div className={styles.dropdownInfo}>
                            <span className={styles.dropdownName}>{product.name}</span>
                            <span className={styles.dropdownPrice}>{formatCurrencyBoth(product.price)}</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
                <div className={styles.itemQty}>
                  <label className="label">{t('quantity')}</label>
                  <input 
                    type="number" 
                    min="1"
                    value={item.quantity}
                    onChange={e => handleItemChange(index, 'quantity', parseInt(e.target.value) || 0)}
                    className="input"
                  />
                </div>
                <div className={styles.itemPrice}>
                  <label className="label">{t('price')}</label>
                  <input 
                    type="number"
                    min="0"
                    step="0.01"
                    value={item.price}
                    onChange={e => handleItemChange(index, 'price', parseFloat(e.target.value) || 0)}
                    className="input"
                  />
                </div>
                <div className={styles.itemTotal}>
                  <label className="label">Total</label>
                  <div className="input" style={{ backgroundColor: 'var(--color-surface-hover)', cursor: 'not-allowed' }}>
                    {formatCurrencyBoth(item.quantity * item.price)}
                  </div>
                </div>
                <div className={styles.itemAction}>
                  <button 
                    type="button" 
                    onClick={() => handleRemoveItem(index)}
                    className={styles.iconBtn}
                  >
                    <Trash2 size={20} />
                  </button>
                </div>
              </div>
            ))}
          </div>
          
          <button 
            type="button" 
            onClick={handleAddItem}
            className={styles.addBtn}
          >
            <Plus size={16} /> {t('addProduct')}
          </button>
        </div>

        {/* Totals Section */}
        <div className={styles.totalsSection}>
          
          <div className={styles.notesArea}>
            <div className={styles.formGroup}>
              <label className="label">{t('notes')}</label>
              <textarea 
                value={formData.notes}
                onChange={e => setFormData({...formData, notes: e.target.value})}
                rows={4}
                className="input"
              ></textarea>
            </div>
          </div>

          <div className={styles.summaryArea}>
            <div className={styles.summaryRow}>
              <span>{t('subtotal')}</span>
              <span>{formatCurrencyBoth(subtotal)}</span>
            </div>
            
            <div className={styles.summaryRow}>
              <span>{t('discount')}</span>
              <input 
                type="number"
                min="0"
                step="0.01"
                value={formData.discount}
                onChange={e => setFormData({...formData, discount: parseFloat(e.target.value) || 0})}
                className="input"
                style={{ width: '100px', padding: 'var(--spacing-xs) var(--spacing-sm)' }}
              />
            </div>

            <div className={styles.summaryRow}>
              <span>{t('tax')}</span>
              <input 
                type="number"
                min="0"
                step="0.01"
                value={formData.tax}
                onChange={e => setFormData({...formData, tax: parseFloat(e.target.value) || 0})}
                className="input"
                style={{ width: '100px', padding: 'var(--spacing-xs) var(--spacing-sm)' }}
              />
            </div>
            
            <div className={styles.summaryRowTotal}>
              <span>{t('totalAmount')}</span>
              <span>{formatCurrencyBoth(total)}</span>
            </div>

            <div className={styles.summaryRow} style={{ marginTop: 'var(--spacing-md)' }}>
              <span style={{ color: 'var(--color-success)', fontWeight: 600 }}>{t('paidAmount')}</span>
              <input 
                type="number"
                min="0"
                max={total}
                step="0.01"
                value={formData.paidAmount}
                onChange={e => setFormData({...formData, paidAmount: parseFloat(e.target.value) || 0})}
                className="input"
                style={{ width: '100px', padding: 'var(--spacing-xs) var(--spacing-sm)', borderColor: 'var(--color-success)', color: 'var(--color-success)' }}
              />
            </div>
            <div style={{ display: 'flex', gap: '0.25rem', justifyContent: 'flex-end', marginTop: '0.25rem' }}>
              <button type="button" onClick={() => setFormData({...formData, paidAmount: total})} style={{ padding: '0.2rem 0.4rem', fontSize: '0.75rem', background: 'var(--color-surface-hover)', border: '1px solid var(--color-border)', borderRadius: '4px', cursor: 'pointer' }}>100%</button>
              <button type="button" onClick={() => setFormData({...formData, paidAmount: total * 0.75})} style={{ padding: '0.2rem 0.4rem', fontSize: '0.75rem', background: 'var(--color-surface-hover)', border: '1px solid var(--color-border)', borderRadius: '4px', cursor: 'pointer' }}>75%</button>
              <button type="button" onClick={() => setFormData({...formData, paidAmount: total * 0.5})} style={{ padding: '0.2rem 0.4rem', fontSize: '0.75rem', background: 'var(--color-surface-hover)', border: '1px solid var(--color-border)', borderRadius: '4px', cursor: 'pointer' }}>50%</button>
            </div>

            <div className={styles.summaryRow}>
              <span>{t('remainingBalance')}</span>
              <span style={{ fontWeight: 600 }}>{formatCurrencyBoth(remainingBalance)}</span>
            </div>
          </div>
        </div>

        <div className={styles.actions}>
          <button 
            type="submit"
            disabled={loading}
            className="btn btn-primary"
          >
            {loading ? (
              <span>Saving...</span>
            ) : (
              <><Save size={18} /> {t('save')}</>
            )}
          </button>
        </div>
      </form>
    </div>
  )
}
