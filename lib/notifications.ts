import { db } from './db';

/**
 * Send an in-app notification to a specific user.
 */
export async function sendNotification(userId: string, title: string, message: string) {
  try {
    const notification = await db.notification.create({
      data: {
        userId,
        title,
        message,
        isRead: false,
      },
    });
    return notification;
  } catch (error) {
    console.error(`[Notification Utility] Failed to send notification to user ${userId}:`, error);
    return null;
  }
}
