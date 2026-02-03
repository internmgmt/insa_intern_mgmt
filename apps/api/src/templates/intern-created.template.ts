export interface InternCreatedPayload {
  firstName: string;
  lastName: string;
  email: string;
  internId?: string;
  temporaryPassword?: string;
  loginUrl?: string;
  startDate?: string;
  supervisorName?: string;
}

export function internCreatedTemplate({
  firstName,
  lastName,
  email,
  internId,
  temporaryPassword,
  loginUrl = 'http://localhost:3000/login',
  startDate,
  supervisorName,
}: InternCreatedPayload) {
  const subject = 'INSA Internship — Your Intern Account Details';

  const html = `
    <div style="font-family: Arial, Helvetica, sans-serif; color: #111; line-height:1.5;">
      <h2 style="color:#0b5cff; margin-bottom:0.5rem;">Welcome to INSA Internship Program</h2>
      <p>Dear ${firstName} ${lastName},</p>
      <p>Your intern account has been created in the INSA Internship Management System. Use the credentials below to sign in and complete any pending steps.</p>
      <table cellpadding="6" cellspacing="0" style="margin:12px 0; border-collapse:collapse;">
        <tr>
          <td style="font-weight:600;">Email:</td>
          <td>${email}</td>
        </tr>
        ${internId ? `<tr><td style="font-weight:600;">Intern ID:</td><td>${internId}</td></tr>` : ''}
        ${temporaryPassword ? `<tr><td style="font-weight:600;">Temporary Password:</td><td style="font-family: monospace; background:#f4f4f4; padding:4px 8px; border-radius:4px;">${temporaryPassword}</td></tr>` : ''}
        ${startDate ? `<tr><td style="font-weight:600;">Start Date:</td><td>${startDate}</td></tr>` : ''}
        ${supervisorName ? `<tr><td style="font-weight:600;">Supervisor:</td><td>${supervisorName}</td></tr>` : ''}
      </table>
      <p>Please sign in using the link below and change your password immediately:</p>
      <p><a href="${loginUrl}" style="color:#0b5cff;">Sign in to INSA</a></p>
      <p>If you did not expect this email or need assistance, contact your university coordinator or supervisor.</p>
      <p style="margin-top:1rem;">Best regards,<br/>INSA Team</p>
    </div>
  `;

  const textLines = [
    `Hello ${firstName} ${lastName},`,
    '',
    'Your intern account has been created in the INSA Internship Management System.',
    `Email: ${email}`,
    internId ? `Intern ID: ${internId}` : '',
    temporaryPassword ? `Temporary Password: ${temporaryPassword}` : '',
    startDate ? `Start Date: ${startDate}` : '',
    supervisorName ? `Supervisor: ${supervisorName}` : '',
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
