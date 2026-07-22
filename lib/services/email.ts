import nodemailer from 'nodemailer';

export async function sendAdminApprovalNotification(vendorName: string, businessName: string, vendorEmail: string) {
  const adminEmail = process.env.ADMIN_NOTIFICATION_EMAIL || 'admin@nivara.com';
  
  const subject = `⚠️ ACTION REQUIRED: New Host Registration - ${businessName}`;
  const text = `
Hello Admin,

A new wellness van operator has registered on the Nivara marketplace and is awaiting vetting and approval.

Host Details:
- Name: ${vendorName}
- Business Name: ${businessName}
- Contact Email: ${vendorEmail}

Please log in to the Admin Approvals Queue to review their profile details, payout credentials, and approve or reject this host:
https://nivara-ten.vercel.app/admin/approvals

Regards,
Nivara Automation Agent
  `;

  console.log(`\n==================================================`);
  console.log(`[EMAIL SIMULATION]`);
  console.log(`TO: ${adminEmail}`);
  console.log(`SUBJECT: ${subject}`);
  console.log(`CONTENT:\n${text}`);
  console.log(`==================================================\n`);

  // Check if SMTP is configured
  if (process.env.SMTP_HOST && process.env.SMTP_USER && process.env.SMTP_PASS) {
    try {
      const transporter = nodemailer.createTransport({
        host: process.env.SMTP_HOST,
        port: parseInt(process.env.SMTP_PORT || '587'),
        secure: process.env.SMTP_SECURE === 'true',
        auth: {
          user: process.env.SMTP_USER,
          pass: process.env.SMTP_PASS,
        },
      });

      await transporter.sendMail({
        from: `"Nivara Automation" <${process.env.SMTP_USER}>`,
        to: adminEmail,
        subject,
        text,
      });
      console.log(`[Email Service] Real email notification sent to ${adminEmail} successfully.`);
    } catch (err) {
      console.error('[Email Service] Failed to send real email via SMTP:', err);
    }
  }
}

export async function sendPasswordResetOtp(email: string, otp: string) {
  const subject = `🔑 Nivara Password Reset Verification Code: ${otp}`;
  const text = `
Hello,

You requested a password reset for your Nivara account.

Your 6-digit verification code is:
${otp}

This code is valid for 15 minutes. If you did not request this, please ignore this email.

Regards,
Nivara Support Team
  `;

  console.log(`\n==================================================`);
  console.log(`[EMAIL SIMULATION]`);
  console.log(`TO: ${email}`);
  console.log(`SUBJECT: ${subject}`);
  console.log(`CONTENT:\n${text}`);
  console.log(`==================================================\n`);

  if (process.env.SMTP_HOST && process.env.SMTP_USER && process.env.SMTP_PASS) {
    try {
      const transporter = nodemailer.createTransport({
        host: process.env.SMTP_HOST,
        port: parseInt(process.env.SMTP_PORT || '587'),
        secure: process.env.SMTP_SECURE === 'true',
        auth: {
          user: process.env.SMTP_USER,
          pass: process.env.SMTP_PASS,
        },
      });

      await transporter.sendMail({
        from: `"Nivara Support" <${process.env.SMTP_USER}>`,
        to: email,
        subject,
        text,
      });
      console.log(`[Email Service] Real OTP reset email sent to ${email} successfully.`);
    } catch (err) {
      console.error('[Email Service] Failed to send real email via SMTP:', err);
    }
  }
}
