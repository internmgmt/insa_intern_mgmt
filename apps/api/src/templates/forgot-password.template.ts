export interface ForgotPasswordPayload {
  firstName: string;
  email: string;
  resetLink: string;
  expiresIn?: string;
}

export function forgotPasswordTemplate({
  firstName,
  email,
  resetLink,
  expiresIn = '1 hour',
}: ForgotPasswordPayload) {
  const subject = 'Password Reset Request — INSA Internship Management System';

  const html = `
    <div style="font-family: Arial, Helvetica, sans-serif; color: #111; line-height: 1.5;">
      <h2 style="color: #0b5cff; margin-bottom: 0.5rem;">Password Reset Request</h2>
      <p>Hello ${firstName},</p>
      <p>We received a request to reset your password. Click the button below to proceed:</p>
      <p style="margin: 24px 0;">
        <a href="${resetLink}" style="background: #0b5cff; color: white; padding: 12px 24px; text-decoration: none; border-radius: 4px; display: inline-block; font-weight: 600;">Reset Password</a>
      </p>
      <p style="color: #666; font-size: 0.9em; margin: 16px 0;">
        Or copy and paste this link in your browser:<br/>
        <code style="background: #f4f4f4; padding: 8px; border-radius: 4px; word-break: break-all;">${resetLink}</code>
      </p>
      <p style="color: #999; font-size: 0.85em; margin: 16px 0;">
        <strong>Important:</strong> This link expires in ${expiresIn}. If you did not request a password reset, please ignore this email or contact support if you have concerns about your account security.
      </p>
      <hr style="border: none; border-top: 1px solid #ddd; margin: 24px 0;" />
      <p style="color: #999; font-size: 0.85em;">
        INSA Internship Management System<br/>
        If you have questions, contact support at support@insa.gov.et
      </p>
    </div>
  `;

  const textLines = [
    `Password Reset Request`,
    ``,
    `Hello ${firstName},`,
    ``,
    `We received a request to reset your password. Click the link below to proceed:`,
    ``,
    `${resetLink}`,
    ``,
    `This link expires in ${expiresIn}.`,
    ``,
    `If you did not request a password reset, please ignore this email or contact support if you have concerns about your account security.`,
    ``,
    `Best regards,`,
    `INSA Team`,
  ];

  const text = textLines.join('\n');

  return { subject, html, text };
}
