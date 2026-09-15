'use client'

import { useState } from 'react'
import TransactionModal from '@/components/transactions/TransactionModal'
import { deleteTransaction } from '@/lib/actions/transactions'
import { toast } from 'sonner'
import { formatCurrencyBoth, formatDate } from '@/lib/formatters'
import styles from './transactions.module.css'

interface Transaction {
  id: string
  type: string
  amount: number
  description: string | null
  date: Date
}

interface TransactionsClientProps {
  initialTransactions: Transaction[]
}

export default function TransactionsClient({ initialTransactions }: TransactionsClientProps) {
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [selectedTransaction, setSelectedTransaction] = useState<Transaction | undefined>(undefined)

  const handleAddClick = () => {
    setSelectedTransaction(undefined)
    setIsModalOpen(true)
  }

  const handleEditClick = (transaction: Transaction) => {
    setSelectedTransaction(transaction)
    setIsModalOpen(true)
  }

  const handleDelete = async (id: string) => {
    if (confirm('دڵنیایت لە سڕینەوەی ئەم مامەڵەیە؟')) {
      const res = await deleteTransaction(id)
      if (res.success) {
        toast.success('مامەڵەکە سڕایەوە')
      } else {
        toast.error('هەڵەیەک ڕوویدا لە سڕینەوەی مامەڵەکە')
      }
    }
  }

  // Calculate totals
  const totalIncome = initialTransactions.filter(t => t.type === 'INCOME').reduce((sum, t) => sum + t.amount, 0)
  const totalExpense = initialTransactions.filter(t => t.type === 'EXPENSE').reduce((sum, t) => sum + t.amount, 0)
  const balance = totalIncome - totalExpense

  return (
    <div>
      <div className={styles.headerActions}>
        <button className="btn btn-primary" onClick={handleAddClick}>
          + زیادکردنی مامەڵە
        </button>
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

      <div className={styles.tableContainer}>
        {initialTransactions.length === 0 ? (
          <div className={styles.emptyState}>
            <div className={styles.emptyStateIcon}>💰</div>
            <p>هیچ مامەڵەیەک نەدۆزرایەوە</p>
            <button className="btn btn-secondary" onClick={handleAddClick}>زیادکردنی یەکەم مامەڵە</button>
          </div>
        ) : (
          <table className={styles.table}>
            <thead>
              <tr>
                <th>جۆر</th>
                <th>بەروار</th>
                <th>تێبینی</th>
                <th>بڕی پارە</th>
                <th className={styles.actionsCell}>کردارەکان</th>
              </tr>
            </thead>
            <tbody>
              {initialTransactions.map((transaction) => (
                <tr key={transaction.id}>
                  <td>
                    <span className={`${styles.typeBadge} ${transaction.type === 'INCOME' ? styles.typeIncome : styles.typeExpense}`}>
                      {transaction.type === 'INCOME' ? 'داهات' : 'خەرجی'}
                    </span>
                  </td>
                  <td>{formatDate(transaction.date)}</td>
                  <td>{transaction.description || '-'}</td>
                  <td style={{ fontWeight: 'bold' }}>{formatCurrencyBoth(transaction.amount)}</td>
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
              ))}
            </tbody>
          </table>
        )}
      </div>

      <TransactionModal 
        isOpen={isModalOpen} 
        onClose={() => setIsModalOpen(false)} 
        transaction={selectedTransaction}
      />
    </div>
  )
}
