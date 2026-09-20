'use client'

import { useState, useEffect } from 'react'
import TransactionModal from '@/components/transactions/TransactionModal'
import { toast } from 'sonner'
import { formatCurrencyBoth, formatDate } from '@/lib/formatters'
import ConfirmDialog from '@/components/ui/ConfirmDialog'
import styles from './transactions.module.css'
import { useSearchParams, useRouter, usePathname } from 'next/navigation'
import Pagination from '@/components/ui/Pagination'

interface Transaction {
  id: string
  transactionNumber?: string | null
  type: string
  category?: string | null
  amount: number
  description: string | null
  paymentMethod?: string | null
  status?: string
  date: Date
  customerId?: string | null
  customer?: any
  supplierId?: string | null
  supplier?: any
}

interface TransactionsClientProps {
  initialTransactions: Transaction[]
  customers: any[]
  suppliers: any[]
  totalPages: number
  currentPage: number
  totalIncome: number
  totalExpense: number
  balance: number
}

export default function TransactionsClient({ 
  initialTransactions, 
  customers, 
  suppliers,
  totalPages,
  currentPage,
  totalIncome,
  totalExpense,
  balance
}: TransactionsClientProps) {
  const searchParams = useSearchParams()
  const router = useRouter()
  const pathname = usePathname()
  
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [selectedTransaction, setSelectedTransaction] = useState<Transaction | undefined>(undefined)
  const [initialType, setInitialType] = useState<string | undefined>(undefined)
  const [confirmDialog, setConfirmDialog] = useState({ isOpen: false, message: '', onConfirm: () => {} })
  
  // Filtering state from URL
  const [searchTerm, setSearchTerm] = useState(searchParams.get('query') || '')
  
  useEffect(() => {
    const action = searchParams.get('action')
    if (action === 'add-income') {
      setInitialType('INCOME')
      setIsModalOpen(true)
      router.replace(pathname, { scroll: false })
    } else if (action === 'add-expense') {
      setInitialType('EXPENSE')
      setIsModalOpen(true)
      router.replace(pathname, { scroll: false })
    }
  }, [searchParams, pathname, router])

  // Debounce search
  useEffect(() => {
    const timer = setTimeout(() => {
      const params = new URLSearchParams(searchParams)
      if (searchTerm) {
        params.set('query', searchTerm)
      } else {
        params.delete('query')
      }
      params.delete('page') // reset page on search
      router.replace(`${pathname}?${params.toString()}`)
    }, 400)
    return () => clearTimeout(timer)
  }, [searchTerm, pathname, router, searchParams])

  const updateFilter = (key: string, value: string) => {
    const params = new URLSearchParams(searchParams)
    if (value && value !== 'ALL') {
      params.set(key, value)
    } else {
      params.delete(key)
    }
    params.delete('page')
    router.replace(`${pathname}?${params.toString()}`)
  }

  const handleAddClick = () => {
    setSelectedTransaction(undefined)
    setIsModalOpen(true)
  }

  const handleEditClick = (transaction: Transaction) => {
    setSelectedTransaction(transaction)
    setIsModalOpen(true)
  }

  const handleDelete = (id: string) => {
    setConfirmDialog({
      isOpen: true,
      message: 'دڵنیایت لە سڕینەوەی ئەم مامەڵەیە؟',
      onConfirm: async () => {
        const { deleteTransaction } = await import('@/lib/actions/transactions');
        const res = await deleteTransaction(id)
        if (res.success) {
          toast.success('مامەڵەکە سڕایەوە')
          router.refresh()
        } else {
          toast.error('هەڵەیەک ڕوویدا لە سڕینەوەی مامەڵەکە')
        }
      }
    });
  }

  const handleExportCSV = () => {
    const headers = ['ژمارەی مامەڵە', 'جۆر', 'بەروار', 'کڕیار/دابینکار', 'هاوپۆل', 'وەسف', 'شێوازی پارەدان', 'بڕی پارە', 'بارودۆخ']
    
    const rows = initialTransactions.map(t => [
      t.transactionNumber || t.id,
      t.type,
      new Date(t.date).toLocaleDateString(),
      t.customer?.name || t.supplier?.name || '-',
      t.category || '-',
      t.description || '-',
      t.paymentMethod || '-',
      t.amount.toString(),
      t.status || 'COMPLETED'
    ])

    const csvContent = "data:text/csv;charset=utf-8,\uFEFF" 
      + headers.join(',') + '\n' 
      + rows.map(e => e.join(',')).join('\n')

    const encodedUri = encodeURI(csvContent)
    const link = document.createElement("a")
    link.setAttribute("href", encodedUri)
    link.setAttribute("download", `transactions_${new Date().toISOString().split('T')[0]}.csv`)
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  }

  const handlePrint = () => {
    window.print()
  }

  // Predefined categories for dropdown
  const categories = [
    'مووچە', 'کرێ', 'ئاو و کارەبا', 'پەیوەندی', 'گواستنەوە', 
    'خۆراک', 'کەرەستە', 'چاککردنەوە', 'باج', 'نەزانراو'
  ];

  const typeFilter = searchParams.get('type') || 'ALL'
  const categoryFilter = searchParams.get('category') || 'ALL'

  return (
    <div>
      <div className={styles.headerActions} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem', flexWrap: 'wrap', gap: '1rem' }}>
        <button className="btn btn-primary" onClick={handleAddClick}>
          + زیادکردنی مامەڵە
        </button>
        <div style={{ display: 'flex', gap: '0.5rem' }}>
          <button className="btn btn-secondary" onClick={handleExportCSV}>Export CSV</button>
          <button className="btn btn-secondary" onClick={handlePrint}>Print</button>
        </div>
      </div>

      <div className={styles.statsGrid}>
        <div className={styles.statCard}>
          <h3 className={styles.statLabel}>کۆی گشتی داهات</h3>
          <p className={styles.statValue} style={{ color: 'var(--color-success)' }}>{formatCurrencyBoth(totalIncome)}</p>
        </div>
        <div className={styles.statCard}>
          <h3 className={styles.statLabel}>کۆی گشتی خەرجی</h3>
          <p className={styles.statValue} style={{ color: 'var(--color-danger)' }}>{formatCurrencyBoth(totalExpense)}</p>
        </div>
        <div className={styles.statCard}>
          <h3 className={styles.statLabel}>پاشەکەوت (قازانج)</h3>
          <p className={styles.statValue} style={{ color: balance >= 0 ? 'var(--color-primary)' : 'var(--color-danger)' }}>
            {formatCurrencyBoth(balance)}
          </p>
        </div>
      </div>

      <div style={{ display: 'flex', gap: '1rem', marginBottom: '1.5rem', flexWrap: 'wrap', backgroundColor: 'var(--color-surface)', padding: '1rem', borderRadius: '12px', border: '1px solid var(--color-border)' }}>
        <input 
          type="text" 
          placeholder="گەڕان..." 
          className="input" 
          value={searchTerm}
          onChange={e => setSearchTerm(e.target.value)}
          style={{ flex: '1 1 200px' }}
        />
        <select className="input" value={typeFilter} onChange={e => updateFilter('type', e.target.value)} style={{ flex: '1 1 150px' }}>
          <option value="ALL">هەموو جۆرەکان</option>
          <option value="INCOME">داهات</option>
          <option value="EXPENSE">خەرجی</option>
          <option value="PAYMENT">پێدان</option>
          <option value="PURCHASE">کڕین</option>
          <option value="SALE">فرۆشتن</option>
          <option value="TRANSFER">حەواڵە</option>
        </select>
        <select className="input" value={categoryFilter} onChange={e => updateFilter('category', e.target.value)} style={{ flex: '1 1 150px' }}>
          <option value="ALL">هەموو هاوپۆلەکان</option>
          {categories.map(c => <option key={c} value={c}>{c}</option>)}
        </select>
      </div>

      <div className={styles.tableContainer}>
        {initialTransactions.length === 0 ? (
          <div className={styles.emptyState}>
            <div className={styles.emptyStateIcon}>💰</div>
            <p>هیچ مامەڵەیەک نەدۆزرایەوە</p>
            {searchTerm === '' && typeFilter === 'ALL' && categoryFilter === 'ALL' && (
              <button className="btn btn-secondary" onClick={handleAddClick}>زیادکردنی یەکەم مامەڵە</button>
            )}
          </div>
        ) : (
          <table className={styles.table}>
            <thead>
              <tr>
                <th style={{ whiteSpace: 'nowrap' }}>کۆد</th>
                <th style={{ whiteSpace: 'nowrap' }}>جۆر</th>
                <th style={{ whiteSpace: 'nowrap' }}>بەروار</th>
                <th style={{ whiteSpace: 'nowrap' }}>کەس / لایەن</th>
                <th style={{ whiteSpace: 'nowrap' }}>هاوپۆل</th>
                <th style={{ minWidth: '250px' }}>تێبینی</th>
                <th style={{ whiteSpace: 'nowrap' }}>شێواز</th>
                <th style={{ whiteSpace: 'nowrap' }}>بڕی پارە</th>
                <th style={{ whiteSpace: 'nowrap' }}>بارودۆخ</th>
                <th className={styles.actionsCell}>کردارەکان</th>
              </tr>
            </thead>
            <tbody>
              {initialTransactions.map((transaction) => {
                const partyName = transaction.customer?.name || transaction.supplier?.name || '-';
                const isPositive = ['INCOME', 'SALE'].includes(transaction.type);
                return (
                <tr key={transaction.id} className={styles.tableRow}>
                  <td style={{ fontSize: '0.875rem', color: 'var(--color-text-muted)', whiteSpace: 'nowrap' }}>{transaction.transactionNumber || '-'}</td>
                  <td style={{ whiteSpace: 'nowrap' }}>
                    <span className={`${styles.typeBadge} ${isPositive ? styles.typeIncome : styles.typeExpense}`}>
                      {transaction.type}
                    </span>
                  </td>
                  <td style={{ whiteSpace: 'nowrap' }}>{formatDate(transaction.date)}</td>
                  <td style={{ whiteSpace: 'nowrap', fontWeight: 500 }}>{partyName}</td>
                  <td style={{ whiteSpace: 'nowrap', color: 'var(--color-text-muted)' }}>{transaction.category || '-'}</td>
                  <td style={{ minWidth: '250px', maxWidth: '400px', wordWrap: 'break-word', lineHeight: '1.5' }}>{transaction.description || '-'}</td>
                  <td style={{ whiteSpace: 'nowrap' }}>
                    <span style={{ backgroundColor: 'var(--color-surface-hover)', padding: '4px 8px', borderRadius: '4px', fontSize: '0.85rem' }}>
                      {transaction.paymentMethod || '-'}
                    </span>
                  </td>
                  <td style={{ fontWeight: 'bold', color: isPositive ? 'var(--color-success)' : 'var(--color-text)', whiteSpace: 'nowrap', fontSize: '1.05rem' }}>
                    {formatCurrencyBoth(transaction.amount)}
                  </td>
                  <td style={{ whiteSpace: 'nowrap' }}>
                    <span style={{ fontSize: '0.75rem', padding: '4px 8px', borderRadius: '6px', fontWeight: 600, backgroundColor: transaction.status === 'COMPLETED' ? '#dcfce7' : '#fef9c3', color: transaction.status === 'COMPLETED' ? '#166534' : '#854d0e' }}>
                      {transaction.status || 'COMPLETED'}
                    </span>
                  </td>
                  <td className={styles.actionsCell}>
                    <div style={{ display: 'flex', gap: '0.5rem' }}>
                      <button 
                        className="btn btn-secondary" 
                        style={{ padding: '0.25rem 0.5rem', fontSize: '0.875rem' }}
                        onClick={() => handleEditClick(transaction)}
                      >
                        گۆڕین
                      </button>
                      <button 
                        className="btn btn-danger" 
                        style={{ padding: '0.25rem 0.5rem', fontSize: '0.875rem' }}
                        onClick={() => handleDelete(transaction.id)}
                      >
                        سڕینەوە
                      </button>
                    </div>
                  </td>
                </tr>
              )})}
            </tbody>
          </table>
        )}
      </div>

      <Pagination totalPages={totalPages} />

      <TransactionModal 
        isOpen={isModalOpen} 
        onClose={() => {
          setIsModalOpen(false)
          setInitialType(undefined)
          router.refresh()
        }} 
        transaction={selectedTransaction}
        initialType={initialType}
        customers={customers}
        suppliers={suppliers}
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
