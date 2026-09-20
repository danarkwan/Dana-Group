'use client';

import { useRouter, usePathname, useSearchParams } from 'next/navigation';
import { useState, useEffect } from 'react';

export default function PurchasesFilter() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const pathname = usePathname();

  const [searchTerm, setSearchTerm] = useState(searchParams.get('query') || '');

  useEffect(() => {
    const timer = setTimeout(() => {
      const params = new URLSearchParams(searchParams);
      if (searchTerm) params.set('query', searchTerm);
      else params.delete('query');
      params.delete('page');
      router.replace(`${pathname}?${params.toString()}`);
    }, 400);
    return () => clearTimeout(timer);
  }, [searchTerm, pathname, router, searchParams]);

  const updateStatus = (status: string) => {
    const params = new URLSearchParams(searchParams);
    if (status && status !== 'ALL') params.set('status', status);
    else params.delete('status');
    params.delete('page');
    router.replace(`${pathname}?${params.toString()}`);
  }

  return (
    <div style={{ display: 'flex', gap: '1rem', marginBottom: '1.5rem', flexWrap: 'wrap', backgroundColor: 'var(--color-surface)', padding: '1rem', borderRadius: '12px', border: '1px solid var(--color-border)' }}>
      <input 
        type="text" 
        placeholder="گەڕان..." 
        className="input" 
        value={searchTerm}
        onChange={e => setSearchTerm(e.target.value)}
        style={{ flex: '1 1 200px' }}
      />
      <select 
        className="input" 
        value={searchParams.get('status') || 'ALL'} 
        onChange={e => updateStatus(e.target.value)} 
        style={{ flex: '1 1 150px' }}
      >
        <option value="ALL">هەموو بارودۆخەکان</option>
        <option value="PAID">دراوە</option>
        <option value="PENDING">نەدراوە</option>
        <option value="PARTIAL">بەشێک دراوە</option>
        <option value="OVERDUE">بەسەرچوو</option>
      </select>
    </div>
  )
}
