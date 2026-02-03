export interface StudentAcceptedPayload {
  firstName: string;
  lastName: string;
  email: string;
  internId?: string;
  temporaryPassword?: string;
  loginUrl?: string;
  startDate?: string;
}

export function studentAcceptedTemplate({
  firstName,
  lastName,
  email,
  internId,
  temporaryPassword,
  loginUrl = 'http://localhost:3000/login',
  startDate,
}: StudentAcceptedPayload) {
  const subject = 'INSA Internship: Your Account & Next Steps';

  const html = `
    <div style="font-family: Arial, Helvetica, sans-serif; color: #111; line-height:1.5;">
      <h2 style="color:#0b5cff; margin-bottom:0.5rem;">Congratulations and Welcome to INSA</h2>
      <p>Dear ${firstName} ${lastName},</p>
      <p>Your internship application has been accepted. We have created an account for you to access the INSA Internship Management System.</p>
      <table cellpadding="6" cellspacing="0" style="margin:12px 0; border-collapse:collapse;">
        <tr>
          <td style="font-weight:600;">Email:</td>
          <td>${email}</td>
        </tr>
        ${internId ? `<tr><td style="font-weight:600;">Intern ID:</td><td>${internId}</td></tr>` : ''}
        ${temporaryPassword ? `<tr><td style="font-weight:600;">Temporary Password:</td><td style="font-family: monospace; background:#f4f4f4; padding:4px 8px; border-radius:4px;">${temporaryPassword}</td></tr>` : ''}
        ${startDate ? `<tr><td style="font-weight:600;">Start Date:</td><td>${startDate}</td></tr>` : ''}
      </table>
      <p>Please sign in using the link below and change your password immediately:</p>
      <p><a href="${loginUrl}" style="color:#0b5cff;">Sign in to INSA</a></p>
      <p>If you have any questions, contact your university coordinator or the INSA support team.</p>
      <p style="margin-top:1rem;">Best regards,<br/>INSA Team</p>
    </div>
  `;

  const textLines = [
    `Congratulations ${firstName} ${lastName},`,
    '',
    'Your internship application has been accepted. An account has been created for you to access the INSA Internship Management System.',
    `Email: ${email}`,
    internId ? `Intern ID: ${internId}` : '',
    temporaryPassword ? `Temporary Password: ${temporaryPassword}` : '',
    startDate ? `Start Date: ${startDate}` : '',
    '',
    `Sign in: ${loginUrl}`,
    '',
    'Please change your password after signing in.',
    '',
    'Best regards,',
    'INSA Team',
  ].filter(Boolean);

  const text = textLines.join('\n');

  return { subject, html, text };
}
