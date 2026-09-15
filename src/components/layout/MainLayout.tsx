"use client";

import React, { useState } from 'react';
import { useTranslations } from 'next-intl';
import { useParams, usePathname } from 'next/navigation';
import Link from 'next/link';
import { LayoutDashboard, Receipt, Package, Users, Truck, ShoppingCart, ArrowRightLeft, Settings, Menu, LogOut, X, Moon, Sun, User } from 'lucide-react';
import { signOut } from 'next-auth/react';
import Logo from '@/components/ui/Logo';
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

  const navItems = [
    { icon: LayoutDashboard, label: t('dashboard'), href: '/' },
    { icon: Receipt, label: t('invoices'), href: '/invoices' },
    { icon: Package, label: t('products'), href: '/products' },
    { icon: Users, label: t('customers'), href: '/customers' },
    { icon: Truck, label: t('suppliers'), href: '/suppliers' },
    { icon: ShoppingCart, label: t('purchases'), href: '/purchases' },
    { icon: ArrowRightLeft, label: t('transactions'), href: '/transactions' },
    { icon: Settings, label: t('settings'), href: '/settings' },
  ];

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
          <button className={styles.closeBtn} onClick={() => setSidebarOpen(false)}>
            <X size={24} />
          </button>
        </div>

        <nav className={styles.nav}>
          {navItems.map((item, idx) => {
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
            <button className={styles.menuBtn} onClick={() => setSidebarOpen(true)}>
              <Menu size={24} />
            </button>
          </div>
          <div className={styles.headerRight}>
            <button className={styles.themeBtn} onClick={toggleTheme}>
              {theme === 'light' ? <Moon size={20} /> : <Sun size={20} />}
            </button>
            <Link href={`/${locale}/settings`} className={styles.avatar}>
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
