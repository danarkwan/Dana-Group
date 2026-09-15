import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import crypto from 'crypto';

export async function POST(request: Request) {
  try {
    const { email } = await request.json();

    if (!email) {
      return NextResponse.json({ error: 'ئیمەیڵ پێویستە' }, { status: 400 });
    }

    const user = await prisma.user.findUnique({
      where: { email },
    });

    if (!user) {
      // Don't leak whether user exists for security reasons in a real app,
      // but since this is a local app, we can be helpful.
      return NextResponse.json({ error: 'هیچ هەژمارێک بەم ئیمەیڵە نەدۆزرایەوە' }, { status: 404 });
    }

    // Generate a reset token
    const resetToken = crypto.randomBytes(32).toString('hex');
    const resetTokenExpiry = new Date(Date.now() + 3600000); // 1 hour from now

    await prisma.user.update({
      where: { email },
      data: {
        resetToken,
        resetTokenExpiry,
      },
    });

    // In a real app, we would send an email here.
    // For this local app, we will return the token so the UI can show the link directly.
    const resetLink = `/ku/reset-password?token=${resetToken}`;

    return NextResponse.json({ 
      message: 'سەرکەوتوو بوو',
      resetLink 
    });
  } catch (error) {
    console.error('Forgot password error:', error);
    return NextResponse.json({ error: 'هەڵەیەک ڕوویدا' }, { status: 500 });
  }
}
