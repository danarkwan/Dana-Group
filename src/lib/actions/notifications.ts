'use server';

import { prisma } from '@/lib/prisma';
import { revalidatePath } from 'next/cache';

export async function getNotifications() {
  try {
    const notifications = await prisma.notification.findMany({
      orderBy: { createdAt: 'desc' },
      take: 50,
    });
    const unreadCount = await prisma.notification.count({
      where: { isRead: false },
    });
    return { notifications, unreadCount };
  } catch (error) {
    console.error('Failed to get notifications:', error);
    return { notifications: [], unreadCount: 0 };
  }
}

export async function markAsRead(id: string) {
  try {
    await prisma.notification.update({
      where: { id },
      data: { isRead: true },
    });
    revalidatePath('/', 'layout');
    return { success: true };
  } catch (error) {
    console.error('Failed to mark notification as read:', error);
    return { success: false };
  }
}

export async function markAllAsRead() {
  try {
    await prisma.notification.updateMany({
      where: { isRead: false },
      data: { isRead: true },
    });
    revalidatePath('/', 'layout');
    return { success: true };
  } catch (error) {
    console.error('Failed to mark all as read:', error);
    return { success: false };
  }
}

// Function to automatically generate notifications for overdue invoices and low stock.
// Can be called periodically or manually by users.
export async function syncAlerts() {
  try {
    // 1. Check for overdue invoices
    const overdueInvoices = await prisma.invoice.findMany({
      where: {
        dueDate: { lt: new Date() },
        status: { notIn: ['PAID'] },
        remainingBalance: { gt: 0 }
      },
      include: { customer: true }
    });

    for (const invoice of overdueInvoices) {
      // Check if we already have a recent unread notification for this
      const existing = await prisma.notification.findFirst({
        where: {
          type: 'OVERDUE',
          link: `/sales/invoices/${invoice.id}`,
          isRead: false
        }
      });

      if (!existing) {
        await prisma.notification.create({
          data: {
            type: 'OVERDUE',
            title: 'وەسڵی بەسەرچوو',
            message: `وەسڵی ژمارە ${invoice.invoiceNumber} بۆ ${invoice.customer?.name || invoice.customerName} کاتی بەسەرچووە، بڕی ماوە: ${invoice.remainingBalance}`,
            link: `/sales/invoices/${invoice.id}`
          }
        });
      }
    }

    // 2. Check for overdue purchases
    const overduePurchases = await prisma.purchase.findMany({
      where: {
        dueDate: { lt: new Date() },
        status: { notIn: ['PAID'] },
        remainingBalance: { gt: 0 }
      },
      include: { supplier: true }
    });

    for (const purchase of overduePurchases) {
      const existing = await prisma.notification.findFirst({
        where: {
          type: 'DEBT',
          link: `/purchases/${purchase.id}`,
          isRead: false
        }
      });

      if (!existing) {
        await prisma.notification.create({
          data: {
            type: 'DEBT',
            title: 'قەرزی دابینکار بەسەرچوو',
            message: `قەرزی دابینکار ${purchase.supplier?.name} لە وەسڵی ${purchase.purchaseNumber} کاتی بەسەرچووە، بڕی قەرز: ${purchase.remainingBalance}`,
            link: `/purchases/${purchase.id}`
          }
        });
      }
    }

    // 3. Check for low inventory
    const lowStockProducts = await prisma.product.findMany({
      where: {
        stock: { lte: prisma.product.fields.minStock } // Assuming minStock is used correctly, alternatively we can fetch and filter in JS if needed
      }
    });

    // In Prisma, comparing two fields in where clause isn't directly supported in all versions easily without raw queries or specific setup, 
    // so let's do it in JS to be safe:
    const allProducts = await prisma.product.findMany();
    const lowProducts = allProducts.filter(p => p.stock <= p.minStock);

    for (const p of lowProducts) {
      const existing = await prisma.notification.findFirst({
        where: {
          type: 'LOW_STOCK',
          link: `/inventory/${p.id}`,
          isRead: false
        }
      });

      if (!existing) {
        await prisma.notification.create({
          data: {
            type: 'LOW_STOCK',
            title: 'کاڵا کەمە لە کۆگا',
            message: `کاڵای "${p.name}" ڕێژەی لە کۆگا گەیشتووەتە ئاستی مەترسیدار (${p.stock}).`,
            link: `/inventory/${p.id}` // assuming we have a page or just link to inventory
          }
        });
      }
    }

    revalidatePath('/', 'layout');
    return { success: true };
  } catch (error) {
    console.error('Failed to sync alerts:', error);
    return { success: false };
  }
}

export async function createNotification(data: { type: string, title: string, message: string, link?: string }) {
  try {
    await prisma.notification.create({
      data: {
        type: data.type,
        title: data.title,
        message: data.message,
        link: data.link
      }
    });
    revalidatePath('/', 'layout');
  } catch (error) {
    console.error('Failed to create notification', error);
  }
}
