import { getTranslations } from 'next-intl/server';
import { notFound } from 'next/navigation';

export default async function DashboardDynamicPage({ params }: { params: Promise<{ slug: string, locale: string }> }) {
  const { slug } = await params;
  
  // List of valid dashboard pages
  const validPages = ['invoices', 'products', 'customers', 'transactions', 'settings'];
  
  if (!validPages.includes(slug)) {
    notFound();
  }

  const t = await getTranslations('Navigation');
  
  return (
    <div style={{ padding: '2rem' }}>
      <h1>{t(slug as any) || slug}</h1>
      <p style={{ marginTop: '1rem', color: '#666' }}>
        This page is under construction.
      </p>
    </div>
  );
}
