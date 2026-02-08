export interface ResetPasswordConfirmationPayload {
  firstName: string;
  email: string;
  changedAt?: Date;
}

export function resetPasswordConfirmationTemplate({
  firstName,
  email,
  changedAt,
}: ResetPasswordConfirmationPayload) {
  const subject =
    'Password Changed Successfully — INSA Internship Management System';
  const changeTime = changedAt
    ? new Date(changedAt).toLocaleString()
    : new Date().toLocaleString();

  const html = `
    <div style="font-family: Arial, Helvetica, sans-serif; color: #111; line-height: 1.5;">
      <h2 style="color: #0b5cff; margin-bottom: 0.5rem;">Password Changed Successfully</h2>
      <p>Hello ${firstName},</p>
      <p>Your password has been successfully reset for your INSA Internship Management System account.</p>
      <div style="background: #f0f8ff; border-left: 4px solid #0b5cff; padding: 16px; margin: 16px 0;">
        <p style="margin: 0;"><strong>Account Email:</strong> ${email}</p>
        <p style="margin: 8px 0;"><strong>Changed At:</strong> ${changeTime}</p>
      </div>
      <p style="color: #d9534f; font-weight: 600; margin: 16px 0;">
        Security Notice: If you did not make this change, your account may be compromised. Please contact support immediately at support@insa.gov.et.
      </p>
      <p style="margin: 16px 0;">
        You can now log in with your new password at:<br/>
        <a href="http://localhost:3000/login" style="color: #0b5cff; text-decoration: none;">INSA Login Portal</a>
      </p>
      <hr style="border: none; border-top: 1px solid #ddd; margin: 24px 0;" />
      <p style="color: #999; font-size: 0.85em;">
        INSA Internship Management System<br/>
        If you have questions, contact support at support@insa.gov.et
      </p>
    </div>
  `;

  const textLines = [
    `Password Changed Successfully`,
    ``,
    `Hello ${firstName},`,
    ``,
    `Your password has been successfully reset for your INSA Internship Management System account.`,
    ``,
    `Account Email: ${email}`,
    `Changed At: ${changeTime}`,
    ``,
    `SECURITY NOTICE: If you did not make this change, your account may be compromised. Please contact support immediately at support@insa.gov.et.`,
    ``,
    `You can now log in with your new password.`,
    ``,
    `Best regards,`,
    `INSA Team`,
  ];

  const text = textLines.join('\n');

  return { subject, html, text };
}
