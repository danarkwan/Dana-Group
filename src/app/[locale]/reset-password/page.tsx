"use client";

import { useState, useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Logo from '@/components/ui/Logo';
import styles from '../login/login.module.css';

function ResetPasswordForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const token = searchParams.get('token');

  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  useEffect(() => {
    if (!token) {
      setError('بەستەرەکە نادروستە یان بوونی نییە');
    }
  }, [token]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!token) return;

    if (password !== confirmPassword) {
      setError('وشە نهێنییەکان وەک یەک نین');
      return;
    }

    setLoading(true);
    setError('');
    setMessage('');

    try {
      const res = await fetch('/api/auth/reset-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token, password }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error || 'هەڵەیەک ڕوویدا');
      } else {
        setMessage('وشەی نهێنی بە سەرکەوتوویی گۆڕدرا. دەتوانیت ئێستا بچیتە ژوورەوە.');
        setTimeout(() => {
          router.push('/ku/login');
        }, 3000);
      }
    } catch (err) {
      setError('کێشەیەک لە پەیوەندی هەیە');
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem', width: '100%', maxWidth: '300px', margin: '0 auto' }}>
      {error && <div style={{ color: 'red', textAlign: 'center', backgroundColor: '#fee2e2', padding: '0.5rem', borderRadius: '4px' }}>{error}</div>}
      {message && <div style={{ color: 'green', textAlign: 'center', backgroundColor: '#dcfce3', padding: '0.5rem', borderRadius: '4px' }}>{message}</div>}
      
      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
        <label htmlFor="password" style={{ fontSize: '0.9rem', fontWeight: 500 }}>وشەی نهێنی نوێ</label>
        <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
          <input
            id="password"
            type={showPassword ? "text" : "password"}
            style={{ padding: '0.75rem', borderRadius: '8px', border: '1px solid #d1d5db', outline: 'none', textAlign: 'left', width: '100%', paddingRight: '2.5rem' }}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            disabled={!token}
            dir="ltr"
          />
          <button
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            style={{
              position: 'absolute',
              right: '0.75rem',
              background: 'none',
              border: 'none',
              cursor: 'pointer',
              color: '#6b7280',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              padding: '0.25rem'
            }}
          >
            {showPassword ? (
              <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M9.88 9.88a3 3 0 1 0 4.24 4.24"/><path d="M10.73 5.08A10.43 10.43 0 0 1 12 5c7 0 10 7 10 7a13.16 13.16 0 0 1-1.67 2.68"/><path d="M6.61 6.61A13.526 13.526 0 0 0 2 12s3 7 10 7a9.74 9.74 0 0 0 5.39-1.61"/><line x1="2" x2="22" y1="2" y2="22"/></svg>
            ) : (
              <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M2 12s3-7 10-7 10 7 10 7-3 7-10 7-10-7-10-7Z"/><circle cx="12" cy="12" r="3"/></svg>
            )}
          </button>
        </div>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
        <label htmlFor="confirmPassword" style={{ fontSize: '0.9rem', fontWeight: 500 }}>دووپاتکردنەوەی وشەی نهێنی</label>
        <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
          <input
            id="confirmPassword"
            type={showConfirmPassword ? "text" : "password"}
            style={{ padding: '0.75rem', borderRadius: '8px', border: '1px solid #d1d5db', outline: 'none', textAlign: 'left', width: '100%', paddingRight: '2.5rem' }}
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            required
            disabled={!token}
            dir="ltr"
          />
          <button
            type="button"
            onClick={() => setShowConfirmPassword(!showConfirmPassword)}
            style={{
              position: 'absolute',
              right: '0.75rem',
              background: 'none',
              border: 'none',
              cursor: 'pointer',
              color: '#6b7280',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              padding: '0.25rem'
            }}
          >
            {showConfirmPassword ? (
              <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M9.88 9.88a3 3 0 1 0 4.24 4.24"/><path d="M10.73 5.08A10.43 10.43 0 0 1 12 5c7 0 10 7 10 7a13.16 13.16 0 0 1-1.67 2.68"/><path d="M6.61 6.61A13.526 13.526 0 0 0 2 12s3 7 10 7a9.74 9.74 0 0 0 5.39-1.61"/><line x1="2" x2="22" y1="2" y2="22"/></svg>
            ) : (
              <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M2 12s3-7 10-7 10 7 10 7-3 7-10 7-10-7-10-7Z"/><circle cx="12" cy="12" r="3"/></svg>
            )}
          </button>
        </div>
      </div>

      <button 
        type="submit" 
        style={{ padding: '0.75rem', borderRadius: '8px', backgroundColor: '#2563EB', color: 'white', border: 'none', cursor: 'pointer', fontWeight: 600, opacity: !token ? 0.5 : 1 }}
        disabled={loading || !token}
      >
        {loading ? '...' : 'گۆڕین'}
      </button>

      <div style={{ textAlign: 'center', marginTop: '1rem' }}>
        <a href="/ku/login" style={{ color: '#6b7280', fontSize: '0.9rem', textDecoration: 'none' }}>
          گەڕانەوە بۆ چوونەژوورەوە
        </a>
      </div>
    </form>
  );
}

export default function ResetPasswordPage() {
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
          <h1 className={styles.title}>گۆڕینی وشەی نهێنی</h1>
        </div>

        <Suspense fallback={<div style={{ textAlign: 'center' }}>چاوەڕێ بکە...</div>}>
          <ResetPasswordForm />
        </Suspense>
      </div>
    </div>
  );
}
