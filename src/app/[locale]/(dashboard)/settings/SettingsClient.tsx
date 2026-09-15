'use client'

import { useState } from 'react'
import { toast } from 'sonner'
import { updateProfile } from '@/lib/actions/settings'

interface SettingsClientProps {
  user: {
    id: string
    name: string | null
    email: string | null
    role: string
  }
}

export default function SettingsClient({ user }: SettingsClientProps) {
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setLoading(true)

    const formData = new FormData(e.currentTarget)
    
    try {
      const res = await updateProfile(user.id, formData)

      if (res.success) {
        toast.success('زانیارییەکان بە سەرکەوتوویی نوێکرانەوە')
      } else {
        toast.error(res.error || 'هەڵەیەک ڕوویدا')
      }
    } catch (error) {
      toast.error('هەڵەیەکی نەزانراو ڕوویدا')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div style={{ maxWidth: '600px', margin: '0 auto', background: 'var(--color-surface)', padding: '2rem', borderRadius: '12px', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}>
      <h2 style={{ marginBottom: '1.5rem', fontSize: '1.5rem', color: 'var(--color-text)' }}>زانیارییەکانی هەژمارەکەت</h2>
      
      <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
          <label style={{ fontSize: '0.875rem', fontWeight: '500', color: 'var(--color-text-muted)' }}>ناو</label>
          <input 
            type="text" 
            name="name" 
            className="input" 
            required 
            defaultValue={user.name || ''} 
            style={{ width: '100%', padding: '0.75rem', border: '1px solid var(--color-border)', borderRadius: '6px' }} 
          />
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
          <label style={{ fontSize: '0.875rem', fontWeight: '500', color: 'var(--color-text-muted)' }}>ئیمەیڵ</label>
          <input 
            type="email" 
            name="email" 
            className="input" 
            required 
            defaultValue={user.email || ''} 
            style={{ width: '100%', padding: '0.75rem', border: '1px solid var(--color-border)', borderRadius: '6px' }} 
          />
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
          <label style={{ fontSize: '0.875rem', fontWeight: '500', color: 'var(--color-text-muted)' }}>وشەی نهێنی نوێ (پاسۆرد)</label>
          <input 
            type="password" 
            name="newPassword" 
            className="input" 
            placeholder="گەر ناتەوێت بیگوڕیت بە بەتاڵی جێی بهێڵە"
            style={{ width: '100%', padding: '0.75rem', border: '1px solid var(--color-border)', borderRadius: '6px' }} 
          />
          <span style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)' }}>
            تەنها کاتێک پاسۆرد بنووسە کە بتەوێت پاسۆردەکەت بگۆڕیت
          </span>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
          <label style={{ fontSize: '0.875rem', fontWeight: '500', color: 'var(--color-text-muted)' }}>ئاستی بەکارهێنەر (Role)</label>
          <input 
            type="text" 
            value={user.role === 'ADMINISTRATOR' ? 'بەڕێوەبەر (Admin)' : user.role} 
            disabled 
            style={{ width: '100%', padding: '0.75rem', border: '1px solid var(--color-border)', borderRadius: '6px', background: 'var(--color-background)', color: 'var(--color-text-muted)', cursor: 'not-allowed' }} 
          />
        </div>

        <div style={{ marginTop: '1rem' }}>
          <button type="submit" className="btn btn-primary" style={{ width: '100%', padding: '1rem', fontSize: '1rem' }} disabled={loading}>
            {loading ? '...' : 'پاشەکەوتکردنی گۆڕانکارییەکان'}
          </button>
        </div>
      </form>
    </div>
  )
}
