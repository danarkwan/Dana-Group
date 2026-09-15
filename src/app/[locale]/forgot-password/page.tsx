"use client";

import { useState } from 'react';
import Logo from '@/components/ui/Logo';
import styles from '../login/login.module.css';

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('');
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [resetLink, setResetLink] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setMessage('');
    setResetLink('');

    try {
      const res = await fetch('/api/auth/forgot-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error || 'هەڵەیەک ڕوویدا');
      } else {
        setMessage('بەستەری گۆڕینی وشەی نهێنی دروستکرا.');
        if (data.resetLink) {
          setResetLink(data.resetLink);
        }
      }
    } catch (err) {
      setError('کێشەیەک لە پەیوەندی هەیە');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={styles.loginContainer}>
      <div className={styles.imageBackground}>
        <div className={styles.imageOverlay}></div>
      </div>
      <div className={styles.loginCard}>
        <div className={styles.loginHeader}>
          <div className={styles.logoIconContainer}>
            <Logo />
          </div>
          <h1 className={styles.title}>گێڕانەوەی وشەی نهێنی</h1>
        </div>

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem', width: '100%', maxWidth: '300px', margin: '0 auto' }}>
          {error && <div style={{ color: 'red', textAlign: 'center', backgroundColor: '#fee2e2', padding: '0.5rem', borderRadius: '4px' }}>{error}</div>}
          {message && <div style={{ color: 'green', textAlign: 'center', backgroundColor: '#dcfce3', padding: '0.5rem', borderRadius: '4px' }}>{message}</div>}
          
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
            <label htmlFor="email" style={{ fontSize: '0.9rem', fontWeight: 500 }}>ئیمەیڵ</label>
            <input
              id="email"
              type="email"
              style={{ padding: '0.75rem', borderRadius: '8px', border: '1px solid #d1d5db', outline: 'none' }}
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>

          <button 
            type="submit" 
            style={{ padding: '0.75rem', borderRadius: '8px', backgroundColor: '#2563EB', color: 'white', border: 'none', cursor: 'pointer', fontWeight: 600 }}
            disabled={loading}
          >
            {loading ? '...' : 'ناردن'}
          </button>

          {resetLink && (
            <div style={{ marginTop: '1rem', padding: '1rem', border: '1px solid #93c5fd', backgroundColor: '#eff6ff', borderRadius: '8px', textAlign: 'center' }}>
              <p style={{ marginBottom: '0.5rem', fontSize: '0.9rem', color: '#1e40af' }}>بۆ ئەم سیستەمە لۆکاڵییە، تکایە ڕاستەوخۆ کلیک لێرە بکە:</p>
              <a href={resetLink} style={{ color: '#2563EB', fontWeight: 'bold', textDecoration: 'underline' }}>
                گۆڕینی وشەی نهێنی
              </a>
            </div>
          )}

          <div style={{ textAlign: 'center', marginTop: '1rem' }}>
            <a href="/ku/login" style={{ color: '#6b7280', fontSize: '0.9rem', textDecoration: 'none' }}>
              گەڕانەوە بۆ چوونەژوورەوە
            </a>
          </div>
        </form>
      </div>
    </div>
  );
}
