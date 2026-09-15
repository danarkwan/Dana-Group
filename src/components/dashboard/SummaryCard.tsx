import React from 'react';
import styles from './SummaryCard.module.css';
import { LucideIcon, TrendingUp, TrendingDown } from 'lucide-react';
import NextLink from 'next/link';

interface SummaryCardProps {
  title: string;
  value: string | number;
  change: string;
  isPositive: boolean;
  Icon: LucideIcon;
  href?: string;
}

export default function SummaryCard({ title, value, change, isPositive, Icon, href }: SummaryCardProps) {
  const content = (
    <>
      <div className={styles.header}>
        <h3 className={styles.title}>{title}</h3>
        <div className={styles.iconWrapper}>
          <Icon size={20} />
        </div>
      </div>
      
      <div className={styles.value}>{value}</div>
      
      <div className={styles.footer}>
        <div className={isPositive ? styles.changePositive : styles.changeNegative}>
          {isPositive ? <TrendingUp size={16} /> : <TrendingDown size={16} />}
          <span style={{ margin: '0 4px' }}>{change}</span>
        </div>
      </div>
    </>
  );

  if (href) {
    return (
      <NextLink href={href} className={`${styles.card} ${styles.clickable}`}>
        {content}
      </NextLink>
    );
  }

  return (
    <div className={styles.card}>
      {content}
    </div>
  );
}
