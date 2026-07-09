import { db } from '@/lib/db';

export async function logAdminAction(
  adminId: string,
  action: string,
  targetEntity: string,
  details?: string
) {
  try {
    return await db.adminAuditLog.create({
      data: {
        adminId,
        action,
        targetEntity,
        details,
      },
    });
  } catch (error) {
    console.error('Failed to write admin audit log:', error);
  }
}
