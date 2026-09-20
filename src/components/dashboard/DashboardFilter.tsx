"use client";

import React, { useEffect, useState, useRef } from 'react';
import { useRouter, usePathname, useSearchParams } from 'next/navigation';
import styles from './DashboardFilter.module.css';
import { useTranslations, useLocale } from 'next-intl';
import { CalendarDays } from 'lucide-react';
import { formatCleanDate } from '@/lib/formatters';

export default function DashboardFilter() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const t = useTranslations('Dashboard');
  const locale = useLocale();

  const currentPeriod = searchParams.get('period') || 'thisMonth';
  const fromDate = searchParams.get('from') || '';
  const toDate = searchParams.get('to') || '';

  const fromInputRef = useRef<HTMLInputElement>(null);
  const toInputRef = useRef<HTMLInputElement>(null);

  const handlePeriodChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const newPeriod = e.target.value;
    const params = new URLSearchParams(searchParams.toString());
    
    if (newPeriod !== 'custom') {
      params.delete('from');
      params.delete('to');
    }
    
    params.set('period', newPeriod);
    router.push(`${pathname}?${params.toString()}`);
  };

  const handleDateChange = (type: 'from' | 'to', value: string) => {
    const params = new URLSearchParams(searchParams.toString());
    if (value) {
      params.set(type, value);
    } else {
      params.delete(type);
    }
    params.set('period', 'custom');
    router.push(`${pathname}?${params.toString()}`);
  };

  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);

  if (!mounted) return <div className={styles.filterContainer}></div>;

  return (
    <div className={styles.filterContainer}>
      <label htmlFor="dashboard-period" className={styles.label}>
        {t('filterDate')}:
      </label>
      
      <select 
        id="dashboard-period"
        className={styles.periodSelect}
        value={currentPeriod}
        onChange={handlePeriodChange}
      >
        <option value="today">{t('today')}</option>
        <option value="thisWeek">{t('thisWeek')}</option>
        <option value="thisMonth">{t('thisMonth')}</option>
        <option value="thisYear">{t('thisYear')}</option>
        <option value="allTime">{t('allTime')}</option>
        <option value="custom">{t('customDate')}</option>
      </select>

      {currentPeriod === 'custom' && (
        <div className={styles.customDateContainer}>
          <div 
            className={styles.dateDisplay} 
            onClick={() => {
              if (fromInputRef.current && 'showPicker' in fromInputRef.current) {
                try { fromInputRef.current.showPicker(); } catch (e) {}
              }
            }}
          >
            <span>{fromDate ? formatCleanDate(fromDate, locale) : t('fromDate')}</span>
            <CalendarDays size={16} className={styles.icon} />
            <input
              ref={fromInputRef}
              type="date"
              className={styles.invisibleDateInput}
              value={fromDate}
              onChange={(e) => handleDateChange('from', e.target.value)}
            />
          </div>
          
          <span className={styles.label}>-</span>

          <div 
            className={styles.dateDisplay}
            onClick={() => {
              if (toInputRef.current && 'showPicker' in toInputRef.current) {
                try { toInputRef.current.showPicker(); } catch (e) {}
              }
            }}
          >
            <span>{toDate ? formatCleanDate(toDate, locale) : t('toDate')}</span>
            <CalendarDays size={16} className={styles.icon} />
            <input
              ref={toInputRef}
              type="date"
              className={styles.invisibleDateInput}
              value={toDate}
              onChange={(e) => handleDateChange('to', e.target.value)}
            />
          </div>
        </div>
      )}
    </div>
  );
}
