import type { Metadata } from "next";
import { NextIntlClientProvider } from 'next-intl';
import { getMessages } from 'next-intl/server';
import { NextAuthProvider } from '@/providers/NextAuthProvider';
import "./globals.css";

export const metadata: Metadata = {
  title: "Dana Group Accounting",
  description: "Advanced Accounting & Business Management System",
};

import { Toaster } from 'sonner';

export default async function RootLayout({
  children,
  params
}: Readonly<{
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
}>) {
  const { locale } = await params;
  // Providing all messages to the client
  // side is the easiest way to get started
  const messages = await getMessages();
  
  const direction = (locale === 'ar' || locale === 'ku') ? 'rtl' : 'ltr';

  return (
    <html lang={locale} dir={direction} data-theme="light" suppressHydrationWarning>
      <body suppressHydrationWarning>
        <NextAuthProvider>
          <NextIntlClientProvider messages={messages}>
            {children}
            <Toaster position="top-center" richColors expand={true} />
          </NextIntlClientProvider>
        </NextAuthProvider>
      </body>
    </html>
  );
}
