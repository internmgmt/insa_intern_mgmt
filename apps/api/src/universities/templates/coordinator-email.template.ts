export interface CoordinatorCredentialsPayload {
  firstName: string;
  lastName: string;
  email: string;
  temporaryPassword: string;
  loginUrl?: string;
}

export function coordinatorCredentialsTemplate({
  firstName,
  lastName,
  email,
  temporaryPassword,
  loginUrl = 'http://localhost:3000/login',
}: CoordinatorCredentialsPayload) {
  const subject = 'INSA Coordinator Account Created';

  const html = `
    <div style="font-family: Arial, Helvetica, sans-serif; color: #111; line-height:1.5;">
      <h2 style="color:#0b5cff;margin-bottom:0.5rem;">Welcome to INSA Intern Management</h2>
      <p>Dear ${firstName} ${lastName},</p>
      <p>Your coordinator account has been created for the INSA Intern Management System.</p>
      <table cellpadding="6" cellspacing="0" style="margin:12px 0;border-collapse:collapse;">
        <tr>
          <td style="font-weight:600;">Email:</td>
          <td>${email}</td>
        </tr>
        <tr>
          <td style="font-weight:600;">Temporary Password:</td>
          <td style="font-family: monospace; background:#f4f4f4; padding:4px 8px; border-radius:4px;">${temporaryPassword}</td>
        </tr>
      </table>
      <p>Please use the link below to sign in and change your password immediately:</p>
      <p><a href="${loginUrl}" style="color:#0b5cff;">Sign in to INSA</a></p>
      <p>If you did not expect this email, please contact the INSA support team.</p>
      <p style="margin-top:1rem;">Best regards,<br/>INSA Team</p>
    </div>
  `;

  const text = `Welcome to INSA Intern Management

Dear ${firstName} ${lastName},

Your coordinator account has been created for the INSA Intern Management System.

Email: ${email}
Temporary Password: ${temporaryPassword}

Sign in: ${loginUrl}

Please change your password after signing in.

Best regards,
INSA Team
`;

  return { subject, html, text };
}
