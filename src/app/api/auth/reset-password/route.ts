import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import bcryptjs from 'bcryptjsjs';

export async function POST(request: Request) {
  try {
    const { token, password } = await request.json();

    if (!token || !password) {
      return NextResponse.json({ error: 'داتا پێویستەکان تەواو نین' }, { status: 400 });
    }

    const user = await prisma.user.findFirst({
      where: {
        resetToken: token,
        resetTokenExpiry: {
          gt: new Date(), // ensure token is not expired
        },
      },
    });

    if (!user) {
      return NextResponse.json({ error: 'بەستەرەکە بەسەرچووە یان هەڵەیە' }, { status: 400 });
    }

    // Hash the new password
    const hashedPassword = await bcryptjs.hash(password, 10);

    // Update user and clear reset tokens
    await prisma.user.update({
      where: { id: user.id },
      data: {
        password: hashedPassword,
        resetToken: null,
        resetTokenExpiry: null,
      },
    });

    return NextResponse.json({ message: 'وشەی نهێنی بە سەرکەوتوویی گۆڕدرا' });
  } catch (error) {
    console.error('Reset password error:', error);
    return NextResponse.json({ error: 'هەڵەیەک ڕوویدا' }, { status: 500 });
  }
}
