"use client";

import React, { useState } from 'react';
import { useTranslations } from 'next-intl';
import { useParams, usePathname } from 'next/navigation';
import Link from 'next/link';
import { LayoutDashboard, Receipt, Package, Users, Truck, ShoppingCart, ArrowRightLeft, Settings, Menu, LogOut, X, Moon, Sun, User, BarChart, CircleDollarSign, Wallet } from 'lucide-react';
import { signOut, useSession } from 'next-auth/react';
import { hasAccess, AppSection } from '@/lib/permissions';
import Logo from '@/components/ui/Logo';
import NotificationBell from './NotificationBell';
import styles from './MainLayout.module.css';

export default function MainLayout({ children }: { children: React.ReactNode }) {
  const t = useTranslations('Navigation');
  const params = useParams();
  const pathname = usePathname();
  const locale = params?.locale as string || 'ku';
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [theme, setTheme] = useState('light');

  const toggleTheme = () => {
    const newTheme = theme === 'light' ? 'dark' : 'light';
    setTheme(newTheme);
    document.documentElement.setAttribute('data-theme', newTheme);
  };

  const { data: session } = useSession();

  const navItems = [
    { icon: LayoutDashboard, label: t('dashboard'), href: '/', section: 'dashboard' as AppSection },
    { icon: CircleDollarSign, label: t('transactions'), href: '/transactions', section: 'transactions' as AppSection },
    { icon: Wallet, label: 'پارەدانەکان', href: '/payments', section: 'payments' as AppSection },
    { icon: Package, label: t('products'), href: '/products', section: 'products' as AppSection },
    { icon: Users, label: t('customers'), href: '/customers', section: 'customers' as AppSection },
    { icon: Truck, label: t('suppliers'), href: '/suppliers', section: 'suppliers' as AppSection },
    { icon: ShoppingCart, label: t('purchases'), href: '/purchases', section: 'inventory' as AppSection },
    { icon: ArrowRightLeft, label: t('invoices'), href: '/invoices', section: 'invoices' as AppSection }, 
    { icon: Users, label: 'کارمەندان', href: '/employees', section: 'employees' as AppSection }, // Used Users icon, you could use Briefcase
    { icon: CircleDollarSign, label: 'مووچەکان', href: '/payroll', section: 'payroll' as AppSection }, // Payroll
    { icon: BarChart, label: 'ڕاپۆرتەکان', href: '/reports', section: 'reports' as AppSection }, 
    { icon: Settings, label: t('settings'), href: '/settings', section: 'settings' as AppSection },
  ];

  const visibleNavItems = navItems.filter(item => hasAccess(session?.user, item.section));


  return (
    <div className={styles.layout}>
      {/* Mobile Sidebar Overlay */}
      {sidebarOpen && (
        <div className={styles.overlay} onClick={() => setSidebarOpen(false)} />
      )}

      {/* Sidebar */}
      <aside className={`${styles.sidebar} ${sidebarOpen ? styles.sidebarOpen : ''}`}>
        <div className={styles.sidebarHeader}>
          <div className={styles.logo}>
            <div className={styles.logoIconContainer}>
              <Logo />
            </div>
            <span className={styles.logoText}>Dana Group</span>
          </div>
          <button className={styles.closeBtn} onClick={() => setSidebarOpen(false)} aria-label="Close menu" title="Close menu">
            <X size={24} />
          </button>
        </div>

        <nav className={styles.nav}>
          {visibleNavItems.map((item, idx) => {
            const path = item.href === '/' ? `/${locale}` : `/${locale}${item.href}`;
            const isActive = item.href === '/' 
              ? pathname === path 
              : pathname.startsWith(path);
              
            return (
              <Link 
                key={idx} 
                href={path} 
                className={`${styles.navItem} ${isActive ? styles.active : ''}`}
                onClick={() => setSidebarOpen(false)}
              >
                <item.icon size={20} />
                <span>{item.label}</span>
              </Link>
            );
          })}
        </nav>

        <div className={styles.sidebarFooter}>
          <button onClick={() => signOut()} className={styles.logoutBtn}>
            <LogOut size={20} />
            <span>{t('logout')}</span>
          </button>
        </div>
      </aside>

      {/* Main Content Area */}
      <div className={styles.mainArea}>
        {/* Header */}
        <header className={styles.header}>
          <div className={styles.headerLeft}>
            <button className={styles.menuBtn} onClick={() => setSidebarOpen(true)} aria-label="Open menu" title="Open menu">
              <Menu size={24} />
            </button>
          </div>
          <div className={styles.headerRight}>
            <button className={styles.themeBtn} onClick={toggleTheme} aria-label="Toggle theme" title="Toggle theme">
              {theme === 'light' ? <Moon size={20} /> : <Sun size={20} />}
            </button>
            <NotificationBell />
            <Link href={`/${locale}/settings`} className={styles.avatar} aria-label="User settings" title="User settings">
              <User size={20} />
            </Link>
          </div>
        </header>

        {/* Page Content */}
        <main className={styles.mainContent}>
          {children}
        </main>
      </div>
    </div>
  );
}
