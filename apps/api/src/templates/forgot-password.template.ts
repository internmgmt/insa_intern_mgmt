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
  const subject = 'Official Request: Account Credential Recovery';

  const html = `
    <div style="font-family: 'Segoe UI', Arial, sans-serif; color: #333; line-height: 1.6; max-width: 600px; margin: 0 auto; border: 1px solid #e0e0e0; border-radius: 8px; overflow: hidden;">
      <div style="background-color: #0b5cff; padding: 24px; text-align: center; color: white;">
        <h1 style="margin: 0; font-size: 20px; font-weight: 600; letter-spacing: 0.5px;">INSA Internship Management</h1>
        <p style="margin: 4px 0 0 0; font-size: 13px; opacity: 0.9; text-transform: uppercase; letter-spacing: 1px;">Information Network Security Administration</p>
      </div>
      
      <div style="padding: 32px; background-color: #ffffff;">
        <h2 style="color: #1a1a1a; margin-top: 0; font-size: 18px;">Security Verification</h2>
        <p>Dear ${firstName},</p>
        <p>A request has been initiated to recover the access credentials for the account associated with <strong>${email}</strong> in the INSA management system.</p>
        
        <p>To authorize this recovery and set a new password, please use the secure link below:</p>

        <div style="text-align: center; margin: 32px 0;">
          <a href="${resetLink}" style="background-color: #0b5cff; color: #ffffff; padding: 14px 28px; text-decoration: none; border-radius: 6px; display: inline-block; font-weight: bold; font-size: 15px; box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);">Authorize Password Recovery</a>
        </div>

        <div style="background-color: #f8fafc; border: 1px solid #e2e8f0; border-radius: 6px; padding: 16px; margin: 24px 0; font-size: 13px; color: #64748b;">
          <strong>Validity Notice:</strong> This authorization link is temporary and will automatically expire in <strong>${expiresIn}</strong>. If the period expires before use, a new request must be generated.
        </div>

        <p style="font-size: 13px; color: #94a3b8; margin-top: 24px;">
          If you did not initiate this recovery request, please disregard this automated notification. Your current credentials remain secure.
        </p>
      </div>

      <div style="background-color: #f1f5f9; padding: 24px; border-top: 1px solid #e2e8f0; text-align: center; font-size: 12px; color: #64748b;">
        <p style="margin: 0 0 8px 0; font-weight: bold; color: #475569;">Information Network Security Administration (INSA)</p>
        <p style="margin: 0;">Addis Ababa, Ethiopia</p>
        <p style="margin: 12px 0 0 0;">CONFIDENTIAL SECURITY NOTICE</p>
      </div>
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
