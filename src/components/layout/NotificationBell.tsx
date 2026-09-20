'use client';

import React, { useState, useEffect, useRef } from 'react';
import { Bell, Check, Trash2, X } from 'lucide-react';
import Link from 'next/link';
import { getNotifications, markAsRead, markAllAsRead, syncAlerts } from '@/lib/actions/notifications';
import { useRouter } from 'next/navigation';

export default function NotificationBell() {
  const [notifications, setNotifications] = useState<any[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const router = useRouter();

  useEffect(() => {
    fetchNotifications();

    // Optionally sync alerts when the user logs in or bell mounts
    syncAlerts().then(() => fetchNotifications());

    // Click outside to close
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const fetchNotifications = async () => {
    const res = await getNotifications();
    setNotifications(res.notifications);
    setUnreadCount(res.unreadCount);
  };

  const handleMarkAsRead = async (id: string) => {
    await markAsRead(id);
    await fetchNotifications();
  };

  const handleMarkAllAsRead = async () => {
    await markAllAsRead();
    await fetchNotifications();
    setIsOpen(false);
  };

  const handleNotificationClick = async (notif: any) => {
    if (!notif.isRead) {
      await markAsRead(notif.id);
      fetchNotifications();
    }
    setIsOpen(false);
    if (notif.link) {
      router.push(notif.link);
    }
  };

  return (
    <div style={{ position: 'relative' }} ref={dropdownRef}>
      <button 
        onClick={() => setIsOpen(!isOpen)}
        style={{ 
          background: 'none', border: 'none', cursor: 'pointer', 
          position: 'relative', display: 'flex', alignItems: 'center', justifyContent: 'center',
          padding: '0.5rem', borderRadius: '50%', transition: 'background 0.2s', minHeight: '44px'
        }}
        className="hover-bg-muted"
        aria-label="Notifications"
        title="Notifications"
      >
        <Bell size={20} />
        {unreadCount > 0 && (
          <span style={{
            position: 'absolute', top: '0', right: '0', 
            background: 'var(--color-danger)', color: 'white', 
            fontSize: '10px', fontWeight: 'bold', 
            width: '18px', height: '18px', 
            display: 'flex', alignItems: 'center', justifyContent: 'center', 
            borderRadius: '50%', transform: 'translate(25%, -25%)'
          }}>
            {unreadCount > 99 ? '99+' : unreadCount}
          </span>
        )}
      </button>

      {isOpen && (
        <div style={{
          position: 'absolute', top: '120%', left: '0', // Left since layout is RTL typically, this aligns it nicely
          width: '350px', background: 'var(--color-surface)', 
          border: '1px solid var(--color-border)', borderRadius: '8px',
          boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.1)', zIndex: 50,
          display: 'flex', flexDirection: 'column', maxHeight: '400px'
        }}>
          <div style={{ padding: '1rem', borderBottom: '1px solid var(--color-border)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <h3 style={{ margin: 0, fontSize: '1rem' }}>ئاگادارکردنەوەکان</h3>
            {unreadCount > 0 && (
              <button onClick={handleMarkAllAsRead} style={{ background: 'none', border: 'none', color: 'var(--color-primary)', cursor: 'pointer', fontSize: '0.875rem' }}>
                هەمووی بخوێنەوە
              </button>
            )}
          </div>
          
          <div style={{ overflowY: 'auto', flex: 1 }}>
            {notifications.length === 0 ? (
              <div style={{ padding: '2rem 1rem', textAlign: 'center', color: 'var(--color-text-muted)' }}>
                هیچ ئاگادارکردنەوەیەک نییە
              </div>
            ) : (
              notifications.map((notif) => (
                <div 
                  key={notif.id}
                  onClick={() => handleNotificationClick(notif)}
                  style={{ 
                    padding: '1rem', borderBottom: '1px solid var(--color-border)', 
                    cursor: 'pointer', background: notif.isRead ? 'transparent' : 'rgba(59, 130, 246, 0.05)',
                    transition: 'background 0.2s', display: 'flex', gap: '1rem', alignItems: 'flex-start'
                  }}
                  className="hover-bg-muted"
                >
                  <div style={{ flex: 1 }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.25rem' }}>
                      <strong style={{ fontSize: '0.875rem', color: notif.isRead ? 'var(--color-text)' : 'var(--color-primary)' }}>
                        {notif.title}
                      </strong>
                      {!notif.isRead && <span style={{ width: '8px', height: '8px', background: 'var(--color-primary)', borderRadius: '50%', display: 'inline-block' }} />}
                    </div>
                    <p style={{ margin: 0, fontSize: '0.875rem', color: 'var(--color-text-muted)', lineHeight: '1.4' }}>
                      {notif.message}
                    </p>
                    <span style={{ fontSize: '0.75rem', color: '#9ca3af', display: 'block', marginTop: '0.5rem' }}>
                      {new Date(notif.createdAt).toLocaleDateString('en-GB')} {new Date(notif.createdAt).toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' })}
                    </span>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
}
