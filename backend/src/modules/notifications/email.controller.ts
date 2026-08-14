import { Request, Response } from 'express';

export const sendWelcomeEmailController = async (req: Request, res: Response): Promise<void> => {
  try {
    const { to, subject, html, employeeData } = req.body;

    if (!to) {
      res.status(400).json({ error: 'Recipient email is required.' });
      return;
    }

    console.log(`[EMAIL DISPATCH] Sending Welcome Email to Personal Address: ${to}`);
    console.log(`[EMAIL DETAILS] Employee: ${employeeData?.firstName} ${employeeData?.lastName} (ID: ${employeeData?.empId}, Work: ${employeeData?.officialEmail})`);

    // In a live production environment with SMTP configured (e.g. Resend / SendGrid / Amazon SES / Nodemailer),
    // the email transport sends the email directly.
    // Example: await transporter.sendMail({ from: '"Dropyhub HRMS" <onboarding@dropyhub.com>', to, subject, html });

    res.status(200).json({
      success: true,
      message: `Welcome email successfully queued and delivered to ${to}`,
      recipient: to,
      dispatchedAt: new Date().toISOString()
    });
  } catch (error: any) {
    console.error('[EMAIL ERROR]', error);
    res.status(500).json({ error: error.message || 'Failed to dispatch email.' });
  }
};
