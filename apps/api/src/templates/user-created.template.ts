export interface UserCreatedPayload {
  firstName: string;
  lastName: string;
  email: string;
  temporaryPassword: string;
  loginUrl: string;
  role: string;
}

export function userCreatedTemplate({
  firstName,
  lastName,
  email,
  temporaryPassword,
  loginUrl,
  role,
}: UserCreatedPayload) {
  const subject = 'Official Notification: INSA Account Activation';

  const html = `
    <div style="font-family: 'Segoe UI', Arial, sans-serif; color: #333; line-height: 1.6; max-width: 600px; margin: 0 auto; border: 1px solid #e0e0e0; border-radius: 8px; overflow: hidden;">
      <div style="background-color: #0b5cff; padding: 24px; text-align: center; color: white;">
        <h1 style="margin: 0; font-size: 20px; font-weight: 600; letter-spacing: 0.5px;">INSA Internship Management</h1>
        <p style="margin: 4px 0 0 0; font-size: 13px; opacity: 0.9; text-transform: uppercase; letter-spacing: 1px;">Information Network Security Administration</p>
      </div>
      
      <div style="padding: 32px; background-color: #ffffff;">
        <h2 style="color: #1a1a1a; margin-top: 0; font-size: 18px;">Account Activation Notice</h2>
        <p>Dear ${firstName} ${lastName},</p>
        <p>This is an automated notification to inform you that an official account has been provisioned for you within the <strong>INSA Internship Management System</strong>.</p>
        
        <div style="background-color: #f8fafc; border: 1px solid #e2e8f0; border-radius: 6px; padding: 24px; margin: 24px 0;">
          <table style="width: 100%; border-collapse: collapse;">
            <tr>
              <td style="padding-bottom: 8px; color: #64748b; font-size: 13px; text-transform: uppercase; font-weight: 600;">Authorized Email</td>
            </tr>
            <tr>
              <td style="padding-bottom: 20px; font-family: monospace; font-size: 16px; color: #0f172a; font-weight: bold;">${email}</td>
            </tr>
            <tr>
              <td style="padding-bottom: 8px; color: #64748b; font-size: 13px; text-transform: uppercase; font-weight: 600;">Assigned Role</td>
            </tr>
            <tr>
              <td style="padding-bottom: 20px; color: #0f172a; font-weight: bold;">${role}</td>
            </tr>
            <tr>
              <td style="padding-bottom: 8px; color: #64748b; font-size: 13px; text-transform: uppercase; font-weight: 600;">Temporary Security Key</td>
            </tr>
            <tr>
              <td>
                <code style="background-color: #f1f5f9; padding: 6px 12px; border-radius: 4px; font-family: 'Courier New', Courier, monospace; font-size: 18px; color: #0b5cff; border: 1px dashed #0b5cff;">${temporaryPassword}</code>
              </td>
            </tr>
          </table>
        </div>

        <p style="background-color: #fffbeb; border-left: 4px solid #f59e0b; padding: 12px 16px; color: #92400e; font-size: 14px; margin: 24px 0;">
          <strong>Security Requirement:</strong> You are required to change this temporary password immediately upon your first successful authentication.
        </p>

        <div style="text-align: center; margin-top: 32px;">
          <a href="${loginUrl}" style="background-color: #0b5cff; color: #ffffff; padding: 14px 28px; text-decoration: none; border-radius: 6px; display: inline-block; font-weight: bold; font-size: 15px; box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);">Access Portal Platform</a>
        </div>
      </div>

      <div style="background-color: #f1f5f9; padding: 24px; border-top: 1px solid #e2e8f0; text-align: center; font-size: 12px; color: #64748b;">
        <p style="margin: 0 0 8px 0; font-weight: bold; color: #475569;">Information Network Security Administration (INSA)</p>
        <p style="margin: 0;">Addis Ababa, Ethiopia</p>
        <p style="margin: 12px 0 0 0;">This is a system-generated message. Please do not reply directly to this email.</p>
        <p style="margin: 4px 0 0 0;">Technical issues: <a href="mailto:support@insa.gov.et" style="color: #0b5cff; text-decoration: none;">support@insa.gov.et</a></p>
      </div>
    </div>
  `;

  const textLines = [
    `Welcome to INSA Internship Management System`,
    ``,
    `Hello ${firstName} ${lastName},`,
    ``,
    `Your account has been created successfully in the INSA Internship Management System.`,
    ``,
    `Account Details:`,
    `Email: ${email}`,
    `Role: ${role}`,
    `Temporary Password: ${temporaryPassword}`,
    ``,
    `IMPORTANT: You must change your password on your first login. Never share this temporary password with anyone.`,
    ``,
    `Getting Started:`,
    `1. Sign in using the link below`,
    `2. Enter your email and temporary password`,
    `3. You will be prompted to change your password`,
    `4. Create a strong password (minimum 8 characters with uppercase, number, and special character)`,
    `5. After password change, you can access all features`,
    ``,
    `Sign in: ${loginUrl}`,
    ``,
    `Password Requirements:`,
    `• Minimum 8 characters`,
    `• At least 1 uppercase letter (A-Z)`,
    `• At least 1 lowercase letter (a-z)`,
    `• At least 1 number (0-9)`,
    `• At least 1 special character (@$!%*?&)`,
    ``,
    `Best regards,`,
    `INSA Team`,
  ];

  const text = textLines.join('\n');

  return { subject, html, text };
}
