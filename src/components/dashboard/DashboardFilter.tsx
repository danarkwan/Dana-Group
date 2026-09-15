"use client";

import React from 'react';
import { useRouter, usePathname, useSearchParams } from 'next/navigation';
import styles from './DashboardFilter.module.css';
import { useTranslations } from 'next-intl';
import { CalendarDays } from 'lucide-react';

export default function DashboardFilter() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const t = useTranslations('Dashboard');

  const currentDate = searchParams.get('date') || new Date().toISOString().split('T')[0];

  const handleDateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newDate = e.target.value;
    const params = new URLSearchParams(searchParams);
    
    if (newDate) {
      params.set('date', newDate);
    } else {
      params.delete('date');
    }
    
    router.push(`${pathname}?${params.toString()}`);
  };

  return (
    <div className={styles.filterContainer}>
      <label htmlFor="dashboard-date" className={styles.label}>
        {t('filterDate')}:
      </label>
      <div className={styles.inputWrapper}>
        <input
          type="date"
          id="dashboard-date"
          className={styles.dateInput}
          value={currentDate}
          onChange={handleDateChange}
        />
        <CalendarDays className={styles.icon} size={18} />
      </div>
    </div>
  );
}
