import { getTranslations } from 'next-intl/server'
import { getSupplierProfile } from '@/lib/actions/suppliers'
import { notFound } from 'next/navigation'
import SupplierProfileClient from './SupplierProfileClient'

export async function generateMetadata({ params }: { params: Promise<{ locale: string, id: string }> }) {
  const { locale } = await params
  const t = await getTranslations({ locale, namespace: 'Suppliers' })
  // Using a fallback just in case 'profile' is missing in translations
  let profileTitle = 'Supplier Profile'
  try { profileTitle = t('profile') } catch (e) {}
  return { title: `${profileTitle} | Dana Group` }
}

export default async function SupplierProfilePage({ params }: { params: Promise<{ locale: string, id: string }> }) {
  const { locale, id } = await params
  
  const supplierProfile = await getSupplierProfile(id)
  
  if (!supplierProfile) {
    notFound()
  }

  // Load translations for the client component
  let t
  try {
    t = await getTranslations({ locale, namespace: 'Suppliers' })
  } catch (e) {
    t = (key: string) => key
  }
  
  const translations = {
    profile: 'Supplier Profile',
    back: 'Back to Suppliers',
    totalPurchases: 'Total Purchases',
    totalPayments: 'Total Payments',
    remainingDebt: 'Remaining Debt',
    purchaseHistory: 'Purchase History',
    paymentHistory: 'Payment History',
    date: 'Date',
    amount: 'Amount',
    status: 'Status',
    paymentMethod: 'Payment Method',
    notes: 'Notes',
    emptyPurchases: 'No purchases found.',
    emptyPayments: 'No payments found.',
  }

  // Attempt to override with actual translations if they exist
  try {
    if (t('profile')) translations.profile = t('profile')
    if (t('back')) translations.back = t('back')
    if (t('totalPurchases')) translations.totalPurchases = t('totalPurchases')
    if (t('totalPayments')) translations.totalPayments = t('totalPayments')
    if (t('remainingDebt')) translations.remainingDebt = t('remainingDebt')
    if (t('purchaseHistory')) translations.purchaseHistory = t('purchaseHistory')
    if (t('paymentHistory')) translations.paymentHistory = t('paymentHistory')
    if (t('date')) translations.date = t('date')
    if (t('amount')) translations.amount = t('amount')
    if (t('status')) translations.status = t('status')
    if (t('paymentMethod')) translations.paymentMethod = t('paymentMethod')
    if (t('notes')) translations.notes = t('notes')
  } catch (e) {}

  return (
    <SupplierProfileClient 
      supplier={supplierProfile} 
      translations={translations} 
      locale={locale} 
    />
  )
}
