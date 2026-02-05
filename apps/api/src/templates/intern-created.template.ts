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
  const subject = 'Official Internship Assignment: INSA Program Account';

  const html = `
    <div style="font-family: 'Segoe UI', Arial, sans-serif; color: #333; line-height: 1.6; max-width: 600px; margin: 0 auto; border: 1px solid #e0e0e0; border-radius: 8px; overflow: hidden;">
      <div style="background-color: #0b5cff; padding: 24px; text-align: center; color: white;">
        <h1 style="margin: 0; font-size: 20px; font-weight: 600; letter-spacing: 0.5px;">INSA Internship Management</h1>
        <p style="margin: 4px 0 0 0; font-size: 13px; opacity: 0.9; text-transform: uppercase; letter-spacing: 1px;">Information Network Security Administration</p>
      </div>
      
      <div style="padding: 32px; background-color: #ffffff;">
        <h2 style="color: #1a1a1a; margin-top: 0; font-size: 18px;">Internship Activation Successful</h2>
        <p>Dear ${firstName} ${lastName},</p>
        <p>Congratulations. Your application has been fully processed, and you have been activated as an official intern at the <strong>Information Network Security Administration (INSA)</strong>.</p>
        
        <div style="background-color: #f8fafc; border: 1px solid #e2e8f0; border-radius: 6px; padding: 24px; margin: 24px 0;">
          <table style="width: 100%; border-collapse: collapse; font-size: 14px;">
            <tr style="border-bottom: 1px solid #edf2f7;">
              <td style="padding: 10px 0; color: #64748b; font-weight: 600; width: 140px;">Professional Email</td>
              <td style="padding: 10px 0; color: #0f172a; font-family: monospace;">${email}</td>
            </tr>
            ${internId ? `
            <tr style="border-bottom: 1px solid #edf2f7;">
              <td style="padding: 10px 0; color: #64748b; font-weight: 600;">Intern Registry ID</td>
              <td style="padding: 10px 0; color: #0f172a; font-weight: bold;">${internId}</td>
            </tr>` : ''}
            ${temporaryPassword ? `
            <tr style="border-bottom: 1px solid #edf2f7;">
              <td style="padding: 10px 0; color: #64748b; font-weight: 600;">Access Key</td>
              <td style="padding: 10px 0;">
                <code style="background-color: #f1f5f9; padding: 4px 8px; border-radius: 4px; font-family: 'Courier New', Courier, monospace; color: #0b5cff; border: 1px dashed #0b5cff;">${temporaryPassword}</code>
              </td>
            </tr>` : ''}
            ${startDate ? `
            <tr style="border-bottom: 1px solid #edf2f7;">
              <td style="padding: 10px 0; color: #64748b; font-weight: 600;">Effective Date</td>
              <td style="padding: 10px 0; color: #0f172a;">${startDate}</td>
            </tr>` : ''}
            ${supervisorName ? `
            <tr>
              <td style="padding: 10px 0; color: #64748b; font-weight: 600;">Assigned Supervisor</td>
              <td style="padding: 10px 0; color: #0f172a;">${supervisorName}</td>
            </tr>` : ''}
          </table>
        </div>

        <p style="font-size: 14px;">Please complete your final registration by signing in to the portal and updating your profile information.</p>

        <div style="text-align: center; margin-top: 32px;">
          <a href="${loginUrl}" style="background-color: #0b5cff; color: #ffffff; padding: 14px 28px; text-decoration: none; border-radius: 6px; display: inline-block; font-weight: bold; font-size: 15px; box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);">Enter Management Portal</a>
        </div>
      </div>

      <div style="background-color: #f1f5f9; padding: 24px; border-top: 1px solid #e2e8f0; text-align: center; font-size: 12px; color: #64748b;">
        <p style="margin: 0 0 8px 0; font-weight: bold; color: #475569;">Information Network Security Administration (INSA)</p>
        <p style="margin: 0;">Addis Ababa, Ethiopia</p>
        <p style="margin: 12px 0 0 0;">This communication is confidential and intended solely for the recipient.</p>
        <p style="margin: 4px 0 0 0;">Inquiry: <a href="mailto:support@insa.gov.et" style="color: #0b5cff; text-decoration: none;">support@insa.gov.et</a></p>
      </div>
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
